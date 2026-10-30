const { it } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'test-secret-min-32-chars-0123456789ab';
let queries = [];
let verified = false;
let sentLink;
const user = () => ({ id: 13, email: 'test@example.com', password: 'hash', is_verified: Number(verified), token_version: 0, status: 'active' });
function stub(path, exports) {
  const id = require.resolve(path);
  require.cache[id] = { id, filename: id, loaded: true, exports };
}
stub('../../src/config/db', {
  execute: async (sql) => {
    queries.push(sql);
    if (sql.startsWith('SELECT email FROM')) return [[]];
    if (sql.startsWith('INSERT INTO users')) return [{ insertId: 13 }];
    if (sql.includes('FROM email_verifications')) return [[{ id: 7, user_id: 13 }]];
    if (sql.startsWith('UPDATE users SET is_verified')) verified = true;
    if (sql.includes('FROM users')) return [[user()]];
    return [[]];
  },
});
stub('bcryptjs', { genSalt: async () => 'salt', hash: async () => 'hash', compare: async () => true });
stub('../../src/services/email.service', { sendVerificationEmail: async (_email, link) => { sentLink = link; } });
const service = require('../../src/services/auth.service');
const { postregister } = require('../../src/controllers/auth.controller');
const verifyUser = require('../../src/middleware/verifyUser');
const jwt = require('jsonwebtoken');
const { signSession } = require('../../src/config/jwt');
const { COOKIE_NAME } = require('../../src/utils/cookies');
function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    clearCookie() {},
    cookie() { assert.fail('Unverified signup must not issue a session'); },
  };
}
const nextError = (err) => { throw err; };

it('requires email confirmation in development, issues no signup session, and gates existing sessions', async () => {
  queries = [];
  const res = response();
  await postregister({ body: { name: 'Test', email: 'test@example.com', password: 'password123', agreed: true }, headers: {} }, res, nextError);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.needsVerification, true);
  assert.equal(res.body.isVerified, false);
  assert.match(sentLink, /\/verify-email\?token=[a-f0-9]{64}$/);
  assert.equal(queries.some((sql) => sql.startsWith('UPDATE users SET is_verified')), false);
  await assert.rejects(service.login({ email: 'test@example.com', password: 'password123' }), { code: 'NEEDS_VERIFICATION' });

  const token = signSession(jwt, { id: 13, email: 'test@example.com', tv: 0 });
  const req = { cookies: { [COOKIE_NAME]: token }, headers: {} };
  const blocked = response();
  await verifyUser(req, blocked, () => assert.fail('Unverified session passed'));
  assert.equal(blocked.statusCode, 403);
  assert.equal(blocked.body.code, 'NEEDS_VERIFICATION');

  await service.verifyEmail(new URL(sentLink).searchParams.get('token'));
  let allowed = false;
  await verifyUser(req, response(), (err) => { if (err) throw err; allowed = true; });
  assert.equal(allowed, true);
});
