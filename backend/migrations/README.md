# Migrations — Vitalis (one table per file)

31 canonical files: `001_users.sql` … `029_workout_logs.sql` + `030_seeds.sql` + `031_landing_visits.sql` + `032_personal_plans.sql`.
Each table file is self-contained (`SET FOREIGN_KEY_CHECKS=0/1` + single
`CREATE TABLE IF NOT EXISTS`). Seeds use `INSERT IGNORE`.
Runner `src/db/migrate.js` applies pending `*.sql` in lexicographic order,
tracked in `_migrations`. Next migration: `033_<slug>.sql`
(`npm run db:create -- <slug>`).

## History

- Pre-2026-09-25: 28-file evolving history (`001-034` + gaps), squashed into a
  single `001_baseline.sql` (live schema dump).
- 2026-09-25: baseline split byte-identical into 29 per-table files + seeds
  (parents first: users → plans → contents → exercises, then alphabetical).
  Original baseline retired after scratch-DB verification.
- Full pre-squash backup: `backups/pre-squash-2026-09-25.sql`.
- Live databases keep old `_migrations` rows (`001-034` era + `001_baseline.sql`)
  as inert history — the runner only looks at files on disk. Fresh databases
  apply the 31 files to the identical schema.

## Rules

- Table files use `CREATE TABLE IF NOT EXISTS`; new migrations use plain `ALTER`.
- Seeds must use `INSERT IGNORE` (runner does NOT ignore `1062`).
- Never renumber files or edit an applied file — add a new numbered file.
