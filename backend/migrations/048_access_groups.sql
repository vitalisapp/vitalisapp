-- 048_access_groups.sql — admin-generated access QR codes.
--
-- An access group is a labelled QR/link an admin hands to a designated group
-- (e.g. "IT Evaluators", "Panel", "Day 1 Testers").
--   kind = 'register' → QR opens /register?g=<code>; accounts created through
--                       it are tagged with users.access_group_id.
--   kind = 'link'     → QR simply points at link_url (e.g. a Google Meet
--                       session); no account tagging.
-- scan_count is bumped by the public lookup endpoint each time the register
-- page resolves the code (one per browser session on the client).
--
-- Idempotent: the runner ignores 1060 (duplicate column) and 1061 (duplicate
-- key); CREATE TABLE uses IF NOT EXISTS.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `access_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(16) NOT NULL,
  `label` varchar(80) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `kind` enum('register','link') NOT NULL DEFAULT 'register',
  `link_url` varchar(500) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `scan_count` int unsigned NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_access_groups_code` (`code`),
  KEY `idx_access_groups_created` (`created_at`),
  CONSTRAINT `access_groups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users`
  ADD COLUMN `access_group_id` int(11) DEFAULT NULL,
  ADD KEY `idx_users_access_group` (`access_group_id`);

ALTER TABLE `users`
  ADD CONSTRAINT `users_access_group_fk` FOREIGN KEY (`access_group_id`) REFERENCES `access_groups` (`id`) ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS=1;
