# Vitalis

Fitness tracking with AI coaching — workout logging, nutrition and food scanning,
plans, community, messaging, and analytics in one monorepo.

## Features

* Auth with email verification, password reset OTP, Google OAuth, session revocation
* Dashboard, goals, activity and workout logs
* Meal tracker with camera food scan and macro coaching
* Camera workout with pose tracking and rep counting
* Activity map with GPS routes, community posts, kudos, comments
* Personal plans, onboarding, analytics, notifications, preferences
* AI coach and insights with daily quota, model fallback, and cache

## Stack

* Backend: Express 5, MySQL 8, Socket.io, Zod, JWT cookies, Nodemailer
* Frontend: Vite 8, React 19, React Router 7, Tailwind 4, PWA, MapLibre GL (OpenFreeMap), Chart.js
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

### Backend (Jest + Supertest)

The backend has a permanent, isolated test harness. Jest is the primary
runner; Supertest drives the real Express app through `createApp()` (no public
listener), against MySQL and the real business logic. The earlier `node:test`
suites are preserved and run alongside Jest by the orchestrator.

**Safety is fail-closed.** Before any app module loads, every Jest run and
every orchestrated child process sets `NODE_ENV=test` and requires `DB_NAME`
(or `DB_TEST_NAME`) to match `*_test` — default `fitnessapp_test`. The dev
`fitnessapp` database is never used for destructive test writes.

One-time test database setup (from `backend/`; `.env` supplies DB credentials):

```powershell
node scripts/ensure-test-db.js
$env:NODE_ENV = "test"; $env:DB_NAME = "fitnessapp_test"; node src/db/migrate.js
```

On POSIX shells, use `NODE_ENV=test DB_NAME=fitnessapp_test node src/db/migrate.js`.
The bootstrap script only runs `CREATE DATABASE IF NOT EXISTS`; migrations are
idempotent.

Common scripts (all from `backend/`):

| Script | What it runs |
| --- | --- |
| `npm test` | Everything: all Jest suites + all legacy `node:test` suites |
| `npm run test:api` | All Jest/Supertest API suites |
| `npm run test:auth` | Auth HTTP flows + token-revocation regression |
| `npm run test:authorization` | Admin/member roles, ownership, IDOR guards |
| `npm run test:security` | Headers, CORS/CSRF, injection, error leakage |
| `npm run test:db` | Constraints, cascades, transactions, API persistence |
| `npm run test:unit` / `test:integration` | Unit / integration groups (both runners) |
| `npm run test:smoke` | Public health/version/routes + legacy health check |
| `npm run test:coverage` | Full run with Jest coverage in `coverage/` |
| `npm run test:watch` / `test:failed` / `test:debug` | Watch, retry failures, debugger |
| `npm run test:list` | Show files a run would execute (no execution) |
| `npm run test:endpoints:generate` / `:check` | Rebuild / verify the endpoint manifest |

Pass a file/module filter or a test-name pattern after `--`:

```powershell
npm test -- auth --name logout
npm run test:api -- community
npm run test:db -- --list
```

The endpoint manifest at `tests/jest/fixtures/endpoints.json` tracks all 177
registered routes (including mount-level role gates). `test:endpoints:check`
fails when a new route is added without regenerating it.

External providers (email, SMS, AI) are stubbed. No network calls, real mail,
paid SMS credits, or scheduler jobs occur during tests. Role gates are
self-sufficient: `requireMember` and `requireAdmin` authenticate the cookie
session themselves when mounted before a router's `verifyUser`, then reuse the
already-loaded `req.user` when mounted after it. The authorization suite
regresses both admin rejection and member access on a member-only endpoint.

### Frontend

Frontend covers avatar helpers. Run the backend and frontend suites separately
before pushing.

## Docs

* Backend layout, debugging, route guide, and DB commands: `backend/README.md`
* Migration rules and history: `backend/docs/MIGRATIONS.md`
* Frontend architecture and conventions: `frontend/README.md` and `frontend/docs/architecture.md`

## License

MIT — see `LICENSE`.
