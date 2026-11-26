// Revision #5 — multi-goal selection with a main goal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toggleGoal, makeMain, conflictFor, describeGoalMix, selectedGoals, MAX_GOALS } from '../../src/lib/goalSelection.js';

const EMPTY = { primary: '', extras: [] };
const pick = (...keys) => keys.reduce((s, k) => toggleGoal(s, k).state, EMPTY);

test('first pick is the main goal; later picks are extras', () => {
  const s = pick('LOSE_WEIGHT', 'BUILD_MUSCLE');
  assert.deepEqual(s, { primary: 'LOSE_WEIGHT', extras: ['BUILD_MUSCLE'] });
});

test('removing the main goal promotes the next goal', () => {
  const s = toggleGoal(pick('LOSE_WEIGHT', 'BUILD_MUSCLE', 'PERFORMANCE'), 'LOSE_WEIGHT').state;
  assert.deepEqual(s, { primary: 'BUILD_MUSCLE', extras: ['PERFORMANCE'] });
  assert.deepEqual(toggleGoal(pick('PERFORMANCE'), 'PERFORMANCE').state, EMPTY);
});

test('makeMain swaps the main goal and keeps the rest', () => {
  const s = makeMain(pick('LOSE_WEIGHT', 'BUILD_MUSCLE', 'PERFORMANCE'), 'PERFORMANCE');
  assert.deepEqual(s, { primary: 'PERFORMANCE', extras: ['LOSE_WEIGHT', 'BUILD_MUSCLE'] });
});

test('conflicting weight goals are explained with compatible alternatives', () => {
  const start = pick('LOSE_WEIGHT');
  const res = toggleGoal(start, 'GAIN_WEIGHT');
  assert.equal(res.state, start, 'selection unchanged');
  assert.match(res.conflict.title, /Lose Weight and Gain Weight can’t be combined/);
  assert.match(res.conflict.message, /deficit/);
  assert.match(res.conflict.tip, /Build Muscle/);
  const labels = res.conflict.actions.map((a) => a.label);
  assert.deepEqual(labels, ['Switch to Gain Weight', 'Lose Weight + Build Muscle']);
  assert.deepEqual(res.conflict.actions[0].state, { primary: 'GAIN_WEIGHT', extras: [] });
  assert.deepEqual(res.conflict.actions[1].state, { primary: 'LOSE_WEIGHT', extras: ['BUILD_MUSCLE'] });
});

test('every weight pair has an explanation; non-weight goals never conflict', () => {
  for (const [a, b] of [['LOSE_WEIGHT', 'MAINTAIN_WEIGHT'], ['GAIN_WEIGHT', 'MAINTAIN_WEIGHT'], ['MAINTAIN_WEIGHT', 'LOSE_WEIGHT']]) {
    const c = conflictFor(pick(a), b);
    assert.ok(c && c.message && c.actions.length >= 1, `${a}+${b}`);
  }
  assert.equal(conflictFor(pick('LOSE_WEIGHT'), 'BUILD_MUSCLE'), null);
  assert.equal(conflictFor(pick('GAIN_WEIGHT', 'BUILD_MUSCLE'), 'PERFORMANCE'), null);
});

test(`never more than ${MAX_GOALS} goals`, () => {
  // 1 weight goal + Build Muscle + Performance is the largest valid mix; any
  // 4th pick is another weight goal and is explained, not added.
  const full = pick('BUILD_MUSCLE', 'PERFORMANCE', 'LOSE_WEIGHT');
  assert.equal(selectedGoals(full).length, MAX_GOALS);
  for (const k of ['GAIN_WEIGHT', 'MAINTAIN_WEIGHT']) {
    const res = toggleGoal(full, k);
    assert.equal(res.state, full);
    assert.ok(res.conflict);
  }
});

test('goal mix summary matches the server rules', () => {
  const recomp = describeGoalMix('LOSE_WEIGHT', ['BUILD_MUSCLE']);
  assert.match(recomp[0].text, /maintenance/);
  assert.match(recomp[1].text, /2.2 g/);
  const maintainMuscle = describeGoalMix('MAINTAIN_WEIGHT', ['BUILD_MUSCLE']);
  assert.match(maintainMuscle[0].text, /main goal, Maintain Weight/);
  assert.match(maintainMuscle[1].text, /2.2 g .*raised for Build Muscle/);
  assert.match(maintainMuscle[2].text, /Build Muscle gets its own plan/);
  assert.equal(describeGoalMix('', []).length, 0);
});
