const db = require("../config/db");
const tasks = require('../utils/taskNotifications');
const { isMissingColumn } = require("../utils/schemaCompat");
const { estimateActivityKcal, MAX_SESSION_KCAL } = require("../utils/energyBurn");
const { getUserWeightKg, activityKcal } = require("./energy.service");
const { clientDateFromQuery } = require("../utils/clientDate");

// Revision #7 columns (migration 062). Until it runs, reads/writes fall back
// to the old shape and every value counts as an estimate.
const NEW_COLS = ", a.calories_source, DATE_FORMAT(a.local_date, '%Y-%m-%d') AS local_date";
const withSourceDefault = (r) => ({ calories_source: "estimated", local_date: null, ...r });
// `sql` marks where the new columns go with the literal token /*NEW*/.
async function selectCompat(sql, params) {
  try {
    return await db.execute(sql.split("/*NEW*/").join(NEW_COLS), params);
  } catch (err) {
    if (!isMissingColumn(err)) throw err;
    return db.execute(sql.split("/*NEW*/").join(""), params);
  }
}

// M'SS" per km, or null without distance.
function paceFor(durationSec, distanceKm) {
  if (!(distanceKm > 0) || !(durationSec > 0)) return null;
  const spk = durationSec / distanceKm;
  const m = Math.floor(spk / 60);
  const s = Math.round(spk % 60);
  return s === 60 ? `${m + 1}'00"` : `${m}'${String(s).padStart(2, "0")}"`;
}

// Measured kcal wins (user typed it from a device); otherwise the server
// estimate — never the browser's live counter.
async function resolveCalories(userId, { duration, distance, measuredCalories }) {
  const measured = Number(measuredCalories);
  if (measuredCalories != null && measuredCalories !== "" && Number.isFinite(measured) && measured > 0) {
    return { calories: Math.min(Math.round(measured), MAX_SESSION_KCAL), source: "measured" };
  }
  const weightKg = await getUserWeightKg(userId);
  return { calories: estimateActivityKcal({ durationSeconds: duration, distanceKm: distance, weightKg }), source: "estimated" };
}

const ROUTE_MAX_CHARS = 64000;
const ROUTE_MAX_POINTS = 2000;

// Downsample a GPS track so it always fits the TEXT column as VALID JSON.
// Old code sliced the JSON string (corrupt) or the controller 413-rejected
// long runs outright. Stride-sampling keeps start/end + shape.
function downsampleRoute(route, maxChars = ROUTE_MAX_CHARS, maxPoints = ROUTE_MAX_POINTS) {
  if (route == null) return null;
  let pts = route;
  if (typeof pts === "string") {
    try {
      pts = JSON.parse(pts);
    } catch {
      return String(route).slice(0, maxChars);
    }
  }
  if (!Array.isArray(pts)) return null;
  if (pts.length === 0) return JSON.stringify(pts);
  let stride = Math.max(1, Math.ceil(pts.length / maxPoints));
  const sample = (s) => {
    const out = pts.filter((_, i) => i % s === 0);
    const last = pts[pts.length - 1];
    if (out[out.length - 1] !== last) out.push(last);
    return out;
  };
  let sampled = sample(stride);
  let json = JSON.stringify(sampled);
  while (json.length > maxChars && sampled.length > 2) {
    stride *= 2;
    sampled = sample(stride);
    json = JSON.stringify(sampled);
  }
  return json;
}

// Plausibility gate: avg speed over 50 km/h is GPS glitch or bad input,
// not a run/ride. Generous enough for downhill cycling sprints.
function isPlausibleActivity(durationSec, distanceKm) {
  const d = Number(durationSec);
  const dist = Number(distanceKm);
  if (!Number.isFinite(d) || !Number.isFinite(dist)) return true;
  if (d <= 0 || dist <= 0) return true;
  return dist / (d / 3600) <= 50;
}

async function saveActivity(userId, params) {
  const p =
    typeof params === "object" && params !== null && !Array.isArray(params)
      ? params
      : {};
  const uid = userId ?? p.userId ?? p.user_id;
  const duration = Math.max(0, parseInt(p.duration ?? 0) || 0);
  const distance = Math.max(0, Number(p.distance ?? 0) || 0);
  const pace = p.pace != null && p.pace !== '–' ? String(p.pace).slice(0, 20) : paceFor(duration, distance);
  const { calories, source } = await resolveCalories(uid, { duration, distance, measuredCalories: p.measured_calories });
  const localDate = clientDateFromQuery({ today: p.local_date });
  const route = downsampleRoute(p.route);
  const isGps =
    p.is_gps == null
      ? true
      : p.is_gps === true || p.is_gps === 1 || p.is_gps === "1";
  const base = [uid, duration, distance, pace, calories, isGps ? 1 : 0, route];
  let result;
  try {
    [result] = await db.execute(
      `INSERT INTO activity_logs (user_id, duration, distance, pace, calories, is_gps, route, calories_source, local_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURDATE()))`,
      [...base, source, localDate],
    );
  } catch (err) {
    if (!isMissingColumn(err)) throw err;
    [result] = await db.execute(
      `INSERT INTO activity_logs (user_id, duration, distance, pace, calories, is_gps, route)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      base,
    );
  }
  tasks.notifyTask(uid, { category: 'ACTIVITY', message: tasks.activityMessage({ duration, distance, pace, calories }) });
  return { success: true, id: result.insertId, calories, calories_source: source };
}

/**
 * Edit a saved activity (Revision #7). Calories are re-estimated from the new
 * duration/distance unless a measured value is given. The day's totals are
 * derived at read time, so nothing else needs updating.
 * @returns {Promise<null | { id: number, duration: number, distance: number, pace: string|null, calories: number, calories_source: string }>}
 */
async function updateActivity(id, userId, { duration, distance, measured_calories: measuredCalories }) {
  const [[row]] = await db.execute(
    `SELECT id, duration, distance FROM activity_logs WHERE id = ? AND user_id = ? LIMIT 1`,
    [id, userId],
  );
  if (!row) return null;
  const dur = duration != null ? Math.max(0, Math.round(Number(duration)) || 0) : Number(row.duration) || 0;
  const dist = distance != null ? Math.max(0, Number(distance) || 0) : Number(row.distance) || 0;
  const pace = paceFor(dur, dist);
  const { calories, source } = await resolveCalories(userId, { duration: dur, distance: dist, measuredCalories });
  try {
    await db.execute(
      `UPDATE activity_logs SET duration = ?, distance = ?, pace = ?, calories = ?, calories_source = ? WHERE id = ? AND user_id = ?`,
      [dur, dist, pace, calories, source, id, userId],
    );
  } catch (err) {
    if (!isMissingColumn(err)) throw err;
    await db.execute(
      `UPDATE activity_logs SET duration = ?, distance = ?, pace = ?, calories = ? WHERE id = ? AND user_id = ?`,
      [dur, dist, pace, calories, id, userId],
    );
  }
  return { id: Number(id), duration: dur, distance: dist, pace, calories, calories_source: source };
}

async function getStats(userId) {
  const [[row]] = await db.execute(
    `SELECT COUNT(*) AS totalActivities,
            COALESCE(SUM(distance),0) AS totalDistance,
            COALESCE(SUM(calories),0) AS storedCalories,
            COALESCE(SUM(duration),0) AS totalDuration,
            COALESCE(AVG(distance),0) AS avgDistance
     FROM activity_logs WHERE user_id = ?`,
    [userId],
  );
  // Rows saved before server-side estimation carry 0 kcal. Estimate them with
  // the same helper the dashboard uses so Stats totals agree after refresh.
  const [legacyRows] = await db.execute(
    `SELECT duration, distance FROM activity_logs
      WHERE user_id = ? AND COALESCE(calories, 0) = 0`,
    [userId],
  );
  const weightKg = legacyRows.length ? await getUserWeightKg(userId) : 0;
  const totalCalories = Math.round((Number(row.storedCalories) || 0)
    + legacyRows.reduce((sum, r) => sum + activityKcal(r, weightKg), 0));
  // totalRuns alias: older frontend (statsTab) reads stats.totalRuns
  // bestRun powers the StatsTab "Best Effort" card (null until first run).
  const [[best]] = await db.execute(
    `SELECT distance, created_at AS date FROM activity_logs
     WHERE user_id = ? ORDER BY distance DESC LIMIT 1`,
    [userId],
  );
  const { storedCalories, ...baseStats } = row;
  return { success: true, stats: { ...baseStats, totalCalories, totalRuns: row.totalActivities, bestRun: best || null } };
}

async function getDetail(id, userId) {
  const [[row]] = await selectCompat(
    `SELECT a.id, a.user_id, a.duration, a.distance, a.pace, a.calories, a.is_gps, a.route, a.created_at/*NEW*/
     FROM activity_logs a WHERE a.id = ? AND a.user_id = ? LIMIT 1`,
    [id, userId],
  );
  return row ? withSourceDefault(row) : null;
}

// Same estimate as the dashboard, applied to legacy 0-kcal rows so the feed
// never claims "0 kcal" for a run that already contributes burn elsewhere.
async function withDisplayCalories(rows, userId) {
  const weightKg = rows.length ? await getUserWeightKg(userId) : 0;
  return rows.map((r) => ({
    ...r,
    calories: Number(r.calories) > 0 ? Math.round(Number(r.calories)) : activityKcal(r, weightKg),
  }));
}

async function getAllForUser(userId) {
  // Route powers feed thumbnails (parsed + downsampled client-side);
  // kudos aggregate powers persisted feed kudos.
  try {
    const [rows] = await selectCompat(
      `SELECT a.id, a.duration, a.distance, a.pace, a.calories, a.is_gps, a.route, a.created_at/*NEW*/,
              COUNT(k.id) AS kudos_count,
              MAX(CASE WHEN k.user_id = ? THEN 1 ELSE 0 END) AS kudos_given
       FROM activity_logs a
       LEFT JOIN activity_kudos k ON k.activity_id = a.id
       WHERE a.user_id = ? GROUP BY a.id ORDER BY a.created_at DESC LIMIT 100`,
      [userId, userId],
    );
    const decorated = await withDisplayCalories(rows, userId);
    return decorated.map((r) => ({
      ...withSourceDefault(r),
      kudos_count: Number(r.kudos_count || 0),
      kudos_given: Number(r.kudos_given || 0) === 1,
    }));
  } catch (err) {
    // Pre-migration (029 not applied yet): serve history without kudos
    // instead of breaking the feed. Kudos toggle will 500 until migrated.
    if (err?.errno !== 1146) throw err;
    const [rows] = await selectCompat(
      `SELECT a.id, a.duration, a.distance, a.pace, a.calories, a.is_gps, a.route, a.created_at/*NEW*/
       FROM activity_logs a WHERE a.user_id = ? ORDER BY a.created_at DESC LIMIT 100`,
      [userId],
    );
    const decorated = await withDisplayCalories(rows, userId);
    return decorated.map((r) => ({ ...withSourceDefault(r), kudos_count: 0, kudos_given: false }));
  }
}

async function getActivityById(id) {
  const [[row]] = await db.execute(
    `SELECT id, user_id, duration, distance, pace, calories, is_gps, route, created_at
     FROM activity_logs WHERE id = ? LIMIT 1`,
    [id],
  );
  return row || null;
}

async function deleteActivity(id, userId) {
  const [result] = await db.execute(
    `DELETE FROM activity_logs WHERE id = ? AND user_id = ?`,
    [id, userId],
  );
  return result.affectedRows > 0;
}

async function toggleKudos(activityId, userId) {
  // Any authenticated user may kudos any activity (social feature).
  // Existence check must NOT filter by owner — only delete/detail are owner-scoped.
  const activity = await getActivityById(activityId);
  if (!activity) return null;
  const [[existing]] = await db.execute(
    `SELECT id FROM activity_kudos WHERE activity_id = ? AND user_id = ? LIMIT 1`,
    [activityId, userId],
  );
  let given;
  if (existing) {
    await db.execute(`DELETE FROM activity_kudos WHERE activity_id = ? AND user_id = ?`, [activityId, userId]);
    given = false;
  } else {
    await db.execute(`INSERT INTO activity_kudos (activity_id, user_id) VALUES (?, ?)`, [activityId, userId]);
    given = true;
  }
  const [[{ count }]] = await db.execute(
    `SELECT COUNT(*) AS count FROM activity_kudos WHERE activity_id = ?`,
    [activityId],
  );
  return { kudos: given, kudos_count: Number(count || 0) };
}

module.exports = {
  db,
  updateActivity,
  paceFor,
  ROUTE_MAX_CHARS,
  ROUTE_MAX_POINTS,
  downsampleRoute,
  isPlausibleActivity,
  saveActivity,
  getStats,
  getDetail,
  getActivityById,
  getAllForUser,
  deleteActivity,
  toggleKudos,
};
