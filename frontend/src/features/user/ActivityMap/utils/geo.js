// Pure geo helpers for the Activity Map — no React, no DOM, no map library.
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

// Finite, in-range latitude / longitude (same bounds evaluateFix enforces).
export const isValidCoordinate = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

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

// ─── GPS quality ─────────────────────────────────────────────────────────────
// Bands for the reported horizontal accuracy (metres). Display only — route
// acceptance still uses DEFAULT_GATES.maxAccuracyM.
export const gpsQuality = (accuracyM) => {
  if (!Number.isFinite(accuracyM) || accuracyM < 0) return 'unknown';
  if (accuracyM <= 10) return 'strong';
  if (accuracyM <= 20) return 'good';
  if (accuracyM <= 50) return 'weak';
  return 'poor';
};

// ─── GPS track pipeline (smoothing + stationary gate + evaluateFix) ─────────
//
// Raw fix → Kalman (local metres) → device-speed motion gate → evaluateFix.
//
// Why: evaluateFix only compares against the last ACCEPTED point. GPS error
// wanders slowly, so while standing still or walking slowly it keeps
// crossing the 3–12 m threshold and every crossing was counted as distance
// (simulated: 60–830 m per 10 standing minutes, +2–20 % while walking).
//  · Kalman: constant-velocity model per axis in metres (never raw degrees),
//    measurement noise = reported accuracy², so coarse fixes barely move it
//    and a GPS lock snaps it into place. Lag stays within the accuracy.
//  · Motion gate: the phone's own Doppler speed (coords.speed) says when the
//    user is stopped; with hysteresis so slow walking still counts. Ignored
//    when the browser reports no speed (falls back to Kalman + evaluateFix).
//  · Outliers (innovation far beyond the uncertainty) are skipped; after a
//    few in a row the filter re-anchors (the user really is elsewhere).
//  · Long signal loss resets the filter and marks a route `gap`.
export const TRACK_DEFAULTS = {
  accelNoise: 0.5,       // m²/s³ — process noise; running-level accelerations
  initSpeedVar: 4,       // (m/s)² — initial velocity uncertainty
  resetAfterMs: 15000,   // filter re-initialises after this long without fixes
  outlierSigma: 3,       // innovation gate in standard deviations…
  outlierMinM: 30,       // …but never tighter than this
  outlierMaxRun: 3,      // consecutive outliers → re-anchor on the new position
  stopSpeedMps: 0.3,     // device speed below this → stopped
  moveSpeedMps: 0.6,     // …and back above this → moving (≈ 2.2 km/h)
  moveConfirm: 2,        // consecutive moving readings needed to leave "stopped"
  gapMs: 20000,          // no accepted point for this long → new route segment
};

const deg2rad = (d) => (d * Math.PI) / 180;

export const createGpsTrack = (options = {}) => {
  const o = { ...TRACK_DEFAULTS, ...options };
  const gates = o.gates || DEFAULT_GATES;
  let kf = null;          // { lat0, lng0, mLng, x:[p,v], y:[p,v], Px, Py, t }
  let outliers = 0;
  let moving = null;      // null = unknown (no device speed yet)
  let movingVotes = 0;
  let lastAccepted = null; // { lat, lng, accuracy, t } — anchors evaluateFix

  const toXY = (lat, lng) => [(lng - kf.lng0) * kf.mLng, (lat - kf.lat0) * (EARTH_RADIUS_M * Math.PI / 180)];
  const toLatLng = (x, y) => [kf.lat0 + y / (EARTH_RADIUS_M * Math.PI / 180), kf.lng0 + x / kf.mLng];

  const init = (lat, lng, R, t) => {
    const mLng = (EARTH_RADIUS_M * Math.PI / 180) * Math.max(Math.cos(deg2rad(lat)), 0.01);
    kf = { lat0: lat, lng0: lng, mLng, x: [0, 0], y: [0, 0], t,
      Px: [[R, 0], [0, o.initSpeedVar]], Py: [[R, 0], [0, o.initSpeedVar]] };
    outliers = 0;
  };

  // One axis: predict over dt, return { state, P, innovation, S }.
  const predict = (s, P, dt) => {
    const q = o.accelNoise;
    const xp = [s[0] + s[1] * dt, s[1]];
    const Pp = [
      [P[0][0] + dt * (P[1][0] + P[0][1]) + dt * dt * P[1][1] + q * dt ** 3 / 3, P[0][1] + dt * P[1][1] + q * dt ** 2 / 2],
      [P[1][0] + dt * P[1][1] + q * dt ** 2 / 2, P[1][1] + q * dt],
    ];
    return [xp, Pp];
  };
  const correct = (xp, Pp, z, R) => {
    const S = Pp[0][0] + R;
    const K0 = Pp[0][0] / S;
    const K1 = Pp[1][0] / S;
    const r = z - xp[0];
    return [
      [xp[0] + K0 * r, xp[1] + K1 * r],
      [[(1 - K0) * Pp[0][0], (1 - K0) * Pp[0][1]], [Pp[1][0] - K1 * Pp[0][0], Pp[1][1] - K1 * Pp[0][1]]],
    ];
  };

  // Smooth one valid fix. Returns { lat, lng, outlier }.
  const smooth = (lat, lng, acc, t) => {
    const R = Math.max(acc ?? 50, 1) ** 2;
    if (!kf || !Number.isFinite(t) || t - kf.t > o.resetAfterMs) {
      init(lat, lng, R, t);
      return { lat, lng, outlier: false };
    }
    const dt = (t - kf.t) / 1000;
    if (dt <= 0) return { lat: toLatLng(kf.x[0], kf.y[0])[0], lng: toLatLng(kf.x[0], kf.y[0])[1], outlier: false };
    const [zx, zy] = toXY(lat, lng);
    const [xp, Pxp] = predict(kf.x, kf.Px, dt);
    const [yp, Pyp] = predict(kf.y, kf.Py, dt);
    const innovation = Math.hypot(zx - xp[0], zy - yp[0]);
    const gate = Math.max(o.outlierMinM, o.outlierSigma * Math.sqrt(Math.max(Pxp[0][0], Pyp[0][0]) + R));
    if (innovation > gate) {
      outliers += 1;
      if (outliers >= o.outlierMaxRun) {
        init(lat, lng, R, t);
        return { lat, lng, outlier: false, reanchored: true };
      }
      const [cl, cg] = toLatLng(kf.x[0], kf.y[0]);
      return { lat: cl, lng: cg, outlier: true };
    }
    outliers = 0;
    [kf.x, kf.Px] = correct(xp, Pxp, zx, R);
    [kf.y, kf.Py] = correct(yp, Pyp, zy, R);
    kf.t = t;
    const [sl, sg] = toLatLng(kf.x[0], kf.y[0]);
    return { lat: sl, lng: sg, outlier: false };
  };

  const updateMotion = (speed) => {
    if (!Number.isFinite(speed) || speed < 0) return moving;
    if (moving === null) {
      moving = speed >= o.moveSpeedMps;
    } else if (moving) {
      if (speed < o.stopSpeedMps) { moving = false; movingVotes = 0; }
    } else if (speed >= o.moveSpeedMps) {
      // One noisy speed reading must not count a drift step as movement.
      movingVotes += 1;
      if (movingVotes >= o.moveConfirm) { moving = true; movingVotes = 0; }
    } else {
      movingVotes = 0;
    }
    return moving;
  };

  return {
    // Every fix (recording or not). Returns the display position or null.
    // fix = { lat, lng, accuracy, speed }, t = fix timestamp (ms).
    observe(fix, t) {
      if (!fix || !isValidCoordinate(fix.lat, fix.lng)) return null;
      const acc = Number.isFinite(fix.accuracy) && fix.accuracy >= 0 ? fix.accuracy : null;
      const s = smooth(fix.lat, fix.lng, acc, t);
      const isMoving = updateMotion(fix.speed);
      return { lat: s.lat, lng: s.lng, accuracy: acc, outlier: s.outlier, moving: isMoving, t };
    },

    // Route decision for an observed fix (call only while recording).
    // Returns { accept, reason, point?: [lat, lng], gap?: boolean }.
    evaluate(obs) {
      if (!obs) return { accept: false, reason: 'invalid' };
      if (obs.outlier) return { accept: false, reason: 'jump' };
      if (obs.moving === false) return { accept: false, reason: 'stationary' };
      const verdict = evaluateFix(lastAccepted, { lat: obs.lat, lng: obs.lng, accuracy: obs.accuracy }, obs.t, gates);
      if (!verdict.accept) return verdict;
      const gap = !!lastAccepted && obs.t - lastAccepted.t > o.gapMs;
      lastAccepted = { lat: obs.lat, lng: obs.lng, accuracy: obs.accuracy, t: obs.t };
      return { accept: true, reason: 'ok', point: [obs.lat, obs.lng], gap };
    },

    // New / discarded run: forget the route anchor (filter keeps tracking).
    resetRoute() { lastAccepted = null; },
  };
};
