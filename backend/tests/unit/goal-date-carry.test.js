const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

// Exercise the real controller/validation with persistence isolated.
const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {} };
const service = require('../../src/services/goals.service');
const controller = require('../../src/controllers/goals.controller');

describe('saved birth dates', () => {
  it('serializes database calendar dates without shifting the day', () => {
    const row = { dob: new Date(2000, 1, 29) };
    assert.equal(service.toRecord(row).dob, '2000-02-29');
    assert.equal(service.carriedBody(row, {}).dob, '2000-02-29');
    assert.equal(service.toRecord({ dob: null }).dob, null);
    assert.equal(service.carriedBody({ dob: '2000-02-29' }, {}).dob, '2000-02-29');
  });

  it('changes a goal using the saved DOB and still rejects invalid overrides', async () => {
    const previous = { dob: new Date(2000, 1, 29), height_cm: 170, weight_kg: 70, goal_type: 'LOSE_WEIGHT' };
    const get = mock.method(service, 'getActiveGoalRow', async () => previous);
    const create = mock.method(service, 'createGoal', async (_id, fields) => {
      assert.equal(fields.dob, '2000-02-29');
      assert.equal(fields.goal, 'MAINTAIN_WEIGHT');
      return { plan: {}, goal: fields };
    });
    try {
      const res = { statusCode: 200, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; } };
      const req = { params: { userId: '1' }, body: { goalType: 'MAINTAIN_WEIGHT' } };
      await controller.patchchangeUserId(req, res, (err) => { throw err; });
      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      await controller.patchchangeUserId({ ...req, body: { ...req.body, dob: '2000-02-30' } }, res, (err) => { throw err; });
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.code, 'DOB_INVALID');
      assert.equal(create.mock.callCount(), 1);
    } finally {
      get.mock.restore();
      create.mock.restore();
    }
  });
});
