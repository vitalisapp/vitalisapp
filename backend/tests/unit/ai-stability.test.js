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

  it('validateAndCorrectMacros clamps + derives calories', () => {
    const out = gemini.validateAndCorrectMacros({
      food_name: 'fried chicken (2 pcs)', serving: 'x',
      calories: 10, protein: 999, carbs: 0, fat: 0,
      saturated_fat: -5, trans_fat: 0, polyunsaturated_fat: 0, monounsaturated_fat: 0,
    });
    assert.ok(out.protein <= 50, `protein capped by piece count, got ${out.protein}`);
    assert.ok(out.carbs >= 10, 'breaded food gets min carbs');
    assert.ok(out.fat > 0, 'fried food gets min fat');
    assert.equal(out.calories, out.protein * 4 + out.carbs * 4 + out.fat * 9);
  });

  it('rejects absurd main-dish results (double cheeseburger 47 kcal)', () => {
    const out = gemini.validateAndCorrectMacros({
      food_name: 'Double Cheeseburger with Spread and Lettuce', serving: '1 pc',
      calories: 47, protein: 0, carbs: 5, fat: 3,
      saturated_fat: 0, trans_fat: 0, polyunsaturated_fat: 0, monounsaturated_fat: 0,
    });
    assert.equal(out, null, 'absurd main-dish result must be rejected so next model is tried');
  });

  it('injects protein floor for meaty food with 0g protein', () => {
    const out = gemini.validateAndCorrectMacros({
      food_name: 'Grilled chicken salad bowl', serving: '1 bowl',
      calories: 400, protein: 0, carbs: 30, fat: 12,
      saturated_fat: 0, trans_fat: 0, polyunsaturated_fat: 0, monounsaturated_fat: 0,
    });
    assert.ok(out && out.protein >= 8, `meaty food gets protein floor, got ${out && out.protein}`);
    assert.equal(out.low_confidence, true);
  });

  it('anchor guard rejects far-under scans, keeps in-band ones', () => {
    const bad = gemini.validateAndCorrectMacros({
      food_name: 'Double Cheeseburger', serving: '1 pc',
      calories: 100, protein: 8, carbs: 10, fat: 5,
      saturated_fat: 0, trans_fat: 0, polyunsaturated_fat: 0, monounsaturated_fat: 0,
    });
    assert.equal(bad, null, '100 kcal double burger (<40% of 750 anchor) must be rejected');
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
