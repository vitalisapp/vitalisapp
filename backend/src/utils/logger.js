// Structured logger — the only logging interface for app code under src/.
//
// Levels (lowest to highest signal):
// - debug: dev diagnostics (row dumps, cache hits, signatures). Shown only
//   when DEBUG is set. Never in production by default.
// - info: operational notes (request lines, saves). Shown in development,
//   hidden in production unless DEBUG is set.
// - warn / error: always shown in every env — warnings and errors are
//   signal, not noise.
//
// Intentionally NOT used by:
// - CLI scripts (src/db/migrate.js, create-migration.js, scripts/*) — their
//   console output is user-facing CLI UX, not app logs.
// - server.js boot banner / fatal handlers — operators must always see those.
// - src/config/env.js boot messages stay on console too: env loads before
//   anything and its fail-fast output must never be gated.
//
// Usage: const log = require('../utils/logger'); log.info('[http] ...');
const isProd = process.env.NODE_ENV === 'production';
const debugOn = Boolean(process.env.DEBUG) && process.env.DEBUG !== '0';

function debug(...args) {
  if (debugOn) console.debug(...args);
}

function info(...args) {
  if (!isProd || debugOn) console.info(...args);
}

function warn(...args) {
  console.warn(...args);
}

function error(...args) {
  console.error(...args);
}

module.exports = { debug, info, warn, error };
