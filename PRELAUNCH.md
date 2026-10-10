# Pre-launch checklist — Vitalis

Run top to bottom before first production deploy. Check off each item.

## Environment (backend/.env — never commit)

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET`: 32+ random chars, not the example value
- [ ] `DB_PASS` set (empty refused in prod); managed MySQL → `DB_SSL=1` + `DB_SSL_CA`
- [ ] `FRONTEND_URL=https://…` (https required) and `ALLOWED_ORIGINS=https://…`
- [ ] `ALLOW_DEV_LINKS=0` (boot refuses `=1` in prod)
- [ ] `TZ=UTC` (quotas + day boundaries)
- [ ] `EMAIL_USER`/`EMAIL_PASS` + `RECEIVER_EMAIL` verified (send a test OTP)
- [ ] `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` match frontend `VITE_GOOGLE_CLIENT_ID`
- [ ] `GEMINI_API_KEY` (and/or `GROQ_API_KEY`) set; fallback works without them
- [ ] Boot log shows no `[env]` errors; `GET /api/health` returns ok

## Frontend build

- [ ] `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_GOOGLE_CLIENT_ID` set before `npm run build`
- [ ] `npm run build` precache ≈ 4.7 MB, no missing-asset errors
- [ ] PWA install prompt works; icons (192/512/maskable) + `offline.html` present in `dist/`
- [ ] SEO meta + favicon + 404 page verified in `dist/index.html`

## Database

- [ ] `npm run db:migrate:dry` shows expected pendings; `npm run db:migrate` applies cleanly
- [ ] Backup job scheduled + restore tested (mysqldump documented runbook)
- [ ] `_migrations` table matches `backend/migrations/` count (32)

## Security sweep

- [ ] Register → verify → login → Google login → forgot-OTP → onboarding all pass on prod URLs
- [ ] Revoke one session → that cookie 401s; other sessions die too (by design, message says so)
- [ ] Non-friend cannot trigger `receive-chat`; sender spoof rejected
- [ ] AI quota 429s past daily limit; `Retry-After` header present
- [ ] Rate limits respond 429 (not 500) on login/OTP/AI/message bursts
- [ ] Upload caps: avatar 200 KB, food/pose images 413 past cap, messenger 2000 chars

## Devices & browsers

- [ ] 360px (Moto G class), 768px (tablet), desktop — no horizontal scroll
- [ ] Camera denied → fallback + Gallery path; GPS denied → banner + no fake run
- [ ] Keyboard: modals trap focus, ESC closes, forms submittable by keyboard
- [ ] `prefers-reduced-motion`: no decorative animation

## Monitoring

- [ ] Error tracking on backend (`[SERVER ERROR]` logs shipped somewhere readable)
- [ ] Uptime check on `/api/health`; DB connection alerts
- [ ] Log volume sane in prod (debug/info silent unless `DEBUG` is set)

## Docs & repo

- [ ] README screenshots captured (light + dark, 7 screens listed in README)
- [ ] `CHANGELOG.md` entry for the release; `prod/hardening` merged via reviewed PR
- [ ] Stashed pre-hardening WIP (`vitalis WIP before prod-hardening`) reconciled or dropped
