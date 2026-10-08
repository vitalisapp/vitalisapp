// tests/integration/auth-revocation.test.js — /me must honor token_version.
// No DB rows touched: src/config/db is stubbed via require.cache, real JWTs
// are signed with src/config/jwt. Pins the logout/password-change revocation.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Deterministic secret (controller never loads dotenv on its own).
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-min-32-chars-0123456789ab';

let __rows = [];
const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    execute: async () => [__rows],
    query: async () => [__rows],
  },
};

const jwtLib = require('jsonwebtoken');
const { signSession } = require('../../src/config/jwt');
const { getme } = require('../../src/controllers/auth.controller');
const { COOKIE_NAME } = require('../../src/utils/cookies');

function mockRes() {
  const res = { statusCode: 200, body: null, cleared: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  res.clearCookie = (name) => { res.cleared = name; return res; };
  return res;
}

const throwNext = (e) => { throw e; };

function authedReq(tv) {
  const token = signSession(jwtLib, { id: 13, email: 't@example.com', tv });
  return { cookies: { [COOKIE_NAME]: token }, headers: {} };
}

const row = (tv) => ([{
  id: 13,
  name: 'T',
  email: 't@example.com',
  fitness_goal: 'general fitness',
  is_verified: 1,
  onboarding_completed: 1,
  token_version: tv,
  avatar: null,
}]);

describe('GET /api/auth/me session revocation', () => {
  it('401 SESSION_REVOKED + cookie cleared when token_version mismatches', async () => {
    __rows = row(5); // e.g. logged out twice since this cookie was minted (tv=0)
    const res = mockRes();
    await getme(authedReq(0), res, throwNext);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.code, 'SESSION_REVOKED');
    assert.equal(res.body.user, null);
    assert.equal(res.cleared, COOKIE_NAME);
  });

  it('200 when token_version matches', async () => {
    __rows = row(5);
    const res = mockRes();
    await getme(authedReq(5), res, throwNext);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.user.id, 13);
  });

  it('401 NO_COOKIE without cookie', async () => {
    const res = mockRes();
    await getme({ cookies: {}, headers: {} }, res, throwNext);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.code, 'NO_COOKIE');
  });

  it('legacy cookie without tv matches default token_version 0', async () => {
    __rows = row(0);
    const token = signSession(jwtLib, { id: 13, email: 't@example.com' });
    const res = mockRes();
    await getme({ cookies: { [COOKIE_NAME]: token }, headers: {} }, res, throwNext);
    assert.equal(res.statusCode, 200);
  });
});
