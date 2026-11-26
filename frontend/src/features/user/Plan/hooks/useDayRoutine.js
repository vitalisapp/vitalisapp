import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../../lib/apiClient.js';
import { swr } from '../../../../lib/queries.js';

// Personalized warm-up + cool-down for one plan day (Revision #3). Cached per
// plan/day so switching days back and forth doesn't refetch; the routine only
// changes when the user's level, goals or exclusions change.
export function useDayRoutine(planId, dayNumber, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['plan-routine', String(planId ?? ''), Number(dayNumber) || 0],
    queryFn: () => apiGet(`/api/plans/${encodeURIComponent(planId)}/days/${Number(dayNumber)}/routine`),
    enabled: Boolean(enabled && planId && Number(dayNumber) > 0),
    staleTime: 5 * 60 * 1000,
    retry: swr.retry,
  });
}
