import { useState, useEffect, useRef } from 'react';

const FALLBACK_COORDS = [14.6760, 121.0437];

// Fixes with worse accuracy than this are dropped — indoor/urban-canyon
// fixes (100m+) otherwise inject phantom distance into the run.
const MAX_FIX_ACCURACY_M = 25;

export const useGeolocation = (isRecording) => {
  const [userLocation, setUserLocation]     = useState(null);
  const [startCoords, setStartCoords]       = useState(FALLBACK_COORDS);
  const [locationStatus, setLocationStatus] = useState(() => (
    typeof navigator !== 'undefined' && navigator.geolocation ? 'pending' : 'denied'
  ));
  const [mapCenter, setMapCenter]           = useState(FALLBACK_COORDS);
  const [path, setPath]                     = useState([FALLBACK_COORDS]);

  const watchIdRef = useRef(null);

  // Get initial position on mount
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(c);
        setStartCoords(c);
        setMapCenter(c);
        setPath([c]);
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Watch position while recording
  useEffect(() => {
    if (isRecording && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          // Drop low-accuracy fixes (tunnels, indoors, urban canyon) —
          // the timer counts them as distance otherwise.
          const acc = pos.coords?.accuracy;
          if (Number.isFinite(acc) && acc > MAX_FIX_ACCURACY_M) return;
          const c = [pos.coords.latitude, pos.coords.longitude];
          setPath(prev => [...prev, c]);
          setUserLocation(c);
        },
        (err) => {
          if (import.meta.env.DEV) console.warn('[geolocation] watch error:', err?.message);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isRecording]);

  return {
    userLocation,
    setUserLocation,
    startCoords,
    locationStatus,
    mapCenter,
    path,
    setPath,
  };
};