// tests/unit/account-validation.test.js — Section 1 (account & verification):
// minimum-age explanation, friendly validation messages, access-QR codes.
// Pure, no DB.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { z } = require('zod');

const { checkDob, ageOn, MIN_AGE } = require('../../src/utils/age');
const { friendlyMessage, validate } = require('../../src/middleware/validate');
const { makeCode, normCode } = require('../../src/services/accessGroups.service');

const NOW = new Date('2026-11-21T12:00:00Z');

describe('age rule', () => {
  it('computes birthday-accurate age', () => {
    assert.equal(ageOn('2013-11-21', NOW), 13);
    assert.equal(ageOn('2013-11-22', NOW), 12);
  });

  it('explains (not just blocks) a 2015 birth year', () => {
    const r = checkDob('2015-03-10', NOW);
    assert.equal(r.ok, false);
    assert.equal(r.code, 'AGE_TOO_YOUNG');
    assert.match(r.message, /11 years old/);
    assert.match(r.message, new RegExp(`${MIN_AGE} and up`));
    assert.match(r.message, /wrong year/);
  });

  it('accepts exactly 13 and rejects future / impossible / absurd dates', () => {
    assert.equal(checkDob('2013-11-21', NOW).ok, true);
    assert.equal(checkDob('2027-01-01', NOW).code, 'DOB_FUTURE');
    assert.equal(checkDob('2001-02-30', NOW).code, 'DOB_INVALID');
    assert.equal(checkDob('1890-01-01', NOW).code, 'AGE_TOO_OLD');
    assert.equal(checkDob('', NOW).code, 'DOB_REQUIRED');
  });
});

describe('friendly validation messages', () => {
  const schema = z.object({
    name: z.string().trim().min(2, 'Name too short'),
    email: z.string().email('Invalid email address'),
    fullName: z.string().min(3),
  });

  it('keeps custom schema messages verbatim', () => {
    const r = schema.safeParse({ name: 'A', email: 'x@y.co', fullName: 'abc' });
    assert.equal(friendlyMessage(r.error.issues[0]), 'Name too short');
  });

  it('rewrites zod default messages into plain language', () => {
    const missing = schema.safeParse({ name: 'Al', email: 'x@y.co' });
    assert.equal(friendlyMessage(missing.error.issues[0]), 'Full name is required.');
    const short = schema.safeParse({ name: 'Al', email: 'x@y.co', fullName: 'ab' });
    assert.equal(friendlyMessage(short.error.issues[0]), 'Full name must be at least 3 characters.');
  });

  it('middleware surfaces the first friendly message as the error', () => {
    let captured;
    validate(schema)({ body: { name: 'Al', email: 'nope', fullName: 'abc' } }, {}, (err) => { captured = err; });
    assert.equal(captured.status, 400);
    assert.equal(captured.message, 'Invalid email address');
    assert.equal(captured.code, 'VALIDATION_ERROR');
  });
});

describe('access QR codes', () => {
  it('generates unambiguous 8-char codes', () => {
    for (let i = 0; i < 200; i++) {
      const c = makeCode();
      assert.match(c, /^[A-HJ-KM-NP-Z2-9]{8}$/);
      assert.equal(normCode(c), c);
    }
  });

  it('normalises case and rejects junk / injection attempts', () => {
    assert.equal(normCode(' abcd2345 '), 'ABCD2345');
    assert.equal(normCode('abc'), '');
    assert.equal(normCode("AB' OR 1=1"), '');
    assert.equal(normCode(undefined), '');
  });
});
