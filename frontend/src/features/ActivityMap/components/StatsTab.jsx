import React from 'react';

// Vitalis progress: big numbers, accent highlights, trophy card
// for the longest effort. No logic changes.

const TotalCard = ({ label, value, unit }) => (
  <div className="glass-card border border-[var(--border-light)] rounded-2xl p-4 sm:p-5">
    <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
    <p className="text-3xl md:text-4xl font-semibold tabular-nums tracking-tight text-[var(--text-primary)] mt-0.5">
      {value}
      {unit && <span className="text-base font-normal text-[var(--text-muted)] ml-1">{unit}</span>}
    </p>
  </div>
);

const AvgCard = ({ label, value, unit }) => (
  <div className="glass-card border border-[var(--border-light)] rounded-2xl p-4">
    <p className="text-[11px] text-[var(--text-muted)] mb-1">{label}</p>
    <p className="text-2xl font-semibold tabular-nums tracking-tight text-[var(--text-primary)]">
      {value}
      {unit && <span className="text-xs font-normal text-[var(--text-muted)] ml-1">{unit}</span>}
    </p>
  </div>
);

const BestEffortCard = ({ bestRun }) => (
  <div className="glass-card border border-[var(--border-light)] rounded-2xl p-4 sm:p-5">
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-full bg-[var(--accent-bg)] flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[22px] text-[var(--accent)]">emoji_events</span>
      </div>
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Best Effort</h3>
        <p className="text-[15px] font-bold text-[var(--text-primary)]">
          {Number(bestRun.distance).toFixed(1)} <span className="text-[12px] font-normal text-[var(--text-muted)]">km</span>
          <span className="text-[12px] font-normal text-[var(--text-muted)]"> · {new Date(bestRun.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </p>
      </div>
    </div>
  </div>
);

const StatsTab = ({ stats, statsLoading, statsError, formatTime, isOverlay = false }) => {
  const totals = (compact) => (
    <div className={compact ? 'space-y-2.5' : 'space-y-3'}>
      <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-2.5 sm:gap-3`}>
        <TotalCard label="Runs" value={stats.totalRuns ?? 0} />
        <TotalCard label="Distance" value={parseFloat(stats.totalDistance || 0).toFixed(1)} unit="km" />
        <TotalCard label="Time" value={formatTime(parseInt(stats.totalDuration) || 0)} />
        <TotalCard label="Calories" value={parseInt(stats.totalCalories) || 0} unit="kcal" />
      </div>

      {stats.totalRuns > 0 && (
        <div className={compact ? '' : 'border-t border-[var(--border-light)] pt-4 mt-4'}>
          {!compact && (
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Average Per Run
            </h3>
          )}
          {compact && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Average per run</p>
          )}
          <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-2.5 sm:gap-3`}>
            <AvgCard label="Avg distance" value={(stats.totalDistance / stats.totalRuns).toFixed(1)} unit="km" />
            <AvgCard label="Avg time" value={formatTime(Math.floor(stats.totalDuration / stats.totalRuns))} />
            <AvgCard label="Avg calories" value={Math.floor(stats.totalCalories / stats.totalRuns)} unit="kcal" />
          </div>
        </div>
      )}

      {stats.bestRun && <BestEffortCard bestRun={stats.bestRun} />}
    </div>
  );

  if (isOverlay) {
    return (
      <div className="p-3">
        {statsLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--border-light)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        )}
        {statsError && (
          <div className="text-center py-8">
            <p className="text-red-400 text-[10px]">⚠ {statsError}</p>
          </div>
        )}
        {!statsLoading && !statsError && stats && totals(true)}
        {!statsLoading && !statsError && !stats && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-[var(--text-muted)] text-[10px]">No statistics yet</p>
            <p className="text-[var(--text-disabled)] text-[8px] mt-1">Complete a run to see stats!</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[640px] p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
          Progress
        </h2>

        {statsLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[var(--border-light)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        )}

        {statsError && (
          <div className="text-center py-12 bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
            <p className="text-red-400 text-sm font-medium">⚠ {statsError}</p>
            <p className="text-[var(--text-muted)] text-xs mt-2">Unable to load statistics</p>
          </div>
        )}

        {!statsLoading && !statsError && stats && totals(false)}

        {!statsLoading && !statsError && !stats && (
          <div className="text-center py-16 glass-card rounded-2xl border border-[var(--border-light)]">
            <div className="w-14 h-14 mx-auto rounded-full bg-[var(--accent-bg)] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[28px] text-[var(--accent)]">bar_chart</span>
            </div>
            <p className="text-[var(--text-primary)] font-bold">No statistics yet</p>
            <p className="text-[var(--text-muted)] text-xs mt-1">Complete your first run to see progress!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsTab;
