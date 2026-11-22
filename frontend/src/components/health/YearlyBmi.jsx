import { useEffect, useState } from 'react';
import Icon from '../Icon.jsx';
import { apiGet } from '../../lib/apiClient.js';
import { BMI_CLASSES } from '../../lib/bmi.js';
import './health.css';

const TONE = Object.fromEntries(BMI_CLASSES.map((c) => [c.key, c.tone]));

/**
 * Yearly BMI monitoring — one row per calendar year with change vs the
 * previous year and a plain-language summary. Reminds the user when the last
 * reading is more than a year old.
 */
export default function YearlyBmi({ userId = undefined }) {
  const [state, setState] = useState({ loading: true, data: null, error: '' });

  useEffect(() => {
    if (!userId) return undefined;
    let alive = true;
    apiGet(`/api/bmi/${userId}/yearly`)
      .then((data) => { if (alive) setState({ loading: false, data, error: '' }); })
      .catch((err) => { if (alive) setState({ loading: false, data: null, error: err.message || 'Could not load yearly BMI.' }); });
    return () => { alive = false; };
  }, [userId]);

  const { loading, data, error } = state;
  if (loading) return <div className="vh-yearly is-loading" aria-busy="true">Loading yearly BMI…</div>;
  if (error) return <div className="vh-yearly is-error" role="alert">{error}</div>;
  const years = data?.years || [];

  return (
    <section className="vh-yearly" aria-label="Yearly BMI monitoring">
      <header className="vh-yearly__head">
        <div>
          <h3>Yearly BMI</h3>
          <p>How your BMI has changed year to year.</p>
        </div>
        {data?.lastRecordedOn && <span className="vh-yearly__last">Last check {data.lastRecordedOn}</span>}
      </header>

      {data?.checkDue && (
        <p className="vh-yearly__due" role="status">
          <Icon name="event_repeat" />
          {data.lastRecordedOn
            ? `Your last BMI check was over a year ago (${data.daysSinceLast} days). Update your weight in Profile for this year's reading.`
            : 'No BMI readings yet. Add your weight and height in Profile to start yearly monitoring.'}
        </p>
      )}

      {years.length > 0 && (
        <ul className="vh-yearly__list">
          {years.map((y) => (
            <li key={y.year}>
              <div className="vh-yearly__year">
                <strong>{y.year}</strong>
                <span>{y.readings} reading{y.readings === 1 ? '' : 's'}</span>
              </div>
              <div className="vh-yearly__main">
                <div className="vh-yearly__nums">
                  <span className="vh-yearly__bmi">{y.lastBmi.toFixed(1)}</span>
                  <span className={`vh-yearly__cat is-${TONE[y.categoryKey] || 'info'}`}>{y.category}</span>
                  {y.changeFromPrevYear != null && (
                    <span className={`vh-yearly__delta${y.changeFromPrevYear > 0 ? ' is-up' : y.changeFromPrevYear < 0 ? ' is-down' : ''}`}>
                      <Icon name={y.changeFromPrevYear > 0 ? 'arrow_upward' : y.changeFromPrevYear < 0 ? 'arrow_downward' : 'remove'} />
                      {Math.abs(y.changeFromPrevYear).toFixed(1)}
                    </span>
                  )}
                </div>
                <p>{y.summary}</p>
                {y.readings > 1 && <p className="vh-yearly__sub">Range {y.minBmi}–{y.maxBmi} · average {y.avgBmi}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
