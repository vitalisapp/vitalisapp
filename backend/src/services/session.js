// Session cookie + device logging (single source: src/utils/cookies.js).
const jwt = require('jsonwebtoken');
const UAParser = require('ua-parser-js');
const db = require('../config/db');
const { COOKIE_NAME, getCookieOptions } = require('../utils/cookies');
const log = require('../utils/logger');

function setSessionCookie(res, userId, email, req, tv = 0) {
  const { signSession } = require('../config/jwt');
  const token = signSession(jwt, { id: userId, email, tv });
  const opts = getCookieOptions(req);
  res.cookie(COOKIE_NAME, token, opts);
  if (process.env.NODE_ENV !== 'production') {
    log.debug(
      `[cookie] set uid=${userId} secure=${opts.secure} sameSite=${opts.sameSite} ` +
      `partitioned=${Boolean(opts.partitioned)} proto=${req.headers?.['x-forwarded-proto'] || '-'}`
    );
  }
  return token;
}

const logUserSession = async (req, userId) => {
  let conn;
  try {
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();

    const device  = result.device.type || 'Desktop';
    const browser = result.browser.name || 'Unknown';
    const os      = result.os.name || 'Unknown';

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress ||
      req.ip ||
      'Unknown';

    const location = 'Unknown';

    // Transaction so concurrent logins can't leave two is_current=true rows.
    conn = await db.getConnection();
    await conn.beginTransaction();
    await conn.execute(
      'UPDATE user_sessions SET is_current = false WHERE user_id = ?',
      [userId]
    );

    await conn.execute(
      `INSERT INTO user_sessions
       (user_id, device, browser, os, ip_address, location, is_current)
       VALUES (?, ?, ?, ?, ?, ?, true)`,
      [userId, device, browser, os, ip, location]
    );
    await conn.commit();
  } catch (err) {
    try { await conn?.rollback(); } catch (_) {}
    log.error('SESSION LOG ERROR:', err);
  } finally {
    try { conn?.release(); } catch (_) {}
  }
};

module.exports = { setSessionCookie, logUserSession };
