// Smart reminders (Section 5) — pure rules, no I/O.
//
// Each kind has a send hour (Philippine time by default), a cooldown, and
// several message variants rotated so the same text is not sent twice in a
// row. Global guards keep reminders from becoming excessive:
//   • quiet hours 21:00–07:00 (no reminder windows there)
//   • at most MAX_PER_DAY automatic reminders per user per day
//   • users inactive for 30+ days get nothing but one "come back" note a week
//   • a user with 3+ unread reminders gets no more until they read them

const QUIET_START = 21;
const QUIET_END = 7;
const MAX_PER_DAY = 2;
const DORMANT_DAYS = 30;

const KINDS = {
  // Sample: "Hey Jay! I think you forgot to log your activities today."
  no_log: {
    hour: 19, cooldownDays: 1, category: 'GOAL', type: 'info', pref: 'log_reminders',
    variants: [
      (c) => `Hey ${c.name}! I think you forgot to log your activities today.`,
      (c) => `${c.name}, quick check-in: nothing logged yet today. A meal or a short walk counts!`,
      (c) => `Hi ${c.name}! Logging today's meals and activity keeps your plan accurate. It only takes a minute.`,
    ],
  },
  // Sample: "You missed today's workout. Let's adjust your routine!"
  missed_workout: {
    hour: 20, cooldownDays: 1, category: 'TRAINING', type: 'warning', pref: 'workout_reminders',
    variants: [
      (c) => `You missed today's workout${c.workout ? ` (${c.workout})` : ''}. Let's adjust your routine! Your coach has options on the dashboard.`,
      (c) => `${c.name}, today's ${c.workout || 'workout'} didn't happen, and that's okay. Open your dashboard and I'll rearrange the week.`,
      (c) => `Busy day? Today's ${c.workout || 'session'} is still waiting. Tap your coach card to move it to a better day.`,
    ],
  },
  // Sample: "Hey! Keep moving. Your fitness journey is still ongoing!"
  inactive: {
    hour: 8, cooldownDays: 3, category: 'TRAINING', type: 'info', pref: 'motivation',
    variants: [
      () => 'Hey! Keep moving. Your fitness journey is still ongoing!',
      (c) => `It's been ${c.daysSinceWorkout} days since your last workout, ${c.name}. Even 15 minutes today gets you back on track.`,
      (c) => `${c.name}, your plan is ready whenever you are. Start small today; consistency beats intensity.`,
    ],
  },
  motivation: {
    hour: 8, cooldownDays: 3, category: 'GOAL', type: 'success', pref: 'motivation',
    variants: [
      (c) => `${c.streak}-day streak, ${c.name}! Keep it going today.`,
      (c) => `You've worked out ${c.workoutsThisWeek} time${c.workoutsThisWeek === 1 ? '' : 's'} this week. That's real progress, ${c.name}!`,
      (c) => `Good morning, ${c.name}! Every session adds up. Today is another chance to move toward your goal.`,
    ],
  },
  // Sample: "Time to check your progress and see how far you've come!"
  progress: {
    hour: 18, weekday: 0, cooldownDays: 6, category: 'GOAL', type: 'info', pref: 'progress',
    variants: [
      () => "Time to check your progress and see how far you've come!",
      (c) => `Your week in review is ready, ${c.name}: ${c.workoutsThisWeek} workout${c.workoutsThisWeek === 1 ? '' : 's'} done. See how far you've come!`,
      (c) => `Sunday check-in, ${c.name}! Log your weight and look back at this week's progress.`,
    ],
  },
  // Sent at most once a week to users who have been away 30+ days.
  come_back: {
    hour: 18, weekday: 6, cooldownDays: 7, category: 'SYSTEM', type: 'info', pref: 'motivation',
    variants: [
      (c) => `We miss you, ${c.name}! Your goals and plan are saved. Come back anytime and pick up where you left off.`,
      () => 'Your fitness journey is still ongoing. Open Vitalis and start with one small step today.',
    ],
  },
};

const PREF_KEYS = ['log_reminders', 'workout_reminders', 'motivation', 'progress', 'email_weekly'];
const DEFAULT_PREFS = Object.fromEntries(PREF_KEYS.map((k) => [k, true]));

function isQuietHour(hour) {
  return hour >= QUIET_START || hour < QUIET_END;
}

/** Variant index that differs from the last one sent for this kind. */
function nextVariant(kind, lastVariant) {
  const n = KINDS[kind].variants.length;
  if (lastVariant == null || !Number.isInteger(lastVariant)) return 0;
  return (lastVariant + 1) % n;
}

/**
 * Which reminders are due for one user right now.
 * @param {object} c context
 * @param {number} c.hour        local hour 0–23
 * @param {number} c.weekday     local weekday 0 (Sun) – 6
 * @param {string} c.name        first name
 * @param {object} c.prefs       { log_reminders, workout_reminders, motivation, progress }
 * @param {number} c.loggedToday food + workout + weight entries today
 * @param {boolean} c.workoutPlannedToday
 * @param {boolean} c.workoutDoneToday
 * @param {string} [c.workout]   today's workout title
 * @param {number|null} c.daysSinceWorkout
 * @param {number|null} c.daysSinceActive  last login or any log
 * @param {number} c.streak
 * @param {number} c.workoutsThisWeek
 * @param {number} c.sentToday   automatic reminders already sent today
 * @param {number} c.unreadReminders
 * @param {object} c.lastSent    { [kind]: { daysAgo: number, variant: number } }
 * @returns {{kind, message, category, type, variant}[]} in priority order, capped
 */
function dueReminders(c) {
  if (isQuietHour(c.hour)) return [];
  if ((c.unreadReminders || 0) >= 3) return [];
  const prefs = { ...DEFAULT_PREFS, ...(c.prefs || {}) };
  const ctx = { ...c, name: c.name || 'there' };
  const out = [];
  const cooled = (kind) => {
    const last = c.lastSent?.[kind];
    return !last || last.daysAgo >= KINDS[kind].cooldownDays;
  };
  const push = (kind) => {
    const k = KINDS[kind];
    if (!prefs[k.pref] || !cooled(kind)) return;
    if (k.hour !== c.hour) return;
    if (k.weekday != null && k.weekday !== c.weekday) return;
    const variant = nextVariant(kind, c.lastSent?.[kind]?.variant);
    out.push({ kind, message: k.variants[variant](ctx), category: k.category, type: k.type, variant });
  };

  const dormant = c.daysSinceActive != null && c.daysSinceActive >= DORMANT_DAYS;
  if (dormant) {
    push('come_back');
    return out.slice(0, 1);
  }

  if (c.workoutPlannedToday && !c.workoutDoneToday) push('missed_workout');
  if ((c.loggedToday || 0) === 0) push('no_log');
  if (c.daysSinceWorkout != null && c.daysSinceWorkout >= 3) push('inactive');
  else if ((c.streak || 0) >= 3 || (c.workoutsThisWeek || 0) >= 2) {
    const v = nextVariant('motivation', c.lastSent?.motivation?.variant);
    // Only use the streak / weekly-count wording when the numbers support it.
    if (!(v === 0 && (c.streak || 0) < 3) && !(v === 1 && (c.workoutsThisWeek || 0) < 1)) push('motivation');
  }
  push('progress');

  const room = Math.max(0, MAX_PER_DAY - (c.sentToday || 0));
  return out.slice(0, room);
}

/** Should the weekly progress email go out now? */
function weeklyEmailDue({ hour, weekday, prefs, emailVerified, daysSinceActive, lastSentDaysAgo }) {
  const p = { ...DEFAULT_PREFS, ...(prefs || {}) };
  if (!p.email_weekly || !emailVerified) return false;
  if (weekday !== 0 || hour !== 18) return false;
  if (daysSinceActive != null && daysSinceActive >= DORMANT_DAYS) return false;
  return lastSentDaysAgo == null || lastSentDaysAgo >= 6;
}

/** Local wall-clock parts in a time zone (default Asia/Manila). */
function zonedParts(date = new Date(), timeZone = 'Asia/Manila') {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false, weekday: 'short',
  });
  const parts = Object.fromEntries(f.formatToParts(date).map((p) => [p.type, p.value]));
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) % 24, weekday: wd };
}

module.exports = {
  KINDS,
  PREF_KEYS,
  DEFAULT_PREFS,
  MAX_PER_DAY,
  DORMANT_DAYS,
  isQuietHour,
  nextVariant,
  dueReminders,
  weeklyEmailDue,
  zonedParts,
};
