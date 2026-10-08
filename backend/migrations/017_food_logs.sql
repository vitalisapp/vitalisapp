-- 017_food_logs.sql — baseline split (idempotent, one table per file)
-- Source: 001_baseline.sql squash of 001-034. Runner ignores duplicates.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `food_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `food_name` varchar(200) NOT NULL,
  `serving` varchar(100) DEFAULT NULL,
  `calories` int(11) DEFAULT 0,
  `protein` decimal(10,2) DEFAULT NULL,
  `carbs` decimal(10,2) DEFAULT NULL,
  `fat` decimal(10,2) DEFAULT NULL,
  `saturated_fat` decimal(10,2) DEFAULT 0.00,
  `trans_fat` decimal(10,2) DEFAULT 0.00,
  `polyunsaturated_fat` decimal(10,2) DEFAULT 0.00,
  `monounsaturated_fat` decimal(10,2) DEFAULT 0.00,
  `image_url` varchar(500) DEFAULT NULL,
  `logged_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_logged_at` (`logged_at`),
  KEY `idx_user_logged` (`user_id`,`logged_at`),
  CONSTRAINT `food_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
