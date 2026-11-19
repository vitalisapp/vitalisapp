// Frontend-only presentation mapper for notifications.
// Derives icon / tone / title / time labels from the fields the API already
// returns ({ id, message, type, category, is_read, created_at }). Pure logic —
// no React, no DOM — so it is unit-testable with node --test.

export const NOTIFICATION_CATEGORIES = ['TRAINING', 'NUTRITION', 'RECOVERY', 'GOAL', 'SOCIAL', 'SYSTEM'];

const CATEGORY_META = {
  TRAINING:  { label: 'Training',  icon: 'fitness_center', tone: 'accent' },
  NUTRITION: { label: 'Nutrition', icon: 'restaurant',     tone: 'success' },
  RECOVERY:  { label: 'Recovery',  icon: 'bedtime',        tone: 'info' },
  GOAL:      { label: 'Goals',     icon: 'flag',           tone: 'warning' },
  SOCIAL:    { label: 'Social',    icon: 'group',          tone: 'info' },
  SYSTEM:    { label: 'System',    icon: 'campaign',       tone: 'neutral' },
};

// Theme tokens only — no new colors. Every token exists in both themes.
const TONES = {
  accent:  { fg: 'var(--accent)',         bg: 'var(--accent-bg)' },
  success: { fg: 'var(--success)',        bg: 'var(--success-bg)' },
  info:    { fg: 'var(--info)',           bg: 'var(--info-bg)' },
  warning: { fg: 'var(--warning)',        bg: 'var(--warning-bg)' },
  error:   { fg: 'var(--error)',          bg: 'var(--error-bg)' },
  neutral: { fg: 'var(--text-secondary)', bg: 'var(--bg-tertiary)' },
};

/** Normalized category (pre-category rows and unknown values fall back to SYSTEM). */
export function getCategory(n) {
  const c = String(n?.category || '').toUpperCase();
  return CATEGORY_META[c] ? c : 'SYSTEM';
}

export function getCategoryLabel(category) {
  return (CATEGORY_META[category] || CATEGORY_META.SYSTEM).label;
}

export function getCategoryIcon(category) {
  return (CATEGORY_META[category] || CATEGORY_META.SYSTEM).icon;
}

/**
 * Visual treatment for one notification.
 * Category picks the icon; a warning/error type overrides icon + tone so
 * problems stand out, a success type tints the category icon green.
 */
export function getNotificationMeta(n) {
  const category = getCategory(n);
  const base = CATEGORY_META[category];
  const type = String(n?.type || 'info').toLowerCase();
  let icon = base.icon;
  let tone = base.tone;
  if (type === 'error') { icon = 'error'; tone = 'error'; }
  else if (type === 'warning') { icon = 'warning'; tone = 'warning'; }
  else if (type === 'success') { tone = 'success'; }
  return { category, label: base.label, icon, tone: TONES[tone], type };
}

/**
 * Split "Run Analysis: you ran 5km…" into a title + body for display.
 * Only a short leading "Label:" prefix is treated as a title; otherwise the
 * category label is the title and the full message is the body. The message
 * text itself is never altered beyond that split.
 */
export function splitTitle(message, fallbackTitle) {
  const text = String(message ?? '').trim();
  const m = /^([^:.!?\n]{2,36}):\s+(\S[\s\S]*)$/.exec(text);
  if (m && !/https?$/i.test(m[1])) return { title: m[1].trim(), body: m[2].trim() };
  return { title: fallbackTitle, body: text };
}

/** Parse API timestamps (ISO or MySQL "YYYY-MM-DD HH:MM:SS"). Returns null if invalid. */
export function parseDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d/.test(value) ? value.replace(' ', 'T') : value;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Whole local calendar days between date and now (0 = today). DST-safe via rounding. */
export function dayDiff(date, now = new Date()) {
  return Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
}

/** "Just now", "5m ago", "3h ago", "Yesterday", "3d ago", or a short date. */
export function formatRelativeTime(value, now = new Date()) {
  const d = parseDate(value);
  if (!d) return '';
  const secs = Math.round((now.getTime() - d.getTime()) / 1000);
  if (secs < 45) return 'Just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const days = dayDiff(d, now);
  if (days === 0) return `${Math.round(mins / 60)}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, sameYear
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Full local timestamp for tooltips / screen readers. */
export function formatFullTime(value) {
  const d = parseDate(value);
  return d ? d.toLocaleString() : '';
}

const GROUPS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'Earlier this week' },
  { key: 'older', label: 'Older' },
];

/**
 * Bucket notifications into Today / Yesterday / Earlier this week / Older,
 * preserving the incoming order inside each bucket. Missing or invalid
 * timestamps land in Older. Empty buckets are omitted.
 */
export function groupByDay(items, now = new Date()) {
  const buckets = { today: [], yesterday: [], week: [], older: [] };
  for (const n of items || []) {
    const d = parseDate(n?.created_at);
    const diff = d ? dayDiff(d, now) : Infinity;
    if (diff <= 0) buckets.today.push(n);
    else if (diff === 1) buckets.yesterday.push(n);
    else if (diff < 7) buckets.week.push(n);
    else buckets.older.push(n);
  }
  return GROUPS.filter((g) => buckets[g.key].length).map((g) => ({ ...g, items: buckets[g.key] }));
}
