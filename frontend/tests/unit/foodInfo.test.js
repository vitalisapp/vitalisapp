// Section 6 — sugar / sodium monitoring + goal-based intake note.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { goalIntakeNote, limitStatus, sugarSodiumTotals, LIMITS } from '../../src/lib/foodInfo.js';
import { scaleFromPer100 } from '../../src/lib/nutrition.js';

describe('sugar & sodium', () => {
  it('sums only entries that have data and finds the top source', () => {
    const t = sugarSodiumTotals([
      { food_name: 'Chicken adobo', sugar: 2, sodium: 1100 },
      { food_name: 'Halo-halo', sugar: 62, sodium: 120 },
      { food_name: 'Old entry', calories: 300 },
    ]);
    assert.equal(t.sugar, 64);
    assert.equal(t.sodium, 1220);
    assert.equal(t.known, 2);
    assert.equal(t.topSodium.name, 'Chicken adobo');
    assert.equal(t.topSugar.name, 'Halo-halo');
  });
  it('flags WHO limits with plain-language messages', () => {
    const s = limitStatus({ sugar: 30, sodium: 2400, topSodium: { name: 'Tuyo', value: 1500 } });
    assert.equal(s.sugar.status, 'near');
    assert.equal(s.sodium.status, 'over');
    assert.match(s.sodium.message, /Tuyo added the most/);
    assert.equal(limitStatus({ sugar: 10, sodium: 500 }).sodium.status, 'ok');
    assert.equal(LIMITS.sodium, 2000);
  });
  it('scales sugar and sodium with the portion weight', () => {
    const r = scaleFromPer100({ calories: 190, protein: 16, carbs: 2, fat: 13, sugar: 1, sodium: 550 }, 200);
    assert.equal(r.sugar, 2);
    assert.equal(r.sodium, 1100);
    assert.equal(scaleFromPer100({ calories: 100, protein: 1, carbs: 1, fat: 1 }, 100).sugar, undefined);
  });
});

describe('goal-based intake note', () => {
  it('speaks to the user goal', () => {
    assert.match(goalIntakeNote({ goalType: 'LOSE_WEIGHT', calories: 2300, calorieGoal: 1800, entries: 3 }), /over your calorie target/);
    assert.match(goalIntakeNote({ goalType: 'BUILD_MUSCLE', protein: 40, proteinGoal: 140, entries: 2 }), /about 100 g protein/);
    assert.match(goalIntakeNote({ goalType: 'GAIN_WEIGHT', calories: 1000, calorieGoal: 2800, entries: 1 }), /1800 more kcal/);
    assert.match(goalIntakeNote({ entries: 0 }), /Log a meal/);
  });
});
