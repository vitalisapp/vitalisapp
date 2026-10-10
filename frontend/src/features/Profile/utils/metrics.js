// Body-metric math + display helpers for the Profile page. Pure functions,
// no DOM — covered by frontend/tests/unit/metrics.test.js.
export const computeBMI = (heightCm, weightKg) => {
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  if (!h || !w) return null;
  const m = h / 100;
  return +(w / (m * m)).toFixed(1);
};

export const bmiCategory = (bmi) => {
  if (bmi == null) return { label: '—', color: 'var(--text-disabled)' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'var(--info)' };
  if (bmi < 25) return { label: 'Normal', color: 'var(--accent)' };
  if (bmi < 30) return { label: 'Overweight', color: 'var(--warning)' };
  return { label: 'Obese', color: 'var(--error)' };
};

// Mifflin-St Jeor, rounded to whole kcal.
export const calcBMR = (weight, height, age, gender) => {
  if (!weight || !height || !age) return null;
  const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
  if (gender === 'female') return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  return Math.round(10 * w + 6.25 * h - 5 * a + 5);
};

export const activityFactors = {
  Sedentary: 1.2,
  'Lightly Active': 1.375,
  'Moderately Active': 1.55,
  'Very Active': 1.725,
  'Extra Active': 1.9,
};

// Humanize raw DB enums for display: "12_DAYS" → "12 days", "GRADUAL" → "Gradual".
export const humanize = (v) => {
  if (v == null || v === '') return '—';
  const s = String(v).replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};
