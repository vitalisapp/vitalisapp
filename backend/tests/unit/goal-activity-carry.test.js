const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

// Exercise the real controller/validation with persistence isolated.
const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {} };
const service = require('../../src/services/goals.service');
const controller = require('../../src/controllers/goals.controller');

const mkRes = () => ({ statusCode: 200, status(n) { this.statusCode = n; return this; }, json(b) { this.body = b; return this; } });
const base = { height_cm: 170, weight_kg: 70, goal_type: 'LOSE_WEIGHT' };

async function change(prev, body) {
  let created = null;
  const get = mock.method(service, 'getActiveGoalRow', async () => prev);
  const create = mock.method(service, 'createGoal', async (_id, fields) => {
    created = fields;
    return { plan: {}, goal: fields };
  });
  try {
    const res = mkRes();
    await controller.patchchangeUserId({ params: { userId: '1' }, body }, res, (e) => { throw e; });
    return { res, created };
  } finally {
    get.mock.restore();
    create.mock.restore();
  }
}

describe('activity level on goal change', () => {
  it('normalizes legacy and display names', () => {
    assert.equal(service.normalizeActivity('MODERATE'), 'MODERATELY_ACTIVE');
    assert.equal(service.normalizeActivity('Lightly Active'), 'LIGHTLY_ACTIVE');
    assert.equal(service.normalizeActivity('very-active'), 'VERY_ACTIVE');
    assert.equal(service.normalizeActivity('SEDENTARY'), 'SEDENTARY');
    assert.equal(service.normalizeActivity(null), null);
  });

  it('changes the goal when the saved activity level is a legacy name', async () => {
    const { res, created } = await change({ ...base, activity_level: 'MODERATE' }, { goalType: 'MAINTAIN_WEIGHT' });
    assert.equal(res.statusCode, 201);
    assert.equal(created.activity, 'MODERATELY_ACTIVE');
  });

  it('does not block the goal change on an unknown saved activity level', async () => {
    const { res, created } = await change({ ...base, activity_level: 'BANANA' }, { goalType: 'MAINTAIN_WEIGHT' });
    assert.equal(res.statusCode, 201);
    assert.equal(created.activity, null);
  });

  it('still rejects an invalid activity level the user sent', async () => {
    const { res } = await change({ ...base, activity_level: 'SEDENTARY' }, { activityLevel: 'BANANA' });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Please choose a valid activity level.');
  });
});
