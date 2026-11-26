-- Password policy (12+ chars, upper, lower, number, special). Existing
-- passwords keep working; login evaluates the typed password and records the
-- result here so the Profile can warn "Password needs attention".
-- NULL = not evaluated yet (no warning). Cleared on register/change/reset.
ALTER TABLE `users` ADD COLUMN `password_weak` tinyint(1) DEFAULT NULL;
