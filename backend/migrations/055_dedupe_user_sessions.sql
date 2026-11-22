-- 055_dedupe_user_sessions.sql — one row per device.
--
-- Earlier logins inserted a fresh user_sessions row every time, so the Profile
-- "Devices & Sessions" list filled with identical "Chrome on Windows" entries
-- and the admin session counts inflated. The app now refreshes the existing
-- device row instead of inserting a duplicate.
--
-- This one-time cleanup removes the redundant history, keeping the newest row
-- per (user, device type, browser, OS). Distinct devices are untouched, and the
-- newest row keeps its is_current flag because every login already cleared the
-- flag on older rows before inserting.
--
-- Idempotent: re-running deletes nothing.

DELETE older
FROM `user_sessions` AS older
JOIN `user_sessions` AS newer
  ON newer.`user_id` = older.`user_id`
 AND newer.`device`  <=> older.`device`
 AND newer.`browser` <=> older.`browser`
 AND newer.`os`      <=> older.`os`
 AND (
      newer.`created_at` > older.`created_at`
   OR (newer.`created_at` = older.`created_at` AND newer.`id` > older.`id`)
 );
