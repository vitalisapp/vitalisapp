const { it } = require('node:test');
const assert = require('node:assert/strict');

// Hard verification: signup gets no session until the email link is opened;
// the first successful click signs the user in. Skipped in development.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-min-32-chars-0123456789ab';
let queries = [];
let verified = false;
let sentLink;
let welcome = [];
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
      // Mirrors `AND u.is_verified = 0`: only the first click changes a row.
      if (verified) return [{ affectedRows: 0 }];
      verified = true;
      return [{ affectedRows: 1 }];
    }
    if (sql.startsWith('UPDATE users SET is_verified')) verified = true;
    if (sql.includes('FROM users')) return [[user()]];
    return [[]];
  },
});
stub('bcryptjs', { genSalt: async () => 'salt', hash: async () => 'hash', compare: async () => true });
stub('../../src/services/email.service', {
  sendVerificationEmail: async (_email, link) => { sentLink = link; },
  sendEmailChangedNotice: async () => {},
  sendWelcomeEmail: async (email, name, options = {}) => {
    welcome.push({ email, name, ...options });
    if (options.verifyUrl) sentLink = options.verifyUrl;
  },
});
const flush = () => new Promise((r) => setImmediate(r));
const service = require('../../src/services/auth.service');
const { postregister, getverifyEmail } = require('../../src/controllers/auth.controller');
const verifyUser = require('../../src/middleware/verifyUser');
const jwt = require('jsonwebtoken');
const { signSession } = require('../../src/config/jwt');
const { COOKIE_NAME } = require('../../src/utils/cookies');
function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    cookieSet: false,
    clearCookie() {},
    cookie() { this.cookieSet = true; },
  };
}
const nextError = (err) => { throw err; };

it('requires verification: signup issues no session, sends one welcome email with the verify link, and login is refused until verified', async () => {
  queries = [];
  welcome = [];
  const res = response();
  await postregister({ body: { name: 'Test', email: 'test@example.com', password: 'password123', agreed: true }, headers: {} }, res, nextError);
  await flush();
  assert.equal(res.statusCode, 201);
  assert.notEqual(res.cookieSet, true, 'unverified signup must not issue a session');
  assert.equal(res.body.needsVerification, true);
  assert.equal(res.body.verificationMethod, 'email');
  assert.equal(res.body.isVerified, false);
  assert.equal(welcome.length, 1);
  assert.equal(welcome[0].provider, 'email');
  assert.match(sentLink, /\/verify-email\?token=[a-f0-9]{64}$/);
  assert.equal(queries.some((sql) => sql.startsWith('UPDATE users SET is_verified')), false);

  // A correct password is not enough while the account is unverified.
  await assert.rejects(
    service.login({ email: 'test@example.com', password: 'password123' }),
    (err) => err.code === 'NEEDS_VERIFICATION' && err.status === 403 && err.details?.verificationMethod === 'email',
  );

  await service.verifyEmail(new URL(sentLink).searchParams.get('token'));
  assert.equal(verified, true);
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

it('skips verification in development: signup is verified, gets a session, and login auto-verifies', async () => {
  process.env.NODE_ENV = 'development';
  try {
    verified = false;
    sentLink = undefined;
    queries = [];
    welcome = [];
    const res = response();
    await postregister({ body: { name: 'Dev', email: 'test@example.com', password: 'password123', agreed: true }, headers: {} }, res, nextError);
    await flush();
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.needsVerification, false);
    assert.equal(res.cookieSet, true);
    assert.equal(sentLink, undefined);
    assert.equal(welcome.length, 1, 'welcome email still sent in development');
    assert.equal(welcome[0].verifyUrl, undefined);
    assert.equal(queries.some((sql) => sql.startsWith('INSERT INTO email_verifications')), false);

    // Pre-existing unverified account signs in without the check-email step.
    verified = false;
    const { user: loggedIn } = await service.login({ email: 'test@example.com', password: 'password123' });
    assert.equal(Boolean(loggedIn.is_verified), true);
    assert.equal(verified, true);
  } finally {
    process.env.NODE_ENV = 'test';
  }
});

it('signs the user in on the first verification click only', async () => {
  process.env.NODE_ENV = 'test';
  verified = false;
  await service.resendVerification('test@example.com');
  const token = new URL(sentLink).searchParams.get('token');

  const first = response();
  await getverifyEmail({ query: { token }, headers: {}, cookies: {} }, first, nextError);
  assert.equal(first.body.success, true);
  assert.equal(first.body.signedIn, true);
  assert.equal(first.cookieSet, true, 'first click must start a session');
  assert.equal(first.body.user.id, 13);
  assert.equal(first.body.user.isVerified, true);

  // Reopening the same (still known) link confirms, but never mints a session.
  const again = response();
  await getverifyEmail({ query: { token }, headers: {}, cookies: {} }, again, nextError);
  assert.equal(again.body.success, true);
  assert.equal(again.body.signedIn, false);
  assert.equal(again.cookieSet, false);
});
