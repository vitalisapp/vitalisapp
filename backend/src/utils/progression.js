// Progressive feature unlocking (Revision #4) — pure, no I/O.
//
// Levels gate OPTIONAL advanced content only:
//   1 Foundation  everyone — all logging, nutrition, safety guidance, warm-ups,
//                 camera workouts, Beginner/Moderate plans, goal-generated and
//                 personal plans. Never locked.
//   2 Advanced    Advanced-intensity curated plans + Level 2 challenges
//   3 Elite       Extreme-intensity curated plans + Level 3 challenges
//
// Readiness = completed sessions + consistency + difficulty feedback +
// technique (camera form score). Levels are cumulative (Level 3 needs Level 2)
// and sticky: once earned they are stored and never taken away.

const SESSION_MIN_SECONDS = 120; // a "session" lasts at least 2 minutes
const RECENT = 5; // last N ratings / form scores
const MIN_SAMPLES = 3; // ratings / scored sessions needed to judge
const NO_CAMERA_FACTOR = 1.5; // no form data → more sessions instead

const LEVELS = [
  { level: 1, key: 'foundation', name: 'Foundation', unlocks: ['All logging, nutrition and safety tools', 'Beginner & Moderate plans', 'Warm-ups and camera workouts'] },
  {
    level: 2, key: 'advanced', name: 'Advanced',
    unlocks: ['Advanced-intensity plans', 'Level 2 challenges'],
    req: { sessions: 8, weeks: 3, weekWindow: 4, maxDifficulty: 3.5, minForm: 70 },
  },
  {
    level: 3, key: 'elite', name: 'Elite',
    unlocks: ['Extreme-intensity plans', 'Level 3 challenges'],
    req: { sessions: 20, weeks: 6, weekWindow: 8, maxDifficulty: 3.0, minForm: 80 },
  },
];
const MAX_LEVEL = LEVELS.length;

// Curated plan intensity → level needed to START it.
const INTENSITY_LEVEL = { advanced: 2, extreme: 3 };

function requiredLevelForPlan(plan) {
  if (!plan) return 1;
  // Personal plans (owned by a user) are never locked.
  if (plan.owner_user_id !== null && plan.owner_user_id !== undefined) return 1;
  const key = String(plan.intensity || plan.difficulty || '').trim().toLowerCase();
  return INTENSITY_LEVEL[key] || 1;
}

/** Monday-based week index for a 'YYYY-MM-DD' (or Date) in local time. */
function weekIndex(d) {
  const date = d instanceof Date ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : (() => {
    const [y, m, day] = String(d).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, day);
  })();
  const dow = (date.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dow);
  return Math.round(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()) / (7 * 86400000));
}

/** Number of distinct weeks (out of the last `window`, this week included) with ≥1 session. */
function activeWeeks(sessionDates, window, today = new Date()) {
  const current = weekIndex(today);
  const weeks = new Set();
  for (const d of sessionDates || []) {
    const w = weekIndex(d);
    if (w <= current && w > current - window) weeks.add(w);
  }
  return weeks.size;
}

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const round1 = (n) => (n === null ? null : Math.round(n * 10) / 10);

/**
 * @param {object} stats
 * @param {number}   stats.sessions        completed sessions (≥ 2 min)
 * @param {string[]} stats.sessionDates    'YYYY-MM-DD' of those sessions (recent ones suffice)
 * @param {number[]} stats.ratings         difficulty ratings 1–5, newest first
 * @param {number[]} stats.formScores      camera form scores 0–100, newest first
 * @param {object} [opts]
 * @param {boolean} [opts.selfAdvanced]    said "Advanced" in onboarding → Level 2 needs half the sessions/weeks
 * @param {Date}    [opts.today]
 */
function requirementsFor(levelDef, stats, { selfAdvanced = false, today = new Date() } = {}) {
  const r = { ...levelDef.req };
  if (selfAdvanced && levelDef.level === 2) {
    r.sessions = Math.ceil(r.sessions / 2);
    r.weeks = Math.ceil(r.weeks / 2);
  }
  const sessions = Number(stats.sessions) || 0;
  const weeks = activeWeeks(stats.sessionDates, r.weekWindow, today);
  const ratings = (stats.ratings || []).map(Number).filter((n) => n >= 1 && n <= 5).slice(0, RECENT);
  const forms = (stats.formScores || []).map(Number).filter((n) => n >= 0 && n <= 100).slice(0, RECENT);
  const avgRating = round1(avg(ratings));
  const avgForm = forms.length ? Math.round(avg(forms)) : null;

  const difficultyMet = ratings.length >= MIN_SAMPLES && avgRating <= r.maxDifficulty;
  const hasCamera = forms.length >= MIN_SAMPLES;
  const noCameraSessions = Math.ceil(r.sessions * NO_CAMERA_FACTOR);
  const techniqueMet = hasCamera ? avgForm >= r.minForm : sessions >= noCameraSessions;

  return [
    {
      key: 'sessions',
      label: `Complete ${r.sessions} workout sessions`,
      hint: 'Any workout of at least 2 minutes counts — camera, plan or logged manually.',
      current: Math.min(sessions, r.sessions), target: r.sessions, met: sessions >= r.sessions,
    },
    {
      key: 'consistency',
      label: `Train in ${r.weeks} of the last ${r.weekWindow} weeks`,
      hint: 'At least one session in a week counts that week.',
      current: Math.min(weeks, r.weeks), target: r.weeks, met: weeks >= r.weeks,
    },
    {
      key: 'difficulty',
      label: `Recent workouts feel manageable (avg ≤ ${r.maxDifficulty} of 5)`,
      hint: ratings.length < MIN_SAMPLES
        ? `Rate how hard your workouts felt after finishing — ${MIN_SAMPLES - ratings.length} more rating${MIN_SAMPLES - ratings.length === 1 ? '' : 's'} needed.`
        : `Your last ${ratings.length} ratings average ${avgRating}. Lower means your current level feels comfortable.`,
      current: Math.min(ratings.length, MIN_SAMPLES), target: MIN_SAMPLES, met: difficultyMet,
      value: avgRating,
    },
    {
      key: 'technique',
      label: hasCamera ? `Camera form score avg ≥ ${r.minForm}` : `Good technique (camera form ≥ ${r.minForm})`,
      hint: hasCamera
        ? `Your last ${forms.length} camera sessions average ${avgForm}.`
        : `Do ${MIN_SAMPLES - forms.length} more camera workout${MIN_SAMPLES - forms.length === 1 ? '' : 's'} to measure your form — or complete ${noCameraSessions} sessions in total.`,
      current: hasCamera ? Math.min(avgForm, r.minForm) : Math.min(sessions, noCameraSessions),
      target: hasCamera ? r.minForm : noCameraSessions,
      met: techniqueMet,
      value: avgForm,
    },
  ];
}

/**
 * Evaluate readiness. `storedLevel` is the highest level already earned —
 * the result never drops below it.
 */
function evaluate(stats = {}, { storedLevel = 1, selfAdvanced = false, today = new Date() } = {}) {
  const stored = Math.min(MAX_LEVEL, Math.max(1, Number(storedLevel) || 1));
  let earned = 1;
  const levels = LEVELS.map((def) => {
    if (!def.req) return { level: def.level, key: def.key, name: def.name, unlocks: def.unlocks, unlocked: true, requirements: [] };
    const requirements = requirementsFor(def, stats, { selfAdvanced, today });
    const metNow = requirements.every((x) => x.met) && earned === def.level - 1;
    if (metNow) earned = def.level;
    return { level: def.level, key: def.key, name: def.name, unlocks: def.unlocks, requirements, metNow };
  });
  const level = Math.max(stored, earned);
  for (const l of levels) {
    l.unlocked = l.level <= level;
    if (l.requirements.length) {
      const done = l.requirements.filter((x) => x.met).length;
      l.progressPct = l.unlocked ? 100 : Math.round(
        (l.requirements.reduce((s, x) => s + Math.min(1, x.target ? x.current / x.target : 0), 0) / l.requirements.length) * 100,
      );
      l.metCount = done;
    }
    delete l.metNow;
  }
  const next = levels.find((l) => !l.unlocked) || null;
  return { level, maxLevel: MAX_LEVEL, levels, nextLevel: next ? next.level : null };
}

module.exports = {
  LEVELS, MAX_LEVEL, SESSION_MIN_SECONDS, INTENSITY_LEVEL,
  evaluate, requirementsFor, requiredLevelForPlan, activeWeeks, weekIndex,
};
