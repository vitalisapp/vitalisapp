// Display-only sleep scoring (0-100). Training readiness source of truth is
// backend utils/readiness.js — this must stay visual, never drive advice.
export const calculateSleepScore = (hours, quality) => {
  const h = Number(hours);
  const q = Number(quality);
  if (!Number.isFinite(h) || !Number.isFinite(q) || h < 0 || h > 24 || q < 0 || q > 10) return 0;
  let durationScore;
  if (h >= 7 && h <= 9) durationScore = 100;
  else if (h > 9 && h <= 10) durationScore = 80;
  else if (h > 10) durationScore = 55; // oversleep penalized — matches 'Low' label below
  else durationScore = Math.max(0, (h / 7) * 100);
  return Math.round(durationScore * 0.6 + Math.min(10, Math.max(0, q)) * 10 * 0.4);
};

export const getSleepStatusReal = (hours, quality) => {
  const score = calculateSleepScore(hours, quality);
  if (score >= 85) return { label: 'Ready to train 💪', color: 'text-(--accent)',  border: 'border-(--accent-border)',  bg: 'bg-(--accent-bg)',  level: 'Optimal', score };
  if (score >= 60) return { label: 'Light workout 😐',  color: 'text-orange-400', border: 'border-orange-400/40', bg: 'bg-orange-400/10', level: 'Fair',    score };
  if (hours > 10)  return { label: 'Oversleep recovery 😪', color: 'text-blue-400', border: 'border-blue-400/40', bg: 'bg-blue-400/10', level: 'High', score };
  return                   { label: 'Rest recommended 😴', color: 'text-red-400',   border: 'border-red-400/40',  bg: 'bg-red-400/10',   level: 'Low',     score };
};

// Scatter point color for a sleep record. Accent is injected (resolved from
// the live theme by the caller) so this stays pure and testable.
export const getPointColor = (hours, quality, accent = '#57B26A') => {
  const score = calculateSleepScore(hours, quality);
  if (score >= 85) return accent;
  if (score >= 60) return '#fb923c';
  return '#f87171';
};
