import { useState, useMemo } from 'react';
import Icon from '../../../components/Icon.jsx';
import { PlanCover, FilterPill, PlanCard } from './PlanWidgets.jsx';
import {
  INTENSITY_OPTIONS,
  FOCUS_OPTIONS,
  DURATION_OPTIONS,
  CATEGORIES,
  humanizeGoalType,
} from '../utils/planFormat.js';

export const GoalLinkBanner = ({ goalStatus, plans, onContinue, onGenerate, generating }) => {
  const { goal, linkedPlan } = goalStatus || {};
  if (!goal) return null;
  const label = humanizeGoalType(goal.goalType);
  const kcal = goal.dailyKcal != null ? `${Number(goal.dailyKcal).toLocaleString()} kcal/day` : null;
  const linked = linkedPlan ? plans.find((p) => String(p.id) === String(linkedPlan.id)) : null;
  if (linkedPlan && linked) {
    return (
      <div className="mb-4 sm:mb-6 rounded-2xl border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:px-4 sm:py-3 sm:gap-3 bg-[var(--accent-bg)] border-[var(--accent-border)]">
        <p className="text-[12px] font-bold flex-1 leading-relaxed break-words text-[var(--text-primary)]">
          Training for {label}{kcal ? ` · ${kcal}` : ''} — linked plan: {linked.title}
        </p>
        <button
          onClick={() => onContinue(linked)}
          className="h-11 min-h-[44px] px-4 rounded-xl bg-[var(--accent-solid)] text-[var(--accent-solid-fg)] text-[11px] font-bold uppercase tracking-widest w-full sm:w-auto active:scale-95 transition-all"
        >
          Open plan
        </button>
      </div>
    );
  }
  return (
    <div className="mb-4 sm:mb-6 rounded-2xl border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:px-4 sm:py-3 sm:gap-3 bg-[var(--bg-tertiary)] border-[var(--border-light)]">
      <p className="text-[12px] font-bold flex-1 leading-relaxed break-words text-[var(--text-primary)]">
        Your {label} goal{kcal ? ` (${kcal})` : ''} has no training plan yet
        {linkedPlan ? ' — its plan was deleted' : ''}.
      </p>
      <button
        onClick={onGenerate}
        disabled={generating}
        className="h-11 min-h-[44px] px-4 rounded-xl border border-[var(--border-medium)] text-[11px] font-bold uppercase tracking-widest w-full sm:w-auto disabled:opacity-40 text-[var(--text-primary)]"
      >
        {generating ? 'Generating…' : 'Generate from my goal'}
      </button>
    </div>
  );
};

export const MyPlans = ({ plans, goalStatus, onOpen, onContinue, onCreateClick, onGenerate, onDelete, onEdit, generating }) => {
  const enrolled = plans.filter(p => p.is_enrolled === 1 || p.is_owner === 1);
  if (enrolled.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 sm:py-28 gap-4 text-center" style={{ animation: 'fadeIn 0.3s ease' }}>
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-2 border bg-[var(--accent-bg)] border-[var(--accent-border)]"
        >
          <Icon name="fitness_center" className="text-[28px] sm:text-[36px] text-[var(--accent)]" fill={1} />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">No plans yet</h3>
        <p className="text-sm max-w-xs leading-relaxed text-[var(--text-muted)]">
          Create your own plan, generate one from your goal, or head to{' '}
          <span className="text-[var(--accent)] font-bold">Explore</span> to enroll in a blueprint.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          <button
            onClick={onCreateClick}
            className="h-10 px-5 rounded-full bg-[var(--accent-solid)] text-[var(--accent-solid-fg)] text-[12px] font-bold hover:brightness-110 active:scale-95 transition-all"
          >
            Create personal plan
          </button>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="h-10 px-5 rounded-full border border-[var(--border-medium)] text-[12px] font-bold disabled:opacity-40 text-[var(--text-primary)]"
          >
            {generating ? 'Generating…' : 'Generate from my goal'}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <GoalLinkBanner goalStatus={goalStatus} plans={plans} onContinue={onContinue} onGenerate={onGenerate} generating={generating} />
      {(() => {
        const active      = enrolled[0];
        const progressPct = active.progress_pct ?? 0;
        const isLinked = goalStatus?.linkedPlan && String(active.id) === String(goalStatus.linkedPlan.id);
        return (
          <div
            className="mb-6 sm:mb-10 rounded-2xl overflow-hidden border border-[var(--accent-border)] cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl group glass-panel"
            onClick={() => onOpen(active)}
          >
            <div className="relative overflow-hidden bg-[var(--bg-card)]">
              <div className="absolute inset-0">
                <PlanCover seed={active.image_seed} title={active.title} className="group-hover:scale-105 transition-transform duration-700" opacity={0.2} />
              </div>
              <div
                className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,var(--bg-card)_30%,transparent_100%)]"
              />
              <div className="relative flex flex-col min-[560px]:flex-row min-[560px]:items-center gap-3 px-4 sm:px-8 py-4 sm:py-6">
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-[var(--accent)]">
                    Currently Active{isLinked ? ' · Goal-linked' : active.is_owner === 1 ? ' · Yours' : ''}
                  </span>
                  <h2 className="text-[17px] leading-snug sm:text-2xl font-black mt-0.5 mb-2 break-words line-clamp-2 text-[var(--text-primary)]">
                    {active.title}
                  </h2>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 h-2 sm:h-1.5 rounded-full overflow-hidden bg-[var(--border-medium)]">
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-[var(--accent)]"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-black tabular-nums shrink-0 text-[var(--accent)]">
                      {progressPct}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 shrink-0 w-full min-[560px]:w-auto min-[560px]:flex min-[560px]:items-center">
                  <button
                    onClick={e => { e.stopPropagation(); onContinue(active); }}
                    className="col-span-2 min-[560px]:col-span-1 px-5 py-3 min-h-[48px] rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase active:scale-95 transition-all bg-[var(--accent-solid)] text-[var(--accent-solid-fg)]"
                  >
                    Continue →
                  </button>
                  {active.is_owner === 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); onEdit?.(active); }}
                      aria-label={`Edit plan: ${active.title}`}
                      className="px-4 py-3 min-h-[48px] rounded-xl text-[11px] font-bold uppercase border border-[var(--border-medium)] text-[var(--text-primary)] bg-[var(--bg-primary)]"
                    >
                      Edit
                    </button>
                  )}
                  {active.is_owner === 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); onDelete?.(active); }}
                      aria-label={`Delete plan: ${active.title}`}
                      className="px-4 py-3 min-h-[48px] rounded-xl text-[11px] font-bold uppercase border border-[var(--border-medium)] text-[var(--text-muted)] bg-[var(--bg-primary)]"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {enrolled.length > 1 && (
        <>
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-3 sm:mb-4 text-[var(--text-muted)]">
            All Enrolled Plans
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            {enrolled.slice(1).map((plan, i) => (
              <div key={plan.id} className="min-w-0 h-full">
                <PlanCard
                  plan={plan} onOpen={onOpen} onEnroll={() => {}} onContinue={onContinue}
                  style={{ animation: `slideUp 0.3s ease ${i * 0.06}s both` }}
                />
                {plan.is_owner === 1 && (
                  <span className="mt-1.5 flex gap-3">
                    <button
                      onClick={() => onEdit?.(plan)}
                      aria-label={`Edit plan: ${plan.title}`}
                      className="text-[11px] font-bold uppercase tracking-widest hover:underline text-[var(--text-primary)]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete?.(plan)}
                      aria-label={`Delete plan: ${plan.title}`}
                      className="text-[11px] font-bold uppercase tracking-widest hover:underline text-[var(--text-muted)]"
                    >
                      Delete mine
                    </button>
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// FIND PLANS TAB WITH FILTERS

export const FindPlan = ({ plans, onOpen, onEnroll, onContinue }) => {
  const [query,     setQuery]     = useState('');
  const [intensity, setIntensity] = useState('All');
  const [focus,     setFocus]     = useState('All');
  const [duration,  setDuration]  = useState('All');

  const filtered = useMemo(() => plans.filter(p => {
    const q = query.toLowerCase();
    return (
      (!q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tag?.toLowerCase().includes(q)) &&
      (intensity === 'All' || p.intensity === intensity) &&
      (focus     === 'All' || p.target_focus?.toLowerCase().includes(focus.toLowerCase())) &&
      (duration  === 'All' || p.duration === duration)
    );
  }), [plans, query, intensity, focus, duration]);

  const clearAll = () => { setQuery(''); setIntensity('All'); setFocus('All'); setDuration('All'); };
  const hasFilters = query || intensity !== 'All' || focus !== 'All' || duration !== 'All';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="relative mb-4 sm:mb-6">
        <Icon name="search" className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[18px] sm:text-[20px] text-[var(--text-muted)]" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search blueprints..."
          className="w-full rounded-xl pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm outline-none border transition-all bg-[var(--bg-tertiary)] border-[var(--border-medium)] text-[var(--text-primary)]"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 transition-colors text-[var(--text-muted)]"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        )}
      </div>
      <div className="rounded-xl p-3 sm:p-5 mb-6 sm:mb-8 space-y-3 sm:space-y-4 border border-[var(--border-light)] glass-card">
        {[
          { label: 'Intensity', opts: INTENSITY_OPTIONS, active: intensity, set: setIntensity },
          { label: 'Focus Area', opts: FOCUS_OPTIONS,    active: focus,     set: setFocus     },
          { label: 'Duration',  opts: DURATION_OPTIONS,  active: duration,  set: setDuration  },
        ].map(({ label, opts, active, set }) => (
          <div key={label}>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 text-[var(--text-muted)]">{label}</p>
            <FilterPill options={opts} active={active} onSelect={set} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          <span className="font-bold text-[var(--text-primary)]">{filtered.length}</span>{' '}
          blueprint{filtered.length !== 1 ? 's' : ''} found
        </p>
        {hasFilters && (
          <button onClick={clearAll} className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:underline text-[var(--accent)]">
            Clear All
          </button>
        )}
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 sm:py-20 gap-3 text-center">
          <Icon name="search_off" className="text-[40px] sm:text-[48px] text-[var(--border-medium)]" />
          <p className="text-sm text-[var(--text-muted)]">No blueprints match your filters.</p>
          <button onClick={clearAll} className="text-sm font-bold hover:underline text-[var(--accent)]">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {filtered.map((plan, i) => (
            <PlanCard
              key={plan.id} plan={plan} onOpen={onOpen} onEnroll={onEnroll} onContinue={onContinue}
              style={{ animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};



export const Explore = ({ plans, onOpen, onEnroll, onContinue }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const featured  = plans.slice(0, 2);
  const displayed = activeCategory ? plans.filter(p => p.tag === activeCategory) : plans;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {featured.length > 0 && (
        <div className="mb-6 sm:mb-10">
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-3 sm:mb-4 text-[var(--text-muted)]">
            Featured Blueprints
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            {featured.map((plan, i) => (
              <div
                key={plan.id}
                role="button"
                tabIndex={0}
                aria-label={`Open plan: ${plan.title}`}
                className="relative overflow-hidden rounded-2xl cursor-pointer group border border-[var(--border-light)] transition-all duration-500"
                style={{ animation: `slideUp 0.4s ease ${i * 0.1}s both` }}
                onClick={() => onOpen(plan)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(plan); } }}
              >
                <div className="aspect-[16/10] sm:aspect-[21/9] overflow-hidden">
                  <PlanCover seed={plan.image_seed} title={plan.title} className="group-hover:scale-105 transition-transform duration-700" opacity={0.3} />
                </div>
                <div
                  className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg-card)_0%,rgba(0,0,0,0.3)_50%,transparent_100%)]"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 min-w-0">
                  <div className="flex gap-2 mb-1.5 sm:mb-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-[var(--accent-solid)] text-[var(--accent-solid-fg)]">
                      {plan.tag}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-[var(--bg-hover)] text-[var(--text-muted)]" style={{ backdropFilter: 'blur(4px)' }}>
                      {plan.intensity}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-black text-[var(--text-primary)]">{plan.title}</h3>
                  <p className="text-xs mt-0.5 line-clamp-1 text-[var(--text-muted)]">{plan.description}</p>
                </div>
                {plan.is_enrolled === 1 && (
                  <div
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase bg-[var(--accent-solid)] text-[var(--accent-solid-fg)]"
                  >
                    Owned
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-6 sm:mb-8 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.tag)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest flex-shrink-0 transition-all border"
            style={{
              background:  activeCategory === cat.tag ? 'var(--accent)'     : 'var(--bg-tertiary)',
              color:       activeCategory === cat.tag ? 'var(--text-inverse)'           : 'var(--text-muted)',
              borderColor: activeCategory === cat.tag ? 'var(--accent)'     : 'var(--border-light)',
            }}
          >
            <Icon name={cat.icon} className="text-[14px] sm:text-[16px]" fill={activeCategory === cat.tag ? 1 : 0} />
            {cat.label}
          </button>
        ))}
      </div>
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center py-16 sm:py-20 gap-3 text-center">
          <Icon name="category" className="text-[40px] sm:text-[48px] text-[var(--border-medium)]" />
          <p className="text-sm text-[var(--text-muted)]">No blueprints in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {displayed.map((plan, i) => (
            <PlanCard
              key={plan.id} plan={plan} onOpen={onOpen} onEnroll={onEnroll} onContinue={onContinue}
              style={{ animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
