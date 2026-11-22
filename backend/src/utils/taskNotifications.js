// utils/taskNotifications.js — in-app notifications for completed tasks.
//
// One notification per finished task, each with its own category so the UI
// can color it (see frontend notificationPresentation.js):
//   TRAINING  — workout completed (camera or manual)
//   ACTIVITY  — GPS / manual activity saved (runs, walks, rides)
//   NUTRITION — meal logged (with today's running totals)
//   PROGRESS  — weigh-in, body measurements, progress photo
// Message builders are pure (unit-tested); notifyTask() is fire-and-forget:
// a failed notification must never fail the save that triggered it.

const round1 = (n) => Math.round(Number(n) * 10) / 10;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function fmtMinutes(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/** Workout finished. Returns null for empty sessions (no reps and < 1 min). */
function workoutMessage({ workout_type, rep_count, duration_seconds }, { manual = false } = {}) {
  const reps = Math.max(0, Number(rep_count) || 0);
  const secs = Math.max(0, Number(duration_seconds) || 0);
  if (reps === 0 && secs < 60) return null;
  const parts = [String(workout_type || 'Workout').trim() || 'Workout'];
  if (secs > 0) parts.push(fmtMinutes(secs));
  if (reps > 0) parts.push(plural(reps, 'rep'));
  return `${manual ? 'Workout logged' : 'Workout complete'}: ${parts.join(' · ')}. Nice work.`;
}

/** Activity saved (duration in seconds, distance in km). Null when empty. */
function activityMessage({ duration, distance, pace, calories }) {
  const km = Math.max(0, Number(distance) || 0);
  const secs = Math.max(0, Number(duration) || 0);
  if (km <= 0 && secs <= 0) return null;
  const parts = [];
  if (km > 0) parts.push(`${km >= 10 ? round1(km) : Math.round(km * 100) / 100} km`);
  if (secs > 0) parts.push(`in ${fmtMinutes(secs)}`);
  const tail = [];
  if (pace && String(pace).trim() && String(pace) !== '0:00') tail.push(`pace ${String(pace).trim()}/km`);
  if (Number(calories) > 0) tail.push(`${Math.round(calories)} kcal`);
  return `Activity saved: ${parts.join(' ')}${tail.length ? ` (${tail.join(', ')})` : ''}.`;
}

/** Weigh-in saved; `previousKg` is the prior reading (or null). */
function weighInMessage(weightKg, previousKg) {
  const kg = round1(weightKg);
  if (!Number.isFinite(kg) || kg <= 0) return null;
  const prev = Number(previousKg);
  if (Number.isFinite(prev) && prev > 0) {
    const d = round1(kg - prev);
    const change = d === 0 ? 'no change since last time' : `${d > 0 ? '+' : ''}${d} kg since last time`;
    return `Weigh-in saved: ${kg} kg (${change}).`;
  }
  return `Weigh-in saved: ${kg} kg. Log again next week to see your trend.`;
}

const MEASURE_LABELS = { body_fat_pct: 'body fat', waist_cm: 'waist', chest_cm: 'chest', hips_cm: 'hips', arm_cm: 'arm', thigh_cm: 'thigh' };
function measurementMessage(fields = {}) {
  const parts = [];
  if (fields.weight_kg != null) parts.push(`weight ${round1(fields.weight_kg)} kg`);
  for (const [key, label] of Object.entries(MEASURE_LABELS)) {
    if (fields[key] != null) parts.push(`${label} ${round1(fields[key])}${key === 'body_fat_pct' ? '%' : ' cm'}`);
  }
  if (!parts.length) return null;
  return `Measurements saved: ${parts.slice(0, 4).join(', ')}${parts.length > 4 ? ` +${parts.length - 4} more` : ''}.`;
}

function photoMessage(pose) {
  const view = ['front', 'side', 'back'].includes(pose) ? `${pose} view` : 'photo';
  return `Progress photo saved (${view}). Compare it with your next check-in to see the change.`;
}

/** Fire-and-forget delivery through the shared notifier (DB row + live push). */
function notifyTask(userId, { category, message, type = 'success' }) {
  if (!userId || !message) return;
  try {
    // Lazy require: controllers depend on services, not the other way round
    // at load time (avoids a require cycle).
    const { notifyUser } = require('../controllers/notification.controller');
    Promise.resolve(notifyUser(userId, { message, type, category, source: 'task' })).catch(() => {});
  } catch (_) { /* notifications are best-effort */ }
}

module.exports = {
  fmtMinutes,
  workoutMessage,
  activityMessage,
  weighInMessage,
  measurementMessage,
  photoMessage,
  notifyTask,
};
