import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { qk, queryFns, swr } from '../../../../lib/queries.js';

// Single source for the active goal — dashboard, nutrition, progress and AI
// all read from here so the selected goal drives the whole system.
// Backed by React Query: every mounted consumer shares one request, and a
// revisit renders the cached goal instantly while it refreshes.
export const useActiveGoal = (userId) => {
  const query = useQuery({
    queryKey: qk.activeGoal(userId),
    queryFn: queryFns.activeGoal(userId),
    enabled: Boolean(userId),
    ...swr,
  });
  const { refetch } = query;
  const data = query.data;

  // Same contract as before: resolves after the reload, never throws
  // (no goal yet -> consumers render their empty states).
  const refresh = useCallback(async () => {
    if (!userId) return;
    await refetch();
  }, [userId, refetch]);

  return {
    goal: data?.goal || null,
    currentWeightKg: data?.currentWeightKg ?? null,
    progressPct: data?.progressPct ?? null,
    loading: query.isFetching,
    // True only for the very first load (no cached answer yet).
    initialLoading: query.isLoading,
    refresh,
  };
};
