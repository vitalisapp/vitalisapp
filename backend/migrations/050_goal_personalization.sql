-- 050_goal_personalization.sql — Section 3: multiple goals, target date,
-- experience level, workout exclusions and goal-specific generated plans.
--
-- fitness_goals
--   secondary_goals   comma list of up to 2 extra GOAL_TYPES (the primary
--                     goal_type still sets calories; extras shape training
--                     and each gets its own generated plan).
--   target_date       user-chosen target completion date.
--   experience_level  BEGINNER | INTERMEDIATE | ADVANCED (recommender input).
-- training_preferences
--   excluded_categories  JSON array of exclusion keys (HIGH_IMPACT, RUNNING…).
--   excluded_exercises   JSON array of exercise names (do-not-recommend list).
-- plans
--   goal_type   which goal a generated plan serves (NULL for custom plans).
--   rationale   JSON array of plain-language "why this plan" lines.
--
-- Idempotent: the runner ignores 1060 (duplicate column).

ALTER TABLE `fitness_goals` ADD COLUMN `secondary_goals` varchar(80) DEFAULT NULL AFTER `goal_type`;
ALTER TABLE `fitness_goals` ADD COLUMN `target_date` date DEFAULT NULL AFTER `target_weight_kg`;
ALTER TABLE `fitness_goals` ADD COLUMN `experience_level` varchar(16) DEFAULT NULL AFTER `activity_level`;

ALTER TABLE `training_preferences` ADD COLUMN `excluded_categories` json DEFAULT NULL;
ALTER TABLE `training_preferences` ADD COLUMN `excluded_exercises` json DEFAULT NULL;

ALTER TABLE `plans` ADD COLUMN `goal_type` varchar(32) DEFAULT NULL;
ALTER TABLE `plans` ADD COLUMN `rationale` text DEFAULT NULL;
