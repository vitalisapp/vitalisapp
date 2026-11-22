// Section 5 — in-process reminder scheduler (no extra dependency).
// Wakes every 10 minutes; reminder.service.runOnce only acts inside its
// send windows (8:00, 18:00, 19:00, 20:00 local time) and every send is
// idempotent, so frequent ticks, restarts or two instances never double-send.
//   REMINDERS_ENABLED=false  turns it off (also off when NODE_ENV=test)
//   REMINDER_TZ              defaults to Asia/Manila
const TICK_MS = 10 * 60 * 1000;
const FIRST_RUN_MS = 60 * 1000;

let timer = null;
let running = false;

async function tick() {
  if (running) return;
  running = true;
  try {
    const summary = await require('../services/reminder.service').runOnce();
    if (summary.inApp || summary.emails) {
      console.log(`[reminders] ${summary.today} ${summary.hour}:00 — ${summary.inApp} in-app, ${summary.emails} email`, summary.byKind);
    }
  } catch (e) {
    console.warn('[reminders] tick failed:', e.message);
  } finally {
    running = false;
  }
}

function start() {
  if (timer) return;
  if (process.env.NODE_ENV === 'test' || String(process.env.REMINDERS_ENABLED).toLowerCase() === 'false') return;
  setTimeout(tick, FIRST_RUN_MS).unref?.();
  timer = setInterval(tick, TICK_MS);
  timer.unref?.();
  console.log(`   Reminders: on (${process.env.REMINDER_TZ || 'Asia/Manila'}, checks every 10 min)`);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { start, stop, tick };
