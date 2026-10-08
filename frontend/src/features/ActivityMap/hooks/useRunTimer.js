import { useState, useEffect, useRef } from 'react';

// ─── Haversine distance (meters) between two [lat, lng] points ───────────────
const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const useRunTimer = (isRecording, locationStatus, path) => {
  const [metrics, setMetrics] = useState({
    time: 0,
    distance: 0,
    pace: "0'00\"",
    calories: 0,
  });
  const [splits, setSplits] = useState([]);

  const timerRef      = useRef(null);
  const splitsRef     = useRef([]);
  const lastSplitRef  = useRef(0);
  const splitStartTimeRef = useRef(0);
  const prevPathRef   = useRef(path);
  // Index into path of the first point NOT yet consumed for distance.
  // The old code only measured the single newest segment per 1s tick, so
  // every extra GPS fix between ticks was silently dropped (under-count).
  const processedIdxRef = useRef(1);
  // After (re)start the first segment is the GPS settle/teleport jump
  // (stale pre-start fix → first live fix, or pre-pause → post-pause) —
  // skip exactly one boundary segment.
  const resumeSkipRef = useRef(false);
  const wasRecordingRef = useRef(false);

  // Keep prevPathRef in sync with latest path
  useEffect(() => {
    prevPathRef.current = path;
  }, [path]);

  // Arm the one-segment boundary skip whenever recording (re)starts
  useEffect(() => {
    if (isRecording && !wasRecordingRef.current) resumeSkipRef.current = true;
    wasRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setMetrics((prev) => {
          const t = prev.time + 1;

          // ── Real GPS distance only ─────────────────────────────────────────
          // No simulated movement: when GPS is unavailable the timer keeps
          // counting but distance stays at its last real value. Recording
          // without GPS is blocked at the Start button (see ActivityMap),
          // so this branch only covers GPS dropping mid-run.
          // ALL new segments since the last tick are summed (not just the
          // newest one) — otherwise fast GPS update rates under-count.
          let d = prev.distance;
          const currentPath = prevPathRef.current;
          if (locationStatus === 'granted' && currentPath.length >= 2) {
            if (currentPath.length < processedIdxRef.current) {
              processedIdxRef.current = Math.max(1, currentPath.length);
            }
            let start = processedIdxRef.current;
            if (resumeSkipRef.current && currentPath.length > start) {
              start += 1; // skip the settle/teleport boundary segment
              resumeSkipRef.current = false;
            }
            for (let i = Math.max(1, start); i < currentPath.length; i++) {
              const deltaM = haversineDistance(currentPath[i - 1], currentPath[i]);
              // Ignore GPS jitter (< 1m or > 50m per second are noise)
              if (deltaM > 1 && deltaM < 50) {
                d += deltaM / 1000; // convert to km
              }
            }
            processedIdxRef.current = currentPath.length;
          }

          // ── Pace (min/km) ──────────────────────────────────────────────────
          const ps   = d > 0 ? t / d : 0;
          const pm   = Math.floor(ps / 60);
          const pc   = Math.floor(ps % 60);
          const pace = `${pm}'${pc.toString().padStart(2, '0')}"`;

          // ── Calories (MET ~8 for running, avg 70 kg) ──────────────────────
          const cal = Math.floor(d * 60);

          // ── Splits (per-km pace, not overall average) ──────────────────────
          const km = Math.floor(d);
          if (km > lastSplitRef.current) {
            lastSplitRef.current = km;
            const splitSecs = Math.max(1, t - splitStartTimeRef.current);
            splitStartTimeRef.current = t;
            const spm = Math.floor(splitSecs / 60);
            const spc = Math.floor(splitSecs % 60);
            const splitPace = `${spm}'${spc.toString().padStart(2, '0')}"`;
            const ns = { km: splitsRef.current.length + 1, pace: splitPace };
            splitsRef.current = [...splitsRef.current, ns];
            setSplits([...splitsRef.current]);
          }

          return { time: t, distance: d, pace, calories: cal };
        });

        // NOTE: no simulated path drift — the route only grows from real
        // geolocation watch positions (see useGeolocation).
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording, locationStatus]);

  const resetMetrics = () => {
    setMetrics({ time: 0, distance: 0, pace: "0'00\"", calories: 0 });
    setSplits([]);
    splitsRef.current    = [];
    lastSplitRef.current = 0;
    splitStartTimeRef.current = 0;
    processedIdxRef.current = 1;
    resumeSkipRef.current = true; // skip the initial GPS settle jump
  };

  return {
    metrics,
    splits,
    splitsRef,
    resetMetrics,
  };
};