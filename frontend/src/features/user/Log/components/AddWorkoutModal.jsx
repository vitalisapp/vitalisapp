import { useId, useState } from "react";
import Modal from "../../../../components/ui/Modal.jsx";
import { apiPost } from "../../../../lib/apiClient.js";
import { useToastStore } from "../../../../stores/toastStore.js";
import "./addWorkout.css";

// ── Manual workout entry (Module 5) ─────────────────────────────────────────
// For sessions that don't use the camera tracker. Creates one completed
// workout_logs row (total reps) plus set rows for the single session exercise.
//
// Built on the shared <Modal>: it portals to <body> (so it always sits above
// the topbar instead of being trapped in the page's stacking context), locks
// scroll, traps focus, closes on Esc/backdrop and animates in/out.
// Props are unchanged so callers (Progress page, Camera workout) keep working.
const TYPE_SUGGESTIONS = ['Strength', 'Push', 'Pull', 'Leg day', 'Upper body', 'Lower body', 'Cardio', 'General'];

const MAX_SETS_PER_LOG = 99;
const MAX_REPS_PER_SET = 1000;
const MAX_WEIGHT_KG = 1000;
const MAX_DURATION_MIN = 1440;

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

function Field({ id = undefined, label = undefined, hint = undefined, error = undefined, suffix = undefined, children = undefined }) {
  return (
    <div className="aw-field">
      <label htmlFor={id} className="aw-label">{label}</label>
      <div className={`aw-control${suffix ? ' has-suffix' : ''}${error ? ' is-invalid' : ''}`}>
        {children}
        {suffix && <span className="aw-suffix" aria-hidden="true">{suffix}</span>}
      </div>
      {error
        ? <span className="aw-hint aw-hint--error" id={`${id}-msg`}>{error}</span>
        : hint && <span className="aw-hint" id={`${id}-msg`}>{hint}</span>}
    </div>
  );
}

export default function AddWorkoutModal({ onClose = undefined, onSaved = undefined, initialTitle = '' }) {
  const uid = useId();
  const today = new Date().toLocaleDateString('en-CA');
  const [open,        setOpen]        = useState(true);
  const [type,        setType]        = useState(initialTitle.trim() || 'Strength');
  const [duration,    setDuration]    = useState('45');
  const [performedAt, setPerformedAt] = useState(today);
  const [sets,        setSets]        = useState('');
  const [reps,        setReps]        = useState('');
  const [weight,      setWeight]      = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);

  const nameError = String(type).trim() === '' ? 'Enter a workout name.' : null;
  const durationNum = Number(duration);
  const durationError = duration === '' || !Number.isFinite(durationNum) || durationNum < 1
    ? 'Enter at least 1 minute.'
    : durationNum > MAX_DURATION_MIN ? 'Maximum is 24 hours (1440 min).' : null;
  const dateError = !performedAt ? 'Pick a date.' : performedAt > today ? 'Date can’t be in the future.' : null;
  const canSave = !nameError && !durationError && !dateError;

  // Live summary of the optional set details, e.g. "3 × 12 reps · 40 kg · 1,440 kg volume".
  const setCount = sets === '' ? null : clampSets(sets);
  const repsPerSet = reps === '' ? 0 : clampReps(reps);
  const weightKg = weight === '' ? 0 : clampWeight(weight);
  const summaryParts = [];
  if (repsPerSet > 0) summaryParts.push(`${setCount ?? 1} × ${repsPerSet} reps`);
  if (weightKg > 0) summaryParts.push(`${weightKg} kg`);
  if (repsPerSet > 0 && weightKg > 0) {
    summaryParts.push(`${Math.round((setCount ?? 1) * repsPerSet * weightKg).toLocaleString()} kg volume`);
  }

  const requestClose = () => { if (!saving) setOpen(false); };

  const submit = async (e) => {
    e?.preventDefault();
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    try {
      const count = clampSets(sets);
      const workoutType = type.trim();
      const hasSetData = repsPerSet > 0 || weightKg > 0;
      const payload = {
        workout_type: workoutType,
        duration_minutes: Math.round(durationNum),
        performed_at: performedAtToIso(performedAt),
        rep_count: repsPerSet > 0 ? repsPerSet * count : 0,
        ...(hasSetData
          ? {
              sets: Array.from({ length: count }, (_, i) => ({
                exercise_name: workoutType,
                set_number: i + 1,
                ...(repsPerSet > 0 ? { reps: repsPerSet } : {}),
                ...(weightKg > 0 ? { weight_kg: weightKg } : {}),
              })),
            }
          : {}),
      };
      const log = await apiPost('/api/workout-logs/manual', payload);
      const kcal = Number(log?.calories_burned) || 0;
      useToastStore.getState().addToast(kcal > 0 ? `Workout logged · ${kcal.toLocaleString()} kcal burned` : 'Workout logged', 'success');
      onSaved?.(log);
      setOpen(false);
    } catch (err) {
      setError(err.message || 'Could not save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formId = `${uid}-form`;

  return (
    <Modal
      isOpen={open}
      onClose={requestClose}
      onExited={onClose}
      title="Log a workout"
      subtitle="Add a session you did without the camera."
      size="lg"
      closeOnBackdrop={!saving}
      closeOnEsc={!saving}
      footer={(
        <div className="aw-footer">
          <button type="button" className="aw-btn aw-btn--ghost" onClick={requestClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form={formId} className="aw-btn aw-btn--primary" disabled={!canSave || saving}>
            {saving ? 'Saving…' : 'Save workout'}
          </button>
        </div>
      )}
    >
      <form id={formId} className="aw-form" onSubmit={submit} noValidate>
        <Field id={`${uid}-name`} label="Workout name" error={nameError}>
          <input
            id={`${uid}-name`}
            className="aw-input"
            list={`${uid}-types`}
            value={type}
            onChange={(e) => setType(e.target.value)}
            maxLength={100}
            autoComplete="off"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? `${uid}-name-msg` : undefined}
          />
          <datalist id={`${uid}-types`}>
            {TYPE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
          </datalist>
        </Field>

        <div className="aw-row aw-row--2">
          <Field id={`${uid}-date`} label="Date" error={dateError}>
            <input
              id={`${uid}-date`}
              className="aw-input"
              type="date"
              max={today}
              value={performedAt}
              onChange={(e) => setPerformedAt(e.target.value)}
              aria-invalid={Boolean(dateError)}
            />
          </Field>
          <Field id={`${uid}-duration`} label="Duration" suffix="min" error={durationError}>
            <input
              id={`${uid}-duration`}
              className="aw-input"
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_DURATION_MIN}
              step="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              aria-invalid={Boolean(durationError)}
            />
          </Field>
        </div>

        <fieldset className="aw-group">
          <legend className="aw-group-title">
            Sets &amp; reps <span>Optional</span>
          </legend>
          <div className="aw-row aw-row--3">
            <Field id={`${uid}-sets`} label="Sets">
              <input
                id={`${uid}-sets`}
                className="aw-input"
                type="number"
                inputMode="numeric"
                min="1"
                max={MAX_SETS_PER_LOG}
                step="1"
                placeholder="3"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
              />
            </Field>
            <Field id={`${uid}-reps`} label="Reps per set">
              <input
                id={`${uid}-reps`}
                className="aw-input"
                type="number"
                inputMode="numeric"
                min="0"
                max={MAX_REPS_PER_SET}
                step="1"
                placeholder="12"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </Field>
            <Field id={`${uid}-weight`} label="Weight" suffix="kg">
              <input
                id={`${uid}-weight`}
                className="aw-input"
                type="number"
                inputMode="decimal"
                min="0"
                max={MAX_WEIGHT_KG}
                step="0.5"
                placeholder="40"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </Field>
          </div>
          <p className="aw-summary" aria-live="polite">
            {summaryParts.length ? summaryParts.join(' · ') : 'Leave empty if you only want to record time.'}
          </p>
        </fieldset>

        {error && <p className="aw-error" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
