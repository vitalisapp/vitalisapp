-- 007_ai_daily_usage.sql — baseline split (idempotent, one table per file)
-- Source: 001_baseline.sql squash of 001-034. Runner ignores duplicates.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `ai_daily_usage` (
  `user_id` int(11) NOT NULL,
  `usage_day` date NOT NULL,
  `count` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`,`usage_day`),
  CONSTRAINT `fk_ai_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
