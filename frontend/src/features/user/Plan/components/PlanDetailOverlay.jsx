import Icon from '../../../../components/Icon.jsx';
import { PlanCover } from '../components/PlanWidgets.jsx';

// PLAN DETAIL OVERLAY COMPONENT
const PlanDetailOverlay = ({ plan = undefined, onClose = undefined, onStart = undefined, onLocked = undefined }) => {
  if (!plan) return null;
  const enrolled = plan.is_enrolled === 1;
  const locked = Boolean(plan.locked) && !enrolled && plan.is_owner !== 1;
  const pct = Math.max(0, Math.min(100, Number(plan.progress_pct) || 0));
  // VITALIS has no payments: every plan is free (legacy seeded prices are ignored).
  const price = 'Free';

  return (
    <div
      className="p-sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${plan.title} details`}
      onClick={onClose}
    >
      <div className="p-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="p-sheet-scroll">
          <div className="p-sheet-cover">
            <PlanCover
              seed={plan.image_seed}
              title={plan.title}
              tag={plan.tag}
              src={plan.image_url}
            />
            <div className="p-cover-badges">
              {plan.tag ? <span className="p-badge p-badge--tag">{plan.tag}</span> : null}
              {enrolled ? <span className="p-badge p-badge--accent">Enrolled</span> : null}
              {plan.is_owner === 1 ? <span className="p-badge">Mine</span> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close plan details"
              className="p-sheet-close"
            >
              <Icon name="close" className="text-[length:var(--fs-18)]" />
            </button>
          </div>

          <div className="p-sheet-body">
            <p className="p-sheet-eyebrow">
              {plan.intensity ? `${plan.intensity} level` : 'Workout plan'}
            </p>
            <h2 className="p-sheet-title">{plan.title}</h2>
            {plan.description ? <p className="p-sheet-desc">{plan.description}</p> : null}

            <div className="p-sheet-stats">
              <div className="p-sheet-stat">
                <p className="p-sheet-stat-label">Duration</p>
                <p className="p-sheet-stat-value">{plan.duration || '—'}</p>
              </div>
              <div className="p-sheet-stat">
                <p className="p-sheet-stat-label">Level</p>
                <p className="p-sheet-stat-value">{plan.intensity || '—'}</p>
              </div>
              <div className="p-sheet-stat">
                <p className="p-sheet-stat-label">Focus</p>
                <p className="p-sheet-stat-value" title={plan.target_focus || ''}>
                  {plan.target_focus || '—'}
                </p>
              </div>
            </div>

            {enrolled && pct > 0 ? (
              <div className="p-sheet-progress">
                <div className="p-sheet-progress-head">
                  <span>Your progress</span>
                  <strong>{pct}%</strong>
                </div>
                <div className="p-progress-track">
                  <div className="p-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ) : null}

            <div className="p-sheet-price">
              <span className="p-sheet-price-value">{price}</span>
              <span className="p-sheet-price-note">
                {enrolled
                  ? 'Already in your plans'
                  : locked
                    ? `Unlocks at Level ${plan.required_level}`
                    : 'Free to start'}
              </span>
            </div>

            {locked ? (
              <button type="button" onClick={onLocked} className="p-sheet-cta">
                <Icon name="lock" className="text-[length:var(--fs-18)]" />
                See how to unlock
              </button>
            ) : (
              <button type="button" onClick={onStart} className="p-sheet-cta">
                <Icon name="play_arrow" className="text-[length:var(--fs-18)]" fill={1} />
                {enrolled ? 'Open plan tracker' : 'Start this plan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailOverlay;
