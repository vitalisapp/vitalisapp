// Early-exit confirmation dialog.
// Receives plain values (not refs) so it never reads .current in JSX.
export default function EarlyExitDialog({ mode, reps, holdSecs, minReps, minHoldSecs, elapsedMins, requiredMins, onConfirm, onCancel }) {
  const progressText = mode === 'hold'
    ? <span className="text-[var(--accent)] font-bold">{Math.floor(holdSecs)}s held</span>
    : <span className="text-[var(--accent)] font-bold">{reps} rep{reps !== 1 ? 's' : ''}</span>;
  const needText = requiredMins > 0
    ? ` This day requires at least ${requiredMins} mins to be marked complete.`
    : mode === 'hold'
      ? ` You need at least ${minHoldSecs}s held to complete this day.`
      : ` You need at least ${minReps} reps to complete this day.`;
  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 overflow-y-auto bg-[var(--bg-overlay)]"
      role="dialog"
      aria-modal="true"
      aria-label="Workout incomplete"
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel?.(); }}
      tabIndex={-1}
    >
      <div className="w-full max-w-sm my-auto rounded-2xl border shadow-2xl p-6 max-h-[90dvh] overflow-y-auto bg-[var(--bg-secondary)] border-[var(--border-medium)]">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto bg-[var(--error-bg)] border border-[var(--error)]">
          <span className="material-symbols-outlined text-red-400 text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
        </div>

        <h3 className="text-base font-black text-center mb-1 text-[var(--text-primary)]">Workout Incomplete</h3>
        <p className="text-xs text-center mb-5 leading-relaxed text-[var(--text-muted)]">
          You've only done {progressText} in{' '}
          <span className="text-[var(--accent)] font-bold">{elapsedMins} min{elapsedMins !== 1 ? 's' : ''}</span>.
          {needText}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 min-h-[48px] rounded-xl font-bold text-sm border transition-all border-[var(--border-medium)] text-[var(--text-muted)]"
          >
            Keep Going
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 min-h-[48px] rounded-xl font-bold text-sm transition-all bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error)]"
          >
            End Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
