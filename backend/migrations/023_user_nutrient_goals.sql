-- 023_user_nutrient_goals.sql — baseline split (idempotent, one table per file)
-- Source: 001_baseline.sql squash of 001-034. Runner ignores duplicates.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `user_nutrient_goals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `nutrient` varchar(40) NOT NULL COMMENT 'PROTEIN, CARBOHYDRATES, FAT, TRANS_FAT, SATURATED_FAT, POLYUNSATURATED_FAT, MONOUNSATURATED_FAT',
  `target_value` decimal(10,2) DEFAULT NULL COMMENT 'user goal amount (e.g. grams)',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_nutrient` (`user_id`,`nutrient`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_active` (`user_id`,`is_active`),
  CONSTRAINT `fk_nutrient_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
