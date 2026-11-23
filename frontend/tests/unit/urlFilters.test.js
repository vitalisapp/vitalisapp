import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toSlug, fromSlug, readFilters, writeFilters } from '../../src/lib/urlFilters.js';

const EQUIPMENT = ['Barbell', 'Pull-up Bar', 'Resistance Band'];
const CONFIG = { q: {}, equipment: { options: EQUIPMENT }, type: { options: ['weight_reps', 'duration'] } };

test('toSlug makes URL-safe lowercase slugs', () => {
  assert.equal(toSlug('Pull-up Bar'), 'pull-up-bar');
  assert.equal(toSlug('weight_reps'), 'weight-reps');
  assert.equal(toSlug('  Lower Back  '), 'lower-back');
  assert.equal(toSlug(null), '');
});

test('fromSlug resolves slugs and raw labels, ignores unknown values', () => {
  assert.equal(fromSlug('pull-up-bar', EQUIPMENT), 'Pull-up Bar');
  assert.equal(fromSlug('Pull-up Bar', EQUIPMENT), 'Pull-up Bar');
  assert.equal(fromSlug('spaceship', EQUIPMENT), '');
  assert.equal(fromSlug('', EQUIPMENT), '');
});

test('readFilters returns canonical values', () => {
  const params = new URLSearchParams('q=press&equipment=resistance-band&type=weight-reps&other=1');
  assert.deepEqual(readFilters(params, CONFIG), { q: 'press', equipment: 'Resistance Band', type: 'weight_reps' });
});

test('writeFilters sets slugs, deletes empties and keeps unrelated params', () => {
  const start = new URLSearchParams('tab=library&equipment=barbell');
  const next = writeFilters(start, CONFIG, { equipment: 'Pull-up Bar', type: '', q: 'curl' });
  assert.equal(next.toString(), 'tab=library&equipment=pull-up-bar&q=curl');
  const cleared = writeFilters(next, CONFIG, { equipment: 'not-real', q: '   ' });
  assert.equal(cleared.toString(), 'tab=library');
});
