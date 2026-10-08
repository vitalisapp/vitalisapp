# Vitalis

Fitness tracking with AI coaching — workout logging, nutrition and food scanning,
sleep tracking, plans, community, messaging, and analytics in one monorepo.

## Features

* Auth with email verification, password reset OTP, Google OAuth, session revocation
* Dashboard, daily check-ins, goals, activity and workout logs
* Meal tracker with camera food scan and macro coaching
* Camera workout with pose tracking and rep counting
* Activity map with GPS routes, community posts, kudos, comments
* Personal plans, onboarding, analytics, notifications, preferences
* AI coach and insights with daily quota, model fallback, and cache

## Stack

* Backend: Express 5, MySQL 8, Socket.io, Zod, JWT cookies, Nodemailer
* Frontend: Vite 8, React 19, React Router 7, Tailwind 4, PWA, Leaflet, Chart.js
* Tests: Node test runner, ESLint, syntax check

## Structure

* `backend/` — API, migrations 001 to 032, middleware, sockets, tests (see `backend/README.md`)
* `frontend/` — PWA app with feature folders per domain (see `frontend/README.md`)
* `.github/workflows/` — CI for backend and frontend
* `LICENSE`, `.nvmrc`, `.editorconfig`, `.prettierrc.json`, `.gitattributes`

## Prerequisites

* Node 20 or higher
* MySQL 8 with a `fitnessapp` database
* Two terminals, one for backend and one for frontend

## Setup — backend

```powershell
Copy-Item backend/.env.example backend/.env
# Edit backend/.env: set DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET
Set-Location backend
npm install
npm run db:migrate:dry
npm run db:migrate
npm run dev
```

## Setup — frontend

```powershell
Copy-Item frontend/.env.example frontend/.env
Set-Location frontend
npm install
npm run dev
```

Leave the backend terminal running while starting the frontend. The frontend
dev proxy forwards API and Socket.io traffic to the backend automatically.

## Scripts

Backend:

* `npm run dev` — watch mode for development
* `npm start` / `npm run start:prod` — production boot
* `npm run lint` — syntax check across source files
* `npm run test:unit` / `test:integration` / `test` — test suites
* `npm run db:migrate` / `db:migrate:dry` / `db:status` — apply or preview migrations
* `npm run db:create -- <slug>` — scaffold the next migration file

Frontend:

* `npm run dev` — development server with proxy
* `npm run build` / `npm run preview` — production build and local preview
* `npm run lint` — ESLint
* `npm run test:unit` / `npm test` — unit tests, with lint in full test

## Environment

Backend `.env` is required. Copy from `backend/.env.example` and set database
credentials, a long random JWT secret, allowed origins, frontend URL, mail
credentials for OTP emails, Google OAuth credentials, and AI keys for
Gemini and Groq. AI keys are optional — the app uses a static fallback without
them. Email and Google credentials are needed for verification, reset, and
Google login flows.

Frontend `.env` is optional for local development. Copy from
`frontend/.env.example` when customizing the backend target, socket target,
or Google client ID. Empty values use the dev proxy. Production static builds
need absolute backend values set before building.

Only `.env.example` files are tracked. Never commit real `.env` files.

## Testing

Backend covers activity accuracy, AI stability, plan engine, validation schemas,
migrations count and idempotency, and auth guards. Frontend covers avatar
helpers. Run the backend and frontend suites separately before pushing.

## Docs

* Backend layout, debugging, route guide, and DB commands: `backend/README.md`
* Migration rules and history: `backend/docs/MIGRATIONS.md`
* Frontend architecture and conventions: `frontend/README.md` and `frontend/docs/architecture.md`

## License

MIT — see `LICENSE`.
