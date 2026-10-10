// Shared dev-gated log wrappers for AI modules. Centralizes the
// "dev-visible, prod-quiet" policy so call sites stay clean.
const log = require('../../utils/logger');

function devLog(...args) {
  log.info(...args);
}
function devWarn(...args) {
  if (process.env.NODE_ENV !== 'production') log.warn(...args);
}
function devError(...args) {
  log.error(...args);
}

module.exports = { devLog, devWarn, devError };
