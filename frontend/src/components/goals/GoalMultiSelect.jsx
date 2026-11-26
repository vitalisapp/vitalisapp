import { useState } from 'react';
import Icon from '../Icon.jsx';
import { GOAL_TYPES } from '../../features/user/Onboarding/constants/goals.js';
import {
  MAX_GOALS, toggleGoal, makeMain, selectedGoals, shortGoal, describeGoalMix,
} from '../../lib/goalSelection.js';
import './goal-select.css';

// Multi-select fitness goals with a main goal (Revision #5). Used by
// Onboarding (variant "onboarding", reuses the onboarding card styles) and the
// Change Goal modal (variant "compact"). Conflicts are explained inline with
// one-tap compatible alternatives — never a silent disabled button.
export default function GoalMultiSelect({
  primary = '',
  extras = [],
  onChange = undefined,
  variant = 'compact',
  showSummary = true,
}) {
  const [conflict, setConflict] = useState(null);
  const state = { primary, extras };
  const chosen = selectedGoals(state);
  const isOnb = variant === 'onboarding';

  const apply = (next) => {
    setConflict(null);
    onChange?.(next);
  };
  const tap = (key) => {
    const res = toggleGoal(state, key);
    if (res.conflict) setConflict({ key, ...res.conflict });
    else apply(res.state);
  };

  const mix = showSummary ? describeGoalMix(primary, extras) : [];

  return (
    <div className={`gms gms--${variant}`}>
      <p className="gms-help">
        Pick up to {MAX_GOALS} goals. Your first pick is your main goal — you can change it below.
      </p>

      <div className={isOnb ? 'onb-choice-grid' : 'gms-grid'} role="group" aria-label="Fitness goals">
        {GOAL_TYPES.map((g) => {
          const on = chosen.includes(g.key);
          const main = primary === g.key;
          if (isOnb) {
            return (
              <button key={g.key} type="button" aria-pressed={on} onClick={() => tap(g.key)}
                className={`onb-choice${on ? ' is-selected' : ''}`}>
                <span className="onb-choice__icon" aria-hidden="true"><Icon name={g.icon} /></span>
                <span className="onb-choice__copy">
                  <span className="onb-choice__title">
                    {g.label}
                    {main && <span className="gms-badge">Main goal</span>}
                    {on && !main && <span className="gms-badge gms-badge--extra">Extra</span>}
                  </span>
                  <span className="onb-choice__desc">{g.desc}</span>
                </span>
                <span className="onb-choice__indicator" aria-hidden="true">{on ? <Icon name="check" /> : <span />}</span>
              </button>
            );
          }
          return (
            <button key={g.key} type="button" aria-pressed={on} onClick={() => tap(g.key)}
              className={`gms-card${on ? ' is-on' : ''}`}>
              <Icon name={g.icon} className="gms-card__icon" />
              <span className="gms-card__label">{g.label}</span>
              {main && <span className="gms-badge">Main</span>}
              {on && !main && <Icon name="check" className="gms-card__check" />}
            </button>
          );
        })}
      </div>

      {conflict && (
        <div className="gms-conflict" role="alert">
          <div className="gms-conflict__head">
            <Icon name="error" className="gms-conflict__icon" />
            <p className="gms-conflict__title">{conflict.title}</p>
            <button type="button" className="gms-conflict__close" aria-label="Dismiss" onClick={() => setConflict(null)}>
              <Icon name="close" />
            </button>
          </div>
          <p className="gms-conflict__text">{conflict.message}</p>
          {conflict.tip && <p className="gms-conflict__tip">{conflict.tip}</p>}
          {conflict.actions.length > 0 && (
            <div className="gms-conflict__actions">
              {conflict.actions.map((a) => (
                <button key={a.label} type="button" className="gms-conflict__action" onClick={() => apply(a.state)}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {chosen.length > 1 && (
        <fieldset className="gms-main">
          <legend className="gms-main__legend">Which goal matters most?</legend>
          <div className="gms-main__row" role="radiogroup" aria-label="Main goal">
            {chosen.map((k) => (
              <button key={k} type="button" role="radio" aria-checked={primary === k}
                className={`gms-main__opt${primary === k ? ' is-on' : ''}`}
                onClick={() => apply(makeMain(state, k))}>
                {primary === k && <Icon name="star" fill={1} className="gms-main__star" />}
                {shortGoal(k)}
              </button>
            ))}
          </div>
          <p className="gms-main__hint">Your main goal sets your calories and your active workout plan.</p>
        </fieldset>
      )}

      {mix.length > 0 && (
        <div className="gms-mix" aria-label="How your goals shape your plan">
          <p className="gms-mix__title">How your goals shape your plan</p>
          <ul>
            {mix.map((l) => (
              <li key={l.text}><Icon name={l.icon} className="gms-mix__icon" />{l.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
