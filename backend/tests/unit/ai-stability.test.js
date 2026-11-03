const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const gemini = require('../../src/config/gemini');
const { generatePlan, calcBmi } = require('../../src/utils/planEngine');
const { calcReadiness } = require('../../src/utils/readiness');

describe('ai model config (stabilize MVP)', () => {
  it('tries valid public IDs first, keeps legacy last', () => {
    delete process.env.GEMINI_TEXT_MODELS;
    delete process.env.GEMINI_VISION_MODELS;
    const text = gemini.getTextModels();
    const vision = gemini.getVisionModels();
    assert.ok(text[0].includes('gemini-3.6-flash') || text[0].includes('gemini-3.8-flash'));
    assert.ok(vision[0].includes('gemini-3.6-flash') || vision[0].includes('gemini-3.8-flash'));
    assert.ok(text.length >= 2 && vision.length >= 2);
  });

  it('honors GEMINI_TEXT_MODELS override', () => {
    process.env.GEMINI_TEXT_MODELS = 'my-model-a, my-model-b';
    assert.deepEqual(gemini.getTextModels(), ['my-model-a', 'my-model-b']);
    delete process.env.GEMINI_TEXT_MODELS;
  });

  it('returns static fallback fast when no keys configured', async () => {
    const prevG = process.env.GEMINI_API_KEY;
    const prevQ = process.env.GROQ_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    const out = await gemini.callGeminiWithFallback('hello');
    assert.match(out, /high demand/i);
    if (prevG !== undefined) process.env.GEMINI_API_KEY = prevG;
    if (prevQ !== undefined) process.env.GROQ_API_KEY = prevQ;
  });

  it('safeParseAI handles markdown + garbage without throwing', () => {
    const { parsed } = gemini.safeParseAI('```json\n{"a":1}\n```');
    assert.deepEqual(parsed, { a: 1 });
    const bad = gemini.safeParseAI('not json at all', { fallback: true });
    assert.deepEqual(bad.parsed, { fallback: true });
  });

  it('stripDataUriPrefix normalizes data-URI vs raw', () => {
    const raw = 'AAAA1234';
    assert.equal(gemini.stripDataUriPrefix(`data:image/jpeg;base64,${raw}`), raw);
    assert.equal(gemini.stripDataUriPrefix(raw), raw);
  });

  it('preserves portion calories and flags conflicting AI macros', () => {
    const out = gemini.validateAndCorrectMacros({
      food_name: 'Meal', serving: '100 g',
      calories: 200, protein: 25, carbs: 50, fat: 12,
      saturated_fat: -5, trans_fat: 0, polyunsaturated_fat: 0, monounsaturated_fat: 0,
    });
    assert.equal(out.calories, 200);
    assert.equal(out.low_confidence, true);
    assert.equal(out.saturated_fat, 0);
  });

  it('flags unusually small main-dish portions without replacing them', () => {
    const out = gemini.validateAndCorrectMacros({
      food_name: 'Double Cheeseburger with Spread and Lettuce', serving: '1 pc',
      calories: 47, protein: 0, carbs: 5, fat: 3,
      saturated_fat: 0, trans_fat: 0, polyunsaturated_fat: 0, monounsaturated_fat: 0,
    });
    assert.equal(out.calories, 47);
    assert.equal(out.low_confidence, true);
  });

  it('flags missing protein without inventing nutrients', () => {
    const out = gemini.validateAndCorrectMacros({
      food_name: 'Grilled chicken salad bowl', serving: '1 bowl',
      calories: 400, protein: 0, carbs: 30, fat: 12,
      saturated_fat: 0, trans_fat: 0, polyunsaturated_fat: 0, monounsaturated_fat: 0,
    });
    assert.equal(out.protein, 0);
    assert.equal(out.calories, 400);
    assert.equal(out.low_confidence, true);
  });

  it('anchor guard flags far-under scans and preserves portion calories', () => {
    const bad = gemini.validateAndCorrectMacros({
      food_name: 'Double Cheeseburger', serving: '1 pc',
      calories: 100, protein: 8, carbs: 10, fat: 5,
      saturated_fat: 0, trans_fat: 0, polyunsaturated_fat: 0, monounsaturated_fat: 0,
    });
    assert.equal(bad.calories, 100);
    assert.equal(bad.low_confidence, true);
    const good = gemini.validateAndCorrectMacros({
      food_name: 'Double Cheeseburger', serving: '1 pc',
      calories: 600, protein: 30, carbs: 40, fat: 30,
      saturated_fat: 0, trans_fat: 0, polyunsaturated_fat: 0, monounsaturated_fat: 0,
    });
    assert.ok(good && good.calories >= 300, 'in-band burger estimate is kept');
  });

  it('anchor scales with serving (2 pcs = 2x)', () => {
    const exp = gemini.anchorExpected('Double Cheeseburger', '2 pcs');
    assert.ok(exp && exp.calories === 1500, `2x double burger anchor, got ${exp && exp.calories}`);
    assert.deepEqual(gemini.parseServingQuantity('0.5 cup cooked'), { qty: 0.5, unit: 'cup' });
  });

  it('parser keeps all items on multi-item plates', () => {
    const raw = '```json\n{"items": [{"food_name": "Chicken rice", "serving": "1 cup", "calories": 400, "protein": 25, "carbs": 45, "fat": 10}, {"food_name": "Broccoli", "serving": "0.5 cup", "calories": 30, "protein": 2, "carbs": 6, "fat": 0}], "suggestion": "tip"}\n```';
    const parsed = gemini.parseNutritionJSON(raw);
    assert.ok(parsed && parsed.items.length === 2, `both items parsed, got ${parsed && parsed.items.length}`);
    const norm = gemini.normalizeItems(raw);
    assert.ok(norm && norm.items.length === 2, 'normalized keeps both items');
  });

  it('parses fractions, mixed numbers, unicode and plates correctly', () => {
    for (const [text, qty, unit] of [
      ['1/2 cup', 0.5, 'cup'], ['1 1/2 cups', 1.5, 'cup'],
      ['½ cup', 0.5, 'cup'], ['1½ cups', 1.5, 'cup'],
      ['2 plates', 2, 'serving'], ['0.25 kg', 250, 'g'],
    ]) assert.deepEqual(gemini.parseServingQuantity(text), { qty, unit });
    assert.equal(gemini.parseServingQuantity('1/0 cup'), null);
  });

  it('does not compare gram portions to full-piece references', () => {
    assert.equal(gemini.anchorExpected('Burger', '80 g'), null);
    const out = gemini.validateAndCorrectMacros({
      food_name: 'Burger', serving: '80 g', calories: 200,
      protein: 10, carbs: 22, fat: 8,
    });
    assert.equal(out.calories, 200);
    assert.equal(Boolean(out.low_confidence), false);
  });

  it('preserves small, zero and shared portions without nutrient floors or caps', () => {
    for (const calories of [0, 25, 100, 200, 800, 3200]) {
      const out = gemini.validateAndCorrectMacros({
        food_name: 'Food', serving: '100 g', calories,
        protein: 0, carbs: calories / 4, fat: 0,
      });
      assert.equal(out.calories, calories);
      assert.equal(out.fat, 0);
    }
    const out = gemini.validateAndCorrectMacros({ food_name: 'Food', protein: 2.7, carbs: 28.2, fat: 0.3 });
    assert.equal(out.calories, 126);
    assert.equal(out.fat, 0.3);
  });

  it('classifies retryable overload errors (503/429/quota), not 404/auth', () => {
    assert.equal(gemini.isRetryableError(new Error('[503 Service Unavailable] high demand')), true);
    assert.equal(gemini.isRetryableError(new Error('429 quota exceeded, try again later')), true);
    assert.equal(gemini.isRetryableError(new Error('[404 Not Found] model not found')), false);
    assert.equal(gemini.isRetryableError(new Error('API key not valid')), false);
    assert.equal(gemini.isRetryableError(null), false);
  });
});

describe('food cache hashing is prefix-stable', () => {
  it('same photo hashes equal with/without data-URI prefix', () => {
    const { imageHash } = require('../../src/controllers/foodLogs.controller');
    const raw = Buffer.from('fake-image-bytes').toString('base64');
    assert.equal(imageHash(raw), imageHash(`data:image/jpeg;base64,${raw}`));
  });
});

describe('planEngine + readiness pure logic', () => {
  it('BMI + floor guards (female 1200 / male 1500)', () => {
    assert.equal(calcBmi(70, 175), 22.9);
    const f = generatePlan({ weightKg: 40, heightCm: 150, dob: '2000-01-01', sex: 'female', activityLevel: 'SEDENTARY', goalType: 'LOSE_WEIGHT', pace: 'FASTER' });
    assert.ok(f.dailyKcal >= 1200, `floor, got ${f.dailyKcal}`);
    assert.ok(f.proteinG > 0 && f.carbsG >= 0 && f.fatG > 0);
  });

  it('readiness null with no data, 0-100 with checkin', () => {
    const empty = calcReadiness({});
    assert.equal(empty.readiness, null);
    assert.equal(empty.hasData, false);
    const r = calcReadiness({
      checkin: { sleep_hours: 8, sleep_quality: 'HIGH', stress_level: 'LOW', soreness: 'LOW', energy_level: 'HIGH' },
      steps: 5000, calories: 300, sleepCount: 1,
    });
    assert.ok(r.readiness >= 0 && r.readiness <= 100);
    assert.equal(r.source, 'checkin');
  });
});
