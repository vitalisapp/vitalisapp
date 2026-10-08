# Database Migrations — Vitalis (ALTER-based)

All migrations are **idempotent** and tracked in `_migrations`. The runner applies
pending `*.sql` files in lexicographic order and ignores duplicate-object errors.
Note: MySQL implicit-commits DDL, so `CREATE TABLE` is not truly transactional —
each file commits per statement; re-running converges (duplicates are skipped).

## Layout

```
backend/
├── migrations/              # canonical — 31 files, one table each (001-029) + 030_seeds + 031_landing_visits
│   ├── 001_users.sql        # parents first (users → plans → contents → exercises…)
│   ├── 002_plans.sql … 029_workout_logs.sql  # then alphabetical, each self-contained
│   ├── 030_seeds.sql        # plan seeds (INSERT IGNORE)
│   ├── 031_landing_visits.sql
│   └── README.md            # layout + history + rules
├── src/db/
│   ├── migrate.js           # runner: CREATE TABLE IF NOT EXISTS + duplicate-ignore
│   ├── create-migration.js  # helper: npm run db:create -- <name> (next: 032_*)
│   └── seeds/plans_full.sql # reference seed (dead tables stripped)
└── docs/MIGRATIONS.md       # this file
```
Per-table note (2026-09-25): the `001_baseline.sql` squash was split
byte-identical into 29 per-table files + `030_seeds.sql` (parents first, then
alphabetical; each file wraps `FOREIGN_KEY_CHECKS=0/1`). Verified on scratch
DB `fitnessapp_split_test` (30 tables + 6 seeded plans, fresh build OK).
Live DBs keep old `_migrations` rows as inert history — harmless, runner only
reads files on disk. Fresh DBs apply the 31 files.
Never edit an applied file — add `032_*`
and up (`npm run db:create -- <name>`).

## Known drift (resolved — do not re-introduce)

- Pre-squash file originals were retired after verification. Historic cleanup
  context (former orphan-legacy cleanup, already applied) dropped orphan
  `email_verification_tokens`, `fitness_goals_history`, `weight_logs`, stray
  `users.email_verified`/`profile_complete` + `daily_checkins.readiness_score`
  columns (all verified unreferenced).

## Running

```bash
cd backend
npm run db:migrate:dry   # preview pending
npm run db:migrate       # apply pending (per file, records _migrations)
npm run db:create -- add-phone-column   # creates 032_add-phone-column.sql (next free number)
```

Runner options: `--dry-run` (preview), `--verbose` (log each statement).

## Writing a New ALTER

Create file: `npm run db:create -- add-avatar-index`

Then edit the generated `032_add-avatar-index.sql`:

```sql
-- 032_add-avatar-index.sql (idempotent — runner ignores duplicates)
ALTER TABLE `users` ADD COLUMN `phone` varchar(20) DEFAULT NULL;
ALTER TABLE `users` ADD KEY `idx_phone` (`phone`);
-- ALTER TABLE `users` MODIFY COLUMN `name` varchar(150) NOT NULL;
-- ALTER TABLE `users` DROP COLUMN `phone`;
-- ALTER TABLE `users` DROP INDEX `idx_phone`;
```

Rules:
- Use plain `ALTER` (no `IF NOT EXISTS` needed — MySQL 8 rejects it on ADD COLUMN). Runner ignores `1050/1060/1061/1091/1146/1553/1826/1830/1832` (already-exists). `1062 Duplicate entry` is NOT ignored — seeds must use `INSERT IGNORE`.
- One action per statement so partial states converge on re-run.
- Keep each migration focused (one ALTER theme per file).
- Never edit an already-applied migration to change live behavior — add a new numbered file (history is in `_migrations`).
- Pre-squash legacy drift (folded into the baseline): dropped orphan `email_verification_tokens`, `fitness_goals_history`, `weight_logs`, stray `users.email_verified`/`profile_complete` + `daily_checkins.readiness_score` columns (all verified unreferenced). Real `_migrations` history is never touched.

## Fresh DB vs Existing DB

| Scenario | What happens |
|---|---|
| **Fresh** (no tables) | 31 files create all 30 tables + seeds in order |
| **Existing** (pre-split DB) | all tables exist → `CREATE`s silent no-ops, seeds `INSERT IGNORE` skip; 31 `_migrations` rows added |

## Verification

```bash
npm run db:migrate:dry   # or: node src/db/migrate.js --dry-run
mysql -u root fitnessapp -e "SELECT name, applied_at FROM _migrations ORDER BY id"
mysql -u root fitnessapp -e "SHOW INDEX FROM users"
mysql -u root fitnessapp -e "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA='fitnessapp'"
```

## Frontend

Frontend never runs migrations. API base URL comes from `frontend/src/app/config/env.js`
(`API_BASE_URL` / `SOCKET_URL`) and all calls go through `frontend/src/lib/apiClient.js`.
See `frontend/docs/architecture.md`.

## Community + Settings endpoints (in baseline)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/community?limit=20&offset=0` | — | `{posts:[{id,user_id,author_name,text,tag,created_at,likes,comments,liked_by_me}]}` |
| POST | `/api/community` | `{text≤1000, tag∈General/Training/Nutrition/Recovery}` | `201 {success,post}` |
| POST | `/api/community/:id/like` | — (idempotent) | `{success,liked:true,likes}` |
| DELETE | `/api/community/:id/like` | — | `{success,liked:false,likes}` |
| GET | `/api/community/:id/comments` | — | `{comments:[]}` (404 if post missing) |
| POST | `/api/community/:id/comments` | `{text≤500}` | `201 {success,comment}` |
| DELETE | `/api/community/:id` | — (owner only) | `{success:true}` |
| GET | `/api/settings` | — | `{settings:{units,step_goal,theme}}` (defaults when empty) |
| PUT | `/api/settings` | `{units?,step_goal 1000-30000?,theme?}` (≥1 required) | `{success,settings}` |

All require the `vitalis_session` cookie (`verifyUser`). Validation is Zod
(`validate()` in routes); abuse guards are `express-rate-limit` per route.
Rollout: `npm run db:migrate:dry` → `npm run db:migrate` (baseline is
additive-safe — existing DBs converge with `↷ Ignored`, fresh DBs build fully).
