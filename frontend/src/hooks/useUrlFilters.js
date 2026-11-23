import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { readFilters, writeFilters } from '../lib/urlFilters.js';

/**
 * Filters stored in the URL query string, so refresh, back/forward and shared
 * links keep them. `config` must be stable (module constant or useMemo):
 *   { q: {}, equipment: { options: ['Barbell', ...] } }
 *
 * Returns { values, setFilters, clearFilters, activeCount }.
 * Updates use history `replace` so typing or toggling chips doesn't flood the
 * back stack; Back still leaves the page in one step.
 */
export function useUrlFilters(config) {
  const [searchParams, setSearchParams] = useSearchParams();
  const values = useMemo(() => readFilters(searchParams, config), [searchParams, config]);

  const setFilters = useCallback((patch) => {
    setSearchParams((prev) => writeFilters(prev, config, patch), { replace: true });
  }, [setSearchParams, config]);

  const clearFilters = useCallback(() => {
    const patch = Object.fromEntries(Object.keys(config).map((k) => [k, '']));
    setSearchParams((prev) => writeFilters(prev, config, patch), { replace: true });
  }, [setSearchParams, config]);

  const activeCount = useMemo(
    () => Object.values(values).filter((v) => String(v).trim()).length,
    [values]
  );

  return { values, setFilters, clearFilters, activeCount };
}
