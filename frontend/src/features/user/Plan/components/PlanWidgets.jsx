import { useEffect, useRef, useState } from 'react';
import Icon from '../../../../components/Icon.jsx';
import { TABS } from '../utils/planFormat.js';

const TAG_ICON = {
  Strength: 'fitness_center',
  Hypertrophy: 'fitness_center',
  'Fat Loss': 'local_fire_department',
  Cardio: 'directions_run',
  Recovery: 'spa',
  Mobility: 'self_improvement',
  Flexibility: 'self_improvement',
  Performance: 'bolt',
};

/**
 * Program artwork.
 *
 * Uses a real image when the plan carries an image URL; otherwise renders a
 * brand-tinted cover built from theme tokens (no random hues, so the catalog
 * stays inside the Vitalis palette in both light and dark mode).
 */
export const PlanCover = ({ seed = undefined, title = undefined, tag = undefined, src = undefined, className = '', opacity = 1 }) => {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(src) && !broken;

  return (
    <div className={`w-full h-full ${className}`.trim()} style={{ opacity }}>
      {showImage ? (
        <img
          src={src}
          alt=""
          className="p-cover-img"
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="p-cover-art" data-tag={tag || ''}>
          <span className="p-cover-initial" aria-hidden="true">
            {String(title || seed || '?').slice(0, 1).toUpperCase()}
          </span>
          <Icon name={TAG_ICON[tag] || 'fitness_center'} className="p-cover-icon" fill={1} />
        </div>
      )}
    </div>
  );
};

export const FilterPill = ({ options = undefined, active = undefined, onSelect = undefined }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onSelect(opt)}
        aria-pressed={active === opt}
        className="p-pill"
      >
        {opt}
      </button>
    ))}
  </div>
);

export const PlanActions = ({ plan = undefined, onEdit = undefined, onDelete = undefined }) => {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  return (
    <div
      ref={root}
      className="p-actions"
      onClick={(event) => event.stopPropagation()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Escape') {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="p-actions-trigger"
        aria-label={`Actions for ${plan.title}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="more_horiz" />
      </button>
      {open && (
        <div className="p-actions-popup" role="group" aria-label="Plan actions">
          <button type="button" onClick={() => { setOpen(false); onEdit(plan); }}>
            <Icon name="edit" /> Edit
          </button>
          <button type="button" className="p-actions-delete" onClick={() => { setOpen(false); onDelete(plan); }}>
            <Icon name="delete" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export const PlanCard = ({ plan = undefined, onOpen = undefined, onEnroll = undefined, onContinue = undefined, onEdit = undefined, onDelete = undefined, onLocked = undefined, style = {} }) => {
  const enrolled = plan.is_enrolled === 1 || plan.is_owner === 1;
  // Revision #4: Advanced / Extreme plans need a level (server enforces too).
  const locked = Boolean(plan.locked) && !enrolled;
  const pct = Math.max(0, Math.min(100, Number(plan.progress_pct) || 0));
  // VITALIS has no payments: every plan is free (legacy seeded prices are ignored).
  const price = 'Free';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open plan: ${plan.title}`}
      className="p-card"
      style={style}
      onClick={() => onOpen(plan)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(plan);
        }
      }}
    >
      <div className="p-cover">
        <PlanCover
          seed={plan.image_seed}
          title={plan.title}
          tag={plan.tag}
          src={plan.image_url}
        />
        <div className="p-cover-badges">
          {plan.tag ? <span className="p-badge p-badge--tag">{plan.tag}</span> : null}
          {plan.is_owner === 1 ? <span className="p-badge">Mine</span> : null}
          {enrolled && plan.is_owner !== 1 ? (
            <span className="p-badge p-badge--accent">Enrolled</span>
          ) : null}
        </div>
        <div className="p-cover-badges p-cover-badges--end">
          {locked ? (
            <span className="p-badge p-badge--locked">
              <Icon name="lock" /> Level {plan.required_level}
            </span>
          ) : null}
          <span className="p-badge">{price}</span>
        </div>
      </div>

      <div className="p-body">
        {plan.is_owner === 1 && onEdit && onDelete ? (
          <PlanActions plan={plan} onEdit={onEdit} onDelete={onDelete} />
        ) : null}
        <h3 className="p-title" title={plan.title}>{plan.title}</h3>
        {plan.description ? (
          <p className="p-desc" title={plan.description}>{plan.description}</p>
        ) : null}

        <div className="p-meta">
          {plan.duration ? (
            <span className="p-meta-item">
              <Icon name="schedule" />
              <span>{plan.duration}</span>
            </span>
          ) : null}
          {plan.intensity ? (
            <span className="p-meta-item p-meta-item--accent">
              <Icon name="bolt" />
              <span>{plan.intensity}</span>
            </span>
          ) : null}
          {plan.target_focus ? (
            <span className="p-meta-item">
              <Icon name="track_changes" />
              <span>{plan.target_focus}</span>
            </span>
          ) : null}
        </div>

        {enrolled && pct > 0 ? (
          <div className="p-progress" aria-label={`${pct}% complete`}>
            <div className="p-progress-track">
              <div className="p-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="p-progress-pct">{pct}%</span>
          </div>
        ) : null}

        <div className="p-footer" onClick={(e) => e.stopPropagation()}>
          {enrolled ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onContinue(plan);
              }}
              className="p-btn"
            >
              Continue training
            </button>
          ) : locked ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                (onLocked || onOpen)(plan);
              }}
              className="p-btn p-btn--locked"
              aria-label={`${plan.title} is locked. See how to unlock Level ${plan.required_level}`}
            >
              <Icon name="lock" /> Unlock at Level {plan.required_level}
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEnroll(plan.id);
              }}
              className="p-btn"
            >
              Get access
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const TabBar = ({ active = undefined, onChange = undefined, enrolledCount = undefined }) => (
  <div role="tablist" aria-label="Plans sections" className="p-tabs">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={active === tab.id}
        onClick={() => onChange(tab.id)}
        className="p-tab"
      >
        <Icon name={tab.icon} fill={active === tab.id ? 1 : 0} />
        <span className="p-tab-label">{tab.label}</span>
        {tab.id === 'my-plans' && enrolledCount > 0 ? (
          <span className="p-tab-count">{enrolledCount}</span>
        ) : null}
      </button>
    ))}
  </div>
);
