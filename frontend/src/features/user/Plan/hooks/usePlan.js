import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../../../lib/apiClient.js';

const usePlans = () => {
  const [userId, setUserId]               = useState(null);
  const [authChecked, setAuthChecked]     = useState(false);
  const [authError, setAuthError]         = useState(null);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [goalStatus, setGoalStatus]       = useState({ goal: null, linkedPlan: null });
  const [actionError, setActionError]     = useState(null);
  const [actionOk, setActionOk]           = useState(null);
  const [acting, setActing]               = useState(false);

  const [detailPlan,      setDetailPlan]      = useState(null);
  const [trackerPlan,     setTrackerPlan]     = useState(null);
  const [trackerContent,  setTrackerContent]  = useState([]);
  const [trackerProgress, setTrackerProgress] = useState([]);
  const trackerRequest = useRef(0);
  useEffect(() => () => { trackerRequest.current += 1; }, []);

  // ── Auth: get current user via cookie session ──────────────────
  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await apiGet('/api/auth/me');

        // The id might come back under a few different shapes depending
        // on how the auth route is implemented - try the common ones
        // instead of assuming `data.id`.
        const resolvedId =
          data?.id ?? data?.userId ?? data?.user?.id ?? data?.user?.userId ?? null;

        if (!resolvedId) {
          if (import.meta.env.DEV) console.warn('Could not find a user id in /api/auth/me response:', data);
          setAuthError('Logged-in user id was missing from the server response.');
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        setUserId(resolvedId);
        setAuthChecked(true);
      } catch (err) {
        if (import.meta.env.DEV) console.error('Auth error:', err);
        setAuthError('Could not reach the authentication endpoint.');
        setLoading(false);
        setAuthChecked(true);
      }
    };
    getUser();
  }, []);

  // ── Fetch all plans with enrollment status ─────────────────────
  const fetchMarketplace = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await apiGet(`/api/plans/${userId}`);
      setTrainingPlans(data);
      setAuthError(null);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Marketplace Sync Error:', err);
      setAuthError('Could not load plans from the server.');
    } finally {
      setLoading(false);
    }
    // Goal link is best-effort — plans still render when goals are unreachable.
    try {
      const gs = await apiGet(`/api/plans/goal-status/${userId}`);
      setGoalStatus({ goal: gs?.goal || null, linkedPlan: gs?.linkedPlan || null, goalPlans: Array.isArray(gs?.goalPlans) ? gs.goalPlans : [] });
    } catch {
      setGoalStatus({ goal: null, linkedPlan: null });
    }
  }, [userId]);

  useEffect(() => {
    fetchMarketplace();
  }, [fetchMarketplace]);

  // ── Enroll in a plan ───────────────────────────────────────────
  // Returns true on success. Failures (e.g. LEVEL_LOCKED for an Advanced /
  // Extreme plan) are shown to the user instead of being swallowed.
  const handleEnroll = async (planId) => {
    try {
      await apiPost('/api/plans/enroll', { planId });
      await fetchMarketplace();
      return true;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Enrollment failed:', err);
      if (err?.code === 'ALREADY_ENROLLED') { await fetchMarketplace(); return true; }
      setActionError(err?.message || 'Could not start this plan.');
      return false;
    }
  };

  // ── Open the day tracker for a plan ───────────────────────────
  const startTracker = useCallback(async (plan) => {
    const request = ++trackerRequest.current;
    setDetailPlan(null);
    setActionError(null);
    try {
      const [content, progress] = await Promise.all([
        apiGet(`/api/plans/content/${plan.id}`),
        apiGet(`/api/plans/progress/${userId}/${plan.id}`),
      ]);
      if (request !== trackerRequest.current) return;
      setTrackerContent(content);
      setTrackerProgress(progress);
      setTrackerPlan(plan);
    } catch (err) {
      if (request !== trackerRequest.current) return;
      setActionError('Could not open this plan. Please try again.');
      if (import.meta.env.DEV) console.error('Tracker load error:', err);
    }
  }, [userId]);

  // ── Mark a day complete (optimistic update) ────────────────────
  const handleCompleteDay = async (dayNumber) => {
    // Optimistic update
    setTrackerProgress(prev => {
      const exists = prev.find(p => p.day_number === dayNumber);
      if (exists) {
        return prev.map(p =>
          p.day_number === dayNumber ? { ...p, is_completed: 1 } : p
        );
      }
      return [...prev, { day_number: dayNumber, is_completed: 1 }];
    });

    try {
      await apiPost('/api/plans/progress/complete', { planId: trackerPlan.id, dayNumber });
    } catch (err) {
      if (import.meta.env.DEV) console.error('Complete day error:', err);
      // Rollback optimistic update on failure
      setTrackerProgress(prev =>
        prev.map(p =>
          p.day_number === dayNumber ? { ...p, is_completed: 0 } : p
        )
      );
    }
  };

  // ── Create a personal plan (user-owned, auto-enrolled) ──────────
  const createPersonal = async ({ title, tag, intensity, targetFocus, durationDays, description }) => {
    setActing(true); setActionError(null); setActionOk(null);
    try {
      const data = await apiPost('/api/plans', {
        title, tag, intensity, targetFocus, durationDays, description,
      });
      setActionOk('Plan created — find it in My Plans.');
      await fetchMarketplace();
      return data;
    } catch (err) {
      setActionError(err?.message || 'Could not create plan. Try again.');
      return null;
    } finally {
      setActing(false);
    }
  };

  // ── Update a personal plan (owner only; duration stays fixed so days/progress keep matching)
  const updatePersonal = async (planId, patch) => {
    setActing(true); setActionError(null); setActionOk(null);
    try {
      const data = await apiPatch(`/api/plans/${planId}`, patch);
      setActionOk('Plan updated.');
      await fetchMarketplace();
      return data;
    } catch (err) {
      setActionError(err?.message || 'Could not update plan. Try again.');
      return null;
    } finally {
      setActing(false);
    }
  };

  // ── Generate a 7-day starter from the active onboarding goal ────
  // body: { goalType, regenerate, all, makeActive } — all optional. Guard
  // against being wired straight to onClick (a click event is not a body).
  const autoFromGoal = async (body) => {
    const payload = body && typeof body === 'object' && !('nativeEvent' in body) && !('target' in body) ? body : {};
    setActing(true); setActionError(null); setActionOk(null);
    try {
      const data = await apiPost('/api/plans/auto-from-goal', payload);
      setActionOk(
        payload.regenerate ? 'Your recommended plans were rebuilt with your latest settings.'
          : data?.created === false ? 'Your goal plan is already in My Plans.'
            : 'Recommended plan created — find it in My Plans.'
      );
      await fetchMarketplace();
      return data;
    } catch (err) {
      setActionError(err?.message || 'Could not generate plan. Complete onboarding first.');
      return null;
    } finally {
      setActing(false);
    }
  };

  // ── Make a plan the active plan for the goal (Section 3)
  const activatePlan = async (planId) => {
    setActing(true); setActionError(null); setActionOk(null);
    try {
      const data = await apiPost(`/api/plans/${planId}/activate`, {});
      setActionOk(`${data?.title || 'Plan'} is now your active plan.`);
      await fetchMarketplace();
      return data;
    } catch (err) {
      setActionError(err?.message || 'Could not switch your active plan.');
      return null;
    } finally {
      setActing(false);
    }
  };

  // ── Delete a personal plan (owner only; templates are server-guarded)
  const removePersonal = async (planId) => {
    setActing(true); setActionError(null); setActionOk(null);
    try {
      await apiDelete(`/api/plans/${planId}`);
      setActionOk('Plan deleted.');
      await fetchMarketplace();
      return true;
    } catch (err) {
      setActionError(err?.message || 'Could not delete plan.');
      return false;
    } finally {
      setActing(false);
    }
  };

  // ── Close tracker and refresh plans ───────────────────────────
  const closeTracker = () => {
    trackerRequest.current += 1;
    setTrackerPlan(null);
    setTrackerContent([]);
    setTrackerProgress([]);
    fetchMarketplace();
  };

  // ── Derived state ──────────────────────────────────────────────
  const enrolledCount = trainingPlans.filter(p => p.is_enrolled === 1).length;

  return {
    userId,
    loading,
    authChecked,
    authError,
    actionError,
    actionOk,
    acting,
    reload: fetchMarketplace,
    trainingPlans,
    enrolledCount,
    goalStatus,
    detailPlan,
    trackerPlan,
    trackerContent,
    trackerProgress,
    setDetailPlan,
    setActionError,
    setActionOk,
    handleEnroll,
    createPersonal,
    updatePersonal,
    autoFromGoal,
    activatePlan,
    removePersonal,
    startTracker,
    handleCompleteDay,
    closeTracker,
  };
};

export default usePlans;
