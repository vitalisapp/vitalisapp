const activityService = require('../services/activity.service');

async function save(req, res, next) {
  try {
    const userId = req.user.id;
    const { duration, distance, pace, calories, route, is_gps } = req.body || {};
    if (duration == null && distance == null && calories == null) {
      return res.status(400).json({ error: 'At least one of duration, distance, calories is required' });
    }
    const num = (v, min, max) => {
      if (v == null) return null;
      const n = Number(v);
      if (!Number.isFinite(n) || n < min || n > max) return NaN;
      return n;
    };
    const d = duration == null ? null : num(duration, 0, 86400);
    const dist = distance == null ? null : num(distance, 0, 1000);
    const cal = calories == null ? null : num(calories, 0, 20000);
    if ((d !== null && Number.isNaN(d)) || (dist !== null && Number.isNaN(dist)) || (cal !== null && Number.isNaN(cal))) {
      return res.status(400).json({ error: 'Invalid activity values (out of range). Duration 0–86400s, distance 0–1000km, calories 0–20000.' });
    }
    // GPS-glitch guard: avg speed over 50 km/h is bad data, not a workout.
    if (d != null && dist != null && d > 0 && dist > 0 && !activityService.isPlausibleActivity(d, dist)) {
      return res.status(400).json({ error: 'Distance is implausible for this duration (avg speed over 50 km/h). Check GPS data and try again.' });
    }
    // Long routes are downsampled server-side (service) — never 413 them.
    if (pace != null && String(pace).length > 32) {
      return res.status(400).json({ error: 'Invalid pace value (max 32 chars).' });
    }
    const saved = await activityService.saveActivity(userId, { duration: d, distance: dist, pace, calories: cal, route, is_gps });
    res.json({ success: true, message: 'Activity saved successfully', id: saved.id });
  } catch (err) { next(err); }
}

async function stats(req, res, next) {
  try {
    const { userId } = req.params;
    if (String(req.user.id) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });
    const data = await activityService.getStats(userId);
    res.json(data);
  } catch (err) { next(err); }
}

async function detail(req, res, next) {
  try {
    const { id } = req.params;
    const activity = await activityService.getDetail(id, req.user.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json(activity);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const { userId } = req.params;
    if (String(req.user.id) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });
    const activities = await activityService.getAllForUser(userId);
    res.json(activities);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await activityService.deleteActivity(id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json({ success: true, message: 'Activity deleted' });
  } catch (err) { next(err); }
}

async function toggleKudos(req, res, next) {
  try {
    const { id } = req.params;
    const result = await activityService.toggleKudos(id, req.user.id);
    if (!result) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

module.exports = { save, stats, detail, list, remove, toggleKudos };
