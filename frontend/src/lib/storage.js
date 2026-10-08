/** @param {string} key @param {string | null} [fallback] @returns {string | null} */
export function safeGet(key, fallback = null) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    return localStorage.getItem(key);
  } catch {
    return fallback;
  }
}

/** @param {string} key @param {string} value @returns {boolean} */
export function safeSet(key, value) {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** @param {string} key @returns {void} */
export function safeRemove(key) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

/** @template T @param {string} key @param {T} fallback @returns {T} */
export function safeGetJSON(key, fallback = null) {
  const raw = safeGet(key, null);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** @param {string} key @param {unknown} value @returns {boolean} */
export function safeSetJSON(key, value) {
  try {
    return safeSet(key, JSON.stringify(value));
  } catch {
    return false;
  }
}
