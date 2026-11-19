const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

// Regression: suggestPlan destructured `[plans]` from the pool rows, leaving a
// single plan object, so plans.map() threw and Macro Coach always 500'd.
const geminiPath = require.resolve('../../src/config/gemini');
const gemini = require(geminiPath);
const realSuggest = gemini.suggestPlanForMeal;

const db = require('../../src/config/db');
const realExecute = db.execute;

const PLANS = [
  { id: 41, title: 'Iron Forge Protocol', tag: 'Strength', intensity: 'Advanced', duration: '8 Weeks', target_focus: 'Hypertrophy', description: '...', is_enrolled: 1 },
  { id: 42, title: 'Fat Loss HIIT', tag: 'Cardio', intensity: 'Beginner', duration: '4 Weeks', target_focus: 'Fat Loss', description: '...', is_enrolled: 0 },
];

let service;

before(() => {
  gemini.suggestPlanForMeal = async (meal, plans, dailyContext) => {
    assert.ok(Array.isArray(plans), 'plans must be an array');
    assert.equal(plans.length, PLANS.length);
    assert.equal(dailyContext.calorieGoal, 2000);
    return JSON.stringify({
      message: 'Nice balanced meal.',
      reasoning: 'Enrolled strength plan fits.',
      recommended_plan_id: 41,
      estimated_minutes: 45,
    });
  };

  db.execute = async (sql) => {
    if (/SUM\(calories\)/.test(sql)) return [[{ caloriesSoFar: 800 }], []];
    if (/FROM plans p/.test(sql)) return [PLANS, []];
    if (/fitness_goals/.test(sql)) return [[{ daily_kcal: 2000 }], []];
    throw new Error('unexpected SQL: ' + sql);
  };

  const servicePath = require.resolve('../../src/services/foodLogs.service');
  delete require.cache[servicePath];
  service = require(servicePath);
});

after(() => {
  gemini.suggestPlanForMeal = realSuggest;
  db.execute = realExecute;
});

describe('macro coach suggestPlan', () => {
  it('reads plan rows as an array and returns the recommended plan', async () => {
    const out = await service.suggestPlan(1, {
      food_name: 'Pancit',
      calories: 320,
      protein: 12,
      carbs: 48,
      fat: 8,
    });

    assert.equal(out.food_name, 'Pancit');
    assert.equal(out.message, 'Nice balanced meal.');
    assert.equal(out.estimated_minutes, 45);
    assert.equal(out.recommended_plan.id, 41);
    assert.equal(out.recommended_source, 'enrolled');
    assert.equal(out.has_enrolled_plans, true);
    assert.equal(out.has_any_plans, true);
  });

  it('degrades to plain text when the AI does not return JSON', async () => {
    gemini.suggestPlanForMeal = async () =>
      "I'm currently experiencing high demand. Please try again in a moment.";
    // The service destructures the function at import time, so reload it.
    const servicePath = require.resolve('../../src/services/foodLogs.service');
    delete require.cache[servicePath];
    const svc = require(servicePath);

    const out = await svc.suggestPlan(1, { food_name: 'Pancit', calories: 320 });
    assert.match(out.message, /high demand/i);
    assert.equal(out.recommended_plan.id, 41, 'falls back to an enrolled plan');
    assert.equal(out.reasoning, 'AI returned plain text.');
  });
});
