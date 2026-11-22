// Goal setup rules — mirrors backend/src/utils/goalSetup.js so the UI can
// explain problems before saving. The server stays the source of truth.

export const MAX_EXTRA_GOALS = 2;
export const MIN_TARGET_DAYS = 14;
export const MAX_TARGET_DAYS = 730;

export const EXPERIENCE_LEVELS = [
  { key: 'BEGINNER', label: 'Beginner', desc: 'New to training, or back after a long break. Simple moves, 3 days a week.' },
  { key: 'INTERMEDIATE', label: 'Intermediate', desc: 'Training regularly for 6+ months and comfortable with basic lifts.' },
  { key: 'ADVANCED', label: 'Advanced', desc: 'Years of consistent training; you know your form and limits.' },
];

// Same keys as backend constants/exercisePool.js EXCLUSION_CATEGORIES.
export const EXCLUSION_CATEGORIES = [
  { key: 'HIGH_IMPACT', label: 'Jumping / high-impact', desc: 'Jumps, hops and fast moves that pound the joints.' },
  { key: 'RUNNING', label: 'Running', desc: 'Running, sprinting and jogging in place.' },
  { key: 'FLOOR', label: 'Lying on the floor', desc: 'Exercises done lying face-up or face-down.' },
  { key: 'KNEELING', label: 'Kneeling', desc: 'Moves that put weight on your knees.' },
  { key: 'OVERHEAD', label: 'Overhead pressing', desc: 'Pushing weight or your body above your head.' },
  { key: 'HEAVY_LIFTING', label: 'Heavy barbell lifting', desc: 'Barbell squats, deadlifts and presses.' },
  { key: 'WRIST_LOAD', label: 'Weight on the wrists', desc: 'Planks, push-ups and crawls on your hands.' },
];

const WEIGHT_GOALS = ['LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN_WEIGHT'];

/**
 * Why an extra goal can't be picked with this primary goal (or null if it can).
 * Weight goals (lose / gain / maintain) can't be mixed with each other.
 */
export function extraGoalBlockReason(primary, extra, chosen = []) {
  if (!extra || extra === primary) return 'This is already your main goal.';
  const weightSet = [primary, ...chosen.filter((g) => g !== extra)].filter((g) => WEIGHT_GOALS.includes(g));
  if (WEIGHT_GOALS.includes(extra) && weightSet.length > 0) {
    return 'Weight goals pull in different directions, so only one can be chosen.';
  }
  if (!chosen.includes(extra) && chosen.length >= MAX_EXTRA_GOALS) return `Up to ${MAX_EXTRA_GOALS} extra goals.`;
  return null;
}

/** Remove extras that no longer fit after the primary goal changes. */
export function cleanExtraGoals(primary, extras = []) {
  const out = [];
  for (const g of extras) {
    if (!extraGoalBlockReason(primary, g, out)) out.push(g);
  }
  return out;
}

export function isRecomposition(primary, extras = []) {
  return (primary === 'LOSE_WEIGHT' && extras.includes('BUILD_MUSCLE'))
    || (primary === 'BUILD_MUSCLE' && extras.includes('LOSE_WEIGHT'));
}

function utcDay(d) {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

function iso(ms) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function targetDateBounds(now = new Date()) {
  const base = utcDay(now);
  return { min: iso(base + MIN_TARGET_DAYS * 86400000), max: iso(base + MAX_TARGET_DAYS * 86400000) };
}

/**
 * @returns {{ ok: true, feasibility: object|null } | { ok: false, message: string }}
 * Empty date → ok with no feasibility (target date is optional).
 */
export function checkTargetDate({ targetDate, weightKg, targetWeightKg, now = new Date() }) {
  if (!targetDate) return { ok: true, feasibility: null };
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(targetDate));
  if (!m) return { ok: false, message: 'Please choose a valid target date.' };
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const days = Math.round((t - utcDay(now)) / 86400000);
  if (days < MIN_TARGET_DAYS) return { ok: false, message: 'Pick a date at least 2 weeks from today. Real changes in your body take time.' };
  if (days > MAX_TARGET_DAYS) return { ok: false, message: 'Pick a date within the next 2 years. You can set a new goal after this one.' };

  const w = Number(weightKg);
  const tw = Number(targetWeightKg);
  if (!(w > 0) || !(tw > 0) || Math.abs(tw - w) < 0.5) return { ok: true, feasibility: null };
  const direction = tw < w ? 'down' : 'up';
  const change = Math.abs(tw - w);
  const perWeek = change / (days / 7);
  const safe = direction === 'down' ? Math.min(1, Math.max(0.25, w * 0.01)) : 0.5;
  const realistic = perWeek <= safe + 1e-9;
  const suggestedDate = iso(utcDay(now) + Math.ceil(change / safe) * 7 * 86400000);
  const r = (n) => Math.round(n * 100) / 100;
  return {
    ok: true,
    feasibility: {
      direction,
      realistic,
      requiredPerWeek: r(perWeek),
      safeMaxPerWeek: r(safe),
      suggestedDate,
      message: realistic
        ? `Realistic: about ${r(perWeek)} kg a week, within the safe ${r(safe)} kg a week.`
        : `That's about ${r(perWeek)} kg a week, more than the safe ${r(safe)} kg a week. Try ${suggestedDate} or later.`,
    },
  };
}
