// Home-screen widget catalog — presentation metadata only.
// Every widget here is backed by an endpoint that already exists in VITALIS.
// Nothing in this file invents a metric: if the data is absent the widget
// renders an empty state instead of a number.

export const SKINS = [
  { id: 'dark', label: 'Dark', hint: 'Charcoal surface' },
  { id: 'light', label: 'Light', hint: 'Paper surface' },
  { id: 'highlight', label: 'Lime', hint: 'High-contrast accent' },
  { id: 'system', label: 'System', hint: 'Follows your app theme' },
];

export const SIZES = {
  small: { id: 'small', label: 'Small', cells: '2×2', aspect: '1 / 1' },
  medium: { id: 'medium', label: 'Medium', cells: '4×2', aspect: '2 / 1' },
  large: { id: 'large', label: 'Large', cells: '4×4', aspect: '1 / 1' },
};

export const METRIC_OPTIONS = [
  { id: 'steps', label: 'Steps' },
  { id: 'calories', label: 'Calories' },
  { id: 'minutes', label: 'Active minutes' },
];

export const WIDGETS = [
  {
    id: 'today',
    name: "Today's Activity",
    icon: 'bolt',
    description: 'Steps logged against your daily goal, with calories and active minutes.',
    sizes: ['medium', 'large'],
    defaultSize: 'medium',
    defaultSkin: 'dark',
    metrics: METRIC_OPTIONS,
    // Windows 11 Widgets Board tag (manifest `widgets[].tag` in vite.config.js).
    // Only widgets with a tag have a Windows version (Phase 0: this one).
    windowsTag: 'vitalis-today',
  },
  {
    id: 'streak',
    name: 'Workout Streak',
    icon: 'local_fire_department',
    description: 'Your current streak with a week of workout and meal check-ins.',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSkin: 'highlight',
  },
  {
    id: 'nutrition',
    name: 'Nutrition Today',
    icon: 'restaurant',
    description: "Today's calories and macros against the targets in your active goal.",
    sizes: ['medium', 'large'],
    defaultSize: 'medium',
    defaultSkin: 'dark',
  },
  {
    id: 'week',
    name: 'Weekly Activity',
    icon: 'calendar_month',
    description: 'Active minutes for each day of the current week, with weekly totals.',
    sizes: ['medium', 'large'],
    defaultSize: 'medium',
    defaultSkin: 'dark',
  },
  {
    id: 'goal',
    name: 'Goal Progress',
    icon: 'flag',
    description: 'How far you are from your target weight, based on your active goal.',
    sizes: ['medium'],
    defaultSize: 'medium',
    defaultSkin: 'dark',
  },
  {
    id: 'steps',
    name: 'Total Steps',
    icon: 'directions_walk',
    description: 'A light, glanceable step count with your streak underneath.',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    defaultSkin: 'light',
    metrics: METRIC_OPTIONS,
  },
];

export const DEFAULT_CONFIG = Object.freeze({
  size: 'medium',
  skin: 'dark',
  metric: 'steps',
  showSecondary: true,
  hideValues: false,
});

export function getWidget(id) {
  return WIDGETS.find((w) => w.id === id) || null;
}

/** Coerce stored config onto a widget's supported options. */
export function normalizeConfig(widget, raw) {
  const base = {
    ...DEFAULT_CONFIG,
    size: widget?.defaultSize || DEFAULT_CONFIG.size,
    skin: widget?.defaultSkin || DEFAULT_CONFIG.skin,
    metric: widget?.metrics?.[0]?.id || DEFAULT_CONFIG.metric,
  };
  if (!raw || typeof raw !== 'object') return base;

  const size = widget?.sizes?.includes(raw.size) ? raw.size : base.size;
  const skin = SKINS.some((s) => s.id === raw.skin) ? raw.skin : base.skin;
  const metric = widget?.metrics?.some((m) => m.id === raw.metric) ? raw.metric : base.metric;

  return {
    ...base,
    size,
    skin,
    metric,
    showSecondary: raw.showSecondary !== false,
    hideValues: raw.hideValues === true,
  };
}

/** All widgets with their saved/default config. */
export function buildConfigMap(stored) {
  return WIDGETS.reduce((acc, widget) => {
    acc[widget.id] = normalizeConfig(widget, stored?.[widget.id]);
    return acc;
  }, {});
}
