// Section 5 — reminder settings + test send (thin controller).
const service = require('../services/reminder.service');
const { KINDS } = require('../utils/reminderRules');

const KIND_LABELS = {
  no_log: 'Forgot to log',
  missed_workout: 'Missed workout',
  inactive: 'Keep moving',
  motivation: 'Motivation',
  progress: 'Weekly progress',
};

async function getPrefs(req, res, next) {
  try {
    res.json({
      prefs: await service.getPrefs(req.user.id),
      timeZone: service.TZ,
      kinds: Object.keys(KIND_LABELS).map((k) => ({ key: k, label: KIND_LABELS[k], hour: KINDS[k].hour })),
    });
  } catch (e) { next(e); }
}

async function putPrefs(req, res, next) {
  try {
    res.json({ prefs: await service.savePrefs(req.user.id, req.body || {}) });
  } catch (e) { next(e); }
}

async function postTest(req, res, next) {
  try {
    res.json(await service.sendTest(req.user.id, String(req.body?.kind || '')));
  } catch (e) { next(e); }
}

// Admin: run the scheduler now, optionally pretending it is a given hour /
// weekday (for demonstrations). Sends stay idempotent per user per day.
async function postAdminRun(req, res, next) {
  try {
    const hour = req.body?.hour == null ? undefined : Number(req.body.hour);
    const weekday = req.body?.weekday == null ? undefined : Number(req.body.weekday);
    if (hour !== undefined && !(Number.isInteger(hour) && hour >= 0 && hour <= 23)) return res.status(400).json({ error: 'hour must be 0–23' });
    if (weekday !== undefined && !(Number.isInteger(weekday) && weekday >= 0 && weekday <= 6)) return res.status(400).json({ error: 'weekday must be 0 (Sun) – 6 (Sat)' });
    const userIds = Array.isArray(req.body?.userIds) ? req.body.userIds : undefined;
    res.json(await service.runOnce({ hour, weekday, userIds }));
  } catch (e) { next(e); }
}

module.exports = { getPrefs, putPrefs, postTest, postAdminRun };
