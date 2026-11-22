// Section 3 — extra goals + target date rules (pure logic, node --test).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extraGoalBlockReason, cleanExtraGoals, isRecomposition, checkTargetDate } from '../../src/lib/goalSetup.js';

describe('extra goals (frontend mirror)', () => {
  it('blocks a second weight-direction goal and more than 2 extras', () => {
    assert.match(extraGoalBlockReason('LOSE_WEIGHT', 'GAIN_WEIGHT', []), /different directions/);
    assert.equal(extraGoalBlockReason('LOSE_WEIGHT', 'BUILD_MUSCLE', []), null);
    assert.match(extraGoalBlockReason('BUILD_MUSCLE', 'MAINTAIN_WEIGHT', ['LOSE_WEIGHT']), /different directions/);
    assert.match(extraGoalBlockReason('MAINTAIN_WEIGHT', 'PERFORMANCE', ['BUILD_MUSCLE', 'X']), /Up to 2/);
  });
  it('drops extras that no longer fit a new main goal', () => {
    assert.deepEqual(cleanExtraGoals('GAIN_WEIGHT', ['LOSE_WEIGHT', 'PERFORMANCE']), ['PERFORMANCE']);
    assert.deepEqual(cleanExtraGoals('LOSE_WEIGHT', ['LOSE_WEIGHT']), []);
  });
  it('detects recomposition', () => {
    assert.equal(isRecomposition('LOSE_WEIGHT', ['BUILD_MUSCLE']), true);
    assert.equal(isRecomposition('LOSE_WEIGHT', ['PERFORMANCE']), false);
  });
});

describe('target date (frontend mirror)', () => {
  const now = new Date(2026, 10, 21);
  it('is optional and bounded', () => {
    assert.equal(checkTargetDate({ targetDate: '', now }).ok, true);
    assert.equal(checkTargetDate({ targetDate: '2026-11-25', now }).ok, false);
    assert.equal(checkTargetDate({ targetDate: '2029-06-01', now }).ok, false);
  });
  it('matches the backend realism maths', () => {
    const r = checkTargetDate({ targetDate: '2027-01-15', weightKg: 85, targetWeightKg: 75, now });
    assert.equal(r.ok, true);
    assert.equal(r.feasibility.realistic, false);
    assert.equal(r.feasibility.safeMaxPerWeek, 0.85);
    assert.equal(r.feasibility.suggestedDate, '2027-02-13');
  });
});
