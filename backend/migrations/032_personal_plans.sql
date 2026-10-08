-- 032_personal_plans.sql — personal user plans (idempotent ALTER migration)
-- Runner ignores duplicate errors (1060,1061,1091,1826,1830,1832). Use plain ALTER.
-- NULL owner_user_id + is_template=1 = marketplace template (existing rows).
-- Set owner_user_id + is_template=0 = user-owned personal plan.

SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE `plans` ADD COLUMN `owner_user_id` int(11) DEFAULT NULL;
ALTER TABLE `plans` ADD COLUMN `is_template` tinyint(1) DEFAULT 1;
ALTER TABLE `plans` ADD INDEX `idx_owner` (`owner_user_id`);
ALTER TABLE `plans` ADD CONSTRAINT `plans_ibfk_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `fitness_goals` ADD COLUMN `source_plan_id` int(11) DEFAULT NULL;
ALTER TABLE `fitness_goals` ADD INDEX `idx_source_plan` (`source_plan_id`);
ALTER TABLE `fitness_goals` ADD CONSTRAINT `fitness_goals_ibfk_plan` FOREIGN KEY (`source_plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL;

UPDATE `plans` SET `is_template` = 1 WHERE `owner_user_id` IS NULL;

SET FOREIGN_KEY_CHECKS=1;
