// Progress summary UI (Section 8) — split into two quiet blocks:
//   <SummaryStats>     four KPI tiles (last 7 days vs the 7 before)
//   <SummaryInsights>  rule-based plain-language reading + status
// Data: GET /api/progress/summary (real logs only).
import { useState } from 'react';
import Icon from '../../../../components/Icon.jsx';
import './progressSummary.css';

const STATUS = {
  great:           { label: 'Great week',      tone: 'good' },
  steady:          { label: 'Steady progress', tone: 'good' },
  needs_attention: { label: 'Needs attention', tone: 'warn' },
  getting_started: { label: 'Getting started', tone: 'info' },
};

const INSIGHTS_PREVIEW = 3;

function Trend({ now = undefined, prev = undefined, unit = '' }) {
  if (prev == null || now == null || now === prev) {
    return <span className="ps-trend">Same as last week</span>;
  }
  const up = now > prev;
  return (
    <span className={`ps-trend ${up ? 'is-up' : 'is-down'}`}>
      <Icon name={up ? 'arrow_upward' : 'arrow_downward'} />
      {Math.abs(now - prev)}{unit} vs last week
    </span>
  );
}

export function SummaryStats({ summary = undefined, loading = undefined }) {
  if (!summary) {
    return (
      <div className="ps-stats" aria-busy={loading}>
        {[0, 1, 2, 3].map((i) => <div key={i} className="ps-stat ps-stat--skeleton" />)}
      </div>
    );
  }
  const week = summary.week || {};
  const prev = summary.previousWeek || {};
  const w = summary.weightChange30d;
  const sign = w > 0 ? '+' : w < 0 ? '−' : '';

  return (
    <div className="ps-stats">
      <div className="ps-stat">
        <span className="ps-stat-label">Active days</span>
        <span className="ps-stat-value">{week.activeDays ?? 0}<small> / 7</small></span>
        <Trend now={week.activeDays} prev={prev.activeDays} />
      </div>
      <div className="ps-stat">
        <span className="ps-stat-label">Active minutes</span>
        <span className="ps-stat-value">{week.minutes ?? 0}<small> min</small></span>
        <Trend now={week.minutes} prev={prev.minutes} unit=" min" />
      </div>
      <div className="ps-stat">
        <span className="ps-stat-label">Days with meals logged</span>
        <span className="ps-stat-value">{week.mealDays ?? 0}<small> / 7</small></span>
        <Trend now={week.mealDays} prev={prev.mealDays} />
      </div>
      <div className="ps-stat">
        <span className="ps-stat-label">Weight, 30 days</span>
        <span className="ps-stat-value">
          {w == null ? '—' : `${sign}${Math.abs(w)}`}{w != null && <small> kg</small>}
        </span>
        <span className="ps-trend">
          {summary.latestWeightKg != null ? `Now ${summary.latestWeightKg} kg` : 'No recent weigh-in'}
        </span>
      </div>
    </div>
  );
}

export function SummaryInsights({ summary = undefined, loading = undefined, error = undefined, onRetry = undefined }) {
  const [expanded, setExpanded] = useState(false);

  if (!summary) {
    if (error && !loading) {
      return (
        <section className="lg-card ps-insights-card">
          <div className="lg-inline-error" role="alert">
            <Icon name="cloud_off" />
            <span>{error}</span>
            <button type="button" className="lg-btn lg-btn--ghost" onClick={onRetry}>Retry</button>
          </div>
        </section>
      );
    }
    return <section className="lg-card ps-insights-card ps-insights-card--skeleton" aria-busy="true" />;
  }

  const status = STATUS[summary.status] || STATUS.getting_started;
  const items = summary.insights || [];
  const shown = expanded ? items : items.slice(0, INSIGHTS_PREVIEW);

  return (
    <section className="lg-card ps-insights-card" aria-labelledby="ps-insights-title">
      <header className="lg-card-head">
        <div className="lg-card-titles">
          <h2 id="ps-insights-title" className="lg-card-title">Insights</h2>
          <p className="lg-card-sub">{summary.headline}</p>
        </div>
        <span className={`lg-pill lg-pill--${status.tone}`}>{status.label}</span>
      </header>

      {items.length > 0 && (
        <ul className="ps-insights">
          {shown.map((i) => (
            <li key={i.key} className="ps-insight">
              <span className={`ps-dot ps-dot--${i.tone}`} aria-hidden="true" />
              <span className="ps-insight-copy">
                <strong>{i.title}</strong>
                <span>{i.text}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <footer className="ps-insights-foot">
        <span>Last 7 days compared with the 7 before, based on your logs.</span>
        {items.length > INSIGHTS_PREVIEW && (
          <button type="button" className="lg-link" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Show less' : `Show all ${items.length}`}
          </button>
        )}
      </footer>
    </section>
  );
}
