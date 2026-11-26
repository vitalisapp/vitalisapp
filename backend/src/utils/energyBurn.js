// Exercise energy expenditure — MET-based estimate (Compendium of Physical
// Activities, Ainsworth et al.). Pure functions: no DB, safe to unit test.
//
// NET calories: (MET − 1) × kg × hours. The daily calorie target already
// includes resting burn (BMR × activity factor), so adding GROSS exercise kcal
// on top would count that resting hour twice and over-credit the user.

const DEFAULT_WEIGHT_KG = 70;
const MIN_WEIGHT_KG = 30;
const MAX_WEIGHT_KG = 300;
const MAX_SESSION_SECONDS = 6 * 3600; // longer sessions are clamped, not trusted
const MAX_SESSION_KCAL = 3000;

// Ordered: first match wins, so specific keywords sit above generic ones.
// Keys match at the START of a word ("run" hits "running", never "crunch").
const MET_RULES = [
  { met: 11.0, keys: ['jump rope', 'jumprope', 'skipping'] },
  { met: 9.8,  keys: ['run', 'sprint'] },
  { met: 8.0,  keys: ['hiit', 'tabata', 'circuit', 'burpee', 'mountain climber', 'boxjump', 'box jump', 'jumping', 'stair', 'crossfit'] },
  { met: 7.8,  keys: ['boxing', 'kickbox', 'mma', 'martial', 'muay'] },
  { met: 7.5,  keys: ['cycl', 'bike', 'biking', 'ride', 'riding', 'spin'] },
  { met: 7.0,  keys: ['jog', 'swim', 'rowing', 'soccer', 'football', 'hik'] },
  { met: 6.5,  keys: ['basketball', 'tennis', 'badminton', 'volleyball'] },
  { met: 6.0,  keys: ['deadlift', 'clean', 'snatch', 'thruster', 'kettlebell'] },
  { met: 5.0,  keys: ['strength', 'weight', 'lift', 'barbell', 'dumbbell', 'bench', 'press', 'curl', 'row', 'pull up', 'pullup', 'chin up', 'dip', 'danc', 'elliptical', 'aerobic'] },
  { met: 4.0,  keys: ['squat', 'lunge', 'push up', 'pushup', 'sit up', 'situp', 'crunch', 'calf', 'raise', 'bridge', 'thrust', 'tricep', 'calisthenic', 'bodyweight'] },
  { met: 3.8,  keys: ['plank', 'wall sit', 'hold'] },
  { met: 3.5,  keys: ['walk'] },
  { met: 3.0,  keys: ['pilates', 'mobility', 'tai chi'] },
  { met: 2.5,  keys: ['yoga', 'stretch', 'cooldown', 'cool down', 'warm'] },
];
const DEFAULT_MET = 4.5; // "general" / unknown free-text — moderate effort

// Post-workout rating 1–5 nudges intensity: an all-out session burns more than
// the same minutes at an easy pace.
const DIFFICULTY_FACTOR = { 1: 0.85, 2: 0.92, 3: 1.0, 4: 1.1, 5: 1.2 };

// "Push-Up_Hold" -> " push up hold" so keys can match on word starts.
function normalizeType(raw) {
  const words = String(raw || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return words.length ? ` ${words.join(' ')}` : '';
}

function metForWorkout(workoutType) {
  const t = normalizeType(workoutType);
  if (!t) return DEFAULT_MET;
  for (const rule of MET_RULES) {
    if (rule.keys.some((k) => t.includes(` ${k}`))) return rule.met;
  }
  return DEFAULT_MET;
}

function sanitizeWeight(kg) {
  const n = Number(kg);
  if (!Number.isFinite(n) || n < MIN_WEIGHT_KG || n > MAX_WEIGHT_KG) return DEFAULT_WEIGHT_KG;
  return n;
}

/**
 * Net kcal for one workout session. Returns an integer ≥ 0.
 * @param {{ workoutType?: string, durationSeconds?: number, weightKg?: number, difficulty?: number|null }} p
 */
function estimateWorkoutKcal({ workoutType, durationSeconds, weightKg, difficulty = null } = {}) {
  const secs = Math.min(Math.max(Number(durationSeconds) || 0, 0), MAX_SESSION_SECONDS);
  if (secs <= 0) return 0;
  const met = metForWorkout(workoutType);
  const factor = DIFFICULTY_FACTOR[Number(difficulty)] ?? 1;
  const kcal = (met - 1) * factor * sanitizeWeight(weightKg) * (secs / 3600);
  return Math.min(Math.max(Math.round(kcal), 0), MAX_SESSION_KCAL);
}

// GPS / manual activities (walk · run · ride) — MET from average speed
// (Compendium of Physical Activities). Speed picks the activity: under
// 6.5 km/h is walking, up to 25 km/h running, faster is cycling.
const WALK_RUN_METS = [ // [max km/h, MET]
  [3.2, 2.8], [4.0, 3.0], [4.8, 3.5], [5.6, 4.3], [6.5, 5.0],
  [8.0, 8.3], [8.4, 9.0], [9.7, 9.8], [10.8, 10.5], [11.3, 11.0],
  [12.1, 11.5], [12.9, 11.8], [13.8, 12.3], [14.5, 12.8], [16.1, 14.5], [25, 16.0],
];
const CYCLE_MET = 8.0; // ~25+ km/h average on GPS = riding
const STATIONARY_MET = 4.5; // time but no distance (manual entry) — moderate

function metForSpeed(kmh) {
  const v = Number(kmh);
  if (!Number.isFinite(v) || v <= 0) return STATIONARY_MET;
  for (const [max, met] of WALK_RUN_METS) if (v <= max) return met;
  return CYCLE_MET;
}

/**
 * Net kcal for one activity from its duration (s) and distance (km).
 * Returns an integer ≥ 0; 0 when there is no duration to go on.
 */
function estimateActivityKcal({ durationSeconds, distanceKm, weightKg } = {}) {
  const secs = Math.min(Math.max(Number(durationSeconds) || 0, 0), MAX_SESSION_SECONDS);
  if (secs <= 0) return 0;
  const km = Math.max(Number(distanceKm) || 0, 0);
  const met = metForSpeed(km > 0 ? km / (secs / 3600) : 0);
  const kcal = (met - 1) * sanitizeWeight(weightKg) * (secs / 3600);
  return Math.min(Math.max(Math.round(kcal), 0), MAX_SESSION_KCAL);
}

// How much exercise burn is added back to the day's calorie budget, by goal.
// Wearables and MET tables overestimate burn by roughly 20–40%, so eating it
// all back quietly erases a weight-loss deficit. Gainers need the full credit
// to stay in surplus; maintainers sit in between.
const EAT_BACK_FACTOR = {
  LOSE_WEIGHT: 0.5,
  MAINTAIN_WEIGHT: 0.75,
  GAIN_WEIGHT: 1,
  BUILD_MUSCLE: 1,
  PERFORMANCE: 1,
};
const DEFAULT_EAT_BACK = 0.75; // no active goal → treat as maintenance

function eatBackFactor(goalType) {
  return EAT_BACK_FACTOR[String(goalType || '').toUpperCase()] ?? DEFAULT_EAT_BACK;
}

/** kcal added back to the budget for a given raw burn and goal. */
function creditedKcal(burnedKcal, goalType) {
  const kcal = Math.max(0, Number(burnedKcal) || 0);
  return Math.round(kcal * eatBackFactor(goalType));
}

module.exports = {
  estimateActivityKcal,
  metForSpeed,
  MAX_SESSION_KCAL,
  EAT_BACK_FACTOR,
  eatBackFactor,
  creditedKcal,
  DEFAULT_WEIGHT_KG,
  DEFAULT_MET,
  MET_RULES,
  metForWorkout,
  sanitizeWeight,
  estimateWorkoutKcal,
};
