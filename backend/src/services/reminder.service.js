// Smart reminders (Section 5) — data + sending. Rules: utils/reminderRules.js.
//
// Channels: in-app notification (persisted + live SSE push) for every kind,
// plus ONE weekly progress email (Sunday 18:00). Idempotency: a reminder_log
// row is inserted before sending; the UNIQUE key blocks duplicates.
const db = require('../config/db');
const { AppError } = require('../utils/errors');
const rules = require('../utils/reminderRules');

const TZ = process.env.REMINDER_TZ || 'Asia/Manila';
const SOURCE = 'reminder';

function isMissingSchema(e) {
  return e && (e.errno === 1146 || e.errno === 1054);
}

function firstName(name) {
  const n = String(name || '').trim().split(/\s+/)[0];
  return n ? n[0].toUpperCase() + n.slice(1) : 'there';
}

// ── Preferences ────────────────────────────────────────────────────────────
async function getPrefs(userId) {
  try {
    const [[row]] = await db.execute(
      'SELECT log_reminders, workout_reminders, motivation, progress, email_weekly FROM reminder_prefs WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (!row) return { ...rules.DEFAULT_PREFS };
    return Object.fromEntries(rules.PREF_KEYS.map((k) => [k, Boolean(row[k])]));
  } catch (e) {
    if (isMissingSchema(e)) return { ...rules.DEFAULT_PREFS };
    throw e;
  }
}

async function savePrefs(userId, body = {}) {
  const current = await getPrefs(userId);
  const next = { ...current };
  for (const k of rules.PREF_KEYS) {
    if (body[k] === undefined) continue;
    if (typeof body[k] !== 'boolean') throw new AppError(`"${k}" must be on or off.`, 400, 'INVALID_REMINDER_PREF');
    next[k] = body[k];
  }
  try {
    await db.execute(
      `INSERT INTO reminder_prefs (user_id, log_reminders, workout_reminders, motivation, progress, email_weekly)
         VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE log_reminders = VALUES(log_reminders), workout_reminders = VALUES(workout_reminders),
         motivation = VALUES(motivation), progress = VALUES(progress), email_weekly = VALUES(email_weekly)`,
      [userId, ...rules.PREF_KEYS.map((k) => (next[k] ? 1 : 0))]
    );
  } catch (e) {
    if (isMissingSchema(e)) throw new AppError('Reminder settings need migration 052 — run npm run db:migrate', 503, 'NEEDS_MIGRATION_052');
    throw e;
  }
  return next;
}

// ── Context for one user ───────────────────────────────────────────────────
async function reminderHistory(userId, today) {
  try {
    const [rows] = await db.execute(
      `SELECT kind, channel, DATE_FORMAT(sent_on, '%Y-%m-%d') AS d, variant, DATEDIFF(?, sent_on) AS days_ago
         FROM reminder_log WHERE user_id = ? AND sent_on >= DATE_SUB(?, INTERVAL 30 DAY)
        ORDER BY sent_on DESC, id DESC`,
      [today, userId, today]
    );
    const lastSent = {};
    let sentToday = 0;
    let lastEmailDaysAgo = null;
    for (const r of rows) {
      if (r.channel === 'email') {
        if (lastEmailDaysAgo == null) lastEmailDaysAgo = Number(r.days_ago);
        continue;
      }
      if (r.d === today) sentToday += 1;
      if (!lastSent[r.kind]) lastSent[r.kind] = { daysAgo: Number(r.days_ago), variant: r.variant == null ? null : Number(r.variant) };
    }
    return { lastSent, sentToday, lastEmailDaysAgo };
  } catch (e) {
    if (isMissingSchema(e)) return null; // pre-052: scheduler stays idle
    throw e;
  }
}

async function activityFacts(userId, today) {
  const [[counts]] = await db.execute(
    `SELECT
       (SELECT COUNT(*) FROM food_logs WHERE user_id = ? AND DATE(logged_at) = ?) AS food,
       (SELECT COUNT(*) FROM workout_logs WHERE user_id = ? AND DATE(start_time) = ? AND status <> 'cancelled') AS work,
       (SELECT COUNT(*) FROM bmi_records WHERE user_id = ? AND DATE(recorded_at) = ?) AS weigh,
       (SELECT DATEDIFF(?, MAX(DATE(start_time))) FROM workout_logs WHERE user_id = ? AND status = 'completed') AS since_workout,
       (SELECT COUNT(DISTINCT DATE(start_time)) FROM workout_logs
          WHERE user_id = ? AND status = 'completed' AND DATE(start_time) > DATE_SUB(?, INTERVAL 7 DAY)) AS week_days`,
    [userId, today, userId, today, userId, today, today, userId, userId, today]
  );
  const [days] = await db.execute(
    `SELECT DISTINCT DATE_FORMAT(start_time, '%Y-%m-%d') AS d FROM workout_logs
      WHERE user_id = ? AND status = 'completed' AND start_time >= DATE_SUB(?, INTERVAL 14 DAY)
      ORDER BY d DESC`,
    [userId, today]
  );
  let since = null;
  try {
    const [[act]] = await db.execute(
      `SELECT DATEDIFF(?, GREATEST(
          COALESCE((SELECT MAX(created_at) FROM user_sessions WHERE user_id = ?), '1970-01-01'),
          COALESCE((SELECT MAX(logged_at) FROM food_logs WHERE user_id = ?), '1970-01-01'),
          COALESCE((SELECT MAX(start_time) FROM workout_logs WHERE user_id = ?), '1970-01-01'),
          COALESCE((SELECT created_at FROM users WHERE id = ?), '1970-01-01')
        )) AS since`,
      [today, userId, userId, userId, userId]
    );
    since = act?.since == null ? null : Number(act.since);
  } catch { since = null; }
  return {
    loggedToday: Number(counts.food) + Number(counts.work) + Number(counts.weigh),
    workoutDoneToday: Number(counts.work) > 0,
    daysSinceWorkout: counts.since_workout == null ? null : Number(counts.since_workout),
    workoutsThisWeek: Number(counts.week_days) || 0,
    streak: streakFrom(days.map((r) => r.d), today),
    daysSinceActive: since,
  };
}

function streakFrom(dates, today) {
  const set = new Set(dates);
  const shift = (iso, n) => {
    const [y, m, d] = iso.split('-').map(Number);
    const x = new Date(Date.UTC(y, m - 1, d + n));
    return x.toISOString().slice(0, 10);
  };
  let cursor = set.has(today) ? today : shift(today, -1);
  let n = 0;
  while (set.has(cursor)) { n += 1; cursor = shift(cursor, -1); }
  return n;
}

async function unreadReminderCount(userId) {
  try {
    const [[r]] = await db.execute(
      'SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0 AND source = ?',
      [userId, SOURCE]
    );
    return Number(r.n) || 0;
  } catch (e) {
    if (isMissingSchema(e)) return 0;
    throw e;
  }
}

// Today's planned workout from the Section 4 coach (only checked in the
// missed-workout window; it is the most expensive lookup).
async function todaysWorkout(userId, zonedNow) {
  try {
    const week = await require('./coachPlan.service').computeWeek(userId, zonedNow);
    if (week.state !== 'ok' || !week.todayEntry) return { planned: false, done: false };
    const e = week.todayEntry;
    return { planned: e.kind === 'workout', done: e.status === 'done', title: e.title };
  } catch {
    return { planned: false, done: false };
  }
}

/** A Date whose local fields equal the wall clock in TZ (for date maths). */
function zonedDate(now, parts) {
  const [y, m, d] = parts.date.split('-').map(Number);
  return new Date(y, m - 1, d, parts.hour, now.getMinutes());
}

// ── Sending ────────────────────────────────────────────────────────────────
async function claim(userId, kind, channel, day, variant) {
  try {
    await db.execute(
      'INSERT INTO reminder_log (user_id, kind, channel, sent_on, variant) VALUES (?, ?, ?, ?, ?)',
      [userId, kind, channel, day, variant]
    );
    return true;
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return false;
    throw e;
  }
}

async function unclaim(userId, kind, channel, day) {
  try {
    await db.execute('DELETE FROM reminder_log WHERE user_id = ? AND kind = ? AND channel = ? AND sent_on = ?', [userId, kind, channel, day]);
  } catch { /* best effort */ }
}

function notify(userId, r) {
  const { notifyUser } = require('../controllers/notification.controller');
  return notifyUser(userId, { message: r.message, type: r.type, category: r.category, source: SOURCE });
}

async function weeklyStats(user, today, goalType) {
  const [[w]] = await db.execute(
    `SELECT COUNT(DISTINCT DATE(start_time)) AS workouts,
            COALESCE(SUM(GREATEST(0, COALESCE(duration_seconds, 0) - COALESCE(paused_seconds, 0))), 0) AS secs
       FROM workout_logs WHERE user_id = ? AND status = 'completed'
        AND DATE(start_time) > DATE_SUB(?, INTERVAL 7 DAY) AND DATE(start_time) <= ?`,
    [user.id, today, today]
  );
  const [[l]] = await db.execute(
    `SELECT COUNT(*) AS n FROM (
        SELECT DATE(logged_at) AS d FROM food_logs WHERE user_id = ? AND DATE(logged_at) > DATE_SUB(?, INTERVAL 7 DAY)
        UNION SELECT DATE(start_time) FROM workout_logs WHERE user_id = ? AND DATE(start_time) > DATE_SUB(?, INTERVAL 7 DAY)
     ) t`,
    [user.id, today, user.id, today]
  );
  const [weights] = await db.execute(
    `SELECT weight_kg FROM bmi_records WHERE user_id = ? AND weight_kg > 0
        AND DATE(recorded_at) > DATE_SUB(?, INTERVAL 7 DAY) ORDER BY recorded_at ASC`,
    [user.id, today]
  );
  let planned = null;
  try {
    const week = await require('./coachPlan.service').computeWeek(user.id);
    if (week.state === 'ok') planned = week.week.filter((e) => e.kind === 'workout').length;
  } catch { planned = null; }
  const weightChangeKg = weights.length >= 2
    ? Math.round((Number(weights[weights.length - 1].weight_kg) - Number(weights[0].weight_kg)) * 10) / 10
    : null;
  const stats = {
    workouts: Number(w.workouts) || 0,
    minutes: Math.round((Number(w.secs) || 0) / 60),
    planned,
    logDays: Math.min(7, Number(l.n) || 0),
    weightChangeKg,
  };
  const { interpretWeek } = require('../emails');
  return { stats, interpretation: interpretWeek({ ...stats, goalType }) };
}

async function sendWeeklyEmail(user, today) {
  const { mailConfigured } = require('../config/mailer');
  if (!mailConfigured()) return false;
  if (!(await claim(user.id, 'weekly_email', 'email', today, null))) return false;
  try {
    const { stats, interpretation } = await weeklyStats(user, today, user.goal_type);
    await require('./email.service').sendWeeklyProgressEmail(user.email, { name: user.name, stats, interpretation });
    return true;
  } catch (e) {
    await unclaim(user.id, 'weekly_email', 'email', today); // retry on the next run
    console.warn('[reminders] weekly email failed for user', user.id, e.message);
    return false;
  }
}

/**
 * One scheduler pass. Safe to call repeatedly: every send is idempotent.
 * @param {object} [opts]
 * @param {Date} [opts.now]
 * @param {number} [opts.hour]      override local hour (admin demo)
 * @param {number} [opts.weekday]   override local weekday (admin demo)
 * @param {number[]} [opts.userIds] limit to these users
 */
async function runOnce(opts = {}) {
  const now = opts.now || new Date();
  const parts = rules.zonedParts(now, TZ);
  const hour = opts.hour ?? parts.hour;
  const weekday = opts.weekday ?? parts.weekday;
  const today = parts.date;
  const summary = { today, hour, weekday, users: 0, inApp: 0, emails: 0, byKind: {} };

  const windows = new Set(Object.values(rules.KINDS).map((k) => k.hour));
  const emailWindow = weekday === 0 && hour === 18;
  if (!windows.has(hour) && !emailWindow) return summary;
  if (rules.isQuietHour(hour)) return summary;

  let users;
  try {
    const ids = Array.isArray(opts.userIds) && opts.userIds.length ? opts.userIds.map(Number).filter(Boolean) : null;
    [users] = await db.query(
      `SELECT u.id, u.name, u.email, u.is_verified,
              (SELECT g.goal_type FROM fitness_goals g WHERE g.user_id = u.id AND g.status = 'active' ORDER BY g.id DESC LIMIT 1) AS goal_type
         FROM users u
        WHERE u.role = 'member' AND u.status = 'active' AND u.onboarding_completed = 1
          ${ids ? 'AND u.id IN (?)' : ''}
        ORDER BY u.id`,
      ids ? [ids] : []
    );
  } catch (e) {
    console.warn('[reminders] user query failed:', e.message);
    return summary;
  }

  const zonedNow = zonedDate(now, { ...parts, hour });
  for (const user of users) {
    try {
      const history = await reminderHistory(user.id, today);
      if (!history) return summary; // migration 052 not applied
      summary.users += 1;
      const prefs = await getPrefs(user.id);
      const facts = await activityFacts(user.id, today);
      const workout = hour === rules.KINDS.missed_workout.hour ? await todaysWorkout(user.id, zonedNow) : { planned: false, done: false };

      const due = rules.dueReminders({
        hour,
        weekday,
        name: firstName(user.name),
        prefs,
        ...facts,
        workoutPlannedToday: workout.planned,
        workoutDoneToday: workout.done || facts.workoutDoneToday,
        workout: workout.title,
        sentToday: history.sentToday,
        unreadReminders: await unreadReminderCount(user.id),
        lastSent: history.lastSent,
      });
      for (const r of due) {
        if (!(await claim(user.id, r.kind, 'inapp', today, r.variant))) continue;
        if (await notify(user.id, r)) {
          summary.inApp += 1;
          summary.byKind[r.kind] = (summary.byKind[r.kind] || 0) + 1;
        } else {
          await unclaim(user.id, r.kind, 'inapp', today);
        }
      }

      if (rules.weeklyEmailDue({
        hour, weekday, prefs,
        emailVerified: Boolean(user.is_verified),
        daysSinceActive: facts.daysSinceActive,
        lastSentDaysAgo: history.lastEmailDaysAgo,
      }) && (await sendWeeklyEmail(user, today))) {
        summary.emails += 1;
      }
    } catch (e) {
      console.warn('[reminders] user', user.id, 'skipped:', e.message);
    }
  }
  return summary;
}

/** Send one sample reminder right now (Preferences "Send me a test"). Not logged as a scheduled send. */
async function sendTest(userId, kind) {
  const k = rules.KINDS[kind];
  if (!k) throw new AppError('Choose a reminder type to test.', 400, 'INVALID_REMINDER_KIND');
  const [[user]] = await db.execute('SELECT name FROM users WHERE id = ? LIMIT 1', [userId]);
  const message = k.variants[0]({
    name: firstName(user?.name), workout: 'your workout', daysSinceWorkout: 3, streak: 3, workoutsThisWeek: 2,
  });
  const { notifyUser } = require('../controllers/notification.controller');
  await notifyUser(userId, { message, type: k.type, category: k.category });
  return { kind, message };
}

module.exports = { TZ, getPrefs, savePrefs, runOnce, sendTest, streakFrom };
