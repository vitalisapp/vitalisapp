

// ── Early-exit confirmation dialog ───────────────────────────────────────────
// Receives plain values (not refs) so it never reads .current in JSX.
function EarlyExitDialog({ mode = undefined, reps = undefined, holdSecs = undefined, minReps = undefined, minHoldSecs = undefined, elapsedMins = undefined, requiredMins = undefined, onConfirm = undefined, onCancel = undefined }) {
  const progressText = mode === 'hold'
    ? <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{Math.floor(holdSecs)}s held</span>
    : <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{reps} rep{reps !== 1 ? 's' : ''}</span>;
  const needText = requiredMins > 0
    ? ` This day requires at least ${requiredMins} mins to be marked complete.`
    : mode === 'hold'
      ? ` You need at least ${minHoldSecs}s held to complete this day.`
      : ` You need at least ${minReps} reps to complete this day.`;
  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Workout incomplete"
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel?.(); }}
      tabIndex={-1}
    >
      <div className="w-full max-w-sm my-auto rounded-2xl border shadow-2xl p-6 max-h-[90dvh] overflow-y-auto"
           style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
             style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <span className="material-symbols-outlined text-red-400 text-[length:var(--fs-22)]"
                style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
        </div>

        <h3 className="text-base font-black text-center mb-1"
            style={{ color: 'var(--text-primary)' }}>Workout Incomplete</h3>
        <p className="text-xs text-center mb-5 leading-relaxed"
           style={{ color: 'var(--text-muted)' }}>
          You've only done {progressText} in{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{elapsedMins} min{elapsedMins !== 1 ? 's' : ''}</span>.
          {needText}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 min-h-[48px] rounded-xl font-bold text-sm border transition-all"
            style={{ borderColor: 'var(--border-medium)', color: 'var(--text-muted)' }}
          >
            Keep Going
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 min-h-[48px] rounded-xl font-bold text-sm transition-all"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171',
                     border: '1px solid rgba(239,68,68,0.3)' }}
          >
            End Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

export default EarlyExitDialog;
