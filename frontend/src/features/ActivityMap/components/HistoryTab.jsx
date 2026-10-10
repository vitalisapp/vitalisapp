import React from 'react';
import Spinner from '../../../components/ui/Spinner.jsx';
import { useToastStore } from '../../../stores/toastStore.js';
import {
  activityTitle,
  formatShareDate,
  parseRoutePoints,
  renderShareCanvas,
  shareActivityImage,
} from '../utils/activityShare.js';

// Activity feed: athlete header, auto title ("Morning Run"),
// Distance / Moving Time / Pace hero stats, kudos row. No logic changes.

const formatActivityDate = (created_at) => {
  const d = created_at ? new Date(created_at) : null;
  if (!d || Number.isNaN(d.getTime())) return '—';
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} at ${time}`;
};

const KudosButton = ({ active, count, onToggle }) => (
  <button
    onClick={onToggle}
    aria-pressed={active}
    aria-label="Give kudos"
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-all active:scale-95 ${
      active
        ? 'bg-[var(--accent-solid)] border-[var(--accent-solid)] text-[var(--accent-solid-fg)]'
        : 'border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
    }`}
  >
    <span
      className="material-symbols-outlined text-[18px]"
      style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      thumb_up
    </span>
    Kudos
    {count > 0 && <span className="tabular-nums">{count}</span>}
  </button>
);

// Static SVG route thumbnail — route shape with zero map cost
// (no extra Leaflet instances). Downsamples long GPS tracks to ≤120 points.
const MAX_THUMB_POINTS = 120;

const RouteThumbnail = ({ route }) => {
  const pts = parseRoutePoints(route);
  if (pts.length < 2) return null;
  const step = Math.max(1, Math.ceil(pts.length / MAX_THUMB_POINTS));
  const sampled = pts.filter((_, i) => i % step === 0);
  if (sampled[sampled.length - 1] !== pts[pts.length - 1]) sampled.push(pts[pts.length - 1]);

  const lats = sampled.map((p) => p[0]);
  const lngs = sampled.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const W = 400;
  const H = 170;
  const PAD = 22;
  const spanLat = maxLat - minLat || 1e-6;
  const spanLng = maxLng - minLng || 1e-6;
  const x = (lng) => PAD + ((lng - minLng) / spanLng) * (W - PAD * 2);
  const y = (lat) => PAD + (1 - (lat - minLat) / spanLat) * (H - PAD * 2);
  const d = sampled
    .map(([lat, lng], i) => `${i === 0 ? 'M' : 'L'}${x(lng).toFixed(1)},${y(lat).toFixed(1)}`)
    .join(' ');
  const [sLat, sLng] = sampled[0];
  const [eLat, eLng] = sampled[sampled.length - 1];

  return (
    <div className="mt-3 bg-[var(--bg-tertiary)] border-y border-[var(--border-light)]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-36 w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Route map"
      >
        <path
          d={d}
          fill="none"
          stroke="#43C85F"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={x(sLng)} cy={y(sLat)} r="9" fill="#22c55e" stroke="#fff" strokeWidth="3" />
        <circle cx={x(eLng)} cy={y(eLat)} r="9" fill="#ef4444" stroke="#fff" strokeWidth="3" />
      </svg>
    </div>
  );
};

const ActivityCard = ({
  activity,
  formatTime,
  userName,
  kudosOn,
  kudosCount,
  onToggleKudos,
  onShare,
  onDelete,
}) => (
  <article className="glass-card border border-[var(--border-light)] rounded-2xl overflow-hidden">
    {/* Athlete header */}
    <div className="flex items-center gap-3 px-4 pt-4">
      <div className="w-10 h-10 rounded-full bg-[var(--accent-solid)] text-[var(--accent-solid-fg)] flex items-center justify-center font-bold text-[15px] shrink-0">
        {(userName || 'Y').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[var(--text-primary)] truncate">
          {userName || 'You'}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] truncate">
          {formatActivityDate(activity.created_at)}
          {activity.is_gps === 0 && <span className="ml-1.5 font-semibold">· Manual</span>}
        </p>
      </div>
      <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent-dark)] dark:text-[var(--accent)] bg-[var(--accent-bg)] px-2.5 py-1 rounded-full shrink-0">
        <span className="material-symbols-outlined text-[14px]">directions_run</span>
        Run
      </span>
    </div>

    {/* Title */}
    <h3 className="px-4 mt-2 text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
      {activityTitle(activity.created_at)}
    </h3>

    {/* Hero stats */}
    <div className="flex px-4 mt-2 pb-1">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[var(--text-muted)]">Distance</p>
        <p className="text-[19px] font-semibold tabular-nums text-[var(--text-primary)] leading-tight">
          {parseFloat(activity.distance || 0).toFixed(2)}
          <span className="text-[12px] font-normal text-[var(--text-muted)] ml-0.5">km</span>
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[var(--text-muted)]">Moving Time</p>
        <p className="text-[19px] font-semibold tabular-nums text-[var(--text-primary)] leading-tight">
          {formatTime(activity.duration)}
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[var(--text-muted)]">Pace</p>
        <p className="text-[19px] font-semibold tabular-nums text-[var(--text-primary)] leading-tight">
          {activity.pace || '–'}
          <span className="text-[12px] font-normal text-[var(--text-muted)] ml-0.5">/km</span>
        </p>
      </div>
    </div>
    {(Number(activity.calories) || 0) > 0 && (
      <p className="px-4 mt-0.5 text-[11px] text-[var(--text-muted)]">{activity.calories} kcal</p>
    )}

    <RouteThumbnail route={activity.route} />

    {/* Kudos footer */}
    <div className="flex items-center gap-2 px-4 py-3 mt-2 border-t border-[var(--border-light)]">
      <KudosButton active={kudosOn} count={kudosCount} onToggle={onToggleKudos} />
      <button
        aria-label="Comment"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-light)] text-[12px] font-semibold text-[var(--text-muted)] hover:border-[var(--border-medium)] transition-all active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px]">mode_comment</span>
      </button>
      <button
        onClick={onShare}
        aria-label="Share activity"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-light)] text-[12px] font-semibold text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px]">share</span>
      </button>
      <button
        onClick={() => onDelete(activity.id)}
        className="ml-auto text-[12px] font-medium text-[var(--text-disabled)] hover:text-red-500 transition-colors px-2 py-1.5"
      >
        Delete
      </button>
    </div>
  </article>
);

const HistoryTab = ({
  history,
  historyLoading,
  historyError,
  formatTime,
  onRefresh,
  onDelete,
  onToggleKudos,
  userName,
  isOverlay = false,
}) => {
  const handleShare = async (activity) => {
    try {
      const canvas = renderShareCanvas({
        title: activityTitle(activity.created_at),
        dateStr: formatShareDate(activity.created_at),
        distanceKm: activity.distance,
        durationSec: activity.duration,
        pace: activity.pace,
        route: activity.route,
      });
      const slug = activityTitle(activity.created_at).toLowerCase().replace(/\s+/g, '-');
      const result = await shareActivityImage(canvas, {
        filename: `vitalis-${slug}.png`,
        title: activityTitle(activity.created_at),
        text: `${activityTitle(activity.created_at)} — ${parseFloat(activity.distance || 0).toFixed(2)} km on Vitalis`,
      });
      useToastStore
        .getState()
        .addToast(
          result === 'shared' ? 'Shared!' : 'Image downloaded — share it anywhere.',
          'success'
        );
    } catch (err) {
      if (err?.name === 'AbortError') return; // user dismissed the sheet
      useToastStore.getState().addToast('Could not create share image.', 'error');
    }
  };

  const refreshBtn = (
    <button
      onClick={onRefresh}
      className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--accent-dark)] dark:text-[var(--accent)] hover:opacity-70 transition-opacity px-3 py-1.5 rounded-lg bg-[var(--bg-hover)]"
    >
      ↺ Refresh
    </button>
  );

  if (historyLoading) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-6">
        <div className="flex items-center justify-center py-16">
          <Spinner className="w-6 h-6" />
        </div>
      </div>
    );
  }

  if (historyError) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-6">
        <div className="text-center py-12 bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <p className="text-red-400 text-sm font-medium">⚠ {historyError}</p>
          <p className="text-[var(--text-muted)] text-xs mt-2">
            Check your connection and try again
          </p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-6">
        {!isOverlay && (
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Home
            </h2>
            {refreshBtn}
          </div>
        )}
        <div className="text-center py-16 glass-card rounded-2xl border border-[var(--border-light)]">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--accent-bg)] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[28px] text-[var(--accent)]">
              directions_run
            </span>
          </div>
          <p className="text-[var(--text-primary)] font-bold">No activities yet</p>
          <p className="text-[var(--text-muted)] text-xs mt-1">
            Record your first run and it will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className={`mx-auto w-full max-w-[560px] ${isOverlay ? 'p-3' : 'p-3 sm:p-4 md:p-6'}`}>
        {!isOverlay && (
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Home
            </h2>
            {refreshBtn}
          </div>
        )}
        {isOverlay && <div className="flex justify-end mb-2">{refreshBtn}</div>}
        <div className="space-y-3">
          {history.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              formatTime={formatTime}
              userName={userName}
              kudosOn={!!activity.kudos_given}
              kudosCount={Number(activity.kudos_count) || 0}
              onToggleKudos={() => onToggleKudos?.(activity.id)}
              onShare={() => handleShare(activity)}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;
