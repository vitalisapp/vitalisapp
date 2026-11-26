// MapLibre rendering boundary for the Activity Map — pure, no React, no DOM.
//
// Every Vitalis GPS point (live path, finished run, saved route, offline
// queue, DB) is stored as Leaflet-style [lat, lng]. MapLibre / GeoJSON use
// [lng, lat]. This module is the ONLY place that flips the order: nothing
// upstream changes, and inputs are never mutated.

// ─── Map styles (OpenFreeMap: keyless, no account, no paid tier) ────────────
// Attribution (OpenFreeMap / OpenMapTiles / OpenStreetMap) ships in the
// style's TileJSON and is rendered by MapLibre's AttributionControl.
export const MAP_STYLE_URLS = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

export const mapStyleUrl = (isDark) => (isDark ? MAP_STYLE_URLS.dark : MAP_STYLE_URLS.light);

// Prefix for every source / layer Vitalis adds on top of the base style, so a
// theme swap can carry them over and nothing collides with style layer ids.
export const VITALIS_PREFIX = 'vitalis-';

export const EMPTY_FEATURE_COLLECTION = Object.freeze({
  type: 'FeatureCollection',
  features: Object.freeze([]),
});

// ─── Route styling (same hierarchy + widths as the old Leaflet polylines) ───
export const ROUTE_GREEN = '#43C85F';

// Live route: soft glow → white casing → green core.
export const LIVE_ROUTE_LAYERS = [
  { id: 'glow', paint: { 'line-color': ROUTE_GREEN, 'line-width': 16, 'line-opacity': 0.16 } },
  { id: 'casing', paint: { 'line-color': '#ffffff', 'line-width': 9, 'line-opacity': 0.9 } },
  { id: 'core', paint: { 'line-color': ROUTE_GREEN, 'line-width': 5, 'line-opacity': 1 } },
];

// Post-run replay: faint full-route ghost, then the progressively drawn line.
export const REPLAY_GHOST_LAYERS = [
  { id: 'line', paint: { 'line-color': ROUTE_GREEN, 'line-width': 8, 'line-opacity': 0.18 } },
];
export const REPLAY_DRAWN_LAYERS = [
  { id: 'line', paint: { 'line-color': ROUTE_GREEN, 'line-width': 5, 'line-opacity': 1 } },
];

// ─── Coordinate conversion ─────────────────────────────────────────────────

const latLngOf = (p) => {
  if (Array.isArray(p)) return [Number(p[0]), Number(p[1])];
  if (p && typeof p === 'object') {
    return [Number(p.lat ?? p.latitude), Number(p.lng ?? p.lon ?? p.longitude)];
  }
  return [NaN, NaN];
};

export const isValidLatLng = (p) => {
  if (p == null) return false;
  const [lat, lng] = latLngOf(p);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
};

// [lat, lng] (or { lat, lng }) → [lng, lat]; null when invalid.
export const toLngLat = (p) => {
  if (!isValidLatLng(p)) return null;
  const [lat, lng] = latLngOf(p);
  return [lng, lat];
};

// Valid [lng, lat] positions of a path, invalid points dropped.
export const pathToLngLats = (path) => {
  if (!Array.isArray(path)) return [];
  const out = [];
  for (const p of path) {
    const c = toLngLat(p);
    if (c) out.push(c);
  }
  return out;
};

// GeoJSON for a route. A LineString needs ≥ 2 positions, so shorter / empty
// paths return an empty FeatureCollection (never invalid GeoJSON).
export const pathToLineFeatureCollection = (path) => {
  const coordinates = pathToLngLats(path);
  if (coordinates.length < 2) return EMPTY_FEATURE_COLLECTION;
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }],
  };
};

// GeoJSON for a route split at break indexes ({ index, kind }). Each break
// index is the first point of a NEW segment (a pause / GPS gap), so no line
// is ever drawn across the break — the fake straight connecting line is gone.
// Breaks outside the path or duplicated are ignored; segments shorter than a
// LineString render nothing; no breaks → identical to pathToLineFeatureCollection.
export const segmentedPathFeatureCollection = (path, breaks) => {
  const pts = Array.isArray(path) ? path : [];
  if (!Array.isArray(breaks) || breaks.length === 0) return pathToLineFeatureCollection(path);
  const cuts = breaks
    .map((b) => Number(b?.index))
    .filter((i) => Number.isInteger(i) && i > 0 && i < pts.length)
    .sort((a, b) => a - b)
    .filter((i, k, arr) => k === 0 || i !== arr[k - 1]);
  if (cuts.length === 0) return pathToLineFeatureCollection(path);
  const features = [];
  for (let s = 0; s <= cuts.length; s++) {
    const start = s === 0 ? 0 : cuts[s - 1];
    const end = s === cuts.length ? pts.length : cuts[s];
    const coordinates = pathToLngLats(pts.slice(start, end));
    if (coordinates.length >= 2) {
      features.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } });
    }
  }
  return features.length ? { type: 'FeatureCollection', features } : EMPTY_FEATURE_COLLECTION;
};

// [[west, south], [east, north]] for MapLibre fitBounds; null when empty.
export const boundsOf = (path) => {
  const pts = pathToLngLats(path);
  if (!pts.length) return null;
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const [lng, lat] of pts) {
    if (lng < w) w = lng;
    if (lng > e) e = lng;
    if (lat < s) s = lat;
    if (lat > n) n = lat;
  }
  return [[w, s], [e, n]];
};

// ─── GPS accuracy circle ───────────────────────────────────────────────────
// Ground-true circle (radius in metres) around the live position, so the
// user sees how certain the reported fix is. Capped so a very coarse
// network fix stays readable.
export const ACCURACY_MAX_RADIUS_M = 5000;
export const ACCURACY_LAYERS = [
  { id: 'fill', type: 'fill', paint: { 'fill-color': '#007AFF', 'fill-opacity': 0.12 } },
  { id: 'outline', type: 'line', paint: { 'line-color': '#007AFF', 'line-opacity': 0.4, 'line-width': 1 } },
];

const EARTH_RADIUS_M = 6371000;

export const accuracyCircleFeatureCollection = (center, radiusM, steps = 64) => {
  if (!isValidLatLng(center) || !Number.isFinite(radiusM) || radiusM <= 0) return EMPTY_FEATURE_COLLECTION;
  const [lat, lng] = latLngOf(center);
  const r = Math.min(radiusM, ACCURACY_MAX_RADIUS_M);
  // Local equirectangular offsets — exact enough for ≤ 5 km radii.
  const dLat = (r / EARTH_RADIUS_M) * (180 / Math.PI);
  const dLng = dLat / Math.max(Math.cos((lat * Math.PI) / 180), 0.01);
  const ring = [];
  for (let i = 0; i < steps; i++) {
    const t = (2 * Math.PI * i) / steps;
    ring.push([lng + dLng * Math.cos(t), lat + dLat * Math.sin(t)]);
  }
  ring.push(ring[0]);
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }],
  };
};

// ─── Theme swap ────────────────────────────────────────────────────────────
// map.setStyle(..., { transformStyle }) hook: keep the incoming base style but
// carry over every Vitalis source + layer (route data included), and drop the
// style's own camera so a theme toggle never moves the map.
export const carryOverVitalisLayers = (previous, next) => {
  const { center: _c, zoom: _z, bearing: _b, pitch: _p, ...base } = next;
  if (!previous) return base;
  const sources = { ...(base.sources || {}) };
  for (const [id, src] of Object.entries(previous.sources || {})) {
    if (id.startsWith(VITALIS_PREFIX)) sources[id] = src;
  }
  const carried = (previous.layers || []).filter((l) => l.id.startsWith(VITALIS_PREFIX));
  const baseLayers = (base.layers || []).filter((l) => !l.id.startsWith(VITALIS_PREFIX));
  return { ...base, sources, layers: [...baseLayers, ...carried] };
};
