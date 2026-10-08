const db = require('../config/db');
const crypto = require('crypto');
const notificationController = require('./notification.controller');
const {
  analyzeFoodImage,
  suggestPlanForMeal,
  safeParseAI,
  stripDataUriPrefix,
} = require('../config/gemini');
const { sendMealSummaryEmail } = require('../config/mailer');
const { AppError } = require('../utils/errors');

const analysisCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

setInterval(
  () => {
    const now = Date.now();
    for (const [k, v] of analysisCache) {
      if (now - v.ts > CACHE_TTL_MS) analysisCache.delete(k);
    }
    if (analysisCache.size > MAX_CACHE_ENTRIES) {
      const excess = analysisCache.size - MAX_CACHE_ENTRIES;
      const keys = [...analysisCache.keys()].slice(0, excess);
      for (const k of keys) analysisCache.delete(k);
    }
  },
  5 * 60 * 1000
).unref?.();

function imageHash(base64Image) {
  return crypto.createHash('sha256').update(stripDataUriPrefix(base64Image)).digest('hex');
}

function getCached(base64Image) {
  const key = imageHash(base64Image);
  const entry = analysisCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    analysisCache.delete(key);
    return null;
  }
  return entry.result;
}

function setCache(base64Image, result) {
  if (analysisCache.size >= 200) {
    let oldestKey = null;
    let oldestTs = Infinity;
    for (const [k, v] of analysisCache) {
      if (v.ts < oldestTs) {
        oldestTs = v.ts;
        oldestKey = k;
      }
    }
    if (oldestKey) analysisCache.delete(oldestKey);
  }
  analysisCache.set(imageHash(base64Image), { result, ts: Date.now() });
}

// In-flight dedupe: two concurrent scans of the same photo (double-tap,
// retry, React StrictMode) share ONE AI call instead of burning quota twice.
// Entries are deleted on settle, so failures never stick.
const inflightAnalyses = new Map();

// POST /api/food-logs/analyze-pic

async function analyzeAndClamp(base64Image) {
  // analyzeFoodImage returns a JSON string (never throws for provider
  // failures — it falls back to Unknown food; throws only on timeout/bug).
  const raw = await analyzeFoodImage(base64Image);

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Shouldn't happen since gemini.js always returns valid JSON, but just in case
    const match = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()
      .match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse AI response as JSON');
    parsed = JSON.parse(match[0]);
  }

  // Final safety clamp — per item (supports legacy single-object shape)
  const clampItem = (it = {}) => ({
    food_name: String(it.food_name || 'Unknown food').slice(0, 150),
    serving: String(it.serving || '').slice(0, 100),
    calories: Math.max(0, Math.round(Number(it.calories) || 0)),
    protein: Math.max(0, Math.round(Number(it.protein) || 0)),
    carbs: Math.max(0, Math.round(Number(it.carbs) || 0)),
    fat: Math.max(0, Math.round(Number(it.fat) || 0)),
    saturated_fat: Math.max(0, Math.round(Number(it.saturated_fat || 0) * 10) / 10),
    trans_fat: Math.max(0, Math.round(Number(it.trans_fat || 0) * 10) / 10),
    polyunsaturated_fat: Math.max(0, Math.round(Number(it.polyunsaturated_fat || 0) * 10) / 10),
    monounsaturated_fat: Math.max(0, Math.round(Number(it.monounsaturated_fat || 0) * 10) / 10),
    ...(it.low_confidence ? { low_confidence: true } : {}),
  });
  if (Array.isArray(parsed.items)) {
    parsed.items = parsed.items.filter(Boolean).slice(0, 8).map(clampItem);
    if (typeof parsed.suggestion === 'string') parsed.suggestion = parsed.suggestion.slice(0, 200);
  } else {
    // Legacy single-object shape → normalize to the items envelope
    const suggestion = typeof parsed.suggestion === 'string' ? parsed.suggestion : '';
    parsed = { items: [clampItem(parsed)], suggestion };
  }
  // Preserve the retryable flag from the overload fallback (top-level survives
  // because only parsed.items is rebuilt above).
  return parsed;
}

async function postanalyzePic(req, res, next) {
  try {
    const { base64Image } = req.body;
    if (!base64Image) return res.status(400).json({ error: 'No image provided' });
    if (String(base64Image).length > 7_000_000)
      return res.status(413).json({ error: 'Image too large (max ~5MB)' });

    // Cache hit return immediately, no AI call
    const cached = getCached(base64Image);
    if (cached) {
      if (process.env.NODE_ENV !== 'production')
        console.log('[analyze-pic] ✅ Cache hit — returning stored result');
      return res.json(cached);
    }

    // Shared in-flight call for the same photo (see inflightAnalyses above).
    const key = imageHash(base64Image);
    let shared = inflightAnalyses.get(key);
    if (!shared) {
      shared = analyzeAndClamp(base64Image).finally(() => {
        if (inflightAnalyses.get(key) === shared) inflightAnalyses.delete(key);
      });
      inflightAnalyses.set(key, shared);
    } else if (process.env.NODE_ENV !== 'production') {
      console.log('[analyze-pic] ↻ Joining in-flight analysis for same image');
    }

    try {
      const parsed = await shared;

      const onlyUnknown =
        Array.isArray(parsed.items) &&
        parsed.items.length === 1 &&
        parsed.items[0].food_name === 'Unknown food' &&
        Number(parsed.items[0].calories) === 0;
      if (!onlyUnknown) setCache(base64Image, parsed);

      res.json(parsed);
    } catch (err) {
      console.error('[analyze-pic] ERROR:', err.message);
      next(
        new AppError('AI failed to analyze the image. Please try again.', 500, 'AI_ANALYZE_FAILED')
      );
    }
  } catch (e) {
    next(e);
  }
}

async function postUserIdSuggestPlan(req, res, next) {
  try {
    const { userId } = req.params;
    const { food_name, calories, protein, carbs, fat, caloriesSoFar: clientSoFar } = req.body;

    if (!food_name) return res.status(400).json({ error: 'food_name is required' });
    // Day-basis fix: the UI totals "today" in browser-local time while SQL
    // CURDATE() is server-local. The client already holds its own day total
    // (same source as the tracker's rings), so prefer it when valid and
    // only fall back to the server-day sum otherwise.
    const clientValid =
      clientSoFar !== undefined &&
      clientSoFar !== null &&
      clientSoFar !== '' &&
      Number.isFinite(Number(clientSoFar)) &&
      Number(clientSoFar) >= 0 &&
      Number(clientSoFar) <= 100000;

    try {
      const [[{ caloriesSoFar }], [plans], [gRows]] = await Promise.all([
        clientValid
          ? Promise.resolve([[{ caloriesSoFar: Math.round(Number(clientSoFar)) }]])
          : db
              .execute(
                `SELECT COALESCE(SUM(calories), 0) AS caloriesSoFar
               FROM food_logs WHERE user_id = ? AND logged_at >= CURDATE() AND logged_at < CURDATE() + INTERVAL 1 DAY`,
                [userId]
              )
              .then(([r]) => r),
        db
          .execute(
            `SELECT p.*, IF(up.user_id IS NULL, 0, 1) AS is_enrolled
             FROM plans p
             LEFT JOIN user_plans up ON p.id = up.plan_id AND up.user_id = ?
             ORDER BY p.id ASC`,
            [userId]
          )
          .then(([r]) => r),
        db
          .execute(
            'SELECT daily_kcal FROM fitness_goals WHERE user_id = ? AND status = ? ORDER BY id DESC LIMIT 1',
            [userId, 'active']
          )
          .then(([r]) => r)
          .catch(() => []),
      ]);

      const meal = {
        food_name,
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
      };
      const calorieGoal = gRows[0]?.daily_kcal ? Number(gRows[0].daily_kcal) : 2000;
      const dailyContext = { caloriesSoFar: Math.round(Number(caloriesSoFar) || 0), calorieGoal };

      const raw = await suggestPlanForMeal(meal, plans, dailyContext);
      const { parsed: aiResult, raw: rawText } = safeParseAI(raw);
      if (!aiResult?.message) {
        return res.status(200).json({
          food_name: meal.food_name,
          calories: meal.calories,
          message: String(rawText).slice(0, 600),
          reasoning: 'AI returned plain text.',
          estimated_minutes: null,
          recommended_plan: plans.find((p) => p.is_enrolled === 1) || plans[0] || null,
          recommended_source: null,
          has_enrolled_plans: plans.some((p) => p.is_enrolled === 1),
          has_any_plans: plans.length > 0,
        });
      }

      const recommendedPlan =
        plans.find((p) => String(p.id) === String(aiResult.recommended_plan_id)) || null;
      const recommendedSource = recommendedPlan
        ? recommendedPlan.is_enrolled === 1
          ? 'enrolled'
          : 'marketplace'
        : null;

      res.json({
        food_name: meal.food_name,
        calories: meal.calories,
        message: aiResult.message,
        reasoning: aiResult.reasoning,
        estimated_minutes: (() => {
          const n = Math.round(Number(aiResult.estimated_minutes));
          return Number.isFinite(n) && n >= 5 && n <= 300 ? n : null;
        })(),
        recommended_plan: recommendedPlan,
        recommended_source: recommendedSource,
        has_enrolled_plans: plans.some((p) => p.is_enrolled === 1),
        has_any_plans: plans.length > 0,
      });
    } catch (err) {
      console.error('[suggest-plan] ERROR:', err.message);
      next(new AppError('AI coach could not generate a suggestion', 500, 'AI_SUGGEST_FAILED'));
    }
  } catch (e) {
    next(e);
  }
}

async function postUserId(req, res, next) {
  try {
    const { userId } = req.params;
    const {
      food_name,
      serving,
      calories,
      protein,
      carbs,
      fat,
      saturated_fat,
      trans_fat,
      polyunsaturated_fat,
      monounsaturated_fat,
      image_url,
    } = req.body;

    if (!food_name || (typeof food_name === 'string' && !food_name.trim())) {
      return res.status(400).json({ error: 'food_name is required' });
    }
    const foodNameNorm = String(food_name).trim().slice(0, 150);
    if (foodNameNorm.length < 1) {
      return res.status(400).json({ error: 'food_name is required' });
    }
    if (typeof image_url === 'string' && image_url.length > 2000) {
      return res.status(400).json({ error: 'image_url too long (max 2000 chars)' });
    }
    const servingNorm = typeof serving === 'string' ? serving.trim().slice(0, 100) || null : null;
    for (const [k, v] of [
      ['calories', calories],
      ['protein', protein],
      ['carbs', carbs],
      ['fat', fat],
      ['saturated_fat', saturated_fat],
      ['trans_fat', trans_fat],
      ['polyunsaturated_fat', polyunsaturated_fat],
      ['monounsaturated_fat', monounsaturated_fat],
    ]) {
      if (
        v !== undefined &&
        v !== null &&
        v !== '' &&
        (!Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > 100000)
      ) {
        return res.status(400).json({ error: `${k} must be a number 0–100000` });
      }
    }

    const sFat =
      saturated_fat != null && saturated_fat !== ''
        ? Math.round(Number(saturated_fat) * 10) / 10
        : 0;
    const tFat =
      trans_fat != null && trans_fat !== '' ? Math.round(Number(trans_fat) * 10) / 10 : 0;
    const pFat =
      polyunsaturated_fat != null && polyunsaturated_fat !== ''
        ? Math.round(Number(polyunsaturated_fat) * 10) / 10
        : 0;
    const mFat =
      monounsaturated_fat != null && monounsaturated_fat !== ''
        ? Math.round(Number(monounsaturated_fat) * 10) / 10
        : 0;

    let insertId;
    // Try full schema first (with fat breakdown)
    try {
      const [result] = await db.execute(
        `INSERT INTO food_logs (user_id, food_name, serving, calories, protein, carbs, fat, saturated_fat, trans_fat, polyunsaturated_fat, monounsaturated_fat, image_url, logged_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          foodNameNorm,
          servingNorm,
          calories || 0,
          protein || 0,
          carbs || 0,
          fat || 0,
          sFat,
          tFat,
          pFat,
          mFat,
          image_url || null,
        ]
      );
      insertId = result.insertId;
    } catch (colErr) {
      if (colErr.code !== 'ER_BAD_FIELD_ERROR') throw colErr;
      // Fallback: try without fat breakdown columns
      try {
        const [result] = await db.execute(
          `INSERT INTO food_logs (user_id, food_name, serving, calories, protein, carbs, fat, image_url, logged_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            userId,
            foodNameNorm,
            servingNorm,
            calories || 0,
            protein || 0,
            carbs || 0,
            fat || 0,
            image_url || null,
          ]
        );
        insertId = result.insertId;
      } catch (e2) {
        if (e2.code !== 'ER_BAD_FIELD_ERROR') throw e2;
        // Fallback: minimal schema (no serving, no fat breakdown)
        try {
          const [result] = await db.execute(
            `INSERT INTO food_logs (user_id, food_name, calories, protein, carbs, fat, image_url, logged_at)
               VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
              userId,
              foodNameNorm,
              calories || 0,
              protein || 0,
              carbs || 0,
              fat || 0,
              image_url || null,
            ]
          );
          insertId = result.insertId;
        } catch (e3) {
          if (e3.code !== 'ER_BAD_FIELD_ERROR') throw e3;
          throw new AppError(
            'Database schema mismatch — cannot insert food log',
            500,
            'SCHEMA_MISMATCH'
          );
        }
      }
    }

    const [[user]] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
    const [[summary]] = await db.execute(
      `SELECT
             COALESCE(SUM(calories), 0) AS calories,
             COALESCE(SUM(protein),  0) AS protein,
             COALESCE(SUM(carbs),    0) AS carbs,
             COALESCE(SUM(fat),      0) AS fat,
             COALESCE(SUM(saturated_fat), 0) AS saturated_fat,
             COALESCE(SUM(trans_fat), 0) AS trans_fat,
             COALESCE(SUM(polyunsaturated_fat), 0) AS polyunsaturated_fat,
             COALESCE(SUM(monounsaturated_fat), 0) AS monounsaturated_fat
           FROM food_logs
           WHERE user_id = ? AND logged_at >= CURDATE() AND logged_at < CURDATE() + INTERVAL 1 DAY`,
      [userId]
    );

    if (user?.email) {
      // Non-blocking: never hold the response for SMTP
      setImmediate(async () => {
        try {
          await sendMealSummaryEmail(user.email, summary);
        } catch (err) {
          console.error('❌ MAILER FAILED:', err.message);
        }
      });
    }

    try {
      const msg = `Meal logged! Today: ${Math.round(summary.calories)} kcal | P: ${Math.round(summary.protein)}g | C: ${Math.round(summary.carbs)}g | F: ${Math.round(summary.fat)}g | Sat:${Number(summary.saturated_fat || 0).toFixed(1)}g Trans:${Number(summary.trans_fat || 0).toFixed(1)}g`;
      await db.execute('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [userId, msg]);
      notificationController.broadcast(String(userId), { message: msg, type: 'success' });
    } catch (err) {
      console.error('❌ NOTIFICATION FAILED:', err.message);
    }

    res.status(200).json({ message: 'Food log saved', id: insertId });
  } catch (e) {
    next(e);
  }
}

async function getUserId(req, res, next) {
  try {
    const { userId } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 200, 1), 200);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    try {
      let rows;
      // NOTE: db.query (not execute) — mysql2 server-side prepares reject
      // placeholders in LIMIT/OFFSET on some MySQL versions.
      try {
        [rows] = await db.query(
          `SELECT id, food_name, serving, calories, protein, carbs, fat, saturated_fat, trans_fat, polyunsaturated_fat, monounsaturated_fat, image_url,
                    DATE_FORMAT(logged_at, '%Y-%m-%d %H:%i') AS logged_at
             FROM food_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT ? OFFSET ?`,
          [userId, limit, offset]
        );
      } catch (colErr) {
        if (colErr.code !== 'ER_BAD_FIELD_ERROR') throw colErr;
        try {
          [rows] = await db.query(
            `SELECT id, food_name, serving, calories, protein, carbs, fat, image_url,
                      DATE_FORMAT(logged_at, '%Y-%m-%d %H:%i') AS logged_at
               FROM food_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT ? OFFSET ?`,
            [userId, limit, offset]
          );
        } catch (e2) {
          if (e2.code !== 'ER_BAD_FIELD_ERROR') throw e2;
          [rows] = await db.query(
            `SELECT id, food_name, calories, protein, carbs, fat, image_url,
                      DATE_FORMAT(logged_at, '%Y-%m-%d %H:%i') AS logged_at
               FROM food_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT ? OFFSET ?`,
            [userId, limit, offset]
          );
        }
      }
      const [[countRow]] = await db.execute(
        'SELECT COUNT(*) AS total FROM food_logs WHERE user_id = ?',
        [userId]
      );
      res.json({ records: rows, total: countRow?.total ?? 0 });
    } catch (err) {
      console.error('[food-log GET] ERROR:', err.message);
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

async function deleteUserIdMealId(req, res, next) {
  try {
    const { userId, mealId } = req.params;

    try {
      const [result] = await db.execute('DELETE FROM food_logs WHERE id = ? AND user_id = ?', [
        mealId,
        userId,
      ]);
      if (result.affectedRows === 0)
        return res.status(404).json({ error: 'Meal not found or already deleted' });

      res.json({ success: true, message: 'Meal deleted' });
    } catch (err) {
      console.error('[food-log DELETE] ERROR:', err.message);
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

module.exports = {
  postanalyzePic,
  postUserIdSuggestPlan,
  postUserId,
  getUserId,
  deleteUserIdMealId,
  imageHash,
};
