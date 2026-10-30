import { useState } from "react";
import Icon from "../../../../components/Icon.jsx";
import { apiPost } from "../../../../lib/apiClient.js";
import { useToastStore } from "../../../../stores/toastStore.js";

// ── Manual workout entry (Module 5) ─────────────────────────────────────────
// For sessions that don't use the camera tracker. Creates one completed
// workout_logs row (total reps) plus set rows for the single session exercise.
const TYPE_SUGGESTIONS = ['strength', 'push', 'pull', 'leg day', 'upper body', 'lower body', 'cardio', 'general'];

// One exercise per entry: the session name is the exercise, sets/reps/weight
// describe the whole session. Set rows are created for that single exercise so
// history can show "3 sets × 12 reps · 1,440 kg volume" without extra rows.
const MAX_SETS_PER_LOG = 99;
const MAX_REPS_PER_SET = 1000;
const MAX_WEIGHT_KG = 1000;

function clampSets(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(MAX_SETS_PER_LOG, Math.round(n)));
}

function clampReps(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(MAX_REPS_PER_SET, Math.round(n)));
}

function clampWeight(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(MAX_WEIGHT_KG, Math.round(n * 100) / 100));
}

// The API rejects performed_at in the future. Local noon can still be ahead of
// the server clock when the workout is logged in the morning, so the timestamp
// is clamped to "now" — and always sent as an explicit UTC ISO string so the
// server never has to guess the timezone (that mismatch caused 400s before).
function performedAtToIso(dateKey) {
  if (!dateKey) return undefined;
  const when = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(when.getTime())) return undefined;
  return new Date(Math.min(when.getTime(), Date.now())).toISOString();
}

export default function AddWorkoutModal({ onClose, onSaved, initialTitle = '' }) {
  const [type,       setType]        = useState(initialTitle.trim() || 'Strength');
  const [duration,   setDuration]    = useState(45);
  const [performedAt,setPerformedAt] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [sets,       setSets]        = useState('');
  const [reps,       setReps]        = useState('');
  const [weight,     setWeight]      = useState('');
  const [saving,     setSaving]      = useState(false);
  const [error,      setError]       = useState(null);

  const canSave = String(type).trim() !== ''
    && Number(duration) >= 1;

  const submit = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    try {
      const setCount = clampSets(sets);
      const repsPerSet = reps === '' ? 0 : clampReps(reps);
      const weightKg = weight === '' ? 0 : clampWeight(weight);
      const workoutType = type.trim();
      const hasSetData = repsPerSet > 0 || weightKg > 0;
      const payload = {
        workout_type: workoutType,
        duration_minutes: Math.round(Number(duration)),
        performed_at: performedAtToIso(performedAt),
        rep_count: repsPerSet > 0 ? repsPerSet * setCount : 0,
        ...(hasSetData
          ? {
              sets: Array.from({ length: setCount }, (_, i) => ({
                exercise_name: workoutType,
                set_number: i + 1,
                ...(repsPerSet > 0 ? { reps: repsPerSet } : {}),
                ...(weightKg > 0 ? { weight_kg: weightKg } : {}),
              })),
            }
          : {}),
      };
      const log = await apiPost('/api/workout-logs/manual', payload);
      useToastStore.getState().addToast('Workout logged', 'success');
      onSaved?.(log);
      onClose?.();
    } catch (e) {
      setError(e.message || 'Could not save workout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-end sm:items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(6px)' }}
      role="dialog" aria-modal="true" aria-label="Log a workout"
      tabIndex={-1}
      onKeyDown={(e) => { if (e.key === 'Escape' && !saving) onClose?.(); }}
    >
      <div className="w-full max-w-lg my-auto glass-card border border-[var(--border-light)] rounded-3xl p-5 sm:p-7 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[length:var(--fs-9)] font-black uppercase tracking-widest text-[var(--text-muted)] block">Manual entry</span>
            <h3 className="text-lg font-black tracking-tight text-[var(--text-primary)]">Log a workout</h3>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="w-10 h-10 rounded-full bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] flex items-center justify-center transition-colors"
          >
            <Icon name="close" className="text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="col-span-2 sm:col-span-4 flex flex-col gap-1.5">
            <span className="text-[length:var(--fs-9)] font-black uppercase tracking-widest text-[var(--text-muted)]">Session name</span>
            <input
              list="wt-types"
              value={type}
              onChange={(e) => setType(e.target.value)}
              maxLength={100}
              className="h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] px-4 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-border)]"
            />
            <datalist id="wt-types">
              {TYPE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
            </datalist>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[length:var(--fs-9)] font-black uppercase tracking-widest text-[var(--text-muted)]">Duration (mins)</span>
            <input
              type="number" min="1" max="1440" step="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] px-4 text-sm font-bold tabular-nums text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-border)]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[length:var(--fs-9)] font-black uppercase tracking-widest text-[var(--text-muted)]">Sets</span>
            <input
              type="number" min="1" max={MAX_SETS_PER_LOG} step="1" placeholder="e.g. 3"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              className="h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] px-4 text-sm font-bold tabular-nums text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:border-[var(--accent-border)]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[length:var(--fs-9)] font-black uppercase tracking-widest text-[var(--text-muted)]">Reps</span>
            <input
              type="number" min="0" max={MAX_REPS_PER_SET} step="1" placeholder="e.g. 12"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] px-4 text-sm font-bold tabular-nums text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:border-[var(--accent-border)]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[length:var(--fs-9)] font-black uppercase tracking-widest text-[var(--text-muted)]">Weight (kg)</span>
            <input
              type="number" min="0" max={MAX_WEIGHT_KG} step="0.5" placeholder="e.g. 40"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] px-4 text-sm font-bold tabular-nums text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:border-[var(--accent-border)]"
            />
          </label>
          <label className="col-span-2 sm:col-span-4 flex flex-col gap-1.5">
            <span className="text-[length:var(--fs-9)] font-black uppercase tracking-widest text-[var(--text-muted)]">Date performed</span>
            <input
              type="date" max={new Date().toLocaleDateString('en-CA')}
              value={performedAt}
              onChange={(e) => setPerformedAt(e.target.value)}
              className="h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] px-4 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-border)]"
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 text-[length:var(--fs-11)] font-bold text-[var(--error)]" role="alert">⚠ {error}</p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3.5 min-h-[52px] rounded-xl font-bold text-sm border transition-all"
            style={{ borderColor: 'var(--border-medium)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!canSave || saving}
            className="flex-1 py-3.5 rounded-xl bg-[var(--accent)] text-[var(--text-inverse)] text-[length:var(--fs-15)] font-bold hover:bg-[var(--accent-hover)] active:scale-[0.99] transition-all min-h-[52px] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save workout'}
          </button>
        </div>
      </div>
    </div>
  );
}
