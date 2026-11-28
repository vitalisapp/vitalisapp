const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getCookieOptions } = require('../../src/utils/cookies');

const req = (headers = {}, secure = false) => ({ headers, secure });
function withEnv(env, fn) {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = env;
  try { return fn(); } finally { process.env.NODE_ENV = prev; }
}

test('production over https is Secure + SameSite=None + Partitioned', () => {
  const o = withEnv('production', () => getCookieOptions(req({ host: 'api.example.com', 'x-forwarded-proto': 'https' })));
  assert.equal(o.secure, true);
  assert.equal(o.sameSite, 'none');
  assert.equal(o.partitioned, true);
  assert.equal(o.httpOnly, true);
});

test('production on a bare public host still defaults to Secure', () => {
  assert.equal(withEnv('production', () => getCookieOptions(req({ host: 'api.example.com' })).secure), true);
});

test('production on plain-http localhost is not Secure, so the browser keeps the cookie', () => {
  const o = withEnv('production', () => getCookieOptions(req({ host: 'localhost:3000' })));
  assert.equal(o.secure, false);
  assert.equal(o.sameSite, 'lax');
  assert.equal(o.partitioned, undefined);
  assert.equal(o.httpOnly, true);
});

test('production on localhost behind an https proxy/tunnel stays Secure', () => {
  assert.equal(withEnv('production', () => getCookieOptions(req({ host: 'localhost:3000', 'x-forwarded-proto': 'https' })).secure), true);
});

test('development: http is not Secure, https tunnel is', () => {
  assert.equal(withEnv('development', () => getCookieOptions(req({ host: 'localhost:3000' })).secure), false);
  assert.equal(withEnv('development', () => getCookieOptions(req({ host: 'x.devtunnels.ms', 'x-forwarded-proto': 'https' })).secure), true);
});
