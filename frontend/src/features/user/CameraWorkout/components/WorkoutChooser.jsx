import { useState, useMemo } from 'react';
import { getPickerOptions, searchGuideExercises, frameUrl, BRYL_CREDIT, guideFilterOptions, getAllGuideExercises, exerciseTypeLabel } from '../constants/workoutGuide.js';
import Modal from '../../../../components/ui/Modal.jsx';
import { useUrlFilters } from '../../../../hooks/useUrlFilters.js';

// ── Workout chooser: pick a real Bryl exercise first, camera opens after ───
// Search + filters live in the URL (?q=&type=&equipment=&muscle=) so refresh,
// back/forward and shared links keep the same results.
const CHOOSER_PAGE = 48;
const CHOOSER_OPTS = guideFilterOptions();
const CHOOSER_FILTERS = {
  q: {},
  type: { options: CHOOSER_OPTS.types },
  equipment: { options: CHOOSER_OPTS.equipment },
  muscle: { options: CHOOSER_OPTS.muscles },
};
const CHOOSER_GROUPS = [
  { key: 'type', label: 'Type', options: CHOOSER_OPTS.types.map(v => ({ value: v, label: exerciseTypeLabel(v) })) },
  { key: 'equipment', label: 'Equipment', options: CHOOSER_OPTS.equipment.map(v => ({ value: v, label: v })) },
  { key: 'muscle', label: 'Muscle', options: CHOOSER_OPTS.muscles.map(v => ({ value: v, label: v })) },
];

function WorkoutChooser({ onPick = undefined, onBack = undefined }) {
  const { values, setFilters, clearFilters } = useUrlFilters(CHOOSER_FILTERS);
  const { q: query, equipment, muscle, type } = values;
  const [sheetOpen, setSheetOpen] = useState(false);
  const q = query.trim();
  const filterCount = [equipment, muscle, type].filter(Boolean).length;
  const searching = Boolean(q) || filterCount > 0;
  const libraryTotal = getAllGuideExercises().length;

  const results = useMemo(() => {
    if (!searching) return getPickerOptions();
    return searchGuideExercises(q, {
      ...(equipment ? { equipment } : {}),
      ...(muscle ? { primaryMuscle: muscle } : {}),
      ...(type ? { exerciseType: type } : {}),
    });
  }, [searching, q, equipment, muscle, type]);

  // Paging resets whenever the result set changes (keyed, no effect needed).
  const resultKey = `${q}|${equipment}|${muscle}|${type}`;
  const [page, setPage] = useState({ key: resultKey, n: CHOOSER_PAGE });
  const shown = page.key === resultKey ? page.n : CHOOSER_PAGE;
  const list = results.slice(0, shown);

  const activeChips = CHOOSER_GROUPS
    .filter(g => values[g.key])
    .map(g => ({ key: g.key, label: g.options.find(o => o.value === values[g.key])?.label ?? values[g.key] }));

  return (
    <main className="p-4 sm:p-6 md:p-8 pb-28 md:pb-8 max-w-7xl 2xl:max-w-[1400px] mx-auto w-full">
      <div className="glass-card border border-[var(--border-light)] rounded-3xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back to dashboard"
              className="w-10 h-10 min-w-[40px] rounded-full hover:bg-[var(--bg-hover)] flex items-center justify-center shrink-0 transition-colors"
            >
              <span className="material-symbols-outlined text-[length:var(--fs-20)] text-[var(--text-primary)]">arrow_back</span>
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-[length:var(--fs-20)] sm:text-[length:var(--fs-22)] font-bold tracking-tight leading-tight">Workouts</h2>
            <p className="text-[length:var(--fs-12)] sm:text-[length:var(--fs-13)] text-[var(--text-muted)] mt-0.5 leading-snug">Pick an exercise, then train with the camera or log it manually.</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex gap-2 mt-5">
          <div className="relative flex-1 min-w-0">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[length:var(--fs-18)] text-[var(--text-muted)] pointer-events-none">search</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setFilters({ q: e.target.value })}
              placeholder="Search exercises"
              aria-label="Search exercises"
              className="w-full h-11 rounded-xl bg-[var(--bg-hover)] border border-transparent pl-10 pr-10 text-[length:var(--fs-16)] sm:text-[length:var(--fs-13)] outline-none focus:border-[var(--accent)] focus:bg-transparent placeholder:text-[var(--text-disabled)] transition-colors [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                onClick={() => setFilters({ q: '' })}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="material-symbols-outlined text-[length:var(--fs-16)]">close</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            aria-label={filterCount ? `Filters, ${filterCount} active` : 'Filters'}
            className={`h-11 px-3.5 sm:px-4 rounded-xl border flex items-center gap-2 shrink-0 text-[length:var(--fs-13)] font-semibold transition-colors ${filterCount
              ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-bg)]'
              : 'border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
          >
            <span className="material-symbols-outlined text-[length:var(--fs-18)]">tune</span>
            <span className="hidden sm:inline">Filters</span>
            {filterCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--accent)] text-[var(--text-inverse)] text-[length:var(--fs-10)] font-bold flex items-center justify-center tabular-nums">{filterCount}</span>
            )}
          </button>
        </div>

        {/* Active filters */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {activeChips.map(chip => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setFilters({ [chip.key]: '' })}
                aria-label={`Remove ${chip.label} filter`}
                className="h-8 pl-3 pr-2 rounded-full bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] text-[length:var(--fs-12)] font-medium text-[var(--text-primary)] flex items-center gap-1 transition-colors"
              >
                {chip.label}
                <span className="material-symbols-outlined text-[length:var(--fs-14)] text-[var(--text-muted)]">close</span>
              </button>
            ))}
            <button type="button" onClick={clearFilters} className="h-8 px-2 text-[length:var(--fs-12)] font-semibold text-[var(--accent)] hover:underline">
              Clear all
            </button>
          </div>
        )}

        {/* Count */}
        <p className="text-[length:var(--fs-12)] text-[var(--text-muted)] mt-4">
          {searching ? (
            <><span className="font-semibold text-[var(--text-primary)] tabular-nums">{results.length}</span> {results.length === 1 ? 'exercise' : 'exercises'} found</>
          ) : (
            <>Quick picks · <span className="tabular-nums">{libraryTotal}</span> in the full library — search or filter to explore</>
          )}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 items-stretch">
          {list.map((opt) => {
            const slug = opt.slug ?? opt.id;
            const img = frameUrl(slug, 1);
            const label = opt.name ?? opt.label ?? slug;
            const isHold = (opt.mode ?? (opt.exerciseType === 'duration' || opt.exerciseType === 'distance_duration' || opt.isStretch ? 'hold' : 'rep')) === 'hold';
            const meta = opt.primaryMuscle
              ? [opt.primaryMuscle, opt.equipment].filter(Boolean).join(' · ')
              : (isHold ? 'Timer' : 'Camera rep count');
            return (
              <button key={slug} type="button" onClick={() => onPick(opt)}
                className="group text-left rounded-2xl border border-[var(--border-light)] hover:border-[var(--accent-border)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-colors overflow-hidden h-full flex flex-col">
                <span className="relative block aspect-square overflow-hidden" style={{ background: '#1E1E1E' }}>
                  {img
                    ? <img src={img} alt="" loading="lazy" className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    : <span className="w-full h-full flex items-center justify-center material-symbols-outlined text-[length:var(--fs-28)] text-white/70">fitness_center</span>}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-sm text-white text-[length:var(--fs-10)] font-semibold">
                    {isHold ? 'Hold' : 'Reps'}
                  </span>
                </span>
                <span className="block px-3 py-2.5">
                  <span className="block text-[length:var(--fs-13)] font-semibold text-[var(--text-primary)] truncate">{label}</span>
                  <span className="block text-[length:var(--fs-11)] text-[var(--text-muted)] mt-0.5 truncate">{meta}</span>
                </span>
              </button>
            );
          })}
        </div>

        {results.length > shown && (
          <div className="flex justify-center mt-5">
            <button
              type="button"
              onClick={() => setPage({ key: resultKey, n: shown + CHOOSER_PAGE })}
              className="h-10 px-5 rounded-xl border border-[var(--border-light)] hover:bg-[var(--bg-hover)] text-[length:var(--fs-13)] font-semibold transition-colors"
            >
              Show more <span className="text-[var(--text-muted)] font-normal tabular-nums">({results.length - shown})</span>
            </button>
          </div>
        )}

        {results.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[length:var(--fs-28)] text-[var(--text-disabled)]">search_off</span>
            <p className="text-[length:var(--fs-14)] font-semibold text-[var(--text-primary)] mt-2">No exercises found</p>
            <p className="text-[length:var(--fs-12)] text-[var(--text-muted)] mt-1">Try a different search or remove a filter.</p>
            <button onClick={clearFilters} className="mt-4 h-10 px-5 rounded-xl bg-[var(--accent)] text-[var(--text-inverse)] text-[length:var(--fs-13)] font-semibold active:scale-95 transition-all">
              Clear filters
            </button>
          </div>
        )}

        <p className="text-[length:var(--fs-10)] mt-6 leading-relaxed text-[var(--text-disabled)]">{BRYL_CREDIT}</p>
      </div>

      <Modal
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        size="lg"
        footer={(
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilters({ type: '', equipment: '', muscle: '' })}
              disabled={filterCount === 0}
              className="h-11 px-4 rounded-xl text-[length:var(--fs-13)] font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="flex-1 h-11 rounded-xl bg-[var(--accent)] text-[var(--text-inverse)] text-[length:var(--fs-13)] font-semibold active:scale-[0.98] transition-all"
            >
              {searching ? `Show ${results.length} ${results.length === 1 ? 'exercise' : 'exercises'}` : 'Done'}
            </button>
          </div>
        )}
      >
        <div className="space-y-6">
          {CHOOSER_GROUPS.map(group => (
            <fieldset key={group.key}>
              <legend className="text-[length:var(--fs-12)] font-semibold text-[var(--text-secondary)] mb-2.5">{group.label}</legend>
              <div className="flex flex-wrap gap-2">
                {group.options.map(opt => {
                  const active = values[group.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilters({ [group.key]: active ? '' : opt.value })}
                      className={`h-9 px-3.5 rounded-full border text-[length:var(--fs-12)] font-medium transition-colors ${active
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--text-inverse)]'
                        : 'border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </Modal>
    </main>
  );
}

export default WorkoutChooser;
