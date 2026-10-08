require('dotenv').config();
const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (!('DB_PASS' in process.env)) {
  console.warn('[env] DB_PASS not set at all (assuming passwordless local root)');
}
// Empty-string DB_PASS passes presence checks but means "no password" —
// fine for local XAMPP, never acceptable in production (fail closed).
if (process.env.NODE_ENV === 'production' && !process.env.DB_PASS) {
  console.error('[env] DB_PASS must be set in production (empty password refused)');
  process.exit(1);
}
if (missing.length) {
  const msg = `[env] Missing required vars: ${missing.join(', ')}`;
  // Missing vars always fail — silent misconfig in staging is worse than a crash.
  console.error(msg);
  process.exit(1);
}
const _jwt = String(process.env.JWT_SECRET || '');
if (_jwt.startsWith('change-me') || _jwt.length < 32) {
  const msg = '[env] JWT_SECRET must be min 32 chars and not the example value';
  if (process.env.NODE_ENV === 'production') {
    console.error(msg);
    process.exit(1);
  } else {
    console.error(
      `${msg} (refusing to start even in development — set a strong secret in backend/.env)`
    );
    process.exit(1);
  }
}
if (!process.env.TZ || process.env.TZ !== 'UTC') {
  // aiQuota uses UTC_DATE() + daily_stats/readiness assume UTC day boundaries.
  // Warn only — never crash — so local XAMPP keeps working.
  console.warn(
    "[env] TZ is not UTC (got '" +
      (process.env.TZ || 'unset') +
      "') — set TZ=UTC in production to keep quotas/day boundaries aligned"
  );
}
module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  },
  aiDailyLimit: parseInt(process.env.AI_DAILY_LIMIT, 10) || 50,
  globalRateLimit: parseInt(process.env.GLOBAL_RATE_LIMIT, 10) || 1000,
  frontendUrl: process.env.FRONTEND_URL || (process.env.ALLOWED_ORIGINS || '').split(',')[0] || '',
  geminiTextModels: String(process.env.GEMINI_TEXT_MODELS || ''),
  geminiVisionModels: String(process.env.GEMINI_VISION_MODELS || ''),
  isProd: process.env.NODE_ENV === 'production',
};
