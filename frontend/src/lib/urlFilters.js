// Pure helpers for URL-backed filters (?equipment=pull-up-bar&muscle=lower-back).
// Enum filters are written to the URL as slugs and resolved back to the
// canonical option on read, so links stay readable and unknown values from
// old or hand-edited URLs are ignored instead of breaking the page.

/** "Pull-up Bar" -> "pull-up-bar", "weight_reps" -> "weight-reps". */
export function toSlug(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Resolve a URL slug (or raw label) to its canonical option, or '' if unknown. */
export function fromSlug(raw, options = []) {
  const slug = toSlug(raw);
  if (!slug) return '';
  return options.find((opt) => toSlug(opt) === slug) ?? '';
}

/**
 * Read filter values from URLSearchParams.
 * config: { [param]: { options?: string[] } } — options => enum (slug), none => free text.
 */
export function readFilters(params, config) {
  const values = {};
  for (const [key, def] of Object.entries(config)) {
    const raw = params.get(key) ?? '';
    values[key] = def?.options ? fromSlug(raw, def.options) : raw;
  }
  return values;
}

/** Return new URLSearchParams with `patch` applied; empty values delete the key. */
export function writeFilters(params, config, patch) {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(patch)) {
    const def = config[key];
    const out = def?.options ? toSlug(fromSlug(value, def.options)) : String(value ?? '');
    if (out.trim()) next.set(key, out);
    else next.delete(key);
  }
  return next;
}
