// Password policy — the ONE server-side rule for every place a password is set
// (register, change password, forgot-password reset). The frontend mirrors it
// in frontend/src/lib/passwordPolicy.js for live feedback, but this module is
// the authority.
//
// Existing accounts are never locked out: login does NOT enforce the policy.
// It only evaluates the typed password (the one moment the server sees
// plaintext) and stores users.password_weak so the Profile can show a
// "needs attention" warning until the user sets a compliant password.

const bcrypt = require('bcryptjs');

const MIN_LENGTH = 12;
// bcrypt only hashes the first 72 BYTES — anything past that is silently
// ignored, so longer input would give a false sense of strength.
const MAX_BYTES = 72;
const BCRYPT_COST = 12;

const RULES = [
  { key: 'length', label: `at least ${MIN_LENGTH} characters`, test: (pw) => [...pw].length >= MIN_LENGTH },
  { key: 'upper', label: 'an uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lower', label: 'a lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number', label: 'a number', test: (pw) => /[0-9]/.test(pw) },
  { key: 'special', label: 'a special character (e.g. ! @ # $)', test: (pw) => /[^A-Za-z0-9\s]/.test(pw) },
];

// Passwords that satisfy the character rules on paper but are among the first
// guesses in any attack. Compared after lowercasing and stripping non-letters
// and digits, so "Password123!" and "P@ssword-123" both hit "password123".
const COMMON = new Set([
  'password', 'password1', 'password12', 'password123', 'password1234',
  'passw0rd', 'p4ssw0rd', 'qwerty123', 'qwertyuiop', 'qwerty12345',
  'welcome123', 'welcome1234', 'letmein123', 'admin123', 'admin12345',
  'iloveyou123', 'abc123456', 'abcd1234', 'changeme123', 'football123',
  'vitalis123', 'vitalis1234', 'vitalisapp', 'vitalisapp123', 'fitness123',
]);

function normalizeForCommon(pw) {
  return String(pw).toLowerCase().replace(/@/g, 'a').replace(/[^a-z0-9]/g, '');
}

/**
 * Evaluate a password against the policy.
 * @returns {{ ok: boolean, failed: string[], message: string|null }}
 */
function checkPassword(password) {
  const pw = typeof password === 'string' ? password : '';
  const failed = RULES.filter((r) => !r.test(pw)).map((r) => r.key);

  if (Buffer.byteLength(pw, 'utf8') > MAX_BYTES) failed.push('maxBytes');
  // Only flag "common" once the character rules pass; otherwise the missing
  // rules are the more useful message.
  if (failed.length === 0 && COMMON.has(normalizeForCommon(pw))) {
    failed.push('common');
  }

  return { ok: failed.length === 0, failed, message: messageFor(failed) };
}

function messageFor(failed) {
  if (!failed.length) return null;
  if (failed.includes('maxBytes')) {
    return `Password is too long. Use ${MAX_BYTES} characters or fewer.`;
  }
  if (failed.includes('common')) {
    return 'This password is too common and easy to guess. Choose something more unique.';
  }
  const parts = RULES.filter((r) => failed.includes(r.key)).map((r) => r.label);
  const list = parts.length > 1
    ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
    : parts[0];
  return `Password must include ${list}.`;
}

/** True when an (already verified) password would fail the current policy. */
function isWeakPassword(password) {
  return !checkPassword(password).ok;
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(BCRYPT_COST);
  return bcrypt.hash(password, salt);
}

/** True when a stored hash was made with a lower cost than today's policy. */
function needsRehash(hash) {
  try {
    return bcrypt.getRounds(hash) < BCRYPT_COST;
  } catch {
    return false;
  }
}

/**
 * Zod field for a NEW password. Reports one specific, human message.
 * Usage: newPassword: strongPassword(z)
 */
function strongPassword(z) {
  return z.string({ required_error: 'Password is required.' }).superRefine((pw, ctx) => {
    const result = checkPassword(pw);
    if (!result.ok) ctx.addIssue({ code: 'custom', message: result.message });
  });
}

module.exports = {
  MIN_LENGTH,
  MAX_BYTES,
  BCRYPT_COST,
  RULES,
  checkPassword,
  isWeakPassword,
  hashPassword,
  needsRehash,
  strongPassword,
};
