// Windows Widgets Board: data shaping (public/widgets/widget-data.js, a classic
// service-worker script loaded here through vm) + template/manifest sanity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = (rel) => readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');

function loadData() {
  const sandbox = { self: {} };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read('public/widgets/widget-data.js'), sandbox);
  return sandbox.self.VitalisWidgetData;
}

const Data = loadData();
const NOW = new Date(2026, 10, 23, 9, 5);

test('ready state uses real numbers and the step goal', () => {
  const out = Data.todayActivity(
    { today: '2026-11-23', stats: { steps: 6400, calories: 313, minutes: 41 }, stepGoal: 8000, streak: { current: 1 } },
    NOW,
  );
  assert.equal(out.state, 'ready');
  assert.equal(out.steps, '6,400');
  assert.equal(out.stepGoal, '8,000');
  assert.equal(out.pctLabel, '80%');
  assert.equal(out.pctWeight, 80);
  assert.equal(out.restWeight, 20);
  assert.equal(out.calories, '313');
  assert.equal(out.minutes, '41m');
  assert.equal(out.streak, '1 day');
  assert.equal(out.actionVerb, 'open-dashboard');
  assert.match(out.dateLabel, /Nov 23/);
});

test('nothing logged -> empty state, never sample values', () => {
  const out = Data.todayActivity({ stats: { steps: 0, calories: 0, minutes: 0 }, stepGoal: 8000 }, NOW);
  assert.equal(out.state, 'empty');
  assert.equal(out.steps, '0');
});

test('progress weights stay valid for Adaptive Cards (never 0, capped at 99)', () => {
  const over = Data.todayActivity({ stats: { steps: 20000 }, stepGoal: 8000 }, NOW);
  assert.equal(over.pctLabel, '100%');
  assert.equal(over.pctWeight, 99);
  assert.equal(over.restWeight, 1);
  const tiny = Data.todayActivity({ stats: { steps: 10 }, stepGoal: 8000 }, NOW);
  assert.equal(tiny.pctWeight, 1);
});

test('signed-out and error states carry no stats', () => {
  const out = Data.signedOut(NOW);
  assert.equal(out.state, 'signedout');
  assert.equal(out.actionVerb, 'sign-in');
  assert.equal(out.steps, undefined);
  assert.equal(Data.failed(NOW).state, 'error');
});

test('template is a valid Adaptive Card covering every state and verb', () => {
  const card = JSON.parse(read('public/widgets/today-activity.json'));
  assert.equal(card.type, 'AdaptiveCard');
  assert.equal(card.version, '1.5');
  const raw = JSON.stringify(card);
  for (const state of ['ready', 'empty', 'loading', 'signedout', 'error']) assert.ok(raw.includes(`'${state}'`), state);
  assert.equal(card.actions[0].type, 'Action.Execute');
});

test('manifest widget tag matches the service worker and the catalog', () => {
  const config = read('vite.config.js');
  const sw = read('public/widgets/sw-widgets.js');
  const catalog = read('src/features/user/Preferences/lib/widgetCatalog.js');
  assert.match(config, /tag: 'vitalis-today'/);
  assert.match(sw, /var TAG = 'vitalis-today'/);
  assert.match(catalog, /windowsTag: 'vitalis-today'/);
  assert.match(config, /ms_ac_template: '\/widgets\/today-activity\.json'/);
});

test('initial data file renders the loading state', () => {
  const data = JSON.parse(read('public/widgets/today-activity-data.json'));
  assert.equal(data.state, 'loading');
  assert.equal(data.actionVerb, 'open-dashboard');
  assert.match(read('vite.config.js'), /data: '\/widgets\/today-activity-data\.json'/);
});

test('host install/resume events render without waiting for an instance', () => {
  const sw = read('public/widgets/sw-widgets.js');
  assert.match(sw, /refresh\(true, event\.widget\)/);
});
