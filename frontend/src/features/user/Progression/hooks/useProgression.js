import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../../../lib/apiClient.js';
import { swr } from '../../../../lib/queries.js';
import { useAuth } from '../../../../hooks/useAuth.jsx';

export const progressionKey = (userId) => ['progression', String(userId ?? '')];

// Levels, unlock requirements and challenges (Revision #4). One shared query:
// the Plans tab, the plan cards and the celebration read the same response.
// 503 NEEDS_MIGRATION_061 → `unavailable` (nothing is locked server-side).
export function useProgression({ enabled = true } = {}) {
  const { user } = useAuth();
  const userId = user?.id ?? user?.userId ?? null;
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: progressionKey(userId),
    queryFn: () => apiGet('/api/progression'),
    enabled: Boolean(enabled && userId),
    staleTime: 30 * 1000,
    retry: swr.retry,
  });

  const refresh = useCallback(() => qc.invalidateQueries({ queryKey: progressionKey(userId) }), [qc, userId]);

  const markSeen = useCallback(async () => {
    // Optimistic: never show the same celebration twice.
    qc.setQueryData(progressionKey(userId), (old) => (old ? { ...old, celebrate: false, newlyUnlocked: [], seenLevel: old.level } : old));
    try {
      await apiPost('/api/progression/seen', {});
    } catch {
      /* the next fetch will retry the celebration */
    }
  }, [qc, userId]);

  return {
    progression: query.data || null,
    loading: query.isPending && query.fetchStatus !== 'idle',
    error: query.isError ? query.error : null,
    unavailable: query.error?.code === 'NEEDS_MIGRATION_061' || query.error?.status === 503,
    refresh,
    markSeen,
  };
}

/** Invalidate progression from places that change readiness (workouts, feedback). */
export function useRefreshProgression() {
  const { user } = useAuth();
  const userId = user?.id ?? user?.userId ?? null;
  const qc = useQueryClient();
  return useCallback(() => qc.invalidateQueries({ queryKey: progressionKey(userId) }), [qc, userId]);
}
