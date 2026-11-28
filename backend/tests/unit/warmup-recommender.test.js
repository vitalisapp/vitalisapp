// tests/unit/warmup-recommender.test.js — Revision #3: personalized warm-up
// and stretching. Pure + mocked DB.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { recommendRoutine, dayRegions } = require('../../src/utils/warmupRecommender');
const { WARMUP_MOVES, COOLDOWN_MOVES } = require('../../src/constants/warmupMoves');
const { EXCLUSION_CATEGORIES } = require('../../src/constants/exercisePool');

const LOWER = { title: 'Day 1 — Lower Body Strength', activity_type: 'Workout', exercises: [{ name: 'Goblet Squat' }, { name: 'Romanian Deadlift' }, { name: 'Reverse Lunge' }, { name: 'Plank' }] };
const UPPER = { title: 'Upper Body Push', activity_type: 'Workout', exercises: [{ name: 'Push-Ups' }, { name: 'Dumbbell Shoulder Press' }, { name: 'Bent-Over Row' }] };
const CARDIO = { title: 'Cardio Intervals', activity_type: 'Workout', exercises: [{ name: 'Jumping Jacks' }, { name: 'Mountain Climbers' }, { name: 'Bodyweight Squat' }] };
const byKey = new Map([...WARMUP_MOVES, ...COOLDOWN_MOVES].map((m) => [m.key, m]));
const meta = (move) => byKey.get(move.key);

describe('movement library', () => {
  it('every move has instructions, a cue and an easier version', () => {
    const keys = new Set();
    const flags = new Set(EXCLUSION_CATEGORIES.map((c) => c.key));
    for (const m of [...WARMUP_MOVES, ...COOLDOWN_MOVES]) {
      assert.ok(!keys.has(m.key), `duplicate ${m.key}`);
      keys.add(m.key);
      assert.ok(m.steps.length >= 1 && m.cue, m.key);
      assert.ok(m.easier?.name && m.easier.steps.length >= 1, `${m.key} easier`);
      for (const f of m.flags) assert.ok(flags.has(f), `${m.key} flag ${f}`);
    }
  });

  it('static stretches only exist in the cool-down', () => {
    assert.ok(WARMUP_MOVES.every((m) => m.kind !== 'static'));
    assert.ok(COOLDOWN_MOVES.some((m) => m.kind === 'static'));
  });
});

describe('beginner vs advanced', () => {
  const beginner = recommendRoutine({ experience: 'BEGINNER', goals: ['LOSE_WEIGHT'], day: LOWER });
  const advanced = recommendRoutine({ experience: 'ADVANCED', goals: ['BUILD_MUSCLE'], day: LOWER });

  it('beginners get a gentle, low-impact, standing warm-up of about 5 minutes', () => {
    assert.equal(beginner.level, 'BEGINNER');
    assert.ok(beginner.warmup.minutes >= 4 && beginner.warmup.minutes <= 6, `${beginner.warmup.minutes} min`);
    for (const m of beginner.warmup.moves) {
      const lib = meta(m);
      assert.equal(lib.level, 1, m.name);
      assert.equal(lib.impact, 'low', m.name);
      assert.ok(!lib.flags.includes('FLOOR') && !lib.flags.includes('KNEELING'), m.name);
      assert.notEqual(lib.kind, 'static', m.name);
    }
    assert.ok(beginner.cooldown.moves.every((m) => !meta(m).flags.includes('FLOOR')));
    assert.deepEqual(beginner.warmup.notes, []); // no ramp-up sets for beginners
  });

  it('advanced users get a longer, more dynamic warm-up with ramp-up sets', () => {
    assert.ok(advanced.warmup.totalSeconds > beginner.warmup.totalSeconds);
    assert.ok(advanced.warmup.moves.length > beginner.warmup.moves.length);
    assert.ok(advanced.warmup.moves.some((m) => meta(m).level >= 2));
    assert.match(advanced.warmup.notes[0], /ramp-up sets of Goblet Squat/);
  });

  it('warm-ups go pulse → dynamic → activation; cool-downs end with breathing', () => {
    const order = { pulse: 0, dynamic: 1, activation: 2 };
    const kinds = advanced.warmup.moves.map((m) => order[m.kind]);
    assert.deepEqual(kinds, [...kinds].sort((a, b) => a - b));
    assert.equal(advanced.cooldown.moves[0].key, 'walk_it_out');
    assert.equal(advanced.cooldown.moves.at(-1).key, 'deep_breathing');
  });

  it('a missing fitness level defaults to the safest (beginner) routine', () => {
    assert.equal(recommendRoutine({ day: LOWER }).level, 'BEGINNER');
  });

  it('every returned move carries a dose, instructions and an easier version', () => {
    for (const m of [...advanced.warmup.moves, ...advanced.cooldown.moves]) {
      assert.ok((m.seconds > 0) !== (m.reps > 0), `${m.name} has exactly one dose`);
      assert.ok(m.estSeconds > 0 && m.steps.length && m.easier.name, m.name);
    }
  });
});

describe('matches the planned workout', () => {
  it('detects regions from pool and curated exercise names', () => {
    assert.deepEqual(dayRegions(LOWER).slice(0, 1), ['lower']);
    assert.deepEqual(dayRegions(UPPER), ['upper']);
    assert.equal(dayRegions(CARDIO)[0], 'cardio');
    assert.deepEqual(dayRegions({ title: 'Something', exercises: [] }), ['full']);
  });

  it('upper-body days prepare and stretch the upper body', () => {
    const r = recommendRoutine({ experience: 'INTERMEDIATE', day: UPPER });
    assert.ok(r.warmup.moves.filter((m) => m.regions.includes('upper')).length >= 2);
    assert.ok(r.cooldown.moves.filter((m) => m.regions.includes('upper')).length >= 2);
  });

  it('cardio days get a longer pulse raiser and an easy-start note, no ramp-up sets', () => {
    const plain = recommendRoutine({ experience: 'INTERMEDIATE', day: UPPER });
    const cardio = recommendRoutine({ experience: 'INTERMEDIATE', day: CARDIO });
    assert.ok(cardio.warmup.moves[0].seconds > plain.warmup.moves[0].seconds);
    assert.match(cardio.warmup.notes.join(' '), /easy pace/);
    assert.ok(!cardio.warmup.notes.some((n) => /ramp-up/.test(n)));
  });

  it('recovery / mobility days need no extra routine', () => {
    for (const type of ['Recovery', 'Mobility', 'Flexibility']) {
      const r = recommendRoutine({ experience: 'ADVANCED', day: { activity_type: type, exercises: [] } });
      assert.equal(r.applicable, false, type);
    }
  });
});

describe('safety', () => {
  it('never suggests moves from excluded categories', () => {
    const r = recommendRoutine({ experience: 'ADVANCED', day: LOWER, excludedCategories: ['HIGH_IMPACT', 'FLOOR', 'KNEELING', 'WRIST_LOAD'] });
    for (const m of [...r.warmup.moves, ...r.cooldown.moves]) {
      const lib = meta(m);
      assert.equal(lib.impact, 'low', m.name);
      assert.ok(!lib.flags.some((f) => ['HIGH_IMPACT', 'FLOOR', 'KNEELING', 'WRIST_LOAD'].includes(f)), m.name);
    }
  });

  it('the BMI low-impact rule removes high-impact moves for advanced users', () => {
    const r = recommendRoutine({ experience: 'ADVANCED', day: CARDIO, lowImpact: true });
    assert.ok(r.warmup.moves.every((m) => meta(m).impact === 'low'));
  });

  it('adults 65+ hold stretches longer', () => {
    const young = recommendRoutine({ experience: 'BEGINNER', day: LOWER, age: 30 });
    const older = recommendRoutine({ experience: 'BEGINNER', day: LOWER, age: 70 });
    const hold = (r) => r.cooldown.moves.find((m) => m.kind === 'static' && m.key !== 'deep_breathing').seconds;
    assert.equal(hold(young), 30);
    assert.equal(hold(older), 45);
  });
});

describe('GET routine service', () => {
  it('builds the routine from the stored day and the user profile', async () => {
    const dbPath = require.resolve('../../src/config/db');
    const servicePath = require.resolve('../../src/services/plans.service');
    const prefsPath = require.resolve('../../src/services/trainingPrefs.service');
    const execute = async (sql, params = []) => {
      // Plan ownership lookup: plan 5 is a shared template, plan 6 belongs to user 77.
      if (/FROM plans WHERE id = \? LIMIT 1/.test(sql)) {
        return [[{ id: params[0], owner_user_id: params[0] === 6 ? 77 : null }]];
      }
      if (/FROM plan_contents WHERE plan_id = \? AND day_number = \?/.test(sql)) {
        if (params[1] !== 2) return [[]];
        return [[{ id: 9, day_number: 2, title: 'Upper Body Push', activity_type: 'Workout', duration_mins: 30 }]];
      }
      if (/FROM plan_exercises WHERE plan_content_id = \?/.test(sql)) return [[{ name: 'Push-Ups' }, { name: 'Bent-Over Row' }]];
      if (/FROM fitness_goals/.test(sql)) {
        return [[{ goal_type: 'BUILD_MUSCLE', secondary_goals: '', experience_level: 'ADVANCED', dob: null, bmi: 32, activity_level: 'ACTIVE' }]];
      }
      return [[]];
    };
    const realDb = require.cache[dbPath];
    require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { execute, query: execute } };
    const realPrefs = require.cache[prefsPath];
    require.cache[prefsPath] = { id: prefsPath, filename: prefsPath, loaded: true, exports: { get: async () => ({ excludedCategories: ['WRIST_LOAD'] }) } };
    delete require.cache[servicePath];
    try {
      const service = require(servicePath);
      const r = await service.getDayRoutine(1, 5, 2);
      assert.equal(r.level, 'ADVANCED');
      assert.deepEqual(r.regions, ['upper']);
      // BMI 32 → low-impact even for advanced; WRIST_LOAD excluded → no inchworms.
      assert.ok(r.warmup.moves.every((m) => meta(m).impact === 'low'));
      assert.ok(!r.warmup.moves.some((m) => m.key === 'inchworm'));
      // Unknown day → 404, never a generic routine.
      await assert.rejects(service.getDayRoutine(1, 5, 99), (e) => e.code === 'PLAN_DAY_NOT_FOUND' && e.status === 404);
      // Someone else's personal plan is a 404 too — its existence is not revealed.
      await assert.rejects(service.getDayRoutine(1, 6, 2), (e) => e.code === 'PLAN_DAY_NOT_FOUND' && e.status === 404);
      // …but its owner can read it.
      assert.equal((await service.getDayRoutine(77, 6, 2)).level, 'ADVANCED');
    } finally {
      if (realDb) require.cache[dbPath] = realDb; else delete require.cache[dbPath];
      if (realPrefs) require.cache[prefsPath] = realPrefs; else delete require.cache[prefsPath];
      delete require.cache[servicePath];
    }
  });
});
