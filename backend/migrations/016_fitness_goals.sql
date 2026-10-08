-- 016_fitness_goals.sql — baseline split (idempotent, one table per file)
-- Source: 001_baseline.sql squash of 001-034. Runner ignores duplicates.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `fitness_goals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `dob` date DEFAULT NULL,
  `sex` varchar(20) DEFAULT NULL,
  `height_cm` decimal(5,1) DEFAULT NULL,
  `weight_kg` decimal(5,1) DEFAULT NULL,
  `bmi` decimal(4,1) DEFAULT NULL,
  `goal_type` varchar(30) NOT NULL DEFAULT 'MAINTAIN_WEIGHT',
  `target_weight_kg` decimal(5,1) DEFAULT NULL,
  `pace` varchar(20) DEFAULT NULL,
  `focus` varchar(40) DEFAULT NULL,
  `activity_level` varchar(30) DEFAULT NULL,
  `sleep_hours` decimal(3,1) DEFAULT NULL,
  `sleep_quality` varchar(20) DEFAULT NULL,
  `stress_level` varchar(20) DEFAULT NULL,
  `exercise_freq` varchar(20) DEFAULT NULL,
  `recovery_level` varchar(20) DEFAULT NULL,
  `daily_kcal` int(11) DEFAULT NULL,
  `protein_g` int(11) DEFAULT NULL,
  `carbs_g` int(11) DEFAULT NULL,
  `fat_g` int(11) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_status` (`user_id`,`status`),
  CONSTRAINT `fitness_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
