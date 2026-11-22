// BMI + sleep interpretation for the UI. WHO international adult cut-offs,
// mirrored from backend/src/utils/health.js (keep in sync).
// General fitness information only — never a diagnosis.

export const BMI_CLASSES = [
  {
    key: 'UNDERWEIGHT',
    label: 'Underweight',
    range: 'Below 18.5',
    min: 0,
    max: 18.5,
    tone: 'info',
    color: '#60a5fa',
    meaning: 'Your weight is lower than the healthy range for your height. This can mean your body is not getting enough energy or nutrients to support strength and recovery.',
    tip: 'Focus on eating enough: regular meals with protein, whole grains and healthy fats, plus strength training to build muscle rather than only fat.',
  },
  {
    key: 'NORMAL',
    label: 'Normal weight',
    range: '18.5 – 24.9',
    min: 18.5,
    max: 25,
    tone: 'good',
    color: 'var(--accent)',
    meaning: 'Your weight is in the healthy range for your height. This range is linked with the lowest risk of weight-related health problems.',
    tip: 'Keep it up with balanced meals and regular activity. Use your goal (muscle, performance or maintenance) to guide your training.',
  },
  {
    key: 'OVERWEIGHT',
    label: 'Overweight',
    range: '25 – 29.9',
    min: 25,
    max: 30,
    tone: 'warn',
    color: '#f59e0b',
    meaning: 'Your weight is above the healthy range for your height. Over time this can raise the risk of high blood pressure, type 2 diabetes and joint strain.',
    tip: 'Small, steady changes work best: a modest calorie deficit, more daily movement and 2–3 strength sessions a week. Aim for about 0.25–0.5 kg per week.',
  },
  {
    key: 'OBESE',
    label: 'Obese',
    range: '30 and above',
    min: 30,
    max: Infinity,
    tone: 'risk',
    color: '#f87171',
    meaning: 'Your weight is well above the healthy range for your height, which is linked with a higher risk of heart disease, diabetes and joint problems.',
    tip: 'Start with low-impact activity (walking, cycling, swimming) and gradual diet changes. Talking to a doctor before an intense program is a good idea.',
  },
];

export function calcBmi(weightKg, heightCm) {
  const h = Number(heightCm) / 100;
  const w = Number(weightKg);
  if (!h || !w || h <= 0 || w <= 0) return null;
  return Number((w / (h * h)).toFixed(1));
}

export function classifyBmi(bmi) {
  const n = Number(bmi);
  if (bmi == null || bmi === '' || !Number.isFinite(n) || n <= 0) return null;
  return BMI_CLASSES.find((c) => n >= c.min && n < c.max) || BMI_CLASSES[BMI_CLASSES.length - 1];
}

/** Weight range (kg) that gives a Normal BMI (18.5–24.9) at this height. */
export function healthyWeightRange(heightCm) {
  const h = Number(heightCm) / 100;
  if (!h || h <= 0) return null;
  return { minKg: Number((18.5 * h * h).toFixed(1)), maxKg: Number((24.9 * h * h).toFixed(1)) };
}

/** Marker position (0–100%) on a 15→40 BMI scale for the colour bar. */
export function bmiScalePosition(bmi) {
  const n = Number(bmi);
  if (!Number.isFinite(n)) return null;
  const pct = ((n - 15) / (40 - 15)) * 100;
  return Math.min(100, Math.max(0, pct));
}

/** One-line distance to the healthy range, e.g. "4.2 kg above the healthy range". */
export function distanceToHealthy(weightKg, heightCm) {
  const r = healthyWeightRange(heightCm);
  const w = Number(weightKg);
  if (!r || !Number.isFinite(w) || w <= 0) return '';
  if (w < r.minKg) return `${(r.minKg - w).toFixed(1)} kg below the healthy range`;
  if (w > r.maxKg) return `${(w - r.maxKg).toFixed(1)} kg above the healthy range`;
  return 'Within the healthy range';
}

// ── Sleep ────────────────────────────────────────────────────────────────
// Adults 18–64: 7–9 h; teens 13–17: 8–10 h (National Sleep Foundation / AASM).
export const SLEEP_CHOICES = [
  { value: 5, label: '5 h or less' },
  { value: 6, label: '6 h' },
  { value: 7, label: '7 h' },
  { value: 8, label: '8 h' },
  { value: 9, label: '9 h' },
  { value: 10, label: '10 h or more' },
];

export function sleepGuidance(hours, age = null) {
  const h = Number(hours);
  if (hours == null || hours === '' || !Number.isFinite(h)) return null;
  const teen = Number.isFinite(Number(age)) && Number(age) > 0 && Number(age) < 18;
  const [lo, hi] = teen ? [8, 10] : [7, 9];
  const rec = `${lo}–${hi} hours`;
  if (h < lo - 1) {
    return { status: 'LOW', tone: 'risk', label: 'Below recommended', message: `Most ${teen ? 'teens' : 'adults'} need ${rec}. Regularly sleeping this little slows recovery, raises hunger and makes workouts feel harder.` };
  }
  if (h < lo) {
    return { status: 'SLIGHTLY_LOW', tone: 'warn', label: 'Slightly low', message: `Close, but most ${teen ? 'teens' : 'adults'} need ${rec}. An extra 30–60 minutes can noticeably improve recovery and energy.` };
  }
  if (h > hi + 1) {
    return { status: 'HIGH', tone: 'warn', label: 'More than usual', message: `That is more than the usual ${rec}. If you often feel tired despite long sleep, consider mentioning it to a doctor.` };
  }
  return { status: 'GOOD', tone: 'good', label: 'Healthy amount', message: `Within the recommended ${rec}. Good sleep supports muscle recovery and appetite control.` };
}
