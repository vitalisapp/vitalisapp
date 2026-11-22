// tests/unit/reminder-rules.test.js — Section 5: smart reminder rules. Pure, no DB.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const r = require('../../src/utils/reminderRules');
const { streakFrom } = require('../../src/services/reminder.service');
const { interpretWeek, weeklyProgressEmail } = require('../../src/emails');

const base = {
  name: 'Jay', weekday: 3, prefs: {}, loggedToday: 0, workoutPlannedToday: false, workoutDoneToday: false,
  daysSinceWorkout: 1, daysSinceActive: 0, streak: 0, workoutsThisWeek: 1, sentToday: 0, unreadReminders: 0, lastSent: {},
};

describe('reminder timing', () => {
  it('sends the checklist sample at 7 PM when nothing is logged', () => {
    const due = r.dueReminders({ ...base, hour: 19 });
    assert.deepEqual(due.map((d) => d.kind), ['no_log']);
    assert.equal(due[0].message, 'Hey Jay! I think you forgot to log your activities today.');
  });
  it('missed workout at 8 PM only when one was planned and not done', () => {
    assert.equal(r.dueReminders({ ...base, hour: 20, workoutPlannedToday: true, workout: 'Lower Body' })[0].kind, 'missed_workout');
    assert.equal(r.dueReminders({ ...base, hour: 20, workoutPlannedToday: true, workoutDoneToday: true }).length, 0);
  });
  it('never sends during quiet hours (9 PM – 7 AM)', () => {
    for (const hour of [21, 23, 0, 6]) assert.equal(r.dueReminders({ ...base, hour }).length, 0);
  });
  it('weekly progress on Sunday 6 PM only', () => {
    assert.equal(r.dueReminders({ ...base, hour: 18, weekday: 0, loggedToday: 2 })[0].kind, 'progress');
    assert.equal(r.dueReminders({ ...base, hour: 18, weekday: 2, loggedToday: 2 }).length, 0);
  });
});

describe('not repetitive or excessive', () => {
  it('rotates variants so the same text is not sent twice in a row', () => {
    const a = r.dueReminders({ ...base, hour: 19, lastSent: { no_log: { daysAgo: 1, variant: 0 } } })[0];
    assert.equal(a.variant, 1);
    assert.notEqual(a.message, 'Hey Jay! I think you forgot to log your activities today.');
  });
  it('respects cooldowns, the daily cap and unread backlog', () => {
    assert.equal(r.dueReminders({ ...base, hour: 8, daysSinceWorkout: 4, lastSent: { inactive: { daysAgo: 1, variant: 0 } } }).length, 0);
    assert.equal(r.dueReminders({ ...base, hour: 19, sentToday: 2 }).length, 0);
    assert.equal(r.dueReminders({ ...base, hour: 19, unreadReminders: 3 }).length, 0);
  });
  it('honours the user switches', () => {
    assert.equal(r.dueReminders({ ...base, hour: 19, prefs: { log_reminders: false } }).length, 0);
  });
  it('dormant users only get one come-back note a week', () => {
    assert.equal(r.dueReminders({ ...base, hour: 19, daysSinceActive: 45 }).length, 0);
    assert.equal(r.dueReminders({ ...base, hour: 18, weekday: 6, daysSinceActive: 45 })[0].kind, 'come_back');
  });
});

describe('motivation', () => {
  it('keep-moving sample after 3+ days without a workout', () => {
    assert.equal(r.dueReminders({ ...base, hour: 8, daysSinceWorkout: 3 })[0].message, 'Hey! Keep moving. Your fitness journey is still ongoing!');
  });
  it('streak praise only when there is a real streak', () => {
    assert.match(r.dueReminders({ ...base, hour: 8, streak: 4 })[0].message, /4-day streak/);
    assert.equal(r.dueReminders({ ...base, hour: 8, streak: 0, workoutsThisWeek: 0 }).length, 0);
  });
});

describe('weekly email', () => {
  it('only Sunday 6 PM, verified, opted in, at most weekly', () => {
    const ok = { hour: 18, weekday: 0, prefs: {}, emailVerified: true, daysSinceActive: 2, lastSentDaysAgo: null };
    assert.equal(r.weeklyEmailDue(ok), true);
    assert.equal(r.weeklyEmailDue({ ...ok, emailVerified: false }), false);
    assert.equal(r.weeklyEmailDue({ ...ok, prefs: { email_weekly: false } }), false);
    assert.equal(r.weeklyEmailDue({ ...ok, lastSentDaysAgo: 2 }), false);
  });
  it('interprets the week in plain language and escapes the name', () => {
    assert.match(interpretWeek({ workouts: 3, planned: 3, logDays: 6 }), /every planned workout/);
    const mail = weeklyProgressEmail({ name: '<b>Jay</b>', stats: { workouts: 1, minutes: 20, logDays: 2 } });
    assert.doesNotMatch(mail.html, /<b>Jay<\/b>/);
  });
});

describe('helpers', () => {
  it('Philippine local time and streak counting', () => {
    const p = r.zonedParts(new Date('2026-11-21T11:30:00Z'), 'Asia/Manila');
    assert.deepEqual(p, { date: '2026-11-21', hour: 19, weekday: 6 });
    assert.equal(streakFrom(['2026-11-21', '2026-11-20', '2026-11-18'], '2026-11-21'), 2);
    assert.equal(streakFrom(['2026-11-20', '2026-11-19'], '2026-11-21'), 2);
  });
});
