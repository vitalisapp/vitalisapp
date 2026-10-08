-- 004_plan_exercises.sql — baseline split (idempotent, one table per file)
-- Source: 001_baseline.sql squash of 001-034. Runner ignores duplicates.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `plan_exercises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_content_id` int(11) NOT NULL,
  `exercise_order` int(11) NOT NULL DEFAULT 1,
  `exercise_name` varchar(150) NOT NULL,
  `sets` int(11) DEFAULT NULL,
  `reps` varchar(50) DEFAULT NULL,
  `duration_seconds` int(11) DEFAULT NULL,
  `rest_seconds` int(11) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_plan_content_id` (`plan_content_id`),
  CONSTRAINT `plan_exercises_ibfk_1` FOREIGN KEY (`plan_content_id`) REFERENCES `plan_contents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
