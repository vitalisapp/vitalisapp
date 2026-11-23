import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { BottomNav } from '../../../../components/index.js';
import AppShell from '../../../../components/AppShell.jsx';
import PageHeader from '../../../../components/app/PageHeader.jsx';
import Icon from '../../../../components/Icon.jsx';
import usePlans from '../hooks/usePlan.js';
import { apiPatch, apiPost } from '../../../../lib/apiClient.js';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog.jsx';
import { TABS } from '../utils/planFormat.js';
import { TabBar } from '../components/PlanWidgets.jsx';
import PersonalPlanSheet from '../components/PersonalPlanSheet.jsx';
import TrainingPrefsSheet from '../components/TrainingPrefsSheet.jsx';
import AdaptiveTipsCard from '../components/AdaptiveTipsCard.jsx';
import { useTrainingPrefs, useTrainingInsights } from '../hooks/useTrainingPrefs.js';
import { TAB_FILTER_PARAMS } from '../utils/planFilters.js';
import ExerciseLibrary from '../components/ExerciseLibrary.jsx';
import WorkoutHistory from '../components/WorkoutHistory.jsx';
import PlanDetailOverlay from '../components/PlanDetailOverlay.jsx';
import DayTracker from '../components/DayTracker.jsx';
import MyPlans from '../components/MyPlans.jsx';
import Explore from '../components/Explore.jsx';
import '../plans.css';

// MAIN PLANS PAGE COMPONENT
const Plans = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  // Tab lives in the URL (?tab=library) so filters inside a tab are shareable.
  // 'explore' is the default and is kept out of the URL.
  const requestedTab = searchParams.get('tab');
  const activeTab = TABS.some((tab) => tab.id === requestedTab) ? requestedTab : 'explore';
  const setActiveTab = useCallback((tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if ((next.get('tab') || 'explore') === tab) return next;
      // Filters belong to the tab they were set on.
      TAB_FILTER_PARAMS.forEach((key) => next.delete(key));
      if (tab === 'explore') next.delete('tab');
      else next.set('tab', tab);
      return next;
    });
  }, [setSearchParams]);

  const {
    userId, loading, authError, actionError, actionOk, acting, reload, trainingPlans, enrolledCount, goalStatus,
    detailPlan, trackerPlan, trackerContent, trackerProgress,
    setDetailPlan, setActionError, setActionOk, handleEnroll, createPersonal, updatePersonal, autoFromGoal, activatePlan, removePersonal, startTracker: loadTracker, handleCompleteDay, closeTracker,
  } = usePlans();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  // Module 5 — preferences + adaptive tips (silent on failure).
  const prefsCtl = useTrainingPrefs();
  const insightsCtl = useTrainingInsights();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const openCreate = () => { setActionError(null); setActionOk(null); setEditingPlan(null); setSheetOpen(true); };
  const openEdit = (plan) => {
    if (!plan || plan.is_owner !== 1) return;
    setActionError(null); setActionOk(null); setEditingPlan(plan); setSheetOpen(true);
  };
  const closeSheet = () => { setSheetOpen(false); setEditingPlan(null); };

  // Module 5 — save training preferences, then surface server feedback via the
  // page's normal action banner (same pattern as create/edit).
  const handleSavePrefs = async (body, opts = {}) => {
    try {
      const saved = await prefsCtl.save(body);
      // Section 3: experience lives on the goal (saved in place, no new goal).
      if (opts.experience && opts.experience !== goalStatus?.goal?.experienceLevel && userId) {
        try { await apiPatch(`/api/goals/active/${userId}`, { experienceLevel: opts.experience }); } catch { /* prefs still saved */ }
      }
      setActionError(null);
      if (opts.rebuild && goalStatus?.goal) {
        await autoFromGoal({ all: true, regenerate: true });
      } else {
        await reload();
        setActionOk('Training preferences saved. Use "Rebuild" on your goal plans to apply them.');
      }
      return saved ?? {};
    } catch (e) {
      setActionOk(null);
      setActionError(e.message || 'Could not save training preferences');
      return null;
    }
  };

  // Module 5 — one-click Apply of an adaptive tip (mode 'shorter' | 'gentle').
  const handleApplyTip = async (mode) => {
    const msg = await insightsCtl.apply(mode);
    if (msg) {
      setActionError(null);
      setActionOk(msg);
      await reload();
      await insightsCtl.reload();
    } else {
      setActionOk(null);
      setActionError('Could not adjust the plan — is a plan linked to your active goal?');
    }
    return null;
  };

  const handleSaveEdit = async (planId, patch) => {
    const saved = await updatePersonal(planId, patch);
    if (saved) closeSheet();
    return saved;
  };

  // Legacy deep link `?mine=1` (Dashboard, Onboarding) -> canonical `?tab=my-plans`.
  useEffect(() => {
    if (searchParams.get('mine') !== '1') return;
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.delete('mine');
      next.set('tab', 'my-plans');
      return next;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

  // Consume router state through the router, before refreshes can replay it.
  const consumedTrackerEntry = useRef(null);
  useEffect(() => {
    const openTrackerId = location.state?.openTracker;
    if (!openTrackerId || consumedTrackerEntry.current === location.key || loading || trainingPlans.length === 0) return;
    const plan = trainingPlans.find(p => String(p.id) === String(openTrackerId));
    if (plan) {
      consumedTrackerEntry.current = location.key;
      setTrackerStart(null);
      loadTracker(plan);
      const nextState = { ...location.state };
      delete nextState.openTracker;
      // One navigation: switch to My Plans and drop the router state together
      // (a separate setActiveTab would be overwritten by the stale search).
      const search = new URLSearchParams(location.search);
      TAB_FILTER_PARAMS.forEach((key) => search.delete(key));
      search.set('tab', 'my-plans');
      navigate({ pathname: location.pathname, search: `?${search}`, hash: location.hash }, { replace: true, state: nextState });
    }
  }, [location, trainingPlans, loading, loadTracker, navigate]);

  const requestedPlanId = searchParams.get('planId');
  const requestedDay    = Number(searchParams.get('startDay')) || null;
  const requestedFit    = Number(searchParams.get('fit')) || null;
  const [trackerStart, setTrackerStart] = useState(null); // Section 4: coach Start -> day + minutes
  const startTracker = (plan) => {
    setTrackerStart(null);
    loadTracker(plan);
  };
  const autoOpenedRef   = useRef(false);
  // Consume ?planId=&startDay=&fit= without touching tab/filter params.
  const clearPlanDeepLink = () => setSearchParams((params) => {
    const next = new URLSearchParams(params);
    ['planId', 'startDay', 'fit'].forEach((key) => next.delete(key));
    return next;
  }, { replace: true });
  useEffect(() => {
    if (!requestedPlanId) {
      autoOpenedRef.current = false;
      return;
    }
    if (!requestedPlanId || autoOpenedRef.current || loading) return;
    const match = trainingPlans.find(p => String(p.id) === String(requestedPlanId));
    if (match && requestedDay) {
      setTrackerStart({ day: requestedDay, fit: requestedFit });
      loadTracker(match);
      autoOpenedRef.current = true;
      clearPlanDeepLink();
    } else if (match) {
      setDetailPlan(match);
      autoOpenedRef.current = true;
      clearPlanDeepLink();
    }
  }, [requestedPlanId, trainingPlans, loading, setDetailPlan, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnrollAndSwitch = async (planId) => {
    await handleEnroll(planId);
    setActiveTab('my-plans');
  };

  const handleGenerateAndSwitch = async (body) => {
    const data = await autoFromGoal(body);
    if (data?.planId) setActiveTab('my-plans');
  };

  // Section 3: add/remove one exercise from the "don't recommend" list.
  const handleToggleExclude = async (name, excluded) => {
    try {
      await apiPost('/api/training-preferences/exclude-exercise', { name, excluded });
      await prefsCtl.reload();
      setActionError(null);
      setActionOk(excluded
        ? `${name} won't be recommended again. Rebuild your goal plans to swap it out.`
        : `${name} can be recommended again.`);
    } catch (e) {
      setActionError(e?.message || 'Could not update your exercise list.');
    }
  };

  const handleDelete = (plan) => {
    if (!plan || plan.is_owner !== 1) return;
    setDeleteError('');
    setDeleteTarget(plan);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const ok = await removePersonal(deleteTarget.id);
      if (ok) setDeleteTarget(null);
      else setDeleteError('Could not delete this plan. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError('');
  };

  return (
    <AppShell mobileTitle="Plans" contentClassName="app-container plans-container" bottomNav={<BottomNav variant="biometrics" />}>
        <div className="vplans min-w-0">
          <PageHeader
            className="plans-page-head"
            eyebrow="Training plans"
            title={<>Find your <em>fitness plan</em></>}
            description="Discover programs built around your goal, equipment and schedule."
            actions={(
              <>
                {enrolledCount > 0 && (
                  <div className="flex items-center gap-2 rounded-full px-3.5 py-2 border" style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}>
                    <Icon name="trophy" className="text-[length:var(--fs-16)] shrink-0" style={{ color: 'var(--accent)' }} fill={1} />
                    <span className="text-[12px] font-bold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                      {enrolledCount} plan{enrolledCount !== 1 ? 's' : ''} active
                    </span>
                  </div>
                )}
                {/* Module 5 — training preferences (equipment/days/minutes). */}
                <button
                  type="button"
                  onClick={() => setPrefsOpen(true)}
                  title="Training preferences — equipment, training days, session minutes"
                  className="flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-[11.5px] font-bold transition-all hover:border-[var(--accent-border)]"
                  style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}
                >
                  <Icon name="tune" className="text-[length:var(--fs-15)]" />
                  <span className="hidden sm:inline">Preferences</span>
                </button>
                <button type="button" onClick={openCreate} className="app-btn app-btn--primary">
                  + New plan
                </button>
              </>
            )}
          />

          <TabBar active={activeTab} onChange={setActiveTab} enrolledCount={enrolledCount} />

          {actionError ? (
            <p role="alert" className="p-alert p-alert--error">{actionError}</p>
          ) : null}
          {actionOk ? (
            <p role="status" className="p-alert p-alert--ok">{actionOk}</p>
          ) : null}

          {loading ? (
            <div aria-busy="true" aria-label="Loading plans">
              <div className="p-skeleton-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div className="p-skel" key={i}>
                    <div className="p-skel-cover" />
                    <div className="p-skel-body">
                      <div className="p-skel-line" style={{ width: '78%' }} />
                      <div className="p-skel-line p-skel-line--sm" />
                      <div className="p-skel-line" style={{ width: '88%' }} />
                      <div className="p-skel-line p-skel-line--btn" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : authError ? (
            <div className="p-empty" role="alert">
              <span className="p-empty-icon" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>
                <Icon name="error" />
              </span>
              <p className="p-empty-title">Couldn't load your plans</p>
              <p className="p-empty-text">{authError}</p>
              <div className="p-empty-actions">
                <button type="button" onClick={reload} className="p-banner-btn p-banner-btn--accent">
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'my-plans' && (
                <>
                  <AdaptiveTipsCard
                    tips={insightsCtl.tips}
                    loading={insightsCtl.loading}
                    applying={insightsCtl.applying}
                    onApply={handleApplyTip}
                  />
                  <MyPlans
                    plans={trainingPlans}
                    goalStatus={goalStatus}
                    onOpen={setDetailPlan}
                    onContinue={startTracker}
                    onCreateClick={openCreate}
                    onGenerate={handleGenerateAndSwitch}
                    onDelete={handleDelete}
                    onEdit={openEdit}
                    generating={acting}
                    prefs={prefsCtl.prefs}
                    onOpenPrefs={() => setPrefsOpen(true)}
                    onGenerateGoal={handleGenerateAndSwitch}
                    onActivate={activatePlan}
                  />
                </>
              )}
              {activeTab === 'explore'  && <Explore  plans={trainingPlans} onOpen={setDetailPlan} onEnroll={handleEnrollAndSwitch} onContinue={startTracker} />}
              {activeTab === 'library'  && <ExerciseLibrary />}
              {activeTab === 'history'  && <WorkoutHistory onBrowse={() => setActiveTab('library')} />}
            </>
          )}

      {detailPlan && (
        <PlanDetailOverlay
          plan={detailPlan}
          onClose={() => setDetailPlan(null)}
          onStart={() => {
            if (detailPlan.is_enrolled === 1) {
              startTracker(detailPlan);
            } else {
              handleEnrollAndSwitch(detailPlan.id);
              setDetailPlan(null);
            }
          }}
        />
      )}

      {trackerPlan && (
        <DayTracker
          plan={trackerPlan}
          content={trackerContent}
          progress={trackerProgress}
          onClose={closeTracker}
          onCompleteDay={handleCompleteDay}
          prefs={prefsCtl.prefs}
          onToggleExclude={handleToggleExclude}
          startDay={trackerStart?.day}
          startFit={trackerStart?.fit}
        />
      )}

      {/* Module 5 — training preferences editor (equipment/days/minutes/local). */}
      <TrainingPrefsSheet
        key={prefsOpen ? 'prefs-open' : 'prefs-closed'}
        open={prefsOpen}
        preferences={prefsCtl.prefs}
        options={prefsCtl.options}
        experience={goalStatus?.goal?.experienceLevel || null}
        onClose={() => setPrefsOpen(false)}
        onSave={handleSavePrefs}
      />

      <PersonalPlanSheet
        key={editingPlan ? `edit-${editingPlan.id}` : (sheetOpen ? 'open' : 'closed')}
        open={sheetOpen}
        onClose={closeSheet}
        acting={acting}
        error={actionError}
        onCreate={createPersonal}
        onGenerate={autoFromGoal}
        initial={editingPlan}
        onSave={handleSaveEdit}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={closeDelete}
        onConfirm={confirmDelete}
        title="Delete this plan?"
        message={`“${deleteTarget?.title || 'This plan'}” and all of its days and progress will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete plan"
        cancelLabel="Keep plan"
        tone="danger"
        icon="delete"
        busy={deleting}
        error={deleteError}
      />

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        .vplans input::placeholder { color: var(--text-muted); opacity: 1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      </div>
    </AppShell>
  );
};

export default Plans;
