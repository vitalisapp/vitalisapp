// Email verification tokens (sha256-hashed, single-use, 24h expiry).
const crypto = require('crypto');
const db = require('../config/db');
const { frontendUrl } = require('../utils/frontendUrl');

// ALLOW_DEV_LINKS=1 exposes links for local demo without SMTP (never in prod).
const DEV_VERIFY_FALLBACK = process.env.ALLOW_DEV_LINKS === '1' && process.env.NODE_ENV !== 'production';

async function createVerificationToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.execute(
    'UPDATE email_verifications SET used = 1 WHERE user_id = ? AND used = 0'
    , [userId]
  );
  await db.execute(
    'INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, tokenHash, expiresAt]
  );
  return { token, link: `${frontendUrl()}/verify-email?token=${token}` };
}

module.exports = { DEV_VERIFY_FALLBACK, createVerificationToken };
