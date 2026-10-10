// Logs: METHOD path -> status (duration ms) | userId if authed
// Enable with DEBUG=1 or NODE_ENV!=production (default on in dev)
// Uses res 'finish' event (not res.end patch) so SSE/streams stay intact.
const log = require('../utils/logger');
module.exports = function requestLogger(req, res, next) {
  if (process.env.NODE_ENV === 'production' && !process.env.DEBUG) return next();
  const start = Date.now();
  res.on('finish', () => {
    // Skip SSE stream setup noise after initial 200 (still log the handshake once)
    const ms = Date.now() - start;
    const user = req.user?.id ? ` uid=${req.user.id}` : '';
    const status = res.statusCode;
    const tag = status >= 500 ? 'ERR' : status >= 400 ? 'WARN' : 'OK';
    // Never log secrets: email-verify tokens and OTPs must not land in logs.
    const safeUrl = String(req.originalUrl || '').replace(/([?&](token|otp|resetToken)=)[^&]*/gi, '$1[REDACTED]');
    log.info(`[http] ${tag} ${req.method} ${safeUrl} -> ${status} ${ms}ms${user}`);
  });
  next();
};
