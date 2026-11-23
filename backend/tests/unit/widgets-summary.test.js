// tests/unit/widgets-summary.test.js — Windows widget summary shaping.
// No DB rows touched: src/config/db is stubbed via require.cache.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: { execute: async () => { throw new Error('DB must not be hit in this test'); } },
};

const { shapeWidgetSummary } = require('../../src/services/widgets.service');

describe('shapeWidgetSummary', () => {
  it('maps dashboard stats, step goal and streak', () => {
    const out = shapeWidgetSummary({
      dashboard: {
        stats: { steps: '6400', calories_burned: 312.6, workout_duration_mins: 41 },
        streak: { current: 5, longest: 9, activeToday: 1 },
      },
      settingsRows: [{ step_goal: 10000 }],
      today: '2026-11-23',
    });
    assert.deepEqual(out, {
      today: '2026-11-23',
      stats: { steps: 6400, calories: 313, minutes: 41 },
      stepGoal: 10000,
      streak: { current: 5, activeToday: true },
    });
  });

  it('falls back to zeros, default goal and null streak when data is missing', () => {
    const out = shapeWidgetSummary({ dashboard: null, settingsRows: [], today: null });
    assert.deepEqual(out.stats, { steps: 0, calories: 0, minutes: 0 });
    assert.equal(out.stepGoal, 8000);
    assert.equal(out.streak, null);
  });

  it('never returns negative or non-numeric values', () => {
    const out = shapeWidgetSummary({
      dashboard: { stats: { steps: -5, calories_burned: 'abc', workout_duration_mins: null } },
      settingsRows: [{ step_goal: 'oops' }],
    });
    assert.deepEqual(out.stats, { steps: 0, calories: 0, minutes: 0 });
    assert.equal(out.stepGoal, 8000);
  });
});
