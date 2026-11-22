// utils/activityStatus.js — Section 10: color-coded user activity monitoring.
// Pure (no DB): admin.service gathers per-user signals, this file decides the
// status and the attention flags. Every threshold lives in CRITERIA so the
// rules shown in the admin UI and the rules applied here can never drift.

const CRITERIA = Object.freeze({
  windowDays: 7,            // GREEN is judged on the last 7 days (today included)
  inactiveDays: 14,         // RED: no activity of any kind for 14+ days
  newAccountDays: 7,        // accounts younger than this are never RED
  minWorkouts: 2,           // default weekly workouts for GREEN…
  maxPlannedWorkouts: 3,    // …or the user's planned training days, capped at 3
  minMealDays: 4,           // days with at least one meal logged, out of 7
  weighInDays: 30,          // a weigh-in / measurement within 30 days
  rapidChangeKgPerWeek: 1,  // unusual: sustained change faster than 1 kg/week
  rapidChangeWindowDays: 28,
  jumpKg: 3,                // unusual: ≥3 kg between weigh-ins ≤7 days apart
  jumpWithinDays: 7,
  lowIntakeKcal: 1000,      // unusual: average logged intake below 1000 kcal/day
  lowIntakeMinDays: 3,      // …only judged with at least 3 logged days
});

const STATUS = Object.freeze({ GREEN: 'green', YELLOW: 'yellow', RED: 'red' });

// Flag catalogue: key → { group, label }. Groups match the checklist wording:
// inactive users, missing records, unusual progress patterns.
const FLAGS = Object.freeze({
  inactive:        { group: 'inactive', label: 'Inactive' },
  never_active:    { group: 'inactive', label: 'No activity since sign-up' },
  no_workouts:     { group: 'missing',  label: 'No workouts this week' },
  few_workouts:    { group: 'missing',  label: 'Below planned workouts' },
  no_meals:        { group: 'missing',  label: 'No meals logged this week' },
  few_meals:       { group: 'missing',  label: 'Incomplete meal logs' },
  no_weigh_in:     { group: 'missing',  label: 'No weigh-in in 30 days' },
  rapid_change:    { group: 'unusual',  label: 'Rapid weight change' },
  weight_jump:     { group: 'unusual',  label: 'Sudden weight jump' },
  low_intake:      { group: 'unusual',  label: 'Very low calorie intake' },
});

const DAY_MS = 86400000;

function toDate(v) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(String(v).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetween(later, earlier) {
  return Math.floor((later.getTime() - earlier.getTime()) / DAY_MS);
}

/** Planned weekly workouts from training_preferences.preferred_days (JSON or array). */
function plannedWorkouts(preferredDays) {
  let days = preferredDays;
  if (typeof days === 'string') {
    try { days = JSON.parse(days); } catch { days = null; }
  }
  const n = Array.isArray(days) ? new Set(days.filter((d) => Number.isInteger(Number(d)))).size : 0;
  if (n <= 0) return CRITERIA.minWorkouts;
  return Math.min(n, CRITERIA.maxPlannedWorkouts);
}

/**
 * Weight-based unusual-pattern flags.
 * @param {{date: string|Date, kg: number}[]} weights any order
 */
function weightFlags(weights, now) {
  const pts = (weights || [])
    .map((w) => ({ at: toDate(w.date), kg: Number(w.kg) }))
    .filter((w) => w.at && Number.isFinite(w.kg) && w.kg > 0)
    .sort((a, b) => a.at - b.at);
  const flags = [];
  const details = {};

  // Sudden jump between two close weigh-ins (often a typo: 72 → 27, or lb vs kg).
  for (let i = 1; i < pts.length; i += 1) {
    const gap = (pts[i].at - pts[i - 1].at) / DAY_MS;
    const diff = Math.abs(pts[i].kg - pts[i - 1].kg);
    if (gap <= CRITERIA.jumpWithinDays && diff >= CRITERIA.jumpKg) {
      flags.push('weight_jump');
      details.weight_jump = `${pts[i - 1].kg} → ${pts[i].kg} kg in ${Math.max(1, Math.round(gap))} day(s)`;
      break;
    }
  }

  // Sustained rate over the recent window (needs ≥7 days of spread to be fair).
  const since = new Date(now.getTime() - CRITERIA.rapidChangeWindowDays * DAY_MS);
  const recent = pts.filter((p) => p.at >= since);
  if (recent.length >= 2) {
    const first = recent[0];
    const last = recent[recent.length - 1];
    const spanDays = (last.at - first.at) / DAY_MS;
    if (spanDays >= 7) {
      const perWeek = ((last.kg - first.kg) / spanDays) * 7;
      if (Math.abs(perWeek) > CRITERIA.rapidChangeKgPerWeek) {
        flags.push('rapid_change');
        details.rapid_change = `${perWeek > 0 ? '+' : ''}${perWeek.toFixed(1)} kg/week over ${Math.round(spanDays)} days`;
      }
    }
  }
  return { flags, details };
}

/**
 * Classify one user.
 * @param {object} s signals
 * @param {string|Date} s.createdAt
 * @param {string|Date|null} s.lastLogin, s.lastWorkout, s.lastMeal, s.lastWeighIn, s.lastPhoto
 * @param {number} s.workouts7   workouts in the last 7 days
 * @param {number} s.mealDays7   distinct days with a meal in the last 7 days
 * @param {number} s.kcal7       total logged kcal in the last 7 days
 * @param {*} s.preferredDays    training_preferences.preferred_days
 * @param {{date, kg}[]} s.weights recent weigh-ins (≈60 days)
 * @param {Date} [now]
 * @returns {{status, lastActive, daysInactive, planned, flags: {key, group, label, detail?}[], reasons: string[]}}
 */
function classifyUser(s, now = new Date()) {
  const created = toDate(s.createdAt) || now;
  const accountAgeDays = daysBetween(now, created);
  const activity = [s.lastLogin, s.lastWorkout, s.lastMeal, s.lastWeighIn, s.lastPhoto]
    .map(toDate).filter(Boolean);
  const lastActive = activity.length ? new Date(Math.max(...activity.map((d) => d.getTime()))) : null;
  const daysInactive = lastActive ? daysBetween(now, lastActive) : null;

  const workouts7 = Number(s.workouts7) || 0;
  const mealDays7 = Number(s.mealDays7) || 0;
  const kcal7 = Number(s.kcal7) || 0;
  const planned = plannedWorkouts(s.preferredDays);
  const lastWeighIn = toDate(s.lastWeighIn);
  const weighInOk = Boolean(lastWeighIn && daysBetween(now, lastWeighIn) <= CRITERIA.weighInDays);

  const keys = [];
  const detail = {};

  const isNew = accountAgeDays < CRITERIA.newAccountDays;
  const inactive = lastActive ? daysInactive >= CRITERIA.inactiveDays : !isNew;
  if (inactive) {
    if (lastActive) { keys.push('inactive'); detail.inactive = `No activity for ${daysInactive} days`; }
    else { keys.push('never_active'); detail.never_active = `Joined ${accountAgeDays} days ago, nothing logged`; }
  }

  // Missing records
  if (workouts7 === 0) keys.push('no_workouts');
  else if (workouts7 < planned) { keys.push('few_workouts'); detail.few_workouts = `${workouts7} of ${planned} planned`; }
  if (mealDays7 === 0) keys.push('no_meals');
  else if (mealDays7 < CRITERIA.minMealDays) { keys.push('few_meals'); detail.few_meals = `Meals on ${mealDays7} of 7 days`; }
  if (!weighInOk && !isNew) keys.push('no_weigh_in');

  // Unusual progress patterns
  const wf = weightFlags(s.weights, now);
  keys.push(...wf.flags);
  Object.assign(detail, wf.details);
  if (mealDays7 >= CRITERIA.lowIntakeMinDays) {
    const avg = Math.round(kcal7 / mealDays7);
    if (avg < CRITERIA.lowIntakeKcal) { keys.push('low_intake'); detail.low_intake = `Avg ${avg} kcal on logged days`; }
  }

  const meetsGreen = workouts7 >= planned && mealDays7 >= CRITERIA.minMealDays && weighInOk;
  let status;
  if (inactive) status = STATUS.RED;
  else if (meetsGreen) status = STATUS.GREEN;
  else status = STATUS.YELLOW;

  const flags = keys.map((key) => ({ key, ...FLAGS[key], ...(detail[key] ? { detail: detail[key] } : {}) }));
  const reasons = flags.map((f) => f.detail || f.label);
  return {
    status,
    lastActive: lastActive ? lastActive.toISOString() : null,
    daysInactive,
    planned,
    isNew,
    flags,
    reasons,
  };
}

/** Human-readable criteria, served with the report so the UI shows the same rules. */
function describeCriteria() {
  const c = CRITERIA;
  return {
    green: `In the last ${c.windowDays} days: at least ${c.minWorkouts} workouts (or the user's planned training days, up to ${c.maxPlannedWorkouts}), meals logged on ${c.minMealDays}+ days, and a weigh-in within ${c.weighInDays} days.`,
    yellow: `Active within the last ${c.inactiveDays} days but missing one or more GREEN rules (missed workouts, incomplete meal logs or no recent weigh-in).`,
    red: `No workout, meal, weigh-in, photo or login for ${c.inactiveDays}+ days. Accounts younger than ${c.newAccountDays} days are never RED.`,
    flags: {
      inactive: `No activity for ${c.inactiveDays}+ days.`,
      missing: `No/too few workouts or meals this week, or no weigh-in in ${c.weighInDays} days.`,
      unusual: `Weight change faster than ${c.rapidChangeKgPerWeek} kg/week, a jump of ${c.jumpKg}+ kg within ${c.jumpWithinDays} days, or average intake under ${c.lowIntakeKcal} kcal/day.`,
    },
  };
}

// ── Plain-language interpretations (Section 11) ────────────────────────────
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** One sentence an admin can read at a glance, from a classified member record. */
function interpretUser(rec, { audience = 'admin' } = {}) {
  if (!rec) return null;
  const me = audience === 'member';
  const w = rec.week || {};
  const unusual = (rec.flags || []).filter((f) => f.group === 'unusual');
  const unusualNote = unusual.length
    ? ` ${me ? 'Worth a look' : 'Also review'}: ${unusual.map((f) => (f.detail || f.label).toLowerCase()).join('; ')}.`
    : '';
  if (rec.status === STATUS.RED) {
    const days = rec.daysInactive == null ? null : plural(rec.daysInactive, 'day');
    if (me) {
      return `Inactive: ${days ? `nothing has been logged for ${days}` : 'nothing has been logged yet'}. Logging one workout or meal today gets you moving again.${unusualNote}`;
    }
    const silent = days ? `has not logged in or recorded anything for ${days}` : 'has not logged anything since signing up';
    return `Inactive: this member ${silent}. A friendly check-in or reminder is recommended.${unusualNote}`;
  }
  if (rec.status === STATUS.GREEN) {
    return `On track: ${plural(w.workouts ?? 0, 'workout')} (plan: ${w.planned ?? CRITERIA.minWorkouts}) and meals on ${w.mealDays ?? 0} of 7 days this week, with a recent weigh-in.${unusualNote}`;
  }
  const gaps = (rec.flags || []).filter((f) => f.group === 'missing').map((f) => (f.detail || f.label).toLowerCase());
  const gapText = gaps.length ? gaps.join(', ') : 'some logs are incomplete';
  return me
    ? `Needs attention: you are active, but ${gapText}.${unusualNote}`
    : `Needs attention: still active, but ${gapText}.${unusualNote}`;
}

/** Platform-level sentence for the admin Overview engagement panel. */
function interpretEngagement({ summary, flagKeyCounts = {}, activeMembers7d = 0 }) {
  const total = Number(summary?.total) || 0;
  if (!total) return 'No members yet. Engagement appears here once people sign up and start logging.';
  const attention = (summary.yellow || 0) + (summary.red || 0);
  const activePct = Math.round((activeMembers7d / total) * 100);
  const top = Object.entries(flagKeyCounts)
    .filter(([key, n]) => n > 0 && FLAGS[key] && FLAGS[key].group !== 'inactive')
    .sort((a, b) => b[1] - a[1])[0];
  const topNote = top ? ` The most common gap is "${FLAGS[top[0]].label.toLowerCase()}" (${plural(top[1], 'member')}).` : '';
  if (attention === 0) return `All ${plural(total, 'member')} are on track this week, and ${activePct}% logged activity in the last 7 days.`;
  return `${activePct}% of members logged activity in the last 7 days. ${attention} of ${total} need attention (${summary.red || 0} inactive).${topNote}`;
}

module.exports = {
  CRITERIA, STATUS, FLAGS, classifyUser, plannedWorkouts, weightFlags, describeCriteria,
  interpretUser, interpretEngagement,
};
