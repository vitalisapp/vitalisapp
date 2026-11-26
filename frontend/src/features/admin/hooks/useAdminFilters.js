import { useSearchParams } from 'react-router-dom';
import { readAdminFilters, writeAdminFilters } from '../utils/urlFilters.js';

// Committed filter changes push history so Back/Forward restores table state.
export function useAdminFilters(config) {
  const [params, setParams] = useSearchParams();
  const values = readAdminFilters(params, config);
  const update = (patch) => {
    const next = writeAdminFilters(params, config, patch);
    if (next.toString() !== params.toString()) setParams(next);
  };
  return { values, update };
}
