# Changelog — Vitalis production hardening (`prod/hardening`)

All changes are behavior-preserving unless marked **[behavior]**.

## Security

- Per-device session revoke now invalidates cookies: `DELETE /api/security/:sessionId`
  checks ownership, bumps `token_version` (fail closed), then deletes the row.
  Bogus ids are side-effect-free 404s. **[behavior]**
- `ALLOW_DEV_LINKS=1` and missing `FRONTEND_URL`/`ALLOWED_ORIGINS` refuse to
  boot in production (`env.js` fail-fast + tests).
- Socket `send-chat` relay: friends-only (accepted/close_friend either
  direction), sender-must-equal-authed-user, 2000-char cap, 30/min per-socket
  limit, whitelisted forward shape. REST stays the persistence path.
  **[behavior: realtime delivery now works; previously emits went nowhere]**

## Design system

- Fonts: Inter (UI) + Manrope (display) only; Bebas Neue and DM Sans removed
  (imports, usages, packages).
- Palette: muted leaf-green accent (`#57B26A` scale) global in dark theme;
  glow shadows removed; light warning/info darkened. WCAG AA verified for
  all text pairs both themes (landing disabled-gray exempt).
- Blur restricted to photo/video/map/sticky surfaces; all modal backdrops
  are solid overlays. Decorative pulse dots removed (loading/feedback kept).
- Static inline styles converted to Tailwind/tokens; dynamic values
  (widths, gradients, safe-area, delays) stay inline.

## Code health

- Backend structured logger (`utils/logger.js`); ~140 `console.*` routed
  through it (CLI scripts and boot banner keep console intentionally).
- Splits (move-only, verified identical): Plans 1316→248, CameraWorkout
  937→690, Analytics 721→138, Profile 694→365, MealTracker 678→437,
  gemini 926→barrel + 8 modules, auth.controller 693→487 + 5 services,
  ai.controller 583→barrel + 5 services.
- Seeds idempotent (`IF NOT EXISTS`, inline keys, `INSERT IGNORE`) with run
  docs; `.editorconfig` restored, `.gitattributes` (LF) added.
- Dead code removed (`GlassAmbient` no-op); 410 stubs and legacy redirects
  kept intentionally (client compat).
- Copy tightened on Landing/onboarding; user-facing dev wording removed.

## Performance

- PWA precache 8.6 MB → 4.7 MB (icon font runtime-cached); font subsets
  cut by dropping two families.

## Tests

- Backend 70 → 85 (revocation, env guards, socket relay).
- Frontend 8 → 30 (sleepScore, metrics, dateKey).
