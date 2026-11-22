// AI personal coach — decision engine (Section 4). Pure, no I/O.
//
// RULES DECIDE, AI ONLY WORDS IT. Everything that changes a user's week is
// decided here with safe, explainable rules; Gemini (coachPlan.service) may
// only rephrase the resulting message.
//
//   buildWeek       plan days → this calendar week (Mon–Sun), workouts on the
//                   user's preferred training days
//   weekStatuses    done / missed / today / upcoming / rest per day
//   proposeAdjust   options after a missed workout:
//                     reschedule  move missed workouts to free days left this
//                                 week (never 3 training days in a row)
//                     lighter     skip the missed one and shorten the rest
//                                 (and drop one session if recovery is a concern)
//                     skip        leave the week as it is
//   recoveryCheck   hard sessions, short sleep, long streak, repeated misses
//                   → never add load; prefer the lighter option
//   nutritionTips   advice only — never cuts calories because a workout was
//                   missed, never changes the targets
//
// Dates are 'YYYY-MM-DD' strings in the server's local time zone.

const DAY_MS = 86400000;
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const LIGHTER_CAP_MINS = 30;
// Spread layouts (0 = Monday … 6 = Sunday) when no preferred days are saved.
const SPREAD = {
  1: [2], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6],
};

function isoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseIso(s) {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(iso, n) {
  const d = parseIso(iso);
  d.setDate(d.getDate() + n);
  return isoLocal(d);
}

/** Monday of the week containing `date`. */
function weekStartOf(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return isoLocal(d);
}

function weekdayName(iso) {
  return WEEKDAY_NAMES[parseIso(iso).getDay()];
}

/** Which offsets (0 = Mon) hold workouts this week. */
function trainingOffsets(workoutCount, preferredDays = []) {
  const n = Math.max(0, Math.min(7, workoutCount));
  if (n === 0) return [];
  const pref = [...new Set((preferredDays || []).map(Number).filter((d) => d >= 0 && d <= 6))]
    .map((dow) => (dow + 6) % 7)
    .sort((a, b) => a - b);
  if (pref.length >= n) {
    if (pref.length === n) return pref;
    // More preferred days than workouts: spread across them.
    const picked = [];
    for (let i = 0; i < n; i += 1) picked.push(pref[Math.floor((i * pref.length) / n)]);
    return [...new Set(picked)].sort((a, b) => a - b);
  }
  const out = [...pref];
  for (const o of SPREAD[n]) {
    if (out.length >= n) break;
    if (!out.includes(o)) out.push(o);
  }
  for (let o = 0; out.length < n && o < 7; o += 1) if (!out.includes(o)) out.push(o);
  return out.sort((a, b) => a - b);
}

/**
 * @param {object[]} planDays  [{ day_number, title, activity_type, duration_mins }]
 * @returns {object[]} 7 entries: { date, offset, kind: 'workout'|'rest', dayNumber, title, durationMins, capMins, moved }
 */
function buildWeek(planDays, preferredDays, weekStart) {
  const sorted = [...(planDays || [])].sort((a, b) => a.day_number - b.day_number);
  const workouts = sorted.filter((d) => d.activity_type === 'Workout');
  const recovery = sorted.find((d) => d.activity_type !== 'Workout') || null;
  const offsets = trainingOffsets(workouts.length, preferredDays);
  const week = [];
  let k = 0;
  for (let offset = 0; offset < 7; offset += 1) {
    const date = addDays(weekStart, offset);
    if (offsets.includes(offset) && workouts[k]) {
      const w = workouts[k++];
      week.push({ date, offset, kind: 'workout', dayNumber: w.day_number, title: cleanTitle(w.title), durationMins: w.duration_mins ?? null, capMins: null, moved: false });
    } else {
      week.push({ date, offset, kind: 'rest', dayNumber: recovery ? recovery.day_number : null, title: recovery ? cleanTitle(recovery.title) : 'Rest day', durationMins: recovery?.duration_mins ?? null, capMins: null, moved: false });
    }
  }
  return week;
}

function cleanTitle(t) {
  return String(t || '').replace(/^Day \d+\s*[—-]\s*/, '') || 'Workout';
}

/**
 * @param {object[]} week
 * @param {object} p
 * @param {{dayNumber:number,date:string}[]} p.completions plan-day completions this week
 * @param {string[]} p.activeDates dates with a completed workout log (any plan)
 * @param {string} p.today
 * @param {string[]} [p.handled] missed dates the user already dealt with
 */
function weekStatuses(week, { completions = [], activeDates = [], today, handled = [] }) {
  const doneDays = new Map();
  for (const c of completions) if (!doneDays.has(c.dayNumber)) doneDays.set(c.dayNumber, c.date);
  const active = new Set(activeDates);
  const handledSet = new Set(handled);
  return week.map((e) => {
    let status;
    if (e.kind === 'rest') status = e.date === today ? 'today-rest' : 'rest';
    else if (doneDays.has(e.dayNumber) || (e.date <= today && active.has(e.date))) status = 'done';
    else if (e.date < today) status = handledSet.has(e.date) ? 'skipped' : 'missed';
    else if (e.date === today) status = 'today';
    else status = 'upcoming';
    return { ...e, status, weekday: weekdayName(e.date) };
  });
}

/**
 * Should the coach avoid adding load right now?
 * @returns {{ concern: boolean, reasons: string[] }}
 */
function recoveryCheck({ recentRatings = [], sleepHours = null, streak = 0, missedLastWeek = 0, missedThisWeek = 0 }) {
  const reasons = [];
  const rated = recentRatings.slice(0, 3);
  if (rated.length >= 2 && rated.filter((r) => r >= 4).length >= 2) reasons.push('your recent sessions felt very hard');
  if (sleepHours != null && Number(sleepHours) < 6) reasons.push(`you usually sleep about ${Number(sleepHours)} hours`);
  if (streak >= 5) reasons.push(`you have trained ${streak} days in a row`);
  if (missedLastWeek >= 2 && missedThisWeek >= 1) reasons.push('a few sessions have been hard to fit in lately');
  return { concern: reasons.length > 0, reasons };
}

function trainingRunAround(week, idx) {
  // Longest run of consecutive training days that includes idx (after placement).
  let left = idx;
  while (left - 1 >= 0 && week[left - 1].kind === 'workout') left -= 1;
  let right = idx;
  while (right + 1 < week.length && week[right + 1].kind === 'workout') right += 1;
  return right - left + 1;
}

/**
 * @param {object[]} statuses output of weekStatuses
 * @param {object} p
 * @param {string} p.today
 * @param {{concern:boolean,reasons:string[]}} p.recovery
 * @returns {null | { missed, recommended, options: {reschedule, lighter, skip} }}
 */
function proposeAdjust(statuses, { today, recovery = { concern: false, reasons: [] } }) {
  const missed = statuses.filter((e) => e.status === 'missed');
  if (missed.length === 0) return null;

  // ── reschedule ──
  const work = statuses.map((e) => ({ ...e }));
  for (const m of missed) {
    const i = work.findIndex((e) => e.date === m.date);
    work[i] = { ...work[i], kind: 'rest', title: 'Rest day', moved: true, movedTo: null };
  }
  const maxMoves = recovery.concern ? 1 : missed.length;
  const moved = [];
  const dropped = [];
  for (const m of missed) {
    if (moved.length >= maxMoves) { dropped.push(m); continue; }
    const slot = work.findIndex((e, i) => {
      if (e.date < today || e.kind !== 'rest' || e.moved) return false;
      if (e.date === today && statuses[i].status === 'done') return false;
      const trial = work.map((x, j) => (j === i ? { ...x, kind: 'workout' } : x));
      return trainingRunAround(trial, i) <= 2;
    });
    if (slot === -1) { dropped.push(m); continue; }
    work[slot] = { ...work[slot], kind: 'workout', dayNumber: m.dayNumber, title: m.title, durationMins: m.durationMins, capMins: m.capMins, moved: true, movedFrom: m.date };
    work[work.findIndex((e) => e.date === m.date)].movedTo = work[slot].date;
    moved.push({ title: m.title, from: m.date, fromDay: m.weekday, to: work[slot].date, toDay: weekdayName(work[slot].date) });
  }
  const reschedule = { key: 'reschedule', available: moved.length > 0, moved, dropped: dropped.map((d) => ({ title: d.title, date: d.date, weekday: d.weekday })), week: stripWeek(work) };

  // ── lighter ── skip missed, cap remaining sessions; with a recovery concern
  // and 3+ sessions left, the last one becomes a rest day.
  const light = statuses.map((e) => ({ ...e }));
  const remaining = light.filter((e) => e.kind === 'workout' && (e.status === 'today' || e.status === 'upcoming'));
  for (const e of remaining) e.capMins = Math.min(Number(e.durationMins) || LIGHTER_CAP_MINS, LIGHTER_CAP_MINS);
  let removed = null;
  if (recovery.concern && remaining.length >= 3) {
    const last = remaining[remaining.length - 1];
    removed = { title: last.title, date: last.date, weekday: last.weekday };
    Object.assign(last, { kind: 'rest', title: 'Rest day', capMins: null, moved: true });
  }
  const lighter = { key: 'lighter', available: true, capMins: LIGHTER_CAP_MINS, sessions: remaining.length - (removed ? 1 : 0), removed, week: stripWeek(light) };

  const skip = { key: 'skip', available: true, week: stripWeek(statuses) };

  let recommended = 'skip';
  if (recovery.concern) recommended = 'lighter';
  else if (reschedule.available) recommended = 'reschedule';
  else if (remaining.length > 0) recommended = 'lighter';

  return { missed: missed.map((m) => ({ date: m.date, weekday: m.weekday, title: m.title })), recommended, options: { reschedule, lighter, skip } };
}

function stripWeek(entries) {
  return entries.map(({ date, offset, kind, dayNumber, title, durationMins, capMins, moved }) => ({
    date, offset, kind, dayNumber, title, durationMins: durationMins ?? null, capMins: capMins ?? null, moved: Boolean(moved),
  }));
}

/** Built-in message (shown when Gemini is unavailable, and given to Gemini as the facts). */
function missedMessage(proposal, recovery) {
  if (!proposal) return null;
  const days = proposal.missed.map((m) => m.weekday);
  const which = days.length === 1 ? `your ${days[0]} workout` : `${days.length} workouts this week (${days.join(', ')})`;
  const opt = proposal.options[proposal.recommended];
  let plan;
  if (proposal.recommended === 'reschedule') {
    plan = `I'll move ${opt.moved.map((m) => `${m.title} to ${m.toDay}`).join(' and ')} so you stay on track.`;
  } else if (proposal.recommended === 'lighter') {
    plan = recovery.concern
      ? `Because ${recovery.reasons[0]}, let's keep the rest of the week lighter: shorter sessions of about ${opt.capMins} minutes${opt.removed ? ` and an extra rest day on ${opt.removed.weekday}` : ''}.`
      : `Let's keep the rest of your week doable with shorter sessions of about ${opt.capMins} minutes.`;
  } else {
    plan = "There's no free day left this week, so let's just pick up with your next session.";
  }
  return `Oops! You missed ${which}. No worries! ${plan}`;
}

function dailyMessage(statuses, { firstName, today: todayIso } = {}) {
  const name = firstName ? `, ${firstName}` : '';
  const today = statuses.find((e) => e.date === todayIso);
  const done = statuses.filter((e) => e.status === 'done').length;
  const total = statuses.filter((e) => e.kind === 'workout').length;
  if (today?.status === 'today') return `Today is ${today.title}${name}. ${done} of ${total} workouts done this week.`;
  if (today?.status === 'done') return `Today's workout is done${name}. ${done} of ${total} this week. Rest well and refuel.`;
  if (today?.status === 'today-rest') return `Rest day today${name}. Recovery is part of the plan: ${done} of ${total} workouts done this week.`;
  return `${done} of ${total} workouts done this week${name}. Nice work showing up.`;
}

/**
 * Advice only. Never lowers calories because of a missed workout and never
 * changes the saved targets.
 */
function nutritionTips({ goalType, dailyKcal, proteinG, todayKind, intakeKcal = 0, intakeProtein = 0, hour = 12, missedCount = 0, sleepHours = null }) {
  const tips = [];
  const kcal = Number(dailyKcal) || null;
  const protein = Number(proteinG) || null;
  if (missedCount > 0 && kcal) {
    tips.push({ key: 'no_cut', icon: 'restaurant', text: `Missing a workout is not a reason to eat less. Stick to about ${kcal.toLocaleString()} kcal today so you have energy for your next session.` });
  }
  if (kcal && intakeKcal > 0 && hour >= 17 && intakeKcal < kcal * 0.6) {
    tips.push({ key: 'under', icon: 'warning', text: `You've logged about ${Math.round(intakeKcal).toLocaleString()} of ${kcal.toLocaleString()} kcal today. Eating too little slows recovery, so add a balanced meal or snack.` });
  } else if (kcal && intakeKcal > kcal * 1.15) {
    tips.push({ key: 'over', icon: 'info', text: "You're above your calorie target today. No need to skip meals tomorrow; just go back to your normal portions." });
  }
  if (todayKind === 'workout' && protein) {
    tips.push({ key: 'workout_day', icon: 'egg_alt', text: `Workout day: have a meal with about ${Math.round(protein / 4)} g of protein (eggs, chicken, fish or tofu) within 2 hours after training.` });
  } else if (todayKind === 'rest' && protein) {
    const left = Math.max(0, Math.round(protein - intakeProtein));
    tips.push({ key: 'rest_day', icon: 'bedtime', text: `Rest day: your muscles still repair today. Keep protein near ${protein} g${intakeProtein > 0 ? ` (about ${left} g to go)` : ''}.` });
  }
  if (sleepHours != null && Number(sleepHours) < 6) {
    tips.push({ key: 'sleep', icon: 'dark_mode', text: 'Short sleep makes training feel harder. Aim for 7–9 hours tonight and avoid heavy meals right before bed.' });
  }
  if (tips.length < 2 && (goalType === 'GAIN_WEIGHT' || goalType === 'BUILD_MUSCLE')) {
    tips.push({ key: 'goal', icon: 'add_circle', text: 'Struggling to eat enough? Add an easy snack like a banana with peanut butter or a glass of milk.' });
  } else if (tips.length < 2 && goalType === 'LOSE_WEIGHT') {
    tips.push({ key: 'goal', icon: 'eco', text: 'Fill half your plate with vegetables. They keep you full for few calories.' });
  }
  return tips.slice(0, 3);
}

module.exports = {
  LIGHTER_CAP_MINS,
  weekStartOf,
  addDays,
  isoLocal,
  weekdayName,
  trainingOffsets,
  buildWeek,
  weekStatuses,
  recoveryCheck,
  proposeAdjust,
  missedMessage,
  dailyMessage,
  nutritionTips,
};
