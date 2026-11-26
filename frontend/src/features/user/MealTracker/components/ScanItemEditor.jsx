import { useEffect, useRef, useState } from 'react';
import Icon from '../../../../components/Icon.jsx';
import {
  REASON_TEXT, reviewReasons, needsReview, recalcForGrams, applyDish,
} from '../../../../lib/scanReview.js';

// Confirm / correct one scanned item before it is saved (Revision #2):
// dish name (+ "Did you mean…" chips), serving, visible weight and nutrients.
// Picking another dish or changing the weight recalculates instantly from the
// dish reference; a typed dish name is estimated by the server on request.
const FIELDS = ['calories', 'protein', 'carbs', 'fat'];
const EXTRA = ['saturated_fat', 'trans_fat', 'polyunsaturated_fat', 'monounsaturated_fat', 'sugar', 'sodium'];

const str = (v) => (v === null || v === undefined ? '' : String(v));

function toDraft(item) {
  return {
    food_name: item.food_name || '',
    serving: item.serving || '',
    grams: str(item.grams),
    calories: str(item.calories),
    protein: str(item.protein),
    carbs: str(item.carbs),
    fat: str(item.fat),
    reference: item.reference || null,
    extras: Object.fromEntries(EXTRA.map((k) => [k, item[k] ?? null])),
  };
}

// Numeric view of the draft, shaped like a scan item for the pure helpers.
function asItem(draft) {
  return {
    food_name: draft.food_name,
    grams: Number(draft.grams) || null,
    reference: draft.reference,
    ...Object.fromEntries(FIELDS.map((k) => [k, Number(draft[k]) || 0])),
    ...draft.extras,
  };
}

function withValues(draft, values) {
  if (!values) return draft;
  const next = { ...draft, extras: { ...draft.extras } };
  if (values.food_name !== undefined) next.food_name = values.food_name;
  if (values.reference !== undefined) next.reference = values.reference;
  if (values.grams !== undefined) next.grams = str(values.grams);
  for (const k of FIELDS) if (values[k] !== undefined) next[k] = str(values[k]);
  for (const k of EXTRA) if (values[k] !== undefined) next.extras[k] = values[k];
  return next;
}

function NumberField({ label = undefined, value = undefined, onChange = undefined, step = 'any' }) {
  return (
    <label className="mt-result-correct-field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-result-correct-input"
      />
    </label>
  );
}

export default function ScanItemEditor({
  item,
  onCancel = undefined,
  onSave = undefined,
  onConfirm = undefined,
  onEstimateDish = undefined,
}) {
  const [draft, setDraft] = useState(() => toDraft(item));
  const [estimate, setEstimate] = useState({ loading: false, error: '' });
  const abortRef = useRef(null);
  useEffect(() => () => abortRef.current?.abort(), []);

  // After the user saved a correction the original warnings no longer apply.
  const reasons = item.reviewed ? [] : reviewReasons(item);
  const flagged = needsReview({ ...item, selected: true });
  const alternatives = (item.alternatives || []).filter(
    (alt) => alt.name.toLowerCase() !== draft.food_name.trim().toLowerCase(),
  );
  // Values no longer belong to the typed name → offer a recalculation.
  const nameChanged = draft.food_name.trim().toLowerCase() !== String(item.food_name || '').trim().toLowerCase()
    && draft.food_name.trim().toLowerCase() !== String(draft.reference?.name || '').toLowerCase();

  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));

  const changeName = (value) => {
    setEstimate({ loading: false, error: '' });
    setDraft((d) => ({
      ...d,
      food_name: value,
      // A free-typed name no longer matches the reference dish.
      reference: d.reference && value.trim().toLowerCase() === d.reference.name.toLowerCase() ? d.reference : null,
    }));
  };

  const changeGrams = (value) => {
    setDraft((d) => {
      const recalculated = recalcForGrams(asItem(d), value);
      return recalculated ? withValues({ ...d, grams: value }, recalculated) : { ...d, grams: value };
    });
  };

  const applyChosenDish = (dish) => {
    setDraft((d) => withValues(d, applyDish(asItem(d), dish, d.grams)));
    setEstimate({ loading: false, error: '' });
  };

  const estimateTypedDish = async (name = draft.food_name) => {
    const dishName = String(name || '').trim();
    if (dishName.length < 2 || !onEstimateDish) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setEstimate({ loading: true, error: '' });
    try {
      const data = await onEstimateDish(dishName, controller.signal);
      if (controller.signal.aborted) return;
      if (!data?.per100) throw new Error('No nutrition found for that dish.');
      // Keep the user's wording unless the reference has the canonical name.
      applyChosenDish({ name: data.source === 'reference' ? data.name : dishName, per100: data.per100 });
    } catch (err) {
      if (controller.signal.aborted || err?.name === 'AbortError') return;
      setEstimate({ loading: false, error: err?.message || 'Could not estimate this dish. Enter values manually.' });
    }
  };

  const pickAlternative = (alt) => {
    if (alt.per100) applyChosenDish(alt);
    else {
      changeName(alt.name);
      estimateTypedDish(alt.name);
    }
  };

  const save = () => {
    const num = (v) => (v === '' || v == null ? undefined : Number(v));
    onSave?.({
      food_name: draft.food_name.trim() || item.food_name,
      serving: draft.serving,
      grams: num(draft.grams) ?? null,
      calories: num(draft.calories),
      protein: num(draft.protein),
      carbs: num(draft.carbs),
      fat: num(draft.fat),
      reference: draft.reference,
      ...draft.extras,
    });
  };

  return (
    <div className="mt-result-editor" role="form" aria-label={`Confirm or correct ${item.food_name}`}>
      <div className="mt-result-editor-head">
        <p className="mt-result-editor-title">Check: {item.food_name}</p>
        <button type="button" onClick={onCancel} aria-label="Close correction editor" className="mt-result-editor-close">
          <Icon name="close" className="mt-icon-symbol" />
        </button>
      </div>

      {reasons.length > 0 && (
        <ul className="mt-result-reasons" aria-label="Why this needs a check">
          {reasons.map((code) => (
            <li key={code} className={code === 'macro_mismatch' ? 'is-info' : ''}>
              <Icon name={code === 'macro_mismatch' ? 'info' : 'warning'} className="mt-result-reason-icon" />
              {REASON_TEXT[code]}
            </li>
          ))}
        </ul>
      )}

      <label className="mt-result-correct-field mt-result-correct-field--wide">
        <span>Dish</span>
        <input
          value={draft.food_name}
          maxLength={150}
          onChange={(event) => changeName(event.target.value)}
          className="mt-result-correct-input mt-result-correct-input--text"
          aria-label="Dish name"
        />
      </label>

      {alternatives.length > 0 && (
        <div className="mt-result-alts" role="group" aria-label="Did you mean">
          <span className="mt-result-alts-label">Did you mean</span>
          {alternatives.map((alt) => (
            <button key={alt.name} type="button" className="mt-result-alt" onClick={() => pickAlternative(alt)}>
              {alt.name}
            </button>
          ))}
        </div>
      )}

      {nameChanged && (
        <button
          type="button"
          className="mt-result-recalc"
          onClick={() => estimateTypedDish()}
          disabled={estimate.loading || draft.food_name.trim().length < 2}
        >
          <Icon name="refresh" className="mt-result-recalc-icon" />
          {estimate.loading ? 'Estimating…' : `Recalculate nutrition for “${draft.food_name.trim().slice(0, 30)}”`}
        </button>
      )}
      {estimate.error && <p className="mt-result-editor-error" role="alert">{estimate.error}</p>}

      <div className="mt-result-correct-row">
        <label className="mt-result-correct-field">
          <span>Serving</span>
          <input
            value={draft.serving}
            maxLength={100}
            placeholder="e.g. 1 bowl, 3 pcs"
            onChange={(event) => set('serving')(event.target.value)}
            className="mt-result-correct-input mt-result-correct-input--text"
            aria-label="Serving size"
          />
        </label>
        <NumberField label="Weight (g)" value={draft.grams} onChange={changeGrams} step="1" />
      </div>

      <div className="mt-result-correct-grid">
        <NumberField label="kcal" value={draft.calories} onChange={set('calories')} step="1" />
        <NumberField label="P (g)" value={draft.protein} onChange={set('protein')} />
        <NumberField label="C (g)" value={draft.carbs} onChange={set('carbs')} />
        <NumberField label="F (g)" value={draft.fat} onChange={set('fat')} />
      </div>
      <p className="mt-result-editor-note">
        {draft.reference
          ? `Changing the weight or dish recalculates from the ${draft.reference.name} reference (approximate).`
          : 'Changing the weight rescales these values. Your numbers replace the AI estimate.'}
      </p>

      <div className="mt-result-editor-actions">
        {flagged ? (
          <button type="button" onClick={onConfirm} className="mt-result-editor-cancel">
            Looks right
          </button>
        ) : (
          <button type="button" onClick={onCancel} className="mt-result-editor-cancel">
            Cancel
          </button>
        )}
        <button type="button" onClick={save} className="mt-result-editor-save" disabled={estimate.loading}>
          Save correction
        </button>
      </div>
    </div>
  );
}
