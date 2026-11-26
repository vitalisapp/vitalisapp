const activityService = require('../services/activity.service');

async function save(req, res, next) {
  try {
    const userId = req.user.id;
    const { duration, distance, pace, calories, route, is_gps, local_date } = req.body || {};
    // `calories` from the browser is a rough live counter — validate it for
    // shape but NEVER store it as measured. Only `measured_calories` (device /
    // user entered) is authoritative.
    const measured_calories = req.body?.measured_calories;
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
    const measured = measured_calories == null ? null : num(measured_calories, 0, 3000);
    if ((d !== null && Number.isNaN(d)) || (dist !== null && Number.isNaN(dist))
      || (cal !== null && Number.isNaN(cal)) || (measured !== null && Number.isNaN(measured))) {
      return res.status(400).json({ error: 'Invalid activity values. Duration 0–86400s, distance 0–1000km, calories 0–20000, measured calories 0–3000.' });
    }
    // GPS-glitch guard: avg speed over 50 km/h is bad data, not a workout.
    if (d != null && dist != null && d > 0 && dist > 0 && !activityService.isPlausibleActivity(d, dist)) {
      return res.status(400).json({ error: 'Distance is implausible for this duration (avg speed over 50 km/h). Check GPS data and try again.' });
    }
    // Long routes are downsampled server-side (service) — never 413 them.
    if (pace != null && String(pace).length > 32) {
      return res.status(400).json({ error: 'Invalid pace value (max 32 chars).' });
    }
    const saved = await activityService.saveActivity(userId, { duration: d, distance: dist, pace, route, is_gps, measured_calories: measured, local_date });
    res.json({ success: true, message: 'Activity saved successfully', id: saved.id, calories: saved.calories, calories_source: saved.calories_source });
  } catch (err) { next(err); }
}

// PATCH /api/activity/:id — Revision #7 edit (duration s, distance km, optional measured kcal).
async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid activity id' });
    const { duration, distance, measured_calories } = req.body || {};
    const bad = (v, max) => v != null && v !== '' && (!Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > max);
    if (bad(duration, 86400) || bad(distance, 1000) || bad(measured_calories, 3000)) {
      return res.status(400).json({ error: 'Invalid values. Duration 0–86400s, distance 0–1000km, calories 0–3000.' });
    }
    if (duration != null && distance != null && !activityService.isPlausibleActivity(Number(duration), Number(distance))) {
      return res.status(400).json({ error: 'Distance is implausible for this duration (avg speed over 50 km/h).' });
    }
    const updated = await activityService.updateActivity(id, req.user.id, { duration, distance, measured_calories });
    if (!updated) return res.status(404).json({ error: 'Activity not found' });
    res.json({ success: true, activity: updated });
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

module.exports = { save, stats, detail, list, remove, toggleKudos, update };
