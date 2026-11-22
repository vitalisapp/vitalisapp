// tests/unit/task-notifications-wiring.test.js — each save fires exactly one
// categorised notification. Real service functions run against a fake DB; the
// notifier is captured instead of writing rows / pushing SSE.
const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const sent = [];
const src = (...p) => path.join(__dirname, '..', '..', 'src', ...p);
const stub = (rel, exports) => {
  const id = require.resolve(src(rel));
  require.cache[id] = { id, filename: id, loaded: true, exports };
};

// Fake pool: answers the handful of statements these save paths issue.
const ok = [{ insertId: 42, affectedRows: 1 }];
const fakeConn = {
  query: async () => [[]],
  beginTransaction: async () => {},
  commit: async () => {},
  rollback: async () => {},
  async execute(sql) {
    if (/SELECT id, status, pause_started_at/.test(sql)) return [[{ id: 7, status: 'active', pause_started_at: null, paused_seconds: 0 }]];
    if (/SELECT id, workout_type, rep_count/.test(sql)) return [[{ id: 7, workout_type: 'Squats', rep_count: 20, status: 'completed', duration_seconds: 300 }]];
    return ok;
  },
  release() {},
};
const fakeDb = {
  getConnection: async () => fakeConn,
  async execute(sql, params) {
    if (/SELECT id, status, pause_started_at/.test(sql)) return fakeConn.execute(sql, params);
    if (/SELECT weight_kg FROM bmi_records/.test(sql)) return [[{ weight_kg: 78 }]];
    if (/SELECT height_cm FROM bmi_records/.test(sql)) return [[]];
    return ok;
  },
  query: async () => [[]],
};

let workouts; let activity; let bmi; let progress;
before(() => {
  stub(path.join('config', 'db'), fakeDb);
  stub(path.join('controllers', 'notification.controller'), {
    notifyUser: async (userId, n) => { sent.push({ userId, ...n }); return true; },
  });
  // AI + goal side-effects of saveBmi are irrelevant here.
  stub(path.join('config', 'gemini'), { callGeminiWithFallback: async () => '', aiConfigured: () => false });
  workouts = require(src('services', 'workoutLogs.service'));
  activity = require(src('services', 'activity.service'));
  bmi = require(src('services', 'bmi.service'));
  progress = require(src('services', 'progress.service'));
});
beforeEach(() => { sent.length = 0; });
const settle = () => new Promise((r) => setImmediate(r));

describe('task notifications are wired to the save paths', () => {
  it('finishing a camera workout → TRAINING', async () => {
    const r = await workouts.endWorkout(1, 7, 'completed', 20);
    await settle();
    assert.equal(r.outcome, 'ok');
    assert.equal(sent.length, 1);
    assert.equal(sent[0].category, 'TRAINING');
    assert.match(sent[0].message, /^Workout complete: Squats · 5 min · 20 reps/);
  });

  it('saving an activity → ACTIVITY', async () => {
    await activity.saveActivity(3, { duration: 1680, distance: 5.2, pace: '5:23', calories: 300 });
    await settle();
    assert.deepEqual(sent.map((s) => [s.userId, s.category]), [[3, 'ACTIVITY']]);
    assert.match(sent[0].message, /^Activity saved: 5\.2 km in 28 min/);
  });

  it('a weigh-in → PROGRESS with the change since last time', async () => {
    await bmi.saveBmi(4, { weight: 77.5, height: 175, bmi: 25.3 });
    await settle();
    const p = sent.filter((s) => s.category === 'PROGRESS');
    assert.equal(p.length, 1);
    assert.equal(p[0].message, 'Weigh-in saved: 77.5 kg (-0.5 kg since last time).');
  });

  it('body measurements and photos → PROGRESS', async () => {
    await progress.saveMeasurements(5, { waist_cm: 82 });
    await progress.savePhoto(5, { pose: 'front', image_data: 'data:image/jpeg;base64,AAAA' }).catch(() => null);
    await settle();
    const msgs = sent.filter((s) => s.category === 'PROGRESS').map((s) => s.message);
    assert.ok(msgs.some((m) => m.startsWith('Measurements saved: waist 82 cm')), JSON.stringify(msgs));
  });
});
