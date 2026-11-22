// AI personal coach — data + orchestration (Section 4).
// Decisions come from utils/coachEngine (rules). Gemini only rewrites the
// final message in a warmer voice; on any AI problem the rule message is used.
const db = require('../config/db');
const { AppError } = require('../utils/errors');
const engine = require('../utils/coachEngine');
const { callGeminiWithFallback, safeParseAI, withTimeout, aiConfigured } = require('../config/gemini');

const AI_TIMEOUT_MS = 5000;
const WORDING_TTL_MS = 6 * 60 * 60 * 1000;
const wordingCache = new Map(); // `${userId}:${signature}` → { at, text }

function safeJson(v, fallback) {
  if (v == null) return fallback;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return fallback; }
}

function toIso(v) {
  return v instanceof Date ? engine.isoLocal(v) : String(v).slice(0, 10);
}

async function loadContext(userId) {
  let goal;
  try {
    [[goal]] = await db.execute(
      `SELECT g.id, g.goal_type, g.daily_kcal, g.protein_g, g.sleep_hours, g.source_plan_id, u.name
         FROM fitness_goals g JOIN users u ON u.id = g.user_id
        WHERE g.user_id = ? AND g.status = 'active' ORDER BY g.id DESC LIMIT 1`,
      [userId]
    );
  } catch (e) {
    if (e.errno !== 1054) throw e;
    [[goal]] = await db.execute(
      `SELECT g.id, g.goal_type, g.daily_kcal, g.protein_g, g.source_plan_id, u.name
         FROM fitness_goals g JOIN users u ON u.id = g.user_id
        WHERE g.user_id = ? AND g.status = 'active' ORDER BY g.id DESC LIMIT 1`,
      [userId]
    );
  }
  if (!goal) return { goal: null };
  const planId = goal.source_plan_id;
  if (!planId) return { goal };
  const [[plan]] = await db.execute('SELECT id, title FROM plans WHERE id = ? LIMIT 1', [planId]);
  if (!plan) return { goal };
  const [days] = await db.execute(
    'SELECT day_number, title, activity_type, duration_mins FROM plan_contents WHERE plan_id = ? ORDER BY day_number',
    [planId]
  );
  let prefs = null;
  try { prefs = await require('./trainingPrefs.service').get(userId); } catch { prefs = null; }
  return { goal, plan, days, preferredDays: prefs?.preferredDays || [] };
}

async function loadStored(userId, planId, weekStart) {
  try {
    const [[row]] = await db.execute(
      'SELECT schedule, handled, choice FROM coach_weeks WHERE user_id = ? AND plan_id = ? AND week_start = ? LIMIT 1',
      [userId, planId, weekStart]
    );
    return row ? { schedule: safeJson(row.schedule, null), handled: safeJson(row.handled, []), choice: row.choice } : null;
  } catch (e) {
    if (e.errno === 1146) return null; // pre-051: default weeks only
    throw e;
  }
}

async function loadActivity(userId, planId, weekStart, today) {
  const end = engine.addDays(weekStart, 7);
  const [completions] = await db.execute(
    `SELECT day_number, completed_at FROM user_plan_progress
      WHERE user_id = ? AND plan_id = ? AND is_completed = 1 AND completed_at >= ? AND completed_at < ?`,
    [userId, planId, weekStart, end]
  );
  const [logs] = await db.execute(
    `SELECT DISTINCT DATE(start_time) AS d FROM workout_logs
      WHERE user_id = ? AND status = 'completed' AND start_time >= ? AND start_time < ?`,
    [userId, engine.addDays(weekStart, -7), end]
  );
  const dates = logs.map((r) => toIso(r.d));
  const [[food]] = await db.execute(
    `SELECT COALESCE(SUM(calories), 0) AS kcal, COALESCE(SUM(protein), 0) AS protein
       FROM food_logs WHERE user_id = ? AND DATE(logged_at) = ?`,
    [userId, today]
  ).catch(() => [[{ kcal: 0, protein: 0 }]]);
  return {
    completions: completions.map((c) => ({ dayNumber: c.day_number, date: toIso(c.completed_at) })),
    activeDates: dates.filter((d) => d >= weekStart),
    lastWeekActiveDays: dates.filter((d) => d < weekStart).length,
    intakeKcal: Number(food?.kcal) || 0,
    intakeProtein: Number(food?.protein) || 0,
  };
}

async function loadStats(userId) {
  try {
    return await require('./trainingInsights.service').collectStats(userId);
  } catch {
    return { recentRatings: [], streak: 0 };
  }
}

/** Valid stored schedule = 7 entries for this week whose workout days still exist in the plan. */
function usableStored(stored, days, weekStart) {
  const s = stored?.schedule;
  if (!Array.isArray(s) || s.length !== 7 || s[0]?.date !== weekStart) return null;
  const numbers = new Set(days.map((d) => d.day_number));
  return s.every((e) => e.kind !== 'workout' || numbers.has(e.dayNumber)) ? s : null;
}

/** Everything the dashboard card needs. `now` is injectable for tests. */
async function computeWeek(userId, now = new Date()) {
  const ctx = await loadContext(userId);
  if (!ctx.goal) return { state: 'no_goal' };
  if (!ctx.plan) return { state: 'no_plan', goalType: ctx.goal.goal_type };

  const today = engine.isoLocal(now);
  const weekStart = engine.weekStartOf(now);
  const stored = await loadStored(userId, ctx.plan.id, weekStart);
  const base = engine.buildWeek(ctx.days, ctx.preferredDays, weekStart);
  const week = usableStored(stored, ctx.days, weekStart) || base;
  const act = await loadActivity(userId, ctx.plan.id, weekStart, today);
  const statuses = engine.weekStatuses(week, { completions: act.completions, activeDates: act.activeDates, today, handled: stored?.handled || [] });

  const stats = await loadStats(userId);
  const workoutsPerWeek = base.filter((e) => e.kind === 'workout').length;
  const missedThisWeek = statuses.filter((e) => e.status === 'missed').length;
  const recovery = engine.recoveryCheck({
    recentRatings: stats.recentRatings || [],
    sleepHours: ctx.goal.sleep_hours != null ? Number(ctx.goal.sleep_hours) : null,
    streak: stats.streak || 0,
    missedLastWeek: Math.max(0, workoutsPerWeek - act.lastWeekActiveDays),
    missedThisWeek,
  });
  const proposal = engine.proposeAdjust(statuses, { today, recovery });
  const todayEntry = statuses.find((e) => e.date === today) || null;
  const firstName = String(ctx.goal.name || '').trim().split(/\s+/)[0] || '';

  const nutrition = engine.nutritionTips({
    goalType: ctx.goal.goal_type,
    dailyKcal: ctx.goal.daily_kcal,
    proteinG: ctx.goal.protein_g,
    todayKind: todayEntry?.kind === 'workout' ? 'workout' : 'rest',
    intakeKcal: act.intakeKcal,
    intakeProtein: act.intakeProtein,
    hour: now.getHours(),
    missedCount: missedThisWeek,
    sleepHours: ctx.goal.sleep_hours,
  });

  return {
    state: 'ok',
    today,
    weekStart,
    plan: { id: ctx.plan.id, title: ctx.plan.title },
    firstName,
    week: statuses,
    todayEntry,
    proposal,
    recovery,
    nutrition,
    adjusted: stored?.choice || null,
    ruleMessage: proposal ? engine.missedMessage(proposal, recovery) : engine.dailyMessage(statuses, { firstName, today }),
  };
}

// Gemini rewrites the rule message. It gets the facts and must not add advice.
async function wordMessage(userId, ruleMessage, { firstName, signature }) {
  if (!aiConfigured() || !ruleMessage) return { text: ruleMessage, ai: false };
  const key = `${userId}:${signature}`;
  const hit = wordingCache.get(key);
  if (hit && Date.now() - hit.at < WORDING_TTL_MS) return { text: hit.text, ai: true };
  const prompt = `You are the VITALIS fitness coach. Rewrite this message for ${firstName || 'the user'} so it sounds warm, encouraging and personal.
Message: "${ruleMessage}"
Rules:
- Keep every fact exactly as given (days, workout names, minutes, calories). Do not add new advice, numbers, foods or medical claims.
- At most 2 sentences, under 220 characters. Plain friendly English, no emojis, no hashtags.
Respond with strict JSON only: {"message":"..."}`;
  try {
    const raw = await withTimeout(callGeminiWithFallback(prompt), AI_TIMEOUT_MS, 'coach wording');
    const { parsed } = safeParseAI(raw);
    const text = typeof parsed?.message === 'string' ? parsed.message.trim().slice(0, 260) : '';
    if (!text) return { text: ruleMessage, ai: false };
    if (wordingCache.size > 1000) wordingCache.delete(wordingCache.keys().next().value);
    wordingCache.set(key, { at: Date.now(), text });
    return { text, ai: true };
  } catch {
    return { text: ruleMessage, ai: false };
  }
}

async function getWeek(userId, now = new Date()) {
  const w = await computeWeek(userId, now);
  if (w.state !== 'ok') return w;
  const signature = [w.today, w.proposal ? w.proposal.recommended : 'daily', w.week.map((e) => e.status[0]).join('')].join('|');
  const { text, ai } = await wordMessage(userId, w.ruleMessage, { firstName: w.firstName, signature });
  return { ...w, message: text, aiWorded: ai };
}

const CHOICES = ['reschedule', 'lighter', 'skip'];

/** Apply one coach option to this week. Re-computes the proposal server-side. */
async function applyChoice(userId, choice, now = new Date()) {
  if (!CHOICES.includes(choice)) throw new AppError('Choose reschedule, lighter or skip.', 400, 'INVALID_COACH_CHOICE');
  const w = await computeWeek(userId, now);
  if (w.state !== 'ok') throw new AppError('Set up a goal and an active plan first.', 404, 'NO_ACTIVE_PLAN');
  if (!w.proposal) throw new AppError('There is no missed workout to adjust right now.', 409, 'NOTHING_TO_ADJUST');
  const opt = w.proposal.options[choice];
  if (!opt?.available) throw new AppError('That option is not possible this week. Try another one.', 409, 'OPTION_UNAVAILABLE');
  const stored = await loadStored(userId, w.plan.id, w.weekStart);
  const handled = [...new Set([...(stored?.handled || []), ...w.proposal.missed.map((m) => m.date)])];
  try {
    await db.execute(
      `INSERT INTO coach_weeks (user_id, plan_id, week_start, schedule, handled, choice)
         VALUES (?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), ?)
       ON DUPLICATE KEY UPDATE schedule = VALUES(schedule), handled = VALUES(handled), choice = VALUES(choice)`,
      [userId, w.plan.id, w.weekStart, JSON.stringify(opt.week), JSON.stringify(handled), choice]
    );
  } catch (e) {
    if (e.errno === 1146) throw new AppError('The coach needs migration 051 — run npm run db:migrate', 503, 'NEEDS_MIGRATION_051');
    throw e;
  }
  return getWeek(userId, now);
}

/** Put this week back to the plan's default schedule. */
async function resetWeek(userId, now = new Date()) {
  const ctx = await loadContext(userId);
  if (!ctx.plan) throw new AppError('Set up a goal and an active plan first.', 404, 'NO_ACTIVE_PLAN');
  try {
    await db.execute('DELETE FROM coach_weeks WHERE user_id = ? AND plan_id = ? AND week_start = ?', [userId, ctx.plan.id, engine.weekStartOf(now)]);
  } catch (e) {
    if (e.errno !== 1146) throw e;
  }
  return getWeek(userId, now);
}

module.exports = { getWeek, applyChoice, resetWeek, computeWeek, CHOICES };
