// tests/unit/session-dedupe.test.js — one user_sessions row per device.
// Runs the real logUserSession() against an in-memory fake of the DB pool so
// the matching rules (user + device + browser + os, IP ignored) are exercised
// without touching a database.
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const CHROME_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const FIREFOX_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0';

// Minimal user_sessions table + the four statements logUserSession issues.
const table = [];
let nextId = 1;
const same = (a, b) => (a ?? null) === (b ?? null); // MySQL <=>
const conn = {
  beginTransaction: async () => {},
  commit: async () => {},
  rollback: async () => {},
  release: () => {},
  async execute(sql, p) {
    if (sql.includes('COUNT(*) AS prior')) return [[{ prior: table.filter((r) => r.user_id === p[0]).length }]];
    if (sql.includes('SELECT id FROM user_sessions')) {
      const hit = table.filter((r) => r.user_id === p[0] && same(r.device, p[1]) && same(r.browser, p[2]) && same(r.os, p[3]))
        .sort((a, b) => b.created_at - a.created_at);
      return [hit.slice(0, 1).map((r) => ({ id: r.id }))];
    }
    if (sql.includes('SET is_current = false')) { table.filter((r) => r.user_id === p[0]).forEach((r) => { r.is_current = false; }); return [{}]; }
    if (sql.includes('SET ip_address = ?')) {
      const r = table.find((x) => x.id === p[2] && x.user_id === p[3]);
      Object.assign(r, { ip_address: p[0], location: p[1], is_current: true, created_at: Date.now() });
      return [{}];
    }
    if (sql.includes('INSERT INTO user_sessions')) {
      const [user_id, device, browser, os, ip_address, location] = p;
      table.push({ id: nextId++, user_id, device, browser, os, ip_address, location, is_current: true, created_at: Date.now() });
      return [{}];
    }
    throw new Error(`unexpected SQL: ${sql}`);
  },
};

let logUserSession;
before(() => {
  const dbPath = require.resolve(path.join(__dirname, '..', '..', 'src', 'config', 'db'));
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { getConnection: async () => conn, execute: async () => [[]], query: async () => [[]] } };
  ({ logUserSession } = require('../../src/services/auth.service'));
});

const req = (ua, ip) => ({ headers: { 'user-agent': ua, 'x-forwarded-for': ip }, socket: {} });

describe('logUserSession — one row per device', () => {
  it('first login inserts a row but is not a "new device" warning case', async () => {
    const s = await logUserSession(req(CHROME_WIN, '10.0.0.1'), 7);
    assert.equal(s.isNewDevice, true);
    assert.equal(s.priorSessions, 0); // controller skips the warning when 0
    assert.equal(s.deviceLabel, 'Chrome on Windows');
    assert.equal(table.length, 1);
  });

  it('logging in again on the same device refreshes the row, even from a new IP', async () => {
    const s = await logUserSession(req(CHROME_WIN, '192.168.1.50'), 7);
    assert.equal(s.isNewDevice, false);
    assert.equal(table.filter((r) => r.user_id === 7).length, 1);
    assert.equal(table[0].ip_address, '192.168.1.50');
    assert.equal(table[0].is_current, true);
  });

  it('a different browser is a new device: new row, warning-eligible, only it is current', async () => {
    const s = await logUserSession(req(FIREFOX_WIN, '10.0.0.1'), 7);
    assert.equal(s.isNewDevice, true);
    assert.ok(s.priorSessions > 0);
    assert.equal(s.deviceLabel, 'Firefox on Windows');
    const mine = table.filter((r) => r.user_id === 7);
    assert.equal(mine.length, 2);
    assert.deepEqual(mine.filter((r) => r.is_current).map((r) => r.browser), ['Firefox']);
  });

  it("other users' rows are never matched", async () => {
    const s = await logUserSession(req(CHROME_WIN, '10.0.0.1'), 8);
    assert.equal(s.priorSessions, 0);
    assert.equal(table.filter((r) => r.user_id === 8).length, 1);
    assert.equal(table.filter((r) => r.user_id === 7).length, 2);
  });
});
