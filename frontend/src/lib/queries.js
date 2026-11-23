import { apiFetch } from './apiClient.js';

// Shared React Query keys.
export const qk = {
  dashboard: (userId) => ['dashboard', userId],
  todayMeals: (userId) => ['meals', 'today', userId],
  foodLogs: (userId) => ['food-logs', userId],
  nutrientGoals: (userId) => ['nutrient-goals', userId],
  activeGoal: (userId) => ['goals', 'active', userId],
  notifications: (userId) => ['notifications', userId],
  plans: (userId) => ['plans', userId],
  aiSummary: (userId) => ['ai', 'summary', userId],
};

// One fetcher per key, so every hook reading a key gets the same response
// shape and concurrent mounts share ONE request (React Query dedupes by key).
//
// Stale-while-revalidate: staleTime 0 means a revisit renders the cached data
// instantly AND refetches in the background, so data logged on another page
// (e.g. a meal on MealTracker) is never shown stale for long, without having to
// add invalidation calls at every write site. gcTime keeps the cache for the
// session-length default set in queryClient.js.
// Retry once on network/5xx only: a 4xx (e.g. 404 "no goal yet", 401) is a
// real answer, and retrying it just doubles the request.
export const swr = {
  staleTime: 0,
  retry: (failures, error) => failures < 1 && !(error?.status >= 400 && error?.status < 500),
};

export const queryFns = {
  foodLogs: (userId) => () => apiFetch(`/api/food-logs/${userId}`),
  nutrientGoals: (userId) => () => apiFetch(`/api/nutrient-goals/${userId}`),
  activeGoal: (userId) => () => apiFetch(`/api/goals/active/${userId}`),
};
