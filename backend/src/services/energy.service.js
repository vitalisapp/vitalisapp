// Energy expenditure: every source of "calories burned" in one place.
//
// The dashboard's remaining budget is  target − eaten + burned. Before this
// service, `burned` only came from the manual "Log activity" form
// (daily_stats), so finishing a workout or a GPS run never changed it.
// Burn is now derived per day from three sources:
//   manual     daily_stats.calories_burned        (Log activity form)
//   workouts   workout_logs.calories_burned       (completed sessions)
//   activities activity_logs.calories             (GPS / manual runs)
// Derived at read time, so deleting a run or a session can never leave a
// stale total behind.
const db = require('../config/db');
const { estimateWorkoutKcal, estimateActivityKcal, DEFAULT_WEIGHT_KG, eatBackFactor, creditedKcal } = require('../utils/energyBurn');
const { isMissingColumn } = require('../utils/schemaCompat');

/** Best known body weight: latest weigh-in, else active goal, else profile. */
async function getUserWeightKg(userId, conn = db) {
  const [[row]] = await conn.execute(
    `SELECT COALESCE(
        (SELECT weight_kg FROM bmi_records
          WHERE user_id = ? AND weight_kg > 0 ORDER BY recorded_at DESC, id DESC LIMIT 1),
        (SELECT weight_kg FROM fitness_goals
          WHERE user_id = ? AND status = 'active' AND weight_kg > 0 ORDER BY id DESC LIMIT 1),
        (SELECT weight_kg FROM user_profiles WHERE user_id = ? AND weight_kg > 0 LIMIT 1)
      ) AS weight_kg`,
    [userId, userId, userId],
  ).catch(() => [[null]]);
  const kg = Number(row?.weight_kg);
  return Number.isFinite(kg) && kg > 0 ? kg : DEFAULT_WEIGHT_KG;
}

/** Active goal type (LOSE_WEIGHT, …) or null. */
async function getActiveGoalType(userId) {
  const [[row]] = await db.execute(
    `SELECT goal_type FROM fitness_goals WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`,
    [userId],
  ).catch(() => [[null]]);
  return row?.goal_type || null;
}

/** Net kcal for one session row; uses the stored value when present. */
function workoutKcal(row, weightKg) {
  const stored = Number(row.calories_burned);
  if (Number.isFinite(stored) && stored > 0) return Math.round(stored);
  // Sessions saved before calories were tracked (or stored as 0): estimate.
  return estimateWorkoutKcal({
    workoutType: row.workout_type,
    durationSeconds: row.duration_seconds,
    weightKg,
    difficulty: row.difficulty_rating,
  });
}

/** Net kcal for one activity row; measured/stored value wins, else estimate. */
function activityKcal(row, weightKg) {
  const stored = Number(row.calories);
  if (Number.isFinite(stored) && stored > 0) return Math.round(stored);
  return estimateActivityKcal({
    durationSeconds: row.duration,
    distanceKm: row.distance,
    weightKg,
  });
}

// local_date arrives in migration 062. Until it is applied, fall back to the
// timestamp's date so deployments never break between code and schema. Each
// query carries its own bindings (the legacy query has fewer placeholders).
async function queryWithLocalDate([withDateSql, withDateParams], [legacySql, legacyParams]) {
  try {
    return (await db.execute(withDateSql, withDateParams))[0];
  } catch (err) {
    if (!isMissingColumn(err, 'local_date')) throw err;
    return (await db.execute(legacySql, legacyParams))[0];
  }
}

/**
 * Burn per day in [from, to) — dates are 'YYYY-MM-DD'.
 * @returns {Promise<Map<string, { manual: number, workouts: number, activities: number, total: number }>>}
 */
async function getBurnByDay(userId, from, to) {
  const [manualRes, workoutRes, activityRes, weightKg, goalType] = await Promise.all([
    db.execute(
      `SELECT DATE_FORMAT(stat_date, '%Y-%m-%d') AS d, COALESCE(calories_burned, 0) AS kcal
         FROM daily_stats WHERE user_id = ? AND stat_date >= ? AND stat_date < ?`,
      [userId, from, to],
    ),
    queryWithLocalDate(
      [`SELECT DATE_FORMAT(COALESCE(w.local_date, DATE(w.start_time)), '%Y-%m-%d') AS d,
              w.workout_type, w.duration_seconds, w.difficulty_rating, w.calories_burned
         FROM workout_logs w
        WHERE w.user_id = ? AND w.status = 'completed' AND (
                (w.local_date IS NOT NULL AND w.local_date >= ? AND w.local_date < ?)
                OR (w.local_date IS NULL AND w.start_time >= ? AND w.start_time < ?)
              )`,
       [userId, from, to, from, to]],
      [`SELECT DATE_FORMAT(start_time, '%Y-%m-%d') AS d, workout_type, duration_seconds,
              difficulty_rating, calories_burned
         FROM workout_logs
        WHERE user_id = ? AND status = 'completed' AND start_time >= ? AND start_time < ?`,
       [userId, from, to]],
    ),
    queryWithLocalDate(
      [`SELECT DATE_FORMAT(COALESCE(a.local_date, DATE(a.created_at)), '%Y-%m-%d') AS d,
              a.duration, a.distance, a.calories
         FROM activity_logs a
        WHERE a.user_id = ? AND (
                (a.local_date IS NOT NULL AND a.local_date >= ? AND a.local_date < ?)
                OR (a.local_date IS NULL AND a.created_at >= ? AND a.created_at < ?)
              )`,
       [userId, from, to, from, to]],
      [`SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, duration, distance, calories
         FROM activity_logs
        WHERE user_id = ? AND created_at >= ? AND created_at < ?`,
       [userId, from, to]],
    ),
    getUserWeightKg(userId),
    getActiveGoalType(userId),
  ]);
  const factor = eatBackFactor(goalType);

  const out = new Map();
  const bucket = (d) => {
    if (!out.has(d)) out.set(d, { manual: 0, workouts: 0, activities: 0, total: 0, credited: 0, eatBackFactor: factor, goalType });
    return out.get(d);
  };
  for (const r of manualRes[0]) if (r.d) bucket(r.d).manual += Number(r.kcal) || 0;
  for (const r of workoutRes) if (r.d) bucket(r.d).workouts += workoutKcal(r, weightKg);
  for (const r of activityRes) if (r.d) bucket(r.d).activities += activityKcal(r, weightKg);
  for (const b of out.values()) {
    b.total = b.manual + b.workouts + b.activities;
    // What actually goes back into the calorie budget (goal-aware).
    b.credited = creditedKcal(b.total, goalType);
  }
  return out;
}

function addDaysISO(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

const EMPTY_BURN = Object.freeze({ manual: 0, workouts: 0, activities: 0, total: 0, credited: 0 });

/** Burn breakdown for a single day. */
async function getBurnForDay(userId, date) {
  const map = await getBurnByDay(userId, date, addDaysISO(date, 1));
  if (map.has(date)) return { ...map.get(date) };
  const goalType = await getActiveGoalType(userId);
  return { ...EMPTY_BURN, eatBackFactor: eatBackFactor(goalType), goalType };
}

module.exports = { getActiveGoalType, getUserWeightKg, getBurnByDay, getBurnForDay, workoutKcal, activityKcal, addDaysISO, EMPTY_BURN };
