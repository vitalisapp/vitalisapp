// UniSMS provider client — https://unismsapi.com/docs/sms
//
// POST https://unismsapi.com/api/sms with HTTP Basic auth: the secret key is
// the username, the password is empty. 201 means the message was ACCEPTED for
// delivery, not delivered; real delivery state needs GET /api/sms/:id or a
// webhook. Callers must not treat 201 as proof of delivery.
//
// The secret key, the OTP and the full message never reach logs or responses.

const { SUPPORTED_NETWORKS_MSG } = require('../utils/phone');

const ENDPOINT = 'https://unismsapi.com/api/sms';
const DEFAULT_SENDER_ID = 'Unisoft';
const DEFAULT_TIMEOUT_MS = 10000;

class SmsError extends Error {
  constructor(message, code, status = 502, details = undefined) {
    super(message);
    this.name = 'SmsError';
    this.isOperational = true;
    this.code = code;
    this.status = status;
    if (details !== undefined) this.details = details;
  }
}

function isMock() {
  // Mock mode is a development/test affordance only. Ignoring the flag in
  // production prevents a misconfigured deploy from silently "sending" codes
  // that nobody receives.
  if (String(process.env.NODE_ENV || '').toLowerCase() === 'production') return false;
  const flag = String(process.env.UNISMS_MOCK || '').toLowerCase();
  return flag === '1' || flag === 'true';
}

function isConfigured() {
  return Boolean(process.env.UNISMS_SECRET_KEY);
}

function timeoutMs() {
  const parsed = Number(process.env.UNISMS_TIMEOUT_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function senderId() {
  const configured = String(process.env.UNISMS_SENDER_ID || '').trim();
  return configured || DEFAULT_SENDER_ID;
}

/** Pull the provider's human-readable reason out of its error envelope. */
function providerDetail(body) {
  if (!body) return '';
  if (typeof body === 'string') return body.slice(0, 300);
  if (typeof body.errors === 'string') return body.errors.slice(0, 300);
  if (Array.isArray(body.errors)) return body.errors.join(' ').slice(0, 300);
  if (body.errors && typeof body.errors === 'object') {
    const first = Object.values(body.errors)[0];
    if (Array.isArray(first)) return first.join(' ').slice(0, 300);
    if (first) return String(first).slice(0, 300);
  }
  if (typeof body.message === 'string') return body.message.slice(0, 300);
  return '';
}

function isUnsupportedNetwork(detail) {
  // A mention of a carrier alone is not a rejection (it may be help text).
  return /\b(?:network|carrier)\b[^.!?\n]*\b(?:not supported|unsupported)\b/i.test(detail)
    || /\b(?:can't|cannot|can not|does not)\s+(?:send|deliver)\s+to\s+(?:smart|tnt|sun)\b/i.test(detail);
}

async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Send one SMS.
 * @param {{ to: string, content: string, metadata?: Record<string, unknown> }} params
 * @returns {Promise<{ accepted: boolean, mocked: boolean, referenceId: string|null, status: string }>}
 */
async function sendSms({ to, content, metadata }) {
  if (!to || !content) {
    throw new SmsError('SMS recipient and content are required.', 'SMS_INVALID_REQUEST', 400);
  }

  if (isMock()) {
    // Development / tests: never calls the provider, never spends credits.
    return { accepted: true, mocked: true, referenceId: null, status: 'mocked' };
  }

  if (!isConfigured()) {
    throw new SmsError(
      'SMS verification is not configured on this server.',
      'SMS_NOT_CONFIGURED',
      503,
    );
  }

  const auth = Buffer.from(`${process.env.UNISMS_SECRET_KEY}:`, 'utf8').toString('base64');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        recipient: to,
        content,
        sender_id: senderId(),
        ...(metadata ? { metadata } : {}),
      }),
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = err?.name === 'AbortError';
    throw new SmsError(
      timedOut
        ? 'The SMS provider took too long to respond. Please try again.'
        : 'The SMS provider could not be reached. Please try again.',
      timedOut ? 'SMS_TIMEOUT' : 'SMS_UNAVAILABLE',
      503,
    );
  } finally {
    clearTimeout(timer);
  }

  const body = await readJson(res);

  if (res.status === 201) {
    return {
      accepted: true,
      mocked: false,
      referenceId: body?.message?.reference_id || null,
      status: body?.message?.status || 'pending',
    };
  }

  if (res.status === 401 || res.status === 403) {
    // Never surface provider auth detail to the client.
    if (process.env.NODE_ENV !== 'test') {
      console.error('[sms] provider rejected our API key (status %s)', res.status);
    }
    throw new SmsError(
      'SMS verification is temporarily unavailable. Please try another method.',
      'SMS_AUTH_FAILED',
      503,
    );
  }

  if (res.status === 429) {
    const retryAfterMs = Number(res.headers.get('x-retry-after-ms')) || 2000;
    throw new SmsError(
      'The SMS provider is busy. Please wait a moment and try again.',
      'SMS_RATE_LIMITED',
      429,
      { retryAfterMs },
    );
  }

  if (res.status === 422) {
    const detail = providerDetail(body);
    if (/\b(?:insufficient|not enough|no|zero)\s+(?:sms\s+)?(?:credits?|balance)\b|\b(?:credits?|balance)\b[^.!?\n]*\b(?:insufficient|exhausted|depleted)\b/i.test(detail)) {
      throw new SmsError(
        'SMS verification is temporarily unavailable because the SMS service has no available credits. Please use email verification or contact support.',
        'SMS_INSUFFICIENT_CREDITS',
        503,
      );
    }
    if (isUnsupportedNetwork(detail)) {
      throw new SmsError(
        'The SMS provider rejected delivery to this number for the configured sender ID. This does not confirm your SIM network. If you use Globe, TM, or DITO, please use email verification or contact support to check the sender ID and routing.',
        'SMS_UNSUPPORTED_NETWORK',
        422,
      );
    }
    throw new SmsError(
      `We could not send a code to that number. Check the number and try again. ${SUPPORTED_NETWORKS_MSG}`,
      'SMS_REJECTED',
      422,
    );
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error('[sms] provider error status %s', res.status);
  }
  throw new SmsError(
    'The SMS provider could not process the request. Please try again.',
    'SMS_UNAVAILABLE',
    502,
  );
}

// ─── Account balance (admin dashboard) ───────────────────────────────
// GET https://unismsapi.com/api/account → { status, email, sid_tokens, sms_credits }.
// Cached briefly so dashboard refreshes don't hammer the provider. The
// account email is deliberately not passed on.
const ACCOUNT_ENDPOINT = 'https://unismsapi.com/api/account';
const ACCOUNT_CACHE_MS = 60 * 1000;
let accountCache = null; // { at, value }

async function getAccount({ fresh = false } = {}) {
  if (isMock()) {
    return { ok: true, mocked: true, credits: null, sidTokens: null, status: 'mocked', checkedAt: new Date().toISOString() };
  }
  if (!isConfigured()) {
    return { ok: false, code: 'SMS_NOT_CONFIGURED', message: 'SMS is not configured on this server.' };
  }
  if (!fresh && accountCache && Date.now() - accountCache.at < ACCOUNT_CACHE_MS) {
    return accountCache.value;
  }
  const auth = Buffer.from(`${process.env.UNISMS_SECRET_KEY}:`, 'utf8').toString('base64');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());
  let value;
  try {
    const res = await fetch(ACCOUNT_ENDPOINT, {
      headers: { Accept: 'application/json', Authorization: `Basic ${auth}` },
      signal: controller.signal,
    });
    const body = await readJson(res);
    if (res.ok && body && typeof body.sms_credits !== 'undefined') {
      value = {
        ok: true,
        mocked: false,
        credits: Number(body.sms_credits),
        sidTokens: Number(body.sid_tokens ?? 0),
        status: String(body.status || 'unknown'),
        checkedAt: new Date().toISOString(),
      };
    } else if (res.status === 401 || res.status === 403) {
      value = { ok: false, code: 'SMS_AUTH_FAILED', message: 'UniSMS rejected the API key.' };
    } else {
      value = { ok: false, code: 'SMS_UNAVAILABLE', message: `UniSMS returned status ${res.status}.` };
    }
  } catch (err) {
    value = {
      ok: false,
      code: err?.name === 'AbortError' ? 'SMS_TIMEOUT' : 'SMS_UNAVAILABLE',
      message: 'UniSMS could not be reached.',
    };
  } finally {
    clearTimeout(timer);
  }
  // Only cache successes; failures retry on the next request.
  if (value.ok) accountCache = { at: Date.now(), value };
  return value;
}

module.exports = { sendSms, getAccount, SmsError, isMock, isConfigured, senderId };
