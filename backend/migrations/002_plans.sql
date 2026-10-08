-- 002_plans.sql — baseline split (idempotent, one table per file)
-- Source: 001_baseline.sql squash of 001-034. Runner ignores duplicates.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `title` varchar(200) NOT NULL,
  `tag` varchar(100) DEFAULT NULL,
  `intensity` varchar(50) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `target_focus` varchar(100) DEFAULT NULL,
  `price` decimal(8,2) DEFAULT 0.00,
  `image_seed` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `duration_days` int(11) DEFAULT NULL,
  `difficulty` varchar(50) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_plan_title` (`title`),
  KEY `idx_difficulty` (`difficulty`),
  KEY `idx_duration_days` (`duration_days`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
