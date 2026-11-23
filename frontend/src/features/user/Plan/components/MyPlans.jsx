import Icon from '../../../../components/Icon.jsx';
import { PlanCover, PlanCard, PlanActions } from '../components/PlanWidgets.jsx';
import GoalPlansPanel from '../components/GoalPlansPanel.jsx';

// MY PLANS TAB — real user data: enrolled templates + owned personal plans
const humanizeGoalType = (t) => String(t || 'Fitness').toLowerCase().split('_').map((w) => w.slice(0, 1).toUpperCase() + w.slice(1)).join(' ');

const GoalLinkBanner = ({ goalStatus = undefined, plans = undefined, onContinue = undefined, onGenerate = undefined, generating = undefined }) => {
  const { goal, linkedPlan } = goalStatus || {};
  if (!goal) return null;
  const label = humanizeGoalType(goal.goalType);
  const kcal = goal.dailyKcal != null ? `${Number(goal.dailyKcal).toLocaleString()} kcal/day` : null;
  const linked = linkedPlan ? plans.find((p) => String(p.id) === String(linkedPlan.id)) : null;

  if (linkedPlan && linked) {
    return (
      <div className="p-banner p-banner--accent">
        <p className="p-banner-text">
          Training for <strong>{label}</strong>{kcal ? ` · ${kcal}` : ''} — linked plan: <strong>{linked.title}</strong>
        </p>
        <button type="button" onClick={() => onContinue(linked)} className="p-banner-btn p-banner-btn--accent">
          Open plan
        </button>
      </div>
    );
  }

  return (
    <div className="p-banner">
      <p className="p-banner-text">
        Your {label} goal{kcal ? ` (${kcal})` : ''} has no training plan yet
        {linkedPlan ? ' — its plan was deleted' : ''}.
      </p>
      <button type="button" onClick={onGenerate} disabled={generating} className="p-banner-btn">
        {generating ? 'Generating…' : 'Generate from my goal'}
      </button>
    </div>
  );
};

const MyPlans = ({ plans = undefined, goalStatus = undefined, onOpen = undefined, onContinue = undefined, onCreateClick = undefined, onGenerate = undefined, onDelete = undefined, onEdit = undefined, generating = undefined, prefs = undefined, onOpenPrefs = undefined, onGenerateGoal = undefined, onActivate = undefined }) => {
  const enrolled = plans.filter(p => p.is_enrolled === 1 || p.is_owner === 1);
  if (enrolled.length === 0) {
    return (
      <div className="p-empty" style={{ animation: 'fadeIn 0.3s ease' }}>
        <span className="p-empty-icon">
          <Icon name="fitness_center" fill={1} />
        </span>
        <h3 className="p-empty-title">No plans yet</h3>
        <p className="p-empty-text">
          Create your own plan, generate one from your goal, or explore a blueprint to enroll.
        </p>
        <div className="p-empty-actions">
          <button
            type="button"
            onClick={onCreateClick}
            className="p-btn"
            style={{ width: 'auto', padding: '0 16px' }}
          >
            Create personal plan
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="p-btn p-btn--ghost"
            style={{ width: 'auto', padding: '0 16px' }}
          >
            {generating ? 'Generating…' : 'Generate from my goal'}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {goalStatus?.goalPlans?.length > 0 ? (
        <GoalPlansPanel goalStatus={goalStatus} plans={plans} onOpen={onContinue} onGenerate={onGenerateGoal} onActivate={onActivate} busy={generating} />
      ) : (
        <GoalLinkBanner goalStatus={goalStatus} plans={plans} onContinue={onContinue} onGenerate={onGenerate} generating={generating} />
      )}
      {/* Module 5 — training preferences: schedule + duration + alternatives inputs. */}
      <div className="p-banner">
        <p className="p-banner-text">
          {prefs && (prefs.equipment?.length || prefs.preferredDays?.length || prefs.sessionDurationMins)
            ? prefs.equipment?.length > 0
              ? `${prefs.equipment.join(' · ')} · `
              : 'Bodyweight · '
            : 'No training preferences yet — '}
          {prefs && prefs.equipment?.length ? `${prefs.preferredDays?.length ?? 0} day${(prefs.preferredDays?.length ?? 0) !== 1 ? 's' : ''}/week · ` : ''}
          {prefs?.sessionDurationMins ? `${prefs.sessionDurationMins} min sessions · ` : ''}
          {prefs && (prefs.equipment?.length || prefs.sessionDurationMins) ? 'used for scheduling, alternatives & plan fit.' : 'recommendations use them to fit your time and equipment.'}
        </p>
        <button type="button" onClick={onOpenPrefs} className="p-banner-btn">
          {prefs && prefs.sessionDurationMins ? 'Edit preferences' : 'Set preferences'}
        </button>
      </div>
      {(() => {
        const active = enrolled[0];
        const progressPct = Math.max(0, Math.min(100, Number(active.progress_pct) || 0));
        const completedDays = Number(active.completed_days) || 0;
        const isLinked = goalStatus?.linkedPlan && String(active.id) === String(goalStatus.linkedPlan.id);
        return (
          <div
            className="p-active"
            role="button"
            tabIndex={0}
            aria-label={`Open plan: ${active.title}`}
            onClick={() => onOpen(active)}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(active);
              }
            }}
          >
            <div className="p-active-cover">
              <PlanCover
                seed={active.image_seed}
                title={active.title}
                tag={active.tag}
                src={active.image_url}
              />
            </div>
            <div className="p-active-body">
              <p className="p-active-eyebrow">
                Active plan{isLinked ? ' · Goal-linked' : active.is_owner === 1 ? ' · Yours' : ''}
              </p>
              <h2 className="p-active-title">{active.title}</h2>
              <p className="p-active-meta">
                {active.duration}
                {active.intensity ? ` · ${active.intensity}` : ''}
                {completedDays > 0 ? ` · ${completedDays} day${completedDays !== 1 ? 's' : ''} done` : ''}
              </p>
              <div className="p-progress" aria-label={`${progressPct}% complete`}>
                <div className="p-progress-track">
                  <div className="p-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="p-progress-pct">{progressPct}%</span>
              </div>
            </div>
            <div className="p-active-actions" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="p-btn" onClick={() => onContinue(active)}>
                Continue
              </button>
              {active.is_owner === 1 ? (
                <PlanActions plan={active} onEdit={onEdit} onDelete={onDelete} />
              ) : null}
            </div>
          </div>
        );
      })()}
      {enrolled.length > 1 && (
        <section className="p-section" style={{ marginTop: 0 }}>
          <div className="p-head">
            <h3 className="p-head-title">All enrolled plans</h3>
            <span className="p-count">{enrolled.length}</span>
          </div>
          <div className="p-grid">
            {enrolled.slice(1).map((plan, i) => (
              <div key={plan.id} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <PlanCard
                  plan={plan}
                  onOpen={onOpen}
                  onEnroll={() => {}}
                  onContinue={onContinue}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  style={{ flex: 1, animation: `slideUp 0.3s ease ${i * 0.06}s both` }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MyPlans;
