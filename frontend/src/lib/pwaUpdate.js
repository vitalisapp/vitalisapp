// Keeps installed PWAs and long-lived tabs on the latest deployment.
//
// The generated service worker uses skipWaiting + clientsClaim
// (registerType: 'autoUpdate'), so a new build takes control immediately —
// but the open page keeps running the old JS bundle until it reloads. That
// made a shipped fix look "missing" in the UI. This reloads once when a new
// worker takes over, and asks the browser to check for a new worker when the
// app is brought back to the foreground.

const CHECK_INTERVAL_MS = 10 * 60 * 1000;

function isTyping() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function installServiceWorkerUpdate() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (!import.meta.env.PROD) return;

  // A controller at boot means this page was served by a worker; the next
  // controllerchange is a real update. On a first visit the initial claim must
  // not trigger a reload.
  const hadController = Boolean(navigator.serviceWorker.controller);
  let pendingReload = false;
  let reloaded = false;

  const maybeReload = () => {
    if (!pendingReload || reloaded) return;
    // Never yank the page from under someone mid-entry — wait until they
    // leave the field / come back to the app.
    if (isTyping()) return;
    reloaded = true;
    window.location.reload();
  };

  if (hadController) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      pendingReload = true;
      maybeReload();
    });
    document.addEventListener("focusout", maybeReload, true);
  }

  let lastCheck = 0;
  const checkForUpdate = () => {
    const now = Date.now();
    if (now - lastCheck < CHECK_INTERVAL_MS) return;
    lastCheck = now;
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => registration?.update?.())
      .catch(() => {
        /* offline or unsupported — the next foreground will retry */
      });
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    maybeReload();
    checkForUpdate();
  });

  // First check shortly after boot (registerSW.js has registered by then).
  window.setTimeout(checkForUpdate, 5000);
}
