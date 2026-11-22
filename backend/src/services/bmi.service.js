// BMI — business logic + DB access.
// (BMI calculation, profile sync, AI suggestion, record listing.)
const db = require('../config/db');
const tasks = require('../utils/taskNotifications');
const { callGeminiWithFallback } = require('../config/gemini');
// Single BMI category source — matches planEngine (Onboarding) and the master plan.
const { bmiCategory: getBmiCategory } = require('../utils/planEngine');
const { classifyBmi } = require('../utils/health');

// BMI from metric weight (kg) / height (cm). Pure — used by the controller for
// its finite-value guard before the (unreachable) insert path.
function computeBmi(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}

// Save BMI, keep user_profiles in sync, and return the AI suggestion.
async function saveBmi(userId, { weight, height, bmi, age, gender }) {
  const category = getBmiCategory(bmi);

  // Previous reading, for the "+/- kg since last time" notification.
  let previousKg = null;
  try {
    const [[prev]] = await db.execute(
      'SELECT weight_kg FROM bmi_records WHERE user_id = ? AND weight_kg IS NOT NULL ORDER BY recorded_at DESC, id DESC LIMIT 1',
      [userId],
    );
    previousKg = prev ? Number(prev.weight_kg) : null;
  } catch (_) { /* optional */ }

  const [result] = await db.execute(
    `INSERT INTO bmi_records (user_id, weight_kg, height_cm, bmi, bmi_category, recorded_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [userId, weight, height, bmi, category]
  );
  tasks.notifyTask(userId, { category: 'PROGRESS', message: tasks.weighInMessage(weight, previousKg) });

  // FIX: keep user_profiles.height_cm / weight_kg in sync with the
  // latest BMI log, so the Profile page (which computes BMI live
  // from user_profiles) reflects this calculation immediately.
  // Requires a UNIQUE constraint on user_profiles.user_id.
  await db.execute(`
      INSERT INTO user_profiles (user_id, height_cm, weight_kg)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
          height_cm = VALUES(height_cm),
          weight_kg = VALUES(weight_kg)
  `, [userId, height, weight]);

  // Adaptive recalibration (Module 8): if the active goal's kcal/macros were
  // computed from a materially different body weight (>2 kg / >5% drift from
  // the calibrated reference), re-derive them from this weigh-in. Best-effort
  // and threshold-gated — a stale BMI save or a legacy DB must never block.
  let recalibration = null;
  try {
    const goals = require('./goals.service');
    recalibration = await goals.recalibrateGoal(userId);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[bmi] goal recalibration skipped:', err.message);
    }
  }

  // Generate AI suggestion — general fitness info only, never diagnosis/treatment
  const prompt = `You are Vitalis AI, a fitness assistant providing general fitness information only.
                A user has the following stats:
                - BMI: ${bmi} (${category})
                - Weight: ${weight} kg
                - Height: ${height} cm
                ${age !== null ? `- Age: ${age}` : ''}
                ${gender ? `- Gender: ${gender}` : ''}

                Give a 2-3 sentence personalized, encouraging fitness suggestion based on their body profile.
                Be direct, warm, and actionable. Do not diagnose, treat, or prescribe.
                End with: General fitness info only — not medical advice.`;

  let aiSuggestion = '';
  let aiDegraded = false;
  try {
    aiSuggestion = await callGeminiWithFallback(prompt);
    // callGeminiWithFallback never throws on outage — returns high-demand string
    if (typeof aiSuggestion === 'string' && /high demand|currently experiencing|try again later/i.test(aiSuggestion)) {
      aiDegraded = true;
      aiSuggestion = 'Focus on balanced nutrition and consistent activity to optimize your body composition.';
    }
  } catch (aiErr) {
    console.error('[BMI] AI Error:', aiErr.message);
    aiDegraded = true;
    aiSuggestion = 'Focus on balanced nutrition and consistent activity to optimize your body composition.';
  }

  return { id: result.insertId, bmi, category, aiSuggestion, degraded: aiDegraded, recalibration };
}

async function listRecords(userId, limit, offset) {
  // NOTE: db.query (not execute) — mysql2 server-side prepares reject
  // placeholders in LIMIT/OFFSET on some MySQL versions.
  const [rows] = await db.query(
    `SELECT id, weight_kg, height_cm, bmi, bmi_category,
            DATE_FORMAT(recorded_at, '%Y-%m-%d %H:%i') AS recorded_at
     FROM bmi_records
     WHERE user_id = ?
     ORDER BY recorded_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const [[countRow]] = await db.execute(
    `SELECT COUNT(*) AS total FROM bmi_records WHERE user_id = ?`,
    [userId]
  );

  return { records: rows, total: countRow?.total ?? 0 };
}


// ─── Yearly BMI monitoring ──────────────────────────────────────────────
// One row per calendar year: first/last/average reading, the class at the
// end of the year and the change against the previous year's last reading,
// plus a plain-language summary. `checkDue` flags a yearly re-check once the
// latest reading is more than 12 months old.
function summarizeYears(rows, now = new Date()) {
  const byYear = new Map();
  for (const r of rows) {
    const bmi = Number(r.bmi);
    if (!Number.isFinite(bmi) || bmi <= 0) continue;
    const year = Number(String(r.recorded_on).slice(0, 4));
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push({ bmi, weightKg: r.weight_kg != null ? Number(r.weight_kg) : null, on: r.recorded_on });
  }
  const years = [...byYear.keys()].sort((a, b) => a - b);
  let prevLast = null;
  let prevClass = null;
  const out = years.map((year) => {
    const list = byYear.get(year);
    const first = list[0];
    const last = list[list.length - 1];
    const avg = list.reduce((t, x) => t + x.bmi, 0) / list.length;
    const cls = classifyBmi(last.bmi);
    const change = prevLast != null ? Number((last.bmi - prevLast).toFixed(1)) : null;
    let summary;
    if (change == null) {
      summary = `First year on record: ended at BMI ${last.bmi.toFixed(1)} (${cls.label}).`;
    } else if (Math.abs(change) < 0.5) {
      summary = `Stable: BMI stayed about the same as last year (${change >= 0 ? '+' : ''}${change}).`;
    } else {
      summary = `BMI ${change > 0 ? 'rose' : 'fell'} by ${Math.abs(change)} compared with last year.`;
    }
    if (prevClass && prevClass.key !== cls.key) summary += ` Category changed from ${prevClass.label} to ${cls.label}.`;
    prevLast = last.bmi;
    prevClass = cls;
    return {
      year,
      readings: list.length,
      firstBmi: Number(first.bmi.toFixed(1)),
      lastBmi: Number(last.bmi.toFixed(1)),
      avgBmi: Number(avg.toFixed(1)),
      minBmi: Number(Math.min(...list.map((x) => x.bmi)).toFixed(1)),
      maxBmi: Number(Math.max(...list.map((x) => x.bmi)).toFixed(1)),
      lastWeightKg: last.weightKg,
      category: cls.label,
      categoryKey: cls.key,
      changeFromPrevYear: change,
      summary,
    };
  });
  const latest = rows.length ? rows[rows.length - 1].recorded_on : null;
  const daysSince = latest ? Math.floor((now.getTime() - new Date(`${String(latest).slice(0, 10)}T00:00:00Z`).getTime()) / 86400000) : null;
  return {
    years: out.reverse(),
    lastRecordedOn: latest ? String(latest).slice(0, 10) : null,
    daysSinceLast: daysSince,
    checkDue: daysSince == null ? true : daysSince > 365,
  };
}

async function yearlySummary(userId) {
  const [rows] = await db.query(
    `SELECT bmi, weight_kg, DATE_FORMAT(recorded_at, '%Y-%m-%d') AS recorded_on
     FROM bmi_records WHERE user_id = ?
     ORDER BY recorded_at ASC, id ASC LIMIT 5000`,
    [userId]
  );
  return summarizeYears(rows);
}

module.exports = { computeBmi, saveBmi, listRecords, yearlySummary, summarizeYears };
