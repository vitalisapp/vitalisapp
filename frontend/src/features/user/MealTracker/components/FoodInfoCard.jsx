import Icon from '../../../../components/Icon.jsx';

// Section 6 — details of a catalog food picked in the manual form: photo,
// description, category, preparation method, characteristics (oily, fried,
// steamed, grilled…), nutrition for the current portion and goal fit.
const FIT_LABEL = { great: 'Great for your goal', ok: 'Fits in moderation', limit: 'Limit for your goal' };

const fmt = (v, d = 0) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '–';
  return d ? (Math.round(n * 10 ** d) / 10 ** d).toLocaleString() : Math.round(n).toLocaleString();
};

export function FoodThumb({ food = undefined, size = 'md' }) {
  if (food?.image?.url) {
    return <img className={`mt-food-thumb mt-food-thumb--${size}`} src={food.image.url} alt="" loading="lazy" referrerPolicy="no-referrer" />;
  }
  return (
    <span className={`mt-food-thumb mt-food-thumb--${size} mt-food-thumb--icon`} aria-hidden="true">
      <Icon name={food?.category_icon || 'restaurant'} />
    </span>
  );
}

export function TraitChips({ traits = [], max = 6 }) {
  if (!traits.length) return null;
  return (
    <ul className="mt-trait-list" aria-label="Food characteristics">
      {traits.slice(0, max).map((t) => (
        <li key={t.key} className={`mt-trait mt-trait--${t.tone}`}>{t.label}</li>
      ))}
    </ul>
  );
}

export default function FoodInfoCard({ food = undefined, portion = undefined }) {
  if (!food) return null;
  const p = portion || food;
  const facts = [
    { label: 'Calories', value: `${fmt(p.calories)} kcal` },
    { label: 'Protein', value: `${fmt(p.protein, 1)} g` },
    { label: 'Carbs', value: `${fmt(p.carbs, 1)} g` },
    { label: 'Fat', value: `${fmt(p.fat, 1)} g` },
    { label: 'Sugar', value: p.sugar == null || p.sugar === '' ? '–' : `${fmt(p.sugar, 1)} g` },
    { label: 'Sodium', value: p.sodium == null || p.sodium === '' ? '–' : `${fmt(p.sodium)} mg` },
  ];
  return (
    <section className="mt-food-info" aria-label={`About ${food.name}`}>
      <div className="mt-food-info-head">
        <figure className="mt-food-info-photo">
          <FoodThumb food={food} size="lg" />
          {food.image?.url && (
            <figcaption>
              Photo: <a href={food.image.link} target="_blank" rel="noreferrer">{food.image.credit}</a> / Pexels
            </figcaption>
          )}
        </figure>
        <div className="mt-food-info-copy">
          <h4 className="mt-food-info-name">{food.name}</h4>
          {food.category_label && (
            <p className="mt-food-info-cat" title={food.category_description || undefined}>
              <Icon name={food.category_icon || 'restaurant'} /> {food.category_label}
            </p>
          )}
          {food.description && <p className="mt-food-info-desc">{food.description}</p>}
        </div>
      </div>

      <TraitChips traits={food.traits} />

      {food.prep_label && (
        <p className="mt-food-info-prep">
          <strong>Preparation: {food.prep_label}.</strong> {food.prep_description}
        </p>
      )}

      <dl className="mt-food-facts">
        {facts.map((f) => (
          <div key={f.label} className="mt-food-fact">
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-food-info-basis">
        {portion ? 'For the weight you entered.' : `Per ${food.serving_label || 'serving'}${food.serving_grams ? ` (${fmt(food.serving_grams)} g)` : ''}.`} Approximate values.
      </p>

      {food.goal_fit && (
        <p className={`mt-food-fit mt-food-fit--${food.goal_fit.level}`}>
          <Icon name={food.goal_fit.level === 'great' ? 'check_circle' : food.goal_fit.level === 'limit' ? 'warning' : 'info'} />
          <span><strong>{FIT_LABEL[food.goal_fit.level]}.</strong> {food.goal_fit.note}</span>
        </p>
      )}
      {food.category_description && <p className="mt-food-info-catdesc">{food.category_label}: {food.category_description}</p>}
    </section>
  );
}
