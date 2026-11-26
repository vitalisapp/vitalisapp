import { useState, useEffect, useRef, useCallback } from 'react';
import { createGpsTrack } from '../utils/geo.js';
import { GPS_DIAGNOSTICS_ENABLED, recordGpsFix } from '../utils/gpsDiagnostics.js';

// Neutral placeholder centre shown before a real fix arrives. It is never
// presented as the user's position — no marker is placed here, and the camera
// flies to the real GPS fix as soon as one is available.
export const DEFAULT_MAP_CENTER = [20, 0];

// Filtering / smoothing live in utils/geo.js (createGpsTrack → evaluateFix),
// pure and unit-tested.

// GeolocationPositionError.code: 1 denied, 2 unavailable, 3 timeout.
const statusFromError = (err) => {
  if (!err) return 'unavailable';
  if (err.code === 1) return 'denied';
  if (err.code === 3) return 'timeout';
  return 'unavailable';
};

// Max age of a fix that may extend the route (seconds-old cached fixes would
// add a stale point).
const ROUTE_FIX_MAX_AGE_MS = 10000;

// One watchPosition feeds everything:
//  · live dot   — the Kalman-smoothed position of every valid fix, with the
//    device-reported accuracy (refines as GPS warms up, no jitter);
//  · route      — only while recording: smoothed fix → device-speed
//    stationary gate → unchanged evaluateFix gates (see createGpsTrack);
//  · routeBreaks — [{ index, kind: 'pause' | 'gap' }]: index of the first
//    point of a new segment, so the map never draws a fake straight line
//    across a pause or a signal loss. `path` itself stays the same flat
//    [lat, lng][] (timer, save payload and DB format unchanged).
// `watchWhenIdle` lets the page stop the watcher when the live map isn't
// shown (battery); it always runs while recording.
export const useGeolocation = (isRecording, { watchWhenIdle = true } = {}) => {
  const supported =
    typeof navigator !== 'undefined' && !!navigator.geolocation;

  const [userLocation, setUserLocation]       = useState(null);
  const [startCoords, setStartCoords]         = useState(DEFAULT_MAP_CENTER);
  const [locationStatus, setLocationStatus]   = useState(supported ? 'pending' : 'denied');
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationError, setLocationError]     = useState(null);
  const [mapCenter, setMapCenter]             = useState(DEFAULT_MAP_CENTER);
  const [path, updatePath]                    = useState([]);
  const [routeBreaks, setRouteBreaks]         = useState([]);
  // Bumped by retry() to restart the watcher.
  const [watchKey, setWatchKey]               = useState(0);

  const trackRef = useRef(null);
  if (trackRef.current === null) trackRef.current = createGpsTrack();
  const hasFixRef = useRef(false);
  const isRecordingRef = useRef(false);
  // Fixes taken before (re)starting a recording never enter the route.
  const recordingStartedAtRef = useRef(0);
  const pathLenRef = useRef(0);
  const pendingBreakRef = useRef(null);

  const setPath = useCallback((points) => {
    trackRef.current.resetRoute();
    pathLenRef.current = points.length;
    pendingBreakRef.current = null;
    updatePath(points);
    setRouteBreaks([]);
  }, []);

  // Recording transitions are read by the watcher through refs, so starting /
  // pausing a run never tears down and re-creates the GPS subscription.
  // A resume (recording again with points already recorded) starts a new
  // route segment at the next accepted point.
  useEffect(() => {
    if (isRecording && !isRecordingRef.current) {
      recordingStartedAtRef.current = Date.now();
      if (pathLenRef.current > 0) pendingBreakRef.current = 'pause';
    }
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Explicit retry (event handler → synchronous state updates are fine here).
  const retryLocation = useCallback(() => {
    if (!supported) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('pending');
    setLocationError(null);
    setWatchKey((k) => k + 1);
  }, [supported]);

  // ── The single GPS subscription ────────────────────────────────────────────
  const shouldWatch = supported && (isRecording || watchWhenIdle);

  useEffect(() => {
    if (!shouldWatch) return undefined;

    let active = true;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!active) return;
        const { latitude, longitude, accuracy, speed } = pos.coords || {};
        const t = Number.isFinite(pos.timestamp) ? pos.timestamp : Date.now();
        const obs = trackRef.current.observe({ lat: latitude, lng: longitude, accuracy, speed }, t);
        if (!obs) return;

        // Live dot: smoothed position + the device's own uncertainty.
        const display = [obs.lat, obs.lng];
        setUserLocation(display);
        setLocationAccuracy(obs.accuracy);
        setLocationError(null);
        setLocationStatus('granted');
        if (!hasFixRef.current) {
          hasFixRef.current = true;
          setStartCoords(display);
          setMapCenter(display);
        }

        // Route: recording only, same freshness gate as before.
        let verdict = null;
        if (isRecordingRef.current) {
          const fresh = Number.isFinite(pos.timestamp) &&
            pos.timestamp >= recordingStartedAtRef.current &&
            Date.now() - pos.timestamp <= ROUTE_FIX_MAX_AGE_MS;
          verdict = fresh ? trackRef.current.evaluate(obs) : { accept: false, reason: 'stale' };
          if (verdict.accept) {
            const kind = pendingBreakRef.current || (verdict.gap ? 'gap' : null);
            const index = pathLenRef.current;
            if (kind && index > 0) setRouteBreaks((b) => [...b, { index, kind }]);
            pendingBreakRef.current = null;
            pathLenRef.current = index + 1;
            updatePath((p) => [...p, verdict.point]);
          }
        }

        if (GPS_DIAGNOSTICS_ENABLED) {
          recordGpsFix({
            t, ageMs: Date.now() - t, lat: latitude, lng: longitude, accuracy, speed,
            heading: pos.coords?.heading ?? null, smoothed: display, moving: obs.moving,
            outlier: obs.outlier, recording: isRecordingRef.current,
            verdict: verdict ? verdict.reason : null,
          });
        }
      },
      (err) => {
        if (!active) return;
        // Permission revoked is permanent; before a first fix every error is
        // shown as a status. After that, errors are usually transient (tunnel,
        // brief timeout): keep the last known status so a run never freezes.
        if (err?.code === 1 || !hasFixRef.current) setLocationStatus(statusFromError(err));
        setLocationError(err?.message || (hasFixRef.current ? 'Location signal lost' : 'Location unavailable'));
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );

    return () => {
      active = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [shouldWatch, watchKey]);

  return {
    userLocation,
    setUserLocation,
    startCoords,
    locationStatus,
    locationAccuracy,
    locationError,
    mapCenter,
    path,
    setPath,
    routeBreaks,
    retry: retryLocation,
  };
};
