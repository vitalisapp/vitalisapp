import { useState } from 'react';
import Icon from '../../../../components/Icon.jsx';
import { goalLabel } from '../../Onboarding/constants/goals.js';

// Section 3 — one recommended plan per goal (main + up to 2 extras).
// Shows which plan is active, lets the user switch, generate or rebuild, and
// explains why the active plan was recommended.
export default function GoalPlansPanel({ goalStatus = undefined, plans = undefined, onOpen = undefined, onGenerate = undefined, onActivate = undefined, busy = undefined }) {
  const [showWhy, setShowWhy] = useState(false);
  const rows = goalStatus?.goalPlans || [];
  if (!goalStatus?.goal || rows.length === 0) return null;
  const active = rows.find((r) => r.plan?.active);
  const findPlan = (id) => plans.find((p) => String(p.id) === String(id));

  return (
    <section className="gp-panel" aria-label="Plans for your goals">
      <header className="gp-head">
        <h3 className="gp-title">Your goal plans</h3>
        {goalStatus.goal.targetDate && <span className="gp-meta">Target date {goalStatus.goal.targetDate}</span>}
      </header>
      <ul className="gp-list">
        {rows.map((r) => {
          const full = r.plan ? findPlan(r.plan.id) : null;
          return (
            <li key={r.goalType} className={`gp-row${r.plan?.active ? ' is-active' : ''}`}>
              <div className="gp-row-main">
                <p className="gp-goal">
                  {goalLabel(r.goalType)}
                  <span className="gp-badge">{r.primary ? 'Main goal' : 'Extra goal'}</span>
                  {r.plan?.active && <span className="gp-badge gp-badge--active">Active</span>}
                </p>
                <p className="gp-plan">{r.plan ? r.plan.title : 'No plan yet'}</p>
              </div>
              <div className="gp-actions">
                {r.plan ? (
                  <>
                    {full && <button type="button" className="gp-btn" onClick={() => onOpen(full)}>Open</button>}
                    {!r.plan.active && (
                      <button type="button" className="gp-btn gp-btn--accent" disabled={busy} onClick={() => onActivate(r.plan.id)}>Make active</button>
                    )}
                  </>
                ) : (
                  <button type="button" className="gp-btn gp-btn--accent" disabled={busy}
                    onClick={() => onGenerate({ goalType: r.goalType, makeActive: false })}>
                    Generate plan
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="gp-foot">
        {active?.plan?.rationale?.length > 0 && (
          <button type="button" className="gp-link" aria-expanded={showWhy} onClick={() => setShowWhy((v) => !v)}>
            <Icon name={showWhy ? 'expand_less' : 'expand_more'} className="text-[16px]" />
            Why this plan?
          </button>
        )}
        <button type="button" className="gp-link" disabled={busy} onClick={() => onGenerate({ all: true, regenerate: true })}>
          <Icon name="refresh" className="text-[16px]" />
          Rebuild with my latest info
        </button>
      </div>
      {showWhy && active?.plan?.rationale?.length > 0 && (
        <ul className="gp-why">
          {active.plan.rationale.map((line) => <li key={line}>{line}</li>)}
        </ul>
      )}
    </section>
  );
}
