// tests/integration/goals-direction.test.js — POST /api/goals/:userId must
// reject contradictory target/current combinations (e.g. 55 kg → 85 kg for
// LOSE_WEIGHT). PATCH /change funnels through the same handler, so both
// client flows are covered even with client validation bypassed.
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

let __txCalls = [];
const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    execute: async (sql) => {
      if (/FROM fitness_goals WHERE id/.test(sql)) {
        return [[{ id: 1, goal_type: 'LOSE_WEIGHT', target_weight_kg: 70 }]];
      }
      return [[]];
    },
    query: async () => [[]],
    getConnection: async () => ({
      beginTransaction: async () => {},
      execute: async () => {
        __txCalls.push(1);
        return [{ insertId: 1 }];
      },
      commit: async () => {},
      rollback: async () => {},
      release: () => {},
    }),
  },
};

const { postUserId } = require('../../src/controllers/goals.controller');

function mockRes() {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

const throwNext = (e) => { throw e; };
const req = (body) => ({ params: { userId: '7' }, body });
const base = { heightCm: 175, weightKg: 55, dob: '2000-01-01', sex: 'male' };

describe('POST /api/goals/:userId target direction', () => {
  beforeEach(() => { __txCalls = []; });

  it('400s 55 kg → 85 kg for LOSE_WEIGHT without touching the DB', async () => {
    const res = mockRes();
    await postUserId(req({ ...base, goalType: 'LOSE_WEIGHT', targetWeightKg: 85 }), res, throwNext);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /below current weight/);
    assert.equal(__txCalls.length, 0);
  });

  it('400s 85 kg → 55 kg for GAIN_WEIGHT', async () => {
    const res = mockRes();
    await postUserId(
      req({ ...base, weightKg: 85, goalType: 'GAIN_WEIGHT', targetWeightKg: 55 }),
      res,
      throwNext
    );
    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /above current weight/);
  });

  it('400s equal target for both directions', async () => {
    const lose = mockRes();
    await postUserId(req({ ...base, goalType: 'LOSE_WEIGHT', targetWeightKg: 55 }), lose, throwNext);
    assert.equal(lose.statusCode, 400);
    const gain = mockRes();
    await postUserId(req({ ...base, goalType: 'GAIN_WEIGHT', targetWeightKg: 55 }), gain, throwNext);
    assert.equal(gain.statusCode, 400);
  });

  it('201s a consistent loss goal (85 → 70)', async () => {
    const res = mockRes();
    await postUserId(
      req({ ...base, weightKg: 85, goalType: 'LOSE_WEIGHT', targetWeightKg: 70 }),
      res,
      throwNext
    );
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
  });

  it('skips direction when no target is given', async () => {
    const res = mockRes();
    await postUserId(req({ ...base, goalType: 'GAIN_WEIGHT' }), res, throwNext);
    assert.equal(res.statusCode, 201);
  });
});
