-- 052_smart_reminders.sql — Section 5: smart notifications and reminders.
--
-- reminder_log    one row per reminder sent. The UNIQUE key (user, kind,
--                 channel, local day) makes every send idempotent: the
--                 scheduler inserts here FIRST and only notifies when the
--                 insert succeeded, so restarts or two app instances can
--                 never double-send. `variant` drives message rotation.
-- reminder_prefs  per-user switches. No row = everything on (defaults).

CREATE TABLE IF NOT EXISTS `reminder_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `kind` varchar(32) NOT NULL,
  `channel` varchar(8) NOT NULL DEFAULT 'inapp',
  `sent_on` date NOT NULL,
  `variant` tinyint(4) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_reminder_day` (`user_id`, `kind`, `channel`, `sent_on`),
  KEY `idx_reminder_user_created` (`user_id`, `created_at`),
  CONSTRAINT `reminder_log_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reminder_prefs` (
  `user_id` int(11) NOT NULL,
  `log_reminders` tinyint(1) NOT NULL DEFAULT 1,
  `workout_reminders` tinyint(1) NOT NULL DEFAULT 1,
  `motivation` tinyint(1) NOT NULL DEFAULT 1,
  `progress` tinyint(1) NOT NULL DEFAULT 1,
  `email_weekly` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `reminder_prefs_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reminders written by the scheduler are tagged so the app can count unread
-- automatic reminders separately from other notifications.
ALTER TABLE `notifications` ADD COLUMN `source` varchar(32) DEFAULT NULL;
