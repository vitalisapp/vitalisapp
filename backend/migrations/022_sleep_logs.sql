-- 022_sleep_logs.sql — baseline split (idempotent, one table per file)
-- Source: 001_baseline.sql squash of 001-034. Runner ignores duplicates.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `sleep_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `sleep_duration` int(11) DEFAULT NULL,
  `sleep_quality` int(11) DEFAULT NULL,
  `recovery_score` int(11) DEFAULT NULL,
  `water_intake_ml` int(11) DEFAULT NULL,
  `recorded_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_recorded_at` (`recorded_at`),
  KEY `idx_user_recorded` (`user_id`,`recorded_at`),
  CONSTRAINT `sleep_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
