// tests/unit/filipino-dishes.test.js — Revision #2: Filipino dish recognition,
// confirm/correct support and uncertainty flags. Pure / mocked, no network.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  DISHES, LOOKALIKES, findDish, nutritionFor, lookalikesFor,
} = require('../../src/utils/filipinoDishes');
const { reviewDish, REVIEW_REASONS } = require('../../src/utils/dishReview');
const gemini = require('../../src/config/gemini');

describe('Filipino dish reference data', () => {
  it('has unique keys and lookalikes that point at real dishes', () => {
    const keys = new Set(DISHES.map((d) => d.key));
    assert.equal(keys.size, DISHES.length);
    for (const [key, list] of Object.entries(LOOKALIKES)) {
      assert.ok(keys.has(key), key);
      for (const k of list) {
        assert.ok(keys.has(k), `${key} → ${k}`);
        assert.notEqual(k, key);
      }
    }
  });

  it('every per-100 g entry is energy-consistent (Atwater within 15 %)', () => {
    for (const d of DISHES) {
      const { calories, protein, carbs, fat } = d.per100;
      const atwater = protein * 4 + carbs * 4 + fat * 9;
      const diff = Math.abs(atwater - calories) / calories;
      assert.ok(diff <= 0.15, `${d.name}: ${calories} kcal vs ${atwater.toFixed(0)} from macros`);
      assert.ok(d.serving.grams > 0, d.name);
    }
  });

  it('covers the dishes named in the expert feedback', () => {
    assert.equal(findDish('Chicken Adobo').key, 'chicken_adobo');
    assert.equal(findDish('Sinigang na Baboy (1 bowl)').key, 'sinigang_baboy');
    assert.equal(findDish('Kare-Kare with oxtail').key, 'kare_kare');
    assert.equal(findDish('kare kare').key, 'kare_kare');
  });

  it('matches the most specific alias first', () => {
    assert.equal(findDish('Sinigang na salmon').key, 'sinigang_salmon');
    assert.equal(findDish('Garlic fried rice').key, 'garlic_rice');
    assert.equal(findDish('Steamed rice').key, 'steamed_rice');
    assert.equal(findDish('Pork adobo').key, 'pork_adobo');
    assert.equal(findDish('Adobo').key, 'chicken_adobo');
    assert.equal(findDish('Lumpia Shanghai (6 pcs)').key, 'lumpia_shanghai');
  });

  it('does not match unrelated foods or partial words', () => {
    assert.equal(findDish('Cheeseburger'), null);
    assert.equal(findDish('Caesar salad'), null);
    assert.equal(findDish('Gotolatte'), null); // no "goto" inside other words
    assert.equal(findDish(''), null);
  });

  it('scales nutrition by grams', () => {
    const adobo = findDish('chicken adobo');
    assert.deepEqual(nutritionFor(adobo, 200), { calories: 320, protein: 28, carbs: 8, fat: 18 });
    assert.equal(nutritionFor(adobo, 0), null);
  });

  it('suggests common look-alikes', () => {
    const names = lookalikesFor(findDish('menudo')).map((a) => a.name);
    assert.deepEqual(names, ['Caldereta', 'Giniling', 'Mechado']);
  });
});

describe('reviewDish', () => {
  const adobo = { food_name: 'Chicken adobo', estimated_weight_g: 200, calories: 320, protein: 28, carbs: 8, fat: 18 };

  it('attaches the reference and alternatives without flagging a plausible estimate', () => {
    const out = reviewDish(adobo);
    assert.equal(out.reference.name, 'Chicken adobo');
    assert.deepEqual(out.reference.per100, { calories: 160, protein: 14, carbs: 4, fat: 9 });
    assert.equal(out.alternatives[0].name, 'Pork adobo');
    assert.ok(out.alternatives[0].per100);
    assert.equal(out.low_confidence, undefined);
    assert.equal(out.review_reasons, undefined);
  });

  it('puts the model alternatives first, dedupes and caps at 3', () => {
    const out = reviewDish({
      ...adobo,
      alternatives: ['Bistek tagalog', 'chicken adobo', 'Bistek Tagalog', 'Some unknown stew', 'Pork adobo'],
    });
    assert.deepEqual(out.alternatives.map((a) => a.name), ['Bistek tagalog', 'Some unknown stew', 'Pork adobo']);
    assert.equal(out.alternatives[1].per100, undefined); // unknown dish: name only
  });

  it('flags an unclear dish identity', () => {
    const out = reviewDish({ ...adobo, dish_confidence: 'low' });
    assert.equal(out.low_confidence, true);
    assert.deepEqual(out.review_reasons, ['dish_unclear']);
    assert.equal(out.dish_confidence, 'low');
  });

  it('flags calories far from the reference at the visible weight', () => {
    const out = reviewDish({ food_name: 'Kare-kare', estimated_weight_g: 250, calories: 120, protein: 9, carbs: 4, fat: 7 });
    assert.ok(out.review_reasons.includes('calories_unusual'));
    const fine = reviewDish({ food_name: 'Kare-kare', estimated_weight_g: 250, calories: 420, protein: 30, carbs: 14, fat: 26 });
    assert.equal(fine.review_reasons, undefined);
  });

  it('ignores unknown reason codes and bad confidence values', () => {
    const out = reviewDish({ ...adobo, dish_confidence: 'maybe' }, ['bogus', 'macro_mismatch']);
    assert.deepEqual(out.review_reasons, ['macro_mismatch']);
    assert.equal(out.dish_confidence, undefined);
    assert.ok(REVIEW_REASONS.includes('macro_mismatch'));
  });
});

describe('validateAndCorrectMacros on representative Filipino meals', () => {
  const base = { saturated_fat: 0, trans_fat: 0, polyunsaturated_fat: 0, monounsaturated_fat: 0 };

  it('chicken adobo near the reference passes cleanly', () => {
    const out = gemini.validateAndCorrectMacros({
      ...base, food_name: 'Chicken adobo', serving: '1 serving', estimated_weight_g: 200,
      calories: 322, protein: 28, carbs: 8, fat: 18, dish_confidence: 'high', alternatives: [],
    });
    assert.equal(out.low_confidence, undefined);
    assert.equal(out.reference.name, 'Chicken adobo');
  });

  it('sinigang with the model unsure keeps its estimate and explains why', () => {
    const out = gemini.validateAndCorrectMacros({
      ...base, food_name: 'Sinigang na baboy', serving: '1 bowl', estimated_weight_g: 350,
      calories: 210, protein: 18, carbs: 12, fat: 9, low_confidence: true,
      dish_confidence: 'medium', alternatives: ['Tinola', 'Nilaga'],
    });
    assert.equal(out.calories, 210);
    assert.equal(out.low_confidence, true);
    assert.deepEqual(out.review_reasons, ['model_unsure']);
    assert.deepEqual(out.alternatives.map((a) => a.name), ['Tinola', 'Nilaga', 'Sinigang na salmon']);
  });

  it('kare-kare with a far-too-low estimate is flagged, not overwritten', () => {
    const out = gemini.validateAndCorrectMacros({
      ...base, food_name: 'Kare-kare', serving: '1 serving', estimated_weight_g: 250,
      calories: 110, protein: 8, carbs: 4, fat: 7,
    });
    assert.equal(out.calories, 110);
    assert.ok(out.review_reasons.includes('calories_unusual'));
  });

  it('records a specific reason for each existing check', () => {
    const mismatch = gemini.validateAndCorrectMacros({
      ...base, food_name: 'Meal', serving: '100 g', calories: 200, protein: 25, carbs: 50, fat: 12,
    });
    assert.deepEqual(mismatch.review_reasons, ['macro_mismatch']);
    const noProtein = gemini.validateAndCorrectMacros({
      ...base, food_name: 'Pork menudo', serving: '1 serving', calories: 100, protein: 0, carbs: 16, fat: 4,
    });
    assert.ok(noProtein.review_reasons.includes('macros_incomplete'));
  });
});

describe('scan API response keeps the confirm/correct fields', () => {
  it('analyzeImage returns weight, reference, alternatives and reasons', async () => {
    const geminiPath = require.resolve('../../src/config/gemini');
    const servicePath = require.resolve('../../src/services/foodLogs.service');
    const real = require(geminiPath);
    const modelReply = JSON.stringify({
      items: [{
        food_name: 'Pork menudo', serving: '1 serving', estimated_weight_g: 200,
        calories: 278, protein: 20, carbs: 18, fat: 14, saturated_fat: 4, trans_fat: 0,
        polyunsaturated_fat: 2, monounsaturated_fat: 6, sugar: 6, sodium: 700,
        possible_allergens: [], dish_confidence: 'low', alternatives: ['Caldereta'],
      }],
      suggestion: 'Pair with vegetables.',
    });
    require.cache[geminiPath].exports = {
      ...real,
      analyzeFoodImage: async () => JSON.stringify(real.normalizeItems(modelReply)),
    };
    delete require.cache[servicePath];
    try {
      const service = require(servicePath);
      const { result } = await service.analyzeImage(`img-${Date.now()}`);
      const [item] = result.items;
      assert.equal(item.food_name, 'Pork menudo');
      assert.equal(item.estimated_weight_g, 200);
      assert.equal(item.dish_confidence, 'low');
      assert.equal(item.low_confidence, true);
      assert.deepEqual(item.review_reasons, ['dish_unclear']);
      assert.equal(item.reference.name, 'Pork menudo');
      assert.deepEqual(item.alternatives.map((a) => a.name), ['Caldereta', 'Giniling', 'Mechado']);
      assert.ok(item.alternatives[0].per100.calories > 0);
    } finally {
      require.cache[geminiPath].exports = real;
      delete require.cache[servicePath];
    }
  });

  it('estimateFoodDensity answers Filipino dishes from the reference without AI', async () => {
    const geminiPath = require.resolve('../../src/config/gemini');
    const servicePath = require.resolve('../../src/services/foodLogs.service');
    const real = require(geminiPath);
    let aiCalls = 0;
    require.cache[geminiPath].exports = { ...real, callGeminiWithFallback: async () => { aiCalls += 1; return '{}'; } };
    delete require.cache[servicePath];
    try {
      const service = require(servicePath);
      const out = await service.estimateFoodDensity('kare kare');
      assert.equal(out.name, 'Kare-kare');
      assert.equal(out.source, 'reference');
      assert.equal(out.per100.calories, 168);
      assert.equal(aiCalls, 0);
    } finally {
      require.cache[geminiPath].exports = real;
      delete require.cache[servicePath];
    }
  });
});
