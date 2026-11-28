// tests/unit/message-time.test.js — chat timestamp wire format (pure, no DB).
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { SENT_TS_COL, toWireMessage } = require('../../src/utils/messageTime');

describe('message time wire format', () => {
  it('selects an epoch, never a pre-formatted (UTC 24h) time string', () => {
    assert.match(SENT_TS_COL, /UNIX_TIMESTAMP\(sent_at\)/);
    assert.doesNotMatch(SENT_TS_COL, /DATE_FORMAT|%H/);
  });

  it('turns the epoch into an ISO-8601 UTC sent_at and drops sent_ts', () => {
    // 2026-11-27 23:45:00 UTC == 2026-11-28 07:45 in Asia/Manila
    const out = toWireMessage({ id: 1, content: 'hello', sent_ts: 1795823100 });
    assert.equal(out.sent_at, '2026-11-27T23:45:00.000Z');
    assert.equal('sent_ts' in out, false);
    assert.equal(out.content, 'hello');
  });

  it('accepts string epochs (mysql2 may return DECIMAL as string)', () => {
    assert.equal(toWireMessage({ sent_ts: '1795823100' }).sent_at, '2026-11-27T23:45:00.000Z');
  });

  it('yields null sent_at for missing/invalid timestamps', () => {
    assert.equal(toWireMessage({ sent_ts: null }).sent_at, null);
    assert.equal(toWireMessage({ sent_ts: 'nope' }).sent_at, null);
    assert.equal(toWireMessage({}).sent_at, null);
  });

  it('passes through null rows', () => {
    assert.equal(toWireMessage(undefined), undefined);
  });
});
