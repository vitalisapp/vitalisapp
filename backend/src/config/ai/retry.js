// Retry helpers: exponential backoff with jitter for 503/429, timeout race
// (SDKs expose no AbortSignal) so a hung provider fails over instead of
// parking the request forever.
const AI_TEXT_TIMEOUT_MS = 25000;
const AI_VISION_TIMEOUT_MS = 45000;

function isRetryableError(err) {
  const msg = String((err && err.message) || err || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('try again later') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('resource exhausted')
  );
}

function backoffSleep(attempt, err) {
  const base = isRetryableError(err) ? 2000 * Math.pow(2, attempt) : 1000;
  const capped = Math.min(base, 15000);
  const jitter = Math.floor(Math.random() * 500);
  return new Promise((r) => setTimeout(r, capped + jitter));
}

function withTimeout(promise, ms, label) {
  let t;
  const timeout = new Promise((_, rej) => {
    t = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(t));
}

module.exports = {
  AI_TEXT_TIMEOUT_MS,
  AI_VISION_TIMEOUT_MS,
  isRetryableError,
  backoffSleep,
  withTimeout,
};
