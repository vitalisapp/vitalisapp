import Icon from '../../../../components/Icon.jsx';
import { useTheme } from '../../../../hooks/useTheme.js';
import { SIZES } from '../lib/widgetCatalog.js';

/* ── Small helpers ───────────────────────────────────────────────────── */

const WEEKDAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const clampPct = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const fmtInt = (value) => Math.round(Number(value) || 0).toLocaleString();

function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d
    .toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
    .toUpperCase();
}

function goalTypeLabel(value) {
  if (!value) return '';
  return String(value).replace(/_/g, ' ').toLowerCase();
}

function weight(value, units) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return units === 'imperial' ? `${(n * 2.20462).toFixed(1)} lb` : `${n.toFixed(1)} kg`;
}

/* ── Shared primitives ───────────────────────────────────────────────── */

const Chip = ({ name }) => (
  <span className="hw-chip" aria-hidden="true">
    <Icon name={name} />
  </span>
);

const Label = ({ children }) => <span className="hw-label">{children}</span>;

const Rail = ({ pct }) => (
  <span className="hw-rail" aria-hidden="true">
    <span style={{ width: `${clampPct(pct)}%` }} />
  </span>
);

const Bars = ({ values, labels, todayIndex }) => {
  const max = Math.max(1, ...values);
  return (
    <span className="hw-chart" aria-hidden="true">
      <span className="hw-bars">
        {values.map((value, i) => (
          <span className={`hw-bar${i === todayIndex ? ' is-today' : ''}`} key={i}>
            <span style={{ height: `${Math.max(4, (value / max) * 100)}%` }} />
          </span>
        ))}
      </span>
      {labels ? (
        <span className="hw-bar-labels">
          {labels.map((label, i) => (
            <span key={i} className={i === todayIndex ? 'is-today' : undefined}>
              {label}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
};

const Dots = ({ rows }) => {
  const tagged = rows.some((row) => row.tag);
  return (
    <span className={`hw-dots${tagged ? '' : ' hw-dots--plain'}`} aria-hidden="true">
      {rows.map((row) => (
        <span className="hw-dot-row" key={row.key}>
          <span className="hw-dot-tag">{row.tag}</span>
          {row.values.map((on, i) => (
            <span className={`hw-dot${on ? ' is-on' : ''}`} key={i} />
          ))}
        </span>
      ))}
      <span className="hw-dot-row hw-dot-row--letters">
        <span className="hw-dot-tag" />
        {WEEKDAY.map((letter, i) => (
          <span className="hw-dot-letter" key={i}>
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
};

/* ── Widget bodies ───────────────────────────────────────────────────── */

function TodayBody({ data, config, size, show }) {
  const stats = data.stats;
  const empty = stats.steps === 0 && stats.calories === 0 && stats.minutes === 0;
  const metric = config.metric || 'steps';
  const hero = { steps: stats.steps, calories: stats.calories, minutes: stats.minutes }[metric];
  const label = {
    steps: 'STEPS · LOGGED',
    calories: 'KCAL BURNED · LOGGED',
    minutes: 'ACTIVE MINUTES',
  }[metric];
  const pct = data.stepGoal ? (stats.steps / data.stepGoal) * 100 : 0;

  if (empty) {
    return (
      <span className="hw-body hw-body--empty">
        <Chip name="bolt" />
        <Label>TODAY&apos;S ACTIVITY</Label>
        <p className="hw-empty">No activity logged today</p>
        <p className="hw-hint">Log a workout or your daily steps to fill this widget.</p>
      </span>
    );
  }

  if (size === 'large') {
    const days = data.week?.days || [];
    const values = days.map((d) => d.minutes);
    return (
      <span className="hw-body">
        <span className="hw-top">
          <Chip name="bolt" />
          <span className="hw-top-copy">
            <span className="hw-title">Today&apos;s Activity</span>
            <span className="hw-meta">{shortDate(data.today)}</span>
          </span>
        </span>

        <span className="hw-stat-pair">
          <span className="hw-stat">
            <Label>{label}</Label>
            <span className="hw-hero">
              {show ? fmtInt(hero) : '•••'}
              <span className="hw-unit">{metric === 'steps' ? '' : metric === 'calories' ? 'kcal' : 'min'}</span>
            </span>
          </span>
          {config.showSecondary ? (
            <span className="hw-stat">
              <Label>STEP GOAL</Label>
              <span className="hw-metric">
                {show ? `${clampPct(pct)}%` : '•••'}
                <span className="hw-unit">of {fmtInt(data.stepGoal)}</span>
              </span>
            </span>
          ) : null}
        </span>

        {values.some((v) => v > 0) ? (
          <Bars values={values} labels={WEEKDAY} todayIndex={days.findIndex((d) => d.isToday)} />
        ) : (
          <p className="hw-hint">No workouts logged this week yet.</p>
        )}
      </span>
    );
  }

  return (
    <span className="hw-body">
      <span className="hw-top">
        <Chip name="bolt" />
        <span className="hw-top-copy">
          <span className="hw-title">Today&apos;s Activity</span>
          <span className="hw-meta">{shortDate(data.today)}</span>
        </span>
        <span className="hw-top-badge">{show ? `${clampPct(pct)}%` : '•••'}</span>
      </span>

      <span className="hw-hero-block">
        <Label>{label}</Label>
        <span className="hw-hero">
          {show ? fmtInt(hero) : '•••'}
          <span className="hw-unit">{metric === 'steps' ? '' : metric === 'calories' ? 'kcal' : 'min'}</span>
        </span>
        <Rail pct={pct} />
      </span>

      {config.showSecondary ? (
        <span className="hw-mini-row">
          <span className="hw-mini">
            <Label>KCAL</Label>
            <strong>{show ? fmtInt(stats.calories) : '•••'}</strong>
          </span>
          <span className="hw-mini">
            <Label>ACTIVE</Label>
            <strong>{show ? `${fmtInt(stats.minutes)}m` : '•••'}</strong>
          </span>
        </span>
      ) : null}
    </span>
  );
}

function StreakBody({ data, size, show }) {
  const streak = data.streak;
  const current = Number(streak?.current) || 0;
  const longest = Number(streak?.longest) || 0;
  const days = data.week?.days || [];
  const active = days.map((d) => d.sessions > 0 || d.meals > 0);
  const workout = days.map((d) => d.sessions > 0);
  const meals = days.map((d) => d.meals > 0);
  const stepsMet = days.map((d) => d.steps > 0 && d.steps >= data.stepGoal);
  const started = current > 0;

  if (size === 'medium') {
    return (
      <span className="hw-body">
        <span className="hw-split">
          <span className="hw-split-main">
            <Chip name="local_fire_department" />
            <Label>WORKOUT STREAK</Label>
            <span className="hw-hero">{show ? current : '•••'}</span>
            <span className="hw-meta">
              {started ? `days in a row · longest ${show ? longest : '•••'}` : 'Log a workout or meal to begin'}
            </span>
          </span>
          {days.length === 7 ? (
            <Dots
              rows={[
                { key: 'w', tag: 'W', values: workout },
                { key: 'm', tag: 'M', values: meals },
                { key: 's', tag: 'S', values: stepsMet },
              ]}
            />
          ) : null}
        </span>
      </span>
    );
  }

  return (
    <span className="hw-body hw-body--center">
      <Chip name="local_fire_department" />
      <Label>DAY STREAK</Label>
      <span className="hw-hero">{show ? current : '•••'}</span>
      <span className="hw-meta">{started ? 'days in a row' : 'Start your streak'}</span>
      {days.length === 7 ? <Dots rows={[{ key: 'a', tag: '', values: active }]} /> : null}
    </span>
  );
}

function NutritionBody({ data, config, size, show }) {
  const n = data.nutrition;
  if (!n || n.meals === 0) {
    return (
      <span className="hw-body hw-body--empty">
        <Chip name="restaurant" />
        <Label>NUTRITION TODAY</Label>
        <p className="hw-empty">No meals logged today</p>
        <p className="hw-hint">Meals you log in VITALIS appear here.</p>
      </span>
    );
  }

  const targets = n.targets || {};
  const macros = [
    { key: 'protein', label: 'PROTEIN', value: n.protein, target: targets.protein },
    { key: 'carbs', label: 'CARBS', value: n.carbs, target: targets.carbs },
    { key: 'fat', label: 'FAT', value: n.fat, target: targets.fat },
  ];

  return (
    <span className="hw-body">
      <span className="hw-top">
        <Chip name="restaurant" />
        <span className="hw-top-copy">
          <span className="hw-title">Nutrition Today</span>
          <span className="hw-meta">
            {n.meals} meal{n.meals === 1 ? '' : 's'} logged
          </span>
        </span>
      </span>

      <span className="hw-hero-block">
        <Label>CALORIES</Label>
        <span className="hw-hero">
          {show ? fmtInt(n.kcal) : '•••'}
          <span className="hw-unit">{targets.kcal ? `/ ${fmtInt(targets.kcal)} kcal` : 'kcal'}</span>
        </span>
        {targets.kcal ? <Rail pct={(n.kcal / targets.kcal) * 100} /> : null}
      </span>

      {size === 'large' ? (
        <span className="hw-macros hw-macros--wide">
          {macros.map((m) => (
            <span className="hw-macro" key={m.key}>
              <span className="hw-macro-head">
                <Label>{m.label}</Label>
                <span className="hw-macro-value">
                  {show ? `${fmtInt(m.value)}g` : '•••'}
                  {m.target ? <em> / {fmtInt(m.target)}g</em> : null}
                </span>
              </span>
              {m.target ? <Rail pct={(m.value / m.target) * 100} /> : null}
            </span>
          ))}
        </span>
      ) : (
        <span className="hw-macro-row">
          {macros.map((m) => (
            <span className="hw-macro-cell" key={m.key}>
              <Label>{m.label}</Label>
              <span className="hw-macro-value">
                {show ? `${fmtInt(m.value)}g` : '•••'}
                {m.target ? <em>/{fmtInt(m.target)}</em> : null}
              </span>
              {m.target ? <Rail pct={(m.value / m.target) * 100} /> : null}
            </span>
          ))}
        </span>
      )}

      {!targets.kcal && config.showSecondary ? (
        <p className="hw-hint">Set a nutrition goal to see targets.</p>
      ) : null}
    </span>
  );
}

function WeekBody({ data, config, size, show }) {
  const week = data.week;
  const days = week?.days || [];
  const values = days.map((d) => d.minutes);
  const total = week?.totals?.minutes ?? values.reduce((a, b) => a + b, 0);

  if (!days.length) {
    return (
      <span className="hw-body hw-body--empty">
        <Chip name="calendar_month" />
        <Label>WEEKLY ACTIVITY</Label>
        <p className="hw-empty">No weekly data yet</p>
      </span>
    );
  }

  return (
    <span className="hw-body">
      <span className="hw-top">
        <Chip name="calendar_month" />
        <span className="hw-top-copy">
          <span className="hw-title">Weekly Activity</span>
          <span className="hw-meta">Mon – Sun</span>
        </span>
        <span className="hw-top-badge">
          {show ? `${fmtInt(week?.totals?.sessions ?? 0)}` : '•••'}
          <em>sessions</em>
        </span>
      </span>

      <span className="hw-hero-block">
        <Label>ACTIVE MINUTES</Label>
        <span className="hw-hero">
          {show ? fmtInt(total) : '•••'}
          <span className="hw-unit">min</span>
        </span>
      </span>

      {values.some((v) => v > 0) ? (
        <Bars values={values} labels={WEEKDAY} todayIndex={days.findIndex((d) => d.isToday)} />
      ) : (
        <p className="hw-hint">No workouts logged this week yet.</p>
      )}

      {size === 'large' && config.showSecondary ? (
        <span className="hw-mini-row">
          <span className="hw-mini">
            <Label>KCAL LOGGED</Label>
            <strong>{show ? fmtInt(week?.totals?.kcal ?? 0) : '•••'}</strong>
          </span>
          <span className="hw-mini">
            <Label>STEPS</Label>
            <strong>{show ? fmtInt(week?.totals?.steps ?? 0) : '•••'}</strong>
          </span>
        </span>
      ) : null}
    </span>
  );
}

function GoalBody({ data, show }) {
  const goal = data.goal;
  if (!goal) {
    return (
      <span className="hw-body hw-body--empty">
        <Chip name="flag" />
        <Label>GOAL PROGRESS</Label>
        <p className="hw-empty">No goal set yet</p>
        <p className="hw-hint">Set a target in your Profile to track progress here.</p>
      </span>
    );
  }
  if (goal.progressPct === null) {
    return (
      <span className="hw-body hw-body--empty">
        <Chip name="flag" />
        <Label>GOAL PROGRESS</Label>
        <p className="hw-empty">Not enough data yet</p>
        <p className="hw-hint">Log your weight to start tracking this goal.</p>
      </span>
    );
  }

  const pct = clampPct(goal.progressPct);
  const current = weight(goal.currentWeightKg, data.units);
  const target = weight(goal.targetWeightKg, data.units);

  return (
    <span className="hw-body">
      <span className="hw-top">
        <Chip name="flag" />
        <span className="hw-top-copy">
          <span className="hw-title">Goal Progress</span>
          <span className="hw-meta">{goalTypeLabel(goal.goalType) || 'Active goal'}</span>
        </span>
      </span>

      <span className="hw-hero-block">
        <Label>PROGRESS</Label>
        <span className="hw-hero">
          {show ? `${Math.round(pct)}%` : '•••'}
          <span className="hw-unit">to target</span>
        </span>
        <Rail pct={pct} />
      </span>

      {current || target ? (
        <span className="hw-mini-row">
          <span className="hw-mini">
            <Label>NOW</Label>
            <strong>{show ? current || '—' : '•••'}</strong>
          </span>
          <span className="hw-mini">
            <Label>TARGET</Label>
            <strong>{show ? target || '—' : '•••'}</strong>
          </span>
        </span>
      ) : null}
    </span>
  );
}

function StepsBody({ data, size, show }) {
  const steps = data.stats.steps;
  const goal = data.stepGoal;
  const pct = goal ? (steps / goal) * 100 : 0;
  const current = Number(data.streak?.current) || 0;
  const days = data.week?.days || [];
  const values = days.map((d) => d.steps);

  return (
    <span className={`hw-body${size === 'small' ? ' hw-body--steps' : ''}`}>
      <Label>TOTAL STEPS</Label>
      <span className="hw-hero">
        {show ? fmtInt(steps) : '•••'}
        <span className="hw-unit">logged</span>
      </span>

      {size === 'medium' && values.some((v) => v > 0) ? (
        <Bars values={values} todayIndex={days.findIndex((d) => d.isToday)} />
      ) : (
        <Rail pct={pct} />
      )}

      <span className="hw-steps-foot">
        <span className="hw-mini">
          <Label>OF GOAL</Label>
          <strong>{show ? `${clampPct(pct)}%` : '•••'}</strong>
        </span>
        <span className="hw-mini">
          <Label>STREAK</Label>
          <strong>{show ? `${current}d` : '•••'}</strong>
        </span>
      </span>
    </span>
  );
}

/* ── Empty / error frames ────────────────────────────────────────────── */

function StateFrame({ tone, icon, title, message, onRetry }) {
  return (
    <span className={`hw-body hw-body--center hw-state hw-state--${tone}`}>
      <Chip name={icon} />
      <Label>{title}</Label>
      <p className="hw-empty">{message}</p>
      {onRetry ? (
        <button type="button" className="hw-retry" onClick={onRetry}>
          <Icon name="refresh" />
          Retry
        </button>
      ) : null}
    </span>
  );
}

/* ── Root ────────────────────────────────────────────────────────────── */

export default function WidgetPreview({ widget, config, data, status, error, onRetry }) {
  const { isLight } = useTheme();
  const skin = config.skin === 'system' ? (isLight ? 'light' : 'dark') : config.skin;
  const size = SIZES[config.size] || SIZES.medium;
  const show = !config.hideValues;

  const loading = status === 'loading';
  const isIdle = status === 'idle';

  let body = null;
  if (isIdle) {
    body = (
      <StateFrame
        tone="muted"
        icon="lock"
        title="PREVIEW"
        message="Sign in to preview your own data."
      />
    );
  } else if (status === 'error' || status === 'auth') {
    body = (
      <StateFrame
        tone={status === 'auth' ? 'muted' : 'error'}
        icon={status === 'auth' ? 'lock' : 'cloud_off'}
        title="PREVIEW"
        message={error || 'Could not load your fitness data.'}
        onRetry={status === 'auth' ? undefined : onRetry}
      />
    );
  } else if (loading || !data) {
    body = (
      <span className="hw-body hw-skel" aria-hidden="true">
        <span className="hw-skel-line hw-skel-line--sm" />
        <span className="hw-skel-line hw-skel-line--lg" />
        <span className="hw-skel-line hw-skel-line--md" />
      </span>
    );
  } else {
    switch (widget.id) {
      case 'today':
        body = <TodayBody data={data} config={config} size={config.size} show={show} />;
        break;
      case 'streak':
        body = <StreakBody data={data} size={config.size} show={show} />;
        break;
      case 'nutrition':
        body = <NutritionBody data={data} config={config} size={config.size} show={show} />;
        break;
      case 'week':
        body = <WeekBody data={data} config={config} size={config.size} show={show} />;
        break;
      case 'goal':
        body = <GoalBody data={data} show={show} />;
        break;
      case 'steps':
        body = <StepsBody data={data} size={config.size} show={show} />;
        break;
      default:
        body = null;
    }
  }

  return (
    <div
      className={`hw-art hw-art--${config.size} hw-skin--${skin}`}
      style={{ '--hw-aspect': size.aspect }}
      role="group"
      aria-label={`${widget.name} widget preview (${size.cells})`}
    >
      {body}
    </div>
  );
}
