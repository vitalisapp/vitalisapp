// Section 4 — personal coach week for the dashboard card.
import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../../../lib/apiClient.js';

export function useCoachWeek(enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      setData(await apiGet('/api/coach/week'));
      setError('');
    } catch (e) {
      setError(e?.message || 'Could not load your coach.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => { reload(); }, [reload]);

  const act = useCallback(async (path, body) => {
    setBusy(true);
    try {
      setData(await apiPost(path, body));
      setError('');
      return true;
    } catch (e) {
      setError(e?.message || 'Could not update your week.');
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const choose = useCallback((choice) => act('/api/coach/week/adjust', { choice }), [act]);
  const reset = useCallback(() => act('/api/coach/week/reset', {}), [act]);

  return { data, loading, busy, error, reload, choose, reset };
}
