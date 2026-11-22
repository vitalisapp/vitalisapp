import Icon from '../Icon.jsx';
import {
  BMI_CLASSES, bmiScalePosition, classifyBmi, distanceToHealthy, healthyWeightRange,
} from '../../lib/bmi.js';
import './health.css';

/**
 * BMI result with its meaning — not just the number.
 * Shows the WHO class, a colour scale with a marker, what it means, the
 * healthy weight range for the user's height and one practical tip.
 *
 * @param {{ bmi: number|null, heightCm?: number|string, weightKg?: number|string, compact?: boolean, className?: string }} props
 */
export default function BmiInsight({ bmi = undefined, heightCm = undefined, weightKg = undefined, compact = false, className = '' }) {
  const cls = classifyBmi(bmi);
  if (!cls) {
    return (
      <div className={`vh-bmi is-empty ${className}`}>
        <Icon name="monitor_weight" />
        <p>Add your height and weight to see your BMI and what it means.</p>
      </div>
    );
  }
  const pos = bmiScalePosition(bmi);
  const range = healthyWeightRange(heightCm);
  const distance = weightKg ? distanceToHealthy(weightKg, heightCm) : '';

  return (
    <section className={`vh-bmi is-${cls.tone}${compact ? ' is-compact' : ''} ${className}`} aria-label="BMI result and interpretation">
      <div className="vh-bmi__head">
        <div>
          <p className="vh-bmi__eyebrow">Body Mass Index</p>
          <p className="vh-bmi__value">
            {Number(bmi).toFixed(1)}
            <span className="vh-bmi__badge">{cls.label}</span>
          </p>
        </div>
        <p className="vh-bmi__range-label">Range {cls.range}</p>
      </div>

      <div className="vh-bmi__scale" aria-hidden="true">
        {BMI_CLASSES.map((c) => <span key={c.key} className={`vh-bmi__seg is-${c.tone}`} />)}
        {pos != null && <span className="vh-bmi__marker" style={{ left: `${pos}%` }} />}
      </div>
      <div className="vh-bmi__ticks" aria-hidden="true">
        <span>18.5</span><span>25</span><span>30</span>
      </div>

      <p className="vh-bmi__meaning">{cls.meaning}</p>

      {!compact && (
        <>
          {(range || distance) && (
            <p className="vh-bmi__fact">
              <Icon name="straighten" />
              <span>
                {range && <>Healthy weight for your height: <strong>{range.minKg}–{range.maxKg} kg</strong>. </>}
                {distance && distance !== 'Within the healthy range' && <>You are {distance}.</>}
              </span>
            </p>
          )}
          <p className="vh-bmi__fact">
            <Icon name="tips_and_updates" />
            <span>{cls.tip}</span>
          </p>
        </>
      )}

      <p className="vh-bmi__note">
        BMI is a screening estimate. It does not measure muscle or body fat directly, so very muscular people can read high. General fitness information only, not medical advice.
      </p>
    </section>
  );
}
