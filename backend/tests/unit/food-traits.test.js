// tests/unit/food-traits.test.js — Section 6: food characteristics, goal fit, catalog data.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { foodTraits, goalFit, describeFood, dailyLimits, CATEGORIES, PREP_METHODS } = require('../../src/utils/foodTraits');
const { per100FromServing } = require('../../src/utils/nutrition');
const { searchQuery } = require('../../src/services/foodImage.service');

const keys = (f) => foodTraits(f).map((t) => t.key);
const lechonKawali = { calories: 430, protein: 18, carbs: 0, fat: 40, sugar: 0, sodium: 500, serving_grams: 100, prep_method: 'deep_fried' };
const broccoli = { calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, sugar: 2.2, sodium: 64, serving_grams: 156, prep_method: 'steamed' };
const grilledChicken = { calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0, sodium: 74, serving_grams: 100, prep_method: 'grilled' };
const haloHalo = { calories: 420, protein: 7, carbs: 80, fat: 9, sugar: 62, sodium: 120, serving_grams: 350, prep_method: 'frozen' };
const tuyo = { calories: 90, protein: 18, carbs: 0, fat: 2, sugar: 0, sodium: 1500, serving_grams: 30, prep_method: 'fried' };

describe('food characteristics', () => {
  it('describes oily / fried / steamed / grilled foods', () => {
    assert.ok(keys(lechonKawali).includes('deep_fried'));
    assert.ok(keys(lechonKawali).includes('oily'));
    assert.ok(keys(broccoli).includes('steamed'));
    assert.ok(keys(broccoli).includes('light'));
    assert.ok(keys(grilledChicken).includes('grilled'));
    assert.ok(keys(grilledChicken).includes('high_protein'));
    assert.ok(!keys(grilledChicken).includes('oily'));
  });
  it('flags high sugar and high sodium', () => {
    assert.ok(keys(haloHalo).includes('high_sugar'));
    assert.ok(keys(tuyo).includes('high_sodium'));
    assert.ok(keys(broccoli).includes('low_sodium'));
  });
});

describe('goal fit', () => {
  it('weight loss prefers lean, light foods and limits oily or sugary ones', () => {
    assert.equal(goalFit(grilledChicken, 'LOSE_WEIGHT').level, 'great');
    assert.equal(goalFit(lechonKawali, 'LOSE_WEIGHT').level, 'limit');
    assert.equal(goalFit(haloHalo, 'LOSE_WEIGHT').level, 'limit');
  });
  it('muscle building highlights protein', () => {
    assert.equal(goalFit(grilledChicken, 'BUILD_MUSCLE').level, 'great');
    assert.match(goalFit(broccoli, 'BUILD_MUSCLE').note, /Low in protein/);
  });
  it('describeFood adds category and preparation descriptions', () => {
    const d = describeFood({ ...grilledChicken, category: 'poultry' }, 'MAINTAIN_WEIGHT');
    assert.equal(d.category_label, 'Chicken & poultry');
    assert.match(d.prep_description, /fat drip off/);
    assert.ok(d.goal_fit);
  });
  it('WHO daily limits', () => {
    assert.equal(dailyLimits({ sodium: 2100, sugar: 20 }).sodium.status, 'over');
    assert.equal(dailyLimits({ sodium: 2100, sugar: 20 }).sugar.status, 'ok');
  });
});

describe('catalog data (migration 053)', () => {
  const sql = fs.readFileSync(path.join(__dirname, '../../migrations/053_food_details.sql'), 'utf8');
  it('uses only known categories and preparation methods', () => {
    for (const [, c] of sql.matchAll(/WHEN '(?:[^']|'')+' THEN '([a-z_]+)'/g)) {
      assert.ok(CATEGORIES[c] || PREP_METHODS[c], `unknown value ${c}`);
    }
  });
  it('adds Filipino dishes with sugar and sodium', () => {
    for (const dish of ['Chicken adobo', 'Sinigang na baboy', 'Tapsilog', 'Halo-halo', 'Taho']) assert.match(sql, new RegExp(`'${dish}'`));
  });
  it('per-100 g density carries sugar and sodium', () => {
    const p = per100FromServing({ serving_grams: 200, calories: 380, protein: 32, carbs: 4, fat: 26, sugar: 2, sodium: 1100 });
    assert.equal(p.sodium, 550);
    assert.equal(p.sugar, 1);
  });
  it('builds sensible photo searches', () => {
    assert.equal(searchQuery({ name: 'Chicken breast, grilled' }), 'grilled Chicken breast food');
    assert.equal(searchQuery({ name: 'Sinigang na baboy' }), 'Sinigang na baboy filipino food');
  });
});
