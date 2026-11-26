// tests/unit/password-policy.test.js — Revision #1: strong password policy.
// Pure, no DB. Covers the rule set, messages, the zod field used by the
// register / change-password routes, and hashing.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

const {
  MIN_LENGTH,
  BCRYPT_COST,
  checkPassword,
  isWeakPassword,
  hashPassword,
  needsRehash,
  strongPassword,
} = require('../../src/utils/passwordPolicy');
const { validate } = require('../../src/middleware/validate');

const STRONG = 'Tr4ining-Day!';

describe('password policy rules', () => {
  it('uses a 12 character minimum', () => {
    assert.equal(MIN_LENGTH, 12);
  });

  it('accepts a password meeting every rule', () => {
    const r = checkPassword(STRONG);
    assert.equal(r.ok, true);
    assert.deepEqual(r.failed, []);
    assert.equal(r.message, null);
  });

  it('rejects each missing rule individually', () => {
    assert.deepEqual(checkPassword('Short1!a').failed, ['length']);
    assert.deepEqual(checkPassword('tr4ining-day!').failed, ['upper']);
    assert.deepEqual(checkPassword('TR4INING-DAY!').failed, ['lower']);
    assert.deepEqual(checkPassword('Training-Day!').failed, ['number']);
    assert.deepEqual(checkPassword('Tr4iningDay12').failed, ['special']);
  });

  it('does not count whitespace as a special character', () => {
    assert.ok(checkPassword('Tr4ining Day12').failed.includes('special'));
  });

  it('rejects the old 8-character style passwords', () => {
    assert.equal(checkPassword('password').ok, false);
    assert.equal(checkPassword('Passw0rd!').ok, false); // 9 chars
  });

  it('names every missing rule in one clear message', () => {
    const r = checkPassword('abc');
    assert.equal(
      r.message,
      'Password must include at least 12 characters, an uppercase letter, a number and a special character (e.g. ! @ # $).',
    );
  });

  it('rejects common passwords even when they meet the character rules', () => {
    for (const pw of ['Password123!', 'P@ssword-123', 'Welcome123!!', 'Vitalis1234!']) {
      const r = checkPassword(pw);
      assert.equal(r.ok, false, pw);
      assert.deepEqual(r.failed, ['common'], pw);
      assert.match(r.message, /too common/);
    }
  });

  it('rejects input bcrypt would truncate (over 72 bytes)', () => {
    const long = `Aa1!${'x'.repeat(69)}`; // 73 bytes
    const r = checkPassword(long);
    assert.equal(r.ok, false);
    assert.ok(r.failed.includes('maxBytes'));
    assert.match(r.message, /too long/);
    assert.equal(checkPassword(`Aa1!${'x'.repeat(68)}`).ok, true); // exactly 72
  });

  it('treats non-strings as failing, never throwing', () => {
    assert.equal(checkPassword(undefined).ok, false);
    assert.equal(checkPassword(null).ok, false);
    assert.equal(checkPassword(12345678901234).ok, false);
  });

  it('isWeakPassword flags legacy passwords without rejecting them', () => {
    assert.equal(isWeakPassword('oldpass1'), true);
    assert.equal(isWeakPassword(STRONG), false);
  });
});

describe('strongPassword zod field via validate()', () => {
  const schema = z.object({ password: strongPassword(z) });
  const run = (body) => {
    const req = { body };
    let error;
    validate(schema)(req, {}, (err) => { error = err; });
    return { req, error };
  };

  it('passes a strong password through unchanged', () => {
    const { req, error } = run({ password: STRONG });
    assert.equal(error, undefined);
    assert.equal(req.body.password, STRONG);
  });

  it('returns the specific policy message as a 400', () => {
    const { error } = run({ password: 'weakpass' });
    assert.equal(error.status, 400);
    assert.equal(error.code, 'VALIDATION_ERROR');
    assert.match(error.message, /^Password must include/);
    assert.match(error.message, /uppercase letter/);
  });

  it('requires the field', () => {
    const { error } = run({});
    assert.equal(error.status, 400);
  });
});

describe('password hashing', () => {
  it('hashes with the current cost and verifies', async () => {
    const hash = await hashPassword(STRONG);
    assert.equal(bcrypt.getRounds(hash), BCRYPT_COST);
    assert.equal(await bcrypt.compare(STRONG, hash), true);
    assert.equal(await bcrypt.compare('wrong', hash), false);
  });

  it('flags legacy cost-10 hashes for a transparent upgrade', async () => {
    const legacy = await bcrypt.hash('oldpass1', 10);
    assert.equal(needsRehash(legacy), true);
    // The legacy password still verifies — old accounts keep working.
    assert.equal(await bcrypt.compare('oldpass1', legacy), true);
    assert.equal(needsRehash(await hashPassword(STRONG)), false);
    assert.equal(needsRehash('not-a-hash'), false);
  });
});
