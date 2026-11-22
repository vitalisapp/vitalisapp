import Icon from '../../../../components/Icon.jsx';
import { goalIntakeNote, limitStatus, sugarSodiumTotals } from '../../../../lib/foodInfo.js';

// Section 6 — daily sugar + sodium vs WHO limits, and a goal-based reading.
export default function SugarSodiumCard({ entries = [], goalType = undefined, calories = undefined, calorieGoal = undefined, protein = undefined, proteinGoal = undefined, dateLabel = 'Today' }) {
  const totals = sugarSodiumTotals(entries);
  const s = limitStatus(totals);
  const note = goalIntakeNote({ goalType, calories, calorieGoal, protein, proteinGoal, entries: entries.length });
  const rows = [
    { key: 'sodium', label: 'Sodium', unit: 'mg', icon: 'water_drop', data: s.sodium, limitText: `${s.sodium.limit.toLocaleString()} mg limit` },
    { key: 'sugar', label: 'Sugar', unit: 'g', icon: 'cookie', data: s.sugar, limitText: `${s.sugar.limit} g limit (ideal ${s.sugar.ideal} g)` },
  ];
  const missing = totals.total - totals.known;
  return (
    <section className="mt-panel mt-limits" aria-labelledby="mt-limits-title">
      <div className="mt-limits-head">
        <h3 id="mt-limits-title" className="mt-limits-title">Sugar &amp; sodium</h3>
        <span className="mt-limits-date">{dateLabel}</span>
      </div>
      <p className="mt-limits-goal"><Icon name="flag" /> {note}</p>
      <div className="mt-limits-rows">
        {rows.map((r) => (
          <div key={r.key} className={`mt-limit mt-limit--${r.data.status}`}>
            <div className="mt-limit-top">
              <span className="mt-limit-label"><Icon name={r.icon} /> {r.label}</span>
              <span className="mt-limit-value">
                {r.data.value.toLocaleString()} {r.unit} <small>/ {r.limitText}</small>
              </span>
            </div>
            <div className="mt-limit-track" role="progressbar" aria-label={`${r.label} vs daily limit`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.data.pct}>
              <span className="mt-limit-fill" style={{ width: `${r.data.pct}%` }} />
            </div>
            <p className="mt-limit-msg">{r.data.message}</p>
          </div>
        ))}
      </div>
      <p className="mt-limits-foot">
        WHO guidance. {missing > 0 ? `${missing} older entr${missing === 1 ? 'y has' : 'ies have'} no sugar/sodium data and ${missing === 1 ? 'is' : 'are'} not counted.` : 'Values are estimates.'}
      </p>
    </section>
  );
}
