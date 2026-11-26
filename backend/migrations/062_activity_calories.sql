-- Revision #7 — activity calories that sync with the dashboard.
-- local_date: the USER's calendar day when the log was made (sent by the
--   browser). Daily totals group by it, so a morning run never lands on
--   "yesterday" when the server runs in another timezone. NULL = older rows,
--   which fall back to the timestamp's date.
-- calories_source: 'estimated' (app estimate from duration/distance/weight)
--   or 'measured' (entered by the user from a watch / device).
ALTER TABLE `activity_logs` ADD COLUMN `local_date` date DEFAULT NULL;
ALTER TABLE `activity_logs` ADD COLUMN `calories_source` enum('estimated','measured') NOT NULL DEFAULT 'estimated';
ALTER TABLE `workout_logs` ADD COLUMN `local_date` date DEFAULT NULL;
CREATE INDEX `idx_activity_logs_user_local_date` ON `activity_logs` (`user_id`, `local_date`);
CREATE INDEX `idx_workout_logs_user_local_date` ON `workout_logs` (`user_id`, `local_date`);
