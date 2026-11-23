-- Browser installation identity. Legacy rows remain as history, not devices.
-- Multiple NULLs are allowed in this unique index.
ALTER TABLE `user_sessions` ADD COLUMN `device_id` char(36) DEFAULT NULL;
ALTER TABLE `user_sessions` ADD UNIQUE KEY `uniq_user_device_id` (`user_id`, `device_id`);
