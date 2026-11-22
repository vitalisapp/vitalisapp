-- 051_coach_weeks.sql — Section 4: AI personal coach.
-- One row per user, plan and calendar week (Monday) ONLY when the user
-- accepted a coach adjustment (moved / lighter / skipped). Weeks without a
-- row use the default schedule built from the plan + preferred days.
--   schedule  JSON array of 7 day entries (date, kind, dayNumber, title,
--             durationMins, capMins, moved)
--   handled   JSON array of missed dates the user already dealt with, so
--             the coach never asks about the same miss twice
--   choice    last option accepted: reschedule | lighter | skip

CREATE TABLE IF NOT EXISTS `coach_weeks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `week_start` date NOT NULL,
  `schedule` json NOT NULL,
  `handled` json DEFAULT NULL,
  `choice` varchar(16) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_coach_week` (`user_id`, `plan_id`, `week_start`),
  CONSTRAINT `coach_weeks_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coach_weeks_plan_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
