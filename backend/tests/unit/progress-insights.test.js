// tests/unit/progress-insights.test.js — Section 8 rule-based progress
// interpretation + the in-memory sample dataset. Pure, no DB.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { buildProgressSummary, buildTimeline, windowStats } = require('../../src/utils/progressInsights');
const { buildSampleDataset } = require('../../src/utils/sampleProgress');

const TODAY = '2026-11-21';

describe('progress insights — windows', () => {
  it('sums only rows inside the window', () => {
    const w = windowStats(
      [
        { day: '2026-11-15', sessions: 1, minutes: 30, completed: 1 },
        { day: '2026-11-21', sessions: 2, minutes: 40, completed: 2 },
        { day: '2026-11-10', sessions: 1, minutes: 99, completed: 1 },
      ],
      [{ day: '2026-11-20', kcal: 1800, protein: 100 }],
      '2026-11-15',
      '2026-11-21',
    );
    assert.equal(w.activeDays, 2);
    assert.equal(w.sessions, 3);
    assert.equal(w.minutes, 70);
    assert.equal(w.mealDays, 1);
    assert.equal(w.avgKcal, 1800);
  });
});

describe('progress insights — summary', () => {
  it('reports getting_started when there are no records', () => {
    const s = buildProgressSummary({ today: TODAY });
    assert.equal(s.status, 'getting_started');
    assert.equal(s.timeline, null);
  });

  it('compares this week with last week in plain language', () => {
    const s = buildProgressSummary({
      today: TODAY,
      workouts: [
        { day: '2026-11-16', sessions: 1, minutes: 40 },
        { day: '2026-11-18', sessions: 1, minutes: 40 },
        { day: '2026-11-20', sessions: 1, minutes: 40 },
        { day: '2026-11-21', sessions: 1, minutes: 40 },
        { day: '2026-11-10', sessions: 1, minutes: 30 },
      ],
    });
    const t = s.insights.find((i) => i.key === 'training');
    assert.equal(t.tone, 'good');
    assert.match(t.text, /4 of the last 7 days, up from 1/);
    const m = s.insights.find((i) => i.key === 'minutes');
    assert.equal(m.tone, 'good'); // 160 >= 150
  });

  it('warns when eating far below target (no automatic under-eating)', () => {
    const meals = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20']
      .map((day) => ({ day, kcal: 1000, protein: 50 }));
    const s = buildProgressSummary({
      today: TODAY,
      meals,
      goal: { goalType: 'LOSE_WEIGHT', dailyKcal: 1900, proteinG: 120 },
    });
    const c = s.insights.find((i) => i.key === 'calories');
    assert.equal(c.tone, 'warn');
    assert.match(c.text, /recovery/);
  });

  it('flags a too-fast weight loss pace', () => {
    const s = buildProgressSummary({
      today: TODAY,
      goal: { goalType: 'LOSE_WEIGHT', weightKg: 80, targetWeightKg: 70 },
      weights: [{ day: '2026-11-07', value: 80 }, { day: '2026-11-21', value: 77 }],
    });
    const w = s.insights.find((i) => i.key === 'weight');
    assert.equal(w.tone, 'warn');
    assert.match(w.text, /faster than the usual safe pace/);
  });
});

describe('progress insights — target-date timeline', () => {
  const goal = { goalType: 'LOSE_WEIGHT', weightKg: 80, targetWeightKg: 70, createdAt: '2026-10-22', targetDate: '2026-12-21' };

  it('handles a goal without a target date', () => {
    const t = buildTimeline({ goal: { ...goal, targetDate: null }, today: TODAY, progressPct: 20 });
    assert.equal(t.status, 'no_target');
  });

  it('classifies ahead / on track / behind against elapsed time', () => {
    // 30 of 60 days elapsed → 50% of the time used.
    assert.equal(buildTimeline({ goal, today: TODAY, progressPct: 70, currentWeightKg: 73 }).status, 'ahead');
    assert.equal(buildTimeline({ goal, today: TODAY, progressPct: 50, currentWeightKg: 75 }).status, 'on_track');
    const behind = buildTimeline({ goal, today: TODAY, progressPct: 20, currentWeightKg: 78 });
    assert.equal(behind.status, 'behind');
    assert.equal(behind.timePct, 50);
    assert.equal(behind.remainingDays, 30);
    assert.ok(behind.weeklyRateNeededKg > 1);
    assert.match(behind.text, /Extending the date is safer/);
  });

  it('marks overdue and complete goals', () => {
    assert.equal(buildTimeline({ goal, today: '2027-01-05', progressPct: 60, currentWeightKg: 74 }).status, 'overdue');
    assert.equal(buildTimeline({ goal, today: TODAY, progressPct: 100, currentWeightKg: 70 }).status, 'complete');
  });

  it('uses consistency for non-weight goals', () => {
    const t = buildTimeline({
      goal: { goalType: 'BUILD_MUSCLE', createdAt: '2026-10-22', targetDate: '2026-12-21' },
      today: TODAY,
      progressPct: null,
      sessionsSinceStart: 15,
    });
    assert.equal(t.status, 'on_track');
    assert.match(t.text, /workouts a week/);
  });
});

describe('sample progress dataset', () => {
  it('is deterministic, flagged as sample and uses dummy dates relative to today', () => {
    const a = buildSampleDataset(TODAY);
    const b = buildSampleDataset(TODAY);
    assert.deepEqual(a, b);
    assert.equal(a.sample, true);
    assert.ok(a.sessions.length > 20);
    assert.ok(a.sessions.every((s) => s.sample === true && s.start_time.slice(0, 10) <= TODAY));
    assert.ok(a.meals.every((m) => m.sample === true));
    assert.equal(a.goal.targetDate, '2027-01-16');
  });

  it('produces a meaningful summary', () => {
    const ds = buildSampleDataset(TODAY);
    const s = buildProgressSummary({
      today: TODAY,
      goal: ds.goal,
      workouts: ds.workouts,
      meals: ds.mealDays,
      weights: ds.weights,
      currentWeightKg: ds.currentWeightKg,
      progressPct: ds.progressPct,
      sessionsSinceStart: ds.sessionsSinceStart,
    });
    assert.notEqual(s.status, 'getting_started');
    assert.ok(s.insights.length >= 4);
    assert.ok(['ahead', 'on_track', 'behind'].includes(s.timeline.status));
  });
});
