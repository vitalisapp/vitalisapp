// Workout logs — business logic + DB access.
// Module 5: pause/resume, structured set logging (workout_sets),
// and post-workout self-reported feedback (difficulty_rating / session_notes).
const db = require('../config/db');
const tasks = require('../utils/taskNotifications');
const { AppError } = require('../utils/errors');
const { estimateWorkoutKcal } = require('../utils/energyBurn');
const { getUserWeightKg } = require('./energy.service');

const VALID_END_STATUS = ['completed', 'cancelled'];

// Set limits — generous upper bounds, they only guard against abuse/typos.
const MAX_SETS = 100;
const MAX_EXERCISES_PER_LOG = 30;

function cleanWorkoutType(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return 'general';
  const t = raw.trim().toLowerCase().slice(0, 100);
  if (!/^[a-z0-9 _-]+$/.test(t)) return null;
  return t;
}

function cleanExerciseName(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const t = raw.trim().slice(0, 150);
  if (t.length === 0) return null;
  return t;
}

/**
 * Validate and normalize a sets array from the request body.
 * Each set: { exercise_name, set_number, reps?, weight_kg?, duration_seconds?, distance_meters? }.
 * At least one measurable metric must be present. Throws 400 on invalid input.
 */
function validateSets(raw) {
  if (raw === undefined || raw === null) return null; // legacy callers — no sets
  if (!Array.isArray(raw)) throw new AppError('sets must be an array', 400, 'INVALID_SETS');
  if (raw.length > MAX_SETS) throw new AppError(`sets must have at most ${MAX_SETS} rows`, 400, 'INVALID_SETS');
  if (raw.length === 0) return []; // explicit clear

  const seenExercises = new Set();
  return raw.map((s, i) => {
    if (!s || typeof s !== 'object') {
      throw new AppError(`sets[${i}] must be an object`, 400, 'INVALID_SETS');
    }
    const exercise_name = cleanExerciseName(s.exercise_name);
    if (!exercise_name) throw new AppError(`sets[${i}].exercise_name is required (max 150 chars)`, 400, 'INVALID_SETS');
    seenExercises.add(exercise_name.toLowerCase());
    if (seenExercises.size > MAX_EXERCISES_PER_LOG) {
      throw new AppError(`at most ${MAX_EXERCISES_PER_LOG} distinct exercises per session`, 400, 'INVALID_SETS');
    }

    const set_number = Number(s.set_number ?? i + 1);
    if (!Number.isInteger(set_number) || set_number < 1 || set_number > 99) {
      throw new AppError(`sets[${i}].set_number must be an integer 1–99`, 400, 'INVALID_SETS');
    }

    const reps = s.reps === undefined || s.reps === null || s.reps === '' ? null : Number(s.reps);
    if (reps !== null && (!Number.isInteger(reps) || reps < 0 || reps > 1000)) {
      throw new AppError(`sets[${i}].reps must be an integer 0–1000`, 400, 'INVALID_SETS');
    }

    const weight = s.weight_kg === undefined || s.weight_kg === null || s.weight_kg === '' ? null : Number(s.weight_kg);
    if (weight !== null && (!Number.isFinite(weight) || weight < 0 || weight > 1000)) {
      throw new AppError(`sets[${i}].weight_kg must be a number 0–1000`, 400, 'INVALID_SETS');
    }

    const dur = s.duration_seconds === undefined || s.duration_seconds === null || s.duration_seconds === '' ? null : Number(s.duration_seconds);
    if (dur !== null && (!Number.isInteger(dur) || dur < 0 || dur > 86400)) {
      throw new AppError(`sets[${i}].duration_seconds must be an integer 0–86400`, 400, 'INVALID_SETS');
    }

    const dist = s.distance_meters === undefined || s.distance_meters === null || s.distance_meters === '' ? null : Number(s.distance_meters);
    if (dist !== null && (!Number.isInteger(dist) || dist < 0 || dist > 500000)) {
      throw new AppError(`sets[${i}].distance_meters must be an integer 0–500000`, 400, 'INVALID_SETS');
    }

    if (reps === null && weight === null && dur === null && dist === null) {
      throw new AppError(`sets[${i}] must include reps, weight_kg, duration_seconds or distance_meters`, 400, 'INVALID_SETS');
    }

    return {
      exercise_name,
      set_number,
      reps,
      weight: weight === null ? null : Number(weight.toFixed(2)),
      duration_seconds: dur,
      distance_meters: dist,
    };
  });
}

/**
 * Insert validated sets for a log, replacing any existing rows.
 * Must run inside a transaction (conn). Sets are re-numbered per exercise
 * in list order; explicit set_number is used when provided.
 */
async function replaceSets(conn, logId, userId, sets) {
  await conn.execute(`DELETE FROM workout_sets WHERE workout_log_id = ? AND user_id = ?`, [logId, userId]);
  if (!sets || sets.length === 0) return;
  const values = sets.map((s) => [
    logId, userId, s.exercise_name, s.set_number, s.reps, s.weight, s.duration_seconds, s.distance_meters,
  ]);
  await conn.query(
    `INSERT INTO workout_sets
        (workout_log_id, user_id, exercise_name, set_number, reps, weight_kg, duration_seconds, distance_meters)
      VALUES ?`,
    [values]
  );
}

/**
 * Store net kcal for a completed session (inside the caller's transaction).
 * Re-run whenever duration or the difficulty rating changes.
 */
async function recordCalories(conn, userId, logId) {
  const [[row]] = await conn.execute(
    `SELECT workout_type, duration_seconds, difficulty_rating, status
       FROM workout_logs WHERE id = ? AND user_id = ?`,
    [logId, userId]
  );
  if (!row || row.status !== 'completed') return null;
  const kcal = estimateWorkoutKcal({
    workoutType: row.workout_type,
    durationSeconds: row.duration_seconds,
    weightKg: await getUserWeightKg(userId, conn),
    difficulty: row.difficulty_rating,
  });
  await conn.execute(
    `UPDATE workout_logs SET calories_burned = ? WHERE id = ? AND user_id = ?`,
    [kcal, logId, userId]
  );
  return kcal;
}

async function startWorkout(userId, workoutType) {
  const [result] = await db.execute(
    `INSERT INTO workout_logs (user_id, workout_type, status)
       VALUES (?, ?, 'active')`,
    [userId, workoutType]
  );
  const [[log]] = await db.execute(`SELECT id, start_time FROM workout_logs WHERE id = ?`, [
    result.insertId,
  ]);
  if (!log) throw new AppError('Could not start workout session', 500, 'WORKOUT_START_FAILED');
  return { session_id: log.id, start_time: log.start_time };
}

/**
 * Pause an active session. Pausing stops the wall clock accumulating pause
 * time; duration_seconds is later computed as wall time minus paused_seconds.
 */
async function pauseWorkout(userId, logId) {
  const [[existing]] = await db.execute(
    `SELECT id, status FROM workout_logs WHERE id = ? AND user_id = ?`,
    [logId, userId]
  );
  if (!existing) return { outcome: 'not_found' };
  if (existing.status !== 'active') return { outcome: 'conflict', status: existing.status };

  await db.execute(
    `UPDATE workout_logs SET status = 'paused', pause_started_at = NOW()
        WHERE id = ? AND user_id = ?`,
    [logId, userId]
  );
  return { outcome: 'ok' };
}

/**
 * Resume a paused session, folding the finished pause into paused_seconds.
 */
async function resumeWorkout(userId, logId) {
  const [[existing]] = await db.execute(
    `SELECT id, status FROM workout_logs WHERE id = ? AND user_id = ?`,
    [logId, userId]
  );
  if (!existing) return { outcome: 'not_found' };
  if (existing.status !== 'paused') return { outcome: 'conflict', status: existing.status };

  await db.execute(
    `UPDATE workout_logs
          SET status = 'active',
              paused_seconds = paused_seconds + TIMESTAMPDIFF(SECOND, pause_started_at, NOW()),
              pause_started_at = NULL
        WHERE id = ? AND user_id = ?`,
    [logId, userId]
  );
  return { outcome: 'ok' };
}

/**
 * End a session. status ∈ VALID_END_STATUS (paused sessions are finalized
 * first). When `sets` is provided (even an empty array), existing set rows
 * are replaced. duration_seconds = wall time minus pause time.
 */
async function endWorkout(userId, logId, status, reps, sets) {
  const validated = validateSets(sets);

  const [[existing]] = await db.execute(
    `SELECT id, status, pause_started_at, paused_seconds FROM workout_logs WHERE id = ? AND user_id = ?`,
    [logId, userId]
  );
  if (!existing) return { outcome: 'not_found' };
  if (existing.status !== 'active' && existing.status !== 'paused') {
    return { outcome: 'conflict', status: existing.status };
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // Fold an in-progress pause into paused_seconds before computing duration.
    if (existing.status === 'paused') {
      await conn.execute(
        `UPDATE workout_logs
              SET paused_seconds = paused_seconds + TIMESTAMPDIFF(SECOND, pause_started_at, NOW()),
                  pause_started_at = NULL
            WHERE id = ? AND user_id = ?`,
        [logId, userId]
      );
    }
    await conn.execute(
      `UPDATE workout_logs
            SET end_time = NOW(),
                status = ?,
                rep_count = ?,
                duration_seconds = GREATEST(
                  TIMESTAMPDIFF(SECOND, start_time, NOW()) - paused_seconds, 0)
          WHERE id = ? AND user_id = ?`,
      [status, reps, logId, userId]
    );
    if (validated !== null) {
      await replaceSets(conn, logId, userId, validated);
    }
    await recordCalories(conn, userId, logId);
    const [[updated]] = await conn.execute(
      `SELECT id, workout_type, rep_count, start_time, end_time, status, duration_seconds, paused_seconds,
              calories_burned
             FROM workout_logs WHERE id = ? AND user_id = ?`,
      [logId, userId]
    );
    await conn.query('COMMIT');
    if (!updated) return { outcome: 'not_found' };
    if (updated.status === 'completed') {
      tasks.notifyTask(userId, { category: 'TRAINING', message: tasks.workoutMessage(updated) });
    }
    return { outcome: 'ok', log: updated };
  } catch (err) {
    try { await conn.query('ROLLBACK'); } catch { /* noop */ }
    throw err;
  } finally {
    try { conn.release(); } catch { /* noop */ }
  }
}

/**
 * Post-workout self-report. Rating 1–5, optional note (max 500 chars).
 * Only meaningful on finished sessions. Values are upserts: passing null
 * keeps the existing value (feedback is updateable, never auto-cleared).
 */
async function updateFeedback(userId, logId, { difficulty_rating, session_notes }) {
  const rating = difficulty_rating === undefined || difficulty_rating === null ? null : Number(difficulty_rating);
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    throw new AppError('difficulty_rating must be an integer 1–5', 400, 'INVALID_FEEDBACK');
  }
  let notes = null;
  if (session_notes !== undefined && session_notes !== null) {
    if (typeof session_notes !== 'string') throw new AppError('session_notes must be a string', 400, 'INVALID_FEEDBACK');
    notes = session_notes.trim().slice(0, 500) || null;
  }

  const [[existing]] = await db.execute(
    `SELECT id, status FROM workout_logs WHERE id = ? AND user_id = ?`,
    [logId, userId]
  );
  if (!existing) return { outcome: 'not_found' };
  if (existing.status !== 'completed') {
    throw new AppError('Feedback can only be saved for completed sessions', 409, 'SESSION_NOT_COMPLETED');
  }

  await db.execute(
    `UPDATE workout_logs
          SET difficulty_rating = COALESCE(?, difficulty_rating),
              session_notes     = COALESCE(?, session_notes)
        WHERE id = ? AND user_id = ? AND status = 'completed'`,
    [rating, notes, logId, userId]
  );
  // A harder session burns more: re-estimate with the new rating.
  if (rating !== null) await recordCalories(db, userId, logId);
  const [[updated]] = await db.execute(
    `SELECT id, difficulty_rating, session_notes, calories_burned FROM workout_logs WHERE id = ? AND user_id = ?`,
    [logId, userId]
  );
  return { outcome: 'ok', log: updated };
}

/**
 * Manual entry (Log page "Log workout"): a completed session recorded after
 * the fact — no camera step. start_time = performed_at (default now),
 * end_time = start + duration, status = 'completed'. Sets optional.
 */
async function createManualWorkout(userId, { workout_type, duration_minutes, rep_count, sets, performed_at }) {
  const type = typeof workout_type === 'string' ? workout_type.toLowerCase().trim() : '';
  const cleaned = cleanWorkoutType(type);
  if (cleaned === null) throw new AppError('workout_type must be a short text slug (a–z, digits, spaces, _ or -)', 400, 'INVALID_WORKOUT_TYPE');

  const mins = Number(duration_minutes);
  if (!Number.isInteger(mins) || mins < 1 || mins > 1440) {
    throw new AppError('duration_minutes must be an integer 1–1440', 400, 'INVALID_DURATION');
  }

  let reps = rep_count === undefined || rep_count === null ? null : Number(rep_count);
  if (reps !== null && (!Number.isInteger(reps) || reps < 0 || reps > 100000)) {
    throw new AppError('rep_count must be an integer 0–100000', 400, 'INVALID_REPS');
  }

  let startTime = new Date();
  if (performed_at !== undefined && performed_at !== null && performed_at !== '') {
    const t = new Date(performed_at);
    if (Number.isNaN(t.getTime())) throw new AppError('performed_at must be a valid date', 400, 'INVALID_PERFORMED_AT');
    const now = Date.now();
    // Clients that send a timezone-naive "today at 12:00" can land a few hours
    // ahead of the server clock. Store those as "now" instead of rejecting a
    // legitimate same-day save; anything further ahead is still a bad input.
    if (t.getTime() > now + 24 * 60 * 60 * 1000) throw new AppError('performed_at cannot be in the future', 400, 'INVALID_PERFORMED_AT');
    if (t.getTime() < now - 366 * 24 * 60 * 60 * 1000) throw new AppError('performed_at is too far in the past', 400, 'INVALID_PERFORMED_AT');
    startTime = t.getTime() > now ? new Date(now) : t;
  }

  const validated = validateSets(sets);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute(
      `INSERT INTO workout_logs
          (user_id, workout_type, status, rep_count, start_time, end_time, duration_seconds)
        VALUES (?, ?, 'completed', ?, ?, DATE_ADD(?, INTERVAL ? SECOND), ?)`,
      [userId, cleaned, reps, startTime, startTime, mins * 60, mins * 60]
    );
    const logId = result.insertId;
    if (validated !== null && validated.length > 0) {
      await replaceSets(conn, logId, userId, validated);
      if (reps === null) {
        // Rep count not supplied — derive from logged sets so day stats match.
        const sumReps = validated.reduce((s, x) => s + (x.reps || 0), 0);
        if (sumReps > 0) {
          await conn.execute(`UPDATE workout_logs SET rep_count = ? WHERE id = ? AND user_id = ?`, [sumReps, logId, userId]);
        }
      }
    }
    await recordCalories(conn, userId, logId);
    const [[log]] = await conn.execute(
      `SELECT id, workout_type, rep_count, start_time, end_time, status, duration_seconds, paused_seconds,
              calories_burned
          FROM workout_logs WHERE id = ? AND user_id = ?`,
      [logId, userId]
    );
    await conn.query('COMMIT');
    if (log) tasks.notifyTask(userId, { category: 'TRAINING', message: tasks.workoutMessage(log, { manual: true }) });
    return log;
  } catch (err) {
    try { await conn.query('ROLLBACK'); } catch { /* noop */ }
    throw err;
  } finally {
    try { conn.release(); } catch { /* noop */ }
  }
}

/** Session detail with its set rows, ordered per the saved order. */
async function getWorkoutDetail(userId, logId) {
  const [[log]] = await db.execute(
    `SELECT id, workout_type, rep_count, start_time, end_time, status,
               duration_seconds, paused_seconds, difficulty_rating, session_notes, calories_burned
          FROM workout_logs WHERE id = ? AND user_id = ?`,
    [logId, userId]
  );
  if (!log) return null;
  const [sets] = await db.execute(
    `SELECT id, exercise_name, set_number, reps, weight_kg, duration_seconds, distance_meters
          FROM workout_sets WHERE workout_log_id = ? AND user_id = ?
         ORDER BY exercise_name, set_number, id`,
    [logId, userId]
  );
  return { ...log, sets };
}

/** Attach a per-log set rollup (set count, volume, best weight, exercises). */
async function attachSetSummary(userId, logs) {
  if (logs.length === 0) return logs;
  const ids = logs.map((l) => l.id);
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await db.execute(
    `SELECT workout_log_id,
              COUNT(*) AS set_rows,
              ROUND(SUM(weight_kg * reps)) AS volume_kg,
              MAX(weight_kg) AS best_weight_kg,
              COUNT(DISTINCT exercise_name) AS exercise_count
         FROM workout_sets
        WHERE workout_log_id IN (${placeholders}) AND user_id = ?
        GROUP BY workout_log_id`,
    [...ids, userId]
  );
  const byLog = new Map(rows.map((r) => [r.workout_log_id, r]));
  return logs.map((l) => {
    const s = byLog.get(l.id);
    return s
      ? {
          ...l,
          set_rows: Number(s.set_rows) || 0,
          volume_kg: s.volume_kg != null ? Number(s.volume_kg) : null,
          best_weight_kg: s.best_weight_kg != null ? Number(s.best_weight_kg) : null,
          exercise_count: Number(s.exercise_count) || 0,
        }
      : l;
  });
}

const LOG_COLUMNS = `id, workout_type, rep_count, start_time, end_time, status,
               duration_seconds, paused_seconds, difficulty_rating, session_notes, calories_burned`;

/** Legacy list: latest 50 sessions (Dashboard, Plans). Unchanged contract. */
async function listWorkouts(userId, { with_sets = false } = {}) {
  const [logs] = await db.execute(
    `SELECT ${LOG_COLUMNS}
          FROM workout_logs
         WHERE user_id = ?
         ORDER BY start_time DESC LIMIT 50`,
    [userId]
  );
  return with_sets ? attachSetSummary(userId, logs) : logs;
}

// ── Paginated history (Progress page) ────────────────────────────────
const PAGE_LIMIT_DEFAULT = 10;
const PAGE_LIMIT_MAX = 50;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;

/** Parse + clamp untrusted query params. Invalid values fall back to safe
 *  defaults (never 500): page>=1, 1<=limit<=50, date must be a real day. */
function parseHistoryQuery(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const rawLimit = Number.parseInt(query.limit, 10);
  const limit = Math.min(PAGE_LIMIT_MAX, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : PAGE_LIMIT_DEFAULT));
  let date = null;
  if (typeof query.date === 'string' && ISO_DAY.test(query.date)) {
    const d = new Date(`${query.date}T00:00:00Z`);
    if (!Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === query.date) date = query.date;
  }
  return { page, limit, date };
}

/** One page of sessions + totals for the whole filter (all pages).
 *  page beyond the end is clamped to the last page. */
async function listWorkoutsPage(userId, { page = 1, limit = PAGE_LIMIT_DEFAULT, date = null, with_sets = false } = {}) {
  const where = ['user_id = ?'];
  const params = [userId];
  if (date) {
    // Range (not DATE(start_time)=?) so the user_id/start_time index is used.
    where.push('start_time >= ? AND start_time < DATE_ADD(?, INTERVAL 1 DAY)');
    params.push(`${date} 00:00:00`, `${date} 00:00:00`);
  }
  const whereSql = where.join(' AND ');

  const [[agg]] = await db.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(rep_count), 0) AS reps,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS completed
       FROM workout_logs WHERE ${whereSql}`,
    params
  );
  const total = Number(agg?.total) || 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(page, pageCount);
  const offset = (current - 1) * limit;

  // db.query (not execute): some MySQL versions reject prepared LIMIT/OFFSET.
  const [rows] = await db.query(
    `SELECT ${LOG_COLUMNS}
       FROM workout_logs
      WHERE ${whereSql}
      ORDER BY start_time DESC, id DESC
      LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const logs = with_sets ? await attachSetSummary(userId, rows) : rows;

  return {
    logs,
    page: current,
    limit,
    total,
    pageCount,
    date,
    stats: { sessions: total, reps: Number(agg?.reps) || 0, completed: Number(agg?.completed) || 0 },
  };
}

/** Days in a month that have at least one session (calendar dots). */
async function listWorkoutDays(userId, month) {
  const now = new Date();
  const key = typeof month === 'string' && ISO_MONTH.test(month)
    ? month
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [rows] = await db.query(
    `SELECT DISTINCT DATE_FORMAT(start_time, '%Y-%m-%d') AS day
       FROM workout_logs
      WHERE user_id = ?
        AND start_time >= ? AND start_time < DATE_ADD(?, INTERVAL 1 MONTH)
      ORDER BY day ASC`,
    [userId, `${key}-01 00:00:00`, `${key}-01 00:00:00`]
  );
  return { month: key, days: rows.map((r) => r.day) };
}

module.exports = {
  PAGE_LIMIT_DEFAULT,
  PAGE_LIMIT_MAX,
  parseHistoryQuery,
  listWorkoutsPage,
  listWorkoutDays,
  VALID_END_STATUS,
  MAX_SETS,
  MAX_EXERCISES_PER_LOG,
  cleanWorkoutType,
  cleanExerciseName,
  validateSets,
  startWorkout,
  pauseWorkout,
  resumeWorkout,
  endWorkout,
  updateFeedback,
  createManualWorkout,
  getWorkoutDetail,
  listWorkouts,
};
