import { useState } from 'react';
import Icon from '../../../components/Icon.jsx';
import Button from '../../../components/ui/Button.jsx';

// Reference-style result sheet: dish title, kcal ring, macro bars,
// tappable ingredient chips (toggle include), custom add, Add meal.
// Light sheet like the reference — photo lives in the stage above.
const EMOJI_MAP = [
  [/egg/, '🥚'], [/chicken|poultry|turkey/, '🍗'], [/rice/, '🍚'],
  [/bread|toast|bagel/, '🍞'], [/avocado/, '🥑'],
  [/spinach|greens|salad|lettuce|kale|cabbage/, '🥬'], [/tomato/, '🍅'],
  [/fish|salmon|tuna/, '🐟'], [/beef|steak|pork|meat|bacon/, '🥩'],
  [/shrimp|prawn/, '🍤'], [/milk/, '🥛'], [/cheese/, '🧀'],
  [/apple/, '🍎'], [/banana/, '🍌'], [/potato|fries/, '🍟'],
  [/pasta|noodle|spaghetti|ramen/, '🍝'], [/pizza/, '🍕'], [/burger/, '🍔'],
  [/sushi/, '🍣'], [/broccoli/, '🥦'], [/carrot/, '🥕'],
  [/bean|nuts|peanut|almond/, '🥜'], [/coffee/, '☕'],
  [/cake|chocolate|ice cream|dessert|cookie/, '🍰'], [/yogurt/, '🍦'],
  [/oat|cereal|granola/, '🥣'], [/soup/, '🍲'], [/sandwich/, '🥪'],
  [/berry|berries|strawberry|mango|orange|fruit/, '🍓'], [/onion/, '🧅'],
  [/mushroom/, '🍄'], [/corn/, '🌽'], [/tea/, '🍵'],
];
const emojiFor = (name) => {
  const n = String(name || '').toLowerCase();
  const hit = EMOJI_MAP.find(([re]) => re.test(n));
  return hit ? hit[1] : '🍽️';
};

function KcalRing({ value }) {
  const R = 34;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(1, Number(value || 0) / 1000));
  return (
    <div className="relative w-[92px] h-[92px] shrink-0">
      <svg viewBox="0 0 84 84" className="w-full h-full -rotate-90">
        <circle cx="42" cy="42" r={R} fill="none" strokeWidth="7" style={{ stroke: 'var(--bg-hover)' }} />
        <circle
          cx="42" cy="42" r={R} fill="none"
          strokeWidth="7" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
          className="transition-all duration-500"
          style={{ stroke: 'var(--accent)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-black text-[var(--text-primary)] leading-none tabular-nums">{value}</span>
        <span className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">kcal</span>
      </div>
    </div>
  );
}

function MacroBar({ label, grams, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((Number(grams) || 0) / max * 100)) : 0;
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-semibold text-[var(--text-muted)]">{label}</span>
        <span className="text-[12px] font-bold text-[var(--text-primary)] tabular-nums">{grams} g</span>
      </div>
      <div className="h-[5px] bg-[var(--bg-hover)] rounded-full mt-1.5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ScanResult({
  result,
  isLogging,
  onToggle,
  onScale,
  onAddCustom,
  onSave,
  onRescan,
  onClear,
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ food_name: '', calories: '', serving: '' });

  const items = result?.items || [];
  const selected = items.filter(it => it.selected);
  const sum = (k) => selected.reduce((a, it) => a + (Number(it[k]) || 0), 0);
  const totals = {
    calories: Math.round(sum('calories')),
    protein: Math.round(sum('protein')),
    carbs: Math.round(sum('carbs')),
    fat: Math.round(sum('fat')),
  };
  const macroMax = Math.max(1, totals.protein, totals.carbs, totals.fat);
  const title = selected.length === 1
    ? selected[0].food_name
    : selected.length > 1
      ? `${selected.length} detected items`
      : items[0]?.food_name || 'No items';

  const submitCustom = () => {
    if (!draft.food_name.trim()) return;
    onAddCustom?.({ food_name: draft.food_name, calories: draft.calories, serving: draft.serving });
    setDraft({ food_name: '', calories: '', serving: '' });
    setAdding(false);
  };

  return (
    <div className="glass-card rounded-[28px] p-5 border border-[var(--border-light)] text-[var(--text-primary)]">
      {/* Title */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[19px] font-bold leading-snug tracking-tight min-w-0">{title}</h3>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-full bg-[var(--accent-bg)] flex items-center justify-center">
            <Icon name="eco" className="text-[16px] text-[var(--accent)]" />
          </span>
          <button onClick={onClear} aria-label="Dismiss result" className="w-8 h-8 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Icon name="close" className="text-[16px]" />
          </button>
        </div>
      </div>

      {/* Nutritional value */}
      <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-4 mb-3">Nutritional Value</p>
      {selected.some((it) => it.low_confidence) && (
        <p role="status" className="mb-3 text-[11px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          Low confidence estimate — verify portion before saving.
        </p>
      )}
      {result?.retryable && (
        <p role="alert" className="mb-3 text-[11px] font-bold text-sky-500 bg-sky-500/10 border border-sky-500/20 rounded-xl px-3 py-2">
          AI is busy right now (high demand). Wait a moment and tap Scan again — don't log this empty result.
        </p>
      )}
      <div className="flex items-center gap-4">
        <KcalRing value={totals.calories} />
        <div className="flex-1 min-w-0 space-y-3">
          <MacroBar label="Protein" grams={totals.protein} max={macroMax} color="var(--accent)" />
          <MacroBar label="Carbs" grams={totals.carbs} max={macroMax} color="var(--accent)" />
          <MacroBar label="Fats" grams={totals.fat} max={macroMax} color="var(--accent)" />
        </div>
      </div>

      {/* Portion correction — photo can't know your cup size */}
      <div className="mt-4 flex items-center gap-2" role="group" aria-label="Adjust portion size">
        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest shrink-0">Portion</span>
        {[0.5, 1, 1.5, 2].map((f) => (
          <button
            key={f}
            onClick={() => onScale?.(f)}
            aria-label={`Scale portion to ${f}x`}
            className="flex-1 py-1.5 rounded-full text-[11px] font-black border border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-colors tabular-nums"
          >
            {f}x
          </button>
        ))}
      </div>

      {/* Ingredients — tap to include/exclude */}
      <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-5 mb-3">Ingredients</p>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No items detected.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => onToggle?.(it.key)}
              title={`${it.food_name} · ${it.calories} kcal — tap to ${it.selected ? 'exclude' : 'include'}`}
              className={`flex flex-col items-center gap-1.5 shrink-0 w-[60px] transition-all ${it.selected ? 'opacity-100' : 'opacity-40 grayscale'}`}
            >
              <span className={`w-[52px] h-[52px] rounded-full flex items-center justify-center text-[26px] border-2 transition-colors ${it.selected ? 'bg-[var(--bg-hover)] border-[var(--accent)]/50' : 'bg-[var(--bg-hover)] border-[var(--border-light)]'}`}>
                {emojiFor(it.food_name)}
              </span>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] text-center leading-tight line-clamp-2">
                {it.food_name.replace(/^[\p{Emoji}\s]+/u, '').slice(0, 18) || it.food_name.slice(0, 18)}
              </span>
              <span className="text-[10px] font-bold text-[var(--accent)] tabular-nums">{it.calories}</span>
            </button>
          ))}
        </div>
      )}

      {/* Search for more → custom add */}
      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="mt-4 w-full py-2.5 rounded-full text-xs font-bold bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="search" className="text-[16px]" /> Search For More
        </button>
      ) : (
        <div className="mt-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-light)] p-3 space-y-2">
          <input
            value={draft.food_name}
            onChange={(e) => setDraft({ ...draft, food_name: e.target.value })}
            placeholder="Food name (e.g. Banana)"
            className="w-full h-10 bg-[var(--input-bg)] rounded-xl px-3 text-sm text-[var(--text-primary)] border border-[var(--input-border)] outline-none focus:border-[var(--accent)]"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={draft.calories}
              onChange={(e) => setDraft({ ...draft, calories: e.target.value })}
              placeholder="Calories"
              type="number"
              min="0"
              className="w-full h-10 bg-[var(--input-bg)] rounded-xl px-3 text-sm text-[var(--text-primary)] border border-[var(--input-border)] outline-none focus:border-[var(--accent)]"
            />
            <input
              value={draft.serving}
              onChange={(e) => setDraft({ ...draft, serving: e.target.value })}
              placeholder="Serving (e.g. 1 pc)"
              className="w-full h-10 bg-[var(--input-bg)] rounded-xl px-3 text-sm text-[var(--text-primary)] border border-[var(--input-border)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded-full text-xs font-bold text-[var(--text-muted)] border border-[var(--border-light)]">Cancel</button>
            <button onClick={submitCustom} className="flex-1 py-2 rounded-full text-xs font-black bg-[var(--accent)] text-[var(--text-inverse)]">Add item</button>
          </div>
        </div>
      )}

      {/* Add meal */}
      <Button
        onClick={() => onSave?.()}
        loading={isLogging}
        disabled={isLogging || selected.length === 0}
        fullWidth
        className="mt-4 !py-3.5 !text-sm !normal-case !tracking-normal !font-black"
      >
        {isLogging ? 'Saving…' : 'Add meal'}
      </Button>
      <button
        onClick={onRescan}
        className="mt-2 w-full py-2 text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-1.5"
      >
        <Icon name="photo_camera" className="text-[14px]" /> Scan again
      </button>

      {result?.suggestion && (
        <p className="mt-2 text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] rounded-xl px-3 py-2">💡 {result.suggestion}</p>
      )}
    </div>
  );
}
