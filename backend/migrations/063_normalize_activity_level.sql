-- 063_normalize_activity_level.sql — repair legacy activity_level values.
--
-- The demo seed (scripts/seed-demo-data.js) wrote 'MODERATE', which is not
-- one of the accepted keys. Changing a goal carries the stored value forward,
-- so those accounts got "Please choose a valid activity level." on every
-- goal change. Map short/legacy names to the current keys.
--
-- Idempotent: rows already holding a valid key are untouched.

UPDATE `fitness_goals` SET `activity_level` = 'LIGHTLY_ACTIVE'    WHERE UPPER(`activity_level`) IN ('LIGHT', 'LIGHTLY ACTIVE');
UPDATE `fitness_goals` SET `activity_level` = 'MODERATELY_ACTIVE' WHERE UPPER(`activity_level`) IN ('MODERATE', 'MODERATELY ACTIVE');
UPDATE `fitness_goals` SET `activity_level` = 'VERY_ACTIVE'       WHERE UPPER(`activity_level`) IN ('ACTIVE', 'VERY', 'VERY ACTIVE');
UPDATE `fitness_goals` SET `activity_level` = 'HIGHLY_ACTIVE'     WHERE UPPER(`activity_level`) IN ('HIGH', 'HIGHLY ACTIVE', 'EXTRA_ACTIVE', 'EXTREMELY_ACTIVE');
