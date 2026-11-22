// tests/unit/activity-status.test.js — Section 10 GREEN / YELLOW / RED rules.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { classifyUser, plannedWorkouts, describeCriteria } = require('../../src/utils/activityStatus');
const { parseMonitoringQuery, byAttention } = require('../../src/services/adminMonitoring.service');

const NOW = new Date('2026-11-21T12:00:00Z');
const ago = (d) => new Date(NOW.getTime() - d * 86400000).toISOString();
const keys = (r) => r.flags.map((f) => f.key);
const base = (over = {}) => ({
  createdAt: ago(90), lastLogin: ago(1), lastWorkout: ago(1), lastMeal: ago(0),
  lastWeighIn: ago(5), workouts7: 3, mealDays7: 6, kcal7: 6 * 2000, preferredDays: null,
  weights: [{ date: ago(20), kg: 80 }, { date: ago(5), kg: 79.5 }], ...over,
});

describe('activity status classification', () => {
  it('GREEN when workouts, meals and a recent weigh-in all meet the rules', () => {
    const r = classifyUser(base(), NOW);
    assert.equal(r.status, 'green');
    assert.deepEqual(r.flags, []);
  });

  it('YELLOW with reasons when some logs are missing', () => {
    const r = classifyUser(base({ workouts7: 1, mealDays7: 2, kcal7: 2 * 2000 }), NOW);
    assert.equal(r.status, 'yellow');
    assert.deepEqual(keys(r), ['few_workouts', 'few_meals']);
  });

  it('planned training days raise the bar (capped at 3)', () => {
    assert.equal(plannedWorkouts('[1,3,5,6]'), 3);
    assert.equal(plannedWorkouts([2]), 1);
    assert.equal(plannedWorkouts(null), 2);
    const r = classifyUser(base({ workouts7: 2, preferredDays: '[1,3,5]' }), NOW);
    assert.equal(r.status, 'yellow');
    assert.ok(keys(r).includes('few_workouts'));
  });

  it('YELLOW when there is no weigh-in within 30 days', () => {
    const r = classifyUser(base({ lastWeighIn: ago(45), weights: [] }), NOW);
    assert.equal(r.status, 'yellow');
    assert.ok(keys(r).includes('no_weigh_in'));
  });

  it('RED after 14 days without any activity (login included)', () => {
    const r = classifyUser(base({
      lastLogin: ago(20), lastWorkout: ago(30), lastMeal: ago(15), lastWeighIn: ago(40),
      workouts7: 0, mealDays7: 0, kcal7: 0, weights: [],
    }), NOW);
    assert.equal(r.status, 'red');
    assert.equal(r.daysInactive, 15);
    assert.deepEqual(keys(r).slice(0, 3), ['inactive', 'no_workouts', 'no_meals']);
  });

  it('a recent login alone keeps a user out of RED', () => {
    const r = classifyUser(base({ lastLogin: ago(2), lastWorkout: ago(30), lastMeal: ago(30), workouts7: 0, mealDays7: 0, kcal7: 0 }), NOW);
    assert.equal(r.status, 'yellow');
  });

  it('new accounts are never RED; old empty accounts are', () => {
    const empty = { lastLogin: null, lastWorkout: null, lastMeal: null, lastWeighIn: null, workouts7: 0, mealDays7: 0, kcal7: 0, weights: [] };
    const fresh = classifyUser(base({ ...empty, createdAt: ago(3) }), NOW);
    assert.equal(fresh.status, 'yellow');
    assert.ok(!keys(fresh).includes('no_weigh_in'));
    const old = classifyUser(base({ ...empty, createdAt: ago(30) }), NOW);
    assert.equal(old.status, 'red');
    assert.ok(keys(old).includes('never_active'));
  });

  it('flags unusual progress: rapid change, sudden jump, very low intake', () => {
    const rapid = classifyUser(base({ weights: [{ date: ago(21), kg: 84 }, { date: ago(1), kg: 79 }] }), NOW);
    assert.ok(keys(rapid).includes('rapid_change'));
    assert.match(rapid.flags.find((f) => f.key === 'rapid_change').detail, /-1\.8 kg\/week/);

    const jump = classifyUser(base({ weights: [{ date: ago(4), kg: 72 }, { date: ago(2), kg: 27 }] }), NOW);
    assert.ok(keys(jump).includes('weight_jump'));

    const low = classifyUser(base({ mealDays7: 5, kcal7: 5 * 700 }), NOW);
    assert.ok(keys(low).includes('low_intake'));
    // Unusual flags never change the color on their own.
    assert.equal(low.status, 'green');
  });

  it('criteria text is served with the report', () => {
    const c = describeCriteria();
    assert.match(c.red, /14\+ days/);
    assert.ok(c.green && c.yellow && c.flags.unusual);
  });
});

describe('monitoring query + ordering', () => {
  it('parses and clamps filters', () => {
    assert.deepEqual(parseMonitoringQuery({ status: 'red', flag: 'unusual', q: ' ana ', page: '2', limit: '500' }),
      { status: 'red', flag: 'unusual', q: 'ana', page: 2, limit: 100, all: false });
    const bad = parseMonitoringQuery({ status: 'purple', flag: 'x', page: '-1', limit: 'abc' });
    assert.equal(bad.status, null); assert.equal(bad.flag, null); assert.equal(bad.page, 1); assert.equal(bad.limit, 20);
  });

  it('orders by urgency: red, yellow, green; longest silence first', () => {
    const list = [
      { id: 1, status: 'green', daysInactive: 0, flags: [] },
      { id: 2, status: 'red', daysInactive: 20, flags: [] },
      { id: 3, status: 'yellow', daysInactive: 3, flags: [] },
      { id: 4, status: 'red', daysInactive: 40, flags: [] },
    ].sort(byAttention).map((u) => u.id);
    assert.deepEqual(list, [4, 2, 3, 1]);
  });
});

describe('Section 11 interpretations', () => {
  const { interpretUser, interpretEngagement } = require('../../src/utils/activityStatus');
  const rec = (over) => ({ status: 'yellow', daysInactive: 2, week: { workouts: 1, planned: 3, mealDays: 2 }, flags: [], ...over });

  it('explains each color in plain language, for admins and members', () => {
    assert.match(interpretUser(rec({ status: 'red', daysInactive: 30 })), /^Inactive: this member .*30 days.*check-in/);
    assert.match(interpretUser(rec({ status: 'red', daysInactive: 30 }), { audience: 'member' }), /^Inactive: nothing has been logged for 30 days/);
    assert.match(interpretUser(rec({ status: 'red', daysInactive: null })), /since signing up/);
    assert.match(interpretUser(rec({ status: 'green', week: { workouts: 3, planned: 2, mealDays: 6 } })), /^On track: 3 workouts \(plan: 2\) and meals on 6 of 7 days/);
    const y = interpretUser(rec({ flags: [{ key: 'few_meals', group: 'missing', label: 'Incomplete meal logs', detail: 'Meals on 2 of 7 days' }] }));
    assert.equal(y, 'Needs attention: still active, but meals on 2 of 7 days.');
  });

  it('mentions unusual-progress flags so they are reviewed', () => {
    const t = interpretUser(rec({ status: 'green', flags: [{ key: 'weight_jump', group: 'unusual', label: 'Sudden weight jump', detail: '72 → 27 kg in 2 day(s)' }] }));
    assert.match(t, /Also review: 72 → 27 kg in 2 day\(s\)\./);
  });

  it('summarises platform engagement with the top gap', () => {
    const t = interpretEngagement({ summary: { total: 10, green: 4, yellow: 4, red: 2 }, flagKeyCounts: { no_weigh_in: 5, few_meals: 2, inactive: 2 }, activeMembers7d: 7 });
    assert.equal(t, '70% of members logged activity in the last 7 days. 6 of 10 need attention (2 inactive). The most common gap is "no weigh-in in 30 days" (5 members).');
    assert.match(interpretEngagement({ summary: { total: 3, green: 3, yellow: 0, red: 0 }, activeMembers7d: 3 }), /^All 3 members are on track/);
    assert.match(interpretEngagement({ summary: { total: 0 } }), /^No members yet/);
  });
});
