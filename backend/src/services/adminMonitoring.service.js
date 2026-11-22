// Admin — Section 10: user activity monitoring (GREEN / YELLOW / RED).
// Gathers per-member activity signals in two queries, then classifies each
// user with the pure rules in utils/activityStatus.js. Read-only; caller must
// pass `verifyUser, requireAdmin`.
//
// Classification happens in JS (filters on derived status/flags can't be done
// in SQL), so filtering and paging are in memory. That is fine at capstone
// scale (hundreds of members); past ~10k members, persist a nightly status.
const db = require("../config/db");
const {
  CRITERIA, STATUS, FLAGS, classifyUser, describeCriteria, interpretUser, interpretEngagement,
} = require("../utils/activityStatus");

const STATUS_ORDER = { red: 0, yellow: 1, green: 2 };
const FLAG_GROUPS = ["inactive", "missing", "unusual"];
const PAGE_LIMIT_DEFAULT = 20;
const PAGE_LIMIT_MAX = 100;
const fmt = (d) => (d ? String(d instanceof Date ? d.toISOString() : d) : null);

/** Per-member signals. `userIds` narrows to specific users (Users page dots). */
async function loadSignals(userIds) {
  const ids = Array.isArray(userIds) ? userIds.map(Number).filter((n) => Number.isInteger(n) && n > 0) : null;
  if (ids && ids.length === 0) return [];
  const idSql = ids ? `AND u.id IN (${ids.map(() => "?").join(",")})` : "";
  const params = ids || [];

  const [rows] = await db.query(
    `SELECT u.id, u.name, u.email, u.status AS account_status, u.created_at,
       (SELECT MAX(s.created_at) FROM user_sessions s WHERE s.user_id = u.id) AS last_login,
       (SELECT MAX(w.start_time) FROM workout_logs w WHERE w.user_id = u.id) AS last_workout,
       (SELECT MAX(a.created_at) FROM activity_logs a WHERE a.user_id = u.id) AS last_run,
       (SELECT COUNT(*) FROM workout_logs w WHERE w.user_id = u.id
          AND w.start_time >= CURDATE() - INTERVAL ${CRITERIA.windowDays - 1} DAY) AS workouts7,
       (SELECT COUNT(*) FROM activity_logs a WHERE a.user_id = u.id
          AND a.created_at >= CURDATE() - INTERVAL ${CRITERIA.windowDays - 1} DAY) AS runs7,
       (SELECT MAX(f.logged_at) FROM food_logs f WHERE f.user_id = u.id) AS last_meal,
       (SELECT COUNT(DISTINCT DATE(f.logged_at)) FROM food_logs f WHERE f.user_id = u.id
          AND f.logged_at >= CURDATE() - INTERVAL ${CRITERIA.windowDays - 1} DAY) AS meal_days7,
       (SELECT COALESCE(SUM(f.calories), 0) FROM food_logs f WHERE f.user_id = u.id
          AND f.logged_at >= CURDATE() - INTERVAL ${CRITERIA.windowDays - 1} DAY) AS kcal7,
       (SELECT MAX(b.recorded_at) FROM bmi_records b WHERE b.user_id = u.id) AS last_bmi,
       (SELECT MAX(m.recorded_at) FROM body_measurements m WHERE m.user_id = u.id) AS last_measure,
       (SELECT MAX(p.captured_at) FROM progress_photos p WHERE p.user_id = u.id) AS last_photo,
       (SELECT t.preferred_days FROM training_preferences t WHERE t.user_id = u.id LIMIT 1) AS preferred_days
     FROM users u
     WHERE u.role = 'member' ${idSql}`,
    params,
  );
  if (rows.length === 0) return [];

  // Weigh-ins for the unusual-pattern checks (60 days covers the 28-day rate
  // window plus earlier points for jump detection near the window edge).
  const memberIds = rows.map((r) => r.id);
  const marks = memberIds.map(() => "?").join(",");
  const [weights] = await db.query(
    `SELECT user_id, recorded_at AS at, weight_kg AS kg FROM bmi_records
       WHERE user_id IN (${marks}) AND weight_kg IS NOT NULL AND recorded_at >= CURDATE() - INTERVAL 60 DAY
     UNION ALL
     SELECT user_id, recorded_at AS at, weight_kg AS kg FROM body_measurements
       WHERE user_id IN (${marks}) AND weight_kg IS NOT NULL AND recorded_at >= CURDATE() - INTERVAL 60 DAY`,
    [...memberIds, ...memberIds],
  );
  const byUser = new Map();
  for (const w of weights) {
    if (!byUser.has(w.user_id)) byUser.set(w.user_id, []);
    byUser.get(w.user_id).push({ date: w.at, kg: Number(w.kg) });
  }
  return rows.map((r) => ({ ...r, weights: byUser.get(r.id) || [] }));
}

function latest(...values) {
  const ds = values.map((v) => (v ? new Date(v) : null)).filter((d) => d && !Number.isNaN(d.getTime()));
  return ds.length ? new Date(Math.max(...ds.map((d) => d.getTime()))) : null;
}

function toRecord(r, now) {
  const lastWorkout = latest(r.last_workout, r.last_run);
  const lastWeighIn = latest(r.last_bmi, r.last_measure);
  const c = classifyUser({
    createdAt: r.created_at,
    lastLogin: r.last_login,
    lastWorkout,
    lastMeal: r.last_meal,
    lastWeighIn,
    lastPhoto: r.last_photo,
    workouts7: Number(r.workouts7) + Number(r.runs7),
    mealDays7: Number(r.meal_days7),
    kcal7: Number(r.kcal7),
    preferredDays: r.preferred_days,
    weights: r.weights,
  }, now);
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    accountStatus: r.account_status,
    joinedAt: fmt(r.created_at),
    status: c.status,
    lastActive: c.lastActive,
    daysInactive: c.daysInactive,
    isNew: c.isNew,
    week: {
      workouts: Number(r.workouts7) + Number(r.runs7),
      planned: c.planned,
      mealDays: Number(r.meal_days7),
    },
    lastLogin: fmt(r.last_login),
    lastWorkout: lastWorkout ? lastWorkout.toISOString() : null,
    lastMeal: fmt(r.last_meal),
    lastWeighIn: lastWeighIn ? lastWeighIn.toISOString() : null,
    flags: c.flags,
    reasons: c.reasons,
  };
}

function withInterpretation(rec) {
  return rec ? { ...rec, interpretation: interpretUser(rec) } : null;
}

function parseMonitoringQuery(query = {}) {
  const status = Object.values(STATUS).includes(query.status) ? query.status : null;
  const flag = FLAG_GROUPS.includes(query.flag) ? query.flag : null;
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 80) : "";
  const pageNum = Number.parseInt(query.page, 10);
  const limitNum = Number.parseInt(query.limit, 10);
  return {
    status,
    flag,
    q,
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
    limit: Number.isFinite(limitNum) && limitNum > 0 ? Math.min(limitNum, PAGE_LIMIT_MAX) : PAGE_LIMIT_DEFAULT,
    all: query.all === "1" || query.all === true,
  };
}

// Most urgent first: RED, then YELLOW, then GREEN; within a color, the longest
// silence first, then the most flags.
function byAttention(a, b) {
  return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
    || ((b.daysInactive ?? 9999) - (a.daysInactive ?? 9999))
    || (b.flags.length - a.flags.length)
    || (a.id - b.id);
}

/**
 * GET /api/admin/monitoring?status=&flag=&q=&page=&limit=&all=1
 * Summary counts always cover ALL members (the report); the list is filtered.
 */
async function getMonitoring(query = {}, now = new Date()) {
  const opts = parseMonitoringQuery(query);
  const all = (await loadSignals()).map((r) => toRecord(r, now));

  const summary = { total: all.length, green: 0, yellow: 0, red: 0 };
  const flagCounts = { inactive: 0, missing: 0, unusual: 0 };
  const flagKeyCounts = Object.fromEntries(Object.keys(FLAGS).map((k) => [k, 0]));
  for (const u of all) {
    summary[u.status] += 1;
    const groups = new Set(u.flags.map((f) => f.group));
    for (const g of groups) flagCounts[g] += 1;
    for (const f of u.flags) flagKeyCounts[f.key] += 1;
  }

  const needle = opts.q.toLowerCase();
  const filtered = all
    .filter((u) => !opts.status || u.status === opts.status)
    .filter((u) => !opts.flag || u.flags.some((f) => f.group === opts.flag))
    .filter((u) => !needle || String(u.name || "").toLowerCase().includes(needle) || String(u.email || "").toLowerCase().includes(needle))
    .sort(byAttention);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / opts.limit));
  const page = opts.all ? 1 : Math.min(opts.page, pageCount);
  const records = (opts.all ? filtered : filtered.slice((page - 1) * opts.limit, page * opts.limit)).map(withInterpretation);

  return {
    generatedAt: now.toISOString(),
    criteria: describeCriteria(),
    summary,
    needsAttention: summary.yellow + summary.red,
    flagCounts,
    flagKeyCounts,
    filters: { status: opts.status, flag: opts.flag, q: opts.q },
    records,
    total,
    page,
    pageCount: opts.all ? 1 : pageCount,
    limit: opts.all ? total : opts.limit,
  };
}

/** { [userId]: 'green'|'yellow'|'red' } for a handful of users (Users page dots). */
async function getStatusMap(userIds, now = new Date()) {
  const rows = await loadSignals(userIds);
  const map = {};
  for (const r of rows) {
    const rec = toRecord(r, now);
    map[r.id] = { status: rec.status, reasons: rec.reasons.slice(0, 3) };
  }
  return map;
}

/** Full classified record (+ interpretation) for one member, or null (admins). */
async function getUserActivity(userId, now = new Date()) {
  const [row] = await loadSignals([userId]);
  return row ? withInterpretation(toRecord(row, now)) : null;
}

/**
 * Engagement summary for the admin Overview (Section 11): status split, members
 * who logged anything in 7 days, platform workouts/meals in 7 days, and one
 * plain-language interpretation. Counts come straight from the records tables.
 */
async function getEngagement(now = new Date()) {
  const all = (await loadSignals()).map((r) => toRecord(r, now));
  const summary = { total: all.length, green: 0, yellow: 0, red: 0 };
  const flagKeyCounts = {};
  let activeMembers7d = 0;
  for (const u of all) {
    summary[u.status] += 1;
    if (u.week.workouts > 0 || u.week.mealDays > 0) activeMembers7d += 1;
    for (const f of u.flags) flagKeyCounts[f.key] = (flagKeyCounts[f.key] || 0) + 1;
  }
  const days = CRITERIA.windowDays - 1;
  const [[w]] = await db.query(
    `SELECT COUNT(*) AS n FROM workout_logs w JOIN users u ON u.id = w.user_id
     WHERE u.role = 'member' AND w.start_time >= CURDATE() - INTERVAL ${days} DAY`,
  );
  const [[f]] = await db.query(
    `SELECT COUNT(*) AS n FROM food_logs f JOIN users u ON u.id = f.user_id
     WHERE u.role = 'member' AND f.logged_at >= CURDATE() - INTERVAL ${days} DAY`,
  );
  return {
    summary,
    activeMembers7d,
    workouts7d: Number(w?.n) || 0,
    meals7d: Number(f?.n) || 0,
    interpretation: interpretEngagement({ summary, flagKeyCounts, activeMembers7d }),
  };
}

module.exports = {
  getMonitoring, getStatusMap, getUserActivity, getEngagement, parseMonitoringQuery, toRecord, byAttention,
};
