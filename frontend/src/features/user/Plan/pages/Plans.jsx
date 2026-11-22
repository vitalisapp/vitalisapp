import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { BottomNav } from '../../../../components/index.js';
import AppShell from '../../../../components/AppShell.jsx';
import PageHeader from '../../../../components/app/PageHeader.jsx';
import Icon from '../../../../components/Icon.jsx';
import usePlans from '../hooks/usePlan.js';
import { BRYL_CREDIT, frameUrl, getAllGuideExercises, guideFilterOptions, isHoldExercise, prescriptionForGuide, searchGuideExercises } from '../../CameraWorkout/constants/workoutGuide.js';
import { apiGet, apiPatch, apiPost } from '../../../../lib/apiClient.js';
import Dropdown from '../../../../components/ui/Dropdown.jsx';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog.jsx';
import {
  formatExerciseDetail,
  REST_ACTIVITY_TYPES,
  INTENSITY_OPTIONS,
  FOCUS_OPTIONS,
  DURATION_OPTIONS,
  CATEGORIES,
  TABS,
} from '../utils/planFormat.js';
import { PlanCover, FilterPill, PlanCard, PlanActions, TabBar } from '../components/PlanWidgets.jsx';
import PersonalPlanSheet from '../components/PersonalPlanSheet.jsx';
import TrainingPrefsSheet from '../components/TrainingPrefsSheet.jsx';
import AdaptiveTipsCard from '../components/AdaptiveTipsCard.jsx';
import GoalPlansPanel from '../components/GoalPlansPanel.jsx';
import ExerciseGuideModal from '../components/ExerciseGuideModal.jsx';
import { useTrainingPrefs, useTrainingInsights } from '../hooks/useTrainingPrefs.js';
import { muscleFor, summarizeMuscles, suggestAlternatives } from '../utils/exerciseMatch.js';
import { fitDayToMinutes } from '../utils/sessionFit.js';
import '../plans.css';


const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [equipment, setEquipment] = useState('');
  const [muscle, setMuscle] = useState('');
  const [type, setType] = useState('');
  const [openSlug, setOpenSlug] = useState(null);
  const filters = useMemo(() => guideFilterOptions(), []);
  const results = useMemo(
    () => searchGuideExercises(query, {
      ...(equipment ? { equipment } : {}),
      ...(muscle ? { primaryMuscle: muscle } : {}),
      ...(type ? { exerciseType: type } : {}),
    }),
    [query, equipment, muscle, type]
  );
  const total = getAllGuideExercises().length;
  const open = openSlug ? getAllGuideExercises().find(e => e.slug === openSlug) : null;
  const openRx = open ? prescriptionForGuide(open) : null;
  return (
    <div>
      <p className="text-[length:var(--fs-10)] font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-muted)' }}>Search</p>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, equipment, or muscle"
        className="w-full h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] px-4 text-[length:var(--fs-13)] outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-disabled)]" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
        {[
          { label: 'Equipment', value: equipment, set: setEquipment, options: filters.equipment, all: 'All equipment' },
          { label: 'Muscle', value: muscle, set: setMuscle, options: filters.muscles, all: 'All muscles' },
          { label: 'Type', value: type, set: setType, options: filters.types, all: 'All types' },
        ].map(f => (
          <Dropdown
            key={f.label}
            label={f.label}
            value={f.value}
            onChange={f.set}
            options={f.options}
            allLabel={f.all}
          />
        ))}
      </div>
      <p className="text-[length:var(--fs-11)] mt-3 mb-3" style={{ color: 'var(--text-muted)' }}>
        {results.length === total && !query && !equipment && !muscle && !type
          ? `Showing all ${total} exercises`
          : `Showing ${results.length} of ${total} exercises`}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch">
        {results.map(ex => {
          return (
          <button key={ex.slug} onClick={() => setOpenSlug(ex.slug)}
            className="text-left rounded-[20px] border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--accent-border)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] glass-card h-full"
            style={{ borderColor: 'var(--border-light)' }}>
            <span className="block aspect-[4/3] w-full" style={{ background: '#1E1E1E' }}>
              {frameUrl(ex.slug, 1)
                ? <img src={frameUrl(ex.slug, 1)} alt={ex.name} className="w-full h-full object-contain p-4" loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                : <span className="w-full h-full flex items-center justify-center material-symbols-outlined text-[length:var(--fs-40)] text-white">fitness_center</span>}
            </span>
            <span className="block p-4">
              <span className="block text-[length:var(--fs-15)] font-black" style={{ color: 'var(--text-primary)' }}>{ex.name}</span>
              <span className="block text-[length:var(--fs-12)] mt-0.5" style={{ color: 'var(--text-muted)' }}>{ex.primaryMuscle} - {ex.equipment}</span>
            </span>
          </button>
          );
        })}
      </div>
      <p className="text-[length:var(--fs-10)] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {BRYL_CREDIT}
      </p>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto"
          style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)' }}
          onClick={() => setOpenSlug(null)}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
                style={{ background: '#1E1E1E' }}>
                {frameUrl(open.slug, 1)
                  ? <img src={frameUrl(open.slug, 1)} alt={open.name} className="w-full h-full object-contain p-1"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  : <Icon name="fitness_center" className="text-[length:var(--fs-22)]" style={{ color: '#fff' }} />}
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-black truncate" style={{ color: 'var(--text-primary)' }}>{open.name}</h3>
                <p className="text-[length:var(--fs-11)]" style={{ color: 'var(--text-muted)' }}>
                  {open.primaryMuscle} · {open.equipment} · {isHoldExercise(open) ? 'Hold (timer)' : 'Reps (camera count)'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3].map(f => (
                frameUrl(open.slug, f)
                  ? <img key={f} src={frameUrl(open.slug, f)} alt={`${open.name} frame ${f}`} className="w-1/3 aspect-square object-contain rounded-xl border p-1" style={{ borderColor: 'var(--border-light)', background: '#1E1E1E' }} loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  : null
              ))}
            </div>
            <p className="text-[length:var(--fs-11)] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
              {isHoldExercise(open) ? 'Hold steady in frame to time' : 'Full range counts a rep'}
            </p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {(open.secondaryMuscles || []).length ? `Also works: ${open.secondaryMuscles.join(', ')}.` : 'Follow the guide frames and keep your form.'}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-5 text-center">
              {[['Sets', openRx.sets], ['Target', openRx.reps], ['Gear', openRx.weight]].map(([l, v]) => (
                <div key={l} className="rounded-xl p-3 border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}>
                  <p className="text-[length:var(--fs-9)] font-black uppercase" style={{ color: 'var(--text-muted)' }}>{l}</p>
                  <p className="text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setOpenSlug(null)}
                className="flex-1 py-3 rounded-xl font-bold text-sm border"
                style={{ borderColor: 'var(--border-medium)', color: 'var(--text-muted)' }}>
                Close
              </button>
              <button onClick={() => navigate('/dashboard/workouts', { state: { exerciseId: open.slug } })}
                className="flex-1 py-3 rounded-xl font-black text-sm uppercase"
                style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}>
                Start {isHoldExercise(open) ? 'Hold' : 'Workout'}
              </button>
            </div>
            <p className="text-[length:var(--fs-9)] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{BRYL_CREDIT}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── WORKOUT HISTORY: completed camera sessions (spec T) ──
// Display helpers only — the data is the unchanged GET /api/workout-logs list.
const prettyExercise = (type) => {
  const s = String(type || 'Workout').replace(/[_-]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatDuration = (seconds) => {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  if (s === 0) return null;
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h${m % 60 ? ` ${m % 60}m` : ''}`;
};

const historyDayKey = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toDateString() : 'unknown';
};

const historyDayLabel = (key) => {
  if (key === 'unknown') return 'Undated';
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (key === today.toDateString()) return 'Today';
  if (key === yesterday.toDateString()) return 'Yesterday';
  const d = new Date(key);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  });
};

const STATUS_LABEL = {
  completed: 'Completed',
  in_progress: 'In progress',
  paused: 'Paused',
  abandoned: 'Ended early',
  cancelled: 'Cancelled',
};

const WorkoutHistory = ({ onBrowse = undefined }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiGet('/api/workout-logs');
      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => ({
    sessions: logs.length,
    reps: logs.reduce((sum, l) => sum + (Number(l.rep_count) || 0), 0),
    seconds: logs.reduce((sum, l) => sum + (Number(l.duration_seconds) || 0), 0),
  }), [logs]);

  // Group by calendar day, newest first (API order is preserved).
  const days = useMemo(() => {
    const groups = [];
    const index = new Map();
    for (const log of logs) {
      const key = historyDayKey(log.start_time);
      if (!index.has(key)) {
        const g = { key, label: historyDayLabel(key), logs: [] };
        index.set(key, g);
        groups.push(g);
      }
      index.get(key).logs.push(log);
    }
    return groups;
  }, [logs]);

  if (loading) {
    return (
      <div className="wh" aria-busy="true" aria-label="Loading workout history">
        <div className="wh-stats">
          {[0, 1, 2].map((i) => (
            <div key={i} className="wh-stat">
              <span className="wh-skel" style={{ width: 64, height: 10 }} />
              <span className="wh-skel" style={{ width: 48, height: 20, marginTop: 10 }} />
            </div>
          ))}
        </div>
        <div className="wh-list">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="wh-row">
              <span className="wh-skel" style={{ width: 40, height: 40, borderRadius: 12 }} />
              <span style={{ flex: 1, display: 'grid', gap: 8 }}>
                <span className="wh-skel" style={{ width: '40%', height: 12 }} />
                <span className="wh-skel" style={{ width: '26%', height: 10 }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wh-empty">
        <span className="wh-empty-icon"><Icon name="cloud_off" /></span>
        <p className="wh-empty-title">Couldn’t load your history</p>
        <p className="wh-empty-sub">Check your connection and try again.</p>
        <button type="button" className="wh-btn" onClick={load}>Try again</button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="wh-empty">
        <span className="wh-empty-icon"><Icon name="history" /></span>
        <p className="wh-empty-title">No workouts yet</p>
        <p className="wh-empty-sub">Start a camera workout or pick an exercise from the Library.</p>
        {onBrowse && <button type="button" className="wh-btn" onClick={onBrowse}>Browse library</button>}
      </div>
    );
  }

  return (
    <div className="wh">
      <div className="wh-head">
        <h2 className="wh-title">Workout history</h2>
        <span className="wh-sub">
          {logs.length >= 50 ? 'Latest 50 sessions' : `${logs.length} ${logs.length === 1 ? 'session' : 'sessions'}`}
        </span>
      </div>

      <dl className="wh-stats">
        <div className="wh-stat"><dt>Sessions</dt><dd>{summary.sessions}</dd></div>
        <div className="wh-stat"><dt>Total reps</dt><dd>{summary.reps.toLocaleString()}</dd></div>
        <div className="wh-stat"><dt>Active time</dt><dd>{formatDuration(summary.seconds) || '0 min'}</dd></div>
      </dl>

      {days.map((day) => (
        <section key={day.key} className="wh-day" aria-label={day.label}>
          <h3 className="wh-day-label">{day.label}</h3>
          <ul className="wh-list">
            {day.logs.map((log) => {
              const reps = Number(log.rep_count) || 0;
              const duration = formatDuration(log.duration_seconds);
              const status = String(log.status || '').toLowerCase();
              const started = log.start_time ? new Date(log.start_time) : null;
              const time = started && !Number.isNaN(started.getTime())
                ? started.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                : null;
              const meta = [time, duration, log.difficulty_rating ? `Felt ${log.difficulty_rating}/5` : null].filter(Boolean);
              return (
                <li key={log.id} className="wh-row">
                  <span className="wh-icon" aria-hidden="true"><Icon name="exercise" /></span>
                  <div className="wh-main">
                    <p className="wh-name">{prettyExercise(log.workout_type)}</p>
                    <p className="wh-meta">
                      {meta.length ? meta.join(' · ') : '—'}
                      {status && status !== 'completed' && (
                        <span className="wh-status">{STATUS_LABEL[status] || status.replace(/_/g, ' ')}</span>
                      )}
                    </p>
                  </div>
                  <span className={`wh-reps${reps === 0 ? ' is-zero' : ''}`}>
                    <span className="wh-reps-value">{reps}</span>
                    <span className="wh-reps-unit">{reps === 1 ? 'rep' : 'reps'}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

// EXERCISE FORMATTING HELPERS


// PLAN DETAIL OVERLAY COMPONENT
const PlanDetailOverlay = ({ plan = undefined, onClose = undefined, onStart = undefined }) => {
  if (!plan) return null;
  const enrolled = plan.is_enrolled === 1;
  const pct = Math.max(0, Math.min(100, Number(plan.progress_pct) || 0));
  // VITALIS has no payments: every plan is free (legacy seeded prices are ignored).
  const price = 'Free';

  return (
    <div
      className="p-sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${plan.title} details`}
      onClick={onClose}
    >
      <div className="p-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="p-sheet-scroll">
          <div className="p-sheet-cover">
            <PlanCover
              seed={plan.image_seed}
              title={plan.title}
              tag={plan.tag}
              src={plan.image_url}
            />
            <div className="p-cover-badges">
              {plan.tag ? <span className="p-badge p-badge--tag">{plan.tag}</span> : null}
              {enrolled ? <span className="p-badge p-badge--accent">Enrolled</span> : null}
              {plan.is_owner === 1 ? <span className="p-badge">Mine</span> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close plan details"
              className="p-sheet-close"
            >
              <Icon name="close" className="text-[length:var(--fs-18)]" />
            </button>
          </div>

          <div className="p-sheet-body">
            <p className="p-sheet-eyebrow">
              {plan.intensity ? `${plan.intensity} level` : 'Workout plan'}
            </p>
            <h2 className="p-sheet-title">{plan.title}</h2>
            {plan.description ? <p className="p-sheet-desc">{plan.description}</p> : null}

            <div className="p-sheet-stats">
              <div className="p-sheet-stat">
                <p className="p-sheet-stat-label">Duration</p>
                <p className="p-sheet-stat-value">{plan.duration || '—'}</p>
              </div>
              <div className="p-sheet-stat">
                <p className="p-sheet-stat-label">Level</p>
                <p className="p-sheet-stat-value">{plan.intensity || '—'}</p>
              </div>
              <div className="p-sheet-stat">
                <p className="p-sheet-stat-label">Focus</p>
                <p className="p-sheet-stat-value" title={plan.target_focus || ''}>
                  {plan.target_focus || '—'}
                </p>
              </div>
            </div>

            {enrolled && pct > 0 ? (
              <div className="p-sheet-progress">
                <div className="p-sheet-progress-head">
                  <span>Your progress</span>
                  <strong>{pct}%</strong>
                </div>
                <div className="p-progress-track">
                  <div className="p-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ) : null}

            <div className="p-sheet-price">
              <span className="p-sheet-price-value">{price}</span>
              <span className="p-sheet-price-note">
                {enrolled
                  ? 'Already in your plans'
                  : 'Free to start'}
              </span>
            </div>

            <button type="button" onClick={onStart} className="p-sheet-cta">
              <Icon name="play_arrow" className="text-[length:var(--fs-18)]" fill={1} />
              {enrolled ? 'Open plan tracker' : 'Start this plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Module 5 — day-cycling schedule ──────────────────────────────────────────
// Maps training days across the user's preferred weekdays: training day #1 →
// first preferred day, #2 → second, cycling. Rest days are just rest.
const WEEKDAY_LETTERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function mapPlanSchedule(content, preferredDays) {
  const days = Array.isArray(preferredDays) ? preferredDays.filter((d) => Number.isInteger(d)) : [];
  if (days.length === 0 || !Array.isArray(content)) return {};
  const map = {};
  let trainIdx = 0;
  for (const day of content) {
    if (day == null) continue;
    if (REST_ACTIVITY_TYPES.has(day.activity_type)) {
      map[day.day_number] = { isRest: true };
      continue;
    }
    map[day.day_number] = { isRest: false, weekday: Number(days[trainIdx % days.length]) };
    trainIdx += 1;
  }
  return map;
}

// DAY TRACKER COMPONENT
const DayTracker = ({ plan = undefined, content = undefined, progress = undefined, onClose = undefined, onCompleteDay = undefined, prefs = undefined, onToggleExclude = undefined, startDay = null, startFit = null }) => {
  const [guideName, setGuideName] = useState(null);
  const excludedNames = prefs?.excludedExercises || [];
  const navigate = useNavigate();
  const completedDays = progress.filter(p => p.is_completed).map(p => p.day_number);
  const totalDays     = content.length;
  const currentDay    = content.find(d => !completedDays.includes(d.day_number)) || content[0];
  const [activeDay,  setActiveDay]  = useState(
    (startDay && content.some((d) => d.day_number === startDay)) ? startDay : (currentDay?.day_number || 1)
  );
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeDayData = content.find(d => d.day_number === activeDay);
  const isDayComplete = completedDays.includes(activeDay);
  const progressPct   = totalDays > 0 ? Math.round((completedDays.length / totalDays) * 100) : 0;
  const isRestDay = REST_ACTIVITY_TYPES.has(activeDayData?.activity_type);

  // ── Module 5 — fit-to-minutes + alternatives state ─────────────────────────
  const [localFit,  setLocalFit]  = useState(0);       // 0 = full session
  const [altExName, setAltExName] = useState(null);    // alternatives sheet source
  const sessionMins = prefs?.sessionDurationMins ?? null;

  // Trimming is derived (never stored): a fresh budget recomputes safely.
  const trimmedPlan = useMemo(() => (
    localFit ? fitDayToMinutes(activeDayData, localFit) : null
  ), [activeDayData, localFit]);
  const plannedMins = trimmedPlan?.trimmed
    ? trimmedPlan.durationMins
    : (activeDayData?.duration_mins ?? null);
  const fitChoices = useMemo(() => {
    const base = Number(activeDayData?.duration_mins ?? 0);
    const presets = [20, 30, 45, 60];
    const allowed = base > 0 ? presets.filter((m) => m < base) : [];
    // Preselect the user's saved session length when a sensible preset exists.
    if (allowed.length && sessionMins && allowed.includes(Number(sessionMins))) return allowed;
    return allowed;
  }, [activeDayData, sessionMins]);

  useEffect(() => {
    // Reset per-day fit choice; auto-apply the saved session minutes once.
    // Section 4: a coach "lighter week" cap wins for the day it was opened on.
    const budget = startFit && activeDayData?.day_number === startDay ? startFit : sessionMins;
    setLocalFit(budget && Number(activeDayData?.duration_mins ?? 0) > budget ? budget : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDayData?.day_number, activeDayData?.duration_mins]);

  const altList = useMemo(() => (
    altExName ? suggestAlternatives(altExName, prefs?.equipment ?? []) : []
  ), [altExName, prefs]);

  const muscleTags = useMemo(() => summarizeMuscles(activeDayData?.exercises), [activeDayData]);

  const activeExercises = trimmedPlan?.trimmed ? trimmedPlan.exercises : activeDayData?.exercises;

  // Day-cycling schedule: which weekday each plan day is suggested on.
  const daySchedule = useMemo(() => mapPlanSchedule(content, prefs?.preferredDays), [content, prefs]);
  const todayWeekday = new Date().getDay();

  // EMPTY STATE
  if (totalDays === 0) {
    return (
      <div
        className="fixed inset-0 z-[110] flex flex-col"
        style={{ background: 'var(--bg-primary)', animation: 'fadeIn 0.25s ease' }}
      >
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon name="arrow_back" className="text-[length:var(--fs-18)]" />
            <span className="hidden min-[480px]:inline">Back to Plans</span>
          </button>
          <div className="text-center">
            <p className="text-[length:var(--fs-10)] uppercase font-black tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {plan.title}
            </p>
          </div>
          <div className="w-8 sm:w-[88px]" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border"
            style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
          >
            <Icon name="hourglass_empty" className="text-[length:var(--fs-24)] sm:text-[length:var(--fs-28)]" style={{ color: 'var(--accent)' }} fill={1} />
          </div>
          <p className="text-base sm:text-lg font-black" style={{ color: 'var(--text-primary)' }}>Schedule coming soon</p>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            "{plan.title}" doesn't have its daily content set up yet. Check back shortly.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2.5 rounded-lg font-bold text-sm"
            style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  const handleComplete = async () => {
    if (isDayComplete || completing) return;
    setCompleting(true);
    await onCompleteDay(activeDay);
    setCompleting(false);
    const nextDay = content.find(d => d.day_number > activeDay && !completedDays.includes(d.day_number));
    if (nextDay) setTimeout(() => setActiveDay(nextDay.day_number), 400);
  };

  const handleStartWorkout = () => {
    if (!activeDayData) return;
    navigate('/dashboard/workouts', {
      state: {
        fromPlan: {
          planId:       plan.id,
          planTitle:    plan.title,
          dayNumber:    activeDayData.day_number,
          dayTitle:     activeDayData.title,
          activityType: activeDayData.activity_type,
          description:  activeDayData.description,
          // Module 5: fit-to-minutes — the camera completion target follows
          // the trimmed session instead of the full plan day.
          durationMins: plannedMins ?? activeDayData.duration_mins,
        },
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col"
      style={{ background: 'var(--bg-primary)', animation: 'fadeIn 0.25s ease' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Icon name="arrow_back" className="text-[length:var(--fs-16)] sm:text-[length:var(--fs-18)]" />
          <span className="hidden min-[480px]:inline">Back to Plans</span>
        </button>
        <div className="text-center flex-1 px-2 min-w-0">
          <p className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] uppercase font-black tracking-widest truncate max-w-[140px] sm:max-w-none mx-auto" style={{ color: 'var(--text-muted)' }}>
            {plan.title}
          </p>
          <p className="text-[length:var(--fs-10)] sm:text-xs font-bold" style={{ color: 'var(--accent)' }}>
            {completedDays.length}/{totalDays} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right hidden min-[480px]:block shrink-0">
            <p className="text-base sm:text-lg font-black" style={{ color: 'var(--accent)' }}>{progressPct}%</p>
            <p className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Progress</p>
          </div>
          {/* Mobile sidebar toggle */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border"
            style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle day list"
          >
            <Icon name="calendar_view_week" className="text-[length:var(--fs-18)]" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 sm:h-1 w-full flex-shrink-0" style={{ background: 'var(--border-light)' }}>
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${progressPct}%`, background: 'var(--accent)' }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile day list overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-20"
            style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-64 overflow-y-auto"
              style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-light)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Days</p>
                <button onClick={() => setSidebarOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <Icon name="close" className="text-[length:var(--fs-18)]" />
                </button>
              </div>
              {content.map(day => {
                const done     = completedDays.includes(day.day_number);
                const isActive = day.day_number === activeDay;
                return (
                  <button
                    key={day.day_number}
                    onClick={() => { setActiveDay(day.day_number); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-l-2"
                    style={{
                      background:      isActive ? 'var(--bg-active)' : 'transparent',
                      borderLeftColor: isActive ? 'var(--accent)'    : 'transparent',
                      color:           isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    <div
                      className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-black"
                      style={{
                        background: done ? 'var(--accent)' : isActive ? 'var(--accent-bg)' : 'var(--bg-hover)',
                        color:      done ? 'var(--text-inverse)'       : isActive ? 'var(--accent)'    : 'var(--text-muted)',
                      }}
                    >
                      {done ? <Icon name="check" className="text-[length:var(--fs-14)]" weight={700} /> : day.day_number}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {day.title}
                      </p>
                      <p className="text-[length:var(--fs-10)]" style={{ color: 'var(--text-muted)' }}>
                        {day.duration_mins} mins
                        {(() => {
                          const s = daySchedule[day.day_number];
                          if (!s || s.isRest || !Number.isInteger(s.weekday)) return null;
                          const isToday = s.weekday === todayWeekday;
                          return (
                            <span style={{ color: isToday ? 'var(--accent)' : undefined, fontWeight: isToday ? 900 : undefined }}>
                            {' · '}{WEEKDAY_LETTERS[s.weekday]}{isToday ? ' · today' : ''}
                            </span>
                          );
                        })()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Desktop day list sidebar */}
        <div
          className="hidden md:flex w-20 lg:w-56 border-r overflow-y-auto flex-shrink-0 flex-col"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}
        >
          {content.map(day => {
            const done     = completedDays.includes(day.day_number);
            const isActive = day.day_number === activeDay;
            return (
              <button
                key={day.day_number}
                onClick={() => setActiveDay(day.day_number)}
                className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 lg:py-3.5 text-left transition-all border-l-2"
                style={{
                  background:      isActive ? 'var(--bg-active)' : 'transparent',
                  borderLeftColor: isActive ? 'var(--accent)'    : 'transparent',
                  color:           isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                <div
                  className="w-7 h-7 lg:w-8 lg:h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-black"
                  style={{
                    background: done ? 'var(--accent)' : isActive ? 'var(--accent-bg)' : 'var(--bg-hover)',
                    color:      done ? 'var(--text-inverse)'       : isActive ? 'var(--accent)'    : 'var(--text-muted)',
                  }}
                >
                  {done ? <Icon name="check" className="text-[length:var(--fs-12)] lg:text-[length:var(--fs-14)]" weight={700} /> : day.day_number}
                </div>
                <div className="hidden lg:block overflow-hidden">
                  <p className="text-xs font-bold truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {day.title}
                  </p>
                  <p className="text-[length:var(--fs-10)]" style={{ color: 'var(--text-muted)' }}>
                    {day.duration_mins} mins
                    {/* Module 5 — day-cycling schedule: suggested weekday */}
                    {(() => {
                      const s = daySchedule[day.day_number];
                      if (!s || s.isRest || !Number.isInteger(s.weekday)) return null;
                      const isToday = s.weekday === todayWeekday;
                      return (
                        <span style={{ color: isToday ? 'var(--accent)' : undefined, fontWeight: isToday ? 900 : undefined }}>
                          {' · '}{WEEKDAY_LETTERS[s.weekday]}{isToday ? ' · today' : ''}
                        </span>
                      );
                    })()}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {activeDayData && (
            <div className="max-w-2xl mx-auto" key={activeDay} style={{ animation: 'slideUp 0.2s ease' }}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] font-black uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border"
                  style={{ color: 'var(--accent)', background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
                >
                  Day {activeDayData.day_number}
                </span>
                <span
                  className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                  style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}
                >
                  {activeDayData.activity_type}
                </span>
                {isDayComplete && (
                  <span
                    className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] font-black uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border"
                    style={{ color: 'var(--success)', background: 'var(--success-bg)', borderColor: 'var(--success)' }}
                  >
                    ✓ Completed
                  </span>
                )}
                {/* Module 5 — day-cycling schedule chip */}
                {(() => {
                  const s = daySchedule[activeDayData.day_number];
                  if (!s || s.isRest || !Number.isInteger(s.weekday)) return null;
                  return (
                    <span
                      className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                      style={{ color: s.weekday === todayWeekday ? 'var(--accent)' : 'var(--text-muted)', background: 'var(--bg-hover)' }}
                    >
                      {s.weekday === todayWeekday ? 'Scheduled today' : `Usually ${WEEKDAY_LETTERS[s.weekday]}`}
                    </span>
                  );
                })()}
              </div>

              <h1 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
                {activeDayData.title}
              </h1>
              <p className="text-sm leading-relaxed mb-6 sm:mb-8" style={{ color: 'var(--text-muted)' }}>
                {activeDayData.description}
              </p>

              <div
                className="rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border flex-shrink-0"
                    style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
                  >
                    <Icon name="fitness_center" className="text-[length:var(--fs-18)] sm:text-[length:var(--fs-20)]" style={{ color: 'var(--accent)' }} fill={1} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[length:var(--fs-10)] sm:text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      Today's Session
                    </p>
                    <p className="text-xs sm:text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {activeDayData.activity_type}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                      {plannedMins ?? '–'}
                    </p>
                    <p className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>minutes</p>
                  </div>
                </div>

                {/* Module 5 — fit-to-minutes: user-declared capacity, never stored */}
                {!isRestDay && !isDayComplete && fitChoices.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[length:var(--fs-9)] font-black uppercase tracking-widest mr-1" style={{ color: 'var(--text-muted)' }}>
                      Have less time?
                    </span>
                    <button
                      onClick={() => setLocalFit(0)}
                      className="px-2.5 h-8 rounded-lg text-[length:var(--fs-10)] font-black border cursor-pointer transition-all"
                      style={{
                        background: !localFit ? 'var(--accent)' : 'var(--bg-hover)',
                        borderColor: !localFit ? 'var(--accent)' : 'var(--border-light)',
                        color: !localFit ? 'var(--text-inverse)' : 'var(--text-muted)',
                      }}
                    >
                      Full · {activeDayData.duration_mins}m
                    </button>
                    {fitChoices.map((m) => (
                      <button
                        key={m}
                        onClick={() => setLocalFit(m)}
                        className="px-2.5 h-8 rounded-lg text-[length:var(--fs-10)] font-black border cursor-pointer transition-all"
                        style={{
                          background: localFit === m ? 'var(--accent)' : 'var(--bg-hover)',
                          borderColor: localFit === m ? 'var(--accent)' : 'var(--border-light)',
                          color: localFit === m ? 'var(--text-inverse)' : 'var(--text-muted)',
                        }}
                      >
                        {m}m
                      </button>
                    ))}
                    {trimmedPlan?.trimmed && (
                      <span className="w-full text-[length:var(--fs-9)] font-bold mt-0.5" style={{ color: 'var(--accent)' }}>
                        Fit to {trimmedPlan.durationMins} min — {trimmedPlan.exercises.length} of {activeDayData.exercises.length} exercises
                        {trimmedPlan.reduced ? ' · sets capped at 2' : ''}
                        {trimmedPlan.dropped ? ` · ${trimmedPlan.dropped} dropped` : ''}
                      </span>
                    )}
                  </div>
                )}

                {/* Module 5 — muscle-group tags for scheduling awareness */}
                {muscleTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[length:var(--fs-9)] font-black uppercase tracking-widest mr-1" style={{ color: 'var(--text-muted)' }}>Focus:</span>
                    {muscleTags.map(({ tag, n }) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[length:var(--fs-9)] font-black uppercase tracking-widest border"
                        style={{ color: 'var(--accent)', background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}>
                        {tag}{n > 1 ? ` ×${n}` : ''}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-2 sm:space-y-3">
                  {activeExercises && activeExercises.length > 0 ? (
                    activeExercises.map((ex, idx) => {
                      const muscle = muscleFor(ex.name);
                      return (
                      <div
                        key={`${activeDayData.day_number}-${idx}`}
                        className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border"
                        style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}
                      >
                        <span className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] font-black w-5 sm:w-6 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <Icon name="fitness_center" className="text-[length:var(--fs-14)] sm:text-[length:var(--fs-16)] flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill={1} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                            <span className="truncate">{ex.name}</span>
                            {muscle && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[length:var(--fs-8)] font-black uppercase tracking-widest"
                                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                                {muscle}
                              </span>
                            )}
                          </p>
                          <p className="text-[length:var(--fs-10)] sm:text-[length:var(--fs-11)] truncate" style={{ color: 'var(--text-muted)' }}>{formatExerciseDetail(ex)}</p>
                        </div>
                        {/* Section 3 — written instructions + "don't recommend" */}
                        <button
                          onClick={() => setGuideName(ex.name)}
                          title={`How to do ${ex.name}`}
                          aria-label={`How to do ${ex.name}`}
                          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--bg-active)]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Icon name="menu_book" className="text-[length:var(--fs-16)]" />
                        </button>
                        {/* Module 5 — equipment-compatible alternatives (user's gear) */}
                        <button
                          onClick={() => setAltExName(ex.name)}
                          title={`Alternatives for ${ex.name}`}
                          aria-label={`Show alternatives for ${ex.name}`}
                          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--bg-active)]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Icon name="swap_horiz" className="text-[length:var(--fs-16)]" />
                        </button>
                      </div>
                      );
                    })
                  ) : (
                    <div
                      className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border"
                      style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}
                    >
                      <Icon name="info" className="text-[length:var(--fs-16)] flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-[length:var(--fs-11)]" style={{ color: 'var(--text-muted)' }}>
                        Exercise breakdown for this day hasn't been added yet — follow the description above for now.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col min-[480px]:flex-row gap-2 sm:gap-3">
                {!isDayComplete && (
                  <button
                    onClick={() => {
                      const next = content.find(d => d.day_number > activeDay);
                      if (next) setActiveDay(next.day_number);
                    }}
                    className="flex-1 py-3.5 min-h-[48px] rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                    style={{ borderColor: 'var(--border-medium)', color: 'var(--text-muted)' }}
                  >
                    <Icon name="skip_next" className="text-[length:var(--fs-18)] shrink-0" />
                    <span className="hidden min-[480px]:inline">Skip for Now</span>
                    <span className="min-[480px]:hidden">Skip</span>
                  </button>
                )}

                {isDayComplete ? (
                  <button
                    disabled
                    className="flex-1 py-3.5 min-h-[48px] rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2"
                    style={{
                      background: 'var(--success-bg)',
                      color:      'var(--success)',
                      border:     '1px solid var(--success)',
                      cursor:     'default',
                    }}
                  >
                    <Icon name="verified" className="text-[length:var(--fs-18)] shrink-0" fill={1} /> Day Complete
                  </button>
                ) : isRestDay ? (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="flex-1 py-3.5 min-h-[48px] rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2"
                    style={{ background: 'var(--accent)', color: 'var(--text-inverse)', opacity: completing ? 0.7 : 1 }}
                  >
                    {completing ? (
                      <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <><Icon name="check_circle" className="text-[length:var(--fs-18)] shrink-0" fill={1} /> Mark Complete</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleStartWorkout}
                    className="flex-1 py-3.5 min-h-[48px] rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
                  >
                    <Icon name="play_circle" className="text-[length:var(--fs-18)] shrink-0" fill={1} /> Start Workout
                  </button>
                )}
              </div>

              {!isDayComplete && (
                <p className="text-center text-[length:var(--fs-10)] sm:text-[length:var(--fs-11)] mt-3 sm:mt-4" style={{ color: 'var(--text-muted)' }}>
                  {isRestDay
                    ? `Complete this day to unlock Day ${activeDayData.day_number + 1}`
                    : `Finish your workout session to automatically unlock Day ${activeDayData.day_number + 1}`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Module 5 — alternatives sheet: same muscle, user-compatible equipment */}
      <ExerciseGuideModal
        name={guideName}
        onClose={() => setGuideName(null)}
        excluded={Boolean(guideName) && excludedNames.some((n) => n.toLowerCase() === String(guideName).toLowerCase())}
        onToggleExclude={onToggleExclude}
      />
      {altExName && (
        <div
          className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-4 overflow-y-auto"
          style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(6px)' }}
          onClick={() => setAltExName(null)}
          role="dialog" aria-modal="true" aria-label="Exercise alternatives"
        >
          <div
            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[85dvh] overflow-y-auto"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[length:var(--fs-9)] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Swap in</p>
              <button onClick={() => setAltExName(null)} aria-label="Close alternatives" style={{ color: 'var(--text-muted)' }}>
                <Icon name="close" className="text-[length:var(--fs-18)]" />
              </button>
            </div>
            <h3 className="text-base font-black mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{altExName}</h3>
            <p className="text-[length:var(--fs-10)] mb-4" style={{ color: 'var(--text-muted)' }}>
              Same muscle, matching your available equipment{prefs?.equipment?.length ? ` (${prefs.equipment.join(', ')})` : ' (bodyweight)'}.
            </p>
            {altList.length > 0 ? (
              <div className="flex flex-col gap-2">
                {altList.map((alt) => (
                  <div key={alt.slug} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{alt.name}</p>
                      <p className="text-[length:var(--fs-10)] truncate" style={{ color: 'var(--text-muted)' }}>
                        {alt.muscle} · {String(alt.equipment || '').replace(/_/g, ' ')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAltExName(null);
                        navigate('/dashboard/workouts', { state: { exerciseId: alt.slug } });
                      }}
                      className="h-9 px-3 shrink-0 rounded-lg bg-[var(--accent)] text-[var(--text-inverse)] text-[length:var(--fs-9)] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Start
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>No equipment-compatible substitute found</p>
                <p className="text-[length:var(--fs-10)] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Update preferences with your gear, or browse the Exercise library tab.
                </p>
              </div>
            )}
            <p className="text-[length:var(--fs-9)] mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
              Swapping here starts the alternative directly — your plan stays unchanged.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// MY PLANS TAB — real user data: enrolled templates + owned personal plans
const humanizeGoalType = (t) => String(t || 'Fitness').toLowerCase().split('_').map((w) => w.slice(0, 1).toUpperCase() + w.slice(1)).join(' ');

const GoalLinkBanner = ({ goalStatus = undefined, plans = undefined, onContinue = undefined, onGenerate = undefined, generating = undefined }) => {
  const { goal, linkedPlan } = goalStatus || {};
  if (!goal) return null;
  const label = humanizeGoalType(goal.goalType);
  const kcal = goal.dailyKcal != null ? `${Number(goal.dailyKcal).toLocaleString()} kcal/day` : null;
  const linked = linkedPlan ? plans.find((p) => String(p.id) === String(linkedPlan.id)) : null;

  if (linkedPlan && linked) {
    return (
      <div className="p-banner p-banner--accent">
        <p className="p-banner-text">
          Training for <strong>{label}</strong>{kcal ? ` · ${kcal}` : ''} — linked plan: <strong>{linked.title}</strong>
        </p>
        <button type="button" onClick={() => onContinue(linked)} className="p-banner-btn p-banner-btn--accent">
          Open plan
        </button>
      </div>
    );
  }

  return (
    <div className="p-banner">
      <p className="p-banner-text">
        Your {label} goal{kcal ? ` (${kcal})` : ''} has no training plan yet
        {linkedPlan ? ' — its plan was deleted' : ''}.
      </p>
      <button type="button" onClick={onGenerate} disabled={generating} className="p-banner-btn">
        {generating ? 'Generating…' : 'Generate from my goal'}
      </button>
    </div>
  );
};

const MyPlans = ({ plans = undefined, goalStatus = undefined, onOpen = undefined, onContinue = undefined, onCreateClick = undefined, onGenerate = undefined, onDelete = undefined, onEdit = undefined, generating = undefined, prefs = undefined, onOpenPrefs = undefined, onGenerateGoal = undefined, onActivate = undefined }) => {
  const enrolled = plans.filter(p => p.is_enrolled === 1 || p.is_owner === 1);
  if (enrolled.length === 0) {
    return (
      <div className="p-empty" style={{ animation: 'fadeIn 0.3s ease' }}>
        <span className="p-empty-icon">
          <Icon name="fitness_center" fill={1} />
        </span>
        <h3 className="p-empty-title">No plans yet</h3>
        <p className="p-empty-text">
          Create your own plan, generate one from your goal, or explore a blueprint to enroll.
        </p>
        <div className="p-empty-actions">
          <button
            type="button"
            onClick={onCreateClick}
            className="p-btn"
            style={{ width: 'auto', padding: '0 16px' }}
          >
            Create personal plan
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="p-btn p-btn--ghost"
            style={{ width: 'auto', padding: '0 16px' }}
          >
            {generating ? 'Generating…' : 'Generate from my goal'}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {goalStatus?.goalPlans?.length > 0 ? (
        <GoalPlansPanel goalStatus={goalStatus} plans={plans} onOpen={onContinue} onGenerate={onGenerateGoal} onActivate={onActivate} busy={generating} />
      ) : (
        <GoalLinkBanner goalStatus={goalStatus} plans={plans} onContinue={onContinue} onGenerate={onGenerate} generating={generating} />
      )}
      {/* Module 5 — training preferences: schedule + duration + alternatives inputs. */}
      <div className="p-banner">
        <p className="p-banner-text">
          {prefs && (prefs.equipment?.length || prefs.preferredDays?.length || prefs.sessionDurationMins)
            ? prefs.equipment?.length > 0
              ? `${prefs.equipment.join(' · ')} · `
              : 'Bodyweight · '
            : 'No training preferences yet — '}
          {prefs && prefs.equipment?.length ? `${prefs.preferredDays?.length ?? 0} day${(prefs.preferredDays?.length ?? 0) !== 1 ? 's' : ''}/week · ` : ''}
          {prefs?.sessionDurationMins ? `${prefs.sessionDurationMins} min sessions · ` : ''}
          {prefs && (prefs.equipment?.length || prefs.sessionDurationMins) ? 'used for scheduling, alternatives & plan fit.' : 'recommendations use them to fit your time and equipment.'}
        </p>
        <button type="button" onClick={onOpenPrefs} className="p-banner-btn">
          {prefs && prefs.sessionDurationMins ? 'Edit preferences' : 'Set preferences'}
        </button>
      </div>
      {(() => {
        const active = enrolled[0];
        const progressPct = Math.max(0, Math.min(100, Number(active.progress_pct) || 0));
        const completedDays = Number(active.completed_days) || 0;
        const isLinked = goalStatus?.linkedPlan && String(active.id) === String(goalStatus.linkedPlan.id);
        return (
          <div
            className="p-active"
            role="button"
            tabIndex={0}
            aria-label={`Open plan: ${active.title}`}
            onClick={() => onOpen(active)}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(active);
              }
            }}
          >
            <div className="p-active-cover">
              <PlanCover
                seed={active.image_seed}
                title={active.title}
                tag={active.tag}
                src={active.image_url}
              />
            </div>
            <div className="p-active-body">
              <p className="p-active-eyebrow">
                Active plan{isLinked ? ' · Goal-linked' : active.is_owner === 1 ? ' · Yours' : ''}
              </p>
              <h2 className="p-active-title">{active.title}</h2>
              <p className="p-active-meta">
                {active.duration}
                {active.intensity ? ` · ${active.intensity}` : ''}
                {completedDays > 0 ? ` · ${completedDays} day${completedDays !== 1 ? 's' : ''} done` : ''}
              </p>
              <div className="p-progress" aria-label={`${progressPct}% complete`}>
                <div className="p-progress-track">
                  <div className="p-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="p-progress-pct">{progressPct}%</span>
              </div>
            </div>
            <div className="p-active-actions" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="p-btn" onClick={() => onContinue(active)}>
                Continue
              </button>
              {active.is_owner === 1 ? (
                <PlanActions plan={active} onEdit={onEdit} onDelete={onDelete} />
              ) : null}
            </div>
          </div>
        );
      })()}
      {enrolled.length > 1 && (
        <section className="p-section" style={{ marginTop: 0 }}>
          <div className="p-head">
            <h3 className="p-head-title">All enrolled plans</h3>
            <span className="p-count">{enrolled.length}</span>
          </div>
          <div className="p-grid">
            {enrolled.slice(1).map((plan, i) => (
              <div key={plan.id} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <PlanCard
                  plan={plan}
                  onOpen={onOpen}
                  onEnroll={() => {}}
                  onContinue={onContinue}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  style={{ flex: 1, animation: `slideUp 0.3s ease ${i * 0.06}s both` }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// DISCOVERY — search, categories, filters and the plan grid
const ContinueTrainingCard = ({ plan = undefined, onContinue = undefined }) => {
  const pct = Math.max(0, Math.min(100, Number(plan.progress_pct) || 0));
  const completedDays = Number(plan.completed_days) || 0;

  return (
    <div className="p-continue">
      <div className="p-continue-cover">
        <PlanCover
          seed={plan.image_seed}
          title={plan.title}
          tag={plan.tag}
          src={plan.image_url}
        />
      </div>
      <div className="p-continue-body">
        <p className="p-continue-eyebrow">
          <Icon name="play_circle" fill={1} />
          Continue training
        </p>
        <p className="p-continue-title" title={plan.title}>{plan.title}</p>
        <p className="p-continue-meta">
          {plan.duration}
          {plan.intensity ? ` · ${plan.intensity}` : ''}
          {completedDays > 0 ? ` · ${completedDays} day${completedDays !== 1 ? 's' : ''} done` : ''}
        </p>
        {pct > 0 ? (
          <div className="p-progress" aria-label={`${pct}% complete`}>
            <div className="p-progress-track">
              <div className="p-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="p-progress-pct">{pct}%</span>
          </div>
        ) : null}
      </div>
      <button type="button" className="p-continue-cta" onClick={() => onContinue(plan)}>
        Continue
        <Icon name="arrow_forward" className="text-[length:var(--fs-16)]" />
      </button>
    </div>
  );
};

const Explore = ({ plans = undefined, onOpen = undefined, onEnroll = undefined, onContinue = undefined }) => {
  const [query, setQuery] = useState('');
  const [intensity, setIntensity] = useState('All');
  const [focus, setFocus] = useState('All');
  const [duration, setDuration] = useState('All');
  const [activeCategory, setActiveCategory] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => plans.filter((p) => {
    const q = query.trim().toLowerCase();
    return (
      (!q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tag?.toLowerCase().includes(q)) &&
      (!activeCategory || p.tag === activeCategory) &&
      (intensity === 'All' || p.intensity === intensity) &&
      (focus === 'All' || p.target_focus?.toLowerCase().includes(focus.toLowerCase())) &&
      (duration === 'All' || p.duration === duration)
    );
  }), [plans, query, activeCategory, intensity, focus, duration]);

  const clearAll = () => {
    setQuery('');
    setIntensity('All');
    setFocus('All');
    setDuration('All');
    setActiveCategory(null);
  };
  const advancedCount = [intensity, focus, duration].filter((v) => v !== 'All').length;
  const hasFilters = Boolean(query) || Boolean(activeCategory) || advancedCount > 0;
  const activePlan = plans.find((p) => p.is_enrolled === 1);

  if (plans.length === 0) {
    return (
      <div className="p-empty" style={{ animation: 'fadeIn 0.3s ease' }}>
        <span className="p-empty-icon"><Icon name="fitness_center" /></span>
        <p className="p-empty-title">No plans available yet</p>
        <p className="p-empty-text">New programs will appear here as soon as they are published.</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="p-toolbar">
        <div className="p-search">
          <Icon name="search" className="p-search-icon" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workout plans"
            aria-label="Search workout plans"
          />
          {query ? (
            <button type="button" className="p-search-clear" aria-label="Clear search" onClick={() => setQuery('')}>
              <Icon name="close" className="text-[length:var(--fs-16)]" />
            </button>
          ) : null}
        </div>

        <div className="p-chips" role="group" aria-label="Plan categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              className="p-chip"
              aria-pressed={activeCategory === cat.tag}
              onClick={() => setActiveCategory(cat.tag)}
            >
              <Icon name={cat.icon} fill={activeCategory === cat.tag ? 1 : 0} />
              {cat.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="p-filters-toggle"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <Icon name="tune" className="text-[length:var(--fs-16)]" />
          {filtersOpen ? 'Hide filters' : 'Filters'}
          {advancedCount > 0 ? <span className="p-tab-count">{advancedCount}</span> : null}
        </button>

        {filtersOpen ? (
          <div className="p-filters">
            {[
              { label: 'Intensity', opts: INTENSITY_OPTIONS, active: intensity, set: setIntensity },
              { label: 'Focus area', opts: FOCUS_OPTIONS, active: focus, set: setFocus },
              { label: 'Duration', opts: DURATION_OPTIONS, active: duration, set: setDuration },
            ].map(({ label, opts, active, set }) => (
              <div key={label}>
                <p className="p-filter-label">{label}</p>
                <FilterPill options={opts} active={active} onSelect={set} />
              </div>
            ))}
            <div className="flex items-center justify-between gap-3">
              <span className="p-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              {hasFilters ? (
                <button type="button" className="p-text-btn" onClick={clearAll}>
                  Clear all
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {activePlan ? <ContinueTrainingCard plan={activePlan} onContinue={onContinue} /> : null}

      {filtered.length === 0 ? (
        <div className="p-empty">
          <span className="p-empty-icon"><Icon name="search_off" /></span>
          <p className="p-empty-title">No plans match your search</p>
          <p className="p-empty-text">Try another category, or clear the filters to see every plan.</p>
          <div className="p-empty-actions">
            <button type="button" className="p-banner-btn" onClick={clearAll}>Clear filters</button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-head">
            <div>
              <h3 className="p-head-title">Workout plans</h3>
              <p className="p-head-sub">Programs built around your training focus.</p>
            </div>
            <span className="p-count">
              {filtered.length} plan{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="p-grid">
            {filtered.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onOpen={onOpen}
                onEnroll={onEnroll}
                onContinue={onContinue}
                style={{ animation: `slideUp 0.3s ease ${Math.min(i, 8) * 0.04}s both` }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};



// MAIN PLANS PAGE COMPONENT
const Plans = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const requested = searchParams.get('tab');
    return TABS.some((tab) => tab.id === requested) ? requested : 'explore';
  });

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

  // Mount-only URL cleanup; reacting to searchParams identity would re-run on every navigation.
  useEffect(() => {
    if (searchParams.get('tab')) {
      setSearchParams((params) => {
        const next = new URLSearchParams(params);
        next.delete('tab');
        return next;
      }, { replace: true });
    }
    if (searchParams.get('mine') === '1') {
      setActiveTab('my-plans');
      setSearchParams((params) => {
        const next = new URLSearchParams(params);
        next.delete('mine');
        next.delete('tab');
        return next;
      }, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Consume router state through the router, before refreshes can replay it.
  const consumedTrackerEntry = useRef(null);
  useEffect(() => {
    const openTrackerId = location.state?.openTracker;
    if (!openTrackerId || consumedTrackerEntry.current === location.key || loading || trainingPlans.length === 0) return;
    const plan = trainingPlans.find(p => String(p.id) === String(openTrackerId));
    if (plan) {
      setActiveTab('my-plans');
      consumedTrackerEntry.current = location.key;
      setTrackerStart(null);
      loadTracker(plan);
      const nextState = { ...location.state };
      delete nextState.openTracker;
      navigate({ pathname: location.pathname, search: location.search, hash: location.hash }, { replace: true, state: nextState });
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
      setSearchParams({}, { replace: true });
    } else if (match) {
      setDetailPlan(match);
      autoOpenedRef.current = true;
      setSearchParams({}, { replace: true });
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
