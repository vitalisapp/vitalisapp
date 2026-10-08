const db = require('../config/db');
const { AppError } = require('../utils/errors');

const VALID_END_STATUS = ['completed', 'cancelled'];

function cleanWorkoutType(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return 'general';
  const t = raw.trim().toLowerCase().slice(0, 100);
  if (!/^[a-z0-9 _-]+$/.test(t)) return null;
  return t;
}

async function poststart(req, res, next) {
  try {
    const workout_type = cleanWorkoutType(req.body?.workout_type);
    if (workout_type === null) {
      return res.status(400).json({ error: 'workout_type must be a short text slug' });
    }
    try {
      const [result] = await db.execute(
        `INSERT INTO workout_logs (user_id, workout_type, status)
           VALUES (?, ?, 'active')`,
        [req.user.id, workout_type]
      );
      const [[log]] = await db.execute(`SELECT id, start_time FROM workout_logs WHERE id = ?`, [
        result.insertId,
      ]);
      if (!log) throw new AppError('Could not start workout session', 500, 'WORKOUT_START_FAILED');
      res.status(201).json({ session_id: log.id, start_time: log.start_time });
    } catch (err) {
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

async function patchIdEnd(req, res, next) {
  try {
    const logId = parseInt(req.params.id, 10);
    if (!Number.isInteger(logId) || logId <= 0) {
      return res.status(400).json({ error: 'Invalid workout id' });
    }
    const { status = 'completed', rep_count = 0 } = req.body || {};
    if (!VALID_END_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ error: `status must be one of: ${VALID_END_STATUS.join(', ')}` });
    }
    const reps = Number(rep_count);
    if (!Number.isInteger(reps) || reps < 0 || reps > 100000) {
      return res.status(400).json({ error: 'rep_count must be an integer 0–100000' });
    }
    try {
      const [[existing]] = await db.execute(
        `SELECT id, status FROM workout_logs WHERE id = ? AND user_id = ?`,
        [logId, req.user.id]
      );
      if (!existing) return res.status(404).json({ error: 'Log not found' });
      if (existing.status !== 'active')
        return res.status(409).json({ error: `Already ${existing.status}` });

      await db.execute(
        `UPDATE workout_logs
              SET end_time = NOW(),
                  status = ?,
                  rep_count = ?,
                  duration_seconds = TIMESTAMPDIFF(SECOND, start_time, NOW())
            WHERE id = ? AND user_id = ?`,
        [status, reps, logId, req.user.id]
      );

      const [[updated]] = await db.execute(
        `SELECT id, workout_type, rep_count, start_time, end_time, status, duration_seconds
             FROM workout_logs WHERE id = ? AND user_id = ?`,
        [logId, req.user.id]
      );
      if (!updated) return res.status(404).json({ error: 'Log not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

async function get(req, res, next) {
  try {
    try {
      const [logs] = await db.execute(
        `SELECT id, workout_type, rep_count, start_time, end_time, status, duration_seconds
             FROM workout_logs
            WHERE user_id = ?
            ORDER BY start_time DESC LIMIT 50`,
        [req.user.id]
      );
      res.json({ logs });
    } catch (err) {
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

module.exports = { poststart, patchIdEnd, get };
