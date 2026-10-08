const COOKIE_NAME = 'vitalis_session';

function isSecureRequest(req) {
  if (process.env.NODE_ENV === 'production') return true;
  const h = req?.headers || {};
  const proto = String(h['x-forwarded-proto'] || '').toLowerCase();
  if (proto.includes('https')) return true;
  if (req?.secure) return true;

  const origin = String(h.origin || h.referer || '');
  if (origin.toLowerCase().startsWith('https://')) return true;
  const host = String(h['x-forwarded-host'] || h.host || '');
  if (/\.devtunnels\.ms(?::\d+)?$/i.test(host)) return true;
  return false;
}

function baseCookieOptions(req, extra = {}) {
  const isSecure = isSecureRequest(req);
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    ...(isSecure ? { partitioned: true } : {}),
    ...extra,
  };
}

function getCookieOptions(req) {
  return baseCookieOptions(req, { maxAge: 12 * 60 * 60 * 1000, path: '/' });
}

function getClearCookieOptions(req) {
  return baseCookieOptions(req, { expires: new Date(0), path: '/' });
}

module.exports = { COOKIE_NAME, getCookieOptions, getClearCookieOptions };
