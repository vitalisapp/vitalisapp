import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { classifyBmi } from '../../../../lib/bmi.js';
import BmiInsight from '../../../../components/health/BmiInsight.jsx';
import YearlyBmi from '../../../../components/health/YearlyBmi.jsx';
import Icon from "../../../../components/Icon.jsx";
import { apiFetch } from '../../../../lib/apiClient.js';
import { BottomNav } from "../../../../components/index.js";
import AppShell from "../../../../components/AppShell.jsx";
import PageHeader from "../../../../components/app/PageHeader.jsx";
import { useAuth } from "../../../../hooks/useAuth.jsx";
import AddWorkoutModal from "../components/AddWorkoutModal.jsx";
import ProgressOverviewChart from "../components/ProgressOverviewChart.jsx";
import ProgressPhotosTab from "../components/ProgressPhotosTab.jsx";
import BodyMeasurementsPanel from "../components/BodyMeasurementsPanel.jsx";
import ExportTab from "../components/ExportTab.jsx";
import { SummaryStats, SummaryInsights } from "../components/ProgressSummary.jsx";
import "../log.css";

// Progress page (/dashboard/logs).
// Order: header → KPI tiles → trend chart → insights → tabs.

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const todayKey = () => toDateKey(new Date());

// Prefer the recorded active duration (minus pauses); fall back to wall clock.
const formatDuration = (session) => {
  const recorded = Number(session.duration_seconds);
  let totalSecs;
  if (Number.isFinite(recorded) && recorded > 0) {
    totalSecs = Math.max(0, recorded - (Number(session.paused_seconds) || 0));
  } else {
    if (!session.end_time) return '—';
    totalSecs = Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000);
  }
  if (!Number.isFinite(totalSecs) || totalSecs <= 0) return '—';
  if (totalSecs < 60) return `${totalSecs}s`;
  return `${Math.round(totalSecs / 60)} min`;
};

const PAGE_SIZE = 10;

const fmtDayLabel = (key, opts = { weekday: 'short', month: 'short', day: 'numeric' }) => (
  key === todayKey() ? 'Today' : new Date(key + 'T00:00:00').toLocaleDateString('en-PH', opts)
);

const fmtSessionDate = (iso) => {
  const d = new Date(iso);
  const key = toDateKey(d);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${key === todayKey() ? 'Today' : d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}, ${time}`;
};

const titleCase = (s) => String(s || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// "3 exercises · 12 sets · 1,540 kg volume" for sessions that have set rows.
const setSummaryLine = (s) => {
  if (!s || !s.set_rows) return null;
  const parts = [];
  if (s.exercise_count) parts.push(`${s.exercise_count} exercise${s.exercise_count !== 1 ? 's' : ''}`);
  parts.push(`${s.set_rows} set${+s.set_rows !== 1 ? 's' : ''}`);
  if (s.volume_kg) parts.push(`${Math.round(s.volume_kg).toLocaleString()} kg volume`);
  return parts.join(' · ');
};

const statusTone = (status) => (status === 'completed' ? 'good' : status === 'cancelled' ? 'bad' : 'warn');

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ─── Shared bits ──────────────────────────────────────────────────────────────
function usePanelData(url) {
  const [data, setData]       = useState(null);
  const [dataUrl, setDataUrl] = useState(null); // which request `data` answers
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    if (!url) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(url);
      setData(res);
      setDataUrl(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { load(); }, [load]);

  return { data, dataUrl, loading, error, reload: load };
}

function PanelState({ loading = false, error = null, onRetry = undefined }) {
  if (loading) {
    return <div className="lg-card lg-state lg-state--loading" aria-busy="true">Loading…</div>;
  }
  if (error) {
    return (
      <div className="lg-card lg-state lg-state--error" role="alert">
        <Icon name="cloud_off" />
        <p>{error}</p>
        {onRetry && <button type="button" className="lg-btn lg-btn--ghost" onClick={onRetry}>Try again</button>}
      </div>
    );
  }
  return null;
}

function EmptyPanel({ title = undefined, message = undefined }) {
  return (
    <div className="lg-card lg-state">
      <Icon name="inbox" />
      <strong>{title}</strong>
      {message && <p>{message}</p>}
    </div>
  );
}

function Kpi({ label = undefined, value = undefined, unit = undefined }) {
  return (
    <div className="lg-kpi">
      <span className="lg-kpi-label">{label}</span>
      <span className="lg-kpi-value">
        {value}{unit && value !== '–' && <small> {unit}</small>}
      </span>
    </div>
  );
}

// ─── Workouts tab ─────────────────────────────────────────────────────────────
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const shiftMonth = (key, delta) => {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
};

// Controlled month: the parent owns it so the calendar dots can be fetched
// per month from the API.
function MiniCalendar({ month = undefined, onMonthChange = undefined, activeDays = undefined, selectedKey = undefined, onSelect = undefined }) {
  const [year, mon] = month.split('-').map(Number);
  const firstDay    = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const today = todayKey();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="lg-cal-head">
        <button type="button" className="lg-icon-btn" aria-label="Previous month" onClick={() => onMonthChange(shiftMonth(month, -1))}>
          <Icon name="chevron_left" />
        </button>
        <span className="lg-cal-title">{MONTHS[mon - 1]} {year}</span>
        <button type="button" className="lg-icon-btn" aria-label="Next month" onClick={() => onMonthChange(shiftMonth(month, 1))}>
          <Icon name="chevron_right" />
        </button>
      </div>
      <div className="lg-cal-grid">
        {DAYS.map((d) => <span key={d} className="lg-cal-dow">{d}</span>)}
        {cells.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} />;
          const key = `${month}-${String(day).padStart(2, '0')}`;
          const hasLogs = activeDays.has(key);
          const selected = key === selectedKey;
          const cls = ['lg-cal-day', hasLogs && 'has-logs', key === today && 'is-today', selected && 'is-selected'].filter(Boolean).join(' ');
          return (
            <button
              key={key}
              type="button"
              className={cls}
              disabled={!hasLogs && !selected}
              aria-pressed={selected}
              aria-label={`${key}${hasLogs ? ', has workouts' : ''}`}
              onClick={() => onSelect(selected ? null : key)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SessionRow({ session = undefined }) {
  const line = setSummaryLine(session);
  return (
    <li className="lg-session">
      <span className="lg-session-name">
        <strong>{session.workout_type ?? 'Workout'}</strong>
        <span>{line ?? `#VTL-${session.id.toString().padStart(4, '0')}`}</span>
      </span>
      <span className="lg-session-meta">
        <span className="lg-session-cell">{fmtSessionDate(session.start_time)}</span>
        <span className="lg-session-cell">{session.rep_count ?? 0} <small>reps</small></span>
        <span className="lg-session-cell">{formatDuration(session)}</span>
      </span>
      <span className={`lg-pill lg-pill--${statusTone(session.status)}`}>{session.status ?? 'Unknown'}</span>
    </li>
  );
}

// Compact numbered pager: 1 … 4 5 6 … 12 (always shows first/last).
function pageList(page, count) {
  const set = new Set([1, count, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
}

function Pagination({ page = undefined, pageCount = undefined, from = undefined, to = undefined, total = undefined, onChange = undefined }) {
  return (
    <nav className="lg-pager" aria-label="Workout history pages">
      <span className="lg-pager-info">{from}–{to} of {total}</span>
      <div className="lg-pager-btns">
        <button type="button" className="lg-icon-btn" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <Icon name="chevron_left" />
        </button>
        {pageList(page, pageCount).map((n) => (typeof n === 'string'
          ? <span key={n} className="lg-pager-gap" aria-hidden="true">…</span>
          : (
            <button
              key={n}
              type="button"
              className={`lg-pager-num${n === page ? ' is-active' : ''}`}
              aria-label={`Page ${n}`}
              aria-current={n === page ? 'page' : undefined}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          )))}
        <button type="button" className="lg-icon-btn" aria-label="Next page" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
          <Icon name="chevron_right" />
        </button>
      </div>
    </nav>
  );
}

// Workout history data: server-side pages
//   GET /api/workout-logs?page=&limit=10&date=&with_sets=1
//   GET /api/workout-logs/days?month=YYYY-MM   (calendar dots)
function useWorkoutHistory({ userId, page, date, month }) {
  const qs = new URLSearchParams({ with_sets: '1', page: String(page), limit: String(PAGE_SIZE) });
  if (date) qs.set('date', date);
  const pageUrl = userId ? `/api/workout-logs?${qs}` : null;
  const daysUrl = userId ? `/api/workout-logs/days?month=${month}` : null;
  const pageData = usePanelData(pageUrl);
  const daysData = usePanelData(daysUrl);

  const d = pageData.data;
  // Only trust the served page once the response matches the current URL;
  // until then the previous page stays visible (dimmed) and page = requested.
  const fresh = Boolean(d) && pageData.dataUrl === pageUrl;
  return {
    logs: Array.isArray(d?.logs) ? d.logs : [],
    page: fresh ? d.page : page,
    total: d?.total ?? 0,
    pageCount: d?.pageCount ?? 1,
    stats: d?.stats ?? { sessions: 0, reps: 0, completed: 0 },
    days: new Set(daysData.data?.days ?? []),
    loading: pageData.loading && !d,
    refreshing: Boolean(d) && (pageData.loading || !fresh),
    error: pageData.error,
    retry: pageData.reload,
    reload: () => { pageData.reload(); daysData.reload(); },
  };
}

function WorkoutsTab({ history = undefined, date = undefined, month = undefined, onMonthChange = undefined, onSelectDay = undefined, onPageChange = undefined }) {
  const { logs, page, total, pageCount, stats, days, loading, refreshing, error, retry } = history;
  const label = date ? fmtDayLabel(date, { weekday: 'long', month: 'long', day: 'numeric' }) : 'All time';
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  return (
    <div className="lg-workouts">
      <section className="lg-card" aria-label="Workout calendar">
        <MiniCalendar month={month} onMonthChange={onMonthChange} activeDays={days} selectedKey={date} onSelect={onSelectDay} />
        <div className="lg-day-summary">
          <div><b>{stats.sessions}</b><span>Sessions</span></div>
          <div><b>{stats.reps}</b><span>Reps</span></div>
          <div><b>{stats.completed}</b><span>Completed</span></div>
        </div>
      </section>

      <section id="workout-history" className="lg-card lg-card--flush" aria-labelledby="lg-sessions-title" aria-busy={loading || refreshing}>
        <header className="lg-card-head">
          <div className="lg-card-titles">
            <h2 id="lg-sessions-title" className="lg-card-title">Workout history</h2>
            <p className="lg-card-sub">{label} · {total} session{total === 1 ? '' : 's'}</p>
          </div>
          {date && <button type="button" className="lg-link" onClick={() => onSelectDay(null)}>Show all</button>}
        </header>

        {loading ? (
          <div className="lg-state lg-state--loading">Loading…</div>
        ) : error ? (
          <div className="lg-state lg-state--error" role="alert">
            <Icon name="cloud_off" />
            <p>{error}</p>
            <button type="button" className="lg-btn lg-btn--ghost" onClick={retry}>Try again</button>
          </div>
        ) : logs.length === 0 ? (
          <div className="lg-state">
            <Icon name="fitness_center" />
            <strong>No workouts {date ? `on ${label}` : 'yet'}</strong>
            <p>{date ? 'Pick a highlighted day or show all.' : 'Complete or log a workout to see it here.'}</p>
          </div>
        ) : (
          <ul className={`lg-sessions${refreshing ? ' is-refreshing' : ''}`}>
            <li className="lg-session lg-session--head" aria-hidden="true">
              <span>Workout</span>
              <span className="lg-session-meta"><span>Date</span><span>Reps</span><span>Duration</span></span>
              <span>Status</span>
            </li>
            {logs.map((session) => <SessionRow key={session.id} session={session} />)}
          </ul>
        )}

        {!loading && !error && pageCount > 1 && (
          <Pagination page={page} pageCount={pageCount} from={from} to={from + logs.length - 1} total={total} onChange={onPageChange} />
        )}
      </section>
    </div>
  );
}

// ─── Body tab ─────────────────────────────────────────────────────────────────
function BodyTab({ userId = undefined }) {
  const { data, loading, error, reload } = usePanelData(userId ? `/api/bmi/${userId}` : null);
  const records = data?.records ?? [];

  if (loading || error) return <PanelState loading={loading} error={error} onRetry={reload} />;
  if (records.length === 0) {
    return <EmptyPanel title="No body records yet" message="Add your weight and height in Profile, or log a measurement above." />;
  }

  const latest = records[0];
  return (
    <div className="lg-stack">
      <div className="lg-kpis">
        <Kpi label="Weight"   value={latest.weight_kg ?? '–'} unit="kg" />
        <Kpi label="Height"   value={latest.height_cm ?? '–'} unit="cm" />
        <Kpi label="BMI"      value={latest.bmi ?? '–'} />
        <Kpi label="Category" value={classifyBmi(latest.bmi)?.label ?? latest.bmi_category ?? '–'} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BmiInsight bmi={latest.bmi} heightCm={latest.height_cm} weightKg={latest.weight_kg} />
        <YearlyBmi userId={userId} />
      </div>
      <section className="lg-card lg-card--flush" aria-labelledby="lg-bmi-title">
        <header className="lg-card-head">
          <div className="lg-card-titles">
            <h2 id="lg-bmi-title" className="lg-card-title">BMI history</h2>
            <p className="lg-card-sub">{records.length} record{records.length === 1 ? '' : 's'}</p>
          </div>
        </header>
        <div className="lg-table-wrap">
          <table className="lg-table">
            <thead>
              <tr>{['Date', 'Weight', 'Height', 'BMI', 'Category'].map((h) => <th key={h} scope="col">{h}</th>)}</tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.recorded_at}</td>
                  <td className="is-strong">{r.weight_kg} kg</td>
                  <td>{r.height_cm} cm</td>
                  <td>{r.bmi}</td>
                  <td>{classifyBmi(r.bmi)?.label ?? r.bmi_category ?? '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ─── Nutrition tab ────────────────────────────────────────────────────────────
// Day-level reading of intake vs the goal's calorie target.
function dayTag(kcal, target) {
  if (!target) return null;
  const r = kcal / target;
  if (r < 0.75) return { tone: 'warn', label: 'Low' };
  if (r < 0.9) return { tone: 'info', label: 'Under' };
  if (r <= 1.1) return { tone: 'good', label: 'On target' };
  return { tone: 'warn', label: 'Over' };
}

function MealHistory({ records = undefined, targetKcal = undefined }) {
  const [daysShown, setDaysShown] = useState(7);
  const days = useMemo(() => {
    const map = new Map();
    for (const r of records) {
      const key = String(r.logged_at || '').slice(0, 10);
      if (!key) continue;
      const d = map.get(key) || { key, meals: [], kcal: 0, protein: 0, carbs: 0, fat: 0 };
      d.meals.push(r);
      d.kcal += Number(r.calories) || 0;
      d.protein += Number(r.protein) || 0;
      d.carbs += Number(r.carbs) || 0;
      d.fat += Number(r.fat) || 0;
      map.set(key, d);
    }
    return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [records]);

  return (
    <section className="lg-card" aria-labelledby="lg-meals-title">
      <header className="lg-card-head">
        <div className="lg-card-titles">
          <h2 id="lg-meals-title" className="lg-card-title">Meal history</h2>
          <p className="lg-card-sub">
            {days.length} logged day{days.length === 1 ? '' : 's'}{targetKcal ? ` · target ${targetKcal} kcal/day` : ''}
          </p>
        </div>
      </header>
      {days.slice(0, daysShown).map((d) => {
        const tag = dayTag(d.kcal, targetKcal);
        return (
          <details key={d.key} className="mh-day">
            <summary>
              <span className="mh-day-name">
                <strong>{fmtDayLabel(d.key, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                <span>
                  {d.meals.length} meal{d.meals.length === 1 ? '' : 's'} · P {Math.round(d.protein)} g · C {Math.round(d.carbs)} g · F {Math.round(d.fat)} g
                </span>
              </span>
              <span className="mh-day-totals">
                {tag && <span className={`lg-pill lg-pill--${tag.tone}`}>{tag.label}</span>}
                <span className="mh-kcal">{Math.round(d.kcal).toLocaleString()} <small>kcal</small></span>
                <Icon name="expand_more" className="mh-chevron" />
              </span>
            </summary>
            <ul className="mh-meals">
              {d.meals.map((m) => (
                <li key={m.id}>
                  <span>{String(m.logged_at || '').slice(11, 16)} · {m.food_name}{m.serving ? ` (${m.serving})` : ''}</span>
                  <span>{Math.round(Number(m.calories) || 0)} kcal</span>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
      {days.length > daysShown && (
        <button type="button" className="lg-btn lg-btn--ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setDaysShown((n) => n + 7)}>
          Show more days
        </button>
      )}
    </section>
  );
}

function NutritionTab({ userId = undefined, targetKcal = null }) {
  const { data, loading, error, reload } = usePanelData(userId ? `/api/food-logs/${userId}` : null);
  const records = data?.records ?? [];

  if (loading || error) return <PanelState loading={loading} error={error} onRetry={reload} />;
  if (records.length === 0) return <EmptyPanel title="No meals logged yet" message="Log a meal to start tracking your intake." />;

  const today  = todayKey();
  const todays = records.filter((r) => String(r.logged_at || '').slice(0, 10) === today);
  const sum = (arr, k) => Math.round(arr.reduce((s, r) => s + (Number(r[k]) || 0), 0));

  return (
    <div className="lg-stack">
      <p className="lg-section-label">Today · {todays.length} meal{todays.length === 1 ? '' : 's'}</p>
      <div className="lg-kpis">
        <Kpi label="Calories" value={sum(todays, 'calories').toLocaleString()} unit="kcal" />
        <Kpi label="Protein"  value={sum(todays, 'protein')}  unit="g" />
        <Kpi label="Carbs"    value={sum(todays, 'carbs')}    unit="g" />
        <Kpi label="Fat"      value={sum(todays, 'fat')}      unit="g" />
      </div>
      <MealHistory records={records} targetKcal={targetKcal} />
    </div>
  );
}

// ─── Goal tab ─────────────────────────────────────────────────────────────────
const TIMELINE_STATUS = {
  ahead:     { label: 'Ahead of schedule', tone: 'good' },
  on_track:  { label: 'On track',          tone: 'good' },
  behind:    { label: 'Behind schedule',   tone: 'warn' },
  overdue:   { label: 'Past target date',  tone: 'warn' },
  complete:  { label: 'Goal reached',      tone: 'good' },
  no_target: { label: 'No target date',    tone: 'info' },
};

function GoalTimeline({ timeline = undefined }) {
  if (!timeline) return null;
  const fmt = (iso) => (iso
    ? new Date(iso + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—');
  const hasTarget = timeline.status !== 'no_target';
  const meta = TIMELINE_STATUS[timeline.status] ?? { label: timeline.status, tone: 'info' };
  const daysLeft = timeline.remainingDays;

  return (
    <section className="lg-card" aria-labelledby="lg-timeline-title">
      <header className="lg-card-head">
        <div className="lg-card-titles">
          <h2 id="lg-timeline-title" className="lg-card-title">Target timeline</h2>
        </div>
        <span className={`lg-pill lg-pill--${meta.tone}`}>{meta.label}</span>
      </header>
      <div className="gt-dates">
        <span>Started<b>{fmt(timeline.startDate)}</b></span>
        <span>{hasTarget && daysLeft != null ? (daysLeft >= 0 ? 'Days left' : 'Days over') : ''}<b>{hasTarget && daysLeft != null ? Math.abs(daysLeft) : ''}</b></span>
        <span>Target date<b>{fmt(timeline.targetDate)}</b></span>
      </div>
      {hasTarget && (
        <div className="gt-bars">
          <div className="gt-bar-row">
            <span>Time used</span>
            <div className="gt-bar gt-bar--time"><span style={{ width: `${timeline.timePct ?? 0}%` }} /></div>
            <span>{timeline.timePct ?? 0}%</span>
          </div>
          {timeline.progressPct != null && (
            <div className="gt-bar-row">
              <span>Goal progress</span>
              <div className="gt-bar"><span style={{ width: `${Math.min(100, timeline.progressPct)}%` }} /></div>
              <span>{timeline.progressPct}%</span>
            </div>
          )}
        </div>
      )}
      <p className="gt-text">{timeline.text}</p>
    </section>
  );
}

// Goal data comes from /api/progress/summary (goal + progress + timeline in one
// call, and the same source the insights read — so they never disagree).
function GoalTab({ summary = undefined, loading = undefined, error = undefined, onRetry = undefined }) {
  const goal = summary?.goal;

  if (!summary && (loading || error)) return <PanelState loading={loading} error={error} onRetry={onRetry} />;
  if (!goal) return <EmptyPanel title="No active goal" message="Set one from onboarding or your profile." />;

  const pct = Math.max(0, Math.min(100, Math.round(Number(summary?.progressPct) || 0)));
  const weights = [
    goal.weightKg != null ? `Start ${goal.weightKg} kg` : null,
    summary?.currentWeightKg != null ? `now ${Math.round(summary.currentWeightKg * 10) / 10} kg` : null,
    goal.targetWeightKg != null ? `target ${goal.targetWeightKg} kg` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="lg-stack">
      <section className="lg-card" aria-labelledby="lg-goal-title">
        <header className="lg-card-head">
          <div className="lg-card-titles">
            <h2 id="lg-goal-title" className="lg-card-title">{titleCase(goal.goalType)}</h2>
            <p className="lg-card-sub">{goal.pace ? `${titleCase(goal.pace)} pace` : 'Active goal'}{weights ? ` · ${weights}` : ''}</p>
          </div>
          <span className="lg-kpi-value">{pct}%</span>
        </header>
        <div className="gt-bar"><span style={{ width: `${pct}%` }} /></div>
      </section>
      <GoalTimeline timeline={summary?.timeline} />
      <div>
        <p className="lg-section-label" style={{ marginBottom: 8 }}>Daily targets</p>
        <div className="lg-kpis">
          <Kpi label="Calories" value={goal.dailyKcal ?? '–'} unit="kcal" />
          <Kpi label="Protein"  value={goal.proteinG ?? '–'}  unit="g" />
          <Kpi label="Carbs"    value={goal.carbsG ?? '–'}    unit="g" />
          <Kpi label="Fat"      value={goal.fatG ?? '–'}      unit="g" />
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
// 'training' key kept so existing ?section= links keep working.
const TABS = [
  { key: 'training',  label: 'Workouts' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'body',      label: 'Body' },
  { key: 'goal',      label: 'Goal' },
  { key: 'photos',    label: 'Photos' },
  { key: 'export',    label: 'Export' },
];
const TAB_KEYS = TABS.map((t) => t.key);

function TabBar({ active = undefined, onChange = undefined }) {
  return (
    <nav className="lg-tabs" aria-label="Progress sections">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`lg-tab${t.key === active ? ' is-active' : ''}`}
          aria-current={t.key === active ? 'page' : undefined}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
// The URL is the source of truth for navigation state:
//   ?section=nutrition            active tab (absent = Workouts)
//   ?page=3                       workout history page (absent = 1)
//   ?date=2026-11-19              workout history day filter
// Page/date changes push history entries, so Back/Forward and refresh work.
const Log = () => {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const sectionParam = searchParams.get('section');
  const activeTab = TAB_KEYS.includes(sectionParam) ? sectionParam : 'training';
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1);
  const dateParam = searchParams.get('date');
  const date = dateParam && ISO_DAY.test(dateParam) ? dateParam : null;

  const updateParams = useCallback((changes, { replace = false } = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([k, v]) => {
        if (v == null || v === '' || (k === 'page' && Number(v) <= 1)) next.delete(k);
        else next.set(k, String(v));
      });
      return next;
    }, { replace });
  }, [setSearchParams]);

  const setActiveTab = useCallback((tab) => {
    // page/date only belong to the Workouts tab.
    updateParams(
      tab === 'training' ? { section: null } : { section: tab, page: null, date: null },
      { replace: true },
    );
  }, [updateParams]);

  // Calendar month the user is viewing. A selected ?date always shows its
  // own month (stored with the date it belongs to, so no effect is needed).
  const [calView, setCalView] = useState(() => ({ forDate: date, month: date ? date.slice(0, 7) : monthKey() }));
  const month = calView.forDate === date ? calView.month : (date ? date.slice(0, 7) : calView.month);
  const setCalMonth = useCallback((m) => setCalView({ forDate: date, month: m }), [date]);

  // Rule-based progress summary.
  const summaryPanel = usePanelData(user?.id ? '/api/progress/summary' : null);
  const reloadSummary = summaryPanel.reload;
  const summary = summaryPanel.data || null;

  const history = useWorkoutHistory({
    userId: user?.id,
    page,
    date,
    month,
  });

  // Out-of-range ?page (e.g. typed by hand) is clamped by the server; mirror
  // the served page into the URL so it never shows a page that doesn't exist.
  const servedPage = history.page;
  const settled = !history.loading && !history.refreshing && !history.error;
  useEffect(() => {
    if (activeTab === 'training' && settled && servedPage !== page) {
      updateParams({ page: servedPage }, { replace: true });
    }
  }, [activeTab, settled, servedPage, page, updateParams]);

  const onPageChange = useCallback((n) => {
    updateParams({ page: n });
    document.getElementById('workout-history')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [updateParams]);

  const onSelectDay = useCallback((key) => {
    updateParams({ date: key, page: null });
  }, [updateParams]);

  return (
    <AppShell userId={user?.id} mobileTitle="Progress" bottomNav={<BottomNav />}>
      <PageHeader
        className="lg-head"
        title="Progress"
        description="Your workouts, meals and body measurements over time."
        actions={(
          <div className="lg-head-actions">
            <button type="button" className="lg-btn" onClick={() => setShowAddModal(true)}>
              <Icon name="add" /> Log workout
            </button>
          </div>
        )}
      />

      {showAddModal && (
        <AddWorkoutModal onClose={() => setShowAddModal(false)} onSaved={() => { history.reload(); reloadSummary(); }} />
      )}

      <div className="lg-page">
        <SummaryStats summary={summary} loading={summaryPanel.loading} />

        <ProgressOverviewChart userId={user?.id} />

        <SummaryInsights
          summary={summary}
          loading={summaryPanel.loading}
          error={summaryPanel.error}
          onRetry={summaryPanel.reload}
        />

        <TabBar active={activeTab} onChange={setActiveTab} />

        <div className="lg-panel">
          {activeTab === 'training' && (
            <WorkoutsTab
              history={history}
              date={date}
              month={month}
              onMonthChange={setCalMonth}
              onSelectDay={onSelectDay}
              onPageChange={onPageChange}
            />
          )}
          {activeTab === 'nutrition' && (
            <NutritionTab
              userId={user?.id}
              targetKcal={summary?.goal?.dailyKcal ?? null}
            />
          )}
          {activeTab === 'body' && (
            <div className="lg-stack">
              {/* Tape + BF% logging; weight auto-mirrors into BMI history below */}
              <BodyMeasurementsPanel userId={user?.id} />
              <BodyTab userId={user?.id} />
            </div>
          )}
          {activeTab === 'goal' && (
            <GoalTab summary={summary} loading={summaryPanel.loading} error={summaryPanel.error} onRetry={summaryPanel.reload} />
          )}
          {activeTab === 'photos' && <ProgressPhotosTab userId={user?.id} />}
          {activeTab === 'export' && <ExportTab userId={user?.id} />}
        </div>
      </div>
    </AppShell>
  );
};

export default Log;
