import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../../../../lib/apiClient.js';

/* ── Local calendar helpers (client day, not server day) ─────────────── */

const pad2 = (n) => String(n).padStart(2, '0');

export function localTodayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const maybeNum = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const firstDefined = (...values) => values.find((v) => v !== null && v !== undefined);

/* ── Normalisers: every shape is read defensively ────────────────────── */

function normalizeDashboard(payload) {
  const stats = payload?.stats || {};
  return {
    stats: {
      steps: num(stats.steps),
      calories: num(stats.calories_burned),
      minutes: num(stats.workout_duration_mins),
    },
    streak: payload?.streak || null,
  };
}

function normalizeWeek(payload) {
  const days = Array.isArray(payload?.days) ? payload.days : [];
  return {
    weekStart: payload?.weekStart || null,
    days: days.slice(0, 7).map((d) => ({
      date: d.date,
      isToday: Boolean(d.isToday),
      isFuture: Boolean(d.isFuture),
      sessions: num(d.workouts?.sessions),
      minutes: num(d.workouts?.minutes),
      kcal: num(d.meals?.kcal),
      meals: num(d.meals?.count),
      steps: num(d.steps),
    })),
    totals: {
      sessions: num(payload?.totals?.sessions),
      minutes: num(payload?.totals?.minutes),
      kcal: num(payload?.totals?.kcal),
      steps: num(payload?.totals?.steps),
    },
  };
}

function normalizeFoodLogs(payload, today) {
  const records = Array.isArray(payload?.records) ? payload.records : [];
  const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
  for (const row of records) {
    const day = String(row?.logged_at || '').slice(0, 10);
    if (day !== today) continue;
    totals.kcal += num(row.calories);
    totals.protein += num(row.protein);
    totals.carbs += num(row.carbs);
    totals.fat += num(row.fat);
    totals.meals += 1;
  }
  return {
    kcal: Math.round(totals.kcal),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
    meals: totals.meals,
  };
}

function normalizeSummary(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const goal = payload.goal && typeof payload.goal === 'object' ? payload.goal : null;
  const progressPct = maybeNum(firstDefined(payload.progressPct, payload.progress_pct));
  const currentWeightKg = maybeNum(firstDefined(payload.currentWeightKg, payload.current_weight_kg));
  const targetWeightKg = maybeNum(
    firstDefined(goal?.target_weight_kg, goal?.targetWeightKg, payload.targetWeightKg, payload.target_weight_kg),
  );
  const targets = {
    kcal: maybeNum(firstDefined(goal?.daily_kcal, goal?.dailyKcal, payload.daily_kcal)),
    protein: maybeNum(firstDefined(goal?.protein_g, goal?.proteinG, payload.protein_g)),
    carbs: maybeNum(firstDefined(goal?.carbs_g, goal?.carbsG, payload.carbs_g)),
    fat: maybeNum(firstDefined(goal?.fat_g, goal?.fatG, payload.fat_g)),
  };
  if (!goal && progressPct === null) return null;
  return {
    progressPct,
    currentWeightKg,
    targetWeightKg,
    goalType: goal?.goal_type || goal?.goalType || null,
    targetDate: goal?.target_date || goal?.targetDate || null,
    targets,
  };
}

/* ── Hook ────────────────────────────────────────────────────────────── */

const EMPTY_TARGETS = { kcal: null, protein: null, carbs: null, fat: null };

export function useWidgetData(userId) {
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState({ key: null, status: 'loading', error: null, payload: null });

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const requestKey = `${userId || 'anon'}:${nonce}`;
  const pending = result.key !== requestKey;

  useEffect(() => {
    if (!userId) return undefined;

    let alive = true;
    const today = localTodayIso();

    (async () => {
      const results = await Promise.allSettled([
        apiGet(`/api/dashboard/${userId}?today=${today}`),
        apiGet('/api/settings'),
        apiGet(`/api/dashboard/week-calendar?today=${today}`),
        apiGet(`/api/food-logs/${userId}?limit=200`),
        apiGet('/api/progress/summary'),
      ]);

      if (!alive) return;

      const [dashR, settingsR, weekR, foodR, summaryR] = results;
      const rejected = results.filter((r) => r.status === 'rejected');

      // A dead session should read as "sign in", not "no data".
      if (rejected.some((r) => r.reason?.status === 401)) {
        setResult({
          key: requestKey,
          status: 'auth',
          error: 'Sign in to preview your widget data.',
          payload: null,
        });
        return;
      }

      if (results.every((r) => r.status === 'rejected')) {
        setResult({
          key: requestKey,
          status: 'error',
          error: rejected[0]?.reason?.message || 'Could not load your fitness data.',
          payload: null,
        });
        return;
      }

      const dashboard = dashR.status === 'fulfilled' ? normalizeDashboard(dashR.value) : null;
      const settings = settingsR.status === 'fulfilled' ? settingsR.value?.settings : null;
      const week = weekR.status === 'fulfilled' ? normalizeWeek(weekR.value) : null;
      const food = foodR.status === 'fulfilled' ? normalizeFoodLogs(foodR.value, today) : null;
      const summary = summaryR.status === 'fulfilled' ? normalizeSummary(summaryR.value) : null;

      setResult({
        key: requestKey,
        status: rejected.length ? 'partial' : 'ready',
        error: rejected.length ? 'Some widget data could not be refreshed.' : null,
        payload: {
          today,
          stats: dashboard?.stats || { steps: 0, calories: 0, minutes: 0 },
          streak: dashboard?.streak || null,
          stepGoal: num(settings?.step_goal) || 8000,
          units: settings?.units === 'imperial' ? 'imperial' : 'metric',
          week,
          nutrition: food ? { ...food, targets: summary?.targets || EMPTY_TARGETS } : null,
          goal: summary,
        },
      });
    })();

    return () => {
      alive = false;
    };
  }, [userId, requestKey]);

  return {
    status: !userId ? 'idle' : pending ? 'loading' : result.status,
    error: pending ? null : result.error,
    data: pending ? null : result.payload,
    reload,
  };
}

export default useWidgetData;
