// tests/unit/task-notifications.test.js — completed-task notification text.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const t = require('../../src/utils/taskNotifications');

describe('task notification messages', () => {
  it('workouts: camera vs manual wording, empty sessions skipped', () => {
    assert.equal(t.workoutMessage({ workout_type: 'Squats', rep_count: 24, duration_seconds: 300 }),
      'Workout complete: Squats · 5 min · 24 reps. Nice work.');
    assert.equal(t.workoutMessage({ workout_type: 'Strength', rep_count: 36, duration_seconds: 2700 }, { manual: true }),
      'Workout logged: Strength · 45 min · 36 reps. Nice work.');
    assert.equal(t.workoutMessage({ workout_type: 'Plank', rep_count: 0, duration_seconds: 90 }),
      'Workout complete: Plank · 2 min. Nice work.');
    assert.equal(t.workoutMessage({ workout_type: 'Squats', rep_count: 0, duration_seconds: 20 }), null);
  });

  it('activities: distance, time, pace and kcal', () => {
    assert.equal(t.activityMessage({ duration: 1680, distance: 5.234, pace: '5:21', calories: 310 }),
      'Activity saved: 5.23 km in 28 min (pace 5:21/km, 310 kcal).');
    assert.equal(t.activityMessage({ duration: 0, distance: 0 }), null);
  });

  it('progress: weigh-in delta, measurements, photo', () => {
    assert.equal(t.weighInMessage(77.5, 78), 'Weigh-in saved: 77.5 kg (-0.5 kg since last time).');
    assert.equal(t.weighInMessage(80, 80), 'Weigh-in saved: 80 kg (no change since last time).');
    assert.match(t.weighInMessage(80, null), /^Weigh-in saved: 80 kg\. Log again next week/);
    assert.equal(t.measurementMessage({ weight_kg: 77.5, waist_cm: 82 }), 'Measurements saved: weight 77.5 kg, waist 82 cm.');
    assert.equal(t.measurementMessage({}), null);
    assert.match(t.photoMessage('side'), /^Progress photo saved \(side view\)/);
  });

  it('notifyTask never throws and ignores empty messages', () => {
    assert.doesNotThrow(() => t.notifyTask(null, { category: 'TRAINING', message: 'x' }));
    assert.doesNotThrow(() => t.notifyTask(1, { category: 'TRAINING', message: null }));
  });
});
