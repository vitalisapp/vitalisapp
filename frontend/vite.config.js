import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import path from 'path';
import { fileURLToPath } from 'url';

/* global process */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Browser support floor lives in package.json "browserslist" (iOS/Safari 15.4+,
// Chrome/Edge 99+, Firefox 97+, Samsung 18+). Tailwind v4 alone only emits CSS
// for Safari 16.4+: range media queries (@media (width >= 48rem)) that older
// Safari/Firefox/Edge ignore, and unprefixed backdrop-filter that Safari <18
// drops. Lightning CSS lowers both (min-width queries, -webkit- prefixes) in
// dev and build. @layer can't be polyfilled, which is why the floor is 15.4.
const CSS_TARGETS = browserslistToTargets(browserslist(undefined, { path: __dirname }));
const JS_TARGETS = ['chrome99', 'edge99', 'firefox97', 'safari15.4', 'ios15.4'];

const proxyErrorHandler = (proxy) => {
  proxy.on('error', (err, req, res) => {
    try {
      if (res && res.writeHead && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Backend unreachable', code: 'UPSTREAM' }));
      } else if (res && res.destroy) {
        res.destroy();
      }
    } catch {
      /* socket already gone */
    }
  });
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const backendTarget = env.BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3000';
  const hmrPort = env.VITE_HMR_CLIENT_PORT || process.env.VITE_HMR_CLIENT_PORT;
  // Shared by `npm run dev` and `npm run preview` (preview serves the built
  // app + service worker, so it must reach /api too).
  const apiProxy = {
    // Long-lived SSE must bypass the 15s /api timeout (else 504s). Listed first.
    '/api/notifications/stream': {
      target: backendTarget,
      changeOrigin: true,
      secure: false,
      timeout: 660000,
      configure: proxyErrorHandler,
    },
    // AI failover can take ~2min: 180s entries listed before '/api'.
    ...Object.fromEntries(
      ['/api/coach', '/api/ai', '/api/ai-chat', '/api/analyze-pose', '/api/food-logs'].map((p) => [
        p,
        {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          timeout: 180000,
          configure: proxyErrorHandler,
        },
      ])
    ),
    // Multer-stored images (/uploads/<category>/<file>.jpg) referenced by
    // food_logs.image_url — served by the backend in dev too.
    '/uploads': {
      target: backendTarget,
      changeOrigin: true,
      secure: false,
      configure: proxyErrorHandler,
    },
    '/api': {
      target: backendTarget,
      changeOrigin: true,
      secure: false,
      timeout: 15000,
      configure: proxyErrorHandler,
    },
    '/socket.io': {
      target: backendTarget,
      changeOrigin: true,
      ws: true,
      secure: false,
      configure: proxyErrorHandler,
    },
  };
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['offline.html', 'robots.txt', 'favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'Vitalis',
          short_name: 'Vitalis',
          description: 'AI-powered fitness tracking',
          theme_color: '#050501',
          background_color: '#050501',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          categories: ['health', 'fitness', 'lifestyle'],
          // Lets the landing page ask "is Vitalis already installed?" via
          // navigator.getInstalledRelatedApps() (Chrome Android 84+; desktop
          // Chrome/Edge 140+ needs the absolute id). Set PWA_ORIGIN env to the
          // deployed https origin (e.g. https://vitalis.app) for desktop.
          related_applications: [
            {
              platform: 'webapp',
              url: '/manifest.webmanifest',
              ...(process.env.PWA_ORIGIN
                ? { id: `${String(process.env.PWA_ORIGIN).replace(/\/+$/, '')}/` }
                : {}),
            },
          ],
          shortcuts: [
            { name: 'Dashboard', url: '/dashboard' },
            { name: 'Log workout', url: '/logs' },
          ],
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            {
              src: 'maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          // Hero/auth JPGs (~830KB) stay lazy-loaded online, not precached — offline shell uses offline.html.
          // Loading_green.png: legacy 2.4MB source art (BrandLoader uses the 9KB webp).
          // Non-Latin font subsets: the browser only fetches them via unicode-range
          // when such glyphs appear, so precaching them wasted ~2MB per install.
          globIgnores: [
            'hero-gym.jpg',
            'auth-gym.jpg',
            'Loading_green.png',
            '**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2',
            // Pose runtime (~10-15 MB): cached on first camera use below,
            // never precached on install for users who don't use the camera.
            'mediapipe/**',
          ],
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2,webp}'],
          // SPA fallback for route reloads: any navigation that isn't a
          // precached asset serves the app shell. If this points at
          // offline.html instead, every deployed deep-route reload shows the
          // offline page (service worker handles navigations).
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // MediaPipe Pose runtime: version-pinned, immutable URLs (local
              // copy or jsDelivr fallback). CacheFirst makes every visit after
              // the first load the model instantly, even offline.
              urlPattern: ({ url }) =>
                url.pathname.startsWith('/mediapipe/pose/') ||
                (url.hostname === 'cdn.jsdelivr.net' && url.pathname.startsWith('/npm/@mediapipe/pose@')),
              handler: 'CacheFirst',
              options: {
                cacheName: 'mediapipe-pose',
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // MapLibre web worker (hashed .mjs asset, not in globPatterns):
              // cached on first map visit so a revisit renders cached tiles offline.
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin && /\/maplibre-gl-worker-[^/]*\.mjs$/.test(url.pathname),
              handler: 'CacheFirst',
              options: {
                cacheName: 'map-worker',
                expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [200] },
              },
            },
            {
              // OpenFreeMap style JSON + TileJSON (/styles/*, /planet, …): small
              // and re-pointed upstream on each tile release — revalidate.
              urlPattern: ({ url }) =>
                url.hostname === 'tiles.openfreemap.org' &&
                (url.pathname.startsWith('/styles/') || /^\/[^/]+$/.test(url.pathname)),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'map-styles',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [200] },
              },
            },
            {
              // Vector tiles, glyphs, sprites: versioned URLs → bounded
              // CacheFirst. Viewed tiles only — no prefetch / bulk download.
              urlPattern: ({ url }) => url.hostname === 'tiles.openfreemap.org',
              handler: 'CacheFirst',
              options: {
                cacheName: 'map-tiles',
                expiration: {
                  maxEntries: 300,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                  purgeOnQuotaError: true,
                },
                cacheableResponse: { statuses: [200] },
              },
            },
            {
              // User-scoped API reads must never be served stale (shared-device safety):
              // always go to network; offline shell is handled by offline.html + local cache.
              urlPattern: /\/api\/.*/,
              handler: 'NetworkOnly',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: { exclude: ['@mediapipe/pose'] },
    css: {
      transformer: 'lightningcss',
      lightningcss: { targets: CSS_TARGETS },
    },
    build: {
      target: JS_TARGETS,
      cssTarget: JS_TARGETS,
      cssMinify: 'lightningcss',
      // 1000 hid bloat (Plans 48KB, Dropdown chunk 373KB flagged) — 500 surfaces it.
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          // Rolldown/Vite 8 requires function form.
          manualChunks: (id) => {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('@mediapipe')) return 'vendor-mediapipe';
            // MapLibre's dist bundle has no imports, so this group can't pull
            // react in (the leaflet pitfall below); it caches across app deploys.
            if (id.includes('node_modules/maplibre-gl/')) return 'vendor-maplibre';
            // No forced group for chart.js: Rolldown pulls a group's
            // dependencies into it, so react + react-dom landed inside
            // vendor-chart/vendor-map and every page (even /login) downloaded
            // both libraries. Left unassigned, they split naturally into the
            // lazy chunks of the pages that use them (ActivityMap, Log, admin).
            // Same for framer-motion (Onboarding only).
            if (id.includes('@tanstack') || id.includes('zustand')) return 'vendor-query';
            // Narrow React match: '/react/' over-matched paths like '@bryllim/.../react/'.
            if (
              id.includes('react-router') ||
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            )
              return 'vendor-react';
            return undefined;
          },
        },
      },
    },
    // Dev proxy keeps the session cookie first-party. Prod uses absolute VITE_* URLs.
    // BACKEND_URL overrides the target (default localhost:3000).
    server: {
      host: true,
      allowedHosts: true,
      hmr: hmrPort ? { clientPort: Number(hmrPort) } : true,
      proxy: apiProxy,
    },
    preview: {
      host: true,
      port: 4173,
      // Same proxy as dev so login + /api work on the built app (service worker).
      proxy: apiProxy,
    },
  };
});
