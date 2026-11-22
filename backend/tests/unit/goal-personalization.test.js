// tests/unit/goal-personalization.test.js — Section 3: multi-goal setup,
// target-date realism, recomposition calories and the workout recommender.
// Pure, no DB.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { parseSecondaryGoals, parseExperience, checkTargetDate } = require('../../src/utils/goalSetup');
const { generatePlan } = require('../../src/utils/planEngine');
const { recommendPlan, exerciseGuide } = require('../../src/utils/workoutRecommender');
const { EXERCISES } = require('../../src/constants/exercisePool');

const allNames = (plan) => plan.schedule.flatMap((d) => d.exercises.map((e) => e.exercise_name));
const byName = (n) => EXERCISES.find((e) => e.name === n);

describe('extra goals', () => {
  it('accepts up to 2 extras, drops the primary and duplicates', () => {
    assert.deepEqual(parseSecondaryGoals(['build_muscle', 'LOSE_WEIGHT', 'BUILD_MUSCLE'], 'LOSE_WEIGHT').value, ['BUILD_MUSCLE']);
    assert.deepEqual(parseSecondaryGoals('BUILD_MUSCLE,PERFORMANCE', 'LOSE_WEIGHT').value, ['BUILD_MUSCLE', 'PERFORMANCE']);
    assert.equal(parseSecondaryGoals(undefined, 'LOSE_WEIGHT').value, undefined);
  });
  it('rejects more than 2 and contradictory weight goals', () => {
    assert.equal(parseSecondaryGoals(['BUILD_MUSCLE', 'PERFORMANCE', 'MAINTAIN_WEIGHT'], 'LOSE_WEIGHT').code, 'TOO_MANY_GOALS');
    assert.equal(parseSecondaryGoals(['GAIN_WEIGHT'], 'LOSE_WEIGHT').code, 'CONFLICTING_GOALS');
    assert.equal(parseSecondaryGoals(['MAINTAIN_WEIGHT'], 'GAIN_WEIGHT').code, 'CONFLICTING_GOALS');
    assert.equal(parseSecondaryGoals(['NOPE'], 'LOSE_WEIGHT').code, 'INVALID_SECONDARY_GOAL');
  });
  it('validates experience level', () => {
    assert.equal(parseExperience('beginner').value, 'BEGINNER');
    assert.equal(parseExperience('pro').code, 'INVALID_EXPERIENCE');
  });
});

describe('target date', () => {
  const now = new Date('2026-11-21T08:00:00Z');
  it('must be 2 weeks to 2 years out', () => {
    assert.equal(checkTargetDate({ targetDate: '2026-11-30', now }).code, 'TARGET_DATE_TOO_SOON');
    assert.equal(checkTargetDate({ targetDate: '2029-01-01', now }).code, 'TARGET_DATE_TOO_FAR');
    assert.equal(checkTargetDate({ targetDate: '2027-02-30', now }).code, 'INVALID_TARGET_DATE');
  });
  it('flags unrealistic loss and suggests a safer date', () => {
    const r = checkTargetDate({ targetDate: '2027-01-15', weightKg: 85, targetWeightKg: 75, now });
    assert.equal(r.value, '2027-01-15');
    assert.equal(r.feasibility.realistic, false);
    assert.equal(r.feasibility.safeMaxPerWeek, 0.85);
    assert.ok(r.feasibility.suggestedDate > '2027-01-15');
  });
  it('accepts a realistic gain', () => {
    const r = checkTargetDate({ targetDate: '2027-05-21', weightKg: 55, targetWeightKg: 60, now });
    assert.equal(r.feasibility.realistic, true);
    assert.equal(r.feasibility.direction, 'up');
  });
});

describe('recomposition calories', () => {
  const body = { weightKg: 85, heightCm: 170, dob: '1995-01-01', sex: 'male', activityLevel: 'LIGHTLY_ACTIVE', pace: 'MODERATE' };
  it('lose + build muscle → gentle deficit (≤300) and high protein', () => {
    const plain = generatePlan({ ...body, goalType: 'LOSE_WEIGHT' });
    const recomp = generatePlan({ ...body, goalType: 'LOSE_WEIGHT', secondaryGoals: ['BUILD_MUSCLE'] });
    assert.equal(recomp.recomposition, true);
    assert.equal(recomp.dailyKcal, recomp.tdee - 300);
    assert.ok(recomp.proteinG > plain.proteinG);
  });
  it('build muscle + lose → maintenance calories', () => {
    const r = generatePlan({ ...body, goalType: 'BUILD_MUSCLE', secondaryGoals: ['LOSE_WEIGHT'] });
    assert.equal(r.dailyKcal, r.tdee);
  });
});

describe('workout recommender', () => {
  it('builds 7 days with the right number of training days', () => {
    const r = recommendPlan({ goalType: 'BUILD_MUSCLE', experience: 'INTERMEDIATE', sessionMinutes: 45 });
    assert.equal(r.schedule.length, 7);
    assert.equal(r.schedule.filter((d) => d.activity_type === 'Workout').length, 4);
    for (const d of r.schedule.filter((x) => x.activity_type === 'Workout')) assert.equal(d.exercises.length, 5);
    assert.ok(r.rationale.length >= 3);
  });
  it('keeps high-BMI sedentary beginners on low-impact, 3 days', () => {
    const r = recommendPlan({ goalType: 'LOSE_WEIGHT', experience: 'BEGINNER', activityLevel: 'SEDENTARY', bmi: 32, preferredDays: [1, 2, 3, 4, 5] });
    assert.equal(r.trainingDays, 3);
    assert.equal(r.lowImpact, true);
    for (const n of allNames(r)) assert.equal(byName(n).impact, 'low', n);
  });
  it('beginners only get level-1 moves', () => {
    const r = recommendPlan({ goalType: 'PERFORMANCE', experience: 'BEGINNER', bmi: 22 });
    for (const n of allNames(r)) assert.equal(byName(n).level, 1, n);
  });
  it('respects equipment, exclusions and the under-18 rule', () => {
    const r = recommendPlan({
      goalType: 'BUILD_MUSCLE', experience: 'ADVANCED', age: 16, bmi: 22,
      equipment: ['Barbell'], excludedCategories: ['FLOOR'], excludedExercises: ['Pike Push-up'],
    });
    for (const n of allNames(r)) {
      const ex = byName(n);
      assert.ok(['bodyweight', 'barbell'].includes(ex.equip), n);
      assert.ok(!ex.flags.includes('FLOOR'), n);
      assert.ok(!ex.flags.includes('HEAVY_LIFTING'), n);
      assert.notEqual(n, 'Pike Push-up');
    }
  });
  it('every pool exercise has written instructions', () => {
    for (const ex of exerciseGuide()) {
      assert.ok(ex.steps.length >= 2, ex.name);
      assert.ok(ex.cues.length >= 1, ex.name);
      assert.ok(ex.mistakes.length >= 1, ex.name);
    }
  });
});
