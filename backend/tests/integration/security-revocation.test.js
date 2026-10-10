// tests/integration/security-revocation.test.js — DELETE /api/security/:sessionId
// must actually invalidate cookies (token_version bump), not just delete the row.
// Same stub style as auth-revocation.test.js: db stubbed via require.cache,
// controller called directly, executed SQL captured to assert order + scoping.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

let __calls = [];
let __existing = [];

const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    execute: async (sql, params) => {
      __calls.push({ sql: String(sql), params });
      if (/SELECT id FROM user_sessions/i.test(sql)) return [__existing];
      return [{ affectedRows: 1 }];
    },
    query: async () => [[]],
  },
};

const { deleteSessionId, get } = require('../../src/controllers/security.controller');

function mockRes() {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

const throwNext = (e) => { throw e; };
const authed = (sessionId) => ({ user: { id: 7 }, params: { sessionId: String(sessionId) } });

describe('DELETE /api/security/:sessionId per-device revocation', () => {
  it('400 on invalid session id with zero DB calls', async () => {
    __calls = [];
    __existing = [];
    const res = mockRes();
    await deleteSessionId(authed('abc'), res, throwNext);
    assert.equal(res.statusCode, 400);
    assert.equal(__calls.length, 0);
  });

  it('401 without a user with zero DB calls', async () => {
    __calls = [];
    const res = mockRes();
    await deleteSessionId({ user: null, params: { sessionId: '3' } }, res, throwNext);
    assert.equal(res.statusCode, 401);
    assert.equal(__calls.length, 0);
  });

  it('404 when the row is missing — and no token_version bump', async () => {
    __calls = [];
    __existing = [];
    const res = mockRes();
    await deleteSessionId(authed(99), res, throwNext);
    assert.equal(res.statusCode, 404);
    assert.equal(__calls.length, 1);
    assert.match(__calls[0].sql, /SELECT id FROM user_sessions/i);
  });

  it('200 path bumps token_version then deletes, scoped to the owner', async () => {
    __calls = [];
    __existing = [{ id: 3 }];
    const res = mockRes();
    await deleteSessionId(authed(3), res, throwNext);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /sign in again/i);
    assert.equal(__calls.length, 3);
    assert.match(__calls[0].sql, /SELECT id FROM user_sessions/i);
    assert.match(__calls[1].sql, /UPDATE users SET token_version/i);
    assert.match(__calls[2].sql, /DELETE FROM user_sessions/i);
    // Every statement is owner-scoped — users can only touch their own rows.
    for (const c of __calls) {
      assert.ok(c.params.includes(7), `owner id missing in: ${c.sql}`);
    }
    assert.deepEqual(__calls[0].params, [3, 7]);
  });

  it('GET /api/security still lists sessions (unchanged)', async () => {
    require.cache[dbPath].exports.execute = async () => [[{ id: 1 }]];
    const res = mockRes();
    await get({ user: { id: 7 } }, res, throwNext);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, [{ id: 1 }]);
  });
});
