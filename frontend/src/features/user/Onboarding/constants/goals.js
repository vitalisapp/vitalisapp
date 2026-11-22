// Shared goal vocabulary — single source for onboarding, profile, dashboard, AI.
export const GOAL_TYPES = [
  { key: 'LOSE_WEIGHT', label: 'Lose Weight / Fat', desc: 'Lower body fat with a moderate calorie deficit while keeping muscle through strength training.', icon: 'local_fire_department' },
  { key: 'MAINTAIN_WEIGHT', label: 'Maintain Weight', desc: 'Stay at your current weight and build fitness, energy and healthy habits.', icon: 'balance' },
  { key: 'GAIN_WEIGHT', label: 'Gain Weight', desc: 'Add healthy weight slowly with a small calorie surplus and balanced meals.', icon: 'trending_up' },
  { key: 'BUILD_MUSCLE', label: 'Build Muscle', desc: 'Grow muscle and strength with progressive resistance training and enough protein.', icon: 'fitness_center' },
  { key: 'PERFORMANCE', label: 'Improve Performance', desc: 'Train for endurance, speed or strength in a sport or activity you care about.', icon: 'directions_run' },
];

export const goalLabel = (key) => GOAL_TYPES.find((g) => g.key === key)?.label || key || '—';

// `desc` is the one-line card text; `detail` + `examples` explain the level in
// plain language so users can pick honestly (it drives the calorie maths).
export const ACTIVITY_LEVELS = [
  {
    key: 'SEDENTARY',
    label: 'Sedentary',
    desc: 'Mostly sitting, little or no exercise',
    icon: 'chair',
    detail: 'You spend most of the day sitting and rarely do planned exercise. Usually under 5,000 steps a day.',
    examples: ['Desk or office job, studying most of the day', 'Getting around mostly by car or jeepney', 'Exercise less than once a week'],
  },
  {
    key: 'LIGHTLY_ACTIVE',
    label: 'Lightly Active',
    desc: 'Light exercise 1–3 days a week',
    icon: 'directions_walk',
    detail: 'Mostly seated, but you walk regularly or do light workouts a few times a week. About 5,000–7,500 steps a day.',
    examples: ['Walking 20–30 minutes on most days', 'Light gym, yoga or home workouts 1–3 times a week', 'Teacher, cashier or other job with some standing'],
  },
  {
    key: 'MODERATELY_ACTIVE',
    label: 'Moderately Active',
    desc: 'Moderate exercise 3–5 days a week',
    icon: 'directions_run',
    detail: 'You do purposeful exercise that raises your heart rate most days of the week. About 7,500–10,000 steps a day.',
    examples: ['Jogging, cycling or sports 3–5 times a week', 'Strength training 45–60 minutes, 3–4 times a week', 'Job that keeps you on your feet (nurse, waiter)'],
  },
  {
    key: 'VERY_ACTIVE',
    label: 'Very Active',
    desc: 'Hard exercise 6–7 days a week',
    icon: 'bolt',
    detail: 'You train hard almost every day, or combine regular workouts with a physically demanding job. Over 10,000 steps a day.',
    examples: ['Daily intense training or two-a-day sessions', 'Varsity athlete in season', 'Construction, farming or delivery work plus workouts'],
  },
  {
    key: 'HIGHLY_ACTIVE',
    label: 'Highly Active',
    desc: 'Athlete-level training or heavy manual work',
    icon: 'local_fire_department',
    detail: 'Very high daily energy use: competitive-level training many hours a week, or long days of heavy physical labour.',
    examples: ['Endurance training 10+ hours a week', 'Heavy manual labour all day', 'Pick this only if it truly fits; most people are in a lower level'],
  },
];

export const activityLabel = (key) => ACTIVITY_LEVELS.find((a) => a.key === key)?.label || key || '—';

export const PACES = {
  LOSE_WEIGHT: ['GRADUAL', 'MODERATE', 'FASTER'],
  GAIN_WEIGHT: ['GRADUAL', 'MODERATE'],
};

export const FOCUSES = {
  BUILD_MUSCLE: ['GENERAL', 'STRENGTH', 'HYPERTROPHY'],
  MAINTAIN_WEIGHT: ['GENERAL', 'STRENGTH', 'ENDURANCE', 'BODY_COMPOSITION'],
  PERFORMANCE: ['ENDURANCE', 'STRENGTH', 'CONDITIONING', 'ATHLETIC'],
};

export const EXERCISE_FREQ = ['NEVER', '1_2_DAYS', '3_5_DAYS', '6_7_DAYS'];

// Human labels for enum-style option values. Day ranges get en-dashes;
// anything else falls back to underscore → space + sentence case.
// (String.replace('_',' ') only swaps the FIRST underscore — this helper
// replaces all of them, so '1_2_DAYS' never leaks into the UI.)
export const EXERCISE_FREQ_LABELS = {
  NEVER: 'Never',
  '1_2_DAYS': '1–2 days',
  '3_5_DAYS': '3–5 days',
  '6_7_DAYS': '6–7 days',
};

export const humanizeOption = (o) => {
  const s = String(o ?? '');
  if (EXERCISE_FREQ_LABELS[s]) return EXERCISE_FREQ_LABELS[s];
  return s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
};
