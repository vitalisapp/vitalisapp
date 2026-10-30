const { it } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'test-secret-min-32-chars-0123456789ab';
let queries = [];
let verified = false;
let sentLink;
const tokens = [];
const user = () => ({ id: 13, email: 'test@example.com', password: 'hash', is_verified: Number(verified), token_version: 0, status: 'active' });
function stub(path, exports) {
  const id = require.resolve(path);
  require.cache[id] = { id, filename: id, loaded: true, exports };
}
stub('../../src/config/db', {
  execute: async (sql, params = []) => {
    queries.push(sql);
    if (sql.startsWith('SELECT email FROM')) return [[]];
    if (sql.startsWith('INSERT INTO users')) return [{ insertId: 13 }];
    if (sql.startsWith('INSERT INTO email_verifications')) tokens.push({ id: tokens.length + 1, user_id: params[0], hash: params[1], expires: params[2], used: 0 });
    if (sql.startsWith('DELETE FROM email_verifications')) tokens.length = 0;
    if (sql.includes('FROM email_verifications v')) {
      const token = tokens.find((t) => t.hash === params[0]);
      return [token ? [{ ...token, expired: token.expires <= new Date(), is_verified: Number(verified) }] : []];
    }
    if (sql.startsWith('UPDATE users u JOIN email_verifications')) {
      verified = true;
      return [{ affectedRows: 1 }];
    }
    if (sql.startsWith('UPDATE users SET is_verified')) verified = true;
    if (sql.includes('FROM users')) return [[user()]];
    return [[]];
  },
});
stub('bcryptjs', { genSalt: async () => 'salt', hash: async () => 'hash', compare: async () => true });
stub('../../src/services/email.service', { sendVerificationEmail: async (_email, link) => { sentLink = link; }, sendEmailChangedNotice: async () => {} });
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

it('keeps delayed links valid after resending and accepts repeat clicks', async () => {
  verified = false;
  await service.resendVerification('test@example.com');
  const older = new URL(sentLink).searchParams.get('token');
  await service.resendVerification('test@example.com');
  const newer = new URL(sentLink).searchParams.get('token');
  assert.notEqual(older, newer);
  await service.verifyEmail(older);
  await service.verifyEmail(older);
  await service.verifyEmail(newer);
  assert.equal(verified, true);
});

it('distinguishes expired and unknown tokens without verifying the account', async () => {
  verified = false;
  await service.resendVerification('test@example.com');
  tokens.at(-1).expires = new Date(Date.now() - 1000);
  await assert.rejects(service.verifyEmail(new URL(sentLink).searchParams.get('token')), { code: 'EXPIRED_TOKEN' });
  await assert.rejects(service.verifyEmail('unknown'), { code: 'INVALID_TOKEN' });
  assert.equal(verified, false);
});

it('rejects old-address links after changing email', async () => {
  verified = false;
  await service.resendVerification('test@example.com');
  const oldToken = new URL(sentLink).searchParams.get('token');
  await service.changeEmail({ email: 'test@example.com', password: 'password123', newEmail: 'new@example.com' });
  await assert.rejects(service.verifyEmail(oldToken), { code: 'INVALID_TOKEN' });
  await service.verifyEmail(new URL(sentLink).searchParams.get('token'));
  assert.equal(verified, true);
});
