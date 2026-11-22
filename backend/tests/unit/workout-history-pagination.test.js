// tests/unit/workout-history-pagination.test.js — query parsing for the
// paginated GET /api/workout-logs?page=&limit=&date= (Progress page).
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  parseHistoryQuery,
  PAGE_LIMIT_DEFAULT,
  PAGE_LIMIT_MAX,
} = require('../../src/services/workoutLogs.service');

describe('workout history pagination — query parsing', () => {
  it('reads valid page, limit and date', () => {
    assert.deepEqual(parseHistoryQuery({ page: '3', limit: '10', date: '2026-11-19' }), {
      page: 3, limit: 10, date: '2026-11-19',
    });
  });

  it('defaults when params are missing', () => {
    assert.deepEqual(parseHistoryQuery({}), { page: 1, limit: PAGE_LIMIT_DEFAULT, date: null });
  });

  it('clamps page and limit into safe ranges', () => {
    assert.equal(parseHistoryQuery({ page: '0' }).page, 1);
    assert.equal(parseHistoryQuery({ page: '-4' }).page, 1);
    assert.equal(parseHistoryQuery({ page: 'abc' }).page, 1);
    assert.equal(parseHistoryQuery({ limit: '0' }).limit, 1);
    assert.equal(parseHistoryQuery({ limit: '5000' }).limit, PAGE_LIMIT_MAX);
  });

  it('rejects malformed or impossible dates', () => {
    assert.equal(parseHistoryQuery({ date: '2026-02-30' }).date, null);
    assert.equal(parseHistoryQuery({ date: '19-11-2026' }).date, null);
    assert.equal(parseHistoryQuery({ date: "2026-11-19' OR 1=1" }).date, null);
    assert.equal(parseHistoryQuery({ date: ['2026-11-19'] }).date, null);
  });
});
