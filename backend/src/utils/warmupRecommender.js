// Warm-up & cool-down recommender (Revision #3) — pure, no I/O.
//
// Builds a routine for ONE planned workout day from:
//   fitness level  → length, intensity and which moves are allowed
//                    (beginners: gentle, low-impact, standing moves only)
//   planned workout→ body regions to prepare / stretch (from the exercises)
//   goals          → small adjustments (longer pulse for cardio goals,
//                    ramp-up sets for muscle goals on strength days)
//   safety         → BMI/sedentary low-impact, the user's excluded categories
//                    (no kneeling / floor / wrist load …), older-adult holds
// Static stretching is only ever placed in the cool-down (after training),
// following ACSM guidance. Every move carries instructions, a dose and an
// easier version so the user can skip or modify it.
const { WARMUP_MOVES, COOLDOWN_MOVES } = require('../constants/warmupMoves');
const { EXERCISES, EXCLUSION_CATEGORIES } = require('../constants/exercisePool');

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const EXCLUSION_KEYS = new Set(EXCLUSION_CATEGORIES.map((c) => c.key));
// Same rest types the plan screen uses (frontend planFormat REST_ACTIVITY_TYPES).
const REST_TYPES = new Set(['recovery', 'mobility', 'flexibility', 'rest', 'rest day', 'active recovery']);
const SECONDS_PER_REP = 3;

const CONFIG = {
  BEGINNER: {
    maxLevel: 1, label: 'gentle',
    warm: { pulse: 1, pulseSec: 120, dynamic: 4, dynSec: 40, dynReps: 8, activation: 0, actReps: 8 },
    cool: { walkSec: 60, stretches: 3, holdSec: 30, breatheSec: 30 },
  },
  INTERMEDIATE: {
    maxLevel: 2, label: 'moderate',
    warm: { pulse: 1, pulseSec: 150, dynamic: 5, dynSec: 45, dynReps: 10, activation: 1, actReps: 10 },
    cool: { walkSec: 60, stretches: 4, holdSec: 30, breatheSec: 45 },
  },
  ADVANCED: {
    maxLevel: 3, label: 'thorough',
    warm: { pulse: 2, pulseSec: 90, dynamic: 5, dynSec: 45, dynReps: 10, activation: 1, actReps: 12 },
    cool: { walkSec: 90, stretches: 5, holdSec: 30, breatheSec: 45 },
  },
};

const PATTERN_REGIONS = {
  squat: ['lower'], lunge: ['lower'], hinge: ['lower', 'core'], glute: ['lower'],
  push: ['upper'], pull: ['upper'], core: ['core'], cardio: ['cardio', 'lower'], mobility: ['full'],
};
// Names not in the recommender pool (curated plans) fall back to keywords.
const KEYWORD_REGIONS = [
  [/squat|lunge|deadlift|leg|glute|hip thrust|calf|step-?up|bridge|hamstring|quad/i, ['lower']],
  [/push-?up|press|row|pull|curl|chest|shoulder|tricep|bicep|dip|lat|fly/i, ['upper']],
  [/plank|crunch|core|\bab|sit-?up|twist|dead bug|bird dog|hollow/i, ['core']],
  [/run|jog|cycl|bike|walk|jump|burpee|cardio|hiit|skip|sprint|interval|row(ing)? machine|climber/i, ['cardio']],
];
const POOL_BY_NAME = new Map(EXERCISES.map((e) => [e.name.toLowerCase(), e]));

function regionsForExercise(name) {
  const hit = POOL_BY_NAME.get(String(name || '').toLowerCase());
  if (hit) return PATTERN_REGIONS[hit.pattern] || ['full'];
  for (const [re, regions] of KEYWORD_REGIONS) if (re.test(String(name || ''))) return regions;
  return [];
}

/** Body regions a day trains, most-used first; always non-empty. */
function dayRegions(day = {}) {
  const counts = new Map();
  const add = (r, w = 1) => counts.set(r, (counts.get(r) || 0) + w);
  for (const ex of Array.isArray(day.exercises) ? day.exercises : []) {
    for (const r of regionsForExercise(ex?.name ?? ex?.exercise_name)) add(r);
  }
  const text = `${day.title || ''} ${day.activity_type || ''}`;
  for (const [re, regions] of KEYWORD_REGIONS) if (re.test(text)) regions.forEach((r) => add(r, 0.5));
  if (/full[- ]?body/i.test(text)) ['lower', 'upper', 'core'].forEach((r) => add(r, 0.5));
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([r]) => r);
  return sorted.length ? sorted : ['full'];
}

function firstStrengthExercise(day = {}) {
  for (const ex of Array.isArray(day.exercises) ? day.exercises : []) {
    const name = ex?.name ?? ex?.exercise_name;
    const regions = regionsForExercise(name);
    if (regions.length && !regions.includes('cardio') && !regions.includes('full')) return name;
  }
  return null;
}

function isRestDay(day = {}) {
  return REST_TYPES.has(String(day.activity_type || '').trim().toLowerCase());
}

function dose(move, { seconds, reps }) {
  const timed = move.measure === 'time';
  const sides = move.perSide ? 2 : 1;
  const out = {
    key: move.key,
    name: move.name,
    kind: move.kind,
    regions: move.regions,
    seconds: timed ? seconds : null,
    reps: timed ? null : reps,
    perSide: Boolean(move.perSide),
    steps: move.steps,
    cue: move.cue,
    easier: move.easier,
  };
  out.estSeconds = (timed ? seconds : reps * SECONDS_PER_REP) * sides;
  return out;
}

// Pick `count` moves that cover the day's regions first, then the best fit.
// preferStanding: beginners get standing/chair moves before floor/kneeling ones.
function pickCovering(candidates, regions, count, { preferHarder = false, preferStanding = false } = {}) {
  const chosen = [];
  const score = (m) => {
    const overlap = m.regions.filter((r) => regions.includes(r) || r === 'full').length;
    const groundPenalty = preferStanding && m.flags.some((f) => f === 'FLOOR' || f === 'KNEELING') ? 25 : 0;
    return overlap * 10 + (preferHarder ? m.level : -m.level) - groundPenalty;
  };
  const ranked = candidates
    .map((m, i) => ({ m, i, s: score(m) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.m);
  for (const region of regions) {
    if (chosen.length >= count) break;
    const best = ranked.find((m) => !chosen.includes(m) && m.regions.includes(region));
    if (best) chosen.push(best);
  }
  for (const m of ranked) {
    if (chosen.length >= count) break;
    if (!chosen.includes(m)) chosen.push(m);
  }
  return chosen;
}

/**
 * @param {object} input
 * @param {string} [input.experience]           BEGINNER | INTERMEDIATE | ADVANCED
 * @param {string[]} [input.goals]              primary first
 * @param {object} input.day                    { title, activity_type, exercises:[{name}] }
 * @param {string[]} [input.excludedCategories]
 * @param {boolean} [input.lowImpact]           BMI / sedentary safety rule
 * @param {number} [input.age]
 */
function recommendRoutine(input = {}) {
  const level = LEVELS.includes(input.experience) ? input.experience : 'BEGINNER';
  const cfg = CONFIG[level];
  const day = input.day || {};
  const rationale = [];

  if (isRestDay(day)) {
    return { level, applicable: false, warmup: null, cooldown: null, rationale: ['Recovery day — the gentle stretches in the plan are the session.'] };
  }

  const goals = (Array.isArray(input.goals) ? input.goals : []).filter((g) => typeof g === 'string');
  const excluded = new Set((input.excludedCategories || []).filter((k) => EXCLUSION_KEYS.has(k)));
  const age = Number(input.age);
  const older = Number.isFinite(age) && age >= 65;
  const lowImpactOnly = level === 'BEGINNER' || Boolean(input.lowImpact) || excluded.has('HIGH_IMPACT');
  const regions = dayRegions(day);
  const bodyRegions = regions.filter((r) => r !== 'cardio');
  const cardioDay = regions[0] === 'cardio' || /cardio|interval|hiit|conditioning|run/i.test(`${day.title} ${day.activity_type}`);

  const allowed = (m) =>
    m.level <= cfg.maxLevel &&
    !(lowImpactOnly && m.impact === 'high') &&
    !m.flags.some((f) => excluded.has(f));

  rationale.push(level === 'BEGINNER'
    ? 'Beginner level: a gentle, low-impact warm-up with standing moves to raise your temperature without tiring you.'
    : `${level[0]}${level.slice(1).toLowerCase()} level: a ${cfg.label} warm-up that rehearses today’s movements.`);
  if (input.lowImpact && level !== 'BEGINNER') rationale.push('Low-impact moves only, matching the safety rule in your plan.');
  if (excluded.size) rationale.push('Moves in the categories you excluded are left out.');

  // ── Warm-up ─────────────────────────────────────────────────────────
  const w = cfg.warm;
  let pulseSec = w.pulseSec;
  if (cardioDay || goals.some((g) => g === 'LOSE_WEIGHT' || g === 'PERFORMANCE')) pulseSec += 30;
  const pulse = pickCovering(WARMUP_MOVES.filter((m) => m.kind === 'pulse' && allowed(m)), ['full'], w.pulse, { preferHarder: level === 'ADVANCED' });
  const dynamicTargets = bodyRegions.length ? bodyRegions : ['full'];
  const beginner = level === 'BEGINNER';
  const dynamic = pickCovering(WARMUP_MOVES.filter((m) => m.kind === 'dynamic' && allowed(m)), dynamicTargets, w.dynamic, { preferHarder: !beginner, preferStanding: beginner });
  const activation = w.activation && !cardioDay
    ? pickCovering(WARMUP_MOVES.filter((m) => m.kind === 'activation' && allowed(m)), [dynamicTargets[0]], w.activation)
    : [];

  const warmMoves = [
    ...pulse.map((m) => dose(m, { seconds: pulseSec })),
    ...dynamic.map((m) => dose(m, { seconds: w.dynSec, reps: w.dynReps })),
    ...activation.map((m) => dose(m, { reps: w.actReps })),
  ];
  const warmNotes = [];
  const firstLift = firstStrengthExercise(day);
  const muscleGoal = goals.some((g) => g === 'BUILD_MUSCLE' || g === 'GAIN_WEIGHT');
  if (firstLift && !cardioDay && (level === 'ADVANCED' || (level === 'INTERMEDIATE' && muscleGoal))) {
    warmNotes.push(`Then do 1–2 light ramp-up sets of ${firstLift} (about half your working effort) before your first real set.`);
  }
  if (cardioDay) warmNotes.push('Start your first cardio block at an easy pace for 2–3 minutes before working harder.');

  // ── Cool-down (static stretching lives here) ────────────────────────
  const c = cfg.cool;
  const holdSec = older ? 45 : c.holdSec;
  if (older) rationale.push('Stretches are held a little longer (about 45 s), which suits adults 65 and over.');
  const coolTargets = bodyRegions.length ? bodyRegions : ['lower', 'upper'];
  const walk = COOLDOWN_MOVES.find((m) => m.key === 'walk_it_out');
  const breathe = COOLDOWN_MOVES.find((m) => m.key === 'deep_breathing');
  const stretches = pickCovering(
    COOLDOWN_MOVES.filter((m) => m.kind === 'static' && m.key !== 'deep_breathing' && allowed(m)),
    coolTargets,
    c.stretches,
    { preferStanding: beginner },
  );
  const coolMoves = [
    dose(walk, { seconds: c.walkSec }),
    ...stretches.map((m) => dose(m, { seconds: holdSec })),
    dose(breathe, { seconds: c.breatheSec }),
  ];
  rationale.push('Static stretches are in the cool-down, after training, when your muscles are warm.');

  const total = (moves) => moves.reduce((s, m) => s + m.estSeconds, 0);
  const warmSeconds = total(warmMoves);
  const coolSeconds = total(coolMoves);

  return {
    level,
    applicable: true,
    regions,
    warmup: { minutes: Math.max(1, Math.round(warmSeconds / 60)), totalSeconds: warmSeconds, moves: warmMoves, notes: warmNotes },
    cooldown: { minutes: Math.max(1, Math.round(coolSeconds / 60)), totalSeconds: coolSeconds, moves: coolMoves, notes: [] },
    rationale,
  };
}

module.exports = { recommendRoutine, dayRegions, regionsForExercise, CONFIG };
