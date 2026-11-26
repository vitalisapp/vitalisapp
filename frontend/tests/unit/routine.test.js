import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSteps, currentSide, formatDose, formatSeconds, routineSeconds } from '../../src/lib/routine.js';

const MOVES = [
  { key: 'march', name: 'March in Place', seconds: 120, reps: null, perSide: false, estSeconds: 120, steps: ['a'], cue: 'c', easier: { name: 'Seated Marching', steps: ['s'] } },
  { key: 'swing', name: 'Leg Swings', seconds: null, reps: 8, perSide: true, estSeconds: 48, steps: ['b'], cue: 'c', easier: { name: 'Supported Knee Lifts', steps: ['k'] } },
  { key: 'quad', name: 'Quad Stretch', seconds: 30, reps: null, perSide: true, estSeconds: 60, steps: ['q'], cue: 'c', easier: null },
];

test('formatSeconds / formatDose', () => {
  assert.equal(formatSeconds(45), '45 s');
  assert.equal(formatSeconds(120), '2 min');
  assert.equal(formatSeconds(90), '1 min 30 s');
  assert.equal(formatDose(MOVES[0]), '2 min');
  assert.equal(formatDose(MOVES[1]), '8 reps each side');
  assert.equal(formatDose(MOVES[2]), '30 s each side');
});

test('buildSteps honours skipped moves and the easier version', () => {
  const steps = buildSteps(MOVES, { skipped: new Set(['march']), easier: new Set(['swing', 'quad']) });
  assert.deepEqual(steps.map((s) => s.key), ['swing', 'quad']);
  assert.equal(steps[0].name, 'Supported Knee Lifts');
  assert.equal(steps[0].isEasier, true);
  assert.deepEqual(steps[0].steps, ['k']);
  // No easier version available → stays the original move.
  assert.equal(steps[1].name, 'Quad Stretch');
  assert.equal(steps[1].isEasier, false);
  assert.equal(steps[1].hasEasier, false);
});

test('timed per-side moves run the timer for both sides', () => {
  const [, swing, quad] = buildSteps(MOVES);
  assert.equal(swing.timerSeconds, null); // reps → user taps Done
  assert.equal(quad.timerSeconds, 60);
  assert.equal(currentSide(quad, 60), 1);
  assert.equal(currentSide(quad, 31), 1);
  assert.equal(currentSide(quad, 30), 2);
  assert.equal(currentSide(buildSteps(MOVES)[0], 50), null);
});

test('routineSeconds drops skipped moves', () => {
  assert.equal(routineSeconds(MOVES), 228);
  assert.equal(routineSeconds(MOVES, new Set(['march'])), 108);
});

test('playerReducer ticks, auto-advances, pauses and finishes', async () => {
  const { playerReducer } = await import('../../src/lib/routine.js');
  const steps = buildSteps([
    { key: 'a', name: 'A', seconds: 2, steps: [] },
    { key: 'b', name: 'B', reps: 8, steps: [] },
  ]);
  let s = { index: 0, remaining: 2, running: true, finished: false };
  s = playerReducer(s, { type: 'tick', steps });
  assert.equal(s.remaining, 1);
  s = playerReducer(s, { type: 'running', value: false, steps });
  assert.equal(playerReducer(s, { type: 'tick', steps }), s); // paused → no change
  s = playerReducer(s, { type: 'running', value: true, steps });
  s = playerReducer(s, { type: 'tick', steps });
  assert.deepEqual([s.index, s.remaining, s.running], [1, 0, true]); // advanced to the rep move
  assert.equal(playerReducer(s, { type: 'tick', steps }), s); // rep moves don't tick
  s = playerReducer(s, { type: 'goto', index: 2, steps });
  assert.equal(s.finished, true);
});
