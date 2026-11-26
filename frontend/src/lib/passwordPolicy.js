// Password policy — client mirror of backend/src/utils/passwordPolicy.js.
// Drives live feedback (checklist + strength meter) on every form that sets a
// password: Register, Forgot Password page, and the Profile change/forgot
// modals. The server re-checks everything; keep both files in sync.

export const MIN_LENGTH = 12;
export const MAX_BYTES = 72;

export const PASSWORD_RULES = [
  { key: 'length', label: `At least ${MIN_LENGTH} characters`, test: (pw) => [...pw].length >= MIN_LENGTH },
  { key: 'upper', label: 'One uppercase letter (A–Z)', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lower', label: 'One lowercase letter (a–z)', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number', label: 'One number (0–9)', test: (pw) => /[0-9]/.test(pw) },
  { key: 'special', label: 'One special character (! @ # $ …)', test: (pw) => /[^A-Za-z0-9\s]/.test(pw) },
];

const COMMON = new Set([
  'password', 'password1', 'password12', 'password123', 'password1234',
  'passw0rd', 'p4ssw0rd', 'qwerty123', 'qwertyuiop', 'qwerty12345',
  'welcome123', 'welcome1234', 'letmein123', 'admin123', 'admin12345',
  'iloveyou123', 'abc123456', 'abcd1234', 'changeme123', 'football123',
  'vitalis123', 'vitalis1234', 'vitalisapp', 'vitalisapp123', 'fitness123',
]);

const normalizeForCommon = (pw) => String(pw).toLowerCase().replace(/@/g, 'a').replace(/[^a-z0-9]/g, '');

const byteLength = (pw) => new TextEncoder().encode(pw).length;

const RULE_PHRASES = {
  length: `at least ${MIN_LENGTH} characters`,
  upper: 'an uppercase letter',
  lower: 'a lowercase letter',
  number: 'a number',
  special: 'a special character (e.g. ! @ # $)',
};

/**
 * @param {string} password
 * @returns {{ ok: boolean, failed: string[], passed: string[], message: string|null }}
 */
export function checkPassword(password) {
  const pw = typeof password === 'string' ? password : '';
  const failed = PASSWORD_RULES.filter((r) => !r.test(pw)).map((r) => r.key);
  if (byteLength(pw) > MAX_BYTES) failed.push('maxBytes');
  if (failed.length === 0 && COMMON.has(normalizeForCommon(pw))) failed.push('common');
  const passed = PASSWORD_RULES.map((r) => r.key).filter((k) => !failed.includes(k));
  return { ok: failed.length === 0, failed, passed, message: passwordMessage(failed) };
}

export function passwordMessage(failed) {
  if (!failed.length) return null;
  if (failed.includes('maxBytes')) return `Password is too long. Use ${MAX_BYTES} characters or fewer.`;
  if (failed.includes('common')) return 'This password is too common and easy to guess. Choose something more unique.';
  const parts = PASSWORD_RULES.filter((r) => failed.includes(r.key)).map((r) => RULE_PHRASES[r.key]);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
  return `Password must include ${list}.`;
}

/**
 * Strength for the meter. "Strong" is ONLY shown when the password passes the
 * policy, so the meter can never contradict the server.
 * @returns {null | { key: 'weak'|'medium'|'strong', label: string, bars: number, pct: string, color: string }}
 */
export function getPasswordStrength(password) {
  if (!password) return null;
  const { ok, passed } = checkPassword(password);
  if (ok) return { key: 'strong', label: 'Strong', bars: 4, pct: '100%', color: 'var(--success, #22c55e)' };
  if (passed.length >= 4) return { key: 'medium', label: 'Almost there', bars: 3, pct: '75%', color: 'var(--warning, #f59e0b)' };
  if (passed.length >= 3) return { key: 'medium', label: 'Medium', bars: 2, pct: '50%', color: 'var(--warning, #f59e0b)' };
  return { key: 'weak', label: 'Weak', bars: 1, pct: '25%', color: 'var(--error, #ef4444)' };
}
