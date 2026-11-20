export const ACTIVITY_LIMITS = {
  calories: { min: 1, max: 20000, required: true },
  steps: { min: 0, max: 200000 },
  minutes: { min: 0, max: 1440 },
};

export const EMPTY_ACTIVITY_FORM = { calories: '', steps: '', minutes: '' };

export function clampActivityNumber(v, { min = 0, max = 100000, required = false } = {}) {
  if (v === '' || v == null) return required ? null : '';
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Math.floor(n);
}

export function validateActivityForm(formData) {
  const calories = clampActivityNumber(formData.calories, ACTIVITY_LIMITS.calories);
  const steps = clampActivityNumber(formData.steps, ACTIVITY_LIMITS.steps);
  const minutes = clampActivityNumber(formData.minutes, ACTIVITY_LIMITS.minutes);
  if (calories == null) return { error: 'Calories must be 1–20000.' };
  if (steps == null || minutes == null)
    return { error: 'Steps (0–200k), minutes (0–1440).' };
  return { values: { calories, steps, minutes } };
}
