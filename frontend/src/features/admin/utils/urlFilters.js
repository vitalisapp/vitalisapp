import { readFilters, writeFilters } from '../../../lib/urlFilters.js';

const page = { default: '1', type: 'page' };
const windowDays = { options: ['7', '14', '30', '90'], default: '14' };
export const ADMIN_FILTERS = {
  users: { q: {}, role: { options: ['member', 'admin'] }, status: { options: ['active', 'deactivated'] }, page },
  monitoring: { q: {}, status: { options: ['green', 'yellow', 'red'] }, flag: { options: ['inactive', 'missing', 'unusual'] }, page },
  overview: {
    days: { ...windowDays, options: ['7', '14', '30'] },
    category: { options: ['members', 'training', 'nutrition', 'content'], default: 'members' },
    date: { type: 'date' },
  },
  content: { tab: { options: ['plans', 'community'], default: 'plans' }, tag: {}, plansPage: page, postsPage: page },
  aiUsage: { days: windowDays, page },
  audit: { page },
};

function normalize(value, def) {
  const text = String(value ?? '').trim();
  if (def.type === 'page') {
    const n = Number(text);
    return /^\d+$/.test(text) && Number.isSafeInteger(n) && n >= 1 && n <= 1000000 ? String(n) : '1';
  }
  if (def.type === 'date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return '';
    const date = new Date(`${text}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text ? text : '';
  }
  return text || def.default || '';
}

export function readAdminFilters(params, config) {
  const values = readFilters(params, config);
  return Object.fromEntries(Object.entries(config).map(([key, def]) => [key, normalize(values[key], def)]));
}

// Apply filter + pagination changes atomically. Preserve unrelated URL params.
export function writeAdminFilters(params, config, patch) {
  const next = writeFilters(params, config, patch);
  const values = readAdminFilters(next, config);
  for (const [key, def] of Object.entries(config)) {
    if (!values[key] || values[key] === def.default) next.delete(key);
    else next.set(key, values[key]);
  }
  return next;
}
