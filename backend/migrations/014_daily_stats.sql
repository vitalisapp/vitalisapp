-- 014_daily_stats.sql — baseline split (idempotent, one table per file)
-- Source: 001_baseline.sql squash of 001-034. Runner ignores duplicates.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `daily_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `stat_date` date NOT NULL,
  `calories_burned` int(11) DEFAULT 0,
  `steps` int(11) DEFAULT 0,
  `workout_duration_mins` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`,`stat_date`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_stat_date` (`stat_date`),
  KEY `idx_user_date` (`user_id`,`stat_date`),
  CONSTRAINT `daily_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
