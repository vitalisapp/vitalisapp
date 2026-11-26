-- Production catch-up: migrations 060-063. Safe to run more than once:
-- each column/index is added only if missing; seeds skip existing rows.
-- Run it against the production database (select it first).

-- ===== 060_password_weak_flag.sql =====
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'password_weak') = 0, 'ALTER TABLE `users` ADD COLUMN `password_weak` tinyint(1) DEFAULT NULL', 'DO 0'));
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
INSERT IGNORE INTO _migrations (name) VALUES ('060_password_weak_flag.sql');

-- ===== 061_progression.sql =====
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'form_score') = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `form_score` tinyint(3) unsigned DEFAULT NULL', 'DO 0'));
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'progression_level') = 0, 'ALTER TABLE `users` ADD COLUMN `progression_level` tinyint(3) unsigned NOT NULL DEFAULT 1', 'DO 0'));
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'progression_seen') = 0, 'ALTER TABLE `users` ADD COLUMN `progression_seen` tinyint(3) unsigned NOT NULL DEFAULT 1', 'DO 0'));
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
CREATE TABLE IF NOT EXISTS `user_challenges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `challenge_key` varchar(50) NOT NULL,
  `workout_log_id` int(11) DEFAULT NULL,
  `best_value` int(11) DEFAULT NULL,
  `completed_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_challenge` (`user_id`, `challenge_key`),
  KEY `idx_user_challenges_user` (`user_id`),
  CONSTRAINT `user_challenges_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_challenges_log_fk` FOREIGN KEY (`workout_log_id`) REFERENCES `workout_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DROP TEMPORARY TABLE IF EXISTS seed_level_plans;
CREATE TEMPORARY TABLE seed_level_plans (seed_pk INT AUTO_INCREMENT PRIMARY KEY, 
  title VARCHAR(200), tag VARCHAR(100), intensity VARCHAR(50), weeks INT,
  minutes INT, session_key VARCHAR(30), description TEXT
);
INSERT INTO seed_level_plans (title, tag, intensity, weeks, minutes, session_key, description) VALUES
('Advanced Strength Builder', 'Strength', 'Advanced', 4, 45, 'adv_strength',
 'Unlocked at Level 2. Higher-volume bodyweight strength with tempo work and longer holds. Warm up fully and keep perfect form on every rep.'),
('Elite Strength Block', 'Strength', 'Extreme', 4, 55, 'elite_strength',
 'Unlocked at Level 3. Demanding strength sessions with high volume and slow eccentrics. Stop a set early if your form breaks down.'),
('Elite Conditioning', 'Performance', 'Extreme', 2, 40, 'elite_conditioning',
 'Unlocked at Level 3. Hard conditioning intervals for experienced trainees. Includes jumping; swap in step-based versions if impact bothers your joints.');
INSERT INTO plans (name, title, tag, intensity, duration, target_focus, price, image_seed, description, duration_days, difficulty)
SELECT s.title, s.title, s.tag, s.intensity, CONCAT(s.weeks, IF(s.weeks = 1, ' Week', ' Weeks')),
       s.tag, 0.00, LOWER(REPLACE(s.title, ' ', '-')), s.description, s.weeks * 7, s.intensity
FROM seed_level_plans s
WHERE NOT EXISTS (
  SELECT 1 FROM plans p
  WHERE LOWER(TRIM(p.title)) = LOWER(TRIM(s.title)) OR LOWER(TRIM(p.name)) = LOWER(TRIM(s.title))
);
DROP TEMPORARY TABLE IF EXISTS seed_level_days;
CREATE TEMPORARY TABLE seed_level_days (n INT PRIMARY KEY);
INSERT INTO seed_level_days VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),
(15),(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28);
INSERT IGNORE INTO plan_contents (plan_id, day_number, title, activity_type, description, duration_mins)
SELECT p.id, d.n,
       CONCAT('Day ', d.n, ' - ', CASE
         WHEN MOD(d.n - 1, 7) IN (3,6) THEN 'Rest'
         WHEN MOD(d.n - 1, 7) IN (1,5) THEN 'Mobility'
         ELSE 'Training' END),
       CASE WHEN MOD(d.n - 1, 7) IN (3,6) THEN 'Rest'
         WHEN MOD(d.n - 1, 7) IN (1,5) THEN 'Recovery'
         ELSE 'Workout' END,
       CASE WHEN MOD(d.n - 1, 7) IN (3,6) THEN 'Full rest. Sleep well and eat enough protein to recover.'
         WHEN MOD(d.n - 1, 7) IN (1,5) THEN 'Easy mobility to recover. Stay within a comfortable range.'
         ELSE 'Complete the full warm-up first. Work hard but stop each set before your form breaks down, then cool down.' END,
       CASE WHEN MOD(d.n - 1, 7) IN (3,6) THEN 0
         WHEN MOD(d.n - 1, 7) IN (1,5) THEN 15 ELSE s.minutes END
FROM seed_level_plans s JOIN plans p ON p.title = s.title
JOIN seed_level_days d ON d.n <= s.weeks * 7;
DROP TEMPORARY TABLE IF EXISTS seed_level_exercises;
CREATE TEMPORARY TABLE seed_level_exercises (seed_pk INT AUTO_INCREMENT PRIMARY KEY, 
  session_key VARCHAR(30), exercise_order INT, exercise_name VARCHAR(150),
  sets INT, reps VARCHAR(50), seconds INT, rest INT, notes VARCHAR(255)
);
INSERT INTO seed_level_exercises (session_key, exercise_order, exercise_name, sets, reps, seconds, rest, notes) VALUES
('adv_strength',1,'Bodyweight Squats',4,'20',NULL,60,'3-second lowering phase.'),
('adv_strength',2,'Push-Ups',4,'15',NULL,60,'Chest to fist height; full lockout.'),
('adv_strength',3,'Reverse Lunges',3,'12 each side',NULL,60,'Front knee tracks over the toes.'),
('adv_strength',4,'Glute Bridge',3,'20',NULL,45,'Pause 2 seconds at the top.'),
('adv_strength',5,'Plank',3,NULL,60,45,'Squeeze glutes; no sagging.'),
('elite_strength',1,'Bodyweight Squats',5,'25',NULL,75,'4-second lowering phase.'),
('elite_strength',2,'Push-Ups',5,'20',NULL,75,'Slow lowering; explode up.'),
('elite_strength',3,'Bulgarian Split Squats',4,'12 each side',NULL,75,'Rear foot on a sturdy chair.'),
('elite_strength',4,'Single-Leg Glute Bridge',4,'15 each side',NULL,60,'Hips stay level.'),
('elite_strength',5,'Plank',4,NULL,90,60,'Stop if your lower back aches.'),
('elite_strength',6,'Side Plank',3,NULL,45,45,'Each side.'),
('elite_conditioning',1,'Jumping Jacks',5,NULL,45,20,'Step jacks if impact bothers you.'),
('elite_conditioning',2,'Mountain Climbers',5,NULL,40,20,'Hips level with shoulders.'),
('elite_conditioning',3,'Bodyweight Squats',5,'25',NULL,30,'Fast but controlled.'),
('elite_conditioning',4,'High Knees',5,NULL,40,20,'March fast instead to reduce impact.'),
('elite_conditioning',5,'Push-Ups',4,'15',NULL,30,'Knees down if form slips.'),
('mobility',1,'Cat-Cow',2,'8',NULL,20,'Move with your breath.'),
('mobility',2,'Hip Circles',2,'8 each direction',NULL,20,'Use a comfortable range.'),
('mobility',3,'Hamstring Stretch',2,NULL,30,20,'Hold each side without bouncing.'),
('mobility',4,'Deep Breathing',1,NULL,60,NULL,'Breathe slowly and comfortably.');
INSERT INTO plan_exercises (plan_content_id, exercise_order, exercise_name, sets, reps, duration_seconds, rest_seconds, notes)
SELECT d.id, e.exercise_order, e.exercise_name, e.sets, e.reps, e.seconds, e.rest, e.notes
FROM seed_level_plans s JOIN plans p ON p.title = s.title
JOIN plan_contents d ON d.plan_id = p.id
JOIN seed_level_exercises e ON e.session_key = IF(d.activity_type = 'Recovery', 'mobility', s.session_key)
WHERE d.activity_type <> 'Rest'
  AND NOT EXISTS (SELECT 1 FROM plan_exercises x WHERE x.plan_content_id = d.id);
DROP TEMPORARY TABLE seed_level_exercises;
DROP TEMPORARY TABLE seed_level_days;
DROP TEMPORARY TABLE seed_level_plans;
INSERT IGNORE INTO _migrations (name) VALUES ('061_progression.sql');

-- ===== 062_activity_calories.sql =====
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'local_date') = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `local_date` date DEFAULT NULL', 'DO 0'));
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND column_name = 'calories_source') = 0, 'ALTER TABLE `activity_logs` ADD COLUMN `calories_source` enum(''estimated'',''measured'') NOT NULL DEFAULT ''estimated''', 'DO 0'));
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND column_name = 'local_date') = 0, 'ALTER TABLE `workout_logs` ADD COLUMN `local_date` date DEFAULT NULL', 'DO 0'));
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'activity_logs' AND index_name = 'idx_activity_logs_user_local_date') = 0, 'CREATE INDEX `idx_activity_logs_user_local_date` ON `activity_logs` (`user_id`, `local_date`)', 'DO 0'));
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
SET @s = (SELECT IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND index_name = 'idx_workout_logs_user_local_date') = 0, 'CREATE INDEX `idx_workout_logs_user_local_date` ON `workout_logs` (`user_id`, `local_date`)', 'DO 0'));
PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;
INSERT IGNORE INTO _migrations (name) VALUES ('062_activity_calories.sql');

-- ===== 063_normalize_activity_level.sql =====
UPDATE `fitness_goals` SET `activity_level` = 'LIGHTLY_ACTIVE'    WHERE UPPER(`activity_level`) IN ('LIGHT', 'LIGHTLY ACTIVE');
UPDATE `fitness_goals` SET `activity_level` = 'MODERATELY_ACTIVE' WHERE UPPER(`activity_level`) IN ('MODERATE', 'MODERATELY ACTIVE');
UPDATE `fitness_goals` SET `activity_level` = 'VERY_ACTIVE'       WHERE UPPER(`activity_level`) IN ('ACTIVE', 'VERY', 'VERY ACTIVE');
UPDATE `fitness_goals` SET `activity_level` = 'HIGHLY_ACTIVE'     WHERE UPPER(`activity_level`) IN ('HIGH', 'HIGHLY ACTIVE', 'EXTRA_ACTIVE', 'EXTREMELY_ACTIVE');
INSERT IGNORE INTO _migrations (name) VALUES ('063_normalize_activity_level.sql');

SELECT name, applied_at FROM _migrations WHERE name >= '060' ORDER BY name;
