// Revision #4 — progressive unlocking helpers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nextLevel, stepsText, requirementPct, challengeTargetText, challengeBlockReason,
  challengeWorkoutState, challengeResultText, levelName,
} from '../../src/lib/progression.js';

const PROG = {
  level: 1,
  levels: [
    { level: 1, name: 'Foundation', unlocked: true, requirements: [] },
    { level: 2, name: 'Advanced', unlocked: false, requirements: [{ met: true }, { met: false }, { met: false }, { met: true }] },
    { level: 3, name: 'Elite', unlocked: false, requirements: [] },
  ],
};

test('next level and steps', () => {
  assert.equal(nextLevel(PROG).level, 2);
  assert.equal(stepsText(nextLevel(PROG)), '2 of 4 steps');
  assert.equal(nextLevel({ levels: PROG.levels.map((l) => ({ ...l, unlocked: true })) }), null);
  assert.equal(levelName(PROG, 3), 'Elite');
});

test('requirement progress percentage', () => {
  assert.equal(requirementPct({ met: true, current: 1, target: 8 }), 100);
  assert.equal(requirementPct({ met: false, current: 4, target: 8 }), 50);
  assert.equal(requirementPct({ met: false, current: 9, target: 8 }), 100);
  assert.equal(requirementPct({ met: false, current: 1, target: 0 }), 0);
});

test('challenge labels and start state', () => {
  const squat = { key: 'squat_75', name: '75-Squat Session', mode: 'rep', target: 75, sets: 5, reps: 15, exerciseId: 'squat', level: 2, unlocked: true, blockedBy: [] };
  const plank = { key: 'plank_120', name: '2-Minute Plank', mode: 'hold', target: 120, exerciseId: 'plank', level: 2, unlocked: false, blockedBy: [] };
  assert.equal(challengeTargetText(squat), '75 reps');
  assert.equal(challengeTargetText(plank), '2 min hold');
  assert.equal(challengeTargetText({ mode: 'hold', target: 90 }), '1 min 30 s hold');
  assert.equal(challengeBlockReason(squat, PROG), null);
  assert.match(challengeBlockReason(plank, PROG), /Unlock Advanced \(Level 2\)/);
  assert.match(challengeBlockReason({ ...squat, blockedBy: ['FLOOR'] }, PROG), /exclusions/);
  assert.deepEqual(challengeWorkoutState(squat), {
    exerciseId: 'squat',
    challenge: { key: 'squat_75', name: '75-Squat Session', mode: 'rep', target: 75, sets: 5, reps: 15 },
  });
});

test('challenge result text', () => {
  const c = { name: '75-Squat Session', mode: 'rep' };
  assert.match(challengeResultText({ completed: true, firstTime: true, achieved: 80 }, c), /Challenge complete! 80 reps/);
  assert.match(challengeResultText({ completed: false, achieved: 60, target: 75 }, c), /60 reps of 75/);
});
