import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isChunkLoadError } from '../../src/lib/lazyWithReload.js';

describe('isChunkLoadError', () => {
  it('recognises stale-chunk errors from each browser', () => {
    for (const msg of [
      'Failed to fetch dynamically imported module: https://x.app/assets/Dashboard-DOtLA1pf.js', // Chrome
      'error loading dynamically imported module: https://x.app/assets/a.js', // Firefox
      'Importing a module script failed.', // Safari
      'Unable to preload CSS for /assets/Log-1.css', // Vite CSS preload
    ]) assert.equal(isChunkLoadError(new Error(msg)), true, msg);
  });

  it('ignores ordinary errors so real bugs still surface', () => {
    assert.equal(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'map')")), false);
    assert.equal(isChunkLoadError(null), false);
  });
});
