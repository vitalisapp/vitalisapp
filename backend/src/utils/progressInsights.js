// Progress interpretation — rule-based, plain-language summaries (Section 8).
//
// Pure module: no DB / no I/O / no AI. The progress service feeds it the
// user's REAL daily rows (or the sample dataset in demo mode) and it returns
// numbers + sentences that always agree with the recorded data.
//
// Inputs (all optional; days are 'YYYY-MM-DD'):
//   today      'YYYY-MM-DD'
//   goal       { goalType, targetWeightKg, weightKg, targetDate, createdAt,
//                dailyKcal, proteinG }
//   workouts   [{ day, sessions, minutes, completed }]   (daily totals)
//   meals      [{ day, kcal, protein }]                  (daily totals)
//   weights    [{ day, value }]                          (chronological)
//   currentWeightKg, progressPct    (from goals.computeProgress)
//   sessionsSinceStart              (workouts since the goal started)
//
// Guidance used (general public-health figures, not a diagnosis):
//   150 active minutes / week (WHO adult activity guideline)
//   ~0.5–1 kg / week as a sustainable weight-change pace

const WEEKLY_MINUTES_GUIDE = 150;
const SAFE_LOSS_KG_PER_WEEK = 1;
const SAFE_GAIN_KG_PER_WEEK = 0.5;
const DAY_MS = 86400000;

const pad = (n) => String(n).padStart(2, '0');
const parseISO = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (iso, n) => {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / DAY_MS);
const round1 = (n) => Math.round(n * 10) / 10;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const isISO = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v);

function toDay(v) {
  if (!v) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : toISO(v);
  return isISO(v) ? v.slice(0, 10) : null;
}

// Sum daily rows whose day falls in [from, to] (inclusive).
function windowStats(workouts, meals, from, to) {
  const inWin = (r) => r.day >= from && r.day <= to;
  const w = workouts.filter(inWin);
  const m = meals.filter(inWin);
  const activeDays = new Set(w.filter((r) => Number(r.sessions) > 0).map((r) => r.day)).size;
  const kcalDays = m.filter((r) => Number(r.kcal) > 0);
  return {
    from,
    to,
    activeDays,
    sessions: w.reduce((s, r) => s + (Number(r.sessions) || 0), 0),
    completed: w.reduce((s, r) => s + (Number(r.completed) || 0), 0),
    minutes: Math.round(w.reduce((s, r) => s + (Number(r.minutes) || 0), 0)),
    mealDays: new Set(m.map((r) => r.day)).size,
    avgKcal: kcalDays.length
      ? Math.round(kcalDays.reduce((s, r) => s + Number(r.kcal), 0) / kcalDays.length)
      : null,
    avgProtein: kcalDays.length
      ? Math.round(kcalDays.reduce((s, r) => s + (Number(r.protein) || 0), 0) / kcalDays.length)
      : null,
  };
}

function goalDirection(goal) {
  if (!goal) return 0;
  const t = Number(goal.targetWeightKg);
  const s = Number(goal.weightKg);
  if (Number.isFinite(t) && Number.isFinite(s) && t !== s) return t < s ? -1 : 1;
  if (goal.goalType === 'LOSE_WEIGHT') return -1;
  if (goal.goalType === 'GAIN_WEIGHT') return 1;
  return 0;
}

// ── Insights ───────────────────────────────────────────────────────────
function trainingInsight(week, prev) {
  if (week.sessions === 0) {
    return {
      key: 'training',
      tone: 'warn',
      icon: 'fitness_center',
      title: 'Training paused',
      text: prev.sessions > 0
        ? `No workouts in the last 7 days (you had ${plural(prev.activeDays, 'active day')} the week before). A short 15-minute session is an easy way back in.`
        : 'No workouts recorded in the last 7 days. Start with one short session to build the habit.',
    };
  }
  const delta = week.activeDays - prev.activeDays;
  const trend = delta > 0
    ? `up from ${prev.activeDays} the week before`
    : delta < 0
      ? `down from ${prev.activeDays} the week before`
      : 'the same as the week before';
  const tone = week.activeDays >= 3 || delta > 0 ? 'good' : 'info';
  return {
    key: 'training',
    tone,
    icon: 'fitness_center',
    title: tone === 'good' ? 'Consistent training' : 'Training consistency',
    text: `You trained on ${week.activeDays} of the last 7 days, ${trend}.${week.activeDays >= 3 ? ' That is a solid routine.' : ' Aim for at least 3 active days a week.'}`,
  };
}

function minutesInsight(week) {
  if (week.sessions === 0) return null;
  const gap = WEEKLY_MINUTES_GUIDE - week.minutes;
  if (gap <= 0) {
    return {
      key: 'minutes',
      tone: 'good',
      icon: 'timer',
      title: 'Activity target met',
      text: `${week.minutes} active minutes this week, which meets the ${WEEKLY_MINUTES_GUIDE}-minute weekly activity guideline.`,
    };
  }
  return {
    key: 'minutes',
    tone: 'info',
    icon: 'timer',
    title: 'Active minutes',
    text: `${week.minutes} active minutes this week, ${gap} short of the ${WEEKLY_MINUTES_GUIDE}-minute weekly guideline.`,
  };
}

function nutritionInsights(week, goal) {
  const out = [];
  if (week.mealDays === 0) {
    out.push({
      key: 'meal_logging',
      tone: 'warn',
      icon: 'restaurant',
      title: 'No meals logged',
      text: 'No meals were logged in the last 7 days, so nutrition progress cannot be checked yet.',
    });
    return out;
  }
  if (week.mealDays < 4) {
    out.push({
      key: 'meal_logging',
      tone: 'warn',
      icon: 'restaurant',
      title: 'Logging gaps',
      text: `Meals were logged on only ${week.mealDays} of 7 days, so calorie insights are less reliable.`,
    });
  } else {
    out.push({
      key: 'meal_logging',
      tone: 'good',
      icon: 'restaurant',
      title: 'Steady food logging',
      text: `Meals were logged on ${week.mealDays} of the last 7 days. Good tracking makes your plan more accurate.`,
    });
  }

  const target = Number(goal?.dailyKcal);
  if (week.avgKcal != null && Number.isFinite(target) && target > 0) {
    const ratio = week.avgKcal / target;
    const pct = Math.round(Math.abs(ratio - 1) * 100);
    let tone = 'good';
    let title = 'Calories on target';
    let text = `You averaged ${week.avgKcal} kcal on logged days, close to your ${target} kcal target.`;
    if (ratio < 0.75) {
      tone = 'warn';
      title = 'Eating well below target';
      text = `You averaged ${week.avgKcal} kcal, about ${pct}% below your ${target} kcal target. Eating too little can slow recovery and energy, so this may need a closer look.`;
    } else if (ratio < 0.9) {
      tone = 'info';
      title = 'Slightly under target';
      text = `You averaged ${week.avgKcal} kcal, about ${pct}% below your ${target} kcal target.`;
    } else if (ratio > 1.1) {
      tone = goal?.goalType === 'LOSE_WEIGHT' ? 'warn' : 'info';
      title = 'Above calorie target';
      text = `You averaged ${week.avgKcal} kcal, about ${pct}% above your ${target} kcal target${goal?.goalType === 'LOSE_WEIGHT' ? ', which can slow weight loss' : ''}.`;
    }
    out.push({ key: 'calories', tone, icon: 'local_fire_department', title, text });
  }

  const pTarget = Number(goal?.proteinG);
  if (week.avgProtein != null && Number.isFinite(pTarget) && pTarget > 0) {
    const ratio = week.avgProtein / pTarget;
    out.push(ratio >= 0.85
      ? {
        key: 'protein',
        tone: 'good',
        icon: 'egg_alt',
        title: 'Protein on track',
        text: `Protein averaged ${week.avgProtein} g a day against a ${pTarget} g target.`,
      }
      : {
        key: 'protein',
        tone: 'info',
        icon: 'egg_alt',
        title: 'Protein is low',
        text: `Protein averaged ${week.avgProtein} g a day, below your ${pTarget} g target. Adding eggs, fish, chicken or tofu helps.`,
      });
  }
  return out;
}

function weightInsight(weights, goal, today) {
  if (!weights.length) {
    return {
      key: 'weight',
      tone: 'info',
      icon: 'monitor_weight',
      title: 'No weigh-ins yet',
      text: 'Log your weight in Body to see how it is changing over time.',
    };
  }
  const latest = weights[weights.length - 1];
  const since = diffDays(latest.day, today);
  const windowStart = addDays(today, -30);
  const recent = weights.filter((w) => w.day >= windowStart);
  const dir = goalDirection(goal);

  if (since > 14) {
    return {
      key: 'weight',
      tone: 'info',
      icon: 'monitor_weight',
      title: 'Weigh-in due',
      text: `Your last weigh-in was ${plural(since, 'day')} ago (${round1(latest.value)} kg). A fresh reading keeps your progress accurate.`,
    };
  }
  if (recent.length < 2) {
    return {
      key: 'weight',
      tone: 'info',
      icon: 'monitor_weight',
      title: 'Weight logged',
      text: `Latest weight is ${round1(latest.value)} kg. Log again next week to see a trend.`,
    };
  }
  const change = round1(recent[recent.length - 1].value - recent[0].value);
  const span = Math.max(1, diffDays(recent[0].day, recent[recent.length - 1].day));
  const perWeek = round1((change / span) * 7);
  const moved = change === 0
    ? 'stayed the same'
    : `${change < 0 ? 'dropped' : 'went up'} ${Math.abs(change)} kg`;
  let tone = 'info';
  let note = '';
  if (dir !== 0 && change !== 0) {
    const right = Math.sign(change) === dir;
    tone = right ? 'good' : 'warn';
    note = right ? ' That is moving toward your goal.' : ' That is moving away from your goal.';
    if (right && dir < 0 && Math.abs(perWeek) > SAFE_LOSS_KG_PER_WEEK) {
      tone = 'warn';
      note = ` That is about ${Math.abs(perWeek)} kg a week, faster than the usual safe pace of up to ${SAFE_LOSS_KG_PER_WEEK} kg a week.`;
    }
  } else if (dir === 0) {
    tone = Math.abs(change) <= 1 ? 'good' : 'info';
    note = Math.abs(change) <= 1 ? ' Nice and stable.' : '';
  }
  return {
    key: 'weight',
    tone,
    icon: 'monitor_weight',
    title: 'Weight trend',
    text: `Over the last ${plural(span, 'day')} your weight ${moved}.${note}`,
  };
}

// ── Target-date timeline ───────────────────────────────────────────────
function buildTimeline({ goal, today, progressPct, currentWeightKg, sessionsSinceStart }) {
  if (!goal) return null;
  const startDate = toDay(goal.createdAt) || today;
  const targetDate = toDay(goal.targetDate);
  const base = {
    startDate,
    targetDate,
    elapsedDays: Math.max(0, diffDays(startDate, today)),
    sessionsSinceStart: Number(sessionsSinceStart) || 0,
    progressPct: Number.isFinite(Number(progressPct)) && progressPct !== null ? Number(progressPct) : null,
  };

  if (!targetDate) {
    return {
      ...base,
      status: 'no_target',
      totalDays: null,
      remainingDays: null,
      timePct: null,
      expectedPct: null,
      weeklyRateNeededKg: null,
      text: 'No target date set. Add one in Profile → Goal to see if you are on schedule.',
    };
  }

  const totalDays = Math.max(1, diffDays(startDate, targetDate));
  const remainingDays = diffDays(today, targetDate);
  const timePct = Math.max(0, Math.min(100, Math.round((base.elapsedDays / totalDays) * 100)));
  const out = { ...base, totalDays, remainingDays, timePct, expectedPct: timePct, weeklyRateNeededKg: null };

  // Weight-based goals have a measurable % — compare it with elapsed time.
  if (base.progressPct != null) {
    const remainingKg = Number(goal.targetWeightKg) - Number(currentWeightKg);
    if (Number.isFinite(remainingKg) && remainingDays > 0) {
      out.weeklyRateNeededKg = round1(Math.abs(remainingKg) / (remainingDays / 7));
    }
    if (base.progressPct >= 100) {
      return { ...out, status: 'complete', text: 'Target reached. Great work. Consider setting your next goal.' };
    }
    if (remainingDays < 0) {
      return {
        ...out,
        status: 'overdue',
        text: `Your target date passed ${plural(-remainingDays, 'day')} ago at ${base.progressPct}% progress. Set a new, realistic date to keep going.`,
      };
    }
    const gap = base.progressPct - timePct;
    const status = gap >= 10 ? 'ahead' : gap >= -10 ? 'on_track' : 'behind';
    const daysLeft = plural(remainingDays, 'day');
    let text;
    if (status === 'ahead') text = `${base.progressPct}% done with ${timePct}% of the time used. You are ahead of schedule with ${daysLeft} left.`;
    else if (status === 'on_track') text = `${base.progressPct}% done with ${timePct}% of the time used. You are on track with ${daysLeft} left.`;
    else text = `${base.progressPct}% done but ${timePct}% of the time has passed, so you are behind schedule with ${daysLeft} left.`;

    const safe = goalDirection(goal) < 0 ? SAFE_LOSS_KG_PER_WEEK : SAFE_GAIN_KG_PER_WEEK;
    if (out.weeklyRateNeededKg != null && out.weeklyRateNeededKg > safe) {
      text += ` Reaching it needs about ${out.weeklyRateNeededKg} kg a week, which is faster than recommended. Extending the date is safer.`;
    } else if (out.weeklyRateNeededKg != null && status === 'behind') {
      text += ` About ${out.weeklyRateNeededKg} kg a week from now gets you there.`;
    }
    return { ...out, status, text };
  }

  // Non-weight goals (muscle, performance, maintain): time + consistency.
  if (remainingDays < 0) {
    return {
      ...out,
      status: 'overdue',
      text: `Your target date passed ${plural(-remainingDays, 'day')} ago. You completed ${plural(base.sessionsSinceStart, 'workout')} during this goal.`,
    };
  }
  const weeks = Math.max(1, base.elapsedDays / 7);
  const perWeek = round1(base.sessionsSinceStart / weeks);
  const status = perWeek >= 3 ? 'on_track' : base.elapsedDays < 7 ? 'on_track' : 'behind';
  return {
    ...out,
    status,
    text: `${timePct}% of your goal period has passed (${plural(remainingDays, 'day')} left). You are averaging ${perWeek} workouts a week${status === 'behind' ? '. 3 or more a week keeps this goal on track.' : ', which keeps this goal on track.'}`,
  };
}

// ── Public entry ───────────────────────────────────────────────────────
function buildProgressSummary(input = {}) {
  const today = toDay(input.today) || toISO(new Date());
  const workouts = (input.workouts || []).filter((r) => isISO(r.day));
  const meals = (input.meals || []).filter((r) => isISO(r.day));
  const weights = (input.weights || [])
    .filter((r) => isISO(r.day) && Number.isFinite(Number(r.value)))
    .map((r) => ({ day: r.day.slice(0, 10), value: Number(r.value) }))
    .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
  const goal = input.goal || null;

  const week = windowStats(workouts, meals, addDays(today, -6), today);
  const prev = windowStats(workouts, meals, addDays(today, -13), addDays(today, -7));

  const latestW = weights[weights.length - 1] || null;
  const monthStart = addDays(today, -30);
  const monthW = weights.filter((w) => w.day >= monthStart);
  const weightChange30d = monthW.length >= 2 ? round1(monthW[monthW.length - 1].value - monthW[0].value) : null;

  const insights = [
    trainingInsight(week, prev),
    minutesInsight(week),
    ...nutritionInsights(week, goal),
    weightInsight(weights, goal, today),
  ].filter(Boolean);

  const timeline = buildTimeline({
    goal,
    today,
    progressPct: input.progressPct,
    currentWeightKg: input.currentWeightKg ?? latestW?.value ?? goal?.weightKg,
    sessionsSinceStart: input.sessionsSinceStart,
  });

  // Overall status: no records at all → getting started; otherwise weigh
  // good vs warning signals (timeline behind/overdue counts as a warning).
  const hasAny = workouts.length > 0 || meals.length > 0 || weights.length > 0;
  const good = insights.filter((i) => i.tone === 'good').length;
  let warn = insights.filter((i) => i.tone === 'warn').length;
  if (timeline && (timeline.status === 'behind' || timeline.status === 'overdue')) warn += 1;

  let status;
  let headline;
  if (!hasAny) {
    status = 'getting_started';
    headline = 'Your progress story starts with your first log. Record a workout, a meal or your weight to see insights here.';
  } else if (good >= 2 && warn === 0) {
    status = 'great';
    headline = 'You are doing great this week. Your training and logging are consistent.';
  } else if (warn >= 2 && warn > good) {
    status = 'needs_attention';
    headline = 'A few areas need attention this week. Small steps today will get you back on track.';
  } else {
    status = 'steady';
    headline = 'Steady progress. Keep building on what is working and close the gaps below.';
  }

  return {
    today,
    status,
    headline,
    week,
    previousWeek: prev,
    latestWeightKg: latestW ? round1(latestW.value) : null,
    weightChange30d,
    insights,
    timeline,
  };
}

module.exports = {
  WEEKLY_MINUTES_GUIDE,
  buildProgressSummary,
  buildTimeline,
  windowStats,
};
