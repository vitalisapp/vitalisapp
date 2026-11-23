import Modal from '../../../../components/ui/Modal.jsx';

// Shared Modal: Escape-to-close, focus trap, scroll lock and the app's modal
// z-index (was a hand-rolled z-[9999] layer that buried toasts underneath).
// The Leaflet map sits in its own stacking context (.leaflet-container
// z-index: 0), so its panes never paint over the modal.
const RunAnalysisOverlay = ({ analysis = undefined, onClose = undefined }) => {
  if (!analysis) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      icon="insights"
      title="AI Run Analysis"
      subtitle="Powered by Vitalis AI"
      footer={(
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] bg-[var(--accent)] text-[var(--text-inverse)] rounded-full py-3 text-[length:var(--fs-11)] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
        >
          Let's Go! 🚀
        </button>
      )}
    >
      <div className="flex justify-center mb-3" aria-hidden="true">
        <span className="text-4xl">{analysis.emoji_verdict || '🏃'}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-4 mb-4 border-b border-[var(--border-light)]">
          <div className="text-center min-w-0">
            <p className="text-[length:var(--fs-11)] sm:text-[length:var(--fs-13)] font-black text-[var(--text-primary)] truncate">{analysis.stats?.distance || '0'}</p>
            <p className="text-[length:var(--fs-8)] uppercase tracking-widest text-[var(--text-muted)] font-bold">Distance</p>
          </div>
          <div className="text-center min-w-0">
            <p className="text-[length:var(--fs-11)] sm:text-[length:var(--fs-13)] font-black text-[var(--text-primary)] truncate">{analysis.stats?.duration || '0:00'}</p>
            <p className="text-[length:var(--fs-8)] uppercase tracking-widest text-[var(--text-muted)] font-bold">Time</p>
          </div>
          <div className="text-center min-w-0">
            <p className="text-[length:var(--fs-11)] sm:text-[length:var(--fs-13)] font-black text-[var(--text-primary)] truncate">{analysis.stats?.pace || '0:00'}</p>
            <p className="text-[length:var(--fs-8)] uppercase tracking-widest text-[var(--text-muted)] font-bold">Pace</p>
          </div>
          <div className="text-center min-w-0">
            <p className="text-[length:var(--fs-11)] sm:text-[length:var(--fs-13)] font-black text-[var(--text-primary)] truncate">{analysis.stats?.calories || '0'}</p>
            <p className="text-[length:var(--fs-8)] uppercase tracking-widest text-[var(--text-muted)] font-bold">Calories</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[length:var(--fs-9)] font-black uppercase tracking-widest text-[var(--accent)]/60 mb-1.5">Run Summary</p>
            <p className="text-[length:var(--fs-12)] sm:text-[length:var(--fs-13)] text-[var(--text-secondary)] leading-relaxed break-words">{analysis.summary || 'Great run! Keep up the good work.'}</p>
          </div>
          <div className="bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-2xl px-4 py-3">
            <p className="text-[length:var(--fs-9)] font-black uppercase tracking-widest text-[var(--accent)] mb-1.5">🔮 30-Day Prediction</p>
            <p className="text-[length:var(--fs-12)] sm:text-[length:var(--fs-13)] text-[var(--text-secondary)] leading-relaxed break-words">{analysis.prediction || 'Consistency will lead to significant improvements.'}</p>
          </div>
          <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-2xl px-4 py-3">
            <p className="text-[length:var(--fs-9)] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1.5">💡 Next Run Tip</p>
            <p className="text-[length:var(--fs-12)] sm:text-[length:var(--fs-13)] text-[var(--text-secondary)] leading-relaxed break-words">{analysis.tip || 'Focus on maintaining a steady pace throughout.'}</p>
          </div>
        </div>
    </Modal>
  );
};

export default RunAnalysisOverlay;
