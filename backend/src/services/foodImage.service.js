// Section 6 — food photos for the catalog from the Pexels API (free key:
// https://www.pexels.com/api/). Each food is looked up ONCE; the result (or
// "no match") is cached in food_catalog so normal use makes almost no API
// calls. Without PEXELS_API_KEY everything still works: the UI shows a
// category icon instead.
//   PEXELS_API_KEY=...        (backend/.env)
const db = require('../config/db');

const API = 'https://api.pexels.com/v1/search';
const RETRY_EMPTY_DAYS = 30;
const HOURLY_BUDGET = 150; // Pexels allows 200 requests / hour
const TIMEOUT_MS = 6000;

let windowStart = Date.now();
let used = 0;
const inflight = new Set();

function configured() {
  return Boolean(process.env.PEXELS_API_KEY && process.env.PEXELS_API_KEY.trim());
}

function takeBudget() {
  if (Date.now() - windowStart > 60 * 60 * 1000) { windowStart = Date.now(); used = 0; }
  if (used >= HOURLY_BUDGET) return false;
  used += 1;
  return true;
}

/** "Chicken breast, grilled" → "grilled chicken breast food". */
function searchQuery(row) {
  const name = String(row.name || '').replace(/\(.*?\)/g, ' ');
  const [base, detail] = name.split(',').map((s) => s.trim());
  const words = [detail, base].filter(Boolean).join(' ');
  const filipino = row.filipino || /adobo|sinigang|silog|pancit|lumpia|bangus|lechon|sisig|tinola|kare|caldereta|menudo|halo|taho|turon|puto|biko|bibingka|ensaymada|pandesal|siopao|siomai|kwek|chicharon|lugaw|goto|arroz caldo|champorado|monggo|pinakbet|laing|dinuguan|inasal|liempo|tuyo|paksiw|buko|calamansi|gulaman|kangkong|ampalaya|talong|mechado|afritada|bicol|kutsinta|leche flan|kamote|banana cue/i.test(name);
  return `${words}${filipino ? ' filipino' : ''} food`.replace(/\s+/g, ' ').trim();
}

async function fetchPhoto(query) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const url = `${API}?query=${encodeURIComponent(query)}&per_page=1&orientation=square&size=small`;
    const res = await fetch(url, { headers: { Authorization: process.env.PEXELS_API_KEY.trim() }, signal: ctrl.signal });
    if (res.status === 429) { used = HOURLY_BUDGET; return undefined; } // rate-limited: try later
    if (!res.ok) return undefined;
    const data = await res.json();
    const p = data?.photos?.[0];
    if (!p) return null; // no match: cache the miss
    return {
      url: p.src?.medium || p.src?.small || null,
      credit: String(p.photographer || 'Pexels').slice(0, 100),
      link: String(p.url || 'https://www.pexels.com').slice(0, 500),
    };
  } catch {
    return undefined;
  } finally {
    clearTimeout(t);
  }
}

/** Look up + cache a photo for one catalog row. Returns the image or null. */
async function fillOne(row) {
  if (!configured() || !row?.name || inflight.has(row.name)) return null;
  if (!takeBudget()) return null;
  inflight.add(row.name);
  try {
    const photo = await fetchPhoto(searchQuery(row));
    if (photo === undefined) return null; // transient: don't cache
    await db.execute(
      'UPDATE food_catalog SET image_url = ?, image_credit = ?, image_link = ?, image_checked_at = NOW() WHERE name = ?',
      [photo?.url || null, photo?.credit || null, photo?.link || null, row.name]
    );
    return photo;
  } catch {
    return null;
  } finally {
    inflight.delete(row.name);
  }
}

/** Does this row still need a lookup? */
function needsImage(row) {
  if (row.image_url) return false;
  if (!row.image_checked_at) return true;
  const age = Date.now() - new Date(row.image_checked_at).getTime();
  return age > RETRY_EMPTY_DAYS * 24 * 60 * 60 * 1000;
}

/** Background fill for search results (never blocks the response). */
function fillInBackground(rows, max = 6) {
  if (!configured()) return;
  const todo = rows.filter(needsImage).slice(0, max);
  if (!todo.length) return;
  setImmediate(async () => {
    for (const row of todo) await fillOne(row);
  });
}

/** Fill every catalog food missing a photo (npm run foods:images). */
async function fillAll({ limit = HOURLY_BUDGET, log = () => {} } = {}) {
  if (!configured()) throw new Error('PEXELS_API_KEY is not set in backend/.env');
  const [rows] = await db.query('SELECT name, image_url, image_checked_at FROM food_catalog ORDER BY id');
  const todo = rows.filter(needsImage).slice(0, limit);
  let found = 0;
  for (const row of todo) {
    const p = await fillOne(row);
    if (p?.url) found += 1;
    log(`${p?.url ? 'ok  ' : 'miss'} ${row.name}`);
    await new Promise((r) => setTimeout(r, 300));
  }
  return { checked: todo.length, found, remaining: rows.filter(needsImage).length - todo.length };
}

module.exports = { configured, searchQuery, needsImage, fillInBackground, fillAll };
