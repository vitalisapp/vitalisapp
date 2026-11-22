// Workout recommender (Section 3) — pure, no I/O.
//
// Builds a 7-day plan for ONE goal from the user's health assessment and
// preferences, and explains every decision in `rationale` so the user (and the
// panel) can see why each choice was made:
//   goal            → day templates (what each training day focuses on)
//   experience      → max exercise difficulty, sets/reps, training days
//   activity level  → caps training days for sedentary users
//   BMI / age       → safety: low-impact only when BMI ≥ 30 (or ≥ 25 and
//                     sedentary); under-18s skip heavy barbell work
//   session minutes → exercises per session
//   equipment       → which variations are possible (bodyweight always)
//   exclusions      → categories and specific exercises never recommended
const { EXERCISES, EXCLUSION_CATEGORIES } = require('../constants/exercisePool');
const { classifyBmi } = require('./health');

const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const EXCLUSION_KEYS = EXCLUSION_CATEGORIES.map((c) => c.key);
const MAX_LEVEL = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 };
const BASE_DAYS = { BEGINNER: 3, INTERMEDIATE: 4, ADVANCED: 5 };

// Which day numbers (1–7) train, by training-day count. Rest days spread out.
const TRAIN_DAY_LAYOUT = {
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 5, 6],
  6: [1, 2, 3, 4, 5, 6],
};

// Day templates per goal: a title + ordered movement slots. Sessions take the
// first N slots, where N comes from the session length.
const TEMPLATES = {
  LOSE_WEIGHT: [
    { title: 'Full-Body Strength Circuit', focus: 'circuit', slots: ['squat', 'push', 'hinge', 'pull', 'cardio', 'core'] },
    { title: 'Cardio Conditioning', focus: 'cardio', slots: ['cardio', 'lunge', 'cardio', 'core', 'cardio', 'glute'] },
    { title: 'Lower Body + Core', focus: 'circuit', slots: ['squat', 'glute', 'lunge', 'core', 'cardio', 'hinge'] },
    { title: 'Cardio Intervals', focus: 'cardio', slots: ['cardio', 'squat', 'cardio', 'core', 'cardio', 'push'] },
    { title: 'Upper Body + Core', focus: 'circuit', slots: ['push', 'pull', 'core', 'push', 'pull', 'cardio'] },
    { title: 'Active Conditioning', focus: 'cardio', slots: ['cardio', 'lunge', 'core', 'cardio', 'glute', 'pull'] },
  ],
  BUILD_MUSCLE: [
    { title: 'Lower Body Strength', focus: 'strength', slots: ['squat', 'hinge', 'lunge', 'glute', 'core', 'squat'] },
    { title: 'Upper Body Push', focus: 'strength', slots: ['push', 'push', 'pull', 'push', 'core', 'pull'] },
    { title: 'Upper Body Pull + Core', focus: 'strength', slots: ['pull', 'pull', 'push', 'core', 'pull', 'core'] },
    { title: 'Full-Body Strength', focus: 'strength', slots: ['squat', 'push', 'hinge', 'pull', 'lunge', 'core'] },
    { title: 'Glutes + Legs', focus: 'strength', slots: ['glute', 'lunge', 'hinge', 'squat', 'core', 'glute'] },
    { title: 'Upper Body Volume', focus: 'strength', slots: ['push', 'pull', 'push', 'pull', 'core', 'push'] },
  ],
  PERFORMANCE: [
    { title: 'Strength Foundation', focus: 'strength', slots: ['squat', 'push', 'hinge', 'pull', 'core', 'lunge'] },
    { title: 'Power + Conditioning', focus: 'power', slots: ['squat', 'cardio', 'hinge', 'cardio', 'core', 'push'] },
    { title: 'Endurance Cardio', focus: 'cardio', slots: ['cardio', 'cardio', 'core', 'lunge', 'cardio', 'mobility'] },
    { title: 'Full-Body Strength', focus: 'strength', slots: ['lunge', 'pull', 'glute', 'push', 'core', 'squat'] },
    { title: 'Agility + Core', focus: 'power', slots: ['cardio', 'lunge', 'core', 'cardio', 'core', 'glute'] },
    { title: 'Conditioning Mix', focus: 'cardio', slots: ['cardio', 'squat', 'cardio', 'push', 'core', 'cardio'] },
  ],
  MAINTAIN_WEIGHT: [
    { title: 'Full-Body Strength', focus: 'balanced', slots: ['squat', 'push', 'hinge', 'pull', 'core', 'cardio'] },
    { title: 'Cardio + Core', focus: 'cardio', slots: ['cardio', 'core', 'cardio', 'glute', 'core', 'cardio'] },
    { title: 'Full-Body Strength B', focus: 'balanced', slots: ['lunge', 'pull', 'glute', 'push', 'core', 'squat'] },
    { title: 'Mobility + Light Cardio', focus: 'mobility', slots: ['mobility', 'cardio', 'mobility', 'core', 'mobility', 'cardio'] },
    { title: 'Upper + Lower Mix', focus: 'balanced', slots: ['push', 'squat', 'pull', 'lunge', 'core', 'cardio'] },
    { title: 'Active Recovery Plus', focus: 'mobility', slots: ['cardio', 'mobility', 'glute', 'mobility', 'core', 'mobility'] },
  ],
};
TEMPLATES.GAIN_WEIGHT = TEMPLATES.BUILD_MUSCLE;

// Sets / reps / holds by focus and experience.
const RX = {
  strength: { BEGINNER: { sets: 3, reps: '10', hold: 30, rest: 75 }, INTERMEDIATE: { sets: 4, reps: '8-10', hold: 40, rest: 90 }, ADVANCED: { sets: 4, reps: '6-8', hold: 45, rest: 120 } },
  circuit: { BEGINNER: { sets: 2, reps: '12', hold: 30, rest: 45 }, INTERMEDIATE: { sets: 3, reps: '12-15', hold: 40, rest: 40 }, ADVANCED: { sets: 3, reps: '15', hold: 45, rest: 30 } },
  cardio: { BEGINNER: { sets: 3, reps: '10', hold: 30, rest: 45 }, INTERMEDIATE: { sets: 4, reps: '12', hold: 40, rest: 30 }, ADVANCED: { sets: 4, reps: '15', hold: 45, rest: 20 } },
  power: { BEGINNER: { sets: 3, reps: '8', hold: 25, rest: 75 }, INTERMEDIATE: { sets: 4, reps: '6', hold: 30, rest: 90 }, ADVANCED: { sets: 5, reps: '5', hold: 35, rest: 120 } },
  balanced: { BEGINNER: { sets: 3, reps: '10', hold: 30, rest: 60 }, INTERMEDIATE: { sets: 3, reps: '10-12', hold: 40, rest: 60 }, ADVANCED: { sets: 4, reps: '10', hold: 45, rest: 60 } },
  mobility: { BEGINNER: { sets: 2, reps: '8', hold: 40, rest: 20 }, INTERMEDIATE: { sets: 2, reps: '10', hold: 45, rest: 20 }, ADVANCED: { sets: 2, reps: '10', hold: 60, rest: 20 } },
};
// Steady cardio (walking, cycling, running) is prescribed in minutes.
const STEADY_CARDIO = new Set(['Walking', 'Running', 'Cycling']);

const EQUIP_FROM_PREF = {
  dumbbell: 'dumbbell', dumbbells: 'dumbbell',
  kettlebell: 'kettlebell', kettlebells: 'kettlebell',
  'resistance band': 'band', 'resistance bands': 'band', band: 'band', bands: 'band',
  'pull-up bar': 'pullup', 'pull up bar': 'pullup', pullup: 'pullup',
  barbell: 'barbell',
  'cardio equipment': 'cardio', machines: 'cardio',
};

function normKey(s) { return String(s || '').trim().toLowerCase(); }

function availableEquipment(prefEquipment) {
  const set = new Set(['bodyweight']);
  for (const e of Array.isArray(prefEquipment) ? prefEquipment : []) {
    const mapped = EQUIP_FROM_PREF[normKey(e)];
    if (mapped) set.add(mapped);
  }
  return set;
}

function exercisesPerSession(minutes) {
  const m = Number(minutes) || 30;
  if (m <= 20) return 3;
  if (m <= 30) return 4;
  if (m <= 45) return 5;
  return 6;
}

function cleanList(list, allowed = null, max = 50) {
  const out = [];
  for (const v of Array.isArray(list) ? list : []) {
    if (typeof v !== 'string') continue;
    const t = v.trim();
    if (!t || t.length > 80) continue;
    if (allowed && !allowed.includes(t)) continue;
    if (!out.includes(t)) out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * @param {object} input
 * @param {string} input.goalType
 * @param {string} [input.experience]       BEGINNER | INTERMEDIATE | ADVANCED
 * @param {string} [input.activityLevel]
 * @param {number} [input.bmi]
 * @param {number} [input.age]
 * @param {number} [input.sessionMinutes]
 * @param {string[]} [input.equipment]      training_preferences equipment labels
 * @param {number[]} [input.preferredDays]  0–6; only the COUNT is used here
 * @param {string[]} [input.excludedCategories]
 * @param {string[]} [input.excludedExercises] exercise names
 * @param {string[]} [input.secondaryGoals]
 */
function recommendPlan(input = {}) {
  const goalType = TEMPLATES[input.goalType] ? input.goalType : 'MAINTAIN_WEIGHT';
  const experience = EXPERIENCE_LEVELS.includes(input.experience) ? input.experience : 'BEGINNER';
  const rationale = [];
  const bmiClass = classifyBmi(input.bmi);
  const age = Number(input.age);
  const sedentary = input.activityLevel === 'SEDENTARY';

  // ── Training days ────────────────────────────────────────────────────
  let days = BASE_DAYS[experience];
  const prefCount = Array.isArray(input.preferredDays) ? new Set(input.preferredDays).size : 0;
  if (prefCount >= 2) {
    days = Math.min(6, prefCount);
    rationale.push(`${days} training days a week to match the days you said you can train.`);
  } else {
    rationale.push(`${days} training days a week, a good fit for ${experience.toLowerCase()} level.`);
  }
  if (sedentary && days > 3) {
    days = 3;
    rationale.push('Capped at 3 days because you are currently sedentary; building the habit first prevents burnout and soreness.');
  }
  days = Math.max(2, Math.min(6, days));

  // ── Safety filters ───────────────────────────────────────────────────
  const excludedCats = new Set(cleanList(input.excludedCategories, EXCLUSION_KEYS));
  const excludedNames = new Set(cleanList(input.excludedExercises).map(normKey));
  const autoLowImpact = bmiClass && (bmiClass.key === 'OBESE' || (bmiClass.key === 'OVERWEIGHT' && sedentary));
  if (autoLowImpact && !excludedCats.has('HIGH_IMPACT')) {
    rationale.push(`Low-impact moves only (no jumping or running) because your BMI is in the ${bmiClass.label} range${bmiClass.key === 'OVERWEIGHT' ? ' and you are just starting out' : ''}. This protects your knees and ankles while you build up.`);
  }
  const noHeavy = Number.isFinite(age) && age > 0 && age < 18;
  if (noHeavy) rationale.push('Heavy barbell lifts are left out because you are under 18; bodyweight and dumbbell work builds a safer foundation.');
  if (bmiClass?.key === 'UNDERWEIGHT') rationale.push('Cardio is kept short because your BMI is in the Underweight range; strength work and enough food matter most for you.');

  const equip = availableEquipment(input.equipment);
  const extra = [...equip].filter((e) => e !== 'bodyweight');
  rationale.push(extra.length
    ? `Uses your equipment (${extra.join(', ')}) plus bodyweight moves.`
    : 'Bodyweight only, so you can train anywhere with no equipment.');

  const perSession = exercisesPerSession(input.sessionMinutes);
  rationale.push(`${perSession} exercises per session to fit about ${Number(input.sessionMinutes) || 30} minutes.`);

  if (excludedCats.size) {
    const labels = EXCLUSION_CATEGORIES.filter((c) => excludedCats.has(c.key)).map((c) => c.label.toLowerCase());
    rationale.push(`Left out as you asked: ${labels.join(', ')}.`);
  }
  if (excludedNames.size) rationale.push(`${excludedNames.size} exercise${excludedNames.size === 1 ? '' : 's'} you marked "don't recommend" ${excludedNames.size === 1 ? 'is' : 'are'} skipped.`);

  const maxLevel = MAX_LEVEL[experience];
  const allowed = (ex, { relaxLevel = false } = {}) => {
    if (!equip.has(ex.equip)) return false;
    if (!relaxLevel && ex.level > maxLevel) return false;
    if (excludedNames.has(normKey(ex.name))) return false;
    if (ex.flags.some((f) => excludedCats.has(f))) return false;
    if (autoLowImpact && ex.impact === 'high') return false;
    if (noHeavy && ex.flags.includes('HEAVY_LIFTING')) return false;
    return true;
  };

  // Prefer equipment variations for strength slots when the user has gear;
  // otherwise prefer the hardest level the user is allowed (more stimulus).
  const rank = (ex) => (ex.equip !== 'bodyweight' && ex.pattern !== 'cardio' && ex.pattern !== 'mobility' ? 10 : 0) + ex.level;
  const byPattern = {};
  for (const ex of EXERCISES) (byPattern[ex.pattern] = byPattern[ex.pattern] || []).push(ex);

  const pick = (pattern, used, rotate) => {
    const tryPatterns = [pattern, ...(FALLBACK[pattern] || [])];
    for (const relaxLevel of [false, true]) {
      for (const p of tryPatterns) {
        const cands = (byPattern[p] || []).filter((ex) => allowed(ex, { relaxLevel: relaxLevel && ex.level <= maxLevel + 1 && experience !== 'BEGINNER' }) && !used.has(ex.name));
        if (cands.length) {
          cands.sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name));
          // Rotate within the top choices so days are not identical.
          const top = cands.slice(0, Math.min(3, cands.length));
          return top[rotate % top.length];
        }
      }
    }
    return null;
  };

  const rxFor = (ex, focus) => {
    const base = RX[focus]?.[experience] || RX.balanced[experience];
    const underweightCardio = bmiClass?.key === 'UNDERWEIGHT' && ex.pattern === 'cardio';
    if (STEADY_CARDIO.has(ex.name)) {
      const mins = { BEGINNER: 10, INTERMEDIATE: 15, ADVANCED: 20 }[experience] - (underweightCardio ? 5 : 0);
      return { sets: 1, reps: null, duration_seconds: mins * 60, rest_seconds: null };
    }
    if (ex.measure === 'time') {
      return { sets: underweightCardio ? Math.max(2, base.sets - 1) : base.sets, reps: null, duration_seconds: base.hold, rest_seconds: base.rest };
    }
    const perSide = /Lunge|Split Squat|Step-Up|One-Arm|Side Plank/.test(ex.name);
    return { sets: base.sets, reps: perSide ? `${base.reps} each side` : base.reps, duration_seconds: null, rest_seconds: base.rest };
  };

  // ── Build the 7 days ─────────────────────────────────────────────────
  const trainDays = TRAIN_DAY_LAYOUT[days];
  const templates = TEMPLATES[goalType];
  const recoveryPool = ['Cat-Cow Stretch', "World's Greatest Stretch", 'Hamstring Stretch', 'Standing Quad Stretch', "Child's Pose", 'Arm Circles']
    .map((n) => EXERCISES.find((e) => e.name === n))
    .filter((ex) => ex && allowed(ex, { relaxLevel: true }));

  let t = 0;
  const schedule = [];
  for (let day = 1; day <= 7; day += 1) {
    if (!trainDays.includes(day)) {
      const stretches = recoveryPool.slice((day % 2) * 1, (day % 2) * 1 + 3);
      schedule.push({
        day_number: day,
        title: `Day ${day} — Recovery`,
        activity_type: 'Recovery',
        description: 'Rest day. Go for an easy walk and do these gentle stretches to help your muscles recover.',
        duration_mins: 15,
        exercises: stretches.map((ex, i) => ({ exercise_order: i + 1, exercise_name: ex.name, sets: 1, reps: null, duration_seconds: 45, rest_seconds: null, notes: ex.cues[0] || null })),
      });
      continue;
    }
    const tpl = templates[t % templates.length];
    const used = new Set();
    const exercises = [];
    for (const slot of tpl.slots) {
      if (exercises.length >= perSession) break;
      const ex = pick(slot, used, t + exercises.length);
      if (!ex) continue;
      used.add(ex.name);
      exercises.push({ exercise_order: exercises.length + 1, exercise_name: ex.name, ...rxFor(ex, tpl.focus), notes: ex.cues[0] || null });
    }
    schedule.push({
      day_number: day,
      title: `Day ${day} — ${tpl.title}`,
      activity_type: 'Workout',
      description: DAY_DESCRIPTIONS[tpl.focus],
      duration_mins: Math.max(15, Math.min(180, Number(input.sessionMinutes) || 30)),
      exercises,
    });
    t += 1;
  }

  const secondary = cleanList(input.secondaryGoals).filter((g) => g !== goalType && TEMPLATES[g]);
  if (secondary.length) {
    rationale.push(`Your other goal${secondary.length > 1 ? 's' : ''} (${secondary.map(humanGoal).join(', ')}) ${secondary.length > 1 ? 'have' : 'has'} its own plan; switch to it anytime in My Plans.`);
  }

  return {
    goalType,
    experience,
    trainingDays: days,
    exercisesPerSession: perSession,
    lowImpact: Boolean(autoLowImpact || excludedCats.has('HIGH_IMPACT')),
    rationale,
    schedule,
  };
}

const FALLBACK = {
  squat: ['lunge', 'glute'],
  lunge: ['squat', 'glute'],
  hinge: ['glute', 'squat'],
  glute: ['hinge', 'lunge'],
  push: ['core'],
  pull: ['core'],
  core: ['mobility'],
  cardio: ['lunge', 'squat'],
  mobility: ['core'],
};

const DAY_DESCRIPTIONS = {
  strength: 'Warm up 5 minutes, then lift with good form. Rest fully between sets so every set is strong. Cool down with light stretching.',
  circuit: 'Do the exercises back to back as a circuit, resting only between rounds. Keep a steady pace you can sustain.',
  cardio: 'Keep your heart rate up. Work at an effort where talking is hard but possible, and slow down if you feel dizzy.',
  power: 'Fast, explosive reps with full rest. Quality beats quantity; stop a set when your speed drops.',
  balanced: 'A mix of strength and movement. Warm up first and finish with a short cool-down.',
  mobility: 'Easy, controlled movement to keep you moving well. Breathe slowly and never force a stretch.',
};

function humanGoal(g) {
  return String(g).toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

/** Public exercise guide (instructions) for the frontend. */
function exerciseGuide() {
  return EXERCISES.map(({ name, pattern, equip, level, impact, flags, measure, muscle, steps, cues, mistakes }) => ({
    name, pattern, equip, level, impact, flags, measure, muscle, steps, cues, mistakes,
  }));
}

module.exports = {
  EXPERIENCE_LEVELS,
  EXCLUSION_CATEGORIES,
  EXCLUSION_KEYS,
  recommendPlan,
  exerciseGuide,
  exercisesPerSession,
  availableEquipment,
};
