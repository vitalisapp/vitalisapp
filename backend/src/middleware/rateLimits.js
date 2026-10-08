// Central rate-limit presets (single-instance in-memory buckets).
const rateLimit = require('express-rate-limit');

function makeLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message },
  });
}

const aiLimiter = () => makeLimiter({ windowMs: 15 * 60 * 1000, limit: 30, message: 'Too many AI requests. Try again later.' });
const coachLimiter = () => makeLimiter({ windowMs: 15 * 60 * 1000, limit: 30, message: 'Too many coach requests. Try again later.' });
const feedbackLimiter = () => makeLimiter({ windowMs: 60 * 60 * 1000, limit: 5, message: 'Too many feedback submissions. Try again later.' });
const settingsLimiter = () => makeLimiter({ windowMs: 15 * 60 * 1000, limit: 120, message: 'Too many settings requests. Try again later.' });
const writeLimiter = () => makeLimiter({ windowMs: 15 * 60 * 1000, limit: 200, message: 'Too many requests. Try again later.' });
const messageLimiter = () => makeLimiter({ windowMs: 60 * 1000, limit: 30, message: 'Too many messages. Slow down.' });
// Session probe has its own ceiling so polling clients don't eat the shared budget.
const meLimiter = () => makeLimiter({ windowMs: 60 * 1000, limit: 300, message: 'Too many session checks. Slow down.' });
// Per-email Map in auth.controller is the second login layer.
const loginLimiter = () => makeLimiter({ windowMs: 60 * 1000, limit: 10, message: 'Too many login attempts. Try again in a minute.' });
const logoutLimiter = () => makeLimiter({ windowMs: 15 * 60 * 1000, limit: 60, message: 'Too many logout attempts. Try again later.' });

module.exports = { makeLimiter, aiLimiter, coachLimiter, feedbackLimiter, settingsLimiter, writeLimiter, messageLimiter, meLimiter, loginLimiter, logoutLimiter };
