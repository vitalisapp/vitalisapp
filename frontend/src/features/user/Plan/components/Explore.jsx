import { useState, useMemo } from 'react';
import Icon from '../../../../components/Icon.jsx';
import { INTENSITY_OPTIONS, FOCUS_OPTIONS, DURATION_OPTIONS, CATEGORIES } from '../utils/planFormat.js';
import { PlanCover, FilterPill, PlanCard } from '../components/PlanWidgets.jsx';
import { useUrlFilters } from '../../../../hooks/useUrlFilters.js';
import { EXPLORE_FILTERS } from '../utils/planFilters.js';

// DISCOVERY — search, categories, filters and the plan grid
const ContinueTrainingCard = ({ plan = undefined, onContinue = undefined }) => {
  const pct = Math.max(0, Math.min(100, Number(plan.progress_pct) || 0));
  const completedDays = Number(plan.completed_days) || 0;

  return (
    <div className="p-continue">
      <div className="p-continue-cover">
        <PlanCover
          seed={plan.image_seed}
          title={plan.title}
          tag={plan.tag}
          src={plan.image_url}
        />
      </div>
      <div className="p-continue-body">
        <p className="p-continue-eyebrow">
          <Icon name="play_circle" fill={1} />
          Continue training
        </p>
        <p className="p-continue-title" title={plan.title}>{plan.title}</p>
        <p className="p-continue-meta">
          {plan.duration}
          {plan.intensity ? ` · ${plan.intensity}` : ''}
          {completedDays > 0 ? ` · ${completedDays} day${completedDays !== 1 ? 's' : ''} done` : ''}
        </p>
        {pct > 0 ? (
          <div className="p-progress" aria-label={`${pct}% complete`}>
            <div className="p-progress-track">
              <div className="p-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="p-progress-pct">{pct}%</span>
          </div>
        ) : null}
      </div>
      <button type="button" className="p-continue-cta" onClick={() => onContinue(plan)}>
        Continue
        <Icon name="arrow_forward" className="text-[length:var(--fs-16)]" />
      </button>
    </div>
  );
};

const Explore = ({ plans = undefined, onOpen = undefined, onEnroll = undefined, onContinue = undefined }) => {
  const { values, setFilters, clearFilters } = useUrlFilters(EXPLORE_FILTERS);
  const query = values.q;
  const intensity = values.intensity || 'All';
  const focus = values.focus || 'All';
  const duration = values.duration || 'All';
  const activeCategory = values.category || null;
  const setQuery = (v) => setFilters({ q: v });
  const fromAll = (v) => (v === 'All' ? '' : v);
  const setIntensity = (v) => setFilters({ intensity: fromAll(v) });
  const setFocus = (v) => setFilters({ focus: fromAll(v) });
  const setDuration = (v) => setFilters({ duration: fromAll(v) });
  const setActiveCategory = (tag) => setFilters({ category: tag ?? '' });
  // Opened shared links with advanced filters show the panel right away.
  const [filtersOpen, setFiltersOpen] = useState(() => Boolean(values.intensity || values.focus || values.duration));

  const filtered = useMemo(() => plans.filter((p) => {
    const q = query.trim().toLowerCase();
    return (
      (!q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tag?.toLowerCase().includes(q)) &&
      (!activeCategory || p.tag === activeCategory) &&
      (intensity === 'All' || p.intensity === intensity) &&
      (focus === 'All' || p.target_focus?.toLowerCase().includes(focus.toLowerCase())) &&
      (duration === 'All' || p.duration === duration)
    );
  }), [plans, query, activeCategory, intensity, focus, duration]);

  const clearAll = clearFilters;
  const advancedCount = [intensity, focus, duration].filter((v) => v !== 'All').length;
  const hasFilters = Boolean(query) || Boolean(activeCategory) || advancedCount > 0;
  const activePlan = plans.find((p) => p.is_enrolled === 1);

  if (plans.length === 0) {
    return (
      <div className="p-empty" style={{ animation: 'fadeIn 0.3s ease' }}>
        <span className="p-empty-icon"><Icon name="fitness_center" /></span>
        <p className="p-empty-title">No plans available yet</p>
        <p className="p-empty-text">New programs will appear here as soon as they are published.</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="p-toolbar">
        <div className="p-search">
          <Icon name="search" className="p-search-icon" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workout plans"
            aria-label="Search workout plans"
          />
          {query ? (
            <button type="button" className="p-search-clear" aria-label="Clear search" onClick={() => setQuery('')}>
              <Icon name="close" className="text-[length:var(--fs-16)]" />
            </button>
          ) : null}
        </div>

        <div className="p-chips" role="group" aria-label="Plan categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              className="p-chip"
              aria-pressed={activeCategory === cat.tag}
              onClick={() => setActiveCategory(cat.tag)}
            >
              <Icon name={cat.icon} fill={activeCategory === cat.tag ? 1 : 0} />
              {cat.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="p-filters-toggle"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <Icon name="tune" className="text-[length:var(--fs-16)]" />
          {filtersOpen ? 'Hide filters' : 'Filters'}
          {advancedCount > 0 ? <span className="p-tab-count">{advancedCount}</span> : null}
        </button>

        {filtersOpen ? (
          <div className="p-filters">
            {[
              { label: 'Intensity', opts: INTENSITY_OPTIONS, active: intensity, set: setIntensity },
              { label: 'Focus area', opts: FOCUS_OPTIONS, active: focus, set: setFocus },
              { label: 'Duration', opts: DURATION_OPTIONS, active: duration, set: setDuration },
            ].map(({ label, opts, active, set }) => (
              <div key={label}>
                <p className="p-filter-label">{label}</p>
                <FilterPill options={opts} active={active} onSelect={set} />
              </div>
            ))}
            <div className="flex items-center justify-between gap-3">
              <span className="p-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              {hasFilters ? (
                <button type="button" className="p-text-btn" onClick={clearAll}>
                  Clear all
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {activePlan ? <ContinueTrainingCard plan={activePlan} onContinue={onContinue} /> : null}

      {filtered.length === 0 ? (
        <div className="p-empty">
          <span className="p-empty-icon"><Icon name="search_off" /></span>
          <p className="p-empty-title">No plans match your search</p>
          <p className="p-empty-text">Try another category, or clear the filters to see every plan.</p>
          <div className="p-empty-actions">
            <button type="button" className="p-banner-btn" onClick={clearAll}>Clear filters</button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-head">
            <div>
              <h3 className="p-head-title">Workout plans</h3>
              <p className="p-head-sub">Programs built around your training focus.</p>
            </div>
            <span className="p-count">
              {filtered.length} plan{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="p-grid">
            {filtered.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onOpen={onOpen}
                onEnroll={onEnroll}
                onContinue={onContinue}
                style={{ animation: `slideUp 0.3s ease ${Math.min(i, 8) * 0.04}s both` }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Explore;
