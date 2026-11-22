// tests/unit/health-assessment.test.js — Section 2: BMI classes, sleep input,
// yearly BMI monitoring summary. Pure, no DB.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { classifyBmi, healthyWeightRange, parseSleepHours, sleepGuidance } = require('../../src/utils/health');
const { bmiCategory } = require('../../src/utils/planEngine');
const { summarizeYears } = require('../../src/services/bmi.service');

describe('BMI classes', () => {
  it('uses WHO international cut-offs and "Normal weight" wording', () => {
    assert.equal(bmiCategory(18.4), 'Underweight');
    assert.equal(bmiCategory(22), 'Normal weight');
    assert.equal(bmiCategory(25), 'Overweight');
    assert.equal(bmiCategory(30), 'Obese');
    assert.equal(classifyBmi(undefined), null);
    assert.deepEqual(healthyWeightRange(160), { minKg: 47.4, maxKg: 63.7 });
  });
});

describe('sleep hours input', () => {
  it('accepts half hours in 3–14 and explains bad input', () => {
    assert.deepEqual(parseSleepHours(''), { value: null });
    assert.deepEqual(parseSleepHours('7.3'), { value: 7.5 });
    assert.match(parseSleepHours(20).error, /between 3 and 14/);
    assert.equal(sleepGuidance(6, 30).status, 'SLIGHTLY_LOW');
  });
});

describe('yearly BMI summary', () => {
  const rows = [
    { bmi: 27.1, weight_kg: 80, recorded_on: '2024-02-01' },
    { bmi: 26.4, weight_kg: 78, recorded_on: '2024-11-01' },
    { bmi: 24.6, weight_kg: 72.5, recorded_on: '2025-06-10' },
    { bmi: 24.8, weight_kg: 73, recorded_on: '2025-12-01' },
  ];

  it('groups by year, newest first, with change and category shift', () => {
    const r = summarizeYears(rows, new Date('2026-11-21T00:00:00Z'));
    assert.deepEqual(r.years.map((y) => y.year), [2025, 2024]);
    const [y2025, y2024] = r.years;
    assert.equal(y2024.lastBmi, 26.4);
    assert.equal(y2024.changeFromPrevYear, null);
    assert.equal(y2025.changeFromPrevYear, -1.6);
    assert.match(y2025.summary, /fell by 1.6/);
    assert.match(y2025.summary, /from Overweight to Normal weight/);
    assert.equal(y2025.readings, 2);
  });

  it('flags a yearly re-check when the last reading is over 12 months old', () => {
    assert.equal(summarizeYears(rows, new Date('2026-11-21T00:00:00Z')).checkDue, false);
    assert.equal(summarizeYears(rows, new Date('2027-01-05T00:00:00Z')).checkDue, true);
    assert.equal(summarizeYears([]).checkDue, true);
  });
});
