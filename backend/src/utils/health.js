// Health interpretation — BMI classes (WHO international adult cut-offs) and
// sleep guidance. Mirrored for the UI in frontend/src/lib/bmi.js. General
// fitness information only, never a diagnosis.

const BMI_CLASSES = [
  { key: 'UNDERWEIGHT', label: 'Underweight', min: 0, max: 18.5 },
  { key: 'NORMAL', label: 'Normal weight', min: 18.5, max: 25 },
  { key: 'OVERWEIGHT', label: 'Overweight', min: 25, max: 30 },
  { key: 'OBESE', label: 'Obese', min: 30, max: Infinity },
];

function classifyBmi(bmi) {
  const n = Number(bmi);
  if (bmi == null || !Number.isFinite(n) || n <= 0) return null;
  return BMI_CLASSES.find((c) => n >= c.min && n < c.max) || BMI_CLASSES[BMI_CLASSES.length - 1];
}

/** Weight range (kg) that gives a Normal BMI (18.5–24.9) at this height. */
function healthyWeightRange(heightCm) {
  const h = Number(heightCm) / 100;
  if (!h || h <= 0) return null;
  return { minKg: Number((18.5 * h * h).toFixed(1)), maxKg: Number((24.9 * h * h).toFixed(1)) };
}

// Adults 18–64: 7–9 h (NSF / AASM). Teens 13–17: 8–10 h.
const SLEEP_MIN = 3;
const SLEEP_MAX = 14;

function sleepGuidance(hours, age = null) {
  const h = Number(hours);
  if (hours == null || hours === '' || !Number.isFinite(h)) return null;
  const teen = Number.isFinite(Number(age)) && Number(age) < 18;
  const [lo, hi] = teen ? [8, 10] : [7, 9];
  let status = 'GOOD';
  if (h < lo - 1) status = 'LOW';
  else if (h < lo) status = 'SLIGHTLY_LOW';
  else if (h > hi + 1) status = 'HIGH';
  return { hours: h, status, recommended: { min: lo, max: hi } };
}

/** Optional sleep input → { value } | { error }. Accepts half hours. */
function parseSleepHours(v) {
  if (v === undefined || v === null || v === '') return { value: null };
  const n = Number(v);
  if (!Number.isFinite(n) || n < SLEEP_MIN || n > SLEEP_MAX) {
    return { error: `Sleep must be between ${SLEEP_MIN} and ${SLEEP_MAX} hours per night.` };
  }
  return { value: Math.round(n * 2) / 2 };
}

module.exports = { BMI_CLASSES, classifyBmi, healthyWeightRange, sleepGuidance, parseSleepHours, SLEEP_MIN, SLEEP_MAX };
