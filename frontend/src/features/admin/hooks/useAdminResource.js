import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../../../lib/apiClient.js';

/**
 * Small data hook for the admin console.
 *
 * - Keeps the last successful payload while refreshing (no flicker), and
 *   also when a refresh FAILS: the page keeps showing that data, `error`
 *   stays null and the failure is reported as `refreshError` instead.
 *   `error` is only set when there is nothing to show (first load failed).
 * - `loading` is true only until the first payload for the current path lands.
 * - Aborts in-flight requests when filters change / component unmounts.
 */
export function useAdminResource(path) {
  const [state, setState] = useState({ path: null, data: null, error: null, refreshError: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    apiGet(path, { signal: controller.signal })
      .then((data) => {
        if (alive) setState({ path, data, error: null, refreshError: null });
      })
      .catch((error) => {
        if (!alive || error?.code === 'ABORTED') return;
        setState((prev) => (
          prev.path === path && prev.data != null
            // Failed reload of the same view: keep the data on screen.
            ? { ...prev, refreshError: error }
            : { path, data: null, error, refreshError: null }
        ));
      });
    return () => {
      alive = false;
      controller.abort();
    };
  }, [path, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const current = state.path === path;
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    refreshError: current ? state.refreshError : null,
    loading: !current,
    reload,
  };
}
