import Icon from "../../../../components/Icon.jsx";
import Modal from "../../../../components/ui/Modal.jsx";
import { resolveWorkout } from '../constants/workoutGuide.js';

// ── Exercise choice: after picking a card, decide HOW to log the session ────
// Offered for every library exercise: launch the AI camera tracker, or enter
// the session by hand (reps / sets / weight) through the reused manual modal.
// Built on the shared Modal so it gets Escape-to-close, a focus trap, focus
// restore, scroll lock and the app's modal z-index for free.
export default function ExerciseChoiceModal({ exercise = undefined, onUseCamera = undefined, onLogManually = undefined, onClose = undefined }) {
  const workout = resolveWorkout(exercise?.id);
  const selfTracked = workout?.mode !== 'hold' && workout?.counterType === 'generic';
  return (
    <Modal
      isOpen={!!exercise}
      onClose={onClose}
      size="lg"
      icon="fitness_center"
      title={exercise?.label || 'Selected exercise'}
      subtitle="How do you want to train?"
    >
      {exercise?.img && (
        <div className="mb-4 flex justify-center">
          <img
            src={exercise.img}
            alt=""
            className="w-20 h-20 rounded-2xl object-contain border border-[var(--border-light)]"
            style={{ background: '#1E1E1E' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onUseCamera}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-bg)] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all text-left"
        >
          <span className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[var(--accent)] text-[var(--text-inverse)] flex items-center justify-center shrink-0">
            <Icon name="videocam" className="text-[length:var(--fs-20)]" />
          </span>
          <span className="min-w-0">
            <span className="block text-[length:var(--fs-13)] font-black text-[var(--text-primary)]">Use camera</span>
            <span className="block text-[length:var(--fs-11)] text-[var(--text-muted)] font-semibold mt-0.5">{selfTracked ? 'Workout timer & self-tracked reps' : workout?.mode === 'hold' ? 'Hold timer & live form feedback' : 'AI rep counting & live form feedback'}</span>
          </span>
          <span className="material-symbols-outlined ml-auto text-[length:var(--fs-18)] text-[var(--accent)] shrink-0">arrow_forward</span>
        </button>

        <button
          type="button"
          onClick={onLogManually}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-hover)]/50 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all text-left"
        >
          <span className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] flex items-center justify-center shrink-0">
            <Icon name="edit_note" className="text-[length:var(--fs-20)]" />
          </span>
          <span className="min-w-0">
            <span className="block text-[length:var(--fs-13)] font-black text-[var(--text-primary)]">Log manually</span>
            <span className="block text-[length:var(--fs-11)] text-[var(--text-muted)] font-semibold mt-0.5">Enter reps, sets &amp; weight — no camera</span>
          </span>
          <span className="material-symbols-outlined ml-auto text-[length:var(--fs-18)] text-[var(--text-muted)] shrink-0">arrow_forward</span>
        </button>
      </div>
    </Modal>
  );
}
