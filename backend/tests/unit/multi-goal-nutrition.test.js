// Revision #5 — extra goals shape nutrition: calories from the main goal,
// protein from the most demanding selected goal.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { generatePlan, proteinPerKgFor } = require('../../src/utils/planEngine');

const BASE = { weightKg: 70, heightCm: 170, dob: '1995-05-05', sex: 'male', activityLevel: 'MODERATELY_ACTIVE' };

describe('multi-goal nutrition', () => {
  it('protein uses the highest need among all goals', () => {
    assert.equal(proteinPerKgFor('MAINTAIN_WEIGHT', []), 1.6);
    assert.equal(proteinPerKgFor('MAINTAIN_WEIGHT', ['BUILD_MUSCLE']), 2.2);
    assert.equal(proteinPerKgFor('GAIN_WEIGHT', ['PERFORMANCE']), 1.8);
    assert.equal(proteinPerKgFor('UNKNOWN', []), 1.6);
  });

  it('Maintain + Build Muscle keeps maintenance calories but raises protein', () => {
    const plain = generatePlan({ ...BASE, goalType: 'MAINTAIN_WEIGHT' });
    const both = generatePlan({ ...BASE, goalType: 'MAINTAIN_WEIGHT', secondaryGoals: ['BUILD_MUSCLE'] });
    assert.equal(both.dailyKcal, plain.dailyKcal);
    assert.equal(both.proteinG, Math.round(2.2 * 70));
    assert.ok(both.proteinG > plain.proteinG);
    assert.ok(both.carbsG < plain.carbsG, 'carbs make room for the extra protein');
    assert.equal(both.proteinPerKg, 2.2);
  });

  it('a lower-protein extra goal never lowers protein', () => {
    const muscle = generatePlan({ ...BASE, goalType: 'BUILD_MUSCLE' });
    const withPerf = generatePlan({ ...BASE, goalType: 'BUILD_MUSCLE', secondaryGoals: ['PERFORMANCE'] });
    assert.equal(withPerf.proteinG, muscle.proteinG);
    assert.equal(withPerf.dailyKcal, muscle.dailyKcal);
  });

  it('recomposition still applies (lose fat + build muscle)', () => {
    const r = generatePlan({ ...BASE, goalType: 'LOSE_WEIGHT', secondaryGoals: ['BUILD_MUSCLE'] });
    assert.equal(r.recomposition, true);
    assert.ok(r.dailyKcal >= r.tdee - 300);
  });
});

describe('extra goals survive recalculation', () => {
  it('identity edits and recalibration pass the extra goals to the plan engine', () => {
    const src = require('fs').readFileSync(require.resolve('../../src/services/goals.service.js'), 'utf8');
    const calls = src.split('generatePlan({').slice(1);
    assert.equal(calls.length, 3);
    for (const c of calls) assert.match(c.slice(0, 600), /secondaryGoals/);
  });
});
