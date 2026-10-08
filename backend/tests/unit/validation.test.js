// tests/unit/validation.test.js — Zod contracts for Community + Settings (no DB).
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const community = require('../../src/controllers/community.controller');
const settings = require('../../src/controllers/settings.controller');

describe('community.createPostSchema', () => {
  it('accepts valid post', () => {
    const r = community.createPostSchema.safeParse({ text: 'Morning run done!', tag: 'Training' });
    assert.equal(r.success, true);
  });

  it('defaults missing tag to General', () => {
    const r = community.createPostSchema.safeParse({ text: 'hello' });
    assert.equal(r.success, true);
    assert.equal(r.data.tag, 'General');
  });

  it('rejects empty text', () => {
    assert.equal(community.createPostSchema.safeParse({ text: '   ' }).success, false);
  });

  it('rejects >1000 chars', () => {
    assert.equal(community.createPostSchema.safeParse({ text: 'x'.repeat(1001) }).success, false);
  });

  it('rejects unknown tag (no silent coerce)', () => {
    assert.equal(community.createPostSchema.safeParse({ text: 'hi', tag: 'Spam' }).success, false);
  });
});

describe('community.createCommentSchema', () => {
  it('accepts valid comment', () => {
    assert.equal(community.createCommentSchema.safeParse({ text: 'Nice work!' }).success, true);
  });

  it('rejects empty and >500 chars', () => {
    assert.equal(community.createCommentSchema.safeParse({ text: '' }).success, false);
    assert.equal(community.createCommentSchema.safeParse({ text: 'x'.repeat(501) }).success, false);
  });
});

describe('community.paginationSchema', () => {
  it('defaults limit 20 / offset 0', () => {
    const r = community.paginationSchema.safeParse({});
    assert.equal(r.success, true);
    assert.equal(r.data.limit, 20);
    assert.equal(r.data.offset, 0);
  });

  it('rejects limit over 50', () => {
    assert.equal(community.paginationSchema.safeParse({ limit: 200 }).success, false);
  });
});

describe('settings.putSettingsSchema', () => {
  it('accepts partial update', () => {
    const r = settings.putSettingsSchema.safeParse({ step_goal: 10000 });
    assert.equal(r.success, true);
  });

  it('coerces numeric strings', () => {
    const r = settings.putSettingsSchema.safeParse({ step_goal: '8000' });
    assert.equal(r.success, true);
    assert.equal(r.data.step_goal, 8000);
  });

  it('rejects bad units / theme / out-of-range goal / empty body', () => {
    assert.equal(settings.putSettingsSchema.safeParse({ units: 'bogus' }).success, false);
    assert.equal(settings.putSettingsSchema.safeParse({ theme: 'neon' }).success, false);
    assert.equal(settings.putSettingsSchema.safeParse({ step_goal: 5 }).success, false);
    assert.equal(settings.putSettingsSchema.safeParse({}).success, false);
  });
});
