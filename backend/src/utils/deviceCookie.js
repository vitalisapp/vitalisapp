const { randomUUID } = require('node:crypto');
const { getCookieOptions } = require('./cookies');

const DEVICE_COOKIE = 'vitalis_device';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getDeviceId(req) {
  const value = req.cookies?.[DEVICE_COOKIE];
  return typeof value === 'string' && UUID.test(value) ? value.toLowerCase() : null;
}

// Identification only, never authentication. Keep across logout and IP/UA changes.
function ensureDeviceCookie(req, res) {
  const id = getDeviceId(req) || randomUUID();
  req.cookies = { ...req.cookies, [DEVICE_COOKIE]: id };
  res.cookie(DEVICE_COOKIE, id, {
    ...getCookieOptions(req),
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
  return id;
}

module.exports = { DEVICE_COOKIE, getDeviceId, ensureDeviceCookie };
