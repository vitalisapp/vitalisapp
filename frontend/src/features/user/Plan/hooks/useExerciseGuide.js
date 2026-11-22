// Section 3 — written exercise instructions (steps, cues, mistakes) for the
// recommender's exercise pool. Fetched once per session and shared.
import { useEffect, useState } from 'react';
import { apiGet } from '../../../../lib/apiClient.js';

let cache = null;
let inflight = null;

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

function load() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = apiGet('/api/training-preferences/exercise-guide')
      .then((d) => {
        cache = new Map((d?.exercises || []).map((ex) => [norm(ex.name), ex]));
        return cache;
      })
      .catch(() => new Map())
      .finally(() => { inflight = null; });
  }
  return inflight;
}

/** Returns the guide entry for `name` (or null), plus a loading flag. */
export function useExerciseGuide(name) {
  const [state, setState] = useState(() => ({ guide: cache?.get(norm(name)) ?? null, loading: !cache }));
  useEffect(() => {
    if (!name) return undefined;
    let alive = true;
    load().then((map) => { if (alive) setState({ guide: map.get(norm(name)) ?? null, loading: false }); });
    return () => { alive = false; };
  }, [name]);
  return state;
}
