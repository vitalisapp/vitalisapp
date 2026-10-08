# Vitalis Frontend

Vite 8 + React 19 + React Router 7 + Tailwind 4 + PWA. Minimalist design system, feature-based architecture.

## Structure

```
src/
  app/
    config/env.js        # VITE_API_URL, VITE_SOCKET_URL (single source)
    providers/index.jsx   # ThemeProvider + AuthProvider + NotificationProvider
    routes/{index, AppRoutes}
  features/*                # 15 domains: Auth, Dashboard, Analytics, CameraWorkout, ActivityMap, MealTracker, Community, Log, Plan, Profile, Social, Onboarding, Notifications, Preferences, HelpSupport
    each: components/, hooks/, pages/, services/ (when needed)
  components/
    ui/{Button,Card,Input,Badge,Spinner,Modal}
    feedback/{EmptyState,ErrorState,LoadingState}
    {Sidebar,SidebarAnalytics,Topbar,BottomNav,Icon}
  lib/
    apiClient.js          # centralized fetch (credentials, base URL)
    queryClient.js
    socket.js             # singleton io()
  constants/nav.js
  hooks/{useAuth, useMiddleware, useTheme}
  context/{ThemeContext, NotificationSystem}
  stores/toastStore.js
  App.jsx                   # thin shell
```

Tokens live in src/index.css (:root / .dark-theme / .light-theme). Alias @ -> src/ (see vite.config.js + jsconfig.json).

## Requirements

- Node 20+

## Setup

```bash
npm install
cp .env.example .env   # VITE_API_URL= (empty = same-origin dev proxy), VITE_SOCKET_URL, VITE_GOOGLE_CLIENT_ID
npm run dev            # http://localhost:5173 (proxies /api -> localhost:3000, or BACKEND_URL)
npm run build          # production + PWA
npm run lint
npm test               # eslint + node --test tests/unit (avatar smoke)
npm run test:unit      # unit tests only
```

Fonts are fully self-hosted via `@fontsource/*` (Inter, Manrope, Bebas Neue, DM Sans) — no Google Fonts request, works offline.

## Env

| Var | Description |
|---|---|
| `VITE_API_URL` | Backend base (empty = same-origin via dev proxy; absolute `https://…` for prod builds without proxy) |
| `VITE_SOCKET_URL` | Socket.io base (defaults to `VITE_API_URL`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client |
| `BACKEND_URL` | Dev-proxy target only (default `http://localhost:3000`), never shipped to build |
| `VITE_HMR_CLIENT_PORT` | Set `443` only behind TLS-terminating tunnels |

Validated in `src/app/config/env.js`.

## Conventions

- Feature code stays in `features/<domain>`; shared code only in `components/ui|feedback`, `lib/`, `constants/`.
- Imports use relative paths with explicit `.jsx`/`.js` extensions; API base from `app/config/env.js`, nav from `constants/nav.js`.
- Global `*` transition limited to `color/border/bg` (see `src/index.css`).
