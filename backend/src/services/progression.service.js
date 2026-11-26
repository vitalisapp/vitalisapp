// Progressive feature unlocking (Revision #4) — DB access + orchestration.
// Rules live in utils/progression.js (pure). Levels are stored once earned
// (users.progression_level) and never go down.
const db = require('../config/db');
const { AppError } = require('../utils/errors');
const { evaluate, requiredLevelForPlan, SESSION_MIN_SECONDS, LEVELS } = require('../utils/progression');
const { CHALLENGES, getChallenge } = require('../constants/challenges');

const NEEDS_MIGRATION = () => new AppError('Progression needs database migration 061', 503, 'NEEDS_MIGRATION_061');
const isMissingSchema = (e) => e && (e.errno === 1054 || e.errno === 1146);
const CHALLENGE_MAX_AGE_HOURS = 24;

async function collectStats(userId) {
  const [[count]] = await db.execute(
    `SELECT COUNT(*) AS n FROM workout_logs
      WHERE user_id = ? AND status = 'completed' AND COALESCE(duration_seconds, 0) >= ?`,
    [userId, SESSION_MIN_SECONDS]
  );
  // Longest consistency window is 8 weeks → 9 weeks of dates is plenty.
  const [dates] = await db.execute(
    `SELECT DISTINCT DATE_FORMAT(start_time, '%Y-%m-%d') AS d FROM workout_logs
      WHERE user_id = ? AND status = 'completed' AND COALESCE(duration_seconds, 0) >= ?
        AND start_time >= DATE_SUB(CURDATE(), INTERVAL 63 DAY)`,
    [userId, SESSION_MIN_SECONDS]
  );
  const [ratings] = await db.execute(
    `SELECT difficulty_rating AS r FROM workout_logs
      WHERE user_id = ? AND status = 'completed' AND difficulty_rating IS NOT NULL
      ORDER BY start_time DESC LIMIT 5`,
    [userId]
  );
  let forms = [];
  try {
    [forms] = await db.execute(
      `SELECT form_score AS f FROM workout_logs
        WHERE user_id = ? AND status = 'completed' AND form_score IS NOT NULL
        ORDER BY start_time DESC LIMIT 5`,
      [userId]
    );
  } catch (e) {
    if (!isMissingSchema(e)) throw e;
  }
  return {
    sessions: Number(count?.n || 0),
    sessionDates: dates.map((r) => r.d),
    ratings: ratings.map((r) => Number(r.r)),
    formScores: forms.map((r) => Number(r.f)),
  };
}

async function loadUserLevel(userId) {
  try {
    const [[row]] = await db.execute('SELECT progression_level, progression_seen FROM users WHERE id = ?', [userId]);
    if (!row) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    return { stored: Number(row.progression_level) || 1, seen: Number(row.progression_seen) || 1 };
  } catch (e) {
    if (isMissingSchema(e)) throw NEEDS_MIGRATION();
    throw e;
  }
}

async function isSelfAdvanced(userId) {
  try {
    const [[g]] = await db.execute(
      `SELECT experience_level FROM fitness_goals WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`,
      [userId]
    );
    return g?.experience_level === 'ADVANCED';
  } catch {
    return false;
  }
}

async function loadExclusions(userId) {
  try {
    const prefs = await require('./trainingPrefs.service').get(userId);
    return new Set(prefs?.excludedCategories || []);
  } catch {
    return new Set();
  }
}

/** Evaluate + persist a newly earned level. Returns { result, seen }. */
async function computeLevel(userId) {
  const { stored, seen } = await loadUserLevel(userId);
  const [stats, selfAdvanced] = await Promise.all([collectStats(userId), isSelfAdvanced(userId)]);
  const result = evaluate(stats, { storedLevel: stored, selfAdvanced });
  if (result.level > stored) {
    await db.execute('UPDATE users SET progression_level = GREATEST(progression_level, ?) WHERE id = ?', [result.level, userId]);
  }
  return { result, seen, selfAdvanced };
}

/** Current level only (for gating). */
async function currentLevel(userId) {
  return (await computeLevel(userId)).result.level;
}

async function loadCompleted(userId) {
  try {
    const [rows] = await db.execute(
      'SELECT challenge_key, best_value, completed_at FROM user_challenges WHERE user_id = ?',
      [userId]
    );
    return new Map(rows.map((r) => [r.challenge_key, r]));
  } catch (e) {
    if (isMissingSchema(e)) return new Map();
    throw e;
  }
}

function challengeView(c, level, done, excluded) {
  const blockedBy = c.flags.filter((f) => excluded.has(f));
  return {
    key: c.key, level: c.level, name: c.name, description: c.description, icon: c.icon,
    mode: c.mode, target: c.target, sets: c.sets ?? null, reps: c.reps ?? null, exerciseId: c.exerciseId,
    unlocked: level >= c.level,
    completed: Boolean(done),
    bestValue: done ? Number(done.best_value) || null : null,
    completedAt: done ? done.completed_at : null,
    blockedBy,
  };
}

async function getProgression(userId) {
  const { result, seen, selfAdvanced } = await computeLevel(userId);
  const [completed, excluded] = await Promise.all([loadCompleted(userId), loadExclusions(userId)]);
  const newlyUnlocked = result.levels.filter((l) => l.level > seen && l.level <= result.level).map((l) => ({ level: l.level, name: l.name, unlocks: l.unlocks }));
  return {
    ...result,
    seenLevel: seen,
    celebrate: newlyUnlocked.length > 0,
    newlyUnlocked,
    selfAdvanced,
    challenges: CHALLENGES.map((c) => challengeView(c, result.level, completed.get(c.key), excluded)),
  };
}

async function markSeen(userId) {
  try {
    await db.execute('UPDATE users SET progression_seen = GREATEST(progression_seen, progression_level) WHERE id = ?', [userId]);
  } catch (e) {
    if (isMissingSchema(e)) throw NEEDS_MIGRATION();
    throw e;
  }
  return { ok: true };
}

/**
 * Verify a challenge against a completed workout log of this user.
 * @returns {{ completed: boolean, achieved: number, target: number, firstTime?: boolean }}
 */
async function completeChallenge(userId, key, workoutLogId) {
  const challenge = getChallenge(key);
  if (!challenge) throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND');
  const level = await currentLevel(userId);
  if (level < challenge.level) {
    throw new AppError(`Reach Level ${challenge.level} to take this challenge`, 403, 'LEVEL_LOCKED', { requiredLevel: challenge.level });
  }
  const excluded = await loadExclusions(userId);
  if (challenge.flags.some((f) => excluded.has(f))) {
    throw new AppError('This challenge conflicts with your exercise exclusions', 409, 'CHALLENGE_EXCLUDED');
  }

  const [[log]] = await db.execute(
    `SELECT id, workout_type, status, rep_count, duration_seconds,
            TIMESTAMPDIFF(HOUR, end_time, NOW()) AS age_hours
       FROM workout_logs WHERE id = ? AND user_id = ?`,
    [workoutLogId, userId]
  );
  if (!log) throw new AppError('Workout not found', 404, 'WORKOUT_NOT_FOUND');
  if (log.status !== 'completed') throw new AppError('Finish the workout first', 409, 'SESSION_NOT_COMPLETED');
  if (log.age_hours === null || Number(log.age_hours) > CHALLENGE_MAX_AGE_HOURS) {
    throw new AppError('Use a workout from the last 24 hours', 409, 'WORKOUT_TOO_OLD');
  }
  if (!challenge.workoutTypes.includes(String(log.workout_type || '').toLowerCase())) {
    throw new AppError(`This workout wasn't ${challenge.name.toLowerCase()}`, 409, 'WRONG_EXERCISE');
  }

  const duration = Number(log.duration_seconds) || 0;
  let achieved;
  if (challenge.mode === 'hold') {
    const [[held]] = await db.execute(
      'SELECT COALESCE(SUM(duration_seconds), 0) AS s FROM workout_sets WHERE workout_log_id = ? AND user_id = ?',
      [log.id, userId]
    );
    // Held time can't exceed the session's real (unpaused) length.
    achieved = Math.min(Number(held?.s) || 0, duration);
  } else {
    // ≥ 1 s per rep: anything faster isn't a real rep.
    achieved = Math.min(Number(log.rep_count) || 0, duration);
  }
  if (achieved < challenge.target) return { completed: false, achieved, target: challenge.target };

  let firstTime = true;
  try {
    const [res] = await db.execute(
      `INSERT INTO user_challenges (user_id, challenge_key, workout_log_id, best_value)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE best_value = GREATEST(COALESCE(best_value, 0), VALUES(best_value))`,
      [userId, challenge.key, log.id, achieved]
    );
    // affectedRows: 1 = inserted, 2 = updated, 0 = unchanged.
    firstTime = Number(res?.affectedRows) === 1;
  } catch (e) {
    if (isMissingSchema(e)) throw NEEDS_MIGRATION();
    throw e;
  }
  return { completed: true, achieved, target: challenge.target, firstTime };
}

/**
 * Gate for starting a curated plan. Users already enrolled are never
 * blocked. Pre-migration (no level columns) nothing is locked.
 */
async function assertCanStartPlan(userId, plan) {
  const required = requiredLevelForPlan(plan);
  if (required <= 1) return;
  let level;
  try {
    level = await currentLevel(userId);
  } catch (e) {
    if (e?.code === 'NEEDS_MIGRATION_061') return;
    throw e;
  }
  if (level < required) {
    const name = LEVELS.find((l) => l.level === required)?.name || `Level ${required}`;
    throw new AppError(`Unlock Level ${required} (${name}) to start this plan`, 403, 'LEVEL_LOCKED', { requiredLevel: required });
  }
}

module.exports = {
  collectStats, getProgression, markSeen, completeChallenge, currentLevel, assertCanStartPlan,
};
