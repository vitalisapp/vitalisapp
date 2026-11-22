-- 049_sleep_hours.sql — estimated sleep per night (Section 2 health assessment).
--
-- Re-introduces ONE optional field, not the daily sleep tracking removed in
-- 047: the user's usual hours of sleep per night, captured in onboarding and
-- editable in Profile → Personalization. Carried forward like exercise_freq
-- whenever the active goal is regenerated. NULL = not answered.
--
-- Idempotent: the runner ignores 1060 (duplicate column).

ALTER TABLE `fitness_goals` ADD COLUMN `sleep_hours` decimal(3,1) DEFAULT NULL AFTER `exercise_freq`;
