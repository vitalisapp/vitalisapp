// Per-email login throttle (second layer; the IP limiter in routes is primary).
const loginAttempts = new Map();
const ATTEMPT_TTL_MS = 30 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of loginAttempts) {
    if (rec.lockedUntil && rec.lockedUntil <= now) loginAttempts.delete(key);
    else if (!rec.lockedUntil && now - (rec.firstSeen || now) > ATTEMPT_TTL_MS) loginAttempts.delete(key);
  }
  if (loginAttempts.size > 5000) {
    const oldest = [...loginAttempts.keys()].slice(0, loginAttempts.size - 5000);
    for (const k of oldest) loginAttempts.delete(k);
  }
}, 10 * 60 * 1000).unref?.();

function normEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getRateLimit(email) {
  const key = normEmail(email);
  if (!loginAttempts.has(key)) return { count: 0, lockedUntil: null, firstSeen: Date.now() };
  return loginAttempts.get(key);
}

function recordFailedAttempt(email) {
  const key = normEmail(email);
  const record = getRateLimit(key);
  const count  = record.count + 1;

  let lockedUntil = null;
  if (count >= 20) {
    lockedUntil = Date.now() + 30 * 60 * 1000;
  } else if (count >= 10) {
    lockedUntil = Date.now() + 30 * 1000;
  }

  loginAttempts.set(key, { count, lockedUntil, firstSeen: record.firstSeen || Date.now() });
  return count;
}

function clearAttempts(email) {
  loginAttempts.delete(normEmail(email));
}

function checkRateLimit(email) {
  const record = getRateLimit(email);
  if (!record.lockedUntil) return null;

  const remaining = record.lockedUntil - Date.now();
  if (remaining <= 0) {
    loginAttempts.delete(normEmail(email));
    return null;
  }

  if (record.count >= 20) {
    const mins = Math.ceil(remaining / 60000);
    return {
      error:    `Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`,
      retryAfter: Math.ceil(remaining / 1000),
    };
  } else {
    const secs = Math.ceil(remaining / 1000);
    return {
      error:    `Too many failed attempts. Try again in ${secs} second${secs !== 1 ? 's' : ''}.`,
      retryAfter: Math.ceil(remaining / 1000),
    };
  }
}

module.exports = {
  normEmail,
  getRateLimit,
  recordFailedAttempt,
  clearAttempts,
  checkRateLimit,
};
