-- 054 — Section 9: VITALIS has no payment system, so every plan is free.
-- The 030 seed shipped three catalog plans with dollar prices (19.99 / 9.99 /
-- 4.99) that the UI no longer shows. Zero them so stored data matches what
-- users see. The `price` column stays (default 0.00) to keep the plans API
-- shape stable. Idempotent: re-running changes nothing.

UPDATE `plans` SET `price` = 0.00 WHERE `price` IS NULL OR `price` <> 0;
