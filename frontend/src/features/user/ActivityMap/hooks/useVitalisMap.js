import { createContext, useContext, useEffect, useRef } from 'react';

// The MapLibre instance owned by <VitalisMap>. Children only render once the
// first style has loaded, so a non-null value is always safe to draw on.
export const VitalisMapContext = createContext(null);

export const useVitalisMap = () => useContext(VitalisMapContext);

// React may run the parent's cleanup (map.remove()) before a child's, so
// children check liveness instead of touching a destroyed map.
const removedMaps = new WeakSet();
export const markMapRemoved = (map) => { if (map) removedMaps.add(map); };
export const isMapAlive = (map) => !!map && !removedMaps.has(map);

// Mounted owners per map + key, so a deferred teardown never removes a source
// that was re-mounted meanwhile (React StrictMode mounts → unmounts → mounts).
const owners = new WeakMap();
const changeOwners = (map, key, delta) => {
  let byKey = owners.get(map);
  if (!byKey) owners.set(map, (byKey = new Map()));
  const n = Math.max(0, (byKey.get(key) || 0) + delta);
  byKey.set(key, n);
  return n;
};

// Runs a style edit now; returns false only while a new style is still
// being built ("Style is not done loading."). Any other error surfaces.
// NB: map.isStyleLoaded() is NOT the right gate — it is also false while a
// GeoJSON source is merely parsing, when edits are perfectly allowed.
const tryStyleEdit = (map, edit) => {
  try {
    edit(map);
    return true;
  } catch (err) {
    if (/not done loading/i.test(err?.message || '')) return false;
    throw err;
  }
};

// Keep a source + its layers on the map across theme swaps.
// `install(map)` must be idempotent (skip anything that already exists); it
// runs now and after every `style.load`, so a full style rebuild can never
// leave the route missing. Data lives in refs owned by the caller.
export const useMapStyleLayer = (map, key, install, teardown) => {
  const installRef = useRef(install);
  const teardownRef = useRef(teardown);
  useEffect(() => {
    installRef.current = install;
    teardownRef.current = teardown;
  });

  useEffect(() => {
    if (!isMapAlive(map)) return undefined;
    changeOwners(map, key, +1);
    const run = () => {
      if (isMapAlive(map)) tryStyleEdit(map, (m) => installRef.current?.(m));
    };
    run(); // if a style is mid-build, the style.load below installs instead
    map.on('style.load', run);

    return () => {
      map.off('style.load', run);
      const remaining = changeOwners(map, key, -1);
      if (remaining > 0 || !isMapAlive(map)) return;
      const remove = () => {
        if (isMapAlive(map) && (owners.get(map)?.get(key) || 0) === 0) {
          tryStyleEdit(map, (m) => teardownRef.current?.(m));
        }
      };
      // Mid style rebuild nothing can be edited yet — clean up once it lands,
      // unless an owner re-mounted by then.
      if (!tryStyleEdit(map, (m) => teardownRef.current?.(m))) map.once('style.load', remove);
    };
  }, [map, key]);
};
