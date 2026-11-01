// Pure geo helpers for the Activity Map — no React, no DOM, no Leaflet.
// Kept dependency-free so the recording logic is unit-testable and reusable.

export const EARTH_RADIUS_M = 6371000;

// Haversine distance in metres between two [lat, lng] points.
export const haversineMeters = ([lat1, lon1], [lat2, lon2]) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Default recording gates, tuned for phone GPS while running:
//  · maxAccuracyM — exclude coarse fixes that can dwarf a walking step.
//  · minMoveM      — minimum displacement before extending the route.
//  · maxSpeedMps   — reject implausible walking / jogging jumps.
export const DEFAULT_GATES = {
  maxAccuracyM: 25,
  minMoveM: 3,
  maxSpeedMps: 8,
  accuracyMoveFactor: 0.5,
};

// Decide whether a fresh fix should extend the recorded route.
// `prev` = { lat, lng, t } | null · `fix` = { lat, lng, accuracy } · nowMs.
// Returns { accept, reason } with reason ∈ ok | accuracy | duplicate | jump | invalid.
export const evaluateFix = (prev, fix, nowMs, gates = DEFAULT_GATES) => {
  if (!fix || !Number.isFinite(fix.lat) || !Number.isFinite(fix.lng) ||
      Math.abs(fix.lat) > 90 || Math.abs(fix.lng) > 180 || !Number.isFinite(nowMs)) {
    return { accept: false, reason: 'invalid' };
  }

  const acc = Number.isFinite(fix.accuracy) ? fix.accuracy : null;
  if (acc == null || acc < 0 || acc > gates.maxAccuracyM) {
    return { accept: false, reason: 'accuracy' };
  }

  if (prev && Number.isFinite(prev.lat) && Number.isFinite(prev.lng)) {
    const dist = haversineMeters([prev.lat, prev.lng], [fix.lat, fix.lng]);
    if (!Number.isFinite(prev.t) || nowMs <= prev.t) return { accept: false, reason: 'invalid' };
    const minMove = Math.max(gates.minMoveM,
      Math.max(acc, prev.accuracy ?? acc) * (gates.accuracyMoveFactor ?? 0));
    if (dist < minMove) return { accept: false, reason: 'duplicate' };
    const dt = (nowMs - prev.t) / 1000;
    if (dist / dt > gates.maxSpeedMps) return { accept: false, reason: 'jump' };
  }

  return { accept: true, reason: 'ok' };
};

// mm:ss / m:ss pace string from minutes-per-km. Returns '–' when unknown.
export const formatPace = (seconds, distanceKm) => {
  const d = Number(distanceKm);
  const t = Number(seconds);
  if (!(d > 0.001) || !Number.isFinite(t) || t <= 0) return '–';
  const perKm = t / d;
  const m = Math.floor(perKm / 60);
  const s = Math.floor(perKm % 60);
  return `${m}'${s.toString().padStart(2, '0')}"`;
};
