// Bridge between the React gallery and the VITALIS Android shell.
//
// The shell injects `window.VitalisWidgets` with a `requestPin(widgetId)`
// method that forwards to AppWidgetManager.requestPinAppWidget(). In a normal
// browser the object is absent, so the gallery shows honest instructions
// instead of pretending a widget was installed.

export function getWidgetBridge() {
  if (typeof window === 'undefined') return null;
  const bridge = window.VitalisWidgets;
  return bridge && typeof bridge.requestPin === 'function' ? bridge : null;
}

export function isNativeShell() {
  return Boolean(getWidgetBridge());
}

/**
 * @param {string} widgetId
 * @returns {Promise<{ ok: boolean, reason?: 'unsupported' | 'cancelled' | 'error' }>}
 */
export async function requestPinWidget(widgetId) {
  const bridge = getWidgetBridge();
  if (!bridge) return { ok: false, reason: 'unsupported' };

  try {
    const result = await bridge.requestPin(widgetId);
    if (result === true) return { ok: true };
    if (result && typeof result === 'object') {
      return result.ok ? { ok: true } : { ok: false, reason: result.reason || 'cancelled' };
    }
    return { ok: false, reason: 'cancelled' };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

/* ── Windows 11 Widgets Board (installed PWA in Microsoft Edge) ──────────
 * Windows has no "pin widget" API for web apps: the user adds the widget from
 * Win + W → Add widgets. The page can only (1) detect the environment, (2) ask
 * the service worker whether the host supports widgets / one is added, and
 * (3) tell it to refresh or to wipe data on logout. Android code above is
 * untouched.
 */

const SW_STATUS_TIMEOUT_MS = 1500;

/** Windows desktop + Microsoft Edge + whether VITALIS runs as the installed app. */
export function detectWindowsEnvironment() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return { isWindows: false, isEdge: false, isInstalledApp: false };
  }
  const ua = navigator.userAgent || '';
  const uaData = navigator.userAgentData;
  const isWindows = uaData?.platform ? uaData.platform === 'Windows' : /Windows NT/i.test(ua);
  const isEdge = Array.isArray(uaData?.brands)
    ? uaData.brands.some((b) => /Microsoft Edge/i.test(b.brand))
    : /\bEdg\//.test(ua);
  const isInstalledApp = ['standalone', 'window-controls-overlay', 'minimal-ui'].some(
    (mode) => window.matchMedia?.(`(display-mode: ${mode})`).matches,
  );
  return { isWindows, isEdge, isInstalledApp };
}

function postToWorker(message) {
  try {
    navigator.serviceWorker?.controller?.postMessage(message);
  } catch {
    /* no worker yet — nothing to update */
  }
}

/**
 * Ask the service worker what the Widgets Board host reports.
 * @returns {Promise<{ worker: boolean, supported: boolean, added: boolean }>}
 */
export function getWindowsWidgetStatus() {
  const controller = typeof navigator !== 'undefined' ? navigator.serviceWorker?.controller : null;
  if (!controller || typeof MessageChannel === 'undefined') {
    return Promise.resolve({ worker: false, supported: false, added: false });
  }
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => resolve({ worker: true, supported: false, added: false }), SW_STATUS_TIMEOUT_MS);
    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      const data = event.data || {};
      resolve({ worker: true, supported: Boolean(data.supported), added: Boolean(data.added) });
    };
    try {
      controller.postMessage({ type: 'VITALIS_WIDGETS_STATUS' }, [channel.port2]);
    } catch {
      clearTimeout(timer);
      resolve({ worker: true, supported: false, added: false });
    }
  });
}

/** Ask the worker to refresh Windows widgets (it throttles and skips if none are added). */
export function refreshWindowsWidgets() {
  postToWorker({ type: 'VITALIS_WIDGETS_REFRESH' });
}

let syncInstalled = false;

/**
 * Boot-time wiring (main.jsx): wipe widget data on logout / expired session,
 * refresh when the app opens or returns to the foreground. No polling.
 */
export function installWidgetSync() {
  if (syncInstalled || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  syncInstalled = true;

  const signedOut = () => postToWorker({ type: 'VITALIS_WIDGETS_SIGNED_OUT' });
  window.addEventListener('vitalis:logout', signedOut);
  window.addEventListener('vitalis:unauthorized', signedOut);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshWindowsWidgets();
  });
  navigator.serviceWorker.ready.then(refreshWindowsWidgets).catch(() => {});
}
