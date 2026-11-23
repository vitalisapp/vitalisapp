const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ensureDeviceCookie, getDeviceId, DEVICE_COOKIE } = require('../../src/utils/deviceCookie');

test('device identity survives new requests and rejects malformed cookie values', () => {
  const writes = [];
  const res = { cookie: (...args) => writes.push(args) };
  const req = { headers: {}, cookies: { [DEVICE_COOKIE]: 'untrusted-invalid-value' } };
  const first = ensureDeviceCookie(req, res);
  assert.equal(getDeviceId(req), first);
  const next = { headers: {}, cookies: { [DEVICE_COOKIE]: first } };
  assert.equal(ensureDeviceCookie(next, res), first);
  assert.equal(writes[0][2].httpOnly, true);
  assert.equal(writes[0][2].path, '/');
  assert.ok(writes[0][2].maxAge > 12 * 60 * 60 * 1000);
  assert.notEqual(ensureDeviceCookie({ headers: {} }, res), first);
});
