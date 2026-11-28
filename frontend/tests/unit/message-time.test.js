// Chat timestamps render in the viewer's timezone, 12-hour.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { messageDate, formatMessageTime, formatMessageTooltip } from '../../src/lib/messageTime.js';

// 23:45 UTC — the value that used to leak to users as "23:45".
const msg = { sent_at: '2026-11-27T23:45:00.000Z' };

describe('message time formatting', () => {
  it('formats in 12-hour time, not military time', () => {
    const s = formatMessageTime(msg, 'en-US');
    assert.match(s, /^\d{1,2}:\d{2}\s?[AP]M$/);
  });

  it('converts UTC to the viewer timezone (Asia/Manila → 7:45 AM)', () => {
    const d = messageDate(msg);
    const s = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' });
    assert.equal(s.replace(/\s+/g, ' '), '7:45 AM');
  });

  it('returns empty strings for missing or invalid timestamps', () => {
    assert.equal(formatMessageTime({}), '');
    assert.equal(formatMessageTime({ sent_at: 'garbage' }), '');
    assert.equal(formatMessageTooltip(null), '');
    assert.equal(messageDate({ sent_at: null }), null);
  });
});
