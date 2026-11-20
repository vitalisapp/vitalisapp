-- 047_remove_sleep_recovery.sql — sleep, water and recovery tracking removed.
--   sleep_logs       — sleep duration/quality, recovery score and water intake
--                      (POST/GET /api/sleep/* and dashboard water are gone).
--   daily_checkins   — daily recovery check-in (sleep, stress, soreness,
--                      energy) that fed the Readiness score; /api/checkins and
--                      /api/stats/readiness are gone.
--   fitness_goals    — onboarding sleep_hours / sleep_quality / stress_level /
--                      recovery_level (exercise_freq stays).
--   ai_insight_cache — sleep_suggestion; the dashboard AI insight is now
--                      activity-only.
--
-- DESTRUCTIVE: the dropped rows/columns are not recoverable from the schema.
-- Idempotent: DROP TABLE IF EXISTS, and each column drop is its own statement
-- so the runner's ignored 1091 ("can't drop; check that it exists") lets a
-- re-run or a partially-migrated database finish cleanly.
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `sleep_logs`;

DROP TABLE IF EXISTS `daily_checkins`;

ALTER TABLE `fitness_goals` DROP COLUMN `sleep_hours`;

ALTER TABLE `fitness_goals` DROP COLUMN `sleep_quality`;

ALTER TABLE `fitness_goals` DROP COLUMN `stress_level`;

ALTER TABLE `fitness_goals` DROP COLUMN `recovery_level`;

ALTER TABLE `ai_insight_cache` DROP COLUMN `sleep_suggestion`;

SET FOREIGN_KEY_CHECKS=1;
