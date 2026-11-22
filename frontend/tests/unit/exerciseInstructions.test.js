// Section 7 — exercise briefing data + rep counting (full vs shallow reps).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { briefingFor, spokenBriefing, partialHint, COUNTER_GUIDES } from '../../src/features/user/CameraWorkout/constants/exerciseInstructions.js';
import { buildRepCounter } from '../../src/features/user/CameraWorkout/hooks/useRepCounter.js';

// Side-view squat pose: hip (23) above knee (25), ankle (27) below; knee angle set by moving the hip.
function squatFrame(kneeDeg) {
  const lm = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.99 }));
  const knee = { x: 0.5, y: 0.6, z: 0, visibility: 0.99 };
  const ankle = { x: 0.5, y: 0.85, z: 0, visibility: 0.99 };
  const rad = (kneeDeg * Math.PI) / 180;
  // knee→ankle points straight down (0, 1); knee→hip is that vector rotated by kneeDeg.
  const hip = { x: 0.5 + 0.25 * Math.sin(rad), y: 0.6 + 0.25 * Math.cos(rad), z: 0, visibility: 0.99 };
  lm[23] = hip; lm[25] = knee; lm[27] = ankle;
  return lm;
}
const ready = { ready: true, side: 0, view: 'Side view' };

function run(angles, onPartial) {
  const count = buildRepCounter({ onPartial });
  let reps = 0; let t = 0;
  for (const a of angles) {
    for (let k = 0; k < 4; k += 1) { t += 100; if (count(squatFrame(a), 'squat', ready, t)) reps += 1; }
  }
  return reps;
}

describe('rep counting', () => {
  it('counts a full squat (stand → below 105° → stand)', () => {
    assert.equal(run([175, 90, 175]), 1);
    assert.equal(run([175, 90, 175, 90, 175]), 2);
  });
  it('does not count a shallow squat and reports it as partial', () => {
    const partial = [];
    assert.equal(run([175, 125, 175], (t) => partial.push(t)), 0);
    assert.deepEqual(partial, ['squat']);
  });
});

describe('exercise briefing', () => {
  it('gives distance, view and counting rules for camera exercises', () => {
    const b = briefingFor({ counterType: 'pushup', mode: 'rep', label: 'Push-up' });
    assert.equal(b.setup.distanceM, 2);
    assert.equal(b.setup.view, 'side');
    assert.equal(b.method, 'auto');
    assert.match(b.counting, /155°/);
    assert.ok(b.steps.length >= 3);
  });
  it('prefers the exercise-library steps when available', () => {
    const b = briefingFor({ counterType: 'squat', label: 'Squat' }, { steps: ['A', 'B'], cues: [], mistakes: [] });
    assert.deepEqual(b.steps, ['A', 'B']);
    assert.ok(b.cues.length > 0);
  });
  it('explains hold and self-tracked exercises honestly', () => {
    assert.equal(briefingFor({ mode: 'hold', label: 'Plank' }).method, 'hold');
    const g = briefingFor({ counterType: 'generic', label: 'Burpee' });
    assert.equal(g.method, 'manual');
    assert.match(g.counting, /\+1 rep/);
  });
  it('spoken version mentions the 2 m distance', () => {
    assert.match(spokenBriefing(briefingFor({ counterType: 'squat', label: 'Squat' })), /two meters away/);
  });
  it('every counter has instructions and a partial-rep tip where it can detect one', () => {
    for (const [k, g] of Object.entries(COUNTER_GUIDES)) {
      assert.ok(g.steps.length && g.counting && g.setup.distanceM, k);
    }
    assert.match(partialHint('squat'), /deeper/);
  });
});
