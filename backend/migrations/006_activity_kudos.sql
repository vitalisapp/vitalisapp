-- 006_activity_kudos.sql — baseline split (idempotent, one table per file)
-- Source: 001_baseline.sql squash of 001-034. Runner ignores duplicates.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `activity_kudos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `activity_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_activity_user` (`activity_id`,`user_id`),
  KEY `idx_activity` (`activity_id`),
  KEY `fk_kudos_user` (`user_id`),
  CONSTRAINT `fk_kudos_activity` FOREIGN KEY (`activity_id`) REFERENCES `activity_logs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_kudos_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
