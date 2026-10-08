-- 028_user_settings.sql — baseline split (idempotent, one table per file)
-- Source: 001_baseline.sql squash of 001-034. Runner ignores duplicates.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `user_settings` (
  `user_id` int(11) NOT NULL,
  `units` varchar(20) NOT NULL DEFAULT 'metric',
  `step_goal` int(11) NOT NULL DEFAULT 8000,
  `theme` varchar(20) NOT NULL DEFAULT 'system',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
