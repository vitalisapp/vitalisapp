import Icon from '../../../../components/Icon.jsx';
import { useCoachWeek } from '../hooks/useCoachWeek.js';

// Section 4 — AI personal coach card. Rules decide every change; the message
// may be reworded by Gemini. Nothing changes until the user taps an option.
const STATUS = {
  done: { icon: 'check', label: 'Done' },
  missed: { icon: 'close', label: 'Missed' },
  skipped: { icon: 'remove', label: 'Skipped' },
  today: { icon: 'fitness_center', label: 'Today' },
  'today-rest': { icon: 'bedtime', label: 'Rest today' },
  upcoming: { icon: 'fitness_center', label: 'Planned' },
  rest: { icon: 'bedtime', label: 'Rest' },
};

function optionCopy(key, opt) {
  if (key === 'reschedule') {
    const moves = opt.moved.map((m) => `${m.title} → ${m.toDay}`).join(', ');
    return { label: 'Move it', detail: `${moves}${opt.dropped.length ? ` · ${opt.dropped.length} skipped (no safe free day)` : ''}` };
  }
  if (key === 'lighter') {
    return {
      label: 'Lighter week',
      detail: `Remaining sessions about ${opt.capMins} min${opt.removed ? ` · extra rest on ${opt.removed.weekday}` : ''}`,
    };
  }
  return { label: 'Skip it', detail: 'Keep the rest of the week as planned' };
}

export default function CoachCard({ onStartWorkout = undefined, onOpenPlans = undefined }) {
  const { data, loading, busy, error, choose, reset } = useCoachWeek(true);

  if (loading && !data) {
    return (
      <section className="vd-card vd-coach" aria-busy="true" aria-label="Your coach">
        <div className="vd-coach-skel" />
      </section>
    );
  }
  if (!data || data.state === 'no_goal') return null;

  if (data.state === 'no_plan') {
    return (
      <section className="vd-card vd-coach" aria-label="Your coach">
        <div className="vd-coach-head">
          <span className="vd-coach-avatar"><Icon name="sports" /></span>
          <div>
            <h2 className="vd-card-title">Your coach</h2>
            <p className="vd-coach-msg">Pick an active training plan and I'll plan your week, keep you on track when life gets busy, and suggest what to eat.</p>
          </div>
        </div>
        <button type="button" className="vd-coach-btn vd-coach-btn--primary" onClick={onOpenPlans}>Choose a plan</button>
      </section>
    );
  }

  const { week, proposal, todayEntry, nutrition = [], plan, adjusted, aiWorded } = data;
  const order = proposal ? [proposal.recommended, ...['reschedule', 'lighter', 'skip'].filter((k) => k !== proposal.recommended)] : [];
  const canStart = todayEntry && todayEntry.kind === 'workout' && todayEntry.status === 'today';

  return (
    <section className="vd-card vd-coach" aria-label="Your coach">
      <div className="vd-coach-head">
        <span className={`vd-coach-avatar${proposal ? ' is-alert' : ''}`}><Icon name={proposal ? 'event_busy' : 'sports'} /></span>
        <div className="vd-coach-head-text">
          <h2 className="vd-card-title">
            Your coach
            {aiWorded && <span className="vd-coach-ai" title="Message written by Gemini from your plan data">AI</span>}
          </h2>
          <p className="vd-coach-msg" aria-live="polite">{data.message || data.ruleMessage}</p>
        </div>
      </div>

      <ol className="vd-coach-week" aria-label={`This week in ${plan.title}`}>
        {week.map((e) => {
          const st = STATUS[e.status] || STATUS.rest;
          const title = `${e.weekday}: ${e.kind === 'workout' ? e.title : 'Rest'} (${st.label}${e.moved && e.kind === 'workout' ? ', moved' : ''}${e.capMins ? `, about ${e.capMins} min` : ''})`;
          return (
            <li key={e.date} className={`vd-coach-day is-${e.status}${e.moved && e.kind === 'workout' ? ' is-moved' : ''}`} title={title} aria-label={title}>
              <span className="vd-coach-dow">{e.weekday.slice(0, 1)}</span>
              <span className="vd-coach-dot"><Icon name={st.icon} /></span>
            </li>
          );
        })}
      </ol>

      {proposal && (
        <div className="vd-coach-options" role="group" aria-label="How should I adjust your week?">
          {order.map((key, i) => {
            const opt = proposal.options[key];
            if (!opt?.available) return null;
            const copy = optionCopy(key, opt);
            return (
              <button key={key} type="button" disabled={busy} onClick={() => choose(key)}
                className={`vd-coach-opt${i === 0 ? ' is-recommended' : ''}`}>
                <span className="vd-coach-opt-label">{copy.label}{i === 0 && <em> · Recommended</em>}</span>
                <span className="vd-coach-opt-detail">{copy.detail}</span>
              </button>
            );
          })}
        </div>
      )}

      {!proposal && (
        <div className="vd-coach-actions">
          {canStart && (
            <button type="button" className="vd-coach-btn vd-coach-btn--primary"
              onClick={() => onStartWorkout(plan.id, todayEntry.dayNumber, todayEntry.capMins)}>
              <Icon name="play_arrow" /> Start {todayEntry.title}{todayEntry.capMins ? ` (~${todayEntry.capMins} min)` : ''}
            </button>
          )}
          {adjusted && (
            <button type="button" className="vd-coach-link" disabled={busy} onClick={reset}>Undo this week's changes</button>
          )}
        </div>
      )}

      {nutrition.length > 0 && (
        <ul className="vd-coach-tips" aria-label="Nutrition tips">
          {nutrition.slice(0, 2).map((t) => (
            <li key={t.key}><Icon name={t.icon} /><span>{t.text}</span></li>
          ))}
        </ul>
      )}

      {error && <p className="vd-coach-error" role="alert">{error}</p>}
    </section>
  );
}
