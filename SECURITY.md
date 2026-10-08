# Security Policy

## Reporting a vulnerability

Do not open a public issue for security reports.
Email the maintainer privately with steps to reproduce, impact, and affected version.

## Rules

* Never commit `.env`, credentials, API keys, or tokens. Only `.env.example` is tracked.
* `VITE_*` vars are public by design (baked into `frontend/dist/`) — never put secrets there.
* Rotate `JWT_SECRET`, `DB_PASS`, `GEMINI/GROQ` keys, `GOOGLE_CLIENT_SECRET`, `EMAIL_PASS` immediately if ever pushed.
* Production requires `TZ=UTC`, `ALLOWED_ORIGINS=https://...` (never `*`), `FRONTEND_URL=https://...`, `ALLOW_DEV_LINKS=0`.
