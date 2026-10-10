# Seeds — Vitalis

Reference dumps for bootstrapping a local database. Day-to-day schema
changes live in `backend/migrations/` (001–032); runtime demo rows are
inserted by `migrations/030_seeds.sql`, not by these files.

## Files

- `plans_full.sql` — canonical reference seed (dead tables stripped). Use
  for fresh local builds.
- `fitnessapp.sql` — legacy full dump, kept for history. Do not use for
  new DBs.

## How to run (fresh local DB)

```powershell
# 1. Create an empty database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS fitnessapp CHARACTER SET utf8mb4;"

# 2. Import the canonical seed
mysql -u root fitnessapp < backend/src/db/seeds/plans_full.sql

# 3. Apply migrations (brings schema to 032 + runtime seeds)
Set-Location backend
npm run db:migrate
```

Both files are re-runnable: `CREATE TABLE IF NOT EXISTS`, keys declared
inline, `INSERT IGNORE`. Re-importing skips existing tables/rows instead
of failing. (No live-MySQL verification in CI — reviewed structurally:
key counts preserved, parens balanced. Re-verify against MySQL 8 if the
dumps are ever regenerated.)
