import React from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { apiGet } from '../../../lib/apiClient.js';
import ErrorState from '../../../components/feedback/ErrorState.jsx';
import { useAnalyticsState } from '../hooks/useAnalyticsState.js';
import { useAnalyticsData } from '../hooks/useAnalyticsData.js';
import { useSleepActions } from '../hooks/useSleepActions.js';
import { SidebarAnalytics, BottomNav, Topbar } from '../../../components/index.js';
import GlassAmbient from '../../../components/GlassAmbient.jsx';
import Icon from '../../../components/Icon.jsx';
import CheckInModal from '../../Dashboard/components/CheckInModal.jsx';
import { useToastStore } from '../../../stores/toastStore.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);


// HELPERS
const resolveCssVar = (name, fallback = '#000000') => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const calculateSleepScore = (hours, quality) => {
  // Display-only sleep quality (0-100). Training readiness source of truth is
  // backend utils/readiness.js — this must stay visual, never drive training advice.
  const h = Number(hours);
  const q = Number(quality);
  if (!Number.isFinite(h) || !Number.isFinite(q) || h < 0 || h > 24 || q < 0 || q > 10) return 0;
  let durationScore;
  if (h >= 7 && h <= 9) durationScore = 100;
  else if (h > 9 && h <= 10) durationScore = 80;
  else if (h > 10) durationScore = 55; // oversleep penalized — matches 'Low' label below
  else durationScore = Math.max(0, (h / 7) * 100);
  return Math.round(durationScore * 0.6 + Math.min(10, Math.max(0, q)) * 10 * 0.4);
};

const getSleepStatusReal = (hours, quality) => {
  const score = calculateSleepScore(hours, quality);
  if (score >= 85) return { label: 'Ready to train 💪', color: 'text-(--accent)',  border: 'border-(--accent-border)',  bg: 'bg-(--accent-bg)',  level: 'Optimal', score };
  if (score >= 60) return { label: 'Light workout 😐',  color: 'text-orange-400', border: 'border-orange-400/40', bg: 'bg-orange-400/10', level: 'Fair',    score };
  if (hours > 10)  return { label: 'Oversleep recovery 😪', color: 'text-blue-400', border: 'border-blue-400/40', bg: 'bg-blue-400/10', level: 'High', score };
  return                   { label: 'Rest recommended 😴', color: 'text-red-400',   border: 'border-red-400/40',  bg: 'bg-red-400/10',   level: 'Low',     score };
};


const getPointColor = (hours, quality) => {
  const score = calculateSleepScore(hours, quality);
  if (score >= 85) return resolveCssVar('--accent', '#6B8E23');
  if (score >= 60) return '#fb923c';
  return '#f87171';
};

const ZONE_CONFIG = {
  5: { color: 'bg-red-500',       label: 'Zone 5 (Anaerobic)'    },
  4: { color: 'bg-orange-400',    label: 'Zone 4 (Threshold)'    },
  3: { color: 'bg-yellow-400',    label: 'Zone 3 (Tempo)'        },
  2: { color: 'bg-(--accent)',    label: 'Zone 2 (Aerobic Base)' },
  1: { color: 'bg-blue-400',      label: 'Zone 1 (Recovery)'     },
};

const DEFAULT_ZONES = [
  { zone: 5, label: 'Zone 5 (Anaerobic)',    value: '0%', color: 'bg-red-500'    },
  { zone: 4, label: 'Zone 4 (Threshold)',    value: '0%', color: 'bg-orange-400' },
  { zone: 2, label: 'Zone 2 (Aerobic Base)', value: '0%', color: 'bg-(--accent)' },
];

// UI COMPONENTS



function TimeframeToggle({ timeframe, setTimeframe }) {
  const opts = [
    { label: 'Week', value: 'Weekly' },
    { label: 'Month', value: 'Monthly' },
    { label: 'Year', value: 'Quarterly' },
  ];
  return (
    <div className="flex bg-(--bg-tertiary) p-1 rounded-full border border-(--border-light) overflow-x-auto no-scrollbar shadow-sm self-start sm:self-auto shrink-0">
      {opts.map((o) => (
        <button
          key={o.value}
          onClick={() => setTimeframe(o.value)}
          className={`px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-[0.12em] rounded-full transition-all whitespace-nowrap touch-manipulation ${
            timeframe === o.value
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow'
              : 'text-(--text-muted) hover:text-(--text-primary)'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PageHeader({ timeframe, setTimeframe, activeTab, setActiveTab }) {
  return (
    <section className="flex flex-col gap-4 mb-6 md:mb-10 lg:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div className="space-y-1 min-w-0">
          <p className="text-(--accent) font-bold tracking-[0.25em] text-[10px] uppercase">Recovery & Progress</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter font-['Manrope'] text-(--text-primary) leading-none">
            Train. Recover. Progress.
          </h2>
        </div>
        <TimeframeToggle timeframe={timeframe} setTimeframe={setTimeframe} />
      </div>
      <div className="flex gap-2">
        {['training', 'recovery', 'progress'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`min-h-[44px] px-4 rounded-full text-[11px] font-black uppercase tracking-widest capitalize ${activeTab === t ? 'bg-(--accent) text-[var(--text-inverse)]' : 'bg-(--bg-card) border border-(--border-light) text-(--text-muted)'}`}>
            {t}
          </button>
        ))}
      </div>
    </section>
  );
}

const EmptyPanel = ({ title, hint, action, onAction }) => (
  <div className="col-span-1 lg:col-span-12 p-8 text-center rounded-2xl border border-dashed border-[var(--border-light)]">
    <p className="text-[13px] font-bold">{title}</p>
    <p className="text-[12px] text-[var(--text-muted)] mt-1">{hint}</p>
    {action && <button onClick={onAction} className="mt-3 h-10 px-4 rounded-[12px] bg-[var(--accent)] text-[var(--text-inverse)] text-[12px] font-bold">{action}</button>}
  </div>
);

function RecoveryPanel({ userId }) {
  const [rows, setRows] = React.useState([]);
  const [summary, setSummary] = React.useState(null);
  const [checkInOpen, setCheckInOpen] = React.useState(false);
  const [loadError, setLoadError] = React.useState(null);
  const load = React.useCallback(async () => {
    setLoadError(null);
    try {
      const [r, s] = await Promise.all([
        apiGet(`/api/analytics/recovery/${userId}`).catch((e) => { throw e; }),
        apiGet(`/api/analytics/summary/${userId}`).catch(() => null),
      ]);
      setRows(Array.isArray(r) ? r : []);
      setSummary(s);
    } catch (err) {
      setRows([]);
      setSummary(null);
      setLoadError(err);
    }
  }, [userId]);
  React.useEffect(() => {
    if (!userId) return;
    load();
  }, [userId, load]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
      <div className="col-span-1 lg:col-span-12">
        <button onClick={() => setCheckInOpen(true)}
          className="w-full p-4 rounded-2xl bg-[var(--accent)] text-[var(--text-inverse)] font-bold text-[13px] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform">
          <span className="material-symbols-outlined text-[18px]">fact_check</span> Daily Check-In
        </button>
      </div>
      {loadError && (
        <div className="col-span-1 lg:col-span-12">
          <ErrorState message={loadError.message || 'Could not load recovery data.'} onRetry={load} />
        </div>
      )}
      <div className="col-span-1 lg:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg sleep', value: summary?.avg_sleep_hours != null ? `${summary.avg_sleep_hours}h` : '—' },
          { label: 'Sleep quality', value: summary?.avg_sleep_quality != null ? `${summary.avg_sleep_quality}/10` : '—' },
          { label: 'Recovery', value: summary?.avg_recovery_score != null ? `${summary.avg_recovery_score}/10` : '—' },
          { label: 'Water', value: summary?.avg_water_ml != null ? `${summary.avg_water_ml} ml` : '—' },
        ].map((c) => (
          <div key={c.label} className="p-4 rounded-2xl bg-(--bg-tertiary) border border-(--border-light)">
            <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted)">{c.label}</p>
            <p className="text-xl font-black mt-1">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="col-span-1 lg:col-span-12 bg-(--bg-tertiary) rounded-2xl p-4 sm:p-6 border border-(--border-light)">
        <h3 className="font-bold text-[10px] uppercase tracking-[0.25em] text-(--text-muted) mb-4">14-day recovery trend</h3>
        {rows.length === 0 ? (
          <p className="text-(--text-muted) text-[11px] font-bold uppercase tracking-widest text-center py-6">No recovery logs yet — save a sleep log below.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-[12px] border-b border-(--border-light) py-2">
                <span className="font-bold">{r.date}</span>
                <span className="text-(--text-muted)">{r.sleep_hours ?? '—'}h · Q{r.sleep_quality ?? '—'}/10 · R{r.recovery_score ?? '—'}/10 · {r.water_ml ?? 0} ml</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-(--text-muted) mt-3">Manual logging only — automatic wearable sync isn't available yet. General fitness info, not medical advice.</p>
      </div>
      {checkInOpen && (
        <CheckInModal userId={userId} initial={null}
          onClose={() => setCheckInOpen(false)} onSaved={load} />
      )}
    </div>
  );
}

function ProgressHeader({ timeframe, setTimeframe, onBack }) {
  const opts = [
    { label: 'Week', value: 'Weekly' },
    { label: 'Month', value: 'Monthly' },
    { label: 'Year', value: 'Quarterly' },
  ];
  return (
    <section className="w-full max-w-xl mx-auto mb-4">
      <div className="flex items-center justify-between py-1">
        <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
          <span className="material-symbols-outlined text-[22px]">chevron_left</span>
        </button>
        <h2 className="text-[16px] font-bold text-[var(--text-primary)]">Progress</h2>
        <button aria-label="Share progress" onClick={async () => {
          const text = 'My Vitalis progress';
          try {
            if (navigator.share) { await navigator.share({ title: 'My Progress', text }); return; }
            await navigator.clipboard?.writeText(text);
            useToastStore.getState().addToast('Progress summary copied to clipboard.', 'success');
          } catch {
            useToastStore.getState().addToast('Sharing is not available on this device.', 'error');
          }
        }} className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
          <span className="material-symbols-outlined text-[20px]">share</span>
        </button>
      </div>
      <div className="mt-2 flex bg-[#1E1E1E] rounded-full p-1 gap-1">
        {opts.map((o) => (
          <button
            key={o.value}
            onClick={() => setTimeframe(o.value)}
            className={`flex-1 py-2 rounded-full text-[11px] font-bold transition-all ${
              timeframe === o.value ? 'bg-[#3A3A3C] text-white shadow' : 'text-white/55 hover:text-white'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ProgressPanel({ userId, navigate }) {
  const [data, setData] = React.useState({ bmi: [], volume: [] });
  const [loadError, setLoadError] = React.useState(null);
  const load = React.useCallback(() => {
    if (!userId) return;
    setLoadError(null);
    apiGet(`/api/analytics/progress/${userId}`)
      .then((d) => setData(d || { bmi: [], volume: [] }))
      .catch((err) => setLoadError(err));
  }, [userId]);
  React.useEffect(() => { load(); }, [load]);
  // Real Activity Overview — last 7 days of training volume from /api/analytics/progress.
  const last7 = (data.volume || []).slice(-7);
  const maxSteps = Math.max(1, ...last7.map((v) => Number(v.steps) || 0));
  const fmtTick = (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`);
  const yTicks = [maxSteps, (maxSteps * 2) / 3, maxSteps / 3, 0].map(fmtTick);
  const weekBars = last7.length ? last7.map((v) => Math.max(6, Math.round(((Number(v.steps) || 0) / maxSteps) * 100))) : [];
  const weekDays = last7.length
    ? last7.map((v) => new Date(`${v.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }))
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const peak = weekBars.length ? weekBars.indexOf(Math.max(...weekBars)) : -1;
  const totalWorkouts = (data.volume || []).length;
  const totalKcal = (data.volume || []).reduce((s, v) => s + (Number(v.calories_burned) || 0), 0);
  const totalMins = (data.volume || []).reduce((s, v) => s + (Number(v.workout_duration_mins) || 0), 0);
  const totalHrs = Math.floor(totalMins / 60);
  const remMins = totalMins % 60;
  const completedPct = totalWorkouts ? Math.min(100, Math.round((totalWorkouts / 14) * 100)) : 0;
  const ringR = 15.5;
  const ringC = 2 * Math.PI * ringR;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
      {loadError && (
        <div className="col-span-1 lg:col-span-12">
          <ErrorState message={loadError.message || 'Could not load progress data.'} onRetry={load} />
        </div>
      )}
      {/* Activity Overview — real 14-day training volume */}
      <div className="col-span-1 lg:col-span-7 glass-panel rounded-[20px] p-4 sm:p-6 border border-[var(--border-light)] w-full">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[15px] text-[var(--text-primary)]">Activity Overview</h3>
          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] inline-block" />Steps</span>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="flex flex-col justify-between text-[9px] text-[var(--text-muted)] h-36 py-0.5">
            {yTicks.map((t) => <span key={t}>{t}</span>)}
          </div>
          <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 h-36">
            {weekBars.length === 0 ? (
              <p className="text-[11px] text-[var(--text-muted)] font-bold self-center">No step data yet — log activity to fill this chart.</p>
            ) : weekBars.map((h, i) => (
              <div key={`${weekDays[i]}-${i}`} className="flex-1 min-w-0 flex flex-col items-center gap-1.5 h-full justify-end" title={`${last7[i]?.steps ?? 0} steps`}>
                <div
                  className="w-full rounded-full"
                  style={{
                    height: `${h}%`,
                    background: i === peak ? 'var(--text-primary)' : 'var(--border-medium)',
                  }}
                />
                <span className="text-[9px] text-[var(--text-muted)] truncate max-w-full">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { v: String(totalWorkouts), l: 'Active days', s: 'Last 14d', icon: 'fitness_center' },
            { v: totalKcal.toLocaleString(), l: 'Calories', s: 'Last 14d', icon: 'local_fire_department' },
            { v: `${totalHrs}h ${remMins}m`, l: 'Active Time', s: 'Last 14d', icon: 'schedule' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-[var(--border-light)] glass-card p-3 text-center">
              <p className="text-[9px] uppercase font-bold text-[var(--text-muted)]">{s.l}</p>
              <p className="text-[15px] font-black text-[var(--text-primary)] mt-0.5">{s.v}</p>
              <p className="text-[9px] text-[var(--text-muted)] mt-0.5 flex items-center justify-center gap-1">{s.s}<span className="material-symbols-outlined text-[11px]">{s.icon}</span></p>
            </div>
          ))}
        </div>
      </div>
      {/* Workout Progress — real 14-day completion */}
      <div className="col-span-1 lg:col-span-5 flex flex-col gap-3 w-full">
        <div className="glass-card rounded-[20px] px-4 py-3.5 border border-[var(--border-light)] flex items-center justify-between">
          <div>
            <p className="font-bold text-[13px] text-[var(--text-primary)]">Workout Progress</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{totalWorkouts} / 14 active days (14d window)</p>
          </div>
          <div className="relative w-12 h-12 shrink-0">
            <svg viewBox="0 0 40 40" className="w-12 h-12 -rotate-90">
              <circle cx="20" cy="20" r={ringR} fill="none" stroke="var(--border-light)" strokeWidth="4" />
              <circle cx="20" cy="20" r={ringR} fill="none" stroke="var(--text-primary)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(completedPct / 100) * ringC} ${ringC}`} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[var(--text-primary)]">{completedPct}%</span>
          </div>
        </div>
      </div>
      <div className="col-span-1 lg:col-span-6 bg-(--bg-tertiary) rounded-2xl p-4 sm:p-6 border border-(--border-light)">
        <h3 className="font-bold text-[10px] uppercase tracking-[0.25em] text-(--text-muted) mb-4">Weight / BMI trend</h3>
        {data.bmi.length === 0 ? (
          <EmptyPanel title="No body metrics yet" hint="Set height + weight in onboarding or Profile to start your trend." action="Set body profile" onAction={() => navigate('/onboarding')} />
        ) : (
          <div className="space-y-2">
            {data.bmi.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-[12px] border-b border-(--border-light) py-2">
                <span className="font-bold">{b.date}</span>
                <span className="text-(--text-muted)">{b.weight_kg} kg · BMI {b.bmi}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="col-span-1 lg:col-span-6 bg-(--bg-tertiary) rounded-2xl p-4 sm:p-6 border border-(--border-light)">
        <h3 className="font-bold text-[10px] uppercase tracking-[0.25em] text-(--text-muted) mb-4">Training volume (14d)</h3>
        {data.volume.length === 0 ? (
          <EmptyPanel title="No training volume yet" hint="Log a workout or run to see your 14-day volume." action="Log activity" onAction={() => navigate('/dashboard/workouts')} />
        ) : (
          <div className="space-y-2">
            {data.volume.map((v, i) => (
              <div key={i} className="flex items-center justify-between text-[12px] border-b border-(--border-light) py-2">
                <span className="font-bold">{v.date}</span>
                <span className="text-(--text-muted)">{v.steps} steps · {v.calories_burned} kcal · {v.workout_duration_mins} min</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScatterLegend() {
  const items = [
    { dot: 'bg-(--accent)',                          label: 'Optimal' },
    { dot: 'bg-orange-400',                          label: 'Fair'    },
    { dot: 'bg-red-400',                             label: 'Low'     },
    { dot: 'border-2 border-(--accent) bg-white',    label: 'Current' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-x-4 gap-y-2 text-[9px] font-black uppercase tracking-widest shrink-0">
      {items.map(({ dot, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
          <span className="text-(--text-muted)">{label}</span>
        </span>
      ))}
    </div>
  );
}

function SleepScatterChart({ scatterData, sleepHours, sleepQuality }) {
  const accentColor  = resolveCssVar('--accent',        '#6B8E23');
  const textMuted    = resolveCssVar('--text-muted',    '#9ca3af');
  const borderLight  = resolveCssVar('--border-light',  'rgba(255,255,255,0.08)');
  const bgCard       = resolveCssVar('--bg-card',       '#1f1f1f');
  const textPrimary  = resolveCssVar('--text-primary',  '#ffffff');
  const borderMedium = resolveCssVar('--border-medium', 'rgba(255,255,255,0.16)');

  const chartDataset = {
    datasets: [
      {
        label:                'Sleep Sessions',
        data:                 scatterData.map((d) => ({ x: parseFloat(d.sleep_duration), y: parseInt(d.sleep_quality) })),
        pointBackgroundColor: scatterData.map((d) => getPointColor(parseFloat(d.sleep_duration), parseInt(d.sleep_quality))),
        pointRadius:          6,
        pointHoverRadius:     8,
      },
      {
        label:                'Current',
        data:                 [{ x: sleepHours, y: sleepQuality }],
        pointBackgroundColor: '#ffffff',
        pointBorderColor:     accentColor,
        pointBorderWidth:     2,
        pointRadius:          7,
        pointHoverRadius:     9,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x}h · Quality ${ctx.parsed.y}/10` },
        backgroundColor: bgCard,
        titleColor:      accentColor,
        bodyColor:       textPrimary,
        borderColor:     borderMedium,
        borderWidth:     1,
        padding:         10,
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Sleep Duration (hours)', color: textMuted, font: { size: 10, weight: 'bold', family: 'Inter' } },
        min: 0, max: 13,
        ticks: { color: textMuted, stepSize: 2, callback: (v) => `${v}h`, font: { size: 9 } },
        grid:  { color: borderLight },
      },
      y: {
        title: { display: true, text: 'Quality (1–10)', color: textMuted, font: { size: 10, weight: 'bold', family: 'Inter' } },
        min: 0, max: 11,
        ticks: { color: textMuted, stepSize: 2, font: { size: 9 } },
        grid:  { color: borderLight },
      },
    },
  };

  return (
    <div className="col-span-1 lg:col-span-8 bg-(--bg-tertiary) rounded-2xl p-4 sm:p-6 md:p-8 border border-(--border-light) shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
        <div className="min-w-0 flex-1">
          <h3 className="text-(--text-muted) text-[10px] font-bold uppercase tracking-[0.2em] mb-1 sm:mb-2">
            Sleep Duration vs Quality
          </h3>
          <p className="text-2xl sm:text-3xl md:text-4xl font-black font-['Manrope'] text-(--text-primary) leading-none">
            {sleepHours}h{' '}
            <span className="text-(--accent) text-xs sm:text-sm font-bold ml-1 sm:ml-2">Q{sleepQuality}/10</span>
          </p>
        </div>
        <ScatterLegend />
      </div>
      <div className="h-47.5 xs:h-55 sm:h-62.5 md:h-70 lg:h-75">
        <Scatter data={chartDataset} options={chartOptions} />
      </div>
    </div>
  );
}

function SleepSlider({ label, valueLabel, labelColor, min, max, step, value, onChange, accent }) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex justify-between text-[9px] text-white/20 font-black uppercase tracking-widest">
        <span>{label}</span>
        <span className={labelColor}>{valueLabel}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={onChange}
        style={{ touchAction: 'pan-y' }}
        className={`w-full h-1 bg-(--bg-hover) rounded-full appearance-none cursor-pointer ${accent}`}
      />
    </div>
  );
}

function SleepSyncCard({ sleepHours, setSleepHours, sleepQuality, setSleepQuality, waterIntake, setWaterIntake, sleepStatus, saveStatus, onSave }) {
  const saveBadge = {
    saving: { text: 'Saving…', cls: 'text-(--text-muted)' },
    saved:  { text: '✓ Saved', cls: 'text-(--accent)'     },
    error:  { text: '✕ Error', cls: 'text-red-400'        },
  };

  return (
    <div className="col-span-1 lg:col-span-4">
      <div className="bg-(--bg-tertiary) rounded-2xl p-4 sm:p-6 md:p-8 border border-(--border-light) shadow-sm h-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="p-2 sm:p-2.5 bg-(--bg-hover) rounded-xl">
            <Icon name="bedtime" className="text-(--accent) text-xl sm:text-2xl" fill={1} />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 sm:px-3 py-1 rounded-md border ${sleepStatus.color} ${sleepStatus.border} ${sleepStatus.bg}`}>
              {sleepStatus.level}
            </span>
            <span className="text-[10px] font-bold text-white/40 uppercase">Score: {sleepStatus.score}%</span>
          </div>
        </div>

        <h4 className="text-lg sm:text-xl font-black font-['Manrope'] mb-1 text-(--text-primary)">
          Rest: <span className={sleepStatus.color}>{sleepHours}h</span>
        </h4>
        <p className="text-white/30 text-[11px] leading-relaxed mb-5 sm:mb-8 font-medium">{sleepStatus.label}</p>

        <div className="space-y-4 sm:space-y-6">
          <SleepSlider label="Duration"  valueLabel={`${sleepHours} Hours`} labelColor="text-(--accent)"  min={0} max={12}   step={0.5} value={sleepHours}   onChange={(e) => setSleepHours(parseFloat(e.target.value))}  accent="accent-(--accent)"  />
          <SleepSlider label="Quality"   valueLabel={`${sleepQuality}/10`}  labelColor="text-orange-400" min={1} max={10}   step={1}   value={sleepQuality}  onChange={(e) => setSleepQuality(parseInt(e.target.value))}  accent="accent-orange-400" />
          <SleepSlider label="Hydration" valueLabel={`${waterIntake} ml`}   labelColor="text-blue-400"   min={0} max={5000} step={250} value={waterIntake}   onChange={(e) => setWaterIntake(parseInt(e.target.value))}   accent="accent-blue-400"   />

          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className="w-full py-3 bg-(--accent) hover:bg-(--accent-dark) active:bg-(--accent-dark) disabled:opacity-50 text-[var(--text-inverse)] text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all shadow-[0_5px_15px_rgba(107,142,35,0.25)] touch-manipulation"
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Sleep Log'}
          </button>

          {saveStatus !== 'idle' && saveStatus !== 'saving' && (
            <p className={`text-center text-[9px] font-black uppercase ${saveBadge[saveStatus].cls}`}>
              {saveBadge[saveStatus].text}
            </p>
          )}
          <p className="text-center text-[9px] text-(--text-muted) mt-1">Manual logging — automatic wearable sync isn't available yet.</p>
        </div>
      </div>
    </div>
  );
}

function ZoneBar({ zone }) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-tighter gap-2">
        <span className="text-(--text-secondary) truncate">{zone.label}</span>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {zone.minutes !== undefined && (
            <span className="text-(--text-muted) text-[9px] hidden sm:inline">{zone.minutes}min</span>
          )}
          <span className="text-(--text-primary)">{zone.value}</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-(--bg-hover) rounded-full overflow-hidden">
        <div className={`h-full ${zone.color} transition-all duration-1000`} style={{ width: zone.value }} />
      </div>
    </div>
  );
}

function DistributionZones({ zones, zonesLoading }) {
  return (
    <div className="col-span-1 lg:col-span-12 bg-(--bg-tertiary) rounded-2xl p-4 sm:p-6 md:p-8 border border-(--border-light) shadow-sm">
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <h3 className="font-bold text-[10px] uppercase tracking-[0.25em] text-(--text-muted)">Distribution Zones</h3>
        {zonesLoading && (
          <span className="text-[9px] font-black uppercase tracking-widest text-(--text-muted) animate-pulse">Loading…</span>
        )}
      </div>
      {zones.length === 0 ? (
        <p className="text-(--text-muted) text-[11px] font-bold uppercase tracking-widest text-center py-6">
          No zone data for this period
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {zones.map((zone, i) => <ZoneBar key={i} zone={zone} />)}
        </div>
      )}
    </div>
  );
}

// INNER PAGE — hooks called unconditionally
function AnalyticsInner({ USER_ID }) {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = React.useState(false);
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = React.useState(
    ['training', 'recovery', 'progress'].includes(initialTab) ? initialTab : 'training'
  );
  const focusTarget = searchParams.get('focus');

  // Deep-link from Quick Log (?tab=training&focus=sleep): jump to the sleep form.
  React.useEffect(() => {
    if (focusTarget !== 'sleep') return;
    const t = setTimeout(() => {
      document.getElementById('sleep-log-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
    return () => clearTimeout(t);
  }, [focusTarget, activeTab]);

  const {
    timeframe, setTimeframe,
    sleepHours, setSleepHours,
    sleepQuality, setSleepQuality,
    waterIntake, setWaterIntake,
    scatterData, setScatterData,
    zones, setZones,
    zonesLoading, setZonesLoading,
    saveStatus, setSaveStatus,
    saveTimerRef,
  } = useAnalyticsState();

  
  const { loadSleepAndScatter } = useAnalyticsData({
    USER_ID, timeframe,
    setZones, setZonesLoading,
    setScatterData, setSleepHours,
    setSleepQuality, setWaterIntake,
  });

  const sleepStatus = getSleepStatusReal(sleepHours, sleepQuality);

  const { handleSaveSleep } = useSleepActions({
    USER_ID, sleepHours, sleepQuality,
    waterIntake, sleepStatus, setSaveStatus,
    loadSleepAndScatter, // FIX: was () => {} — now actually refreshes chart + score after save
    saveTimerRef,
  });

  return (
    <div className="flex flex-col md:flex-row min-h-dvh bg-(--bg-primary) text-(--text-primary) font-['Inter'] selection:bg-(--accent) selection:text-[var(--text-inverse)] relative">
      <GlassAmbient />
      <div className="glass-content flex-1 min-w-0">
      <SidebarAnalytics onExpandChange={setSidebarExpanded} />
      <div className="md:hidden">
        <BottomNav variant="biometrics" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <Topbar sidebarExpanded={sidebarExpanded} userId={USER_ID} />

        <main className="pt-14 md:pt-16 p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-350 mx-auto">
          {activeTab === 'progress' ? (
            <ProgressHeader timeframe={timeframe} setTimeframe={setTimeframe} onBack={() => setActiveTab('training')} />
          ) : (
            <PageHeader timeframe={timeframe} setTimeframe={setTimeframe} activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'training' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <SleepScatterChart scatterData={scatterData} sleepHours={sleepHours} sleepQuality={sleepQuality} />
              <div id="sleep-log-form" className="contents">
              <SleepSyncCard
                sleepHours={sleepHours}       setSleepHours={setSleepHours}
                sleepQuality={sleepQuality}   setSleepQuality={setSleepQuality}
                waterIntake={waterIntake}     setWaterIntake={setWaterIntake}
                sleepStatus={sleepStatus}     saveStatus={saveStatus}
                onSave={handleSaveSleep}
              />
              </div>
              <DistributionZones zones={zones} zonesLoading={zonesLoading} />
            </div>
          )}
          {activeTab === 'recovery' && <RecoveryPanel userId={USER_ID} />}
          {activeTab === 'progress' && <ProgressPanel userId={USER_ID} navigate={navigate} />}
        </main>
      </div>
      </div>
    </div>
  );
}


// MAIN PAGE — guards only, no hooks


const Analytics = () => {
  const { user, loading } = useAuth();
  const USER_ID = user?.id;

  if (loading) {
    return (
      <div className="flex min-h-dvh bg-(--bg-primary) items-center justify-center">
        <span className="text-(--accent) text-[11px] font-black uppercase tracking-widest animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  if (!USER_ID) return <Navigate to="/login" replace />;

  return <AnalyticsInner USER_ID={USER_ID} />;
};

export default Analytics;