// tests/unit/energy-burn.test.js — MET-based workout calorie estimate (no DB).
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  metForWorkout, estimateWorkoutKcal, sanitizeWeight, DEFAULT_MET, DEFAULT_WEIGHT_KG,
} = require('../../src/utils/energyBurn');
const { workoutKcal, addDaysISO } = require('../../src/services/energy.service');

describe('metForWorkout', () => {
  it('maps common workout types', () => {
    assert.equal(metForWorkout('running'), 9.8);
    assert.equal(metForWorkout('Cycling'), 7.5);
    assert.equal(metForWorkout('yoga'), 2.5);
    assert.equal(metForWorkout('Strength'), 5.0);
    assert.equal(metForWorkout('push-up'), 4.0);
    assert.equal(metForWorkout('plank'), 3.8);
    assert.equal(metForWorkout('HIIT circuit'), 8.0);
  });

  it('matches on word starts only ("crunch" is not a run)', () => {
    assert.equal(metForWorkout('crunch'), 4.0);
    assert.equal(metForWorkout('barbell row'), 5.0);
    assert.equal(metForWorkout('rowing machine'), 7.0);
  });

  it('falls back to a moderate MET for unknown/blank types', () => {
    assert.equal(metForWorkout('general'), DEFAULT_MET);
    assert.equal(metForWorkout(''), DEFAULT_MET);
    assert.equal(metForWorkout(null), DEFAULT_MET);
  });
});

describe('estimateWorkoutKcal', () => {
  it('uses NET kcal: (MET − 1) × kg × hours', () => {
    // 30 min running at 70 kg: (9.8 − 1) × 70 × 0.5 = 308
    assert.equal(estimateWorkoutKcal({ workoutType: 'run', durationSeconds: 1800, weightKg: 70 }), 308);
  });

  it('scales with body weight and duration', () => {
    const light = estimateWorkoutKcal({ workoutType: 'strength', durationSeconds: 3600, weightKg: 60 });
    const heavy = estimateWorkoutKcal({ workoutType: 'strength', durationSeconds: 3600, weightKg: 90 });
    assert.ok(heavy > light);
    assert.equal(estimateWorkoutKcal({ workoutType: 'strength', durationSeconds: 3600, weightKg: 80 }), 320);
  });

  it('harder self-rated sessions burn more', () => {
    const base = { workoutType: 'strength', durationSeconds: 2700, weightKg: 75 };
    const easy = estimateWorkoutKcal({ ...base, difficulty: 1 });
    const mid = estimateWorkoutKcal({ ...base, difficulty: 3 });
    const hard = estimateWorkoutKcal({ ...base, difficulty: 5 });
    assert.ok(easy < mid && mid < hard);
    assert.equal(mid, estimateWorkoutKcal(base)); // no rating = neutral
  });

  it('returns 0 for missing/negative duration and clamps absurd sessions', () => {
    assert.equal(estimateWorkoutKcal({ workoutType: 'run', durationSeconds: 0 }), 0);
    assert.equal(estimateWorkoutKcal({ workoutType: 'run', durationSeconds: -50 }), 0);
    assert.ok(estimateWorkoutKcal({ workoutType: 'jump rope', durationSeconds: 86400, weightKg: 200 }) <= 3000);
  });

  it('ignores implausible body weights', () => {
    assert.equal(sanitizeWeight(5), DEFAULT_WEIGHT_KG);
    assert.equal(sanitizeWeight('abc'), DEFAULT_WEIGHT_KG);
    assert.equal(sanitizeWeight(82.5), 82.5);
  });
});

describe('energy.service helpers', () => {
  it('prefers the stored session value, estimates legacy rows', () => {
    assert.equal(workoutKcal({ calories_burned: 123, workout_type: 'run', duration_seconds: 3600 }, 70), 123);
    assert.equal(workoutKcal({ calories_burned: null, workout_type: 'run', duration_seconds: 1800 }, 70), 308);
  });

  it('addDaysISO crosses month boundaries', () => {
    assert.equal(addDaysISO('2026-01-31', 1), '2026-02-01');
  });
});

describe('goal-aware eat-back', () => {
  const { eatBackFactor, creditedKcal } = require('../../src/utils/energyBurn');

  it('credits half the burn when losing weight, all of it when gaining', () => {
    assert.equal(creditedKcal(400, 'LOSE_WEIGHT'), 200);
    assert.equal(creditedKcal(400, 'MAINTAIN_WEIGHT'), 300);
    assert.equal(creditedKcal(400, 'GAIN_WEIGHT'), 400);
    assert.equal(creditedKcal(400, 'BUILD_MUSCLE'), 400);
    assert.equal(creditedKcal(400, 'PERFORMANCE'), 400);
  });

  it('defaults to maintenance for unknown/missing goals and never goes negative', () => {
    assert.equal(eatBackFactor(null), 0.75);
    assert.equal(eatBackFactor('lose_weight'), 0.5);
    assert.equal(creditedKcal(-50, 'GAIN_WEIGHT'), 0);
  });
});
