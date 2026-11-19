-- 046_phone_verifications.sql — SMS OTP verification for registration.
--
-- users additions:
--   phone              canonical +639XXXXXXXXX, unique. Set at registration
--                      (or later) and only trusted once phone_verified_at
--                      is not null.
--   phone_verified_at  moment the SMS code was accepted.
--
-- phone_verifications holds at most one ACTIVE code per account: a sha256
-- hash (never the raw 6 digits), a 5-minute expiry, an attempt counter and
-- the last send time used for the 60-second resend cooldown.
--
-- Idempotent: the runner ignores 1060 (duplicate column) and 1061 (duplicate
-- key), so re-running is safe.

SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE `users`
  ADD COLUMN `phone` varchar(20) DEFAULT NULL AFTER `email`,
  ADD COLUMN `phone_verified_at` datetime DEFAULT NULL AFTER `phone`,
  ADD UNIQUE KEY `uq_users_phone` (`phone`);

CREATE TABLE IF NOT EXISTS `phone_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` tinyint unsigned NOT NULL DEFAULT 0,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `last_sent_at` datetime NOT NULL,
  `reference_id` varchar(80) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_used_expires` (`user_id`,`used`,`expires_at`),
  KEY `idx_user_sent` (`user_id`,`last_sent_at`),
  CONSTRAINT `phone_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
