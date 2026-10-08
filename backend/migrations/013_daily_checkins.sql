-- 013_daily_checkins.sql — baseline split (idempotent, one table per file)
-- Source: 001_baseline.sql squash of 001-034. Runner ignores duplicates.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `daily_checkins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `checkin_date` date NOT NULL,
  `sleep_hours` decimal(4,1) DEFAULT NULL,
  `sleep_quality` varchar(20) DEFAULT NULL,
  `stress_level` varchar(20) DEFAULT NULL,
  `soreness_level` varchar(20) DEFAULT NULL,
  `energy_level` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_checkin_user_date` (`user_id`,`checkin_date`),
  KEY `idx_checkin_user` (`user_id`),
  KEY `idx_checkin_date` (`checkin_date`),
  CONSTRAINT `daily_checkins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
