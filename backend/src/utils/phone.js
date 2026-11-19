// Philippine mobile number helpers.
//
// Accepted inputs: 09XXXXXXXXX, 9XXXXXXXXX, +639XXXXXXXXX, 639XXXXXXXXX,
// and the same with spaces, dashes, dots or parentheses.
// Canonical output: +639XXXXXXXXX (E.164). Anything else returns ''.
//
// Prefixes are NOT used to guess the carrier: numbers can be ported between
// Globe/TM/DITO and Smart/TNT/Sun, so compatibility is decided by the SMS
// provider's response, not by this parser.

const CANONICAL_RE = /^\+639\d{9}$/;

function normalizePhMobile(input) {
  const raw = String(input || '').replace(/[\s().-]/g, '');
  if (!raw) return '';

  let digits = raw;
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('00')) digits = digits.slice(2);

  if (/^09\d{9}$/.test(digits)) return `+63${digits.slice(1)}`;
  if (/^9\d{9}$/.test(digits)) return `+63${digits}`;
  if (/^639\d{9}$/.test(digits)) return `+${digits}`;
  return '';
}

function isValidPhMobile(input) {
  return CANONICAL_RE.test(normalizePhMobile(input));
}

// +639171234567 -> +63917***4567 (keeps enough to recognise, not to reuse).
function maskPhone(input) {
  const normalized = normalizePhMobile(input);
  if (!normalized) return '';
  const national = normalized.slice(3); // 9XXXXXXXXX
  return `${normalized.slice(0, 3)}${national.slice(0, 3)}***${national.slice(-4)}`;
}

module.exports = { normalizePhMobile, isValidPhMobile, maskPhone, CANONICAL_RE };
