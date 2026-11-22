// Philippine mobile number helpers — mirror of backend/src/utils/phone.js.
// Accepted inputs: 09XXXXXXXXX, 9XXXXXXXXX, +639XXXXXXXXX, 639XXXXXXXXX,
// with optional spaces, dashes, dots or parentheses. Canonical output:
// +639XXXXXXXXX. Prefixes are never used to guess the carrier, because
// numbers can be ported between networks.

export const PH_MOBILE_CANONICAL = /^\+639\d{9}$/;

export function normalizePhMobile(input) {
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

export function isValidPhMobile(input) {
  return PH_MOBILE_CANONICAL.test(normalizePhMobile(input));
}

// +639171234567 -> +639 171 234 567 (display only).
export function formatPhMobile(input) {
  const normalized = normalizePhMobile(input);
  if (!normalized) return '';
  return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7, 10)} ${normalized.slice(10)}`;
}

// +639171234567 -> +63917***4567 (safe to show in copy).
export function maskPhMobile(input) {
  const normalized = normalizePhMobile(input);
  if (!normalized) return '';
  const national = normalized.slice(3);
  return `${normalized.slice(0, 3)}${national.slice(0, 3)}***${national.slice(-4)}`;
}

// User-facing copy — mirror of backend/src/utils/phone.js.
export const SUPPORTED_NETWORKS_MSG = 'Only Globe, TM, and DITO SIMs are supported.';
export const PHONE_INVALID_MSG = `Enter a valid Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX). ${SUPPORTED_NETWORKS_MSG}`;

// Server codes that mean "this number can't get our SMS — pick another one".
export const PHONE_RETRY_CODES = new Set([
  'PHONE_INVALID',
  'PHONE_TAKEN',
  'SMS_UNSUPPORTED_NETWORK',
  'SMS_REJECTED',
]);

// Inline validation while typing: stays quiet until the input is clearly
// wrong (bad characters, or a full-length number that still doesn't parse),
// so the user isn't shouted at after the first digit.
export function livePhoneError(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  if (/[^\d\s().+-]/.test(raw)) return PHONE_INVALID_MSG;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10) return '';
  return isValidPhMobile(raw) ? '' : PHONE_INVALID_MSG;
}
