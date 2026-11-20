import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch, apiPost } from '../../../../lib/apiClient.js';
import { acquireSocket, releaseSocket, joinUserRoom } from '../../../../lib/socket.js';
import { localTodayIso } from '../lib/dashboardFormat.js';

export const useDashboardData = (USER_ID) => {
  const [data, setData]             = useState({ stats: {}, profile: {} });
  const [insights, setInsights]     = useState([]);
  const [workouts, setWorkouts]     = useState([]);
  const [dashboardError, setDashboardError] = useState(null);
  const [loaded, setLoaded]         = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Best-effort post-log AI refresh: never throws or blocks the UI.
  const generateFitnessInsight = useCallback(async (newStats) => {
    if (!USER_ID) return;
    try {
      const res = await apiPost('/api/ai/analysis', {
        stats: {
          calories_burned: Number(newStats?.calories_burned) || 0,
          steps: Number(newStats?.steps) || 0,
          workout_duration_mins: Number(newStats?.workout_duration_mins) || 0,
        },
      }, { timeoutMs: 60000 }).catch(() => null);
      if (res?.insights?.length) setInsights(res.insights);
    } catch {
      /* dashboard already shows fresh DB stats without AI text */
    }
  }, [USER_ID]);

  const authOverrideRef = useRef({ name: null, avatar: null });

  const setAuthOverride = useCallback((name, avatar) => {
    authOverrideRef.current = { name, avatar };
    setData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...(name   && { name }),
        ...(avatar && { avatar_url: avatar }),
      },
    }));
  }, []);

  // Auth values always win over API values.
  const mergeData = (apiResult) => ({
    ...apiResult,
    profile: {
      ...apiResult.profile,
      ...(authOverrideRef.current.name   && { name:       authOverrideRef.current.name }),
      ...(authOverrideRef.current.avatar && { avatar_url: authOverrideRef.current.avatar }),
    },
  });

  useEffect(() => {
    if (!USER_ID) return;

    // Independent signals so one abort doesn't cancel the other parallel fetches.
    const controllers = new Set();
    const trackFetch = (path, opts = {}) => {
      const c = new AbortController();
      controllers.add(c);
      return apiFetch(path, { ...opts, signal: c.signal }).finally(() => controllers.delete(c));
    };
    const socket = acquireSocket();

    const fetchDashboardData = async (isRetry = false) => {
      try {
        // Workout 404s fall back to empty; dashboard errors still surface.
        const [result, workoutData] = await Promise.all([
          trackFetch(`/api/dashboard/${USER_ID}?today=${localTodayIso()}`),
          trackFetch(`/api/workout-logs`).catch(() => ({ logs: [] })),
        ]);

        setData(mergeData(result));

        const logs = Array.isArray(workoutData?.logs) ? workoutData.logs : [];
        setWorkouts(logs);

        if (result.insights) setInsights(result.insights);
        setDashboardError(null);
        setLoaded(true);

      } catch (error) {
        if (controllers.size === 0) return; // unmounted
        const isNetwork = error?.status === 0 || error?.code === 'TIMEOUT';
        if (isNetwork && !isRetry) {
          await new Promise((r) => setTimeout(r, 1500));
          return fetchDashboardData(true);
        }
        let hint = error;
        if (isNetwork) {
          try {
            await trackFetch('/api/health', { skipAuthRedirect: true, timeoutMs: 5000 });
            hint = new Error('Dashboard request timed out, but the server is up. It may be a slow query — try again.');
          } catch {
            hint = new Error("Backend unreachable. Start it with 'npm run dev' in backend/ and check VITE_API_URL.");
          }
          hint.cause = error;
        }
        setDashboardError(hint);
        setLoaded(true);
        if (import.meta.env.DEV) {
          console.error('Fetch Error:', error);
        }
      }
    };

    fetchDashboardData();
    joinUserRoom(USER_ID);

    const handleNewInsight = (insight) => {
      setInsights(prev => [insight, ...prev].slice(0, 5));
    };

    // New event name; legacy 'new-clinical-insight' kept for backward compatibility.
    socket.on('new-fitness-insight',  handleNewInsight);
    socket.on('new-clinical-insight', handleNewInsight);

    return () => {
      for (const c of [...controllers]) { try { c.abort(); } catch { /* noop */ } }
      controllers.clear();
      socket.off('new-fitness-insight',  handleNewInsight);
      socket.off('new-clinical-insight', handleNewInsight);
      releaseSocket();
    };
  }, [USER_ID, refreshKey]);

  return {
    data,
    insights,
    workouts,
    dashboardError,
    loaded,
    setData,
    setInsights,
    setAuthOverride,
    mergeData,
    refresh,
    generateFitnessInsight,
    // Aliases kept so older callers using generateAiInsight/generateClinicalInsight keep working
    generateAiInsight: generateFitnessInsight,
    generateClinicalInsight: generateFitnessInsight,
  };
};
