import { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
// v6 resolves its worker at runtime (invisible to Vite) — hand it the emitted URL.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import Icon from '../../../../components/Icon.jsx';
import { VitalisMapContext, markMapRemoved } from '../hooks/useVitalisMap.js';
import { carryOverVitalisLayers, mapStyleUrl, toLngLat } from '../utils/mapAdapter.js';

setWorkerUrl(maplibreWorkerUrl);

const FALLBACK_CENTER = [0, 20]; // [lng, lat] — neutral, never shown as the user
const MAX_ZOOM = 19;
const ERROR_LOG_INTERVAL_MS = 10000;

// One MapLibre instance per mount. GPS, timer and run state live outside the
// map, so a map failure (no WebGL, tiles offline) never affects recording.
//  · `center` ([lat, lng]) and `zoom` are initial values only (as with Leaflet).
//  · `isDark` swaps the OpenFreeMap style in place, keeping camera + route.
//  · Children render only after the first style load and read the instance
//    through useVitalisMap().
const VitalisMap = ({
  center = undefined,
  zoom = 3,
  isDark = false,
  className = '',
  style = undefined,
  children = undefined,
}) => {
  const containerRef = useRef(null);
  const initialRef = useRef({ center, zoom, isDark });
  const appliedDarkRef = useRef(isDark);
  const [map, setMap] = useState(null);
  // loading | ready | offline | unsupported | lost
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const init = initialRef.current;

    let instance;
    try {
      instance = new MapLibreMap({
        container: el,
        style: mapStyleUrl(init.isDark),
        center: toLngLat(init.center) ?? FALLBACK_CENTER,
        zoom: init.zoom,
        maxZoom: MAX_ZOOM,
        // Flat 2D fitness map (as before): no rotate / tilt — cheaper on low-end GPUs.
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        maxPitch: 0,
        rollEnabled: false,
        fadeDuration: 0,
        attributionControl: { compact: true },
      });
    } catch (err) {
      // No usable WebGL: keep the page (stats, controls, GPS) fully working.
      console.warn('[ActivityMap] Map unavailable:', err?.message || err);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time init failure, nothing to subscribe to
      setStatus('unsupported');
      return undefined;
    }

    appliedDarkRef.current = init.isDark;
    instance.touchZoomRotate.disableRotation();
    instance.keyboard.disableRotation();

    let loaded = false;
    let lastErrorLog = 0;
    const onLoad = () => {
      loaded = true;
      setMap(instance);
      setStatus('ready');
    };
    const onError = (e) => {
      // Tile / style fetch failures (offline, provider hiccup) are non-fatal.
      if (!loaded) setStatus('offline');
      const now = Date.now();
      if (now - lastErrorLog < ERROR_LOG_INTERVAL_MS) return;
      lastErrorLog = now;
      console.warn('[ActivityMap] Map resource error:', e?.error?.message || e?.error || e);
    };
    const onLost = () => setStatus('lost');
    const onRestored = () => setStatus(loaded ? 'ready' : 'loading');
    // The first style fetch is not retried by MapLibre — retry it on reconnect.
    const onOnline = () => {
      if (loaded) return;
      setStatus('loading');
      instance.setStyle(mapStyleUrl(appliedDarkRef.current), { diff: false });
    };

    instance.once('load', onLoad);
    instance.on('error', onError);
    instance.on('webglcontextlost', onLost);
    instance.on('webglcontextrestored', onRestored);
    window.addEventListener('online', onOnline);

    // MapLibre only tracks window resizes; the container also changes with
    // sidebar expand/collapse, lazy layout settling and panel changes.
    let resizeFrame = 0;
    const resize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => instance.resize());
    };
    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(resize);
      observer.observe(el);
    }

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener('online', onOnline);
      markMapRemoved(instance);
      instance.remove();
      setMap(null);
    };
  }, []);

  // Theme swap: diff the new base style in, carrying the Vitalis route layers
  // and ignoring the style's own camera. Rapid toggles abort the stale fetch.
  useEffect(() => {
    if (!map || appliedDarkRef.current === isDark) return;
    appliedDarkRef.current = isDark;
    map.setStyle(mapStyleUrl(isDark), { transformStyle: carryOverVitalisLayers });
  }, [map, isDark]);

  const notice =
    status === 'unsupported' ? 'Map can’t be shown on this device — your run still records.'
    : status === 'lost' ? 'Map paused — restoring graphics…'
    : status === 'offline' ? 'Map tiles unavailable offline — your run still records.'
    : null;

  return (
    <div className={`vitalis-map ${className}`.trim()} style={style}>
      <div ref={containerRef} className="vitalis-map__canvas" />
      {notice && (
        <div className="vitalis-map__notice" role="status">
          <Icon name="map" />
          <span>{notice}</span>
        </div>
      )}
      {map && <VitalisMapContext.Provider value={map}>{children}</VitalisMapContext.Provider>}
    </div>
  );
};

export default VitalisMap;
