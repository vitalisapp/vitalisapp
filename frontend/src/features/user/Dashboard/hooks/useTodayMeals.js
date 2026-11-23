import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { qk, queryFns, swr } from '../../../../lib/queries.js';

// Today's logged macros (from food-logs) for the Today screen + Macro Coach.
// Use local date (en-CA = YYYY-MM-DD) so PH timezone matches MySQL CURDATE().
const todayKey = () => new Date().toLocaleDateString('en-CA');

const EMPTY = { kcal: 0, protein: 0, carbs: 0, fat: 0, saturated_fat: 0, trans_fat: 0, polyunsaturated_fat: 0, monounsaturated_fat: 0, count: 0 };

const sum = (rows, key) => rows.reduce((a, m) => a + (Number(m[key]) || 0), 0);
const round1 = (n) => Math.round(n * 10) / 10;

// Shares the food-logs query with MealTracker's diary (same key), so a page
// that shows both makes ONE request instead of two.
export const useTodayMeals = (userId) => {
  const query = useQuery({
    queryKey: qk.foodLogs(userId),
    queryFn: queryFns.foodLogs(userId),
    enabled: Boolean(userId),
    ...swr,
  });
  const { data, refetch } = query;

  const meals = useMemo(() => {
    if (!data) return EMPTY; // empty plate — cards render zeros with log CTA
    const records = Array.isArray(data) ? data : data.records || [];
    const key = todayKey();
    const today = records.filter((m) => m.logged_at && String(m.logged_at).startsWith(key));
    return {
      kcal: Math.round(sum(today, 'calories')),
      protein: Math.round(sum(today, 'protein')),
      carbs: Math.round(sum(today, 'carbs')),
      fat: Math.round(sum(today, 'fat')),
      saturated_fat: round1(sum(today, 'saturated_fat')),
      trans_fat: round1(sum(today, 'trans_fat')),
      polyunsaturated_fat: round1(sum(today, 'polyunsaturated_fat')),
      monounsaturated_fat: round1(sum(today, 'monounsaturated_fat')),
      count: today.length,
    };
  }, [data]);

  const refreshMeals = useCallback(async () => {
    if (!userId) return;
    await refetch();
  }, [userId, refetch]);

  return { meals, loading: query.isFetching, refreshMeals };
};
