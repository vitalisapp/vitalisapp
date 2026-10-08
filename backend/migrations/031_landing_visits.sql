-- 031_landing_visits.sql — unique-per-day landing visitor counter (privacy-friendly).
-- Stores only a salted SHA-256 of the client IP + visit date. No raw IPs, no PII.
-- Runner is idempotent (IGNORED_ERRNOS covers 1050/1060/1061): safe to re-run.

CREATE TABLE IF NOT EXISTS `landing_visits` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ip_hash` CHAR(64) NOT NULL,
  `visit_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_landing_visits_hash_date` (`ip_hash`, `visit_date`),
  KEY `idx_landing_visits_date` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
