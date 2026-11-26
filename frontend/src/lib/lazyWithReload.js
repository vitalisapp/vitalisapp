// Recovers from stale code-split chunks after a deploy.
//
// Each build renames its chunks (Dashboard-<hash>.js). A tab or installed PWA
// still running the previous build asks for the old file name, which the new
// deployment (and the updated service worker's cache) no longer has, so the
// route crashes with "Failed to fetch dynamically imported module". Reloading
// once fetches the new index.html, which points at the new chunks.
import { lazy } from 'react';

const KEY = 'vitalis:chunk-reload-at';
// One automatic reload per window: if the chunk is still missing right after
// a reload, the error is real (offline, broken deploy), so let it surface
// instead of reload-looping.
const WINDOW_MS = 30 * 1000;

const CHUNK_ERROR = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|Loading (CSS )?chunk [\w-]+ failed|'text\/html' is not a valid JavaScript MIME type/i;

export function isChunkLoadError(err) {
  return Boolean(err) && (err.name === 'ChunkLoadError' || CHUNK_ERROR.test(String(err.message || err)));
}

/** Reloads the page once per window. Returns true if a reload was started. */
export function reloadForNewBuild() {
  if (typeof window === 'undefined') return false;
  let last = 0;
  try { last = Number(sessionStorage.getItem(KEY)) || 0; } catch { /* storage blocked */ }
  if (Date.now() - last < WINDOW_MS) return false;
  try { sessionStorage.setItem(KEY, String(Date.now())); } catch { /* storage blocked */ }
  window.location.reload();
  return true;
}

/** Drop-in for React.lazy that reloads once onto the new build when a chunk is gone. */
export function lazyWithReload(factory) {
  return lazy(() =>
    factory().catch((err) => {
      // Never resolve while the reload is happening, so no error flashes first.
      if (isChunkLoadError(err) && reloadForNewBuild()) return new Promise(() => {});
      throw err;
    }),
  );
}

/** Vite fires this when a chunk's preload (JS or CSS) fails. */
export function installChunkErrorRecovery() {
  if (typeof window === 'undefined') return;
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewBuild()) event.preventDefault();
  });
}
