const db = require("../config/db");

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
  const pace = p.pace != null ? String(p.pace).slice(0, 20) : null;
  const calories = Math.max(0, parseInt(p.calories ?? 0) || 0);
  const route = downsampleRoute(p.route);
  const isGps =
    p.is_gps == null
      ? true
      : p.is_gps === true || p.is_gps === 1 || p.is_gps === "1";
  const [result] = await db.execute(
    `INSERT INTO activity_logs (user_id, duration, distance, pace, calories, is_gps, route)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uid, duration, distance, pace, calories, isGps ? 1 : 0, route],
  );
  return { success: true, id: result.insertId };
}

async function getStats(userId) {
  const [[row]] = await db.execute(
    `SELECT COUNT(*) AS totalActivities,
            COALESCE(SUM(distance),0) AS totalDistance,
            COALESCE(SUM(calories),0) AS totalCalories,
            COALESCE(SUM(duration),0) AS totalDuration,
            COALESCE(AVG(distance),0) AS avgDistance
     FROM activity_logs WHERE user_id = ?`,
    [userId],
  );
  // totalRuns alias: older frontend (statsTab) reads stats.totalRuns
  // bestRun powers the StatsTab "Best Effort" card (null until first run).
  const [[best]] = await db.execute(
    `SELECT distance, created_at AS date FROM activity_logs
     WHERE user_id = ? ORDER BY distance DESC LIMIT 1`,
    [userId],
  );
  return { success: true, stats: { ...row, totalRuns: row.totalActivities, bestRun: best || null } };
}

async function getDetail(id, userId) {
  const [[row]] = await db.execute(
    `SELECT id, user_id, duration, distance, pace, calories, is_gps, route, created_at
     FROM activity_logs WHERE id = ? AND user_id = ? LIMIT 1`,
    [id, userId],
  );
  return row || null;
}

async function getAllForUser(userId) {
  // Route powers feed thumbnails (parsed + downsampled client-side);
  // kudos aggregate powers persisted feed kudos.
  try {
    const [rows] = await db.execute(
      `SELECT a.id, a.duration, a.distance, a.pace, a.calories, a.is_gps, a.route, a.created_at,
              COUNT(k.id) AS kudos_count,
              MAX(CASE WHEN k.user_id = ? THEN 1 ELSE 0 END) AS kudos_given
       FROM activity_logs a
       LEFT JOIN activity_kudos k ON k.activity_id = a.id
       WHERE a.user_id = ? GROUP BY a.id ORDER BY a.created_at DESC LIMIT 100`,
      [userId, userId],
    );
    return rows.map((r) => ({
      ...r,
      kudos_count: Number(r.kudos_count || 0),
      kudos_given: Number(r.kudos_given || 0) === 1,
    }));
  } catch (err) {
    // Pre-migration (029 not applied yet): serve history without kudos
    // instead of breaking the feed. Kudos toggle will 500 until migrated.
    if (err?.errno !== 1146) throw err;
    const [rows] = await db.execute(
      `SELECT id, duration, distance, pace, calories, is_gps, route, created_at
       FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
      [userId],
    );
    return rows.map((r) => ({ ...r, kudos_count: 0, kudos_given: false }));
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
