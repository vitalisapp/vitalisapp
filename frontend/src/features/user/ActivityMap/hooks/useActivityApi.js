import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../../../lib/apiClient.js';
import { qk } from '../../../../lib/queries.js';
import { localTodayIso } from '../../Dashboard/lib/dashboardFormat.js';

const formatTime = (seconds) => {
  const s = parseInt(seconds) || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
};

export const useActivityApi = ({ userId, activeTab, showToast, setRunAnalysis, onSaveSuccess }) => {
  const qc = useQueryClient();
  const [isSaving, setIsSaving]             = useState(false);
  const [history, setHistory]               = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError]     = useState(null);
  const [stats, setStats]                   = useState(null);
  const [statsLoading, setStatsLoading]     = useState(false);
  const [statsError, setStatsError]         = useState(null);

  const fetchHistory = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setHistoryLoading(true);
    setHistoryError(null);
    try {
      const d = await apiGet(`/api/activity/${userId}`);
      setHistory(Array.isArray(d) ? d : []);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      if (!silent) setHistoryLoading(false);
    }
  }, [userId]);

  const fetchStats = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setStatsLoading(true);
    setStatsError(null);
    try {
      // Backend returns { success, stats } — unwrap to the inner object
      // (was set to the wrapper, so the Progress tab read undefined → zeros).
      const d = await apiGet(`/api/activity/stats/${userId}`);
      setStats(d?.stats ?? d ?? null);
    } catch (err) {
      setStatsError(err.message);
    } finally {
      if (!silent) setStatsLoading(false);
    }
  }, [userId]);

  const handleSaveActivity = async ({ finishedMetricsRef, finishedPathRef, finishedSplitsRef, isGps = true }) => {
    if (!userId) { showToast('⚠ Not logged in', 'error'); return; }
    setIsSaving(true);
    try {
      const m = finishedMetricsRef.current;
      const data = await apiPost('/api/activity/save', {
        duration: m.time,
        distance: parseFloat((m.distance || 0).toFixed(2)),
        pace: m.pace,
        calories: m.calories,
        route: finishedPathRef.current,
        is_gps: isGps,
        local_date: localTodayIso(),
      });
      if (!data.success) throw new Error(data.error || 'Save failed');

      // AI run analysis after save (60s: backend LLM cascade, not default 15s)
      const aiData = await apiPost('/api/ai/run-analysis', {
        run: {
          distance: parseFloat((m.distance || 0).toFixed(2)),
          duration: formatTime(m.time),
          pace:     m.pace,
          calories: m.calories,
          splits:   finishedSplitsRef.current,
        },
      }, { timeoutMs: 60000 }).catch(() => null);
      if (aiData && !aiData.error) {
        setRunAnalysis(aiData);
      }

      showToast('✓ Run saved!');
      fetchHistory(true);
      fetchStats(true);
      // Daily burn is derived on read; drop the cached dashboard snapshot so
      // the next visit re-fetches today's totals instead of showing stale 0.
      qc.invalidateQueries({ queryKey: qk.dashboard(userId) });

      // ✅ Reset the map/run view after successful save
      onSaveSuccess?.();

    } catch (err) {
      showToast(`⚠ Save failed — ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const data = await apiDelete(`/api/activity/${id}`);
      if (!data.success) throw new Error(data.error || 'Delete failed');
      showToast('Activity deleted');
      fetchHistory();
      fetchStats(true);
      qc.invalidateQueries({ queryKey: qk.dashboard(userId) });
    } catch (err) {
      showToast(`⚠ Delete failed — ${err.message}`, 'error');
    }
  };

  // Edit path for the PATCH endpoint. Totals are derived on read, so the
  // dashboard cache is dropped here just like on save/delete.
  const handleUpdateActivity = async (id, patch) => {
    const data = await apiPatch(`/api/activity/${id}`, patch);
    if (!data.success) throw new Error(data.error || 'Update failed');
    fetchHistory(true);
    fetchStats(true);
    qc.invalidateQueries({ queryKey: qk.dashboard(userId) });
    showToast('Activity updated');
    return data.activity;
  };

  // Persisted kudos: optimistic flip, reconcile with server, revert on error.
  const toggleKudos = useCallback(async (id) => {
    let prev = null;
    setHistory((h) => {
      prev = h;
      return h.map((a) => (a.id === id
        ? { ...a, kudos_given: !a.kudos_given, kudos_count: (Number(a.kudos_count) || 0) + (a.kudos_given ? -1 : 1) }
        : a));
    });
    try {
      const data = await apiPost(`/api/activity/${id}/kudos`);
      setHistory((h) => h.map((a) => (a.id === id
        ? { ...a, kudos_given: !!data.kudos, kudos_count: Number(data.kudos_count ?? a.kudos_count) }
        : a)));
    } catch (err) {
      if (prev) setHistory(prev);
      showToast(
        err?.status >= 500
          ? '⚠ Kudos unavailable — run `npm run db:migrate` in backend/ and reload.'
          : `⚠ Kudos failed — ${err.message}`,
        'error',
      );
    }
  }, [showToast]);

  // Auto-fetch when tab changes
  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'stats')   fetchStats();
  }, [activeTab, fetchHistory, fetchStats]);

  return {
    isSaving,
    history,
    historyLoading,
    historyError,
    stats,
    statsLoading,
    statsError,
    fetchHistory,
    fetchStats,
    handleSaveActivity,
    handleUpdateActivity,
    handleDelete,
    toggleKudos,
  };
};