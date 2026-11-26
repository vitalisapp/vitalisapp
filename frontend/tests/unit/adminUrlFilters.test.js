import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ADMIN_FILTERS, readAdminFilters, writeAdminFilters } from '../../src/features/admin/utils/urlFilters.js';

const read = (query, config) => readAdminFilters(new URLSearchParams(query), config);
const change = (query, config, patch) => writeAdminFilters(new URLSearchParams(query), config, patch);

describe('admin URL filters', () => {
  it('restores a shared member directory including its page', () => {
    assert.deepEqual(read('q=Ana+Maria&role=admin&status=active&page=3', ADMIN_FILTERS.users), {
      q: 'Ana Maria', role: 'admin', status: 'active', page: '3',
    });
  });

  it('changing or clearing search keeps role/status and resets pagination atomically', () => {
    const start = 'q=Ana&role=member&status=active&page=4&source=report';
    const next = change(start, ADMIN_FILTERS.users, { q: 'Jo & Lee', page: 1 });
    assert.equal(next.get('q'), 'Jo & Lee');
    assert.equal(next.get('role'), 'member');
    assert.equal(next.get('status'), 'active');
    assert.equal(next.get('source'), 'report');
    assert.equal(next.has('page'), false);
    const clear = change(next, ADMIN_FILTERS.users, { q: '', page: 1 });
    assert.equal(clear.has('q'), false);
    assert.equal(clear.get('role'), 'member');
  });

  it('rejects invalid roles, windows and unsafe or fractional page numbers', () => {
    assert.equal(read('role=owner&status=deleted', ADMIN_FILTERS.users).role, '');
    assert.equal(read('role=owner&status=deleted', ADMIN_FILTERS.users).status, '');
    for (const page of ['0', '-2', '1.5', '3junk', 'Infinity', '9999999999999999', '1e4']) {
      assert.equal(read(`page=${page}`, ADMIN_FILTERS.audit).page, '1', page);
    }
    assert.equal(read('days=999', ADMIN_FILTERS.aiUsage).days, '14');
    assert.equal(read('days=90', ADMIN_FILTERS.overview).days, '14');
  });

  it('content tabs and independent table pages survive refresh and tag changes', () => {
    const config = ADMIN_FILTERS.content;
    const initial = 'tab=community&tag=Healthy+Eating&plansPage=2&postsPage=4';
    assert.deepEqual(read(initial, config), { tab: 'community', tag: 'Healthy Eating', plansPage: '2', postsPage: '4' });
    const tagged = change(initial, config, { tag: 'strength', postsPage: 1 });
    assert.equal(tagged.get('plansPage'), '2');
    assert.equal(tagged.has('postsPage'), false);
    const switched = change(tagged, config, { tab: 'plans' });
    assert.equal(switched.has('tab'), false);
    assert.equal(switched.get('tag'), 'strength');
  });

  it('overview calendar dates must be real and stay date-only', () => {
    assert.deepEqual(read('days=30&category=nutrition&date=2024-02-29', ADMIN_FILTERS.overview), {
      days: '30', category: 'nutrition', date: '2024-02-29',
    });
    for (const date of ['2025-02-29', '2026-04-31', 'tomorrow', '2026-1-2']) {
      assert.equal(read(`date=${date}`, ADMIN_FILTERS.overview).date, '');
    }
  });

  it('changing the AI window resets its page and omits default values', () => {
    const next = change('days=90&page=5', ADMIN_FILTERS.aiUsage, { days: 14, page: 1 });
    assert.equal(next.toString(), '');
    assert.deepEqual(read(next, ADMIN_FILTERS.aiUsage), { days: '14', page: '1' });
  });

  it('monitoring clear preserves unrelated query parameters', () => {
    const next = change('status=red&flag=inactive&q=Ana&page=2&source=overview', ADMIN_FILTERS.monitoring, {
      status: '', flag: '', q: '', page: 1,
    });
    assert.equal(next.toString(), 'source=overview');
  });

  it('an earlier URL snapshot restores the exact previous filters', () => {
    const original = new URLSearchParams('role=member&page=2');
    const changed = change(original, ADMIN_FILTERS.users, { status: 'active', page: 1 });
    assert.equal(original.toString(), 'role=member&page=2');
    assert.equal(read(changed, ADMIN_FILTERS.users).status, 'active');
    assert.deepEqual(read(original, ADMIN_FILTERS.users), { q: '', role: 'member', status: '', page: '2' });
  });
});
