# Vitalis Backend

## Layout
```
backend/
├── server.js                # thin entry (calls src/app.js)
├── migrations/              # 001..032 *.sql (001_users … 029_workout_logs + 030_seeds + 031_landing_visits + 032_personal_plans) — idempotent, tracked in _migrations
├── src/
│   ├── app.js               # Express factory (helmet/cors/rateLimit/routes/errorHandler)
│   ├── config/              # env, db, cors, gemini, mailer, jwt
│   ├── constants/           # foodAnalysisPrompt (AI vision prompt)
│   ├── controllers/         # thin handlers (community, settings, activity, …)
│   ├── middleware/          # verifyUser, errorHandler, validate (Zod), requestLogger, rateLimits, aiQuota
│   ├── routes/              # mounted routes + index.js (central registry)
│   ├── services/            # activity.service (only shared service; controllers own DB logic)
│   ├── sockets/             # socketHandler (verified JWT room)
│   ├── utils/               # errors/AppError, cookies (COOKIE_NAME), owner (IDOR guard), ids, asyncHandler
│   └── db/                  # migrate.js, create-migration.js, seeds/
├── .env / .env.example      # .env is gitignored via root /.gitignore — never commit secrets
├── package.json
├── tests/                   # unit/ (schemas, migrations) + integration/ (health, auth guards)
└── docs/MIGRATIONS.md       # migration guide + Community/Settings API table
```

## Debugging (easy)
```bash
npm run dev                  # → [http] OK GET /api/health -> 200 7ms (requestLogger)
curl http://localhost:3000/api/health    # {ok:true}
curl http://localhost:3000/api/_routes   # lists all mounts (src/routes/index.js)
DEBUG=1 npm run dev          # force logs in prod
```

* `src/middleware/requestLogger.js:1` — one line per request (method path → status ms + uid)
* `src/routes/index.js:1` — if 404, check mount here first (single file, not scattered in server.js)
* `src/middleware/errorHandler.js:1` + `src/utils/errors.js:1` AppError — no internal leak
* Startup warns if `TZ!=UTC` (quotas use `UTC_DATE()`) — set `TZ=UTC` in prod. `IP_HASH_SALT` optionally separates landing-visit hashing from `JWT_SECRET` (falls back for old hashes).

## Adding a Route
1. `src/routes/myFeature.js` → `router.get('/my-path', verifyUser, ...)`
2. Register in `src/routes/index.js:1` → `app.use('/api/my-feature', myFeatureRoutes)`
3. `GET /api/_routes` to verify.

## DB
```bash
npm run db:migrate:dry   # preview (reads backend/migrations/)
npm run db:migrate       # apply
npm run db:create -- add-phone  # creates migrations/032_*.sql
npm test                 # unit (Zod schemas, migrations) + integration (health, 401 guards)
```
