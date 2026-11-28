-- database.sql - Vitalis full schema + seed data
-- Generated for a clean XAMPP (MariaDB 10.4) / MySQL 8 phpMyAdmin import.
--
-- Source of truth: backend/migrations/001..065 (64 files).
-- Built by applying every migration to an EMPTY database and exporting it,
-- so this file holds the schema plus seed data and no real user records.
-- Dataset: Clean: plans, food catalog and default admin account.
-- Non-destructive: nothing is dropped. Existing tables and rows are kept.
-- Rebuild: npm run db:sql (from backend/).
-- Regenerated: 2026-11-28.
--
-- What this does:
--   1. Creates database `fitnessapp` and selects it.
--   2. Creates each of the 44 application tables + `_migrations` only if
--      it does not exist yet (CREATE TABLE IF NOT EXISTS).
--   3. Loads seed rows with INSERT IGNORE: a row whose id/unique key already
--      exists is skipped, so existing data is never overwritten.
--   4. Fills `_migrations` ONLY when it is empty (fresh install). On an
--      existing database its history is left alone, so afterwards run
--      `npm run db:migrate` to add any columns/tables that copy is missing.
--
-- Default admin (from 040_admin_seed.sql): admin@gmail.com / 12345678.
-- Change that password after the first sign-in.
--
-- Safe to paste straight into the phpMyAdmin "Import" tab or the SQL tab.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_MODE = @@SQL_MODE;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

CREATE DATABASE IF NOT EXISTS `fitnessapp`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fitnessapp`;

-- --------------------------------------------------------
-- Table `_migrations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `_migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `applied_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `_migrations` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `_migrations` ADD COLUMN `name` varchar(255) NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = '_migrations' AND column_name = 'name');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `_migrations` ADD COLUMN `applied_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = '_migrations' AND column_name = 'applied_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

SET @vitalis_fresh = (SELECT COUNT(*) = 0 FROM `_migrations`);
INSERT IGNORE INTO `_migrations` (`name`, `applied_at`)
SELECT m.name, m.applied_at FROM (
  SELECT '001_users.sql' AS name, '2026-11-28 15:38:26' AS applied_at
  UNION ALL SELECT '002_plans.sql' AS name, '2026-11-28 15:38:26' AS applied_at
  UNION ALL SELECT '003_plan_contents.sql' AS name, '2026-11-28 15:38:26' AS applied_at
  UNION ALL SELECT '004_plan_exercises.sql' AS name, '2026-11-28 15:38:26' AS applied_at
  UNION ALL SELECT '005_activity_logs.sql' AS name, '2026-11-28 15:38:26' AS applied_at
  UNION ALL SELECT '006_activity_kudos.sql' AS name, '2026-11-28 15:38:26' AS applied_at
  UNION ALL SELECT '007_ai_daily_usage.sql' AS name, '2026-11-28 15:38:27' AS applied_at
  UNION ALL SELECT '008_ai_insight_cache.sql' AS name, '2026-11-28 15:38:27' AS applied_at
  UNION ALL SELECT '009_bmi_records.sql' AS name, '2026-11-28 15:38:27' AS applied_at
  UNION ALL SELECT '010_community_posts.sql' AS name, '2026-11-28 15:38:27' AS applied_at
  UNION ALL SELECT '011_community_likes.sql' AS name, '2026-11-28 15:38:27' AS applied_at
  UNION ALL SELECT '012_community_comments.sql' AS name, '2026-11-28 15:38:27' AS applied_at
  UNION ALL SELECT '013_daily_checkins.sql' AS name, '2026-11-28 15:38:27' AS applied_at
  UNION ALL SELECT '014_daily_stats.sql' AS name, '2026-11-28 15:38:27' AS applied_at
  UNION ALL SELECT '015_email_verifications.sql' AS name, '2026-11-28 15:38:27' AS applied_at
  UNION ALL SELECT '016_fitness_goals.sql' AS name, '2026-11-28 15:38:27' AS applied_at
  UNION ALL SELECT '017_food_logs.sql' AS name, '2026-11-28 15:38:27' AS applied_at
  UNION ALL SELECT '018_friendships.sql' AS name, '2026-11-28 15:38:28' AS applied_at
  UNION ALL SELECT '019_messages.sql' AS name, '2026-11-28 15:38:28' AS applied_at
  UNION ALL SELECT '020_notifications.sql' AS name, '2026-11-28 15:38:28' AS applied_at
  UNION ALL SELECT '021_password_reset_otps.sql' AS name, '2026-11-28 15:38:28' AS applied_at
  UNION ALL SELECT '022_sleep_logs.sql' AS name, '2026-11-28 15:38:28' AS applied_at
  UNION ALL SELECT '023_user_nutrient_goals.sql' AS name, '2026-11-28 15:38:28' AS applied_at
  UNION ALL SELECT '024_user_plan_progress.sql' AS name, '2026-11-28 15:38:28' AS applied_at
  UNION ALL SELECT '025_user_plans.sql' AS name, '2026-11-28 15:38:28' AS applied_at
  UNION ALL SELECT '026_user_profiles.sql' AS name, '2026-11-28 15:38:28' AS applied_at
  UNION ALL SELECT '027_user_sessions.sql' AS name, '2026-11-28 15:38:28' AS applied_at
  UNION ALL SELECT '028_user_settings.sql' AS name, '2026-11-28 15:38:28' AS applied_at
  UNION ALL SELECT '029_workout_logs.sql' AS name, '2026-11-28 15:38:29' AS applied_at
  UNION ALL SELECT '030_seeds.sql' AS name, '2026-11-28 15:38:29' AS applied_at
  UNION ALL SELECT '031_landing_visits.sql' AS name, '2026-11-28 15:38:29' AS applied_at
  UNION ALL SELECT '032_personal_plans.sql' AS name, '2026-11-28 15:38:29' AS applied_at
  UNION ALL SELECT '033_user_allergies.sql' AS name, '2026-11-28 15:38:29' AS applied_at
  UNION ALL SELECT '034_workout_sets.sql' AS name, '2026-11-28 15:38:29' AS applied_at
  UNION ALL SELECT '035_training_preferences.sql' AS name, '2026-11-28 15:38:29' AS applied_at
  UNION ALL SELECT '036_account_governance.sql' AS name, '2026-11-28 15:38:30' AS applied_at
  UNION ALL SELECT '037_meal_type_food_catalog.sql' AS name, '2026-11-28 15:38:30' AS applied_at
  UNION ALL SELECT '038_progress_module.sql' AS name, '2026-11-28 15:38:30' AS applied_at
  UNION ALL SELECT '039_admin_audit.sql' AS name, '2026-11-28 15:38:30' AS applied_at
  UNION ALL SELECT '040_admin_seed.sql' AS name, '2026-11-28 15:38:30' AS applied_at
  UNION ALL SELECT '041_goal_recalibration.sql' AS name, '2026-11-28 15:38:30' AS applied_at
  UNION ALL SELECT '042_progress_cadence.sql' AS name, '2026-11-28 15:38:30' AS applied_at
  UNION ALL SELECT '043_food_grams.sql' AS name, '2026-11-28 15:38:30' AS applied_at
  UNION ALL SELECT '044_food_density_cache.sql' AS name, '2026-11-28 15:38:30' AS applied_at
  UNION ALL SELECT '045_email_delivery.sql' AS name, '2026-11-28 15:38:30' AS applied_at
  UNION ALL SELECT '046_phone_verifications.sql' AS name, '2026-11-28 15:38:31' AS applied_at
  UNION ALL SELECT '047_remove_sleep_recovery.sql' AS name, '2026-11-28 15:38:31' AS applied_at
  UNION ALL SELECT '048_access_groups.sql' AS name, '2026-11-28 15:38:32' AS applied_at
  UNION ALL SELECT '049_sleep_hours.sql' AS name, '2026-11-28 15:38:32' AS applied_at
  UNION ALL SELECT '050_goal_personalization.sql' AS name, '2026-11-28 15:38:33' AS applied_at
  UNION ALL SELECT '051_coach_weeks.sql' AS name, '2026-11-28 15:38:33' AS applied_at
  UNION ALL SELECT '052_smart_reminders.sql' AS name, '2026-11-28 15:38:33' AS applied_at
  UNION ALL SELECT '053_food_details.sql' AS name, '2026-11-28 15:38:34' AS applied_at
  UNION ALL SELECT '054_free_plans.sql' AS name, '2026-11-28 15:38:34' AS applied_at
  UNION ALL SELECT '055_dedupe_user_sessions.sql' AS name, '2026-11-28 15:38:34' AS applied_at
  UNION ALL SELECT '056_plan_images.sql' AS name, '2026-11-28 15:38:34' AS applied_at
  UNION ALL SELECT '058_browser_device_identity.sql' AS name, '2026-11-28 15:38:34' AS applied_at
  UNION ALL SELECT '059_workout_calories.sql' AS name, '2026-11-28 15:38:34' AS applied_at
  UNION ALL SELECT '060_password_weak_flag.sql' AS name, '2026-11-28 15:38:34' AS applied_at
  UNION ALL SELECT '061_progression.sql' AS name, '2026-11-28 15:38:35' AS applied_at
  UNION ALL SELECT '062_activity_calories.sql' AS name, '2026-11-28 15:38:35' AS applied_at
  UNION ALL SELECT '063_normalize_activity_level.sql' AS name, '2026-11-28 15:38:35' AS applied_at
  UNION ALL SELECT '064_plans_owner_fk.sql' AS name, '2026-11-28 15:38:35' AS applied_at
  UNION ALL SELECT '065_seed_original_plan_content.sql' AS name, '2026-11-28 15:38:35' AS applied_at
) m WHERE @vitalis_fresh = 1;

-- --------------------------------------------------------
-- Table `access_groups`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `access_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kind` enum('register','link') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'register',
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `scan_count` int unsigned NOT NULL DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_access_groups_code` (`code`),
  KEY `idx_access_groups_created` (`created_at`),
  KEY `access_groups_ibfk_1` (`created_by`),
  CONSTRAINT `access_groups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `access_groups` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `access_groups` ADD COLUMN `code` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'access_groups' AND column_name = 'code');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `access_groups` ADD COLUMN `label` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'access_groups' AND column_name = 'label');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `access_groups` ADD COLUMN `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'access_groups' AND column_name = 'description');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `access_groups` ADD COLUMN `kind` enum(''register'',''link'') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''register''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'access_groups' AND column_name = 'kind');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `access_groups` ADD COLUMN `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'access_groups' AND column_name = 'link_url');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `access_groups` ADD COLUMN `expires_at` datetime DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'access_groups' AND column_name = 'expires_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `access_groups` ADD COLUMN `is_active` tinyint(1) NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'access_groups' AND column_name = 'is_active');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `access_groups` ADD COLUMN `scan_count` int unsigned NOT NULL DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'access_groups' AND column_name = 'scan_count');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `access_groups` ADD COLUMN `created_by` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'access_groups' AND column_name = 'created_by');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `access_groups` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'access_groups' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `access_groups` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `access_groups` ADD CONSTRAINT `access_groups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'access_groups' AND constraint_name = 'access_groups_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `activity_kudos`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_kudos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_activity_user` (`activity_id`,`user_id`),
  KEY `idx_activity` (`activity_id`),
  KEY `fk_kudos_user` (`user_id`),
  CONSTRAINT `fk_kudos_activity` FOREIGN KEY (`activity_id`) REFERENCES `activity_logs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_kudos_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `activity_kudos` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_kudos` ADD COLUMN `activity_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_kudos' AND column_name = 'activity_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_kudos` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_kudos' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_kudos` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_kudos' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `activity_kudos` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_kudos` ADD CONSTRAINT `fk_kudos_activity` FOREIGN KEY (`activity_id`) REFERENCES `activity_logs` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'activity_kudos' AND constraint_name = 'fk_kudos_activity' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_kudos` ADD CONSTRAINT `fk_kudos_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'activity_kudos' AND constraint_name = 'fk_kudos_user' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `activity_logs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `duration` int DEFAULT NULL COMMENT 'in seconds',
  `distance` decimal(10,2) DEFAULT NULL COMMENT 'in kilometers',
  `pace` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calories` int DEFAULT NULL,
  `is_gps` tinyint(1) NOT NULL DEFAULT '1',
  `route` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `local_date` date DEFAULT NULL,
  `calories_source` enum('estimated','measured') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'estimated',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_created` (`user_id`,`created_at`),
  KEY `idx_activity_logs_user_local_date` (`user_id`,`local_date`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `activity_logs` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `duration` int DEFAULT NULL COMMENT ''in seconds''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'duration');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `distance` decimal(10,2) DEFAULT NULL COMMENT ''in kilometers''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'distance');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `pace` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'pace');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `calories` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'calories');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `is_gps` tinyint(1) NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'is_gps');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `route` longtext COLLATE utf8mb4_unicode_ci', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'route');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `local_date` date DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'local_date');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `calories_source` enum(''estimated'',''measured'') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''estimated''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'calories_source');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `activity_logs` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND constraint_name = 'activity_logs_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `admin_actions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_actions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `admin_user_id` int NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `target_user_id` int DEFAULT NULL,
  `details` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_actions_admin` (`admin_user_id`),
  KEY `idx_admin_actions_target` (`target_user_id`),
  KEY `idx_admin_actions_created` (`created_at`),
  CONSTRAINT `admin_actions_ibfk_1` FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `admin_actions_ibfk_2` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add any columns an older `admin_actions` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `admin_actions` ADD COLUMN `admin_user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'admin_actions' AND column_name = 'admin_user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `admin_actions` ADD COLUMN `action` varchar(50) COLLATE utf8mb4_general_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'admin_actions' AND column_name = 'action');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `admin_actions` ADD COLUMN `target_user_id` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'admin_actions' AND column_name = 'target_user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `admin_actions` ADD COLUMN `details` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'admin_actions' AND column_name = 'details');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `admin_actions` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'admin_actions' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `admin_actions` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `admin_actions` ADD CONSTRAINT `admin_actions_ibfk_1` FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'admin_actions' AND constraint_name = 'admin_actions_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `admin_actions` ADD CONSTRAINT `admin_actions_ibfk_2` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'admin_actions' AND constraint_name = 'admin_actions_ibfk_2' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `ai_daily_usage`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_daily_usage` (
  `user_id` int NOT NULL,
  `usage_day` date NOT NULL,
  `count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`,`usage_day`),
  CONSTRAINT `fk_ai_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `ai_daily_usage` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `ai_daily_usage` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ai_daily_usage' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `ai_daily_usage` ADD COLUMN `usage_day` date NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ai_daily_usage' AND column_name = 'usage_day');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `ai_daily_usage` ADD COLUMN `count` int NOT NULL DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ai_daily_usage' AND column_name = 'count');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `ai_daily_usage` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `ai_daily_usage` ADD CONSTRAINT `fk_ai_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'ai_daily_usage' AND constraint_name = 'fk_ai_usage_user' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `ai_insight_cache`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_insight_cache` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `data_signature` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `activity_suggestion` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ai_cache_user_sig` (`user_id`,`data_signature`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_updated_at` (`updated_at`),
  CONSTRAINT `ai_insight_cache_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `ai_insight_cache` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `ai_insight_cache` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ai_insight_cache' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `ai_insight_cache` ADD COLUMN `data_signature` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ai_insight_cache' AND column_name = 'data_signature');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `ai_insight_cache` ADD COLUMN `activity_suggestion` text COLLATE utf8mb4_unicode_ci', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ai_insight_cache' AND column_name = 'activity_suggestion');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `ai_insight_cache` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ai_insight_cache' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `ai_insight_cache` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ai_insight_cache' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `ai_insight_cache` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `ai_insight_cache` ADD CONSTRAINT `ai_insight_cache_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'ai_insight_cache' AND constraint_name = 'ai_insight_cache_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `bmi_records`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bmi_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `height_cm` decimal(5,2) DEFAULT NULL,
  `bmi` decimal(5,2) DEFAULT NULL,
  `bmi_category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recorded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_recorded_at` (`recorded_at`),
  KEY `idx_user_recorded` (`user_id`,`recorded_at`),
  CONSTRAINT `bmi_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `bmi_records` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `bmi_records` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bmi_records' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `bmi_records` ADD COLUMN `weight_kg` decimal(5,2) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bmi_records' AND column_name = 'weight_kg');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `bmi_records` ADD COLUMN `height_cm` decimal(5,2) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bmi_records' AND column_name = 'height_cm');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `bmi_records` ADD COLUMN `bmi` decimal(5,2) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bmi_records' AND column_name = 'bmi');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `bmi_records` ADD COLUMN `bmi_category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bmi_records' AND column_name = 'bmi_category');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `bmi_records` ADD COLUMN `recorded_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bmi_records' AND column_name = 'recorded_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `bmi_records` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `bmi_records` ADD CONSTRAINT `bmi_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'bmi_records' AND constraint_name = 'bmi_records_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `body_measurements`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `body_measurements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `recorded_at` date NOT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `body_fat_pct` decimal(4,1) DEFAULT NULL,
  `chest_cm` decimal(5,1) DEFAULT NULL,
  `waist_cm` decimal(5,1) DEFAULT NULL,
  `hips_cm` decimal(5,1) DEFAULT NULL,
  `arm_cm` decimal(5,1) DEFAULT NULL,
  `thigh_cm` decimal(5,1) DEFAULT NULL,
  `notes` varchar(300) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_body_meas_user_day` (`user_id`,`recorded_at`),
  KEY `idx_body_meas_user` (`user_id`),
  KEY `idx_body_meas_date` (`user_id`,`recorded_at`),
  CONSTRAINT `body_measurements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add any columns an older `body_measurements` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD COLUMN `recorded_at` date NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND column_name = 'recorded_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD COLUMN `weight_kg` decimal(5,2) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND column_name = 'weight_kg');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD COLUMN `body_fat_pct` decimal(4,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND column_name = 'body_fat_pct');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD COLUMN `chest_cm` decimal(5,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND column_name = 'chest_cm');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD COLUMN `waist_cm` decimal(5,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND column_name = 'waist_cm');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD COLUMN `hips_cm` decimal(5,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND column_name = 'hips_cm');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD COLUMN `arm_cm` decimal(5,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND column_name = 'arm_cm');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD COLUMN `thigh_cm` decimal(5,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND column_name = 'thigh_cm');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD COLUMN `notes` varchar(300) COLLATE utf8mb4_general_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND column_name = 'notes');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `body_measurements` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `body_measurements` ADD CONSTRAINT `body_measurements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'body_measurements' AND constraint_name = 'body_measurements_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `coach_weeks`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coach_weeks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `week_start` date NOT NULL,
  `schedule` json NOT NULL,
  `handled` json DEFAULT NULL,
  `choice` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_coach_week` (`user_id`,`plan_id`,`week_start`),
  KEY `coach_weeks_plan_fk` (`plan_id`),
  CONSTRAINT `coach_weeks_plan_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coach_weeks_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `coach_weeks` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `coach_weeks` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'coach_weeks' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `coach_weeks` ADD COLUMN `plan_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'coach_weeks' AND column_name = 'plan_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `coach_weeks` ADD COLUMN `week_start` date NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'coach_weeks' AND column_name = 'week_start');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `coach_weeks` ADD COLUMN `schedule` json NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'coach_weeks' AND column_name = 'schedule');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `coach_weeks` ADD COLUMN `handled` json DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'coach_weeks' AND column_name = 'handled');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `coach_weeks` ADD COLUMN `choice` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'coach_weeks' AND column_name = 'choice');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `coach_weeks` ADD COLUMN `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'coach_weeks' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `coach_weeks` ADD COLUMN `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'coach_weeks' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `coach_weeks` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `coach_weeks` ADD CONSTRAINT `coach_weeks_plan_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'coach_weeks' AND constraint_name = 'coach_weeks_plan_fk' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `coach_weeks` ADD CONSTRAINT `coach_weeks_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'coach_weeks' AND constraint_name = 'coach_weeks_user_fk' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `community_comments`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `community_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `author_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_created` (`post_id`,`created_at`),
  KEY `fk_community_comments_user` (`user_id`),
  KEY `idx_post_user_created` (`post_id`,`user_id`,`created_at`),
  CONSTRAINT `fk_community_comments_post` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_community_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `community_comments` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_comments` ADD COLUMN `post_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_comments' AND column_name = 'post_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_comments` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_comments' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_comments` ADD COLUMN `author_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_comments' AND column_name = 'author_name');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_comments` ADD COLUMN `text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_comments' AND column_name = 'text');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_comments` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_comments' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `community_comments` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_comments` ADD CONSTRAINT `fk_community_comments_post` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'community_comments' AND constraint_name = 'fk_community_comments_post' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_comments` ADD CONSTRAINT `fk_community_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'community_comments' AND constraint_name = 'fk_community_comments_user' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `community_likes`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `community_likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_post_user` (`post_id`,`user_id`),
  KEY `idx_post` (`post_id`),
  KEY `fk_community_likes_user` (`user_id`),
  CONSTRAINT `fk_community_likes_post` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_community_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `community_likes` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_likes` ADD COLUMN `post_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_likes' AND column_name = 'post_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_likes` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_likes' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_likes` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_likes' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `community_likes` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_likes` ADD CONSTRAINT `fk_community_likes_post` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'community_likes' AND constraint_name = 'fk_community_likes_post' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_likes` ADD CONSTRAINT `fk_community_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'community_likes' AND constraint_name = 'fk_community_likes_user' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `community_posts`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `community_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `author_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'General',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created` (`created_at`),
  KEY `idx_user_created` (`user_id`,`created_at`),
  KEY `idx_tag_created` (`tag`,`created_at`),
  CONSTRAINT `fk_community_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `community_posts` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_posts` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_posts' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_posts` ADD COLUMN `author_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_posts' AND column_name = 'author_name');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_posts` ADD COLUMN `text` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_posts' AND column_name = 'text');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_posts` ADD COLUMN `tag` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''General''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_posts' AND column_name = 'tag');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_posts` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_posts' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_posts` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'community_posts' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `community_posts` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `community_posts` ADD CONSTRAINT `fk_community_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'community_posts' AND constraint_name = 'fk_community_posts_user' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `daily_stats`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `daily_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `stat_date` date NOT NULL,
  `calories_burned` int DEFAULT '0',
  `steps` int DEFAULT '0',
  `workout_duration_mins` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`,`stat_date`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_stat_date` (`stat_date`),
  KEY `idx_user_date` (`user_id`,`stat_date`),
  CONSTRAINT `daily_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `daily_stats` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `daily_stats` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'daily_stats' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `daily_stats` ADD COLUMN `stat_date` date NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'daily_stats' AND column_name = 'stat_date');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `daily_stats` ADD COLUMN `calories_burned` int DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'daily_stats' AND column_name = 'calories_burned');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `daily_stats` ADD COLUMN `steps` int DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'daily_stats' AND column_name = 'steps');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `daily_stats` ADD COLUMN `workout_duration_mins` int DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'daily_stats' AND column_name = 'workout_duration_mins');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `daily_stats` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'daily_stats' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `daily_stats` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'daily_stats' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `daily_stats` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `daily_stats` ADD CONSTRAINT `daily_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'daily_stats' AND constraint_name = 'daily_stats_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `email_delivery_events`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `email_delivery_events` (
  `message_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `email_delivery_events` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `email_delivery_events` ADD COLUMN `message_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'email_delivery_events' AND column_name = 'message_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `email_delivery_events` ADD COLUMN `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'email_delivery_events' AND column_name = 'status');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `email_delivery_events` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'email_delivery_events' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `email_verifications`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_used_expires` (`user_id`,`used`,`expires_at`),
  CONSTRAINT `email_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `email_verifications` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `email_verifications` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'email_verifications' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `email_verifications` ADD COLUMN `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'email_verifications' AND column_name = 'token_hash');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `email_verifications` ADD COLUMN `expires_at` datetime NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'email_verifications' AND column_name = 'expires_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `email_verifications` ADD COLUMN `used` tinyint(1) DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'email_verifications' AND column_name = 'used');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `email_verifications` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'email_verifications' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `email_verifications` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `email_verifications` ADD CONSTRAINT `email_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'email_verifications' AND constraint_name = 'email_verifications_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `fitness_goals`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fitness_goals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `dob` date DEFAULT NULL,
  `sex` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `height_cm` decimal(5,1) DEFAULT NULL,
  `weight_kg` decimal(5,1) DEFAULT NULL,
  `bmi` decimal(4,1) DEFAULT NULL,
  `goal_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MAINTAIN_WEIGHT',
  `secondary_goals` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_weight_kg` decimal(5,1) DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  `pace` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `focus` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activity_level` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_level` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exercise_freq` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sleep_hours` decimal(3,1) DEFAULT NULL,
  `daily_kcal` int DEFAULT NULL,
  `protein_g` int DEFAULT NULL,
  `carbs_g` int DEFAULT NULL,
  `fat_g` int DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `source_plan_id` int DEFAULT NULL,
  `calibrated_weight_kg` double DEFAULT NULL,
  `calibrated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_source_plan` (`source_plan_id`),
  CONSTRAINT `fitness_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fitness_goals_ibfk_plan` FOREIGN KEY (`source_plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `fitness_goals` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `dob` date DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'dob');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `sex` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'sex');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `height_cm` decimal(5,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'height_cm');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `weight_kg` decimal(5,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'weight_kg');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `bmi` decimal(4,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'bmi');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `goal_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''MAINTAIN_WEIGHT''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'goal_type');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `secondary_goals` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'secondary_goals');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `target_weight_kg` decimal(5,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'target_weight_kg');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `target_date` date DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'target_date');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `pace` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'pace');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `focus` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'focus');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `activity_level` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'activity_level');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `experience_level` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'experience_level');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `exercise_freq` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'exercise_freq');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `sleep_hours` decimal(3,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'sleep_hours');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `daily_kcal` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'daily_kcal');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `protein_g` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'protein_g');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `carbs_g` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'carbs_g');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `fat_g` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'fat_g');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''active''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'status');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `source_plan_id` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'source_plan_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `calibrated_weight_kg` double DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'calibrated_weight_kg');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD COLUMN `calibrated_at` datetime DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND column_name = 'calibrated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `fitness_goals` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD CONSTRAINT `fitness_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND constraint_name = 'fitness_goals_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `fitness_goals` ADD CONSTRAINT `fitness_goals_ibfk_plan` FOREIGN KEY (`source_plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'fitness_goals' AND constraint_name = 'fitness_goals_ibfk_plan' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `food_catalog`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `food_catalog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `serving_label` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `serving_grams` decimal(7,1) DEFAULT NULL,
  `calories` int DEFAULT '0',
  `protein` decimal(10,2) DEFAULT '0.00',
  `carbs` decimal(10,2) DEFAULT '0.00',
  `fat` decimal(10,2) DEFAULT '0.00',
  `sugar` decimal(10,2) DEFAULT NULL,
  `sodium` decimal(10,1) DEFAULT NULL,
  `category` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `prep_method` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` varchar(400) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image_credit` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image_link` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image_checked_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_food_catalog_name` (`name`),
  KEY `idx_food_catalog_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add any columns an older `food_catalog` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `name` varchar(120) COLLATE utf8mb4_general_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'name');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `serving_label` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'serving_label');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `serving_grams` decimal(7,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'serving_grams');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `calories` int DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'calories');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `protein` decimal(10,2) DEFAULT ''0.00''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'protein');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `carbs` decimal(10,2) DEFAULT ''0.00''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'carbs');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `fat` decimal(10,2) DEFAULT ''0.00''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'fat');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `sugar` decimal(10,2) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'sugar');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `sodium` decimal(10,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'sodium');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `category` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'category');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `prep_method` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'prep_method');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `description` varchar(400) COLLATE utf8mb4_general_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'description');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `image_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'image_url');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `image_credit` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'image_credit');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `image_link` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'image_link');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_catalog` ADD COLUMN `image_checked_at` datetime DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_catalog' AND column_name = 'image_checked_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

INSERT IGNORE INTO `food_catalog` (`id`, `name`, `serving_label`, `serving_grams`, `calories`, `protein`, `carbs`, `fat`, `sugar`, `sodium`, `category`, `prep_method`, `description`, `image_url`, `image_credit`, `image_link`, `image_checked_at`) VALUES
(1, 'Banana', '1 medium', '118.0', 105, '1.30', '27.00', '0.40', '14.40', '1.0', 'fruit', 'raw', 'Soft, sweet fruit rich in potassium. Quick energy before a workout.', NULL, NULL, NULL, NULL),
(2, 'Apple', '1 medium', '182.0', 95, '0.50', '25.00', '0.30', '19.00', '2.0', 'fruit', 'raw', 'Crisp fruit with fiber in the skin that keeps you full longer.', NULL, NULL, NULL, NULL),
(3, 'Orange', '1 medium', '131.0', 62, '1.20', '15.40', '0.20', '12.20', '0.0', 'fruit', 'raw', 'Juicy citrus fruit high in vitamin C.', NULL, NULL, NULL, NULL),
(4, 'Strawberries', '1 cup', '152.0', 53, '1.10', '12.70', '0.50', '7.40', '2.0', 'fruit', 'raw', 'Low-calorie berries rich in vitamin C and antioxidants.', NULL, NULL, NULL, NULL),
(5, 'Blueberries', '1 cup', '148.0', 84, '1.10', '21.00', '0.50', '14.70', '1.0', 'fruit', 'raw', 'Small berries packed with antioxidants.', NULL, NULL, NULL, NULL),
(6, 'Grapes', '1 cup', '151.0', 62, '0.60', '15.80', '0.30', '15.00', '2.0', 'fruit', 'raw', 'Sweet, hydrating fruit. Easy to overeat, so watch the portion.', NULL, NULL, NULL, NULL),
(7, 'Mango', '1 cup', '165.0', 99, '1.40', '24.70', '0.60', '22.50', '2.0', 'fruit', 'raw', 'Sweet tropical fruit (like the Philippine carabao mango) with vitamins A and C.', NULL, NULL, NULL, NULL),
(8, 'Pineapple', '1 cup', '165.0', 82, '0.90', '21.60', '0.20', '16.30', '2.0', 'fruit', 'raw', 'Tangy tropical fruit with vitamin C and the enzyme bromelain.', NULL, NULL, NULL, NULL),
(9, 'Watermelon', '1 cup', '152.0', 46, '0.90', '11.50', '0.20', '9.40', '2.0', 'fruit', 'raw', 'Mostly water, very light and refreshing after training.', NULL, NULL, NULL, NULL),
(10, 'Avocado', '1/2 fruit', '100.0', 161, '2.00', '8.60', '14.70', '0.70', '7.0', 'fruit', 'raw', 'Creamy fruit rich in healthy monounsaturated fat and fiber.', NULL, NULL, NULL, NULL),
(11, 'Raisins', '1/4 cup', '43.0', 108, '1.10', '29.00', '0.20', '21.00', '4.0', 'fruit', 'dried', 'Dried grapes. Concentrated natural sugar in a small handful.', NULL, NULL, NULL, NULL),
(12, 'Dates', '3 pieces', '72.0', 200, '1.80', '53.00', '0.30', '48.00', '1.0', 'fruit', 'dried', 'Very sweet dried fruit. Fast carbs, best in small amounts.', NULL, NULL, NULL, NULL),
(13, 'Boiled egg', '1 large', '50.0', 78, '6.30', '0.60', '5.30', '0.60', '62.0', 'egg', 'boiled', 'Whole egg cooked in its shell with no added oil. Complete protein.', NULL, NULL, NULL, NULL),
(14, 'Fried egg', '1 large', '50.0', 90, '6.30', '0.40', '7.00', '0.20', '95.0', 'egg', 'fried', 'Egg cooked in oil, which adds fat compared with boiled.', NULL, NULL, NULL, NULL),
(15, 'Egg white', '1 large', '33.0', 17, '3.60', '0.20', '0.10', '0.20', '55.0', 'egg', 'boiled', 'Almost pure protein with no fat.', NULL, NULL, NULL, NULL),
(16, 'Omelette (2 eggs)', '1 serving', '120.0', 200, '13.00', '2.00', '15.50', '1.00', '350.0', 'egg', 'pan_fried', 'Beaten eggs cooked in a pan with a little oil or butter.', NULL, NULL, NULL, NULL),
(17, 'Chicken breast, grilled', '100 g', '100.0', 165, '31.00', '0.00', '3.60', '0.00', '74.0', 'poultry', 'grilled', 'Lean, high-protein meat cooked without added oil.', NULL, NULL, NULL, NULL),
(18, 'Chicken thigh, roasted', '100 g', '100.0', 209, '26.00', '0.00', '10.90', '0.00', '95.0', 'poultry', 'roasted', 'Juicier dark meat with more fat than breast.', NULL, NULL, NULL, NULL),
(19, 'Chicken wings, fried', '6 pieces', '300.0', 425, '38.00', '11.00', '24.00', '0.00', '900.0', 'poultry', 'deep_fried', 'Breaded or battered wings fried in oil. High in fat and salt.', NULL, NULL, NULL, NULL),
(20, 'Beef steak, grilled', '100 g', '100.0', 271, '25.00', '0.00', '19.00', '0.00', '60.0', 'meat', 'grilled', 'Red meat high in protein, iron and zinc.', NULL, NULL, NULL, NULL),
(21, 'Ground beef, 85% lean', '100 g', '100.0', 218, '26.00', '0.00', '12.00', '0.00', '72.0', 'meat', 'pan_fried', 'Minced beef browned in a pan. Drain the fat to cut calories.', NULL, NULL, NULL, NULL),
(22, 'Pork chop, grilled', '100 g', '100.0', 231, '26.00', '0.00', '13.60', '0.00', '62.0', 'meat', 'grilled', 'Pork loin grilled without breading. Good protein.', NULL, NULL, NULL, NULL),
(23, 'Bacon', '2 slices', '24.0', 86, '5.80', '0.20', '6.70', '0.00', '370.0', 'meat', 'fried', 'Cured, salted pork belly. Small portion, lots of fat and sodium.', NULL, NULL, NULL, NULL),
(24, 'Salmon, baked', '100 g', '100.0', 208, '20.00', '0.00', '13.40', '0.00', '61.0', 'seafood', 'baked', 'Fatty fish rich in omega-3 fats and protein.', NULL, NULL, NULL, NULL),
(25, 'Tuna, canned in water', '100 g', '100.0', 116, '25.50', '0.00', '0.80', '0.00', '250.0', 'seafood', 'canned', 'Lean fish protein. Rinse it to reduce the salt.', NULL, NULL, NULL, NULL),
(26, 'Shrimp, steamed', '100 g', '100.0', 99, '24.00', '0.20', '0.30', '0.00', '220.0', 'seafood', 'steamed', 'Very lean protein cooked without oil.', NULL, NULL, NULL, NULL),
(27, 'Tilapia, cooked', '100 g', '100.0', 129, '26.00', '0.00', '2.70', '0.00', '56.0', 'seafood', 'baked', 'Mild white fish, lean and high in protein.', NULL, NULL, NULL, NULL),
(28, 'Turkey breast, sliced', '100 g', '100.0', 104, '17.00', '4.20', '1.70', '3.50', '1000.0', 'poultry', 'processed', 'Deli-style sliced turkey. Lean, but salty from curing.', NULL, NULL, NULL, NULL),
(29, 'Tofu, firm', '100 g', '100.0', 144, '17.00', '2.80', '8.70', '0.60', '14.0', 'plant_protein', 'raw', 'Soybean curd. Plant protein that takes on any flavor.', NULL, NULL, NULL, NULL),
(30, 'Tempeh', '100 g', '100.0', 192, '20.30', '7.60', '10.80', '0.00', '9.0', 'plant_protein', 'fermented', 'Fermented soybean cake with protein and fiber.', NULL, NULL, NULL, NULL),
(31, 'Lentils, cooked', '1 cup', '198.0', 230, '18.00', '40.00', '0.80', '3.60', '4.0', 'plant_protein', 'boiled', 'Legume rich in protein, fiber and iron.', NULL, NULL, NULL, NULL),
(32, 'Black beans, cooked', '1 cup', '172.0', 227, '15.20', '40.80', '0.90', '0.60', '2.0', 'plant_protein', 'boiled', 'High-fiber beans with plant protein.', NULL, NULL, NULL, NULL),
(33, 'Chickpeas, cooked', '1 cup', '164.0', 269, '14.50', '44.90', '4.20', '7.90', '11.0', 'plant_protein', 'boiled', 'Garbanzo beans with protein and slow-digesting carbs.', NULL, NULL, NULL, NULL),
(34, 'Kidney beans, cooked', '1 cup', '177.0', 225, '15.40', '40.40', '0.90', '0.60', '4.0', 'plant_protein', 'boiled', 'Hearty beans with protein and fiber.', NULL, NULL, NULL, NULL),
(35, 'Edamame', '1 cup', '155.0', 188, '18.40', '13.80', '8.10', '3.40', '9.0', 'plant_protein', 'boiled', 'Young soybeans. One of the best plant proteins.', NULL, NULL, NULL, NULL),
(36, 'Hummus', '2 tbsp', '30.0', 70, '2.00', '6.00', '5.00', '0.10', '115.0', 'plant_protein', 'blended', 'Chickpea and sesame dip with olive oil.', NULL, NULL, NULL, NULL),
(37, 'White rice, cooked', '1 cup', '158.0', 205, '4.30', '45.00', '0.40', '0.10', '2.0', 'grain', 'boiled', 'Staple carbohydrate of most Filipino meals. Watch the number of cups.', NULL, NULL, NULL, NULL),
(38, 'Brown rice, cooked', '1 cup', '195.0', 218, '5.00', '46.00', '1.60', '0.70', '10.0', 'grain', 'boiled', 'Whole-grain rice with more fiber than white rice.', NULL, NULL, NULL, NULL),
(39, 'Quinoa, cooked', '1 cup', '185.0', 222, '8.10', '39.40', '3.60', '1.60', '13.0', 'grain', 'boiled', 'Seed-like grain with complete protein and fiber.', NULL, NULL, NULL, NULL),
(40, 'Pasta, cooked', '1 cup', '140.0', 220, '8.10', '43.00', '1.30', '0.80', '1.0', 'grain', 'boiled', 'Plain boiled pasta. Calories depend mostly on the sauce.', NULL, NULL, NULL, NULL),
(41, 'Spaghetti with tomato sauce', '1 cup', '250.0', 267, '9.50', '48.00', '4.30', '8.00', '650.0', 'dish', 'simmered', 'Pasta with tomato-based sauce.', NULL, NULL, NULL, NULL),
(42, 'Mac and cheese', '1 cup', '200.0', 310, '13.00', '35.00', '12.00', '6.00', '800.0', 'dish', 'baked', 'Pasta in cheese sauce. Rich in fat and sodium.', NULL, NULL, NULL, NULL),
(43, 'Ramen, instant', '1 pack', '380.0', 380, '8.00', '52.00', '15.00', '2.00', '1700.0', 'noodles', 'boiled', 'Fried instant noodles with a seasoning packet. Very high in sodium. Use half the packet.', NULL, NULL, NULL, NULL),
(44, 'Bread, white', '1 slice', '28.0', 79, '2.70', '15.00', '1.00', '1.40', '150.0', 'bread', 'baked', 'Refined-flour bread. Digests quickly.', NULL, NULL, NULL, NULL),
(45, 'Bread, whole wheat', '1 slice', '32.0', 81, '4.00', '14.00', '1.10', '1.40', '140.0', 'bread', 'baked', 'Whole-grain bread with more fiber.', NULL, NULL, NULL, NULL),
(46, 'Bagel, plain', '1 medium', '105.0', 289, '11.00', '56.00', '1.70', '5.00', '450.0', 'bread', 'baked', 'Dense bread ring. About the carbs of 3 to 4 slices of bread.', NULL, NULL, NULL, NULL),
(47, 'Croissant', '1 medium', '57.0', 231, '4.70', '26.00', '12.00', '6.00', '270.0', 'bread', 'baked', 'Buttery, flaky pastry. High in saturated fat.', NULL, NULL, NULL, NULL),
(48, 'Tortilla, flour', '1 medium', '49.0', 146, '4.00', '25.00', '3.50', '1.50', '330.0', 'bread', 'baked', 'Flat wheat wrap used for burritos and tacos.', NULL, NULL, NULL, NULL),
(49, 'Pancakes', '2 medium', '150.0', 175, '5.00', '22.00', '7.00', '6.00', '400.0', 'breakfast', 'pan_fried', 'Batter cakes cooked on a griddle. Syrup adds a lot of sugar.', NULL, NULL, NULL, NULL),
(50, 'French toast', '2 slices', '130.0', 320, '12.00', '36.00', '14.00', '10.00', '600.0', 'breakfast', 'pan_fried', 'Egg-soaked bread fried in butter.', NULL, NULL, NULL, NULL),
(51, 'Waffles', '2 round', '150.0', 218, '5.90', '25.00', '10.60', '5.00', '480.0', 'breakfast', 'baked', 'Crisp batter cakes. Toppings decide the sugar.', NULL, NULL, NULL, NULL),
(52, 'Oatmeal, cooked', '1 cup', '234.0', 154, '6.00', '27.00', '3.20', '0.60', '115.0', 'breakfast', 'boiled', 'Whole oats cooked in water. Slow-release energy and fiber.', NULL, NULL, NULL, NULL),
(53, 'Breakfast cereal, flakes', '1 cup', '28.0', 124, '3.00', '29.00', '0.50', '3.00', '200.0', 'breakfast', 'packaged', 'Ready-to-eat cereal. Check the label, many are sugary.', NULL, NULL, NULL, NULL),
(54, 'Granola', '1/2 cup', '61.0', 213, '6.10', '35.20', '6.40', '12.00', '100.0', 'breakfast', 'baked', 'Toasted oats with oil and sweetener. Calorie-dense.', NULL, NULL, NULL, NULL),
(55, 'Milk, whole', '1 cup', '244.0', 149, '7.70', '11.70', '7.90', '12.30', '105.0', 'dairy', 'none', 'Full-fat milk with protein and calcium. Sugar is natural lactose.', NULL, NULL, NULL, NULL),
(56, 'Milk, skim', '1 cup', '245.0', 83, '8.30', '12.20', '0.20', '12.50', '103.0', 'dairy', 'none', 'Fat-free milk with the same protein as whole milk.', NULL, NULL, NULL, NULL),
(57, 'Almond milk, unsweetened', '1 cup', '240.0', 39, '1.50', '3.40', '2.50', '0.00', '170.0', 'drink', 'none', 'Low-calorie plant milk. Little protein.', NULL, NULL, NULL, NULL),
(58, 'Greek yogurt, plain', '1 cup', '245.0', 146, '23.60', '9.00', '0.80', '8.00', '85.0', 'dairy', 'none', 'Strained yogurt, very high in protein.', NULL, NULL, NULL, NULL),
(59, 'Yogurt, fruit-flavored', '1 cup', '245.0', 243, '10.30', '46.00', '2.60', '40.00', '140.0', 'dairy', 'none', 'Sweetened yogurt. Much of the carbs are added sugar.', NULL, NULL, NULL, NULL),
(60, 'Cheddar cheese', '1 slice', '28.0', 113, '7.00', '0.40', '9.30', '0.10', '180.0', 'dairy', 'none', 'Aged cheese with protein and calcium, but salty and fatty.', NULL, NULL, NULL, NULL),
(61, 'Mozzarella', '1 oz', '28.3', 85, '6.30', '0.60', '6.30', '0.30', '175.0', 'dairy', 'none', 'Mild, soft cheese.', NULL, NULL, NULL, NULL),
(62, 'Cottage cheese', '1/2 cup', '113.0', 110, '14.00', '4.00', '4.50', '3.00', '400.0', 'dairy', 'none', 'Soft cheese high in slow-digesting protein.', NULL, NULL, NULL, NULL),
(63, 'Cream cheese', '1 tbsp', '15.0', 99, '1.70', '0.80', '9.90', '0.50', '90.0', 'dairy', 'none', 'Spreadable cheese that is mostly fat.', NULL, NULL, NULL, NULL),
(64, 'Butter', '1 tbsp', '14.0', 102, '0.10', '0.00', '11.50', '0.00', '90.0', 'fat', 'none', 'Dairy fat. Mostly saturated fat.', NULL, NULL, NULL, NULL),
(65, 'Peanut butter', '2 tbsp', '32.0', 188, '8.00', '6.00', '16.00', '3.00', '150.0', 'nuts', 'blended', 'Ground peanuts. Healthy fats but calorie-dense.', NULL, NULL, NULL, NULL),
(66, 'Almonds', '1 oz', '28.3', 164, '6.00', '6.10', '14.20', '1.20', '0.0', 'nuts', 'raw', 'Nuts with healthy fats, vitamin E and fiber.', NULL, NULL, NULL, NULL),
(67, 'Walnuts', '1 oz', '28.3', 185, '4.30', '3.90', '18.50', '0.70', '1.0', 'nuts', 'raw', 'Nuts rich in omega-3 fats.', NULL, NULL, NULL, NULL),
(68, 'Cashews', '1 oz', '28.3', 157, '5.20', '8.60', '12.40', '1.70', '3.0', 'nuts', 'roasted', 'Creamy nuts with healthy fats.', NULL, NULL, NULL, NULL),
(69, 'Mixed nuts', '1 oz', '28.3', 173, '5.00', '6.00', '15.00', '1.30', '90.0', 'nuts', 'roasted', 'Roasted, often salted nut mix.', NULL, NULL, NULL, NULL),
(70, 'Trail mix', '1/4 cup', '38.0', 173, '5.00', '17.00', '10.00', '12.00', '80.0', 'snack', 'packaged', 'Nuts, dried fruit and sometimes chocolate. Easy to overeat.', NULL, NULL, NULL, NULL),
(71, 'Pizza, cheese', '1 slice', '107.0', 285, '12.00', '36.00', '10.00', '3.80', '640.0', 'fast_food', 'baked', 'Bread base with tomato sauce and cheese. Salty.', NULL, NULL, NULL, NULL),
(72, 'Cheeseburger', '1 sandwich', '200.0', 535, '30.00', '39.00', '28.00', '9.00', '1050.0', 'fast_food', 'grilled', 'Beef patty, cheese and bun. High in fat and sodium.', NULL, NULL, NULL, NULL),
(73, 'Beef burrito', '1 burrito', '250.0', 430, '17.00', '45.00', '19.00', '3.00', '1100.0', 'fast_food', 'none', 'Flour tortilla with beef, rice and beans.', NULL, NULL, NULL, NULL),
(74, 'Chicken taco', '1 taco', '100.0', 210, '12.00', '19.00', '9.00', '2.00', '500.0', 'fast_food', 'none', 'Tortilla with chicken and toppings.', NULL, NULL, NULL, NULL),
(75, 'Chicken sandwich, fried', '1 sandwich', '200.0', 540, '28.00', '45.00', '28.00', '6.00', '1200.0', 'fast_food', 'deep_fried', 'Breaded fried chicken in a bun. Oily and salty.', NULL, NULL, NULL, NULL),
(76, 'Hot dog', '1 piece', '120.0', 290, '10.40', '24.30', '17.50', '4.00', '800.0', 'fast_food', 'grilled', 'Processed sausage in a bun. High in sodium.', NULL, NULL, NULL, NULL),
(77, 'Club sandwich', '1 half', '180.0', 310, '18.00', '28.00', '14.00', '4.00', '900.0', 'fast_food', 'none', 'Layered sandwich with deli meat, bacon and mayo.', NULL, NULL, NULL, NULL),
(78, 'Turkey sandwich', '1 whole', '250.0', 480, '25.00', '55.00', '17.00', '6.00', '1400.0', 'fast_food', 'none', 'Deli turkey in bread. Salty from the processed meat.', NULL, NULL, NULL, NULL),
(79, 'Sushi roll, salmon', '6 pieces', '180.0', 304, '13.00', '42.00', '7.00', '6.00', '500.0', 'dish', 'raw', 'Rice rolled with salmon and seaweed. Soy sauce adds sodium.', NULL, NULL, NULL, NULL),
(80, 'Pad thai', '1 plate', '300.0', 660, '22.00', '82.00', '27.00', '18.00', '1600.0', 'noodles', 'stir_fried', 'Stir-fried rice noodles with a sweet-salty sauce.', NULL, NULL, NULL, NULL),
(81, 'Fried rice', '1 cup', '198.0', 348, '10.00', '51.00', '11.00', '2.00', '800.0', 'grain', 'stir_fried', 'Rice stir-fried in oil with soy sauce.', NULL, NULL, NULL, NULL),
(82, 'Chicken curry with rice', '1 plate', '400.0', 640, '30.00', '75.00', '24.00', '6.00', '1000.0', 'dish', 'simmered', 'Chicken simmered in spiced curry sauce, served with rice.', NULL, NULL, NULL, NULL),
(83, 'Caesar salad with chicken', '1 bowl', '350.0', 470, '33.00', '12.00', '31.00', '3.00', '1000.0', 'salad', 'raw', 'Greens with chicken. The creamy dressing adds most of the fat.', NULL, NULL, NULL, NULL),
(84, 'Greek salad', '1 bowl', '300.0', 270, '7.00', '14.00', '22.00', '7.00', '800.0', 'salad', 'raw', 'Vegetables with feta and olive oil.', NULL, NULL, NULL, NULL),
(85, 'French fries', '1 medium', '117.0', 378, '4.00', '48.00', '19.00', '0.30', '270.0', 'snack', 'deep_fried', 'Potato strips deep-fried in oil. Oily and calorie-dense.', NULL, NULL, NULL, NULL),
(86, 'Potato chips', '1 oz', '28.3', 152, '2.00', '15.00', '10.00', '0.10', '150.0', 'snack', 'deep_fried', 'Thin fried potato slices. Oily and salty.', NULL, NULL, NULL, NULL),
(87, 'Mashed potatoes', '1 cup', '210.0', 237, '4.00', '35.00', '9.00', '2.00', '630.0', 'vegetable', 'boiled', 'Boiled potatoes mashed with butter and milk.', NULL, NULL, NULL, NULL),
(88, 'Baked potato', '1 medium', '173.0', 161, '4.30', '37.00', '0.20', '2.00', '17.0', 'vegetable', 'baked', 'Whole potato baked in its skin. Filling and low in fat.', NULL, NULL, NULL, NULL),
(89, 'Sweet potato, baked', '1 medium', '150.0', 103, '2.30', '24.00', '0.10', '7.40', '41.0', 'vegetable', 'baked', 'Kamote. Fiber, vitamin A and slow carbs.', NULL, NULL, NULL, NULL),
(90, 'Corn on the cob', '1 ear', '90.0', 90, '3.00', '19.00', '1.30', '4.50', '1.0', 'vegetable', 'boiled', 'Boiled sweet corn. Fiber and carbs.', NULL, NULL, NULL, NULL),
(91, 'Broccoli, steamed', '1 cup', '156.0', 55, '3.70', '11.20', '0.60', '2.20', '64.0', 'vegetable', 'steamed', 'Steamed green vegetable with fiber and vitamin C. Very low calorie.', NULL, NULL, NULL, NULL),
(92, 'Carrots, raw', '1 cup', '128.0', 52, '1.20', '12.30', '0.30', '6.00', '88.0', 'vegetable', 'raw', 'Crunchy vegetable rich in vitamin A.', NULL, NULL, NULL, NULL),
(93, 'Mixed greens salad', '1 bowl', '85.0', 45, '2.00', '8.00', '0.60', '2.00', '30.0', 'salad', 'raw', 'Leafy greens. Almost no calories before dressing.', NULL, NULL, NULL, NULL),
(94, 'Tomato soup', '1 cup', '245.0', 130, '3.00', '23.00', '2.80', '12.00', '700.0', 'soup', 'simmered', 'Smooth tomato soup. Canned versions are salty.', NULL, NULL, NULL, NULL),
(95, 'Chicken noodle soup', '1 cup', '240.0', 120, '9.00', '12.00', '3.50', '1.00', '850.0', 'soup', 'simmered', 'Broth with chicken and noodles. Light but salty.', NULL, NULL, NULL, NULL),
(96, 'Chocolate chip cookie', '1 cookie', '30.0', 148, '1.60', '20.00', '7.00', '10.00', '100.0', 'dessert', 'baked', 'Butter cookie with chocolate chips.', NULL, NULL, NULL, NULL),
(97, 'Brownie', '1 square', '56.0', 243, '2.70', '39.00', '9.00', '24.00', '140.0', 'dessert', 'baked', 'Dense chocolate cake square. High in sugar.', NULL, NULL, NULL, NULL),
(98, 'Ice cream, vanilla', '1/2 cup', '66.0', 137, '2.30', '16.00', '7.30', '14.00', '53.0', 'dessert', 'frozen', 'Frozen dairy dessert with sugar and fat.', NULL, NULL, NULL, NULL),
(99, 'Donut, glazed', '1 donut', '60.0', 269, '3.90', '31.00', '15.00', '13.00', '260.0', 'dessert', 'deep_fried', 'Fried dough with sugar glaze. Oily and sugary.', NULL, NULL, NULL, NULL),
(100, 'Muffin, blueberry', '1 medium', '113.0', 377, '5.30', '54.00', '15.00', '30.00', '340.0', 'dessert', 'baked', 'Bakery muffin. Closer to cake than bread.', NULL, NULL, NULL, NULL);

INSERT IGNORE INTO `food_catalog` (`id`, `name`, `serving_label`, `serving_grams`, `calories`, `protein`, `carbs`, `fat`, `sugar`, `sodium`, `category`, `prep_method`, `description`, `image_url`, `image_credit`, `image_link`, `image_checked_at`) VALUES
(101, 'Cake, chocolate', '1 slice', '95.0', 352, '4.30', '51.00', '15.00', '35.00', '300.0', 'dessert', 'baked', 'Frosted chocolate cake. High in sugar.', NULL, NULL, NULL, NULL),
(102, 'Energy bar', '1 bar', '45.0', 180, '6.00', '22.00', '8.00', '12.00', '120.0', 'snack', 'packaged', 'Packaged bar for quick energy.', NULL, NULL, NULL, NULL),
(103, 'Protein shake, whey', '1 scoop in water', '32.0', 130, '25.00', '3.00', '1.50', '1.50', '100.0', 'supplement', 'blended', 'Whey protein mixed with water. Fast protein after training.', NULL, NULL, NULL, NULL),
(104, 'Protein bar', '1 bar', '60.0', 220, '20.00', '24.00', '7.00', '6.00', '200.0', 'supplement', 'packaged', 'Packaged bar with added protein.', NULL, NULL, NULL, NULL),
(105, 'Dark chocolate', '1 oz', '28.3', 170, '2.20', '13.00', '12.10', '7.00', '6.0', 'dessert', 'packaged', 'Cocoa-rich chocolate (70%+). Less sugar than milk chocolate.', NULL, NULL, NULL, NULL),
(106, 'Honey', '1 tbsp', '21.0', 64, '0.10', '17.30', '0.00', '17.20', '1.0', 'sweetener', 'none', 'Natural sweetener. Still counts as added sugar.', NULL, NULL, NULL, NULL),
(107, 'Black coffee', '1 cup', '240.0', 2, '0.30', '0.00', '0.00', '0.00', '5.0', 'drink', 'brewed', 'Plain brewed coffee. Nearly zero calories.', NULL, NULL, NULL, NULL),
(108, 'Latte', '1 medium', '350.0', 190, '10.00', '18.00', '9.00', '17.00', '150.0', 'drink', 'brewed', 'Espresso with steamed milk. Sugar comes from milk and syrups.', NULL, NULL, NULL, NULL),
(109, 'Orange juice', '1 cup', '248.0', 112, '1.70', '26.00', '0.50', '21.00', '2.0', 'drink', 'none', 'Fruit juice without the fiber of whole fruit.', NULL, NULL, NULL, NULL),
(110, 'Cola', '1 can (330 ml)', '330.0', 139, '0.00', '39.00', '0.00', '39.00', '15.0', 'drink', 'packaged', 'Sugar-sweetened soft drink. About 10 teaspoons of sugar.', NULL, NULL, NULL, NULL),
(111, 'Diet cola', '1 can (330 ml)', '330.0', 0, '0.00', '0.00', '0.00', '0.00', '40.0', 'drink', 'packaged', 'Artificially sweetened soft drink with no calories.', NULL, NULL, NULL, NULL),
(112, 'Beer', '1 bottle (355 ml)', '355.0', 153, '1.60', '13.00', '0.00', '0.00', '14.0', 'drink', 'packaged', 'Alcoholic drink. Calories come mostly from alcohol.', NULL, NULL, NULL, NULL),
(113, 'Red wine', '5 oz', '147.0', 125, '0.10', '3.80', '0.00', '0.90', '6.0', 'drink', 'packaged', 'Alcoholic drink. Calories come mostly from alcohol.', NULL, NULL, NULL, NULL),
(114, 'Green smoothie', '1 cup', '240.0', 130, '4.00', '24.00', '2.00', '18.00', '50.0', 'drink', 'blended', 'Blended fruit and greens.', NULL, NULL, NULL, NULL),
(115, 'Chicken adobo', '1 cup (2 pcs)', '200.0', 380, '32.00', '4.00', '26.00', '2.00', '1100.0', 'dish', 'stewed', 'Chicken braised in soy sauce, vinegar, garlic and bay leaf. High in protein but salty from the soy sauce.', NULL, NULL, NULL, NULL),
(116, 'Pork adobo', '1 cup', '200.0', 520, '28.00', '4.00', '44.00', '2.00', '1200.0', 'dish', 'stewed', 'Pork belly braised in soy sauce and vinegar. Rich, fatty and salty.', NULL, NULL, NULL, NULL),
(117, 'Sinigang na baboy', '1 bowl', '400.0', 330, '24.00', '12.00', '20.00', '4.00', '1300.0', 'soup', 'simmered', 'Sour tamarind soup with pork, kangkong, radish and string beans.', NULL, NULL, NULL, NULL),
(118, 'Sinigang na hipon', '1 bowl', '400.0', 180, '22.00', '12.00', '4.00', '4.00', '1200.0', 'soup', 'simmered', 'Sour tamarind soup with shrimp and vegetables. Light and lean.', NULL, NULL, NULL, NULL),
(119, 'Tinolang manok', '1 bowl', '400.0', 260, '28.00', '10.00', '12.00', '3.00', '900.0', 'soup', 'simmered', 'Ginger chicken soup with green papaya and malunggay leaves. Light and protein-rich.', NULL, NULL, NULL, NULL),
(120, 'Nilagang baka', '1 bowl', '400.0', 380, '30.00', '18.00', '20.00', '4.00', '900.0', 'soup', 'boiled', 'Boiled beef soup with potatoes, cabbage and pechay.', NULL, NULL, NULL, NULL),
(121, 'Bulalo', '1 bowl', '400.0', 520, '34.00', '10.00', '38.00', '2.00', '1100.0', 'soup', 'boiled', 'Beef shank and bone-marrow soup with corn and cabbage. Rich and fatty.', NULL, NULL, NULL, NULL),
(122, 'Kare-kare', '1 cup', '250.0', 520, '28.00', '14.00', '40.00', '5.00', '700.0', 'dish', 'stewed', 'Oxtail and vegetables in peanut sauce. The bagoong (shrimp paste) on the side adds a lot of sodium.', NULL, NULL, NULL, NULL),
(123, 'Pork sisig', '1 cup', '150.0', 480, '22.00', '4.00', '42.00', '1.00', '900.0', 'dish', 'pan_fried', 'Chopped grilled pork face and ears sizzled with onion, chili and calamansi. Very oily.', NULL, NULL, NULL, NULL),
(124, 'Lechon kawali', '100 g', '100.0', 430, '18.00', '0.00', '40.00', '0.00', '500.0', 'meat', 'deep_fried', 'Boiled then deep-fried pork belly. Crispy, oily and high in saturated fat.', NULL, NULL, NULL, NULL),
(125, 'Lechon (roast pork)', '100 g', '100.0', 380, '22.00', '0.00', '32.00', '0.00', '600.0', 'meat', 'roasted', 'Whole spit-roasted pork with crispy skin. Festive and fatty.', NULL, NULL, NULL, NULL),
(126, 'Crispy pata', '150 g', '150.0', 600, '30.00', '0.00', '53.00', '0.00', '700.0', 'meat', 'deep_fried', 'Deep-fried pork leg. One of the most oily Filipino dishes.', NULL, NULL, NULL, NULL),
(127, 'Pork menudo', '1 cup', '250.0', 380, '22.00', '16.00', '25.00', '7.00', '1000.0', 'dish', 'stewed', 'Pork and liver stewed in tomato sauce with potatoes, carrots and raisins.', NULL, NULL, NULL, NULL),
(128, 'Beef caldereta', '1 cup', '250.0', 420, '30.00', '14.00', '27.00', '6.00', '1000.0', 'dish', 'stewed', 'Beef stewed in tomato sauce with liver spread, potatoes and bell pepper.', NULL, NULL, NULL, NULL),
(129, 'Chicken afritada', '1 cup', '250.0', 330, '26.00', '14.00', '18.00', '7.00', '900.0', 'dish', 'stewed', 'Chicken stewed in tomato sauce with potatoes, carrots and peppers.', NULL, NULL, NULL, NULL),
(130, 'Beef mechado', '1 cup', '250.0', 400, '30.00', '12.00', '26.00', '6.00', '1000.0', 'dish', 'stewed', 'Beef braised in tomato and soy sauce.', NULL, NULL, NULL, NULL),
(131, 'Bicol express', '1 cup', '200.0', 560, '18.00', '8.00', '50.00', '3.00', '900.0', 'dish', 'stewed', 'Pork in coconut milk with chili and shrimp paste. Very high in saturated fat.', NULL, NULL, NULL, NULL),
(132, 'Laing', '1 cup', '180.0', 300, '8.00', '14.00', '25.00', '3.00', '700.0', 'vegetable', 'stewed', 'Dried taro leaves simmered in coconut milk with chili.', NULL, NULL, NULL, NULL),
(133, 'Pinakbet', '1 cup', '200.0', 160, '8.00', '16.00', '8.00', '6.00', '800.0', 'vegetable', 'sauteed', 'Sauteed vegetables (squash, okra, eggplant, ampalaya) with shrimp paste.', NULL, NULL, NULL, NULL),
(134, 'Ginisang monggo', '1 cup', '250.0', 260, '15.00', '34.00', '7.00', '3.00', '600.0', 'plant_protein', 'stewed', 'Mung bean stew with garlic and leafy greens. Good plant protein and fiber.', NULL, NULL, NULL, NULL),
(135, 'Chopsuey', '1 cup', '200.0', 150, '10.00', '14.00', '6.00', '6.00', '700.0', 'vegetable', 'stir_fried', 'Stir-fried mixed vegetables with a little meat or quail eggs.', NULL, NULL, NULL, NULL),
(136, 'Tortang talong', '1 piece', '150.0', 220, '10.00', '8.00', '16.00', '4.00', '400.0', 'dish', 'pan_fried', 'Grilled eggplant dipped in egg and pan-fried.', NULL, NULL, NULL, NULL),
(137, 'Ginataang kalabasa at sitaw', '1 cup', '200.0', 250, '5.00', '18.00', '19.00', '7.00', '500.0', 'vegetable', 'stewed', 'Squash and string beans in coconut milk.', NULL, NULL, NULL, NULL),
(138, 'Kangkong adobo', '1 cup', '150.0', 120, '4.00', '8.00', '8.00', '2.00', '700.0', 'vegetable', 'sauteed', 'Water spinach cooked adobo-style in soy and vinegar.', NULL, NULL, NULL, NULL),
(139, 'Ginisang ampalaya with egg', '1 cup', '180.0', 170, '9.00', '8.00', '11.00', '3.00', '500.0', 'vegetable', 'sauteed', 'Bitter gourd sauteed with tomato and egg.', NULL, NULL, NULL, NULL),
(140, 'Dinuguan', '1 cup', '250.0', 400, '30.00', '6.00', '28.00', '2.00', '1000.0', 'dish', 'stewed', 'Pork stewed in pork blood and vinegar. Rich in iron.', NULL, NULL, NULL, NULL),
(141, 'Pancit canton', '1 cup', '200.0', 360, '14.00', '46.00', '13.00', '4.00', '1100.0', 'noodles', 'stir_fried', 'Stir-fried egg noodles with vegetables and meat.', NULL, NULL, NULL, NULL),
(142, 'Pancit bihon', '1 cup', '200.0', 300, '12.00', '44.00', '8.00', '3.00', '900.0', 'noodles', 'stir_fried', 'Stir-fried rice noodles with vegetables and chicken.', NULL, NULL, NULL, NULL),
(143, 'Pancit palabok', '1 plate', '300.0', 480, '18.00', '62.00', '18.00', '4.00', '1100.0', 'noodles', 'boiled', 'Rice noodles with shrimp sauce, egg, chicharon and tinapa flakes.', NULL, NULL, NULL, NULL),
(144, 'Instant pancit canton', '1 pack', '80.0', 380, '7.00', '50.00', '17.00', '4.00', '1300.0', 'noodles', 'boiled', 'Packaged fried noodles. Very high in sodium.', NULL, NULL, NULL, NULL),
(145, 'Pinoy spaghetti', '1 plate', '300.0', 520, '20.00', '70.00', '18.00', '18.00', '1000.0', 'noodles', 'simmered', 'Sweet-style spaghetti with banana ketchup and hotdog slices. High in sugar.', NULL, NULL, NULL, NULL),
(146, 'Lumpiang shanghai', '5 pieces', '100.0', 320, '12.00', '22.00', '21.00', '2.00', '450.0', 'snack', 'deep_fried', 'Thin spring rolls with ground pork, deep-fried. Oily.', NULL, NULL, NULL, NULL),
(147, 'Lumpiang sariwa', '1 roll', '200.0', 230, '7.00', '32.00', '8.00', '10.00', '450.0', 'vegetable', 'raw', 'Fresh vegetable spring roll with a sweet peanut-garlic sauce.', NULL, NULL, NULL, NULL),
(148, 'Lumpiang gulay', '1 piece', '100.0', 190, '4.00', '22.00', '10.00', '3.00', '300.0', 'snack', 'deep_fried', 'Vegetable spring roll fried in oil.', NULL, NULL, NULL, NULL),
(149, 'Tapsilog', '1 plate', '400.0', 720, '38.00', '72.00', '30.00', '6.00', '1400.0', 'breakfast', 'fried', 'Beef tapa, garlic fried rice (sinangag) and a fried egg.', NULL, NULL, NULL, NULL),
(150, 'Longsilog', '1 plate', '380.0', 780, '26.00', '80.00', '38.00', '16.00', '1300.0', 'breakfast', 'fried', 'Sweet pork longganisa, garlic rice and fried egg. High in sugar and sodium.', NULL, NULL, NULL, NULL),
(151, 'Tocilog', '1 plate', '380.0', 740, '28.00', '86.00', '30.00', '22.00', '1100.0', 'breakfast', 'fried', 'Sweet cured pork (tocino), garlic rice and fried egg.', NULL, NULL, NULL, NULL),
(152, 'Bangsilog', '1 plate', '400.0', 700, '38.00', '70.00', '29.00', '1.00', '1000.0', 'breakfast', 'fried', 'Fried marinated milkfish (bangus), garlic rice and egg. Good omega-3 fats.', NULL, NULL, NULL, NULL),
(153, 'Cornsilog', '1 plate', '350.0', 650, '25.00', '62.00', '33.00', '1.00', '1400.0', 'breakfast', 'fried', 'Corned beef, garlic rice and fried egg. Very salty.', NULL, NULL, NULL, NULL),
(154, 'Garlic fried rice (sinangag)', '1 cup', '180.0', 300, '5.00', '50.00', '8.00', '0.20', '350.0', 'grain', 'stir_fried', 'Day-old rice fried with garlic and oil.', NULL, NULL, NULL, NULL),
(155, 'Daing na bangus', '1/2 fish', '150.0', 300, '30.00', '2.00', '19.00', '0.00', '800.0', 'seafood', 'fried', 'Milkfish marinated in vinegar and garlic, then fried.', NULL, NULL, NULL, NULL),
(156, 'Inihaw na bangus', '150 g', '150.0', 250, '32.00', '0.00', '13.00', '0.00', '150.0', 'seafood', 'grilled', 'Grilled milkfish stuffed with tomato and onion. Lean and rich in omega-3.', NULL, NULL, NULL, NULL),
(157, 'Rellenong bangus', '1 slice', '150.0', 320, '22.00', '8.00', '22.00', '3.00', '650.0', 'seafood', 'fried', 'Deboned milkfish stuffed with its own flesh and vegetables, then fried.', NULL, NULL, NULL, NULL),
(158, 'Fried tilapia', '1 whole', '200.0', 340, '40.00', '3.00', '18.00', '0.00', '400.0', 'seafood', 'fried', 'Whole tilapia fried in oil.', NULL, NULL, NULL, NULL),
(159, 'Paksiw na isda', '1 piece', '200.0', 220, '30.00', '4.00', '9.00', '1.00', '900.0', 'seafood', 'simmered', 'Fish simmered in vinegar, garlic and ginger. No frying.', NULL, NULL, NULL, NULL),
(160, 'Tuyo', '3 pieces', '30.0', 90, '18.00', '0.00', '2.00', '0.00', '1500.0', 'seafood', 'fried', 'Salted dried fish. Extremely high in sodium, so eat small amounts.', NULL, NULL, NULL, NULL),
(161, 'Inihaw na liempo', '150 g', '150.0', 520, '26.00', '6.00', '44.00', '5.00', '700.0', 'meat', 'grilled', 'Grilled marinated pork belly. Grilled, but still very fatty.', NULL, NULL, NULL, NULL),
(162, 'Chicken inasal', '1 leg quarter', '200.0', 400, '38.00', '3.00', '26.00', '2.00', '750.0', 'poultry', 'grilled', 'Bacolod-style chicken marinated in calamansi and annatto, then grilled.', NULL, NULL, NULL, NULL),
(163, 'Pork barbecue', '2 sticks', '120.0', 320, '22.00', '14.00', '20.00', '12.00', '700.0', 'meat', 'grilled', 'Sweet soy-marinated grilled pork skewers. The glaze adds sugar.', NULL, NULL, NULL, NULL),
(164, 'Filipino fried chicken', '1 thigh', '130.0', 330, '22.00', '10.00', '22.00', '0.50', '600.0', 'poultry', 'deep_fried', 'Seasoned chicken fried in oil, fast-food style.', NULL, NULL, NULL, NULL),
(165, 'Filipino red hotdog', '1 piece', '45.0', 140, '5.00', '5.00', '11.00', '4.00', '500.0', 'meat', 'fried', 'Sweet red processed hotdog. High in sodium.', NULL, NULL, NULL, NULL),
(166, 'Corned beef with rice', '1 plate', '350.0', 600, '25.00', '60.00', '28.00', '1.00', '1400.0', 'dish', 'sauteed', 'Canned corned beef sauteed with onion, served with rice.', NULL, NULL, NULL, NULL),
(167, 'Arroz caldo', '1 bowl', '350.0', 330, '16.00', '46.00', '9.00', '1.00', '900.0', 'soup', 'simmered', 'Rice porridge with chicken, ginger and egg. Comforting and easy to digest.', NULL, NULL, NULL, NULL),
(168, 'Lugaw', '1 bowl', '350.0', 180, '4.00', '38.00', '1.00', '0.30', '500.0', 'grain', 'boiled', 'Plain rice porridge. Light and gentle on the stomach.', NULL, NULL, NULL, NULL),
(169, 'Goto', '1 bowl', '350.0', 340, '14.00', '40.00', '13.00', '1.00', '950.0', 'soup', 'simmered', 'Rice porridge with beef tripe and ginger.', NULL, NULL, NULL, NULL),
(170, 'Champorado', '1 bowl', '300.0', 380, '7.00', '72.00', '8.00', '32.00', '150.0', 'dessert', 'boiled', 'Chocolate rice porridge, often topped with milk. High in sugar.', NULL, NULL, NULL, NULL),
(171, 'Pandesal', '2 pieces', '60.0', 170, '5.00', '30.00', '3.00', '4.00', '280.0', 'bread', 'baked', 'Soft, slightly sweet breakfast bread rolls.', NULL, NULL, NULL, NULL),
(172, 'Ensaymada', '1 piece', '80.0', 320, '6.00', '38.00', '16.00', '15.00', '230.0', 'bread', 'baked', 'Soft brioche topped with butter, sugar and cheese.', NULL, NULL, NULL, NULL),
(173, 'Siopao asado', '1 piece', '150.0', 380, '14.00', '56.00', '11.00', '14.00', '650.0', 'snack', 'steamed', 'Steamed bun filled with sweet braised pork.', NULL, NULL, NULL, NULL),
(174, 'Pork siomai', '4 pieces', '100.0', 220, '12.00', '14.00', '13.00', '2.00', '550.0', 'snack', 'steamed', 'Steamed pork dumplings. Soy sauce dip adds sodium.', NULL, NULL, NULL, NULL),
(175, 'Kwek-kwek', '5 pieces', '100.0', 280, '9.00', '20.00', '18.00', '2.00', '300.0', 'snack', 'deep_fried', 'Quail eggs in orange batter, deep-fried street food.', NULL, NULL, NULL, NULL),
(176, 'Fish balls', '10 pieces', '100.0', 220, '8.00', '22.00', '11.00', '3.00', '600.0', 'snack', 'deep_fried', 'Fried street-food fish balls, usually with sweet or spicy sauce.', NULL, NULL, NULL, NULL),
(177, 'Chicharon', '1 oz', '28.3', 155, '17.00', '0.00', '9.00', '0.00', '520.0', 'snack', 'deep_fried', 'Deep-fried pork rind. Crunchy, oily and salty.', NULL, NULL, NULL, NULL),
(178, 'Taho', '1 cup', '250.0', 200, '8.00', '38.00', '2.00', '28.00', '20.0', 'dessert', 'steamed', 'Silken tofu with arnibal (brown sugar syrup) and sago pearls.', NULL, NULL, NULL, NULL),
(179, 'Turon', '1 piece', '90.0', 230, '1.50', '40.00', '8.00', '22.00', '10.0', 'dessert', 'deep_fried', 'Banana and jackfruit in a spring roll wrapper, fried with caramelized sugar.', NULL, NULL, NULL, NULL),
(180, 'Banana cue', '1 stick', '150.0', 300, '1.50', '58.00', '8.00', '38.00', '5.0', 'dessert', 'deep_fried', 'Saba bananas deep-fried and coated in brown sugar.', NULL, NULL, NULL, NULL),
(181, 'Kamote cue', '1 stick', '150.0', 280, '2.00', '50.00', '8.00', '26.00', '50.0', 'dessert', 'deep_fried', 'Sweet potato fried with brown sugar.', NULL, NULL, NULL, NULL),
(182, 'Halo-halo', '1 glass', '350.0', 420, '7.00', '80.00', '9.00', '62.00', '120.0', 'dessert', 'frozen', 'Shaved ice with sweet beans, fruits, leche flan, ube and milk. Very high in sugar.', NULL, NULL, NULL, NULL),
(183, 'Leche flan', '1 slice', '100.0', 280, '6.00', '40.00', '10.00', '38.00', '80.0', 'dessert', 'steamed', 'Steamed egg-and-milk custard with caramel.', NULL, NULL, NULL, NULL),
(184, 'Bibingka', '1 piece', '120.0', 330, '7.00', '50.00', '12.00', '20.00', '300.0', 'dessert', 'baked', 'Rice cake baked in banana leaves, topped with salted egg and cheese.', NULL, NULL, NULL, NULL),
(185, 'Puto', '3 pieces', '90.0', 200, '4.00', '42.00', '2.00', '14.00', '200.0', 'dessert', 'steamed', 'Steamed rice cakes. Low in fat.', NULL, NULL, NULL, NULL),
(186, 'Kutsinta', '3 pieces', '90.0', 180, '1.00', '42.00', '0.50', '18.00', '60.0', 'dessert', 'steamed', 'Steamed brown rice cakes with grated coconut.', NULL, NULL, NULL, NULL),
(187, 'Biko', '1 slice', '100.0', 290, '3.00', '52.00', '8.00', '26.00', '30.0', 'dessert', 'simmered', 'Sticky rice cooked in coconut milk and brown sugar.', NULL, NULL, NULL, NULL),
(188, 'Buko juice', '1 glass', '240.0', 45, '1.70', '9.00', '0.50', '6.00', '250.0', 'drink', 'none', 'Fresh coconut water. Natural electrolytes for after training.', NULL, NULL, NULL, NULL),
(189, 'Calamansi juice', '1 glass', '240.0', 90, '0.20', '24.00', '0.00', '21.00', '5.0', 'drink', 'none', 'Sweetened Philippine lime juice with vitamin C.', NULL, NULL, NULL, NULL),
(190, 'Sago\'t gulaman', '1 glass', '350.0', 190, '0.00', '48.00', '0.00', '40.00', '20.0', 'drink', 'none', 'Brown sugar drink with tapioca pearls and gelatin. Mostly sugar.', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------
-- Table `food_logs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `food_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `food_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serving` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grams` decimal(7,1) DEFAULT NULL,
  `meal_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calories` int DEFAULT '0',
  `protein` decimal(10,2) DEFAULT NULL,
  `carbs` decimal(10,2) DEFAULT NULL,
  `fat` decimal(10,2) DEFAULT NULL,
  `sugar` decimal(10,2) DEFAULT NULL,
  `sodium` decimal(10,1) DEFAULT NULL,
  `saturated_fat` decimal(10,2) DEFAULT '0.00',
  `trans_fat` decimal(10,2) DEFAULT '0.00',
  `polyunsaturated_fat` decimal(10,2) DEFAULT '0.00',
  `monounsaturated_fat` decimal(10,2) DEFAULT '0.00',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logged_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_logged_at` (`logged_at`),
  KEY `idx_user_logged` (`user_id`,`logged_at`),
  CONSTRAINT `food_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `food_logs` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `food_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'food_name');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `serving` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'serving');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `grams` decimal(7,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'grams');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `meal_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'meal_type');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `calories` int DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'calories');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `protein` decimal(10,2) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'protein');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `carbs` decimal(10,2) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'carbs');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `fat` decimal(10,2) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'fat');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `sugar` decimal(10,2) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'sugar');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `sodium` decimal(10,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'sodium');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `saturated_fat` decimal(10,2) DEFAULT ''0.00''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'saturated_fat');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `trans_fat` decimal(10,2) DEFAULT ''0.00''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'trans_fat');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `polyunsaturated_fat` decimal(10,2) DEFAULT ''0.00''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'polyunsaturated_fat');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `monounsaturated_fat` decimal(10,2) DEFAULT ''0.00''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'monounsaturated_fat');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'image_url');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD COLUMN `logged_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'logged_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `food_logs` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_logs` ADD CONSTRAINT `food_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND constraint_name = 'food_logs_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `food_nutrition_cache`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `food_nutrition_cache` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_normalized` varchar(160) COLLATE utf8mb4_general_ci NOT NULL,
  `display_name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `calories` int NOT NULL DEFAULT '0',
  `protein` decimal(6,2) NOT NULL DEFAULT '0.00',
  `carbs` decimal(6,2) NOT NULL DEFAULT '0.00',
  `fat` decimal(6,2) NOT NULL DEFAULT '0.00',
  `source` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'ai',
  `model` varchar(80) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hit_count` int NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_food_density_name` (`name_normalized`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add any columns an older `food_nutrition_cache` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_nutrition_cache` ADD COLUMN `name_normalized` varchar(160) COLLATE utf8mb4_general_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_nutrition_cache' AND column_name = 'name_normalized');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_nutrition_cache` ADD COLUMN `display_name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_nutrition_cache' AND column_name = 'display_name');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_nutrition_cache` ADD COLUMN `calories` int NOT NULL DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_nutrition_cache' AND column_name = 'calories');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_nutrition_cache` ADD COLUMN `protein` decimal(6,2) NOT NULL DEFAULT ''0.00''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_nutrition_cache' AND column_name = 'protein');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_nutrition_cache` ADD COLUMN `carbs` decimal(6,2) NOT NULL DEFAULT ''0.00''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_nutrition_cache' AND column_name = 'carbs');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_nutrition_cache` ADD COLUMN `fat` decimal(6,2) NOT NULL DEFAULT ''0.00''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_nutrition_cache' AND column_name = 'fat');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_nutrition_cache` ADD COLUMN `source` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT ''ai''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_nutrition_cache' AND column_name = 'source');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_nutrition_cache` ADD COLUMN `model` varchar(80) COLLATE utf8mb4_general_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_nutrition_cache' AND column_name = 'model');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_nutrition_cache` ADD COLUMN `hit_count` int NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_nutrition_cache' AND column_name = 'hit_count');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_nutrition_cache` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_nutrition_cache' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `food_nutrition_cache` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_nutrition_cache' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `friendships`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `friendships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `friend_id` int NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_friendship` (`user_id`,`friend_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_friend_id` (`friend_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `friendships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friendships_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `friendships` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `friendships` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'friendships' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `friendships` ADD COLUMN `friend_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'friendships' AND column_name = 'friend_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `friendships` ADD COLUMN `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT ''pending''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'friendships' AND column_name = 'status');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `friendships` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'friendships' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `friendships` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `friendships` ADD CONSTRAINT `friendships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'friendships' AND constraint_name = 'friendships_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `friendships` ADD CONSTRAINT `friendships_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'friendships' AND constraint_name = 'friendships_ibfk_2' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `landing_visits`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `landing_visits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ip_hash` char(64) NOT NULL,
  `visit_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_landing_visits_hash_date` (`ip_hash`,`visit_date`),
  KEY `idx_landing_visits_date` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `landing_visits` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `landing_visits` ADD COLUMN `ip_hash` char(64) NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'landing_visits' AND column_name = 'ip_hash');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `landing_visits` ADD COLUMN `visit_date` date NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'landing_visits' AND column_name = 'visit_date');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `landing_visits` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'landing_visits' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `messages`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(10,8) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_sent_at` (`sent_at`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_receiver_read_sent` (`receiver_id`,`is_read`,`sent_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `messages` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `messages` ADD COLUMN `sender_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'messages' AND column_name = 'sender_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `messages` ADD COLUMN `receiver_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'messages' AND column_name = 'receiver_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `messages` ADD COLUMN `content` text COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'messages' AND column_name = 'content');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `messages` ADD COLUMN `latitude` decimal(10,8) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'messages' AND column_name = 'latitude');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `messages` ADD COLUMN `longitude` decimal(10,8) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'messages' AND column_name = 'longitude');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `messages` ADD COLUMN `is_read` tinyint(1) DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'messages' AND column_name = 'is_read');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `messages` ADD COLUMN `sent_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'messages' AND column_name = 'sent_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `messages` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `messages` ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'messages' AND constraint_name = 'messages_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `messages` ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'messages' AND constraint_name = 'messages_ibfk_2' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `notifications`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `message` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYSTEM',
  `source` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_cat_created` (`user_id`,`category`,`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `notifications` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `notifications` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `notifications` ADD COLUMN `message` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'message');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `notifications` ADD COLUMN `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT ''info''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'type');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `notifications` ADD COLUMN `is_read` tinyint(1) DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'is_read');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `notifications` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `notifications` ADD COLUMN `category` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''SYSTEM''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'category');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `notifications` ADD COLUMN `source` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'source');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `notifications` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `notifications` ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'notifications' AND constraint_name = 'notifications_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `password_reset_otps`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_reset_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `otp_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_used` (`used`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_user_used_expires` (`user_id`,`used`,`expires_at`),
  CONSTRAINT `password_reset_otps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `password_reset_otps` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `password_reset_otps` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'password_reset_otps' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `password_reset_otps` ADD COLUMN `otp_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'password_reset_otps' AND column_name = 'otp_hash');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `password_reset_otps` ADD COLUMN `expires_at` datetime NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'password_reset_otps' AND column_name = 'expires_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `password_reset_otps` ADD COLUMN `used` tinyint(1) DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'password_reset_otps' AND column_name = 'used');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `password_reset_otps` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'password_reset_otps' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `password_reset_otps` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `password_reset_otps` ADD CONSTRAINT `password_reset_otps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'password_reset_otps' AND constraint_name = 'password_reset_otps_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `phone_verifications`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `phone_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` tinyint unsigned NOT NULL DEFAULT '0',
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `last_sent_at` datetime NOT NULL,
  `reference_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_used_expires` (`user_id`,`used`,`expires_at`),
  KEY `idx_user_sent` (`user_id`,`last_sent_at`),
  CONSTRAINT `phone_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `phone_verifications` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `phone_verifications` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'phone_verifications' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `phone_verifications` ADD COLUMN `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'phone_verifications' AND column_name = 'phone');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `phone_verifications` ADD COLUMN `otp_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'phone_verifications' AND column_name = 'otp_hash');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `phone_verifications` ADD COLUMN `expires_at` datetime NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'phone_verifications' AND column_name = 'expires_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `phone_verifications` ADD COLUMN `attempts` tinyint unsigned NOT NULL DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'phone_verifications' AND column_name = 'attempts');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `phone_verifications` ADD COLUMN `used` tinyint(1) NOT NULL DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'phone_verifications' AND column_name = 'used');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `phone_verifications` ADD COLUMN `last_sent_at` datetime NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'phone_verifications' AND column_name = 'last_sent_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `phone_verifications` ADD COLUMN `reference_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'phone_verifications' AND column_name = 'reference_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `phone_verifications` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'phone_verifications' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `phone_verifications` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `phone_verifications` ADD CONSTRAINT `phone_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'phone_verifications' AND constraint_name = 'phone_verifications_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `plan_contents`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plan_contents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `day_number` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activity_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `duration_mins` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_plan_day` (`plan_id`,`day_number`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_day_number` (`day_number`),
  CONSTRAINT `plan_contents_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `plan_contents` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_contents` ADD COLUMN `plan_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_contents' AND column_name = 'plan_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_contents` ADD COLUMN `day_number` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_contents' AND column_name = 'day_number');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_contents` ADD COLUMN `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_contents' AND column_name = 'title');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_contents` ADD COLUMN `activity_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_contents' AND column_name = 'activity_type');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_contents` ADD COLUMN `description` text COLLATE utf8mb4_unicode_ci', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_contents' AND column_name = 'description');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_contents` ADD COLUMN `duration_mins` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_contents' AND column_name = 'duration_mins');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_contents` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_contents' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `plan_contents` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_contents` ADD CONSTRAINT `plan_contents_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plan_contents' AND constraint_name = 'plan_contents_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

INSERT IGNORE INTO `plan_contents` (`id`, `plan_id`, `day_number`, `title`, `activity_type`, `description`, `duration_mins`, `created_at`) VALUES
(1, 46, 1, 'Day 1 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(2, 46, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(3, 46, 3, 'Day 3 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(4, 46, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(5, 46, 5, 'Day 5 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(6, 46, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(7, 46, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(8, 46, 8, 'Day 8 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(9, 46, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(10, 46, 10, 'Day 10 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(11, 46, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(12, 46, 12, 'Day 12 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(13, 46, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(14, 46, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(15, 46, 15, 'Day 15 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(16, 46, 16, 'Day 16 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(17, 46, 17, 'Day 17 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(18, 46, 18, 'Day 18 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(19, 46, 19, 'Day 19 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(20, 46, 20, 'Day 20 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(21, 46, 21, 'Day 21 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(22, 46, 22, 'Day 22 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(23, 46, 23, 'Day 23 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(24, 46, 24, 'Day 24 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(25, 46, 25, 'Day 25 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(26, 46, 26, 'Day 26 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(27, 46, 27, 'Day 27 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(28, 46, 28, 'Day 28 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(29, 47, 1, 'Day 1 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(30, 47, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(31, 47, 3, 'Day 3 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(32, 47, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(33, 47, 5, 'Day 5 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(34, 47, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(35, 47, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(36, 47, 8, 'Day 8 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(37, 47, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(38, 47, 10, 'Day 10 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(39, 47, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(40, 47, 12, 'Day 12 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(41, 47, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(42, 47, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(43, 47, 15, 'Day 15 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(44, 47, 16, 'Day 16 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(45, 47, 17, 'Day 17 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(46, 47, 18, 'Day 18 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(47, 47, 19, 'Day 19 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(48, 47, 20, 'Day 20 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(49, 47, 21, 'Day 21 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(50, 47, 22, 'Day 22 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(51, 47, 23, 'Day 23 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(52, 47, 24, 'Day 24 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(53, 47, 25, 'Day 25 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(54, 47, 26, 'Day 26 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(55, 47, 27, 'Day 27 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(56, 47, 28, 'Day 28 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(57, 48, 1, 'Day 1 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(58, 48, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(59, 48, 3, 'Day 3 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(60, 48, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(61, 48, 5, 'Day 5 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(62, 48, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(63, 48, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(64, 48, 8, 'Day 8 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(65, 48, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(66, 48, 10, 'Day 10 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(67, 48, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(68, 48, 12, 'Day 12 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(69, 48, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(70, 48, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(71, 48, 15, 'Day 15 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(72, 48, 16, 'Day 16 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(73, 48, 17, 'Day 17 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(74, 48, 18, 'Day 18 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(75, 48, 19, 'Day 19 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(76, 48, 20, 'Day 20 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(77, 48, 21, 'Day 21 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(78, 48, 22, 'Day 22 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(79, 48, 23, 'Day 23 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(80, 48, 24, 'Day 24 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(81, 48, 25, 'Day 25 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(82, 48, 26, 'Day 26 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(83, 48, 27, 'Day 27 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(84, 48, 28, 'Day 28 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(85, 49, 1, 'Day 1 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(86, 49, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(87, 49, 3, 'Day 3 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(88, 49, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(89, 49, 5, 'Day 5 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(90, 49, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(91, 49, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(92, 49, 8, 'Day 8 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(93, 49, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(94, 49, 10, 'Day 10 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(95, 49, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(96, 49, 12, 'Day 12 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(97, 49, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(98, 49, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(99, 50, 1, 'Day 1 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(100, 50, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29');

INSERT IGNORE INTO `plan_contents` (`id`, `plan_id`, `day_number`, `title`, `activity_type`, `description`, `duration_mins`, `created_at`) VALUES
(101, 50, 3, 'Day 3 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(102, 50, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(103, 50, 5, 'Day 5 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(104, 50, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(105, 50, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(106, 50, 8, 'Day 8 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(107, 50, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(108, 50, 10, 'Day 10 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(109, 50, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(110, 50, 12, 'Day 12 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(111, 50, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(112, 50, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(113, 50, 15, 'Day 15 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(114, 50, 16, 'Day 16 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(115, 50, 17, 'Day 17 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(116, 50, 18, 'Day 18 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(117, 50, 19, 'Day 19 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(118, 50, 20, 'Day 20 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(119, 50, 21, 'Day 21 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(120, 50, 22, 'Day 22 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(121, 50, 23, 'Day 23 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(122, 50, 24, 'Day 24 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(123, 50, 25, 'Day 25 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(124, 50, 26, 'Day 26 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(125, 50, 27, 'Day 27 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(126, 50, 28, 'Day 28 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(127, 51, 1, 'Day 1 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(128, 51, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(129, 51, 3, 'Day 3 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(130, 51, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(131, 51, 5, 'Day 5 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(132, 51, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(133, 51, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(134, 51, 8, 'Day 8 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(135, 51, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(136, 51, 10, 'Day 10 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(137, 51, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(138, 51, 12, 'Day 12 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(139, 51, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(140, 51, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(141, 52, 1, 'Day 1 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(142, 52, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(143, 52, 3, 'Day 3 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(144, 52, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(145, 52, 5, 'Day 5 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(146, 52, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(147, 52, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(148, 52, 8, 'Day 8 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(149, 52, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(150, 52, 10, 'Day 10 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(151, 52, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(152, 52, 12, 'Day 12 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(153, 52, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(154, 52, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(155, 52, 15, 'Day 15 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(156, 52, 16, 'Day 16 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(157, 52, 17, 'Day 17 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(158, 52, 18, 'Day 18 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(159, 52, 19, 'Day 19 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(160, 52, 20, 'Day 20 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(161, 52, 21, 'Day 21 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(162, 52, 22, 'Day 22 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(163, 52, 23, 'Day 23 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(164, 52, 24, 'Day 24 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(165, 52, 25, 'Day 25 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(166, 52, 26, 'Day 26 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(167, 52, 27, 'Day 27 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(168, 52, 28, 'Day 28 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(169, 53, 1, 'Day 1 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(170, 53, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(171, 53, 3, 'Day 3 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(172, 53, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(173, 53, 5, 'Day 5 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(174, 53, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(175, 53, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(176, 53, 8, 'Day 8 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(177, 53, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(178, 53, 10, 'Day 10 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(179, 53, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(180, 53, 12, 'Day 12 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(181, 53, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(182, 53, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(183, 53, 15, 'Day 15 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(184, 53, 16, 'Day 16 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(185, 53, 17, 'Day 17 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(186, 53, 18, 'Day 18 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(187, 53, 19, 'Day 19 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(188, 53, 20, 'Day 20 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(189, 53, 21, 'Day 21 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(190, 53, 22, 'Day 22 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(191, 53, 23, 'Day 23 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(192, 53, 24, 'Day 24 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(193, 53, 25, 'Day 25 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(194, 53, 26, 'Day 26 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 25, '2026-11-28 15:38:29'),
(195, 53, 27, 'Day 27 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(196, 53, 28, 'Day 28 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(197, 54, 1, 'Day 1 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(198, 54, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(199, 54, 3, 'Day 3 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(200, 54, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29');

INSERT IGNORE INTO `plan_contents` (`id`, `plan_id`, `day_number`, `title`, `activity_type`, `description`, `duration_mins`, `created_at`) VALUES
(201, 54, 5, 'Day 5 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(202, 54, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(203, 54, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(204, 54, 8, 'Day 8 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(205, 54, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(206, 54, 10, 'Day 10 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(207, 54, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(208, 54, 12, 'Day 12 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(209, 54, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(210, 54, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(211, 54, 15, 'Day 15 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(212, 54, 16, 'Day 16 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(213, 54, 17, 'Day 17 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(214, 54, 18, 'Day 18 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(215, 54, 19, 'Day 19 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(216, 54, 20, 'Day 20 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(217, 54, 21, 'Day 21 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(218, 54, 22, 'Day 22 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(219, 54, 23, 'Day 23 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(220, 54, 24, 'Day 24 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(221, 54, 25, 'Day 25 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(222, 54, 26, 'Day 26 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(223, 54, 27, 'Day 27 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(224, 54, 28, 'Day 28 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(225, 55, 1, 'Day 1 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(226, 55, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(227, 55, 3, 'Day 3 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(228, 55, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(229, 55, 5, 'Day 5 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(230, 55, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(231, 55, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(232, 55, 8, 'Day 8 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(233, 55, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(234, 55, 10, 'Day 10 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(235, 55, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(236, 55, 12, 'Day 12 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 20, '2026-11-28 15:38:29'),
(237, 55, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(238, 55, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(239, 56, 1, 'Day 1 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(240, 56, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(241, 56, 3, 'Day 3 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(242, 56, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(243, 56, 5, 'Day 5 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(244, 56, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(245, 56, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(246, 57, 1, 'Day 1 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(247, 57, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(248, 57, 3, 'Day 3 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(249, 57, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(250, 57, 5, 'Day 5 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(251, 57, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(252, 57, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(253, 58, 1, 'Day 1 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 20, '2026-11-28 15:38:29'),
(254, 58, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(255, 58, 3, 'Day 3 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 20, '2026-11-28 15:38:29'),
(256, 58, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(257, 58, 5, 'Day 5 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 20, '2026-11-28 15:38:29'),
(258, 58, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(259, 58, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(260, 58, 8, 'Day 8 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 20, '2026-11-28 15:38:29'),
(261, 58, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(262, 58, 10, 'Day 10 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 20, '2026-11-28 15:38:29'),
(263, 58, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(264, 58, 12, 'Day 12 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 20, '2026-11-28 15:38:29'),
(265, 58, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(266, 58, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(267, 59, 1, 'Day 1 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(268, 59, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(269, 59, 3, 'Day 3 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(270, 59, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(271, 59, 5, 'Day 5 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(272, 59, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(273, 59, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(274, 59, 8, 'Day 8 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(275, 59, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(276, 59, 10, 'Day 10 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(277, 59, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(278, 59, 12, 'Day 12 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(279, 59, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(280, 59, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(281, 60, 1, 'Day 1 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(282, 60, 2, 'Day 2 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(283, 60, 3, 'Day 3 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(284, 60, 4, 'Day 4 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(285, 60, 5, 'Day 5 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(286, 60, 6, 'Day 6 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(287, 60, 7, 'Day 7 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(288, 60, 8, 'Day 8 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(289, 60, 9, 'Day 9 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(290, 60, 10, 'Day 10 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(291, 60, 11, 'Day 11 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(292, 60, 12, 'Day 12 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(293, 60, 13, 'Day 13 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(294, 60, 14, 'Day 14 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(295, 60, 15, 'Day 15 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(296, 60, 16, 'Day 16 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(297, 60, 17, 'Day 17 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(298, 60, 18, 'Day 18 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(299, 60, 19, 'Day 19 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(300, 60, 20, 'Day 20 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29');

INSERT IGNORE INTO `plan_contents` (`id`, `plan_id`, `day_number`, `title`, `activity_type`, `description`, `duration_mins`, `created_at`) VALUES
(301, 60, 21, 'Day 21 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(302, 60, 22, 'Day 22 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(303, 60, 23, 'Day 23 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(304, 60, 24, 'Day 24 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(305, 60, 25, 'Day 25 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(306, 60, 26, 'Day 26 - Training', 'Workout', 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.', 30, '2026-11-28 15:38:29'),
(307, 60, 27, 'Day 27 - Mobility', 'Recovery', 'Move gently and stay within a comfortable range. Do not force stretches.', 15, '2026-11-28 15:38:29'),
(308, 60, 28, 'Day 28 - Rest', 'Rest', 'Rest today. An easy walk is optional.', 0, '2026-11-28 15:38:29'),
(512, 61, 1, 'Day 1 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(513, 61, 2, 'Day 2 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(514, 61, 3, 'Day 3 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(515, 61, 4, 'Day 4 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(516, 61, 5, 'Day 5 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(517, 61, 6, 'Day 6 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(518, 61, 7, 'Day 7 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(519, 61, 8, 'Day 8 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(520, 61, 9, 'Day 9 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(521, 61, 10, 'Day 10 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(522, 61, 11, 'Day 11 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(523, 61, 12, 'Day 12 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(524, 61, 13, 'Day 13 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(525, 61, 14, 'Day 14 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(526, 61, 15, 'Day 15 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(527, 61, 16, 'Day 16 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(528, 61, 17, 'Day 17 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(529, 61, 18, 'Day 18 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(530, 61, 19, 'Day 19 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(531, 61, 20, 'Day 20 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(532, 61, 21, 'Day 21 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(533, 61, 22, 'Day 22 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(534, 61, 23, 'Day 23 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(535, 61, 24, 'Day 24 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(536, 61, 25, 'Day 25 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(537, 61, 26, 'Day 26 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 45, '2026-11-28 15:38:35'),
(538, 61, 27, 'Day 27 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(539, 61, 28, 'Day 28 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(540, 62, 1, 'Day 1 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(541, 62, 2, 'Day 2 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(542, 62, 3, 'Day 3 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(543, 62, 4, 'Day 4 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(544, 62, 5, 'Day 5 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(545, 62, 6, 'Day 6 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(546, 62, 7, 'Day 7 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(547, 62, 8, 'Day 8 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(548, 62, 9, 'Day 9 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(549, 62, 10, 'Day 10 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(550, 62, 11, 'Day 11 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(551, 62, 12, 'Day 12 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(552, 62, 13, 'Day 13 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(553, 62, 14, 'Day 14 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(554, 62, 15, 'Day 15 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(555, 62, 16, 'Day 16 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(556, 62, 17, 'Day 17 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(557, 62, 18, 'Day 18 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(558, 62, 19, 'Day 19 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(559, 62, 20, 'Day 20 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(560, 62, 21, 'Day 21 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(561, 62, 22, 'Day 22 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(562, 62, 23, 'Day 23 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(563, 62, 24, 'Day 24 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(564, 62, 25, 'Day 25 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(565, 62, 26, 'Day 26 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 55, '2026-11-28 15:38:35'),
(566, 62, 27, 'Day 27 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(567, 62, 28, 'Day 28 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(568, 63, 1, 'Day 1 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 40, '2026-11-28 15:38:35'),
(569, 63, 2, 'Day 2 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(570, 63, 3, 'Day 3 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 40, '2026-11-28 15:38:35'),
(571, 63, 4, 'Day 4 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(572, 63, 5, 'Day 5 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 40, '2026-11-28 15:38:35'),
(573, 63, 6, 'Day 6 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(574, 63, 7, 'Day 7 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(575, 63, 8, 'Day 8 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 40, '2026-11-28 15:38:35'),
(576, 63, 9, 'Day 9 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(577, 63, 10, 'Day 10 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 40, '2026-11-28 15:38:35'),
(578, 63, 11, 'Day 11 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(579, 63, 12, 'Day 12 - Training', 'Workout', 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.', 40, '2026-11-28 15:38:35'),
(580, 63, 13, 'Day 13 - Mobility', 'Recovery', 'Easy mobility to recover. Stay within a comfortable range.', 15, '2026-11-28 15:38:35'),
(581, 63, 14, 'Day 14 - Rest', 'Rest', 'Full rest. Sleep well and eat enough protein to recover.', 0, '2026-11-28 15:38:35'),
(639, 40, 1, 'Week 1: Full-Body Strength A', 'Strength', 'Squat, bench press, and bent-over row at light, controlled loads to groove the core movement patterns.', 45, '2026-11-28 15:38:35'),
(640, 40, 2, 'Week 1: Mobility & Core', 'Mobility', 'Hip, shoulder, and ankle mobility drills paired with a basic anti-rotation core circuit.', 25, '2026-11-28 15:38:35'),
(641, 40, 3, 'Week 1: Full-Body Strength B', 'Strength', 'Deadlift, overhead press, and pull-up (or assisted row) variations focusing on bracing and bar path.', 45, '2026-11-28 15:38:35'),
(642, 40, 4, 'Week 1: Active Recovery Walk', 'Recovery', 'A brisk outdoor or treadmill walk to promote blood flow and aid recovery between lifting days.', 30, '2026-11-28 15:38:35'),
(643, 40, 5, 'Week 1: Full-Body Strength C', 'Strength', 'Front squat, incline press, and single-arm row to round out weekly volume with fresh angles.', 45, '2026-11-28 15:38:35'),
(644, 40, 6, 'Week 1: Conditioning Circuit', 'Cardio', 'Light kettlebell or bodyweight circuit to build work capacity without interfering with strength gains.', 30, '2026-11-28 15:38:35'),
(645, 40, 7, 'Week 1: Rest Day', 'Recovery', 'Full rest. Prioritize sleep, hydration, and protein intake to support muscle repair.', 10, '2026-11-28 15:38:35'),
(646, 40, 8, 'Week 2: Full-Body Strength A', 'Strength', 'Squat, bench press, and bent-over row at light, controlled loads to groove the core movement patterns.', 45, '2026-11-28 15:38:35'),
(647, 40, 9, 'Week 2: Mobility & Core', 'Mobility', 'Hip, shoulder, and ankle mobility drills paired with a basic anti-rotation core circuit.', 25, '2026-11-28 15:38:35'),
(648, 40, 10, 'Week 2: Full-Body Strength B', 'Strength', 'Deadlift, overhead press, and pull-up (or assisted row) variations focusing on bracing and bar path.', 45, '2026-11-28 15:38:35'),
(649, 40, 11, 'Week 2: Active Recovery Walk', 'Recovery', 'A brisk outdoor or treadmill walk to promote blood flow and aid recovery between lifting days.', 30, '2026-11-28 15:38:35'),
(650, 40, 12, 'Week 2: Full-Body Strength C', 'Strength', 'Front squat, incline press, and single-arm row to round out weekly volume with fresh angles.', 45, '2026-11-28 15:38:35'),
(651, 40, 13, 'Week 2: Conditioning Circuit', 'Cardio', 'Light kettlebell or bodyweight circuit to build work capacity without interfering with strength gains.', 30, '2026-11-28 15:38:35'),
(652, 40, 14, 'Week 2: Rest Day', 'Recovery', 'Full rest. Prioritize sleep, hydration, and protein intake to support muscle repair.', 10, '2026-11-28 15:38:35'),
(653, 40, 15, 'Week 3: Full-Body Strength A', 'Strength', 'Squat, bench press, and bent-over row at light, controlled loads to groove the core movement patterns.', 45, '2026-11-28 15:38:35'),
(654, 40, 16, 'Week 3: Mobility & Core', 'Mobility', 'Hip, shoulder, and ankle mobility drills paired with a basic anti-rotation core circuit.', 25, '2026-11-28 15:38:35'),
(655, 40, 17, 'Week 3: Full-Body Strength B', 'Strength', 'Deadlift, overhead press, and pull-up (or assisted row) variations focusing on bracing and bar path.', 45, '2026-11-28 15:38:35'),
(656, 40, 18, 'Week 3: Active Recovery Walk', 'Recovery', 'A brisk outdoor or treadmill walk to promote blood flow and aid recovery between lifting days.', 30, '2026-11-28 15:38:35'),
(657, 40, 19, 'Week 3: Full-Body Strength C', 'Strength', 'Front squat, incline press, and single-arm row to round out weekly volume with fresh angles.', 45, '2026-11-28 15:38:35'),
(658, 40, 20, 'Week 3: Conditioning Circuit', 'Cardio', 'Light kettlebell or bodyweight circuit to build work capacity without interfering with strength gains.', 30, '2026-11-28 15:38:35'),
(659, 40, 21, 'Week 3: Rest Day', 'Recovery', 'Full rest. Prioritize sleep, hydration, and protein intake to support muscle repair.', 10, '2026-11-28 15:38:35'),
(660, 40, 22, 'Week 4: Full-Body Strength A', 'Strength', 'Squat, bench press, and bent-over row at light, controlled loads to groove the core movement patterns.', 45, '2026-11-28 15:38:35');

INSERT IGNORE INTO `plan_contents` (`id`, `plan_id`, `day_number`, `title`, `activity_type`, `description`, `duration_mins`, `created_at`) VALUES
(661, 40, 23, 'Week 4: Mobility & Core', 'Mobility', 'Hip, shoulder, and ankle mobility drills paired with a basic anti-rotation core circuit.', 25, '2026-11-28 15:38:35'),
(662, 40, 24, 'Week 4: Full-Body Strength B', 'Strength', 'Deadlift, overhead press, and pull-up (or assisted row) variations focusing on bracing and bar path.', 45, '2026-11-28 15:38:35'),
(663, 40, 25, 'Week 4: Active Recovery Walk', 'Recovery', 'A brisk outdoor or treadmill walk to promote blood flow and aid recovery between lifting days.', 30, '2026-11-28 15:38:35'),
(664, 40, 26, 'Week 4: Full-Body Strength C', 'Strength', 'Front squat, incline press, and single-arm row to round out weekly volume with fresh angles.', 45, '2026-11-28 15:38:35'),
(665, 40, 27, 'Week 4: Conditioning Circuit', 'Cardio', 'Light kettlebell or bodyweight circuit to build work capacity without interfering with strength gains.', 30, '2026-11-28 15:38:35'),
(666, 40, 28, 'Week 4: Rest Day', 'Recovery', 'Full rest. Prioritize sleep, hydration, and protein intake to support muscle repair.', 10, '2026-11-28 15:38:35'),
(667, 41, 1, 'Week 1: Push Day - Chest/Shoulders/Triceps', 'Strength', 'Heavy bench press, overhead press, and dip variations followed by isolation work to failure.', 60, '2026-11-28 15:38:35'),
(668, 41, 2, 'Week 1: Pull Day - Back/Biceps', 'Strength', 'Weighted pull-ups, barbell rows, and deadlift variations with a biceps finisher superset.', 60, '2026-11-28 15:38:35'),
(669, 41, 3, 'Week 1: Leg Day - Quads/Hamstrings/Glutes', 'Strength', 'Back squat or front squat as the primary lift, followed by Romanian deadlifts and accessory leg work.', 65, '2026-11-28 15:38:35'),
(670, 41, 4, 'Week 1: Active Recovery & Mobility', 'Mobility', 'Foam rolling, hip and thoracic mobility work, and light cardio to flush fatigue before the next push.', 20, '2026-11-28 15:38:35'),
(671, 41, 5, 'Week 1: Upper Body Hypertrophy', 'Strength', 'Moderate-load, high-volume upper body supersets targeting chest, back, and shoulders.', 55, '2026-11-28 15:38:35'),
(672, 41, 6, 'Week 1: Lower Body & Core', 'Strength', 'Lunges, leg press, and weighted core circuit to close out the training week with volume.', 55, '2026-11-28 15:38:35'),
(673, 41, 7, 'Week 1: Rest Day', 'Recovery', 'Complete rest. This is where the growth happens - eat, sleep, and let the muscle rebuild.', 10, '2026-11-28 15:38:35'),
(674, 41, 8, 'Week 2: Push Day - Chest/Shoulders/Triceps', 'Strength', 'Heavy bench press, overhead press, and dip variations followed by isolation work to failure.', 60, '2026-11-28 15:38:35'),
(675, 41, 9, 'Week 2: Pull Day - Back/Biceps', 'Strength', 'Weighted pull-ups, barbell rows, and deadlift variations with a biceps finisher superset.', 60, '2026-11-28 15:38:35'),
(676, 41, 10, 'Week 2: Leg Day - Quads/Hamstrings/Glutes', 'Strength', 'Back squat or front squat as the primary lift, followed by Romanian deadlifts and accessory leg work.', 65, '2026-11-28 15:38:35'),
(677, 41, 11, 'Week 2: Active Recovery & Mobility', 'Mobility', 'Foam rolling, hip and thoracic mobility work, and light cardio to flush fatigue before the next push.', 20, '2026-11-28 15:38:35'),
(678, 41, 12, 'Week 2: Upper Body Hypertrophy', 'Strength', 'Moderate-load, high-volume upper body supersets targeting chest, back, and shoulders.', 55, '2026-11-28 15:38:35'),
(679, 41, 13, 'Week 2: Lower Body & Core', 'Strength', 'Lunges, leg press, and weighted core circuit to close out the training week with volume.', 55, '2026-11-28 15:38:35'),
(680, 41, 14, 'Week 2: Rest Day', 'Recovery', 'Complete rest. This is where the growth happens - eat, sleep, and let the muscle rebuild.', 10, '2026-11-28 15:38:35'),
(681, 41, 15, 'Week 3: Push Day - Chest/Shoulders/Triceps', 'Strength', 'Heavy bench press, overhead press, and dip variations followed by isolation work to failure.', 60, '2026-11-28 15:38:35'),
(682, 41, 16, 'Week 3: Pull Day - Back/Biceps', 'Strength', 'Weighted pull-ups, barbell rows, and deadlift variations with a biceps finisher superset.', 60, '2026-11-28 15:38:35'),
(683, 41, 17, 'Week 3: Leg Day - Quads/Hamstrings/Glutes', 'Strength', 'Back squat or front squat as the primary lift, followed by Romanian deadlifts and accessory leg work.', 65, '2026-11-28 15:38:35'),
(684, 41, 18, 'Week 3: Active Recovery & Mobility', 'Mobility', 'Foam rolling, hip and thoracic mobility work, and light cardio to flush fatigue before the next push.', 20, '2026-11-28 15:38:35'),
(685, 41, 19, 'Week 3: Upper Body Hypertrophy', 'Strength', 'Moderate-load, high-volume upper body supersets targeting chest, back, and shoulders.', 55, '2026-11-28 15:38:35'),
(686, 41, 20, 'Week 3: Lower Body & Core', 'Strength', 'Lunges, leg press, and weighted core circuit to close out the training week with volume.', 55, '2026-11-28 15:38:35'),
(687, 41, 21, 'Week 3: Rest Day', 'Recovery', 'Complete rest. This is where the growth happens - eat, sleep, and let the muscle rebuild.', 10, '2026-11-28 15:38:35'),
(688, 41, 22, 'Week 4: Push Day - Chest/Shoulders/Triceps', 'Strength', 'Heavy bench press, overhead press, and dip variations followed by isolation work to failure.', 60, '2026-11-28 15:38:35'),
(689, 41, 23, 'Week 4: Pull Day - Back/Biceps', 'Strength', 'Weighted pull-ups, barbell rows, and deadlift variations with a biceps finisher superset.', 60, '2026-11-28 15:38:35'),
(690, 41, 24, 'Week 4: Leg Day - Quads/Hamstrings/Glutes', 'Strength', 'Back squat or front squat as the primary lift, followed by Romanian deadlifts and accessory leg work.', 65, '2026-11-28 15:38:35'),
(691, 41, 25, 'Week 4: Active Recovery & Mobility', 'Mobility', 'Foam rolling, hip and thoracic mobility work, and light cardio to flush fatigue before the next push.', 20, '2026-11-28 15:38:35'),
(692, 41, 26, 'Week 4: Upper Body Hypertrophy', 'Strength', 'Moderate-load, high-volume upper body supersets targeting chest, back, and shoulders.', 55, '2026-11-28 15:38:35'),
(693, 41, 27, 'Week 4: Lower Body & Core', 'Strength', 'Lunges, leg press, and weighted core circuit to close out the training week with volume.', 55, '2026-11-28 15:38:35'),
(694, 41, 28, 'Week 4: Rest Day', 'Recovery', 'Complete rest. This is where the growth happens - eat, sleep, and let the muscle rebuild.', 10, '2026-11-28 15:38:35'),
(695, 41, 29, 'Week 5: Push Day - Chest/Shoulders/Triceps', 'Strength', 'Heavy bench press, overhead press, and dip variations followed by isolation work to failure.', 60, '2026-11-28 15:38:35'),
(696, 41, 30, 'Week 5: Pull Day - Back/Biceps', 'Strength', 'Weighted pull-ups, barbell rows, and deadlift variations with a biceps finisher superset.', 60, '2026-11-28 15:38:35'),
(697, 41, 31, 'Week 5: Leg Day - Quads/Hamstrings/Glutes', 'Strength', 'Back squat or front squat as the primary lift, followed by Romanian deadlifts and accessory leg work.', 65, '2026-11-28 15:38:35'),
(698, 41, 32, 'Week 5: Active Recovery & Mobility', 'Mobility', 'Foam rolling, hip and thoracic mobility work, and light cardio to flush fatigue before the next push.', 20, '2026-11-28 15:38:35'),
(699, 41, 33, 'Week 5: Upper Body Hypertrophy', 'Strength', 'Moderate-load, high-volume upper body supersets targeting chest, back, and shoulders.', 55, '2026-11-28 15:38:35'),
(700, 41, 34, 'Week 5: Lower Body & Core', 'Strength', 'Lunges, leg press, and weighted core circuit to close out the training week with volume.', 55, '2026-11-28 15:38:35'),
(701, 41, 35, 'Week 5: Rest Day', 'Recovery', 'Complete rest. This is where the growth happens - eat, sleep, and let the muscle rebuild.', 10, '2026-11-28 15:38:35'),
(702, 41, 36, 'Week 6: Push Day - Chest/Shoulders/Triceps', 'Strength', 'Heavy bench press, overhead press, and dip variations followed by isolation work to failure.', 60, '2026-11-28 15:38:35'),
(703, 41, 37, 'Week 6: Pull Day - Back/Biceps', 'Strength', 'Weighted pull-ups, barbell rows, and deadlift variations with a biceps finisher superset.', 60, '2026-11-28 15:38:35'),
(704, 41, 38, 'Week 6: Leg Day - Quads/Hamstrings/Glutes', 'Strength', 'Back squat or front squat as the primary lift, followed by Romanian deadlifts and accessory leg work.', 65, '2026-11-28 15:38:35'),
(705, 41, 39, 'Week 6: Active Recovery & Mobility', 'Mobility', 'Foam rolling, hip and thoracic mobility work, and light cardio to flush fatigue before the next push.', 20, '2026-11-28 15:38:35'),
(706, 41, 40, 'Week 6: Upper Body Hypertrophy', 'Strength', 'Moderate-load, high-volume upper body supersets targeting chest, back, and shoulders.', 55, '2026-11-28 15:38:35'),
(707, 41, 41, 'Week 6: Lower Body & Core', 'Strength', 'Lunges, leg press, and weighted core circuit to close out the training week with volume.', 55, '2026-11-28 15:38:35'),
(708, 41, 42, 'Week 6: Rest Day', 'Recovery', 'Complete rest. This is where the growth happens - eat, sleep, and let the muscle rebuild.', 10, '2026-11-28 15:38:35'),
(709, 41, 43, 'Week 7: Push Day - Chest/Shoulders/Triceps', 'Strength', 'Heavy bench press, overhead press, and dip variations followed by isolation work to failure.', 60, '2026-11-28 15:38:35'),
(710, 41, 44, 'Week 7: Pull Day - Back/Biceps', 'Strength', 'Weighted pull-ups, barbell rows, and deadlift variations with a biceps finisher superset.', 60, '2026-11-28 15:38:35'),
(711, 41, 45, 'Week 7: Leg Day - Quads/Hamstrings/Glutes', 'Strength', 'Back squat or front squat as the primary lift, followed by Romanian deadlifts and accessory leg work.', 65, '2026-11-28 15:38:35'),
(712, 41, 46, 'Week 7: Active Recovery & Mobility', 'Mobility', 'Foam rolling, hip and thoracic mobility work, and light cardio to flush fatigue before the next push.', 20, '2026-11-28 15:38:35'),
(713, 41, 47, 'Week 7: Upper Body Hypertrophy', 'Strength', 'Moderate-load, high-volume upper body supersets targeting chest, back, and shoulders.', 55, '2026-11-28 15:38:35'),
(714, 41, 48, 'Week 7: Lower Body & Core', 'Strength', 'Lunges, leg press, and weighted core circuit to close out the training week with volume.', 55, '2026-11-28 15:38:35'),
(715, 41, 49, 'Week 7: Rest Day', 'Recovery', 'Complete rest. This is where the growth happens - eat, sleep, and let the muscle rebuild.', 10, '2026-11-28 15:38:35'),
(716, 41, 50, 'Week 8: Push Day - Chest/Shoulders/Triceps', 'Strength', 'Heavy bench press, overhead press, and dip variations followed by isolation work to failure.', 60, '2026-11-28 15:38:35'),
(717, 41, 51, 'Week 8: Pull Day - Back/Biceps', 'Strength', 'Weighted pull-ups, barbell rows, and deadlift variations with a biceps finisher superset.', 60, '2026-11-28 15:38:35'),
(718, 41, 52, 'Week 8: Leg Day - Quads/Hamstrings/Glutes', 'Strength', 'Back squat or front squat as the primary lift, followed by Romanian deadlifts and accessory leg work.', 65, '2026-11-28 15:38:35'),
(719, 41, 53, 'Week 8: Active Recovery & Mobility', 'Mobility', 'Foam rolling, hip and thoracic mobility work, and light cardio to flush fatigue before the next push.', 20, '2026-11-28 15:38:35'),
(720, 41, 54, 'Week 8: Upper Body Hypertrophy', 'Strength', 'Moderate-load, high-volume upper body supersets targeting chest, back, and shoulders.', 55, '2026-11-28 15:38:35'),
(721, 41, 55, 'Week 8: Lower Body & Core', 'Strength', 'Lunges, leg press, and weighted core circuit to close out the training week with volume.', 55, '2026-11-28 15:38:35'),
(722, 41, 56, 'Week 8: Rest Day', 'Recovery', 'Complete rest. This is where the growth happens - eat, sleep, and let the muscle rebuild.', 10, '2026-11-28 15:38:35'),
(723, 42, 1, 'Week 1: Full-Body HIIT Circuit', 'HIIT', '40 seconds work / 20 seconds rest full-body circuit combining squats, push-ups, and mountain climbers.', 30, '2026-11-28 15:38:35'),
(724, 42, 2, 'Week 1: Steady-State Cardio', 'Cardio', 'Sustained moderate-pace cardio (jog, bike, or row) to build an aerobic base for fat oxidation.', 35, '2026-11-28 15:38:35'),
(725, 42, 3, 'Week 1: Lower-Body Burner Circuit', 'HIIT', 'Jump squats, lunges, and glute bridges in a fast-paced circuit to spike heart rate and burn calories.', 30, '2026-11-28 15:38:35'),
(726, 42, 4, 'Week 1: Active Recovery Walk', 'Recovery', 'An easy-paced walk to support recovery while still keeping daily activity levels elevated.', 20, '2026-11-28 15:38:35'),
(727, 42, 5, 'Week 1: Upper-Body & Core Circuit', 'HIIT', 'Push-ups, plank variations, and battle-rope or band work in a high-intensity superset format.', 30, '2026-11-28 15:38:35'),
(728, 42, 6, 'Week 1: Interval Sprints', 'Cardio', 'Short, hard sprint intervals with full recovery between rounds to maximize calorie burn.', 25, '2026-11-28 15:38:35'),
(729, 42, 7, 'Week 1: Rest & Recharge', 'Recovery', 'A full rest day to let the nervous system recover from the week\'s high-intensity work.', 10, '2026-11-28 15:38:35'),
(730, 42, 8, 'Week 2: Full-Body HIIT Circuit', 'HIIT', '40 seconds work / 20 seconds rest full-body circuit combining squats, push-ups, and mountain climbers.', 30, '2026-11-28 15:38:35'),
(731, 42, 9, 'Week 2: Steady-State Cardio', 'Cardio', 'Sustained moderate-pace cardio (jog, bike, or row) to build an aerobic base for fat oxidation.', 35, '2026-11-28 15:38:35'),
(732, 42, 10, 'Week 2: Lower-Body Burner Circuit', 'HIIT', 'Jump squats, lunges, and glute bridges in a fast-paced circuit to spike heart rate and burn calories.', 30, '2026-11-28 15:38:35'),
(733, 42, 11, 'Week 2: Active Recovery Walk', 'Recovery', 'An easy-paced walk to support recovery while still keeping daily activity levels elevated.', 20, '2026-11-28 15:38:35'),
(734, 42, 12, 'Week 2: Upper-Body & Core Circuit', 'HIIT', 'Push-ups, plank variations, and battle-rope or band work in a high-intensity superset format.', 30, '2026-11-28 15:38:35'),
(735, 42, 13, 'Week 2: Interval Sprints', 'Cardio', 'Short, hard sprint intervals with full recovery between rounds to maximize calorie burn.', 25, '2026-11-28 15:38:35'),
(736, 42, 14, 'Week 2: Rest & Recharge', 'Recovery', 'A full rest day to let the nervous system recover from the week\'s high-intensity work.', 10, '2026-11-28 15:38:35'),
(737, 43, 1, 'Week 1: Easy Aerobic Base', 'Cardio', 'Low-intensity run, row, or bike session designed to build aerobic base without accumulating fatigue.', 30, '2026-11-28 15:38:35'),
(738, 43, 2, 'Week 1: Tempo Intervals', 'Cardio', 'Comfortably-hard tempo intervals to push lactate threshold and improve sustained pace.', 25, '2026-11-28 15:38:35'),
(739, 43, 3, 'Week 1: Cross-Train Session', 'Cardio', 'A change of modality (bike or row) to build fitness while reducing repetitive impact stress.', 35, '2026-11-28 15:38:35'),
(740, 43, 4, 'Week 1: Mobility & Stretch', 'Mobility', 'Lower-body and hip mobility work to keep joints healthy under increasing training volume.', 20, '2026-11-28 15:38:35'),
(741, 43, 5, 'Week 1: Long Steady Endurance', 'Cardio', 'An extended steady-pace session to build endurance capacity and mental toughness.', 40, '2026-11-28 15:38:35'),
(742, 43, 6, 'Week 1: Hill or Resistance Intervals', 'Cardio', 'Uphill or resisted intervals to build power and strength alongside aerobic capacity.', 30, '2026-11-28 15:38:35'),
(743, 43, 7, 'Week 1: Rest Day', 'Recovery', 'Full rest to allow the cardiovascular system to adapt to the week\'s training load.', 10, '2026-11-28 15:38:35'),
(744, 43, 8, 'Week 2: Easy Aerobic Base', 'Cardio', 'Low-intensity run, row, or bike session designed to build aerobic base without accumulating fatigue.', 30, '2026-11-28 15:38:35'),
(745, 43, 9, 'Week 2: Tempo Intervals', 'Cardio', 'Comfortably-hard tempo intervals to push lactate threshold and improve sustained pace.', 25, '2026-11-28 15:38:35'),
(746, 43, 10, 'Week 2: Cross-Train Session', 'Cardio', 'A change of modality (bike or row) to build fitness while reducing repetitive impact stress.', 35, '2026-11-28 15:38:35'),
(747, 43, 11, 'Week 2: Mobility & Stretch', 'Mobility', 'Lower-body and hip mobility work to keep joints healthy under increasing training volume.', 20, '2026-11-28 15:38:35'),
(748, 43, 12, 'Week 2: Long Steady Endurance', 'Cardio', 'An extended steady-pace session to build endurance capacity and mental toughness.', 40, '2026-11-28 15:38:35'),
(749, 43, 13, 'Week 2: Hill or Resistance Intervals', 'Cardio', 'Uphill or resisted intervals to build power and strength alongside aerobic capacity.', 30, '2026-11-28 15:38:35'),
(750, 43, 14, 'Week 2: Rest Day', 'Recovery', 'Full rest to allow the cardiovascular system to adapt to the week\'s training load.', 10, '2026-11-28 15:38:35'),
(751, 43, 15, 'Week 3: Easy Aerobic Base', 'Cardio', 'Low-intensity run, row, or bike session designed to build aerobic base without accumulating fatigue.', 30, '2026-11-28 15:38:35'),
(752, 43, 16, 'Week 3: Tempo Intervals', 'Cardio', 'Comfortably-hard tempo intervals to push lactate threshold and improve sustained pace.', 25, '2026-11-28 15:38:35'),
(753, 43, 17, 'Week 3: Cross-Train Session', 'Cardio', 'A change of modality (bike or row) to build fitness while reducing repetitive impact stress.', 35, '2026-11-28 15:38:35'),
(754, 43, 18, 'Week 3: Mobility & Stretch', 'Mobility', 'Lower-body and hip mobility work to keep joints healthy under increasing training volume.', 20, '2026-11-28 15:38:35'),
(755, 43, 19, 'Week 3: Long Steady Endurance', 'Cardio', 'An extended steady-pace session to build endurance capacity and mental toughness.', 40, '2026-11-28 15:38:35'),
(756, 43, 20, 'Week 3: Hill or Resistance Intervals', 'Cardio', 'Uphill or resisted intervals to build power and strength alongside aerobic capacity.', 30, '2026-11-28 15:38:35'),
(757, 43, 21, 'Week 3: Rest Day', 'Recovery', 'Full rest to allow the cardiovascular system to adapt to the week\'s training load.', 10, '2026-11-28 15:38:35'),
(758, 43, 22, 'Week 4: Easy Aerobic Base', 'Cardio', 'Low-intensity run, row, or bike session designed to build aerobic base without accumulating fatigue.', 30, '2026-11-28 15:38:35'),
(759, 43, 23, 'Week 4: Tempo Intervals', 'Cardio', 'Comfortably-hard tempo intervals to push lactate threshold and improve sustained pace.', 25, '2026-11-28 15:38:35'),
(760, 43, 24, 'Week 4: Cross-Train Session', 'Cardio', 'A change of modality (bike or row) to build fitness while reducing repetitive impact stress.', 35, '2026-11-28 15:38:35');

INSERT IGNORE INTO `plan_contents` (`id`, `plan_id`, `day_number`, `title`, `activity_type`, `description`, `duration_mins`, `created_at`) VALUES
(761, 43, 25, 'Week 4: Mobility & Stretch', 'Mobility', 'Lower-body and hip mobility work to keep joints healthy under increasing training volume.', 20, '2026-11-28 15:38:35'),
(762, 43, 26, 'Week 4: Long Steady Endurance', 'Cardio', 'An extended steady-pace session to build endurance capacity and mental toughness.', 40, '2026-11-28 15:38:35'),
(763, 43, 27, 'Week 4: Hill or Resistance Intervals', 'Cardio', 'Uphill or resisted intervals to build power and strength alongside aerobic capacity.', 30, '2026-11-28 15:38:35'),
(764, 43, 28, 'Week 4: Rest Day', 'Recovery', 'Full rest to allow the cardiovascular system to adapt to the week\'s training load.', 10, '2026-11-28 15:38:35'),
(765, 44, 1, 'Morning Mobility Wake-Up', 'Mobility', 'A gentle full-body flow to open up the joints and get blood flowing before the day starts.', 15, '2026-11-28 15:38:35'),
(766, 44, 2, 'Hip Opener Flow', 'Mobility', 'Targeted hip flexor, glute, and adductor stretches to counter the effects of prolonged sitting.', 20, '2026-11-28 15:38:35'),
(767, 44, 3, 'Active Recovery Walk', 'Recovery', 'A relaxed-pace walk paired with deep breathing to promote circulation without adding fatigue.', 30, '2026-11-28 15:38:35'),
(768, 44, 4, 'Shoulder & Spine Reset', 'Mobility', 'Thoracic rotations and shoulder circles to restore upper-body range of motion.', 18, '2026-11-28 15:38:35'),
(769, 44, 5, 'Foam Rolling & Breathwork', 'Recovery', 'Self-myofascial release on major muscle groups followed by five minutes of diaphragmatic breathing.', 15, '2026-11-28 15:38:35'),
(770, 44, 6, 'Full-Body Stretch Flow', 'Mobility', 'A slow, continuous stretch sequence covering every major muscle group.', 25, '2026-11-28 15:38:35'),
(771, 44, 7, 'Rest & Reflect', 'Recovery', 'A true rest day - light walking only, plus a few minutes reflecting on how your body feels after the week.', 10, '2026-11-28 15:38:35'),
(772, 45, 1, 'Week 1: Lower Body Flexibility', 'Flexibility', 'Hamstring, quad, and calf stretches held for extended duration to improve lower-body range of motion.', 20, '2026-11-28 15:38:35'),
(773, 45, 2, 'Week 1: Upper Body & Shoulder Flow', 'Flexibility', 'Chest, shoulder, and thoracic spine stretches to counter rounded-shoulder posture.', 20, '2026-11-28 15:38:35'),
(774, 45, 3, 'Week 1: Hip & Spine Mobility', 'Flexibility', 'Deep hip openers and spinal rotations to improve everyday movement quality.', 20, '2026-11-28 15:38:35'),
(775, 45, 4, 'Week 1: Full-Body Stretch Flow', 'Flexibility', 'A continuous, slow-paced stretch sequence covering every major muscle group.', 25, '2026-11-28 15:38:35'),
(776, 45, 5, 'Week 1: Hamstring & Posterior Chain', 'Flexibility', 'Targeted posterior chain stretches to address tight hamstrings and lower back.', 20, '2026-11-28 15:38:35'),
(777, 45, 6, 'Week 1: Deep Stretch & Breathwork', 'Flexibility', 'Long-held passive stretches paired with diaphragmatic breathing for a parasympathetic reset.', 25, '2026-11-28 15:38:35'),
(778, 45, 7, 'Week 1: Rest & Reflect', 'Recovery', 'A light rest day - gentle movement only, plus reflection on flexibility gains so far.', 10, '2026-11-28 15:38:35'),
(779, 45, 8, 'Week 2: Lower Body Flexibility', 'Flexibility', 'Hamstring, quad, and calf stretches held for extended duration to improve lower-body range of motion.', 20, '2026-11-28 15:38:35'),
(780, 45, 9, 'Week 2: Upper Body & Shoulder Flow', 'Flexibility', 'Chest, shoulder, and thoracic spine stretches to counter rounded-shoulder posture.', 20, '2026-11-28 15:38:35'),
(781, 45, 10, 'Week 2: Hip & Spine Mobility', 'Flexibility', 'Deep hip openers and spinal rotations to improve everyday movement quality.', 20, '2026-11-28 15:38:35'),
(782, 45, 11, 'Week 2: Full-Body Stretch Flow', 'Flexibility', 'A continuous, slow-paced stretch sequence covering every major muscle group.', 25, '2026-11-28 15:38:35'),
(783, 45, 12, 'Week 2: Hamstring & Posterior Chain', 'Flexibility', 'Targeted posterior chain stretches to address tight hamstrings and lower back.', 20, '2026-11-28 15:38:35'),
(784, 45, 13, 'Week 2: Deep Stretch & Breathwork', 'Flexibility', 'Long-held passive stretches paired with diaphragmatic breathing for a parasympathetic reset.', 25, '2026-11-28 15:38:35'),
(785, 45, 14, 'Week 2: Rest & Reflect', 'Recovery', 'A light rest day - gentle movement only, plus reflection on flexibility gains so far.', 10, '2026-11-28 15:38:35');

-- --------------------------------------------------------
-- Table `plan_exercises`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plan_exercises` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_content_id` int NOT NULL,
  `exercise_order` int NOT NULL DEFAULT '1',
  `exercise_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sets` int DEFAULT NULL,
  `reps` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `rest_seconds` int DEFAULT NULL,
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_plan_content_id` (`plan_content_id`),
  CONSTRAINT `plan_exercises_ibfk_1` FOREIGN KEY (`plan_content_id`) REFERENCES `plan_contents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `plan_exercises` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_exercises` ADD COLUMN `plan_content_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_exercises' AND column_name = 'plan_content_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_exercises` ADD COLUMN `exercise_order` int NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_exercises' AND column_name = 'exercise_order');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_exercises` ADD COLUMN `exercise_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_exercises' AND column_name = 'exercise_name');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_exercises` ADD COLUMN `sets` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_exercises' AND column_name = 'sets');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_exercises` ADD COLUMN `reps` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_exercises' AND column_name = 'reps');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_exercises` ADD COLUMN `duration_seconds` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_exercises' AND column_name = 'duration_seconds');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_exercises` ADD COLUMN `rest_seconds` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_exercises' AND column_name = 'rest_seconds');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_exercises` ADD COLUMN `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plan_exercises' AND column_name = 'notes');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `plan_exercises` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plan_exercises` ADD CONSTRAINT `plan_exercises_ibfk_1` FOREIGN KEY (`plan_content_id`) REFERENCES `plan_contents` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plan_exercises' AND constraint_name = 'plan_exercises_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(1, 99, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(2, 101, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(3, 103, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(4, 106, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(5, 108, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(6, 110, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(7, 113, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(8, 115, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(9, 117, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(10, 120, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(11, 122, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(12, 124, 1, 'Bodyweight Squats', 3, '10', NULL, 45, 'Use a comfortable depth.'),
(13, 1, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(14, 3, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(15, 5, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(16, 8, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(17, 10, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(18, 12, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(19, 15, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(20, 17, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(21, 19, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(22, 22, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(23, 24, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(24, 26, 1, 'Bodyweight Squats', 2, '10', NULL, 45, 'Use a comfortable depth.'),
(25, 99, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(26, 101, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(27, 103, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(28, 106, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(29, 108, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(30, 110, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(31, 113, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(32, 115, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(33, 117, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(34, 120, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(35, 122, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(36, 124, 2, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(37, 1, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(38, 3, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(39, 5, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(40, 8, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(41, 10, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(42, 12, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(43, 15, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(44, 17, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(45, 19, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(46, 22, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(47, 24, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(48, 26, 2, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(49, 99, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(50, 101, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(51, 103, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(52, 106, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(53, 108, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(54, 110, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(55, 113, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(56, 115, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(57, 117, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(58, 120, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(59, 122, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(60, 124, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Squeeze gently at the top.'),
(61, 1, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(62, 3, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(63, 5, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(64, 8, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(65, 10, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(66, 12, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(67, 15, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(68, 17, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(69, 19, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(70, 22, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(71, 24, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(72, 26, 3, 'Glute Bridge', 2, '12', NULL, 45, 'Squeeze gently at the top.'),
(73, 99, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(74, 101, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(75, 103, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(76, 106, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(77, 108, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(78, 110, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(79, 113, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(80, 115, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(81, 117, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(82, 120, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(83, 122, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(84, 124, 4, 'Plank', 3, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(85, 1, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(86, 3, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(87, 5, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(88, 8, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(89, 10, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(90, 12, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(91, 15, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(92, 17, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(93, 19, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(94, 22, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(95, 24, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(96, 26, 4, 'Plank', 2, NULL, 20, 45, 'Keep breathing; shorten the hold if needed.'),
(97, 29, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(98, 31, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(99, 33, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(100, 36, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(101, 38, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(102, 40, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(103, 43, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(104, 45, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(105, 47, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(106, 50, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(107, 52, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(108, 54, 1, 'Push-Ups', 2, '8', NULL, 45, 'Knees down to scale.'),
(109, 29, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(110, 31, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(111, 33, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(112, 36, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(113, 38, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(114, 40, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(115, 43, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(116, 45, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(117, 47, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(118, 50, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(119, 52, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(120, 54, 2, 'Wall Push-Ups', 2, '12', NULL, 45, 'Keep your body aligned.'),
(121, 29, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(122, 31, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(123, 33, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(124, 36, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(125, 38, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(126, 40, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(127, 43, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(128, 45, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(129, 47, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(130, 50, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(131, 52, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(132, 54, 3, 'Plank Shoulder Taps', 2, '10 total', NULL, 45, 'Keep hips still.'),
(133, 29, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(134, 31, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(135, 33, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(136, 36, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(137, 38, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(138, 40, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(139, 43, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(140, 45, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(141, 47, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(142, 50, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(143, 52, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(144, 54, 4, 'Bird Dog', 2, '8 each side', NULL, 45, 'Reach slowly without arching.'),
(145, 57, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(146, 59, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(147, 61, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(148, 64, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(149, 66, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(150, 68, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(151, 71, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(152, 73, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(153, 75, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(154, 78, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(155, 80, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(156, 82, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Keep heels grounded.'),
(157, 57, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(158, 59, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(159, 61, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(160, 64, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(161, 66, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(162, 68, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(163, 71, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(164, 73, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(165, 75, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(166, 78, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(167, 80, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(168, 82, 2, 'Reverse Lunges', 3, '8 each side', NULL, 45, 'Use support for balance if needed.'),
(169, 57, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(170, 59, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(171, 61, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(172, 64, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(173, 66, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(174, 68, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(175, 71, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(176, 73, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(177, 75, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(178, 78, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(179, 80, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(180, 82, 3, 'Glute Bridge', 3, '12', NULL, 45, 'Do not overarch your back.'),
(181, 57, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(182, 59, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(183, 61, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(184, 64, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(185, 66, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(186, 68, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(187, 71, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(188, 73, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(189, 75, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(190, 78, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(191, 80, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(192, 82, 4, 'Calf Raises', 3, '15', NULL, 45, 'Lower slowly.'),
(193, 85, 1, 'Dead Bug', 2, '8 each side', NULL, 45, 'Keep the lower back stable.'),
(194, 87, 1, 'Dead Bug', 2, '8 each side', NULL, 45, 'Keep the lower back stable.'),
(195, 89, 1, 'Dead Bug', 2, '8 each side', NULL, 45, 'Keep the lower back stable.'),
(196, 92, 1, 'Dead Bug', 2, '8 each side', NULL, 45, 'Keep the lower back stable.'),
(197, 94, 1, 'Dead Bug', 2, '8 each side', NULL, 45, 'Keep the lower back stable.'),
(198, 96, 1, 'Dead Bug', 2, '8 each side', NULL, 45, 'Keep the lower back stable.'),
(199, 85, 2, 'Bird Dog', 2, '8 each side', NULL, 45, 'Pause briefly at extension.'),
(200, 87, 2, 'Bird Dog', 2, '8 each side', NULL, 45, 'Pause briefly at extension.');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(201, 89, 2, 'Bird Dog', 2, '8 each side', NULL, 45, 'Pause briefly at extension.'),
(202, 92, 2, 'Bird Dog', 2, '8 each side', NULL, 45, 'Pause briefly at extension.'),
(203, 94, 2, 'Bird Dog', 2, '8 each side', NULL, 45, 'Pause briefly at extension.'),
(204, 96, 2, 'Bird Dog', 2, '8 each side', NULL, 45, 'Pause briefly at extension.'),
(205, 85, 3, 'Plank', 2, NULL, 20, 45, 'Stop before your hips sag.'),
(206, 87, 3, 'Plank', 2, NULL, 20, 45, 'Stop before your hips sag.'),
(207, 89, 3, 'Plank', 2, NULL, 20, 45, 'Stop before your hips sag.'),
(208, 92, 3, 'Plank', 2, NULL, 20, 45, 'Stop before your hips sag.'),
(209, 94, 3, 'Plank', 2, NULL, 20, 45, 'Stop before your hips sag.'),
(210, 96, 3, 'Plank', 2, NULL, 20, 45, 'Stop before your hips sag.'),
(211, 85, 4, 'Side Plank', 2, NULL, 15, 45, 'Hold each side; lower knee down to scale.'),
(212, 87, 4, 'Side Plank', 2, NULL, 15, 45, 'Hold each side; lower knee down to scale.'),
(213, 89, 4, 'Side Plank', 2, NULL, 15, 45, 'Hold each side; lower knee down to scale.'),
(214, 92, 4, 'Side Plank', 2, NULL, 15, 45, 'Hold each side; lower knee down to scale.'),
(215, 94, 4, 'Side Plank', 2, NULL, 15, 45, 'Hold each side; lower knee down to scale.'),
(216, 96, 4, 'Side Plank', 2, NULL, 15, 45, 'Hold each side; lower knee down to scale.'),
(217, 169, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(218, 171, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(219, 173, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(220, 176, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(221, 178, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(222, 180, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(223, 183, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(224, 185, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(225, 187, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(226, 190, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(227, 192, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(228, 194, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(229, 127, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(230, 129, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(231, 131, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(232, 134, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(233, 136, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(234, 138, 1, 'March in Place', 2, NULL, 40, 45, 'Keep an easy conversational pace.'),
(235, 169, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(236, 171, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(237, 173, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(238, 176, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(239, 178, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(240, 180, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(241, 183, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(242, 185, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(243, 187, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(244, 190, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(245, 192, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(246, 194, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(247, 127, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(248, 129, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(249, 131, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(250, 134, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(251, 136, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(252, 138, 2, 'Step Jacks', 2, NULL, 40, 45, 'Step sideways instead of jumping.'),
(253, 169, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(254, 171, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(255, 173, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(256, 176, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(257, 178, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(258, 180, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(259, 183, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(260, 185, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(261, 187, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(262, 190, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(263, 192, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(264, 194, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(265, 127, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(266, 129, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(267, 131, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(268, 134, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(269, 136, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(270, 138, 3, 'Side Steps', 2, NULL, 40, 45, 'Use soft knees.'),
(271, 169, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(272, 171, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(273, 173, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(274, 176, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(275, 178, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(276, 180, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(277, 183, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(278, 185, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(279, 187, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(280, 190, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(281, 192, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(282, 194, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(283, 127, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(284, 129, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(285, 131, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(286, 134, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(287, 136, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(288, 138, 4, 'Standing Knee Raises', 2, NULL, 30, 45, 'Alternate legs slowly.'),
(289, 141, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.'),
(290, 143, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.'),
(291, 145, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.'),
(292, 148, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.'),
(293, 150, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.'),
(294, 152, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.'),
(295, 155, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.'),
(296, 157, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.'),
(297, 159, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.'),
(298, 162, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.'),
(299, 164, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.'),
(300, 166, 1, 'Jumping Jacks', 3, NULL, 30, 45, 'Use step jacks to reduce impact.');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(301, 141, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(302, 143, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(303, 145, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(304, 148, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(305, 150, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(306, 152, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(307, 155, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(308, 157, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(309, 159, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(310, 162, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(311, 164, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(312, 166, 2, 'High Knees', 3, NULL, 30, 45, 'March instead of running to scale.'),
(313, 141, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(314, 143, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(315, 145, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(316, 148, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(317, 150, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(318, 152, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(319, 155, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(320, 157, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(321, 159, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(322, 162, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(323, 164, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(324, 166, 3, 'Mountain Climbers', 3, NULL, 20, 45, 'Step feet in slowly if needed.'),
(325, 141, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(326, 143, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(327, 145, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(328, 148, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(329, 150, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(330, 152, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(331, 155, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(332, 157, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(333, 159, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(334, 162, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(335, 164, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(336, 166, 4, 'Skaters', 3, NULL, 30, 45, 'Step side to side instead of jumping to scale.'),
(337, 225, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(338, 227, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(339, 229, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(340, 232, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(341, 234, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(342, 236, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(343, 197, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(344, 199, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(345, 201, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(346, 204, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(347, 206, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(348, 208, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(349, 211, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(350, 213, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(351, 215, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(352, 218, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(353, 220, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(354, 222, 1, 'Bodyweight Squats', 3, '12', NULL, 45, 'Use controlled repetitions.'),
(355, 225, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(356, 227, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(357, 229, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(358, 232, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(359, 234, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(360, 236, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(361, 197, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(362, 199, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(363, 201, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(364, 204, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(365, 206, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(366, 208, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(367, 211, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(368, 213, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(369, 215, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(370, 218, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(371, 220, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(372, 222, 2, 'Step Jacks', 3, NULL, 40, 45, 'Maintain a steady pace.'),
(373, 225, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(374, 227, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(375, 229, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(376, 232, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(377, 234, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(378, 236, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(379, 197, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(380, 199, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(381, 201, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(382, 204, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(383, 206, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(384, 208, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(385, 211, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(386, 213, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(387, 215, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(388, 218, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(389, 220, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(390, 222, 3, 'Push-Ups', 3, '8', NULL, 45, 'Knees down to scale.'),
(391, 225, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(392, 227, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(393, 229, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(394, 232, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(395, 234, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(396, 236, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(397, 197, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(398, 199, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(399, 201, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(400, 204, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(401, 206, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(402, 208, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(403, 211, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(404, 213, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(405, 215, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(406, 218, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(407, 220, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(408, 222, 4, 'Mountain Climbers', 3, NULL, 20, 45, 'Step rather than run to scale.'),
(409, 282, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(410, 286, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(411, 289, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(412, 293, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(413, 296, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(414, 300, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(415, 303, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(416, 307, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(417, 246, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(418, 247, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(419, 248, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(420, 250, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(421, 251, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(422, 239, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(423, 240, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(424, 241, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(425, 243, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(426, 244, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(427, 226, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(428, 230, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(429, 233, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(430, 237, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(431, 198, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(432, 202, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(433, 205, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(434, 209, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(435, 212, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(436, 216, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(437, 219, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(438, 223, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(439, 170, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(440, 174, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(441, 177, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(442, 181, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(443, 184, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(444, 188, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(445, 191, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(446, 195, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(447, 142, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(448, 146, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(449, 149, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(450, 153, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(451, 156, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(452, 160, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(453, 163, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(454, 167, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(455, 128, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(456, 132, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(457, 135, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(458, 139, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(459, 100, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(460, 104, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(461, 107, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(462, 111, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(463, 114, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(464, 118, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(465, 121, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(466, 125, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(467, 86, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(468, 90, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(469, 93, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(470, 97, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(471, 58, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(472, 62, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(473, 65, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(474, 69, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(475, 72, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(476, 76, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(477, 79, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(478, 83, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(479, 30, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(480, 34, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(481, 37, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(482, 41, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(483, 44, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(484, 48, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(485, 51, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(486, 55, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(487, 2, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(488, 6, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(489, 9, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(490, 13, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(491, 16, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(492, 20, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(493, 23, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(494, 27, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(495, 282, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(496, 286, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(497, 289, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(498, 293, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(499, 296, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(500, 300, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(501, 303, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(502, 307, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(503, 246, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(504, 247, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(505, 248, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(506, 250, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(507, 251, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(508, 239, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(509, 240, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(510, 241, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(511, 243, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(512, 244, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(513, 226, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(514, 230, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(515, 233, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(516, 237, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(517, 198, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(518, 202, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(519, 205, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(520, 209, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(521, 212, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(522, 216, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(523, 219, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(524, 223, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(525, 170, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(526, 174, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(527, 177, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(528, 181, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(529, 184, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(530, 188, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(531, 191, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(532, 195, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(533, 142, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(534, 146, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(535, 149, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(536, 153, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(537, 156, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(538, 160, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(539, 163, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(540, 167, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(541, 128, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(542, 132, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(543, 135, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(544, 139, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(545, 100, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(546, 104, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(547, 107, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(548, 111, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(549, 114, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(550, 118, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(551, 121, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(552, 125, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(553, 86, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(554, 90, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(555, 93, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(556, 97, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(557, 58, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(558, 62, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(559, 65, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(560, 69, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(561, 72, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(562, 76, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(563, 79, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(564, 83, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(565, 30, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(566, 34, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(567, 37, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(568, 41, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(569, 44, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(570, 48, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(571, 51, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(572, 55, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(573, 2, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(574, 6, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(575, 9, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(576, 13, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(577, 16, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(578, 20, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(579, 23, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(580, 27, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(581, 282, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(582, 286, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(583, 289, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(584, 293, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(585, 296, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(586, 300, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(587, 303, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(588, 307, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(589, 246, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(590, 247, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(591, 248, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(592, 250, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(593, 251, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(594, 239, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(595, 240, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(596, 241, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(597, 243, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(598, 244, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(599, 226, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(600, 230, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(601, 233, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(602, 237, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(603, 198, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(604, 202, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(605, 205, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(606, 209, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(607, 212, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(608, 216, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(609, 219, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(610, 223, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(611, 170, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(612, 174, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(613, 177, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(614, 181, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(615, 184, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(616, 188, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(617, 191, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(618, 195, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(619, 142, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(620, 146, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(621, 149, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(622, 153, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(623, 156, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(624, 160, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(625, 163, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(626, 167, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(627, 128, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(628, 132, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(629, 135, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(630, 139, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(631, 100, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(632, 104, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(633, 107, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(634, 111, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(635, 114, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(636, 118, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(637, 121, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(638, 125, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(639, 86, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(640, 90, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(641, 93, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(642, 97, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(643, 58, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(644, 62, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(645, 65, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(646, 69, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(647, 72, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(648, 76, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(649, 79, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(650, 83, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(651, 30, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(652, 34, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(653, 37, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(654, 41, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(655, 44, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(656, 48, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(657, 51, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(658, 55, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(659, 2, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(660, 6, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(661, 9, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(662, 13, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(663, 16, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(664, 20, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(665, 23, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(666, 27, 3, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Keep the stretch gentle.'),
(667, 282, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(668, 286, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(669, 289, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(670, 293, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(671, 296, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(672, 300, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(673, 303, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(674, 307, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(675, 246, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(676, 247, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(677, 248, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(678, 250, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(679, 251, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(680, 239, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(681, 240, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(682, 241, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(683, 243, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(684, 244, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(685, 226, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(686, 230, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(687, 233, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(688, 237, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(689, 198, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(690, 202, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(691, 205, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(692, 209, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(693, 212, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(694, 216, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(695, 219, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(696, 223, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(697, 170, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(698, 174, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(699, 177, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(700, 181, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(701, 184, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(702, 188, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(703, 191, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(704, 195, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(705, 142, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(706, 146, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(707, 149, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(708, 153, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(709, 156, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(710, 160, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(711, 163, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(712, 167, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(713, 128, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(714, 132, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(715, 135, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(716, 139, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(717, 100, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(718, 104, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(719, 107, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(720, 111, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(721, 114, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(722, 118, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(723, 121, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(724, 125, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(725, 86, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(726, 90, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(727, 93, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(728, 97, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(729, 58, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(730, 62, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(731, 65, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(732, 69, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(733, 72, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(734, 76, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(735, 79, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(736, 83, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(737, 30, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(738, 34, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(739, 37, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(740, 41, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(741, 44, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(742, 48, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(743, 51, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(744, 55, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(745, 2, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(746, 6, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(747, 9, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(748, 13, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(749, 16, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(750, 20, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(751, 23, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(752, 27, 4, 'Deep Breathing', 2, NULL, 60, 20, 'Breathe slowly and comfortably.'),
(753, 253, 1, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Do not force the range.'),
(754, 254, 1, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Do not force the range.'),
(755, 255, 1, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Do not force the range.'),
(756, 257, 1, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Do not force the range.'),
(757, 258, 1, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Do not force the range.'),
(758, 260, 1, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Do not force the range.'),
(759, 261, 1, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Do not force the range.'),
(760, 262, 1, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Do not force the range.'),
(761, 264, 1, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Do not force the range.'),
(762, 265, 1, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Do not force the range.'),
(763, 253, 2, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side without arching your back.'),
(764, 254, 2, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side without arching your back.'),
(765, 255, 2, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side without arching your back.'),
(766, 257, 2, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side without arching your back.'),
(767, 258, 2, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side without arching your back.'),
(768, 260, 2, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side without arching your back.'),
(769, 261, 2, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side without arching your back.'),
(770, 262, 2, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side without arching your back.'),
(771, 264, 2, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side without arching your back.'),
(772, 265, 2, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side without arching your back.'),
(773, 253, 3, 'Seated Figure Four Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(774, 254, 3, 'Seated Figure Four Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(775, 255, 3, 'Seated Figure Four Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(776, 257, 3, 'Seated Figure Four Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(777, 258, 3, 'Seated Figure Four Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(778, 260, 3, 'Seated Figure Four Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(779, 261, 3, 'Seated Figure Four Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(780, 262, 3, 'Seated Figure Four Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(781, 264, 3, 'Seated Figure Four Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(782, 265, 3, 'Seated Figure Four Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(783, 253, 4, 'Glute Bridge', 2, '10', NULL, 20, 'Move slowly.'),
(784, 254, 4, 'Glute Bridge', 2, '10', NULL, 20, 'Move slowly.'),
(785, 255, 4, 'Glute Bridge', 2, '10', NULL, 20, 'Move slowly.'),
(786, 257, 4, 'Glute Bridge', 2, '10', NULL, 20, 'Move slowly.'),
(787, 258, 4, 'Glute Bridge', 2, '10', NULL, 20, 'Move slowly.'),
(788, 260, 4, 'Glute Bridge', 2, '10', NULL, 20, 'Move slowly.'),
(789, 261, 4, 'Glute Bridge', 2, '10', NULL, 20, 'Move slowly.'),
(790, 262, 4, 'Glute Bridge', 2, '10', NULL, 20, 'Move slowly.'),
(791, 264, 4, 'Glute Bridge', 2, '10', NULL, 20, 'Move slowly.'),
(792, 265, 4, 'Glute Bridge', 2, '10', NULL, 20, 'Move slowly.'),
(793, 267, 1, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(794, 268, 1, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(795, 269, 1, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(796, 271, 1, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(797, 272, 1, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(798, 274, 1, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(799, 275, 1, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(800, 276, 1, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(801, 278, 1, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(802, 279, 1, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(803, 267, 2, 'Calf Stretch', 2, NULL, 30, 20, 'Hold each side.'),
(804, 268, 2, 'Calf Stretch', 2, NULL, 30, 20, 'Hold each side.'),
(805, 269, 2, 'Calf Stretch', 2, NULL, 30, 20, 'Hold each side.'),
(806, 271, 2, 'Calf Stretch', 2, NULL, 30, 20, 'Hold each side.'),
(807, 272, 2, 'Calf Stretch', 2, NULL, 30, 20, 'Hold each side.'),
(808, 274, 2, 'Calf Stretch', 2, NULL, 30, 20, 'Hold each side.'),
(809, 275, 2, 'Calf Stretch', 2, NULL, 30, 20, 'Hold each side.'),
(810, 276, 2, 'Calf Stretch', 2, NULL, 30, 20, 'Hold each side.'),
(811, 278, 2, 'Calf Stretch', 2, NULL, 30, 20, 'Hold each side.'),
(812, 279, 2, 'Calf Stretch', 2, NULL, 30, 20, 'Hold each side.'),
(813, 267, 3, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(814, 268, 3, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(815, 269, 3, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(816, 271, 3, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(817, 272, 3, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(818, 274, 3, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(819, 275, 3, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(820, 276, 3, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(821, 278, 3, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(822, 279, 3, 'Hip Flexor Stretch', 2, NULL, 30, 20, 'Hold each side gently.'),
(823, 267, 4, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Breathe steadily.'),
(824, 268, 4, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Breathe steadily.'),
(825, 269, 4, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Breathe steadily.'),
(826, 271, 4, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Breathe steadily.'),
(827, 272, 4, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Breathe steadily.'),
(828, 274, 4, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Breathe steadily.'),
(829, 275, 4, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Breathe steadily.'),
(830, 276, 4, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Breathe steadily.'),
(831, 278, 4, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Breathe steadily.'),
(832, 279, 4, 'Child\'s Pose Hold', 2, NULL, 30, 20, 'Breathe steadily.'),
(833, 281, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(834, 283, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(835, 285, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(836, 288, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(837, 290, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(838, 292, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(839, 295, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(840, 297, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(841, 299, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(842, 302, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(843, 304, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(844, 306, 1, 'Reverse Lunges', 3, '10 each side', NULL, 45, 'Step back with control.'),
(845, 281, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(846, 283, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(847, 285, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(848, 288, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(849, 290, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(850, 292, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(851, 295, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(852, 297, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(853, 299, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(854, 302, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(855, 304, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(856, 306, 2, 'Bodyweight Squats', 3, '12', NULL, 45, 'Maintain a steady tempo.'),
(857, 281, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(858, 283, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(859, 285, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(860, 288, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(861, 290, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(862, 292, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(863, 295, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(864, 297, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(865, 299, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(866, 302, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(867, 304, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(868, 306, 3, 'Plank Shoulder Taps', 3, '12 total', NULL, 45, 'Keep hips still.'),
(869, 281, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(870, 283, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(871, 285, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(872, 288, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(873, 290, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(874, 292, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(875, 295, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(876, 297, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(877, 299, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(878, 302, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(879, 304, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(880, 306, 4, 'Bird Dog', 3, '10 each side', NULL, 45, 'Pause at extension.'),
(1024, 537, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1025, 535, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1026, 533, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1027, 530, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1028, 528, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1029, 526, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1030, 523, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1031, 521, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1032, 519, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1033, 516, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1034, 514, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1035, 512, 1, 'Bodyweight Squats', 4, '20', NULL, 60, '3-second lowering phase.'),
(1036, 537, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.'),
(1037, 535, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.'),
(1038, 533, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.'),
(1039, 530, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.'),
(1040, 528, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.'),
(1041, 526, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.'),
(1042, 523, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.'),
(1043, 521, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(1044, 519, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.'),
(1045, 516, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.'),
(1046, 514, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.'),
(1047, 512, 2, 'Push-Ups', 4, '15', NULL, 60, 'Chest to fist height; full lockout.'),
(1048, 537, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1049, 535, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1050, 533, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1051, 530, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1052, 528, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1053, 526, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1054, 523, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1055, 521, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1056, 519, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1057, 516, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1058, 514, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1059, 512, 3, 'Reverse Lunges', 3, '12 each side', NULL, 60, 'Front knee tracks over the toes.'),
(1060, 537, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1061, 535, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1062, 533, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1063, 530, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1064, 528, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1065, 526, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1066, 523, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1067, 521, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1068, 519, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1069, 516, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1070, 514, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1071, 512, 4, 'Glute Bridge', 3, '20', NULL, 45, 'Pause 2 seconds at the top.'),
(1072, 537, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1073, 535, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1074, 533, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1075, 530, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1076, 528, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1077, 526, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1078, 523, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1079, 521, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1080, 519, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1081, 516, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1082, 514, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1083, 512, 5, 'Plank', 3, NULL, 60, 45, 'Squeeze glutes; no sagging.'),
(1084, 565, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1085, 563, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1086, 561, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1087, 558, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1088, 556, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1089, 554, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1090, 551, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1091, 549, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1092, 547, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1093, 544, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1094, 542, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1095, 540, 1, 'Bodyweight Squats', 5, '25', NULL, 75, '4-second lowering phase.'),
(1096, 565, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1097, 563, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1098, 561, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1099, 558, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1100, 556, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1101, 554, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1102, 551, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1103, 549, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1104, 547, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1105, 544, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1106, 542, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1107, 540, 2, 'Push-Ups', 5, '20', NULL, 75, 'Slow lowering; explode up.'),
(1108, 565, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1109, 563, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1110, 561, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1111, 558, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1112, 556, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1113, 554, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1114, 551, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1115, 549, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1116, 547, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1117, 544, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1118, 542, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1119, 540, 3, 'Bulgarian Split Squats', 4, '12 each side', NULL, 75, 'Rear foot on a sturdy chair.'),
(1120, 565, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1121, 563, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1122, 561, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1123, 558, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1124, 556, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1125, 554, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1126, 551, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1127, 549, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1128, 547, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1129, 544, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1130, 542, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1131, 540, 4, 'Single-Leg Glute Bridge', 4, '15 each side', NULL, 60, 'Hips stay level.'),
(1132, 565, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.'),
(1133, 563, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.'),
(1134, 561, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.'),
(1135, 558, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.'),
(1136, 556, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.'),
(1137, 554, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.'),
(1138, 551, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.'),
(1139, 549, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.'),
(1140, 547, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.'),
(1141, 544, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.'),
(1142, 542, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.'),
(1143, 540, 5, 'Plank', 4, NULL, 90, 60, 'Stop if your lower back aches.');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(1144, 565, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1145, 563, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1146, 561, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1147, 558, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1148, 556, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1149, 554, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1150, 551, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1151, 549, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1152, 547, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1153, 544, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1154, 542, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1155, 540, 6, 'Side Plank', 3, NULL, 45, 45, 'Each side.'),
(1156, 579, 1, 'Jumping Jacks', 5, NULL, 45, 20, 'Step jacks if impact bothers you.'),
(1157, 577, 1, 'Jumping Jacks', 5, NULL, 45, 20, 'Step jacks if impact bothers you.'),
(1158, 575, 1, 'Jumping Jacks', 5, NULL, 45, 20, 'Step jacks if impact bothers you.'),
(1159, 572, 1, 'Jumping Jacks', 5, NULL, 45, 20, 'Step jacks if impact bothers you.'),
(1160, 570, 1, 'Jumping Jacks', 5, NULL, 45, 20, 'Step jacks if impact bothers you.'),
(1161, 568, 1, 'Jumping Jacks', 5, NULL, 45, 20, 'Step jacks if impact bothers you.'),
(1162, 579, 2, 'Mountain Climbers', 5, NULL, 40, 20, 'Hips level with shoulders.'),
(1163, 577, 2, 'Mountain Climbers', 5, NULL, 40, 20, 'Hips level with shoulders.'),
(1164, 575, 2, 'Mountain Climbers', 5, NULL, 40, 20, 'Hips level with shoulders.'),
(1165, 572, 2, 'Mountain Climbers', 5, NULL, 40, 20, 'Hips level with shoulders.'),
(1166, 570, 2, 'Mountain Climbers', 5, NULL, 40, 20, 'Hips level with shoulders.'),
(1167, 568, 2, 'Mountain Climbers', 5, NULL, 40, 20, 'Hips level with shoulders.'),
(1168, 579, 3, 'Bodyweight Squats', 5, '25', NULL, 30, 'Fast but controlled.'),
(1169, 577, 3, 'Bodyweight Squats', 5, '25', NULL, 30, 'Fast but controlled.'),
(1170, 575, 3, 'Bodyweight Squats', 5, '25', NULL, 30, 'Fast but controlled.'),
(1171, 572, 3, 'Bodyweight Squats', 5, '25', NULL, 30, 'Fast but controlled.'),
(1172, 570, 3, 'Bodyweight Squats', 5, '25', NULL, 30, 'Fast but controlled.'),
(1173, 568, 3, 'Bodyweight Squats', 5, '25', NULL, 30, 'Fast but controlled.'),
(1174, 579, 4, 'High Knees', 5, NULL, 40, 20, 'March fast instead to reduce impact.'),
(1175, 577, 4, 'High Knees', 5, NULL, 40, 20, 'March fast instead to reduce impact.'),
(1176, 575, 4, 'High Knees', 5, NULL, 40, 20, 'March fast instead to reduce impact.'),
(1177, 572, 4, 'High Knees', 5, NULL, 40, 20, 'March fast instead to reduce impact.'),
(1178, 570, 4, 'High Knees', 5, NULL, 40, 20, 'March fast instead to reduce impact.'),
(1179, 568, 4, 'High Knees', 5, NULL, 40, 20, 'March fast instead to reduce impact.'),
(1180, 579, 5, 'Push-Ups', 4, '15', NULL, 30, 'Knees down if form slips.'),
(1181, 577, 5, 'Push-Ups', 4, '15', NULL, 30, 'Knees down if form slips.'),
(1182, 575, 5, 'Push-Ups', 4, '15', NULL, 30, 'Knees down if form slips.'),
(1183, 572, 5, 'Push-Ups', 4, '15', NULL, 30, 'Knees down if form slips.'),
(1184, 570, 5, 'Push-Ups', 4, '15', NULL, 30, 'Knees down if form slips.'),
(1185, 568, 5, 'Push-Ups', 4, '15', NULL, 30, 'Knees down if form slips.'),
(1186, 580, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1187, 576, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1188, 573, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1189, 569, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1190, 566, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1191, 562, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1192, 559, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1193, 555, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1194, 552, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1195, 548, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1196, 545, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1197, 541, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1198, 538, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1199, 534, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1200, 531, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1201, 527, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1202, 524, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1203, 520, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1204, 517, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1205, 513, 1, 'Cat-Cow', 2, '8', NULL, 20, 'Move with your breath.'),
(1206, 580, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1207, 576, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1208, 573, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1209, 569, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1210, 566, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1211, 562, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1212, 559, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1213, 555, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1214, 552, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1215, 548, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1216, 545, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1217, 541, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1218, 538, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1219, 534, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1220, 531, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1221, 527, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1222, 524, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1223, 520, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1224, 517, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1225, 513, 2, 'Hip Circles', 2, '8 each direction', NULL, 20, 'Use a comfortable range.'),
(1226, 580, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1227, 576, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1228, 573, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1229, 569, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1230, 566, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1231, 562, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1232, 559, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1233, 555, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1234, 552, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1235, 548, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1236, 545, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1237, 541, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1238, 538, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1239, 534, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1240, 531, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1241, 527, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1242, 524, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1243, 520, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(1244, 517, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1245, 513, 3, 'Hamstring Stretch', 2, NULL, 30, 20, 'Hold each side without bouncing.'),
(1246, 580, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1247, 576, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1248, 573, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1249, 569, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1250, 566, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1251, 562, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1252, 559, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1253, 555, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1254, 552, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1255, 548, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1256, 545, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1257, 541, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1258, 538, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1259, 534, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1260, 531, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1261, 527, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1262, 524, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1263, 520, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1264, 517, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1265, 513, 4, 'Deep Breathing', 1, NULL, 60, NULL, 'Breathe slowly and comfortably.'),
(1279, 639, 1, 'Barbell Back Squat', 3, '10', NULL, 90, 'Controlled tempo, focus on depth'),
(1280, 639, 2, 'Flat Barbell Bench Press', 3, '10', NULL, 90, NULL),
(1281, 639, 3, 'Bent-Over Barbell Row', 3, '10', NULL, 90, NULL),
(1282, 639, 4, 'Plank Hold', 3, NULL, 30, 45, NULL),
(1283, 640, 1, 'World\'s Greatest Stretch', 2, '8', NULL, 30, 'Each side'),
(1284, 640, 2, 'Band/PVC Shoulder Pass-Throughs', 2, '12', NULL, 30, NULL),
(1285, 640, 3, 'Ankle Rocks', 2, '10', NULL, 20, 'Each side'),
(1286, 640, 4, 'Pallof Press', 3, '12', NULL, 30, 'Each side, anti-rotation core'),
(1287, 641, 1, 'Conventional Deadlift', 3, '8', NULL, 120, 'Reset each rep'),
(1288, 641, 2, 'Standing Overhead Press', 3, '8', NULL, 90, NULL),
(1289, 641, 3, 'Assisted Pull-Up or Inverted Row', 3, '8', NULL, 90, NULL),
(1290, 641, 4, 'Dead Bug', 3, '12', NULL, 30, NULL),
(1291, 642, 1, 'Brisk Walk', 1, NULL, 1800, NULL, 'Easy, conversational pace'),
(1292, 643, 1, 'Front Squat', 3, '8', NULL, 90, NULL),
(1293, 643, 2, 'Incline Dumbbell Press', 3, '10', NULL, 90, NULL),
(1294, 643, 3, 'Single-Arm Dumbbell Row', 3, '10', NULL, 75, 'Each side'),
(1295, 643, 4, 'Hanging Knee Raise', 3, '12', NULL, 45, NULL),
(1296, 644, 1, 'Kettlebell Swings', 4, '15', NULL, 30, NULL),
(1297, 644, 2, 'Goblet Squats', 4, '15', NULL, 30, NULL),
(1298, 644, 3, 'Push-Up to Renegade Row', 4, '10', NULL, 30, NULL),
(1299, 644, 4, 'Mountain Climbers', 4, NULL, 30, 30, NULL),
(1300, 645, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Prioritize sleep, hydration, and protein intake'),
(1301, 646, 1, 'Barbell Back Squat', 3, '10', NULL, 90, 'Controlled tempo, focus on depth'),
(1302, 646, 2, 'Flat Barbell Bench Press', 3, '10', NULL, 90, NULL),
(1303, 646, 3, 'Bent-Over Barbell Row', 3, '10', NULL, 90, NULL),
(1304, 646, 4, 'Plank Hold', 3, NULL, 30, 45, NULL),
(1305, 647, 1, 'World\'s Greatest Stretch', 2, '8', NULL, 30, 'Each side'),
(1306, 647, 2, 'Band/PVC Shoulder Pass-Throughs', 2, '12', NULL, 30, NULL),
(1307, 647, 3, 'Ankle Rocks', 2, '10', NULL, 20, 'Each side'),
(1308, 647, 4, 'Pallof Press', 3, '12', NULL, 30, 'Each side, anti-rotation core'),
(1309, 648, 1, 'Conventional Deadlift', 3, '8', NULL, 120, 'Reset each rep'),
(1310, 648, 2, 'Standing Overhead Press', 3, '8', NULL, 90, NULL),
(1311, 648, 3, 'Assisted Pull-Up or Inverted Row', 3, '8', NULL, 90, NULL),
(1312, 648, 4, 'Dead Bug', 3, '12', NULL, 30, NULL),
(1313, 649, 1, 'Brisk Walk', 1, NULL, 1800, NULL, 'Easy, conversational pace'),
(1314, 650, 1, 'Front Squat', 3, '8', NULL, 90, NULL),
(1315, 650, 2, 'Incline Dumbbell Press', 3, '10', NULL, 90, NULL),
(1316, 650, 3, 'Single-Arm Dumbbell Row', 3, '10', NULL, 75, 'Each side'),
(1317, 650, 4, 'Hanging Knee Raise', 3, '12', NULL, 45, NULL),
(1318, 651, 1, 'Kettlebell Swings', 4, '15', NULL, 30, NULL),
(1319, 651, 2, 'Goblet Squats', 4, '15', NULL, 30, NULL),
(1320, 651, 3, 'Push-Up to Renegade Row', 4, '10', NULL, 30, NULL),
(1321, 651, 4, 'Mountain Climbers', 4, NULL, 30, 30, NULL),
(1322, 652, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Prioritize sleep, hydration, and protein intake'),
(1323, 653, 1, 'Barbell Back Squat', 3, '10', NULL, 90, 'Controlled tempo, focus on depth'),
(1324, 653, 2, 'Flat Barbell Bench Press', 3, '10', NULL, 90, NULL),
(1325, 653, 3, 'Bent-Over Barbell Row', 3, '10', NULL, 90, NULL),
(1326, 653, 4, 'Plank Hold', 3, NULL, 30, 45, NULL),
(1327, 654, 1, 'World\'s Greatest Stretch', 2, '8', NULL, 30, 'Each side'),
(1328, 654, 2, 'Band/PVC Shoulder Pass-Throughs', 2, '12', NULL, 30, NULL),
(1329, 654, 3, 'Ankle Rocks', 2, '10', NULL, 20, 'Each side'),
(1330, 654, 4, 'Pallof Press', 3, '12', NULL, 30, 'Each side, anti-rotation core'),
(1331, 655, 1, 'Conventional Deadlift', 3, '8', NULL, 120, 'Reset each rep'),
(1332, 655, 2, 'Standing Overhead Press', 3, '8', NULL, 90, NULL),
(1333, 655, 3, 'Assisted Pull-Up or Inverted Row', 3, '8', NULL, 90, NULL),
(1334, 655, 4, 'Dead Bug', 3, '12', NULL, 30, NULL),
(1335, 656, 1, 'Brisk Walk', 1, NULL, 1800, NULL, 'Easy, conversational pace'),
(1336, 657, 1, 'Front Squat', 3, '8', NULL, 90, NULL),
(1337, 657, 2, 'Incline Dumbbell Press', 3, '10', NULL, 90, NULL),
(1338, 657, 3, 'Single-Arm Dumbbell Row', 3, '10', NULL, 75, 'Each side'),
(1339, 657, 4, 'Hanging Knee Raise', 3, '12', NULL, 45, NULL),
(1340, 658, 1, 'Kettlebell Swings', 4, '15', NULL, 30, NULL),
(1341, 658, 2, 'Goblet Squats', 4, '15', NULL, 30, NULL),
(1342, 658, 3, 'Push-Up to Renegade Row', 4, '10', NULL, 30, NULL),
(1343, 658, 4, 'Mountain Climbers', 4, NULL, 30, 30, NULL),
(1344, 659, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Prioritize sleep, hydration, and protein intake'),
(1345, 660, 1, 'Barbell Back Squat', 3, '10', NULL, 90, 'Controlled tempo, focus on depth'),
(1346, 660, 2, 'Flat Barbell Bench Press', 3, '10', NULL, 90, NULL),
(1347, 660, 3, 'Bent-Over Barbell Row', 3, '10', NULL, 90, NULL),
(1348, 660, 4, 'Plank Hold', 3, NULL, 30, 45, NULL),
(1349, 661, 1, 'World\'s Greatest Stretch', 2, '8', NULL, 30, 'Each side'),
(1350, 661, 2, 'Band/PVC Shoulder Pass-Throughs', 2, '12', NULL, 30, NULL),
(1351, 661, 3, 'Ankle Rocks', 2, '10', NULL, 20, 'Each side'),
(1352, 661, 4, 'Pallof Press', 3, '12', NULL, 30, 'Each side, anti-rotation core'),
(1353, 662, 1, 'Conventional Deadlift', 3, '8', NULL, 120, 'Reset each rep'),
(1354, 662, 2, 'Standing Overhead Press', 3, '8', NULL, 90, NULL),
(1355, 662, 3, 'Assisted Pull-Up or Inverted Row', 3, '8', NULL, 90, NULL),
(1356, 662, 4, 'Dead Bug', 3, '12', NULL, 30, NULL);

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(1357, 663, 1, 'Brisk Walk', 1, NULL, 1800, NULL, 'Easy, conversational pace'),
(1358, 664, 1, 'Front Squat', 3, '8', NULL, 90, NULL),
(1359, 664, 2, 'Incline Dumbbell Press', 3, '10', NULL, 90, NULL),
(1360, 664, 3, 'Single-Arm Dumbbell Row', 3, '10', NULL, 75, 'Each side'),
(1361, 664, 4, 'Hanging Knee Raise', 3, '12', NULL, 45, NULL),
(1362, 665, 1, 'Kettlebell Swings', 4, '15', NULL, 30, NULL),
(1363, 665, 2, 'Goblet Squats', 4, '15', NULL, 30, NULL),
(1364, 665, 3, 'Push-Up to Renegade Row', 4, '10', NULL, 30, NULL),
(1365, 665, 4, 'Mountain Climbers', 4, NULL, 30, 30, NULL),
(1366, 666, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Prioritize sleep, hydration, and protein intake'),
(1367, 667, 1, 'Barbell Bench Press', 4, '6', NULL, 120, NULL),
(1368, 667, 2, 'Standing Barbell Overhead Press', 4, '8', NULL, 90, NULL),
(1369, 667, 3, 'Weighted Dips', 3, '10', NULL, 90, NULL),
(1370, 667, 4, 'Cable Lateral Raise', 3, '15', NULL, 45, NULL),
(1371, 667, 5, 'Triceps Rope Pushdown', 3, '12', NULL, 45, NULL),
(1372, 668, 1, 'Weighted Pull-Ups', 4, '6', NULL, 120, NULL),
(1373, 668, 2, 'Barbell Bent-Over Row', 4, '8', NULL, 90, NULL),
(1374, 668, 3, 'Romanian Deadlift', 3, '8', NULL, 90, NULL),
(1375, 668, 4, 'Seated Cable Row', 3, '12', NULL, 60, NULL),
(1376, 668, 5, 'Barbell Bicep Curl', 3, '12', NULL, 45, NULL),
(1377, 669, 1, 'Back Squat', 4, '6', NULL, 150, NULL),
(1378, 669, 2, 'Romanian Deadlift', 3, '10', NULL, 90, NULL),
(1379, 669, 3, 'Walking Lunges', 3, '12', NULL, 60, 'Each leg'),
(1380, 669, 4, 'Leg Press', 3, '12', NULL, 75, NULL),
(1381, 669, 5, 'Standing Calf Raise', 4, '15', NULL, 45, NULL),
(1382, 670, 1, 'Foam Rolling - Full Body', 1, NULL, 600, NULL, NULL),
(1383, 670, 2, 'Hip 90/90 Stretch', 2, NULL, 45, 15, 'Each side'),
(1384, 670, 3, 'Thoracic Spine Rotations', 2, '10', NULL, 20, 'Each side'),
(1385, 670, 4, 'Light Cycling or Walking', 1, NULL, 900, NULL, 'Easy effort'),
(1386, 671, 1, 'Incline DB Press + Chest-Supported Row (superset)', 4, '12', NULL, 60, NULL),
(1387, 671, 2, 'DB Shoulder Press + Face Pull (superset)', 3, '12', NULL, 60, NULL),
(1388, 671, 3, 'Cable Fly + Lat Pulldown (superset)', 3, '15', NULL, 45, NULL),
(1389, 672, 1, 'Bulgarian Split Squat', 3, '10', NULL, 60, 'Each leg'),
(1390, 672, 2, 'Lying Leg Curl', 3, '12', NULL, 60, NULL),
(1391, 672, 3, 'Hanging Leg Raise', 3, '15', NULL, 45, NULL),
(1392, 672, 4, 'Weighted Plank', 3, NULL, 45, 45, NULL),
(1393, 673, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Growth happens here - eat, sleep, recover'),
(1394, 674, 1, 'Barbell Bench Press', 4, '6', NULL, 120, NULL),
(1395, 674, 2, 'Standing Barbell Overhead Press', 4, '8', NULL, 90, NULL),
(1396, 674, 3, 'Weighted Dips', 3, '10', NULL, 90, NULL),
(1397, 674, 4, 'Cable Lateral Raise', 3, '15', NULL, 45, NULL),
(1398, 674, 5, 'Triceps Rope Pushdown', 3, '12', NULL, 45, NULL),
(1399, 675, 1, 'Weighted Pull-Ups', 4, '6', NULL, 120, NULL),
(1400, 675, 2, 'Barbell Bent-Over Row', 4, '8', NULL, 90, NULL),
(1401, 675, 3, 'Romanian Deadlift', 3, '8', NULL, 90, NULL),
(1402, 675, 4, 'Seated Cable Row', 3, '12', NULL, 60, NULL),
(1403, 675, 5, 'Barbell Bicep Curl', 3, '12', NULL, 45, NULL),
(1404, 676, 1, 'Back Squat', 4, '6', NULL, 150, NULL),
(1405, 676, 2, 'Romanian Deadlift', 3, '10', NULL, 90, NULL),
(1406, 676, 3, 'Walking Lunges', 3, '12', NULL, 60, 'Each leg'),
(1407, 676, 4, 'Leg Press', 3, '12', NULL, 75, NULL),
(1408, 676, 5, 'Standing Calf Raise', 4, '15', NULL, 45, NULL),
(1409, 677, 1, 'Foam Rolling - Full Body', 1, NULL, 600, NULL, NULL),
(1410, 677, 2, 'Hip 90/90 Stretch', 2, NULL, 45, 15, 'Each side'),
(1411, 677, 3, 'Thoracic Spine Rotations', 2, '10', NULL, 20, 'Each side'),
(1412, 677, 4, 'Light Cycling or Walking', 1, NULL, 900, NULL, 'Easy effort'),
(1413, 678, 1, 'Incline DB Press + Chest-Supported Row (superset)', 4, '12', NULL, 60, NULL),
(1414, 678, 2, 'DB Shoulder Press + Face Pull (superset)', 3, '12', NULL, 60, NULL),
(1415, 678, 3, 'Cable Fly + Lat Pulldown (superset)', 3, '15', NULL, 45, NULL),
(1416, 679, 1, 'Bulgarian Split Squat', 3, '10', NULL, 60, 'Each leg'),
(1417, 679, 2, 'Lying Leg Curl', 3, '12', NULL, 60, NULL),
(1418, 679, 3, 'Hanging Leg Raise', 3, '15', NULL, 45, NULL),
(1419, 679, 4, 'Weighted Plank', 3, NULL, 45, 45, NULL),
(1420, 680, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Growth happens here - eat, sleep, recover'),
(1421, 681, 1, 'Barbell Bench Press', 4, '6', NULL, 120, NULL),
(1422, 681, 2, 'Standing Barbell Overhead Press', 4, '8', NULL, 90, NULL),
(1423, 681, 3, 'Weighted Dips', 3, '10', NULL, 90, NULL),
(1424, 681, 4, 'Cable Lateral Raise', 3, '15', NULL, 45, NULL),
(1425, 681, 5, 'Triceps Rope Pushdown', 3, '12', NULL, 45, NULL),
(1426, 682, 1, 'Weighted Pull-Ups', 4, '6', NULL, 120, NULL),
(1427, 682, 2, 'Barbell Bent-Over Row', 4, '8', NULL, 90, NULL),
(1428, 682, 3, 'Romanian Deadlift', 3, '8', NULL, 90, NULL),
(1429, 682, 4, 'Seated Cable Row', 3, '12', NULL, 60, NULL),
(1430, 682, 5, 'Barbell Bicep Curl', 3, '12', NULL, 45, NULL),
(1431, 683, 1, 'Back Squat', 4, '6', NULL, 150, NULL),
(1432, 683, 2, 'Romanian Deadlift', 3, '10', NULL, 90, NULL),
(1433, 683, 3, 'Walking Lunges', 3, '12', NULL, 60, 'Each leg'),
(1434, 683, 4, 'Leg Press', 3, '12', NULL, 75, NULL),
(1435, 683, 5, 'Standing Calf Raise', 4, '15', NULL, 45, NULL),
(1436, 684, 1, 'Foam Rolling - Full Body', 1, NULL, 600, NULL, NULL),
(1437, 684, 2, 'Hip 90/90 Stretch', 2, NULL, 45, 15, 'Each side'),
(1438, 684, 3, 'Thoracic Spine Rotations', 2, '10', NULL, 20, 'Each side'),
(1439, 684, 4, 'Light Cycling or Walking', 1, NULL, 900, NULL, 'Easy effort'),
(1440, 685, 1, 'Incline DB Press + Chest-Supported Row (superset)', 4, '12', NULL, 60, NULL),
(1441, 685, 2, 'DB Shoulder Press + Face Pull (superset)', 3, '12', NULL, 60, NULL),
(1442, 685, 3, 'Cable Fly + Lat Pulldown (superset)', 3, '15', NULL, 45, NULL),
(1443, 686, 1, 'Bulgarian Split Squat', 3, '10', NULL, 60, 'Each leg'),
(1444, 686, 2, 'Lying Leg Curl', 3, '12', NULL, 60, NULL),
(1445, 686, 3, 'Hanging Leg Raise', 3, '15', NULL, 45, NULL),
(1446, 686, 4, 'Weighted Plank', 3, NULL, 45, 45, NULL),
(1447, 687, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Growth happens here - eat, sleep, recover'),
(1448, 688, 1, 'Barbell Bench Press', 4, '6', NULL, 120, NULL),
(1449, 688, 2, 'Standing Barbell Overhead Press', 4, '8', NULL, 90, NULL),
(1450, 688, 3, 'Weighted Dips', 3, '10', NULL, 90, NULL),
(1451, 688, 4, 'Cable Lateral Raise', 3, '15', NULL, 45, NULL),
(1452, 688, 5, 'Triceps Rope Pushdown', 3, '12', NULL, 45, NULL),
(1453, 689, 1, 'Weighted Pull-Ups', 4, '6', NULL, 120, NULL),
(1454, 689, 2, 'Barbell Bent-Over Row', 4, '8', NULL, 90, NULL),
(1455, 689, 3, 'Romanian Deadlift', 3, '8', NULL, 90, NULL),
(1456, 689, 4, 'Seated Cable Row', 3, '12', NULL, 60, NULL);

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(1457, 689, 5, 'Barbell Bicep Curl', 3, '12', NULL, 45, NULL),
(1458, 690, 1, 'Back Squat', 4, '6', NULL, 150, NULL),
(1459, 690, 2, 'Romanian Deadlift', 3, '10', NULL, 90, NULL),
(1460, 690, 3, 'Walking Lunges', 3, '12', NULL, 60, 'Each leg'),
(1461, 690, 4, 'Leg Press', 3, '12', NULL, 75, NULL),
(1462, 690, 5, 'Standing Calf Raise', 4, '15', NULL, 45, NULL),
(1463, 691, 1, 'Foam Rolling - Full Body', 1, NULL, 600, NULL, NULL),
(1464, 691, 2, 'Hip 90/90 Stretch', 2, NULL, 45, 15, 'Each side'),
(1465, 691, 3, 'Thoracic Spine Rotations', 2, '10', NULL, 20, 'Each side'),
(1466, 691, 4, 'Light Cycling or Walking', 1, NULL, 900, NULL, 'Easy effort'),
(1467, 692, 1, 'Incline DB Press + Chest-Supported Row (superset)', 4, '12', NULL, 60, NULL),
(1468, 692, 2, 'DB Shoulder Press + Face Pull (superset)', 3, '12', NULL, 60, NULL),
(1469, 692, 3, 'Cable Fly + Lat Pulldown (superset)', 3, '15', NULL, 45, NULL),
(1470, 693, 1, 'Bulgarian Split Squat', 3, '10', NULL, 60, 'Each leg'),
(1471, 693, 2, 'Lying Leg Curl', 3, '12', NULL, 60, NULL),
(1472, 693, 3, 'Hanging Leg Raise', 3, '15', NULL, 45, NULL),
(1473, 693, 4, 'Weighted Plank', 3, NULL, 45, 45, NULL),
(1474, 694, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Growth happens here - eat, sleep, recover'),
(1475, 695, 1, 'Barbell Bench Press', 4, '6', NULL, 120, NULL),
(1476, 695, 2, 'Standing Barbell Overhead Press', 4, '8', NULL, 90, NULL),
(1477, 695, 3, 'Weighted Dips', 3, '10', NULL, 90, NULL),
(1478, 695, 4, 'Cable Lateral Raise', 3, '15', NULL, 45, NULL),
(1479, 695, 5, 'Triceps Rope Pushdown', 3, '12', NULL, 45, NULL),
(1480, 696, 1, 'Weighted Pull-Ups', 4, '6', NULL, 120, NULL),
(1481, 696, 2, 'Barbell Bent-Over Row', 4, '8', NULL, 90, NULL),
(1482, 696, 3, 'Romanian Deadlift', 3, '8', NULL, 90, NULL),
(1483, 696, 4, 'Seated Cable Row', 3, '12', NULL, 60, NULL),
(1484, 696, 5, 'Barbell Bicep Curl', 3, '12', NULL, 45, NULL),
(1485, 697, 1, 'Back Squat', 4, '6', NULL, 150, NULL),
(1486, 697, 2, 'Romanian Deadlift', 3, '10', NULL, 90, NULL),
(1487, 697, 3, 'Walking Lunges', 3, '12', NULL, 60, 'Each leg'),
(1488, 697, 4, 'Leg Press', 3, '12', NULL, 75, NULL),
(1489, 697, 5, 'Standing Calf Raise', 4, '15', NULL, 45, NULL),
(1490, 698, 1, 'Foam Rolling - Full Body', 1, NULL, 600, NULL, NULL),
(1491, 698, 2, 'Hip 90/90 Stretch', 2, NULL, 45, 15, 'Each side'),
(1492, 698, 3, 'Thoracic Spine Rotations', 2, '10', NULL, 20, 'Each side'),
(1493, 698, 4, 'Light Cycling or Walking', 1, NULL, 900, NULL, 'Easy effort'),
(1494, 699, 1, 'Incline DB Press + Chest-Supported Row (superset)', 4, '12', NULL, 60, NULL),
(1495, 699, 2, 'DB Shoulder Press + Face Pull (superset)', 3, '12', NULL, 60, NULL),
(1496, 699, 3, 'Cable Fly + Lat Pulldown (superset)', 3, '15', NULL, 45, NULL),
(1497, 700, 1, 'Bulgarian Split Squat', 3, '10', NULL, 60, 'Each leg'),
(1498, 700, 2, 'Lying Leg Curl', 3, '12', NULL, 60, NULL),
(1499, 700, 3, 'Hanging Leg Raise', 3, '15', NULL, 45, NULL),
(1500, 700, 4, 'Weighted Plank', 3, NULL, 45, 45, NULL),
(1501, 701, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Growth happens here - eat, sleep, recover'),
(1502, 702, 1, 'Barbell Bench Press', 4, '6', NULL, 120, NULL),
(1503, 702, 2, 'Standing Barbell Overhead Press', 4, '8', NULL, 90, NULL),
(1504, 702, 3, 'Weighted Dips', 3, '10', NULL, 90, NULL),
(1505, 702, 4, 'Cable Lateral Raise', 3, '15', NULL, 45, NULL),
(1506, 702, 5, 'Triceps Rope Pushdown', 3, '12', NULL, 45, NULL),
(1507, 703, 1, 'Weighted Pull-Ups', 4, '6', NULL, 120, NULL),
(1508, 703, 2, 'Barbell Bent-Over Row', 4, '8', NULL, 90, NULL),
(1509, 703, 3, 'Romanian Deadlift', 3, '8', NULL, 90, NULL),
(1510, 703, 4, 'Seated Cable Row', 3, '12', NULL, 60, NULL),
(1511, 703, 5, 'Barbell Bicep Curl', 3, '12', NULL, 45, NULL),
(1512, 704, 1, 'Back Squat', 4, '6', NULL, 150, NULL),
(1513, 704, 2, 'Romanian Deadlift', 3, '10', NULL, 90, NULL),
(1514, 704, 3, 'Walking Lunges', 3, '12', NULL, 60, 'Each leg'),
(1515, 704, 4, 'Leg Press', 3, '12', NULL, 75, NULL),
(1516, 704, 5, 'Standing Calf Raise', 4, '15', NULL, 45, NULL),
(1517, 705, 1, 'Foam Rolling - Full Body', 1, NULL, 600, NULL, NULL),
(1518, 705, 2, 'Hip 90/90 Stretch', 2, NULL, 45, 15, 'Each side'),
(1519, 705, 3, 'Thoracic Spine Rotations', 2, '10', NULL, 20, 'Each side'),
(1520, 705, 4, 'Light Cycling or Walking', 1, NULL, 900, NULL, 'Easy effort'),
(1521, 706, 1, 'Incline DB Press + Chest-Supported Row (superset)', 4, '12', NULL, 60, NULL),
(1522, 706, 2, 'DB Shoulder Press + Face Pull (superset)', 3, '12', NULL, 60, NULL),
(1523, 706, 3, 'Cable Fly + Lat Pulldown (superset)', 3, '15', NULL, 45, NULL),
(1524, 707, 1, 'Bulgarian Split Squat', 3, '10', NULL, 60, 'Each leg'),
(1525, 707, 2, 'Lying Leg Curl', 3, '12', NULL, 60, NULL),
(1526, 707, 3, 'Hanging Leg Raise', 3, '15', NULL, 45, NULL),
(1527, 707, 4, 'Weighted Plank', 3, NULL, 45, 45, NULL),
(1528, 708, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Growth happens here - eat, sleep, recover'),
(1529, 709, 1, 'Barbell Bench Press', 4, '6', NULL, 120, NULL),
(1530, 709, 2, 'Standing Barbell Overhead Press', 4, '8', NULL, 90, NULL),
(1531, 709, 3, 'Weighted Dips', 3, '10', NULL, 90, NULL),
(1532, 709, 4, 'Cable Lateral Raise', 3, '15', NULL, 45, NULL),
(1533, 709, 5, 'Triceps Rope Pushdown', 3, '12', NULL, 45, NULL),
(1534, 710, 1, 'Weighted Pull-Ups', 4, '6', NULL, 120, NULL),
(1535, 710, 2, 'Barbell Bent-Over Row', 4, '8', NULL, 90, NULL),
(1536, 710, 3, 'Romanian Deadlift', 3, '8', NULL, 90, NULL),
(1537, 710, 4, 'Seated Cable Row', 3, '12', NULL, 60, NULL),
(1538, 710, 5, 'Barbell Bicep Curl', 3, '12', NULL, 45, NULL),
(1539, 711, 1, 'Back Squat', 4, '6', NULL, 150, NULL),
(1540, 711, 2, 'Romanian Deadlift', 3, '10', NULL, 90, NULL),
(1541, 711, 3, 'Walking Lunges', 3, '12', NULL, 60, 'Each leg'),
(1542, 711, 4, 'Leg Press', 3, '12', NULL, 75, NULL),
(1543, 711, 5, 'Standing Calf Raise', 4, '15', NULL, 45, NULL),
(1544, 712, 1, 'Foam Rolling - Full Body', 1, NULL, 600, NULL, NULL),
(1545, 712, 2, 'Hip 90/90 Stretch', 2, NULL, 45, 15, 'Each side'),
(1546, 712, 3, 'Thoracic Spine Rotations', 2, '10', NULL, 20, 'Each side'),
(1547, 712, 4, 'Light Cycling or Walking', 1, NULL, 900, NULL, 'Easy effort'),
(1548, 713, 1, 'Incline DB Press + Chest-Supported Row (superset)', 4, '12', NULL, 60, NULL),
(1549, 713, 2, 'DB Shoulder Press + Face Pull (superset)', 3, '12', NULL, 60, NULL),
(1550, 713, 3, 'Cable Fly + Lat Pulldown (superset)', 3, '15', NULL, 45, NULL),
(1551, 714, 1, 'Bulgarian Split Squat', 3, '10', NULL, 60, 'Each leg'),
(1552, 714, 2, 'Lying Leg Curl', 3, '12', NULL, 60, NULL),
(1553, 714, 3, 'Hanging Leg Raise', 3, '15', NULL, 45, NULL),
(1554, 714, 4, 'Weighted Plank', 3, NULL, 45, 45, NULL),
(1555, 715, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Growth happens here - eat, sleep, recover'),
(1556, 716, 1, 'Barbell Bench Press', 4, '6', NULL, 120, NULL);

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(1557, 716, 2, 'Standing Barbell Overhead Press', 4, '8', NULL, 90, NULL),
(1558, 716, 3, 'Weighted Dips', 3, '10', NULL, 90, NULL),
(1559, 716, 4, 'Cable Lateral Raise', 3, '15', NULL, 45, NULL),
(1560, 716, 5, 'Triceps Rope Pushdown', 3, '12', NULL, 45, NULL),
(1561, 717, 1, 'Weighted Pull-Ups', 4, '6', NULL, 120, NULL),
(1562, 717, 2, 'Barbell Bent-Over Row', 4, '8', NULL, 90, NULL),
(1563, 717, 3, 'Romanian Deadlift', 3, '8', NULL, 90, NULL),
(1564, 717, 4, 'Seated Cable Row', 3, '12', NULL, 60, NULL),
(1565, 717, 5, 'Barbell Bicep Curl', 3, '12', NULL, 45, NULL),
(1566, 718, 1, 'Back Squat', 4, '6', NULL, 150, NULL),
(1567, 718, 2, 'Romanian Deadlift', 3, '10', NULL, 90, NULL),
(1568, 718, 3, 'Walking Lunges', 3, '12', NULL, 60, 'Each leg'),
(1569, 718, 4, 'Leg Press', 3, '12', NULL, 75, NULL),
(1570, 718, 5, 'Standing Calf Raise', 4, '15', NULL, 45, NULL),
(1571, 719, 1, 'Foam Rolling - Full Body', 1, NULL, 600, NULL, NULL),
(1572, 719, 2, 'Hip 90/90 Stretch', 2, NULL, 45, 15, 'Each side'),
(1573, 719, 3, 'Thoracic Spine Rotations', 2, '10', NULL, 20, 'Each side'),
(1574, 719, 4, 'Light Cycling or Walking', 1, NULL, 900, NULL, 'Easy effort'),
(1575, 720, 1, 'Incline DB Press + Chest-Supported Row (superset)', 4, '12', NULL, 60, NULL),
(1576, 720, 2, 'DB Shoulder Press + Face Pull (superset)', 3, '12', NULL, 60, NULL),
(1577, 720, 3, 'Cable Fly + Lat Pulldown (superset)', 3, '15', NULL, 45, NULL),
(1578, 721, 1, 'Bulgarian Split Squat', 3, '10', NULL, 60, 'Each leg'),
(1579, 721, 2, 'Lying Leg Curl', 3, '12', NULL, 60, NULL),
(1580, 721, 3, 'Hanging Leg Raise', 3, '15', NULL, 45, NULL),
(1581, 721, 4, 'Weighted Plank', 3, NULL, 45, 45, NULL),
(1582, 722, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Growth happens here - eat, sleep, recover'),
(1583, 723, 1, 'Bodyweight Squats', NULL, NULL, 40, 20, '4 rounds total circuit'),
(1584, 723, 2, 'Push-Ups', NULL, NULL, 40, 20, NULL),
(1585, 723, 3, 'Mountain Climbers', NULL, NULL, 40, 20, NULL),
(1586, 723, 4, 'Jumping Jacks', NULL, NULL, 40, 20, NULL),
(1587, 724, 1, 'Jog / Bike / Row - Moderate Pace', 1, NULL, 1800, NULL, NULL),
(1588, 725, 1, 'Jump Squats', NULL, NULL, 40, 20, '4 rounds total circuit'),
(1589, 725, 2, 'Walking Lunges', NULL, NULL, 40, 20, NULL),
(1590, 725, 3, 'Glute Bridges', NULL, NULL, 40, 20, NULL),
(1591, 726, 1, 'Easy-Paced Walk', 1, NULL, 1200, NULL, NULL),
(1592, 727, 1, 'Push-Ups', NULL, NULL, 40, 20, '4 rounds total circuit'),
(1593, 727, 2, 'Plank Shoulder Taps', NULL, NULL, 40, 20, NULL),
(1594, 727, 3, 'Resistance Band Rows', NULL, NULL, 40, 20, NULL),
(1595, 728, 1, 'Sprint Intervals', 8, NULL, 20, 90, '20s hard sprint, 90s walk recovery'),
(1596, 729, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Let the nervous system recover'),
(1597, 730, 1, 'Bodyweight Squats', NULL, NULL, 40, 20, '4 rounds total circuit'),
(1598, 730, 2, 'Push-Ups', NULL, NULL, 40, 20, NULL),
(1599, 730, 3, 'Mountain Climbers', NULL, NULL, 40, 20, NULL),
(1600, 730, 4, 'Jumping Jacks', NULL, NULL, 40, 20, NULL),
(1601, 731, 1, 'Jog / Bike / Row - Moderate Pace', 1, NULL, 1800, NULL, NULL),
(1602, 732, 1, 'Jump Squats', NULL, NULL, 40, 20, '4 rounds total circuit'),
(1603, 732, 2, 'Walking Lunges', NULL, NULL, 40, 20, NULL),
(1604, 732, 3, 'Glute Bridges', NULL, NULL, 40, 20, NULL),
(1605, 733, 1, 'Easy-Paced Walk', 1, NULL, 1200, NULL, NULL),
(1606, 734, 1, 'Push-Ups', NULL, NULL, 40, 20, '4 rounds total circuit'),
(1607, 734, 2, 'Plank Shoulder Taps', NULL, NULL, 40, 20, NULL),
(1608, 734, 3, 'Resistance Band Rows', NULL, NULL, 40, 20, NULL),
(1609, 735, 1, 'Sprint Intervals', 8, NULL, 20, 90, '20s hard sprint, 90s walk recovery'),
(1610, 736, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Let the nervous system recover'),
(1611, 737, 1, 'Easy Run / Bike / Row', 1, NULL, 1800, NULL, 'Zone 2, conversational pace'),
(1612, 738, 1, 'Tempo Intervals', 5, NULL, 240, 120, '4 min comfortably-hard, 2 min easy'),
(1613, 739, 1, 'Bike or Row Cross-Train', 1, NULL, 2100, NULL, 'Moderate pace, low impact'),
(1614, 740, 1, 'Hip Flexor Stretch', 2, NULL, 45, 15, 'Each side'),
(1615, 740, 2, 'Hamstring Stretch', 2, NULL, 45, 15, 'Each side'),
(1616, 740, 3, 'Foam Roll - Calves & IT Band', 1, NULL, 300, NULL, NULL),
(1617, 741, 1, 'Long Steady Run / Bike', 1, NULL, 2400, NULL, 'Steady aerobic pace'),
(1618, 742, 1, 'Hill Sprints or Resisted Intervals', 6, NULL, 60, 90, '60s hard, 90s recovery'),
(1619, 743, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Let the cardiovascular system adapt'),
(1620, 744, 1, 'Easy Run / Bike / Row', 1, NULL, 1800, NULL, 'Zone 2, conversational pace'),
(1621, 745, 1, 'Tempo Intervals', 5, NULL, 240, 120, '4 min comfortably-hard, 2 min easy'),
(1622, 746, 1, 'Bike or Row Cross-Train', 1, NULL, 2100, NULL, 'Moderate pace, low impact'),
(1623, 747, 1, 'Hip Flexor Stretch', 2, NULL, 45, 15, 'Each side'),
(1624, 747, 2, 'Hamstring Stretch', 2, NULL, 45, 15, 'Each side'),
(1625, 747, 3, 'Foam Roll - Calves & IT Band', 1, NULL, 300, NULL, NULL),
(1626, 748, 1, 'Long Steady Run / Bike', 1, NULL, 2400, NULL, 'Steady aerobic pace'),
(1627, 749, 1, 'Hill Sprints or Resisted Intervals', 6, NULL, 60, 90, '60s hard, 90s recovery'),
(1628, 750, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Let the cardiovascular system adapt'),
(1629, 751, 1, 'Easy Run / Bike / Row', 1, NULL, 1800, NULL, 'Zone 2, conversational pace'),
(1630, 752, 1, 'Tempo Intervals', 5, NULL, 240, 120, '4 min comfortably-hard, 2 min easy'),
(1631, 753, 1, 'Bike or Row Cross-Train', 1, NULL, 2100, NULL, 'Moderate pace, low impact'),
(1632, 754, 1, 'Hip Flexor Stretch', 2, NULL, 45, 15, 'Each side'),
(1633, 754, 2, 'Hamstring Stretch', 2, NULL, 45, 15, 'Each side'),
(1634, 754, 3, 'Foam Roll - Calves & IT Band', 1, NULL, 300, NULL, NULL),
(1635, 755, 1, 'Long Steady Run / Bike', 1, NULL, 2400, NULL, 'Steady aerobic pace'),
(1636, 756, 1, 'Hill Sprints or Resisted Intervals', 6, NULL, 60, 90, '60s hard, 90s recovery'),
(1637, 757, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Let the cardiovascular system adapt'),
(1638, 758, 1, 'Easy Run / Bike / Row', 1, NULL, 1800, NULL, 'Zone 2, conversational pace'),
(1639, 759, 1, 'Tempo Intervals', 5, NULL, 240, 120, '4 min comfortably-hard, 2 min easy'),
(1640, 760, 1, 'Bike or Row Cross-Train', 1, NULL, 2100, NULL, 'Moderate pace, low impact'),
(1641, 761, 1, 'Hip Flexor Stretch', 2, NULL, 45, 15, 'Each side'),
(1642, 761, 2, 'Hamstring Stretch', 2, NULL, 45, 15, 'Each side'),
(1643, 761, 3, 'Foam Roll - Calves & IT Band', 1, NULL, 300, NULL, NULL),
(1644, 762, 1, 'Long Steady Run / Bike', 1, NULL, 2400, NULL, 'Steady aerobic pace'),
(1645, 763, 1, 'Hill Sprints or Resisted Intervals', 6, NULL, 60, 90, '60s hard, 90s recovery'),
(1646, 764, 1, 'Full Rest Day', NULL, NULL, NULL, NULL, 'Let the cardiovascular system adapt'),
(1647, 772, 1, 'Standing Hamstring Stretch', 2, NULL, 45, 15, 'Each side'),
(1648, 772, 2, 'Quad Stretch', 2, NULL, 45, 15, 'Each side'),
(1649, 772, 3, 'Calf Stretch', 2, NULL, 45, 15, 'Each side'),
(1650, 773, 1, 'Doorway Chest Stretch', 2, NULL, 45, 15, 'Each side'),
(1651, 773, 2, 'Cross-Body Shoulder Stretch', 2, NULL, 30, 15, 'Each side'),
(1652, 773, 3, 'Thoracic Extension Stretch', 2, NULL, 30, 15, NULL),
(1653, 774, 1, 'Deep Lunge Hip Opener', 2, NULL, 45, 15, 'Each side'),
(1654, 774, 2, 'Seated Spinal Twist', 2, NULL, 30, 15, 'Each side'),
(1655, 774, 3, 'Cat-Cow Flow', 2, '10', NULL, 15, NULL),
(1656, 775, 1, 'Full-Body Flow Sequence', 1, NULL, 1500, NULL, 'Continuous, slow-paced');

INSERT IGNORE INTO `plan_exercises` (`id`, `plan_content_id`, `exercise_order`, `exercise_name`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`) VALUES
(1657, 776, 1, 'Standing Forward Fold', 2, NULL, 45, 15, NULL),
(1658, 776, 2, 'Single-Leg Hamstring Stretch', 2, NULL, 45, 15, 'Each side'),
(1659, 776, 3, 'Child\'s Pose (lower back)', 2, NULL, 45, 15, NULL),
(1660, 777, 1, 'Long-Held Passive Stretch Sequence', 1, NULL, 900, NULL, NULL),
(1661, 777, 2, 'Diaphragmatic Breathing', 1, NULL, 600, NULL, NULL),
(1662, 778, 1, 'Rest & Reflect', NULL, NULL, NULL, NULL, 'Gentle movement only'),
(1663, 779, 1, 'Standing Hamstring Stretch', 2, NULL, 45, 15, 'Each side'),
(1664, 779, 2, 'Quad Stretch', 2, NULL, 45, 15, 'Each side'),
(1665, 779, 3, 'Calf Stretch', 2, NULL, 45, 15, 'Each side'),
(1666, 780, 1, 'Doorway Chest Stretch', 2, NULL, 45, 15, 'Each side'),
(1667, 780, 2, 'Cross-Body Shoulder Stretch', 2, NULL, 30, 15, 'Each side'),
(1668, 780, 3, 'Thoracic Extension Stretch', 2, NULL, 30, 15, NULL),
(1669, 781, 1, 'Deep Lunge Hip Opener', 2, NULL, 45, 15, 'Each side'),
(1670, 781, 2, 'Seated Spinal Twist', 2, NULL, 30, 15, 'Each side'),
(1671, 781, 3, 'Cat-Cow Flow', 2, '10', NULL, 15, NULL),
(1672, 782, 1, 'Full-Body Flow Sequence', 1, NULL, 1500, NULL, 'Continuous, slow-paced'),
(1673, 783, 1, 'Standing Forward Fold', 2, NULL, 45, 15, NULL),
(1674, 783, 2, 'Single-Leg Hamstring Stretch', 2, NULL, 45, 15, 'Each side'),
(1675, 783, 3, 'Child\'s Pose (lower back)', 2, NULL, 45, 15, NULL),
(1676, 784, 1, 'Long-Held Passive Stretch Sequence', 1, NULL, 900, NULL, NULL),
(1677, 784, 2, 'Diaphragmatic Breathing', 1, NULL, 600, NULL, NULL),
(1678, 785, 1, 'Rest & Reflect', NULL, NULL, NULL, NULL, 'Gentle movement only');

-- --------------------------------------------------------
-- Table `plans`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `intensity` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_focus` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(8,2) DEFAULT '0.00',
  `image_seed` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `duration_days` int DEFAULT NULL,
  `difficulty` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `owner_user_id` int DEFAULT NULL,
  `is_template` tinyint(1) DEFAULT '1',
  `goal_type` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rationale` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_plan_title` (`title`),
  KEY `idx_difficulty` (`difficulty`),
  KEY `idx_duration_days` (`duration_days`),
  KEY `idx_owner` (`owner_user_id`),
  CONSTRAINT `plans_ibfk_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `plans` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'name');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'title');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `tag` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'tag');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `intensity` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'intensity');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `duration` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'duration');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `target_focus` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'target_focus');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `price` decimal(8,2) DEFAULT ''0.00''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'price');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `image_seed` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'image_seed');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `description` text COLLATE utf8mb4_unicode_ci', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'description');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `duration_days` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'duration_days');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `difficulty` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'difficulty');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'image_url');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `owner_user_id` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'owner_user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `is_template` tinyint(1) DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'is_template');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `goal_type` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'goal_type');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD COLUMN `rationale` text COLLATE utf8mb4_unicode_ci', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'plans' AND column_name = 'rationale');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `plans` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD CONSTRAINT `plans_ibfk_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plans' AND constraint_name = 'plans_ibfk_owner' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

INSERT IGNORE INTO `plans` (`id`, `name`, `title`, `tag`, `intensity`, `duration`, `target_focus`, `price`, `image_seed`, `description`, `duration_days`, `difficulty`, `image_url`, `created_at`, `owner_user_id`, `is_template`, `goal_type`, `rationale`) VALUES
(40, '', 'Foundations of Strength', 'Strength', 'Beginner', '4 Weeks', 'Full-Body Strength & Power', '0.00', 'foundations', 'Beginner progressive program', 28, NULL, '/plans/foundations-of-strength.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(41, '', 'Iron Forge Protocol', 'Strength', 'Advanced', '8 Weeks', 'Hypertrophy & Max Strength', '0.00', 'ironforge', 'Advanced 8-week hypertrophy block', 56, NULL, '/plans/iron-forge-protocol.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(42, '', 'Fat Loss Sprint', 'Fat Loss', 'Moderate', '2 Weeks', 'Fat Loss', '0.00', 'fatloss', 'High-intensity 2-week block', 14, NULL, '/plans/fat-loss-sprint.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(43, '', 'Cardio Surge', 'Cardio', 'Moderate', '4 Weeks', 'Cardio Endurance', '0.00', 'cardiosurge', '4-week aerobic base', 28, NULL, '/plans/cardio-surge.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(44, '', 'Mobility Reset', 'Recovery', 'Beginner', '1 Week', 'Recovery', '0.00', 'mobilityreset', '7-day mobility reset', 7, NULL, '/plans/mobility-reset.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(45, '', 'Total Flexibility Flow', 'Flexibility', 'Beginner', '2 Weeks', 'Flexibility', '0.00', 'flexflow', '2-week flexibility routine', 14, NULL, '/plans/total-flexibility-flow.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(46, 'Bodyweight Basics', 'Bodyweight Basics', 'Strength', 'Beginner', '4 Weeks', 'Full Body', '0.00', 'bodyweight-basics', 'Build a bodyweight routine with squats, scaled push-ups, bridges and core work. Three training days, two mobility days and two rest days per week.', 28, 'Beginner', '/plans/bodyweight-basics.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(47, 'Upper Body Foundations', 'Upper Body Foundations', 'Strength', 'Beginner', '4 Weeks', 'Upper Body', '0.00', 'upper-body-foundations', 'Practice pushing and trunk control without weights. Use knee push-ups as needed and keep every repetition controlled.', 28, 'Beginner', '/plans/upper-body-foundations.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(48, 'Lower Body Builder', 'Lower Body Builder', 'Strength', 'Moderate', '4 Weeks', 'Lower Body', '0.00', 'lower-body-builder', 'Develop leg strength with squats, reverse lunges, glute bridges and calf raises. Alternate training with mobility and rest.', 28, 'Moderate', '/plans/lower-body-builder.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(49, 'Core Control', 'Core Control', 'Strength', 'Beginner', '2 Weeks', 'Core', '0.00', 'core-control', 'Build trunk stability with dead bugs, bird dogs, planks and side planks. Short sessions emphasize steady breathing and control.', 14, 'Beginner', '/plans/core-control.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(50, 'Everyday Strength Circuit', 'Everyday Strength Circuit', 'Strength', 'Moderate', '4 Weeks', 'Full Body', '0.00', 'everyday-strength-circuit', 'Repeat a balanced bodyweight circuit three times weekly, with dedicated mobility and rest days between sessions.', 28, 'Moderate', '/plans/everyday-strength-circuit.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(51, 'Low Impact Cardio Start', 'Low Impact Cardio Start', 'Cardio', 'Beginner', '2 Weeks', 'Cardio Endurance', '0.00', 'low-impact-cardio-start', 'Build an aerobic habit with marching, step jacks, side steps and standing knee lifts. No jumping or equipment required.', 14, 'Beginner', '/plans/low-impact-cardio-start.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(52, 'Cardio Rhythm', 'Cardio Rhythm', 'Cardio', 'Moderate', '4 Weeks', 'Cardio Endurance', '0.00', 'cardio-rhythm', 'Practice timed bodyweight cardio intervals with recovery between sets. Keep a pace you can maintain throughout the session.', 28, 'Moderate', '/plans/cardio-rhythm.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(53, 'Steady Movement Habit', 'Steady Movement Habit', 'Cardio', 'Beginner', '4 Weeks', 'Full Body', '0.00', 'steady-movement-habit', 'Establish a regular movement routine with low-impact intervals, gentle mobility and scheduled rest days.', 28, 'Beginner', '/plans/steady-movement-habit.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(54, 'Full Body Conditioning', 'Full Body Conditioning', 'Fat Loss', 'Moderate', '4 Weeks', 'Full Body', '0.00', 'full-body-conditioning', 'Combine bodyweight strength and timed cardio to support general conditioning. Includes mobility sessions and rest days.', 28, 'Moderate', '/plans/full-body-conditioning.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(55, 'Quick Conditioning Circuit', 'Quick Conditioning Circuit', 'Fat Loss', 'Moderate', '2 Weeks', 'Full Body', '0.00', 'quick-conditioning-circuit', 'Short strength-and-cardio sessions for a busy schedule. Use controlled repetitions and take the prescribed rest between sets.', 14, 'Moderate', '/plans/quick-conditioning-circuit.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(56, 'Desk Break Mobility', 'Desk Break Mobility', 'Recovery', 'Beginner', '1 Week', 'Mobility', '0.00', 'desk-break-mobility', 'Gentle cat-cow, hip circles, child pose and breathing sessions for breaks from sitting. Stay within a comfortable range.', 7, 'Beginner', '/plans/desk-break-mobility.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(57, 'Gentle Recovery Week', 'Gentle Recovery Week', 'Recovery', 'Beginner', '1 Week', 'Recovery', '0.00', 'gentle-recovery-week', 'A week of easy mobility and breathing with two full rest days. Keep the sessions relaxed rather than strenuous.', 7, 'Beginner', '/plans/gentle-recovery-week.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(58, 'Hip Mobility Practice', 'Hip Mobility Practice', 'Flexibility', 'Beginner', '2 Weeks', 'Lower Body', '0.00', 'hip-mobility-practice', 'Practice comfortable hip and lower-body mobility with controlled stretches. Avoid bouncing and never force the range.', 14, 'Beginner', '/plans/hip-mobility-practice.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(59, 'Evening Stretch Routine', 'Evening Stretch Routine', 'Flexibility', 'Beginner', '2 Weeks', 'Flexibility', '0.00', 'evening-stretch-routine', 'Wind down with gentle hamstring, calf, hip-flexor and child-pose holds. Includes two rest days per week.', 14, 'Beginner', '/plans/evening-stretch-routine.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(60, 'Athletic Bodyweight Prep', 'Athletic Bodyweight Prep', 'Strength', 'Moderate', '4 Weeks', 'Full Body', '0.00', 'athletic-bodyweight-prep', 'Build a base of leg strength and trunk control using reverse lunges, squats, shoulder taps and bird dogs.', 28, 'Moderate', '/plans/athletic-bodyweight-prep.jpg', '2026-11-28 15:38:29', NULL, 1, NULL, NULL),
(61, 'Advanced Strength Builder', 'Advanced Strength Builder', 'Strength', 'Advanced', '4 Weeks', 'Strength', '0.00', 'advanced-strength-builder', 'Unlocked at Level 2. Higher-volume bodyweight strength with tempo work and longer holds. Warm up fully and keep perfect form on every rep.', 28, 'Advanced', NULL, '2026-11-28 15:38:34', NULL, 1, NULL, NULL),
(62, 'Elite Strength Block', 'Elite Strength Block', 'Strength', 'Extreme', '4 Weeks', 'Strength', '0.00', 'elite-strength-block', 'Unlocked at Level 3. Demanding strength sessions with high volume and slow eccentrics. Stop a set early if your form breaks down.', 28, 'Extreme', NULL, '2026-11-28 15:38:34', NULL, 1, NULL, NULL),
(63, 'Elite Conditioning', 'Elite Conditioning', 'Performance', 'Extreme', '2 Weeks', 'Performance', '0.00', 'elite-conditioning', 'Unlocked at Level 3. Hard conditioning intervals for experienced trainees. Includes jumping; swap in step-based versions if impact bothers your joints.', 14, 'Extreme', NULL, '2026-11-28 15:38:34', NULL, 1, NULL, NULL);

-- --------------------------------------------------------
-- Table `progress_photos`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `progress_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `pose` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `image_data` mediumtext COLLATE utf8mb4_general_ci,
  `ai_rating` tinyint DEFAULT NULL,
  `ai_quality` text COLLATE utf8mb4_general_ci,
  `ai_summary` text COLLATE utf8mb4_general_ci,
  `captured_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_progress_photo_row` (`id`),
  KEY `idx_progress_photos_user` (`user_id`),
  KEY `idx_progress_photos_pose` (`user_id`,`pose`,`captured_at`),
  CONSTRAINT `progress_photos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add any columns an older `progress_photos` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_photos` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'progress_photos' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_photos` ADD COLUMN `pose` varchar(10) COLLATE utf8mb4_general_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'progress_photos' AND column_name = 'pose');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_photos` ADD COLUMN `image_data` mediumtext COLLATE utf8mb4_general_ci', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'progress_photos' AND column_name = 'image_data');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_photos` ADD COLUMN `ai_rating` tinyint DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'progress_photos' AND column_name = 'ai_rating');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_photos` ADD COLUMN `ai_quality` text COLLATE utf8mb4_general_ci', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'progress_photos' AND column_name = 'ai_quality');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_photos` ADD COLUMN `ai_summary` text COLLATE utf8mb4_general_ci', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'progress_photos' AND column_name = 'ai_summary');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_photos` ADD COLUMN `captured_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'progress_photos' AND column_name = 'captured_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `progress_photos` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_photos` ADD CONSTRAINT `progress_photos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'progress_photos' AND constraint_name = 'progress_photos_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `progress_settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `progress_settings` (
  `user_id` int NOT NULL,
  `cadence_days` tinyint unsigned NOT NULL DEFAULT '30',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_progress_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `progress_settings` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_settings` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'progress_settings' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_settings` ADD COLUMN `cadence_days` tinyint unsigned NOT NULL DEFAULT ''30''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'progress_settings' AND column_name = 'cadence_days');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_settings` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'progress_settings' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_settings` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'progress_settings' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `progress_settings` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `progress_settings` ADD CONSTRAINT `fk_progress_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'progress_settings' AND constraint_name = 'fk_progress_settings_user' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `reminder_log`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reminder_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `kind` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'inapp',
  `sent_on` date NOT NULL,
  `variant` tinyint DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_reminder_day` (`user_id`,`kind`,`channel`,`sent_on`),
  KEY `idx_reminder_user_created` (`user_id`,`created_at`),
  CONSTRAINT `reminder_log_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `reminder_log` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_log` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_log' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_log` ADD COLUMN `kind` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_log' AND column_name = 'kind');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_log` ADD COLUMN `channel` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''inapp''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_log' AND column_name = 'channel');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_log` ADD COLUMN `sent_on` date NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_log' AND column_name = 'sent_on');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_log` ADD COLUMN `variant` tinyint DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_log' AND column_name = 'variant');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_log` ADD COLUMN `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_log' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `reminder_log` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_log` ADD CONSTRAINT `reminder_log_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'reminder_log' AND constraint_name = 'reminder_log_user_fk' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `reminder_prefs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reminder_prefs` (
  `user_id` int NOT NULL,
  `log_reminders` tinyint(1) NOT NULL DEFAULT '1',
  `workout_reminders` tinyint(1) NOT NULL DEFAULT '1',
  `motivation` tinyint(1) NOT NULL DEFAULT '1',
  `progress` tinyint(1) NOT NULL DEFAULT '1',
  `email_weekly` tinyint(1) NOT NULL DEFAULT '1',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `reminder_prefs_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `reminder_prefs` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_prefs` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_prefs' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_prefs` ADD COLUMN `log_reminders` tinyint(1) NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_prefs' AND column_name = 'log_reminders');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_prefs` ADD COLUMN `workout_reminders` tinyint(1) NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_prefs' AND column_name = 'workout_reminders');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_prefs` ADD COLUMN `motivation` tinyint(1) NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_prefs' AND column_name = 'motivation');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_prefs` ADD COLUMN `progress` tinyint(1) NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_prefs' AND column_name = 'progress');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_prefs` ADD COLUMN `email_weekly` tinyint(1) NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_prefs' AND column_name = 'email_weekly');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_prefs` ADD COLUMN `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reminder_prefs' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `reminder_prefs` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `reminder_prefs` ADD CONSTRAINT `reminder_prefs_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'reminder_prefs' AND constraint_name = 'reminder_prefs_user_fk' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `training_preferences`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `training_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `equipment` json DEFAULT NULL,
  `preferred_days` json DEFAULT NULL,
  `session_duration_mins` int DEFAULT NULL,
  `workout_location` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `excluded_categories` json DEFAULT NULL,
  `excluded_exercises` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_training_prefs_user` (`user_id`),
  CONSTRAINT `training_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `training_preferences` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `training_preferences` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'training_preferences' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `training_preferences` ADD COLUMN `equipment` json DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'training_preferences' AND column_name = 'equipment');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `training_preferences` ADD COLUMN `preferred_days` json DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'training_preferences' AND column_name = 'preferred_days');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `training_preferences` ADD COLUMN `session_duration_mins` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'training_preferences' AND column_name = 'session_duration_mins');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `training_preferences` ADD COLUMN `workout_location` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'training_preferences' AND column_name = 'workout_location');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `training_preferences` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'training_preferences' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `training_preferences` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'training_preferences' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `training_preferences` ADD COLUMN `excluded_categories` json DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'training_preferences' AND column_name = 'excluded_categories');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `training_preferences` ADD COLUMN `excluded_exercises` json DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'training_preferences' AND column_name = 'excluded_exercises');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `training_preferences` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `training_preferences` ADD CONSTRAINT `training_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'training_preferences' AND constraint_name = 'training_preferences_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `user_allergies`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_allergies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `allergy_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_allergy` (`user_id`,`allergy_name`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `user_allergies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `user_allergies` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_allergies` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_allergies' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_allergies` ADD COLUMN `allergy_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_allergies' AND column_name = 'allergy_name');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_allergies` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_allergies' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `user_allergies` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_allergies` ADD CONSTRAINT `user_allergies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_allergies' AND constraint_name = 'user_allergies_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `user_challenges`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_challenges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `challenge_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `workout_log_id` int DEFAULT NULL,
  `best_value` int DEFAULT NULL,
  `completed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_challenge` (`user_id`,`challenge_key`),
  KEY `idx_user_challenges_user` (`user_id`),
  KEY `user_challenges_log_fk` (`workout_log_id`),
  CONSTRAINT `user_challenges_log_fk` FOREIGN KEY (`workout_log_id`) REFERENCES `workout_logs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `user_challenges_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `user_challenges` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_challenges` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_challenges' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_challenges` ADD COLUMN `challenge_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_challenges' AND column_name = 'challenge_key');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_challenges` ADD COLUMN `workout_log_id` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_challenges' AND column_name = 'workout_log_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_challenges` ADD COLUMN `best_value` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_challenges' AND column_name = 'best_value');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_challenges` ADD COLUMN `completed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_challenges' AND column_name = 'completed_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `user_challenges` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_challenges` ADD CONSTRAINT `user_challenges_log_fk` FOREIGN KEY (`workout_log_id`) REFERENCES `workout_logs` (`id`) ON DELETE SET NULL', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_challenges' AND constraint_name = 'user_challenges_log_fk' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_challenges` ADD CONSTRAINT `user_challenges_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_challenges' AND constraint_name = 'user_challenges_user_fk' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `user_nutrient_goals`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_nutrient_goals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `nutrient` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'PROTEIN, CARBOHYDRATES, FAT, TRANS_FAT, SATURATED_FAT, POLYUNSATURATED_FAT, MONOUNSATURATED_FAT',
  `target_value` decimal(10,2) DEFAULT NULL COMMENT 'user goal amount (e.g. grams)',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_nutrient` (`user_id`,`nutrient`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_active` (`user_id`,`is_active`),
  CONSTRAINT `fk_nutrient_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `user_nutrient_goals` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_nutrient_goals` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_nutrient_goals' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_nutrient_goals` ADD COLUMN `nutrient` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT ''PROTEIN, CARBOHYDRATES, FAT, TRANS_FAT, SATURATED_FAT, POLYUNSATURATED_FAT, MONOUNSATURATED_FAT''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_nutrient_goals' AND column_name = 'nutrient');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_nutrient_goals` ADD COLUMN `target_value` decimal(10,2) DEFAULT NULL COMMENT ''user goal amount (e.g. grams)''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_nutrient_goals' AND column_name = 'target_value');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_nutrient_goals` ADD COLUMN `is_active` tinyint(1) DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_nutrient_goals' AND column_name = 'is_active');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_nutrient_goals` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_nutrient_goals' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_nutrient_goals` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_nutrient_goals' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `user_nutrient_goals` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_nutrient_goals` ADD CONSTRAINT `fk_nutrient_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_nutrient_goals' AND constraint_name = 'fk_nutrient_goals_user' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `user_plan_progress`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_plan_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `day_number` int NOT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_plan_day` (`user_id`,`plan_id`,`day_number`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_is_completed` (`is_completed`),
  CONSTRAINT `user_plan_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_plan_progress_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `user_plan_progress` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plan_progress` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_plan_progress' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plan_progress` ADD COLUMN `plan_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_plan_progress' AND column_name = 'plan_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plan_progress` ADD COLUMN `day_number` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_plan_progress' AND column_name = 'day_number');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plan_progress` ADD COLUMN `is_completed` tinyint(1) DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_plan_progress' AND column_name = 'is_completed');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plan_progress` ADD COLUMN `completed_at` datetime DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_plan_progress' AND column_name = 'completed_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plan_progress` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_plan_progress' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `user_plan_progress` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plan_progress` ADD CONSTRAINT `user_plan_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_plan_progress' AND constraint_name = 'user_plan_progress_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plan_progress` ADD CONSTRAINT `user_plan_progress_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_plan_progress' AND constraint_name = 'user_plan_progress_ibfk_2' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `user_plans`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `enrolled_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_plan` (`user_id`,`plan_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_plan_id` (`plan_id`),
  CONSTRAINT `user_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_plans_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `user_plans` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plans` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_plans' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plans` ADD COLUMN `plan_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_plans' AND column_name = 'plan_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plans` ADD COLUMN `enrolled_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_plans' AND column_name = 'enrolled_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `user_plans` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plans` ADD CONSTRAINT `user_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_plans' AND constraint_name = 'user_plans_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_plans` ADD CONSTRAINT `user_plans_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_plans' AND constraint_name = 'user_plans_ibfk_2' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `user_profiles`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `contact` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `avatar_url` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `height_cm` decimal(5,1) DEFAULT NULL,
  `weight_kg` decimal(5,1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `user_profiles` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_profiles` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_profiles` ADD COLUMN `contact` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'contact');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_profiles` ADD COLUMN `bio` text COLLATE utf8mb4_unicode_ci', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'bio');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_profiles` ADD COLUMN `avatar_url` longtext COLLATE utf8mb4_unicode_ci', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'avatar_url');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_profiles` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_profiles` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_profiles` ADD COLUMN `height_cm` decimal(5,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'height_cm');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_profiles` ADD COLUMN `weight_kg` decimal(5,1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'weight_kg');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `user_profiles` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND constraint_name = 'user_profiles_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `user_sessions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `device` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `device_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_device_id` (`user_id`,`device_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_current` (`is_current`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_current_created` (`user_id`,`is_current`,`created_at`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `user_sessions` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD COLUMN `device` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'device');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD COLUMN `browser` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'browser');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD COLUMN `os` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'os');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD COLUMN `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'ip_address');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD COLUMN `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'location');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD COLUMN `is_current` tinyint(1) DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'is_current');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD COLUMN `device_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'device_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `user_sessions` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND constraint_name = 'user_sessions_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `user_settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_settings` (
  `user_id` int NOT NULL,
  `units` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'metric',
  `step_goal` int NOT NULL DEFAULT '8000',
  `theme` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `user_settings` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_settings` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_settings' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_settings` ADD COLUMN `units` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''metric''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_settings' AND column_name = 'units');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_settings` ADD COLUMN `step_goal` int NOT NULL DEFAULT ''8000''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_settings' AND column_name = 'step_goal');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_settings` ADD COLUMN `theme` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''system''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_settings' AND column_name = 'theme');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_settings` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_settings' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_settings` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_settings' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `user_settings` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_settings` ADD CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_settings' AND constraint_name = 'fk_user_settings_user' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_verified_at` datetime DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fitness_goal` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` longtext COLLATE utf8mb4_unicode_ci,
  `is_online` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `onboarding_completed` tinyint(1) NOT NULL DEFAULT '0',
  `accepted_terms_at` datetime DEFAULT NULL,
  `accepted_terms_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member',
  `token_version` int NOT NULL DEFAULT '0',
  `access_group_id` int DEFAULT NULL,
  `password_weak` tinyint(1) DEFAULT NULL,
  `progression_level` tinyint unsigned NOT NULL DEFAULT '1',
  `progression_seen` tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `uq_users_phone` (`phone`),
  KEY `idx_email` (`email`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_users_access_group` (`access_group_id`),
  CONSTRAINT `users_access_group_fk` FOREIGN KEY (`access_group_id`) REFERENCES `access_groups` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `users` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'name');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'email');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'phone');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `phone_verified_at` datetime DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'phone_verified_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'password');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `fitness_goal` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'fitness_goal');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `avatar_url` longtext COLLATE utf8mb4_unicode_ci', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'avatar_url');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `is_online` tinyint(1) DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'is_online');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'updated_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `is_verified` tinyint(1) NOT NULL DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'is_verified');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `onboarding_completed` tinyint(1) NOT NULL DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'onboarding_completed');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `accepted_terms_at` datetime DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'accepted_terms_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `accepted_terms_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'accepted_terms_version');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''active''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'status');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''member''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'role');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `token_version` int NOT NULL DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'token_version');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `access_group_id` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'access_group_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `password_weak` tinyint(1) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'password_weak');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `progression_level` tinyint unsigned NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'progression_level');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD COLUMN `progression_seen` tinyint unsigned NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'progression_seen');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `users` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `users` ADD CONSTRAINT `users_access_group_fk` FOREIGN KEY (`access_group_id`) REFERENCES `access_groups` (`id`) ON DELETE SET NULL', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'users' AND constraint_name = 'users_access_group_fk' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `phone`, `phone_verified_at`, `password`, `fitness_goal`, `avatar_url`, `is_online`, `created_at`, `updated_at`, `is_verified`, `onboarding_completed`, `accepted_terms_at`, `accepted_terms_version`, `status`, `role`, `token_version`, `access_group_id`, `password_weak`, `progression_level`, `progression_seen`) VALUES
(1, 'Vitalis Admin', 'admin@gmail.com', NULL, NULL, '$2b$10$nRmo/jnklbzPAdBuIFRqJu3b69VdhC6yyiFWq0gDc9wkg1agFnJU6', NULL, NULL, 0, '2026-11-28 15:38:30', '2026-11-28 15:38:30', 1, 1, '2026-11-28 15:38:30', '1.0', 'active', 'admin', 0, NULL, NULL, 1, 1);

-- --------------------------------------------------------
-- Table `workout_logs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `workout_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `workout_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rep_count` int DEFAULT '0',
  `start_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `end_time` datetime DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `paused_seconds` int DEFAULT '0',
  `pause_started_at` datetime DEFAULT NULL,
  `difficulty_rating` tinyint DEFAULT NULL,
  `session_notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `calories_burned` int DEFAULT NULL,
  `form_score` tinyint unsigned DEFAULT NULL,
  `local_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_user_status_start` (`user_id`,`status`,`start_time`),
  KEY `idx_workout_logs_user_local_date` (`user_id`,`local_date`),
  CONSTRAINT `workout_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `workout_logs` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `workout_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'workout_type');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'status');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `rep_count` int DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'rep_count');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `start_time` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'start_time');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `end_time` datetime DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'end_time');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `duration_seconds` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'duration_seconds');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `paused_seconds` int DEFAULT ''0''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'paused_seconds');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `pause_started_at` datetime DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'pause_started_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `difficulty_rating` tinyint DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'difficulty_rating');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `session_notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'session_notes');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `calories_burned` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'calories_burned');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `form_score` tinyint unsigned DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'form_score');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `local_date` date DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'local_date');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `workout_logs` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_logs` ADD CONSTRAINT `workout_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND constraint_name = 'workout_logs_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- --------------------------------------------------------
-- Table `workout_sets`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `workout_sets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workout_log_id` int NOT NULL,
  `user_id` int NOT NULL,
  `exercise_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `set_number` int NOT NULL DEFAULT '1',
  `reps` int DEFAULT NULL,
  `weight_kg` decimal(6,2) DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `distance_meters` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workout_sets_log` (`workout_log_id`),
  KEY `idx_workout_sets_user` (`user_id`),
  CONSTRAINT `workout_sets_ibfk_1` FOREIGN KEY (`workout_log_id`) REFERENCES `workout_logs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workout_sets_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add any columns an older `workout_sets` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_sets` ADD COLUMN `workout_log_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_sets' AND column_name = 'workout_log_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_sets` ADD COLUMN `user_id` int NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_sets' AND column_name = 'user_id');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_sets` ADD COLUMN `exercise_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_sets' AND column_name = 'exercise_name');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_sets` ADD COLUMN `set_number` int NOT NULL DEFAULT ''1''', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_sets' AND column_name = 'set_number');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_sets` ADD COLUMN `reps` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_sets' AND column_name = 'reps');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_sets` ADD COLUMN `weight_kg` decimal(6,2) DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_sets' AND column_name = 'weight_kg');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_sets` ADD COLUMN `duration_seconds` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_sets' AND column_name = 'duration_seconds');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_sets` ADD COLUMN `distance_meters` int DEFAULT NULL', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_sets' AND column_name = 'distance_meters');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_sets` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_sets' AND column_name = 'created_at');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

-- Add any foreign keys an older `workout_sets` is missing
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_sets` ADD CONSTRAINT `workout_sets_ibfk_1` FOREIGN KEY (`workout_log_id`) REFERENCES `workout_logs` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'workout_sets' AND constraint_name = 'workout_sets_ibfk_1' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `workout_sets` ADD CONSTRAINT `workout_sets_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'workout_sets' AND constraint_name = 'workout_sets_ibfk_2' AND constraint_type = 'FOREIGN KEY');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

SET SQL_MODE = @OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS = 1;

-- Done. Tables: 44 + _migrations. Seeded: _migrations (64), food_catalog (190), plan_contents (525), plan_exercises (1522), plans (24), users (1).
