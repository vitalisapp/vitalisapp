-- 064_plans_owner_fk.sql — personal plans must belong to a real user.
-- Idempotent: every step is skipped when it already exists. Safe to re-run.
--   * index idx_owner on plans.owner_user_id (skipped if present)
--   * FK plans_ibfk_owner -> users(id) ON DELETE CASCADE (skipped if present,
--     or if orphaned owner_user_id values exist — fix those first, then re-run)
-- NULL owner + is_template=1 stays valid (marketplace templates).

SET @s = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `plans` ADD INDEX `idx_owner` (`owner_user_id`)', 'DO 0') FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'plans' AND index_name = 'idx_owner');
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;

SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'plans' AND constraint_name = 'plans_ibfk_owner' AND constraint_type = 'FOREIGN KEY') = 0
  AND (SELECT COUNT(*) FROM `plans` p LEFT JOIN `users` u ON u.id = p.owner_user_id WHERE p.owner_user_id IS NOT NULL AND u.id IS NULL) = 0,
  'ALTER TABLE `plans` ADD CONSTRAINT `plans_ibfk_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE',
  'DO 0'));
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
