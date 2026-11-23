/* VITALIS Windows 11 Widgets Board — service worker handlers.
 *
 * Loaded into the Workbox-generated sw.js through `workbox.importScripts`
 * (see vite.config.js), after widgets/config.js and widgets/widget-data.js.
 * Docs: https://learn.microsoft.com/microsoft-edge/progressive-web-apps/how-to/widgets
 *
 * - Only runs widget code when the host exposes `self.widgets` (installed PWA
 *   in Microsoft Edge on Windows 11). Everywhere else these listeners are inert.
 * - Auth is the existing httpOnly session cookie (credentials: 'include').
 *   No token is stored here; a 401/403 renders the "Sign in" card.
 * - Fetches only while a widget instance exists; periodic refresh is
 *   unregistered when the last instance is removed.
 */
(function () {
  'use strict';

  var CONFIG = self.VITALIS_WIDGETS_CONFIG || {};
  var API_BASE = String(CONFIG.apiBase || '').replace(/\/+$/, '');
  var TAG = 'vitalis-today';
  var TEMPLATE_URL = '/widgets/today-activity.json';
  var TEMPLATE_CACHE = 'vitalis-widgets-v1';
  var DEFAULT_REFRESH_MS = 30 * 60 * 1000; // user decision: every 30 minutes
  var MIN_FETCH_GAP_MS = 60 * 1000; // app-open refreshes are throttled
  var FETCH_TIMEOUT_MS = 15000;

  var Data = self.VitalisWidgetData;
  var lastFetchAt = 0;
  var inflight = null;

  var hasWidgets = function () {
    return typeof self.widgets === 'object' && self.widgets !== null && typeof self.widgets.updateByTag === 'function';
  };

  async function getWidget() {
    if (!hasWidgets()) return null;
    try {
      return (await self.widgets.getByTag(TAG)) || null;
    } catch (_) {
      return null;
    }
  }

  function instanceCount(widget) {
    return widget && Array.isArray(widget.instances) ? widget.instances.length : 0;
  }

  function refreshIntervalMs(widget) {
    // Manifest `update` is documented in seconds; Periodic Background Sync
    // takes milliseconds, so convert explicitly.
    var seconds = Number(widget && widget.definition && widget.definition.update);
    return isFinite(seconds) && seconds > 0 ? seconds * 1000 : DEFAULT_REFRESH_MS;
  }

  // Template: network first, Cache Storage fallback so an offline refresh can
  // still draw the "Couldn't refresh" card.
  async function getTemplate(widget) {
    var url = (widget && widget.definition && widget.definition.msAcTemplate) || TEMPLATE_URL;
    try {
      var res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error('template ' + res.status);
      var cache = await caches.open(TEMPLATE_CACHE);
      await cache.put(TEMPLATE_URL, res.clone());
      return await res.text();
    } catch (_) {
      var cached = await caches.match(TEMPLATE_URL, { cacheName: TEMPLATE_CACHE });
      return cached ? cached.text() : null;
    }
  }

  async function fetchSummary() {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);
    try {
      var url = API_BASE + '/api/widgets/summary?today=' + encodeURIComponent(Data.localTodayIso());
      var res = await fetch(url, { credentials: 'include', cache: 'no-store', signal: controller.signal });
      if (res.status === 401 || res.status === 403) return { kind: 'signedout' };
      if (!res.ok) return { kind: 'error' };
      return { kind: 'ok', summary: await res.json() };
    } catch (_) {
      return { kind: 'error' };
    } finally {
      clearTimeout(timer);
    }
  }

  async function paint(widget, data) {
    var template = await getTemplate(widget);
    if (!template) return;
    try {
      await self.widgets.updateByTag(TAG, { template: template, data: JSON.stringify(data) });
    } catch (_) {
      /* host rejected the payload — next refresh retries */
    }
  }

  /**
   * Fetch + render. `force` skips the app-open throttle (install/periodic).
   * `hostWidget` comes from a host event (widgetinstall/widgetresume): render
   * it unconditionally like Microsoft's PWAmp demo, because the new instance
   * may not be listed in `instances` yet when the event fires.
   */
  async function refresh(force, hostWidget) {
    if (!hasWidgets()) return;
    var widget = hostWidget || (await getWidget());
    if (!widget) return;
    if (!hostWidget && !instanceCount(widget)) return;
    if (!force && Date.now() - lastFetchAt < MIN_FETCH_GAP_MS) return;
    if (inflight) return inflight;

    inflight = (async function () {
      lastFetchAt = Date.now();
      var result = await fetchSummary();
      var data =
        result.kind === 'ok'
          ? Data.todayActivity(result.summary)
          : result.kind === 'signedout'
            ? Data.signedOut()
            : Data.failed();
      await paint(widget, data);
    })();

    try {
      await inflight;
    } finally {
      inflight = null;
    }
  }

  // Logout: wipe the card immediately — no network call, no stale numbers.
  async function showSignedOut() {
    var widget = await getWidget();
    if (!instanceCount(widget)) return;
    lastFetchAt = 0;
    await paint(widget, Data.signedOut());
  }

  async function registerPeriodic(widget) {
    try {
      if (self.registration.periodicSync) {
        await self.registration.periodicSync.register(TAG, { minInterval: refreshIntervalMs(widget) });
      }
    } catch (_) {
      /* periodic sync unavailable — refreshes still happen on resume/app open */
    }
  }

  async function unregisterPeriodic() {
    try {
      if (self.registration.periodicSync) await self.registration.periodicSync.unregister(TAG);
    } catch (_) {
      /* ignore */
    }
  }

  async function openApp(path) {
    var target = new URL(path, self.registration.scope).href;
    var windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var i = 0; i < windows.length; i += 1) {
      var client = windows[i];
      if ('focus' in client) {
        try {
          if ('navigate' in client && client.url !== target) await client.navigate(target);
          return await client.focus();
        } catch (_) {
          /* fall through to openWindow */
        }
      }
    }
    return self.clients.openWindow(target);
  }

  /* ── Widget host events (Windows 11 Widgets Board) ─────────────────── */

  self.addEventListener('widgetinstall', function (event) {
    event.waitUntil(
      (async function () {
        await registerPeriodic(event.widget);
        await refresh(true, event.widget);
      })(),
    );
  });

  self.addEventListener('widgetuninstall', function (event) {
    event.waitUntil(
      (async function () {
        // The event fires before the instance is removed: 1 means "last one".
        if (instanceCount(event.widget) <= 1) await unregisterPeriodic();
      })(),
    );
  });

  self.addEventListener('widgetresume', function (event) {
    event.waitUntil(refresh(true, event.widget));
  });

  self.addEventListener('widgetclick', function (event) {
    var action = event.action;
    event.waitUntil(
      action === 'sign-in' ? openApp('/login') : openApp('/dashboard'),
    );
  });

  self.addEventListener('periodicsync', function (event) {
    if (event.tag !== TAG) return;
    event.waitUntil(refresh(true));
  });

  // Widgets may be installed before this worker activates (per Microsoft docs).
  self.addEventListener('activate', function (event) {
    if (!hasWidgets()) return;
    event.waitUntil(refresh(true));
  });

  /* ── Messages from the VITALIS page (src/lib/widgetBridge.js) ──────── */

  self.addEventListener('message', function (event) {
    var msg = event.data || {};
    if (msg.type === 'VITALIS_WIDGETS_REFRESH') {
      event.waitUntil(refresh(false));
    } else if (msg.type === 'VITALIS_WIDGETS_SIGNED_OUT') {
      event.waitUntil(showSignedOut());
    } else if (msg.type === 'VITALIS_WIDGETS_STATUS') {
      var port = event.ports && event.ports[0];
      if (!port) return;
      event.waitUntil(
        (async function () {
          var widget = await getWidget();
          port.postMessage({ supported: hasWidgets(), added: instanceCount(widget) > 0 });
        })(),
      );
    }
  });
})();
