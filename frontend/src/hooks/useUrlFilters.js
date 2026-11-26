import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { readFilters, writeFilters } from '../lib/urlFilters.js';

/**
 * Filters stored in the URL query string, so refresh, back/forward and shared
 * links keep them. `config` must be stable (module constant or useMemo):
 *   { q: {}, equipment: { options: ['Barbell', ...] } }
 *
 * Returns { values, setFilters, clearFilters, activeCount }.
 * Updates default to history `replace` for live typing. Pass { replace: false }
 * for committed selections that should be restored by Back/Forward.
 */
export function useUrlFilters(config, { replace = true } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const values = useMemo(() => readFilters(searchParams, config), [searchParams, config]);

  const setFilters = useCallback((patch) => {
    setSearchParams((prev) => writeFilters(prev, config, patch), { replace });
  }, [setSearchParams, config, replace]);

  const clearFilters = useCallback(() => {
    const patch = Object.fromEntries(Object.keys(config).map((k) => [k, '']));
    setSearchParams((prev) => writeFilters(prev, config, patch), { replace });
  }, [setSearchParams, config, replace]);

  const activeCount = useMemo(
    () => Object.values(values).filter((v) => String(v).trim()).length,
    [values]
  );

  return { values, setFilters, clearFilters, activeCount };
}
