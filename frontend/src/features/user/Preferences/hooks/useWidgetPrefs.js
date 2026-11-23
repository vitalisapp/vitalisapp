import { useCallback, useEffect, useMemo, useState } from 'react';
import { safeGetJSON, safeSetJSON } from '../../../../lib/storage.js';
import { WIDGETS, buildConfigMap, normalizeConfig } from '../lib/widgetCatalog.js';

const storageKey = (userId) => `vitalis:widgets:${userId || 'guest'}`;

/**
 * Widget configuration is device-local in Phase 1: it is a home-screen
 * preference, not account data, so it never leaves the device. Phase 2 can
 * mirror it to the account without changing this component API.
 */
export function useWidgetPrefs(userId) {
  const key = storageKey(userId);
  const [configs, setConfigs] = useState(() => buildConfigMap(safeGetJSON(key, null)));

  useEffect(() => {
    setConfigs(buildConfigMap(safeGetJSON(key, null)));
  }, [key]);

  const persist = useCallback(
    (next) => {
      safeSetJSON(key, next);
      return next;
    },
    [key],
  );

  const update = useCallback(
    (widgetId, patch) => {
      const widget = WIDGETS.find((w) => w.id === widgetId);
      if (!widget) return;
      setConfigs((prev) => {
        const next = {
          ...prev,
          [widgetId]: normalizeConfig(widget, { ...prev[widgetId], ...patch }),
        };
        return persist(next);
      });
    },
    [persist],
  );

  const reset = useCallback(
    (widgetId) => {
      const widget = WIDGETS.find((w) => w.id === widgetId);
      if (!widget) return;
      setConfigs((prev) => persist({ ...prev, [widgetId]: normalizeConfig(widget, null) }));
    },
    [persist],
  );

  return useMemo(() => ({ configs, update, reset }), [configs, update, reset]);
}

export default useWidgetPrefs;
