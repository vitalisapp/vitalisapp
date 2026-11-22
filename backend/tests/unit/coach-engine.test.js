// tests/unit/coach-engine.test.js — Section 4: personal coach rules. Pure, no DB.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const c = require('../../src/utils/coachEngine');

const plan = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  day_number: n,
  title: `Day ${n} — ${[1, 3, 5].includes(n) ? `Strength ${n}` : 'Recovery'}`,
  activity_type: [1, 3, 5].includes(n) ? 'Workout' : 'Recovery',
  duration_mins: 45,
}));
const MON = '2026-11-16';

describe('week building', () => {
  it('puts workouts on preferred days (Mon/Wed/Fri)', () => {
    const w = c.buildWeek(plan, [1, 3, 5], MON);
    assert.deepEqual(w.filter((e) => e.kind === 'workout').map((e) => e.date), ['2026-11-16', '2026-11-18', '2026-11-20']);
    assert.equal(w[0].title, 'Strength 1');
  });
  it('spreads workouts when no days are saved, and fills missing preferred days', () => {
    assert.deepEqual(c.trainingOffsets(3, []), [0, 2, 4]);
    assert.deepEqual(c.trainingOffsets(3, [6]), [0, 2, 5]); // Saturday + spread
    assert.deepEqual(c.trainingOffsets(2, [1, 2, 3, 4]), [0, 2]);
  });
  it('weeks start on Monday', () => {
    assert.equal(c.weekStartOf(new Date(2026, 10, 22)), MON); // Sunday
    assert.equal(c.weekStartOf(new Date(2026, 10, 16)), MON);
  });
});

describe('statuses', () => {
  const w = c.buildWeek(plan, [1, 3, 5], MON);
  it('marks done, missed, today, rest', () => {
    const s = c.weekStatuses(w, { completions: [{ dayNumber: 1, date: MON }], today: '2026-11-20' });
    assert.deepEqual(s.map((e) => e.status), ['done', 'rest', 'missed', 'rest', 'today', 'rest', 'rest']);
  });
  it('a workout logged that day counts as done; handled misses are not asked again', () => {
    const s = c.weekStatuses(w, { activeDates: ['2026-11-16'], handled: ['2026-11-18'], today: '2026-11-20' });
    assert.equal(s[0].status, 'done');
    assert.equal(s[2].status, 'skipped');
  });
});

describe('missed workout proposal', () => {
  const w = c.buildWeek(plan, [1, 3, 5], MON);
  const s = c.weekStatuses(w, { completions: [{ dayNumber: 1, date: MON }], today: '2026-11-20' });

  it('moves the missed workout to a free day and keeps max 2 training days in a row', () => {
    const p = c.proposeAdjust(s, { today: '2026-11-20', recovery: c.recoveryCheck({}) });
    assert.equal(p.recommended, 'reschedule');
    assert.equal(p.options.reschedule.moved[0].toDay, 'Saturday');
    const kinds = p.options.reschedule.week.map((e) => e.kind);
    assert.equal(kinds[2], 'rest'); // Wednesday cleared
    assert.equal(kinds[5], 'workout'); // Saturday now Strength 3
    assert.match(c.missedMessage(p, c.recoveryCheck({})), /^Oops! You missed your Wednesday workout\. No worries!/);
  });

  it('prefers a lighter week when recovery is a concern, and never adds load', () => {
    const rec = c.recoveryCheck({ recentRatings: [5, 4, 3] });
    assert.equal(rec.concern, true);
    const p = c.proposeAdjust(s, { today: '2026-11-20', recovery: rec });
    assert.equal(p.recommended, 'lighter');
    for (const e of p.options.lighter.week.filter((x) => x.kind === 'workout' && x.date >= '2026-11-20')) {
      assert.ok(e.capMins <= 30);
    }
  });

  it('returns null when nothing was missed', () => {
    const ok = c.weekStatuses(w, { completions: [{ dayNumber: 1, date: MON }], today: '2026-11-17' });
    assert.equal(c.proposeAdjust(ok, { today: '2026-11-17' }), null);
  });

  it('flags short sleep, long streaks and repeated misses', () => {
    assert.equal(c.recoveryCheck({ sleepHours: 5 }).concern, true);
    assert.equal(c.recoveryCheck({ streak: 6 }).concern, true);
    assert.equal(c.recoveryCheck({ missedLastWeek: 2, missedThisWeek: 1 }).concern, true);
    assert.equal(c.recoveryCheck({ sleepHours: 7.5, streak: 2 }).concern, false);
  });
});

describe('nutrition tips', () => {
  it('never tells the user to eat less after a missed workout', () => {
    const tips = c.nutritionTips({ goalType: 'LOSE_WEIGHT', dailyKcal: 1900, proteinG: 150, todayKind: 'rest', missedCount: 1 });
    assert.ok(tips.some((t) => t.key === 'no_cut'));
    for (const t of tips.filter((x) => x.key !== 'no_cut')) assert.doesNotMatch(t.text, /eat less|cut (your )?calories|reduce (your )?(food|calories)/i);
  });
  it('warns about under-eating in the evening', () => {
    const tips = c.nutritionTips({ dailyKcal: 2000, proteinG: 120, intakeKcal: 800, hour: 19, todayKind: 'workout' });
    assert.ok(tips.some((t) => t.key === 'under'));
  });
});
