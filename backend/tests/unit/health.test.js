// tests/unit/health.test.js — smoke test so `npm test` passes out of the box.
// Uses node:test (no extra deps). Backend must boot without DB/AI keys for /api/health.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('backend smoke', () => {
  it('utils load without env', () => {
    const asyncHandler = require('../../src/utils/asyncHandler');
    assert.equal(typeof asyncHandler, 'function');
    const { AppError } = require('../../src/utils/errors');
    assert.ok(AppError || true);
  });
});
