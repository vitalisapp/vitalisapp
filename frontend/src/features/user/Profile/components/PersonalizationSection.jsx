import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/apiClient.js';
import Icon from '../../../../components/Icon.jsx';
import Button from '../../../../components/ui/Button.jsx';
import {
  ACTIVITY_LEVELS,
  EXERCISE_FREQ,
  EXERCISE_FREQ_LABELS,
} from '../../Onboarding/constants/goals.js';
import { SLEEP_CHOICES } from '../../../../lib/bmi.js';
import { ageOn } from '../../../../lib/age.js';
import SleepNote from '../../../../components/health/SleepNote.jsx';
import ActivityDetail from '../../../../components/health/ActivityDetail.jsx';

// Common allergens offered as toggle chips; "Something else?" adds free text.
// Mirrors onboarding's ALLERGEN_PRESETS so the two screens stay in sync.
const ALLERGEN_PRESETS = ['Gluten', 'Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Fish', 'Shellfish', 'Soy', 'Sesame'];
const MAX_CUSTOM = 40;

// Eyebrow label used by every field. Matches Profile.jsx's shared <Eyebrow>.
const FieldLabel = ({ children = undefined, hint = undefined }) => (
  <div className="flex items-baseline justify-between gap-2">
    <span className="text-[length:var(--fs-10)] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">{children}</span>
    {hint && <span className="text-[length:var(--fs-9)] text-[var(--text-disabled)] shrink-0">{hint}</span>}
  </div>
);

// Horizontal pill strip. flex-wrap keeps tiny 320px screens readable, and the
// active pill stays legible in both themes (accent bg + inverse text).
const PillGroup = ({ label = undefined, hint = undefined, value = undefined, options = undefined, onChange = undefined }) => (
  <div>
    <FieldLabel hint={hint}>{label}</FieldLabel>
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((o) => (
        <button
          type="button"
          key={o.key}
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
          className={`h-10 px-4 rounded-full text-[length:var(--fs-12)] font-bold uppercase tracking-wider border transition-colors ${
            value === o.key
              ? 'bg-[var(--accent)] text-[var(--text-inverse)] border-[var(--accent)]'
              : 'border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

export default function PersonalizationSection({ userId = undefined, onboarding = undefined, onSaved = undefined, showToast = undefined }) {
  const [allergies, setAllergies] = useState([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [exerciseFreq, setExerciseFreq] = useState('');
  const [sleepHours, setSleepHours] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Seed lifestyle fields from the active goal (already loaded by Profile).
  useEffect(() => {
    if (!onboarding) return;
    setActivityLevel(onboarding.activityLevel || '');
    setExerciseFreq(onboarding.exerciseFreq || '');
    setSleepHours(onboarding.sleepHours != null ? Number(onboarding.sleepHours) : null);
  }, [onboarding]);
  const userAge = onboarding?.dob ? ageOn(String(onboarding.dob).slice(0, 10)) : null;

  // Load saved allergies once. Best-effort: a failure just leaves the list empty.
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    apiFetch('/api/auth/allergies')
      .then((d) => { if (alive) setAllergies(Array.isArray(d?.allergies) ? d.allergies : []); })
      .catch(() => {});
    return () => { alive = false; };
  }, [userId]);

  const toggleAllergy = (name) =>
    setAllergies((list) => (list.includes(name) ? list.filter((x) => x !== name) : [...list, name]));

  const addCustomAllergy = () => {
    const v = customAllergy.trim();
    if (v.length < 2 || allergies.length >= 30) return;
    if (!allergies.some((x) => x.toLowerCase() === v.toLowerCase())) setAllergies((l) => [...l, v]);
    setCustomAllergy('');
  };

  // Custom entries are anything outside the preset list — shown as removable
  // chips so users can undo a typo without clearing the whole set.
  const customAllergies = allergies.filter((a) => !ALLERGEN_PRESETS.includes(a));


  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      // Allergies: whole-list replace via the existing onboarding endpoint.
      await apiFetch('/api/auth/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify({ allergies }),
      });
      // Lifestyle: carriedBody keeps dob/sex/height/weight/goal/target/pace,
      // overrides only these fields, then regenerates the plan + calorie targets.
      const data = await apiFetch(`/api/goals/${userId}/change`, {
        method: 'PATCH',
        body: JSON.stringify({
          activityLevel,
          exerciseFreq,
          sleepHours,
        }),
      });
      onSaved?.(data?.goal);
      showToast?.('Personalization saved — plan updated');
    } catch (err) {
      setError(err.message || 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <p className="bg-[var(--error-bg)] border border-[var(--error)]/20 rounded-xl text-[var(--error)] text-[length:var(--fs-11)] font-semibold p-2.5 flex items-center gap-2">
          <Icon name="error" className="text-[length:var(--fs-16)] shrink-0" />
          <span className="min-w-0">{error}</span>
        </p>
      )}

      {/* Food Allergies — presets + custom, with custom entries removable */}
      <div>
        <FieldLabel hint="Flagged in meal scans">Food Allergies</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-2">
          {ALLERGEN_PRESETS.map((a) => (
            <button
              type="button"
              key={a}
              aria-pressed={allergies.includes(a)}
              onClick={() => toggleAllergy(a)}
              className={`h-10 px-4 rounded-full text-[length:var(--fs-12)] font-bold uppercase tracking-wider border transition-colors ${
                allergies.includes(a)
                  ? 'bg-[var(--accent)] text-[var(--text-inverse)] border-[var(--accent)]'
                  : 'border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {customAllergies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {customAllergies.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => toggleAllergy(a)}
                aria-label={`Remove ${a}`}
                className="h-10 pl-3.5 pr-2 rounded-full text-[length:var(--fs-12)] font-bold uppercase tracking-wider border border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)] inline-flex items-center gap-1.5 transition-colors hover:border-[var(--error)] hover:text-[var(--error)]"
              >
                <span className="max-w-[140px] truncate">{a}</span>
                <Icon name="close" className="text-[length:var(--fs-15)]" />
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-2.5">
          <input
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAllergy(); } }}
            placeholder="Add another allergy"
            maxLength={MAX_CUSTOM}
            className="flex-1 min-w-0 h-12 min-h-[44px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 text-[length:var(--fs-16)] sm:text-[length:var(--fs-13)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
          <Button
            type="button"
            variant="subtle"
            onClick={addCustomAllergy}
            disabled={customAllergy.trim().length < 2}
            className="h-12 min-h-[44px] shrink-0"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Activity Level — full descriptions so the choice is unambiguous */}
      <div>
        <FieldLabel>How Active Are You?</FieldLabel>
        <div className="mt-2 space-y-2">
          {ACTIVITY_LEVELS.map((a) => {
            const active = activityLevel === a.key;
            return (
              <button
                type="button"
                key={a.key}
                aria-pressed={active}
                onClick={() => setActivityLevel(a.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-[14px] border text-left transition-colors ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                    : 'border-[var(--border-light)] bg-[var(--bg-hover)] hover:border-[var(--border-medium)]'
                }`}
              >
                <span className="w-9 h-9 rounded-xl bg-[var(--bg-active)] border border-[var(--border-light)] flex items-center justify-center shrink-0">
                  <Icon name={a.icon} className="text-[length:var(--fs-20)] text-[var(--accent)]" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[length:var(--fs-13)] font-bold text-[var(--text-primary)]">{a.label}</span>
                  <span className="block text-[length:var(--fs-11)] text-[var(--text-muted)] truncate">{a.desc}</span>
                </span>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-[var(--accent)]' : 'border-[var(--border-medium)]'}`}>
                  {active && <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />}
                </span>
              </button>
            );
          })}
        </div>
        <ActivityDetail level={ACTIVITY_LEVELS.find((a) => a.key === activityLevel)} />
      </div>

      {/* Usual sleep — single estimate, not daily tracking (Section 2) */}
      <div>
        <PillGroup
          label="Usual Sleep per Night"
          hint="Optional"
          value={sleepHours}
          onChange={(v) => setSleepHours((cur) => (cur === v ? null : v))}
          options={SLEEP_CHOICES.map((c) => ({ key: c.value, label: c.label }))}
        />
        <SleepNote hours={sleepHours} age={userAge} />
      </div>

      {/* Exercise Frequency */}
      <PillGroup
        label="Exercise Frequency"
        value={exerciseFreq}
        onChange={setExerciseFreq}
        options={EXERCISE_FREQ.map((k) => ({ key: k, label: EXERCISE_FREQ_LABELS[k] || k.replace(/_/g, ' ') }))}
      />

      <div className="pt-1">
        <Button type="button" onClick={save} loading={saving} fullWidth className="h-12">
          {saving ? 'Saving…' : 'Save Personalization'}
        </Button>
        <p className="text-[length:var(--fs-10)] text-[var(--text-disabled)] text-center mt-2.5 leading-relaxed">
          Updating activity, sleep or exercise frequency recalculates your calorie targets and regenerates your workout plan.
        </p>
      </div>
    </div>
  );
}
