# Frontend Architecture — Vitalis

## Principles

- **Separation of concerns**: `pages` (UI) → `hooks` (controllers) → `lib/apiClient.js` (`apiGet/apiPost/...`, cookie session, timeout, `ApiError`) → backend. No SQL, no business rules in components.
- **Feature-based**: `src/features/*` owns its `components`, `hooks`, `pages`, `services`. Shared code only when genuinely reusable goes to `src/components/ui|feedback`, `src/constants`, `src/lib`.
- **Minimalism**: theme via CSS variables in `src/index.css`; no external avatar/image hotlinks (local `lib/avatar.js` + `public/*.jpg`).

## Structure

```
src/
├── app/
│   ├── config/env.js        # VITE_API_URL / VITE_SOCKET_URL (validated, single source)
│   ├── providers/index.jsx   # QueryClientProvider + ThemeProvider + AuthProvider + NotificationProvider
│   └── routes/{index, AppRoutes}  # ProtectedRoute / PublicRoute, lazy routes
├── features/
│   ├── Auth/{Login,Register,ForgotPassword,VerifyEmail}
│   ├── Dashboard, Analytics, CameraWorkout, ActivityMap, Plan, Profile, Social (1:1 Messenger), MealTracker, Log, Onboarding, Community (public feed), Notifications, Preferences
│   └── each: components/, hooks/, pages/, services/ (when needed)
├── components/
│   ├── ui/{Button,Dropdown,Input,Modal,Spinner}
│   ├── feedback/{EmptyState,ErrorState,LoadingState}
│   └── {Sidebar,SidebarAnalytics,Topbar,BottomNav,FAB,LogActivityModal,ThemeToggle,FeedbackModal,ErrorBoundary,Icon}
├── constants/nav.js       # single nav source (Sidebar + BottomNav)
├── hooks/{useAuth, useMiddleware, useTheme}
├── context/{ThemeContext, NotificationSystem(shim), NotificationStream(SSE)}
├── lib/{apiClient,socket,queries,queryClient,storage,avatar}
├── stores/toastStore.js     # single toast queue (useToastStore / useNotification alias)
├── index.css                # theme tokens + auth backgrounds (self-hosted)
└── App.jsx
```

## Conventions

- Import `API_BASE_URL` from `src/app/config/env.js`; make calls via `src/lib/apiClient.js` (never raw `fetch` for API — cookies + timeout + 401 handling).
- Sockets via `src/lib/socket.js` singleton (`acquireSocket`/`releaseSocket`), never direct `io()`.
- Import nav from `src/constants/nav.js`.
- Logout via `hooks/useAuth` (`logout()`), not ad-hoc fetch calls.
- Avatars via `src/lib/avatar.js` (`resolveAvatar`) — gradient + initials, offline-safe.
- New UI atoms go to `components/ui`; loading/empty/error go to `components/feedback` (`LoadingState`/`ErrorState`/`EmptyState` with retry).
- Community (`/dashboard/community`) is the public feed; Social (`/dashboard/messenger`) is private 1:1 + AI chat. Do not merge them.

## State

- Local UI state stays local (`useState`).
- Server state via `lib/apiClient.js` (`apiGet/apiPost`, `credentials: 'include'`, 15s timeout, GET dedup, 401 funnel). `@tanstack/react-query` provider is mounted but hooks use manual fetch — `lib/queries.js` keys reserved for future adoption. Toasts via `stores/toastStore.js` (legacy `ActivityMap/hooks/useToast.js` shim delegates here).
- Auth stays in `hooks/useAuth` (context + `localStorage: vitalis_user` profile cache only — no token).
- Theme in `context/ThemeContext` (localStorage + best-effort `PUT /api/settings {theme}` sync).

## Build

```bash
npm run dev     # Vite dev + /api proxy → localhost:3000
npm run build   # production + PWA (map tiles CacheFirst, ALL /api/* NetworkOnly)
npm run lint    # ESLint
```

## Related

- `../../README.md` — full repo overview
- `../../backend/docs/MIGRATIONS.md` — DB migrations (frontend does not run them)
