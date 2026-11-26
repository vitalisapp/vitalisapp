import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function boot({ query = '', online = true, worker } = {}) {
  const listeners = {};
  const replacements = [];
  const timers = [];
  const root = { textContent: '' };
  const location = {
    href: `https://example.com/register${query}`,
    origin: 'https://example.com',
    replace: (url) => replacements.push(url),
  };
  vm.runInNewContext(script, {
    URL, location, Date,
    navigator: { onLine: online, ...(worker ? { serviceWorker: worker } : {}) },
    window: { addEventListener: (name, fn) => { listeners[name] = fn; } },
    document: { readyState: 'complete', getElementById: () => root },
    setTimeout: (fn) => { timers.push(fn); return timers.length; },
    clearTimeout: () => {},
  });
  const fail = (src = '/assets/index-old.js', type = 'module') =>
    listeners.error({ target: { tagName: 'SCRIPT', type, src } });
  return { fail, replacements, root, timers };
}

test('missing entry retries once, preserving the route, query and fragment', () => {
  const page = boot({ query: '?next=dashboard#form' });
  page.fail();
  page.fail();
  assert.equal(page.replacements.length, 1);
  const destination = new URL(page.replacements[0]);
  assert.equal(destination.pathname, '/register');
  assert.equal(destination.searchParams.get('next'), 'dashboard');
  assert.equal(destination.hash, '#form');
  assert.ok(destination.searchParams.has('__vitalis_asset_retry'));
});

test('failed retry and offline visit show a message instead of looping', () => {
  for (const options of [{ query: '?__vitalis_asset_retry=1' }, { online: false }]) {
    const page = boot(options);
    page.fail();
    assert.equal(page.replacements.length, 0);
    assert.match(page.root.textContent, /could not load/);
  }
});

test('unrelated scripts do not trigger recovery', () => {
  const page = boot();
  page.fail('https://external.example/assets/script.js');
  page.fail('/src/main.jsx');
  page.fail('/assets/analytics.js', '');
  assert.equal(page.replacements.length, 0);
});

test('worker activation and timeout cannot cause two reloads', async () => {
  let activate;
  let updated = false;
  const worker = {
    addEventListener: (name, fn) => { activate = fn; },
    removeEventListener: () => {},
    register: async (url, options) => {
      assert.equal(url, '/sw.js');
      assert.equal(options.updateViaCache, 'none');
      return { update: async () => { updated = true; } };
    },
  };
  const page = boot({ worker });
  page.fail();
  assert.equal(page.replacements.length, 0);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(updated, true);
  activate();
  page.timers[0]();
  assert.equal(page.replacements.length, 1);
});

test('page routes revalidate while hashed assets remain immutable', () => {
  const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
  for (const path of ['/', '/register', '/dashboard', '/index.html', '/sw.js']) {
    const rules = config.headers.filter((rule) => new RegExp(`^${rule.source}$`).test(path));
    assert.ok(rules.some((rule) => rule.headers.some((h) => h.value.includes('no-store'))), path);
  }
  const assetRules = config.headers.filter((rule) => new RegExp(`^${rule.source}$`).test('/assets/index-hash.js'));
  assert.equal(assetRules.length, 1);
  assert.match(assetRules[0].headers[0].value, /immutable/);
});
