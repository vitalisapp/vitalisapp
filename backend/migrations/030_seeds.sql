-- 030_seeds.sql — plan seeds (idempotent)
-- Runner does NOT ignore 1062: must stay INSERT IGNORE.

INSERT IGNORE INTO `plans` (`id`, `name`, `title`, `tag`, `intensity`, `duration`, `target_focus`, `price`, `image_seed`, `description`, `duration_days`) VALUES
(40, '', 'Foundations of Strength', 'Strength', 'Beginner', '4 Weeks', 'Full-Body Strength & Power', 0.00, 'foundations', 'Beginner progressive program', 28),
(41, '', 'Iron Forge Protocol', 'Strength', 'Advanced', '8 Weeks', 'Hypertrophy & Max Strength', 19.99, 'ironforge', 'Advanced 8-week hypertrophy block', 56),
(42, '', 'Fat Loss Sprint', 'Fat Loss', 'Moderate', '2 Weeks', 'Fat Loss', 9.99, 'fatloss', 'High-intensity 2-week block', 14),
(43, '', 'Cardio Surge', 'Cardio', 'Moderate', '4 Weeks', 'Cardio Endurance', 0.00, 'cardiosurge', '4-week aerobic base', 28),
(44, '', 'Mobility Reset', 'Recovery', 'Beginner', '1 Week', 'Recovery', 0.00, 'mobilityreset', '7-day mobility reset', 7),
(45, '', 'Total Flexibility Flow', 'Flexibility', 'Beginner', '2 Weeks', 'Flexibility', 4.99, 'flexflow', '2-week flexibility routine', 14);

-- New catalog entries use generated IDs; never overwrite existing or personal plans.
-- Temporary tables are connection-local and contain only this seed's new programs.
DROP TEMPORARY TABLE IF EXISTS seed_plan_catalog;
CREATE TEMPORARY TABLE seed_plan_catalog (
  title VARCHAR(200), tag VARCHAR(100), intensity VARCHAR(50),
  weeks INT, focus VARCHAR(100), session_key VARCHAR(30), minutes INT,
  description TEXT
);
INSERT INTO seed_plan_catalog VALUES
('Bodyweight Basics', 'Strength', 'Beginner', 4, 'Full Body', 'balanced', 25, 'Build a bodyweight routine with squats, scaled push-ups, bridges and core work. Three training days, two mobility days and two rest days per week.'),
('Upper Body Foundations', 'Strength', 'Beginner', 4, 'Upper Body', 'upper', 25, 'Practice pushing and trunk control without weights. Use knee push-ups as needed and keep every repetition controlled.'),
('Lower Body Builder', 'Strength', 'Moderate', 4, 'Lower Body', 'lower', 30, 'Develop leg strength with squats, reverse lunges, glute bridges and calf raises. Alternate training with mobility and rest.'),
('Core Control', 'Strength', 'Beginner', 2, 'Core', 'core', 20, 'Build trunk stability with dead bugs, bird dogs, planks and side planks. Short sessions emphasize steady breathing and control.'),
('Everyday Strength Circuit', 'Strength', 'Moderate', 4, 'Full Body', 'balanced', 30, 'Repeat a balanced bodyweight circuit three times weekly, with dedicated mobility and rest days between sessions.'),
('Low Impact Cardio Start', 'Cardio', 'Beginner', 2, 'Cardio Endurance', 'lowimpact', 20, 'Build an aerobic habit with marching, step jacks, side steps and standing knee lifts. No jumping or equipment required.'),
('Cardio Rhythm', 'Cardio', 'Moderate', 4, 'Cardio Endurance', 'cardio', 25, 'Practice timed bodyweight cardio intervals with recovery between sets. Keep a pace you can maintain throughout the session.'),
('Steady Movement Habit', 'Cardio', 'Beginner', 4, 'Full Body', 'lowimpact', 25, 'Establish a regular movement routine with low-impact intervals, gentle mobility and scheduled rest days.'),
('Full Body Conditioning', 'Fat Loss', 'Moderate', 4, 'Full Body', 'conditioning', 30, 'Combine bodyweight strength and timed cardio to support general conditioning. Includes mobility sessions and rest days.'),
('Quick Conditioning Circuit', 'Fat Loss', 'Moderate', 2, 'Full Body', 'conditioning', 20, 'Short strength-and-cardio sessions for a busy schedule. Use controlled repetitions and take the prescribed rest between sets.'),
('Desk Break Mobility', 'Recovery', 'Beginner', 1, 'Mobility', 'mobility', 15, 'Gentle cat-cow, hip circles, child pose and breathing sessions for breaks from sitting. Stay within a comfortable range.'),
('Gentle Recovery Week', 'Recovery', 'Beginner', 1, 'Recovery', 'mobility', 15, 'A week of easy mobility and breathing with two full rest days. Keep the sessions relaxed rather than strenuous.'),
('Hip Mobility Practice', 'Flexibility', 'Beginner', 2, 'Lower Body', 'hips', 20, 'Practice comfortable hip and lower-body mobility with controlled stretches. Avoid bouncing and never force the range.'),
('Evening Stretch Routine', 'Flexibility', 'Beginner', 2, 'Flexibility', 'stretch', 15, 'Wind down with gentle hamstring, calf, hip-flexor and child-pose holds. Includes two rest days per week.'),
('Athletic Bodyweight Prep', 'Strength', 'Moderate', 4, 'Full Body', 'athletic', 30, 'Build a base of leg strength and trunk control using reverse lunges, squats, shoulder taps and bird dogs.');

-- Check both fields with whitespace/case normalization; existing data stays untouched.
DROP TEMPORARY TABLE IF EXISTS seed_new_plans;
CREATE TEMPORARY TABLE seed_new_plans AS
SELECT c.* FROM seed_plan_catalog c
WHERE NOT EXISTS (
  SELECT 1 FROM plans p
  WHERE LOWER(TRIM(p.title)) = LOWER(TRIM(c.title))
     OR LOWER(TRIM(p.name)) = LOWER(TRIM(c.title))
);
INSERT INTO plans (name, title, tag, intensity, duration, target_focus, price, image_seed, description, duration_days, difficulty)
SELECT title, title, tag, intensity, CONCAT(weeks, IF(weeks = 1, ' Week', ' Weeks')),
       focus, 0.00, LOWER(REPLACE(title, ' ', '-')), description, weeks * 7, intensity
FROM seed_new_plans;

-- Compatible with migration 030 (owner/template/image columns arrive later).
-- Their defaults make these public templates with no image.
DROP TEMPORARY TABLE IF EXISTS seed_day_numbers;
CREATE TEMPORARY TABLE seed_day_numbers (n INT PRIMARY KEY);
INSERT INTO seed_day_numbers VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),
(15),(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27),(28);
INSERT INTO plan_contents (plan_id, day_number, title, activity_type, description, duration_mins)
SELECT p.id, d.n,
       CONCAT('Day ', d.n, ' - ', CASE
         WHEN MOD(d.n - 1, 7) IN (3,6) THEN 'Rest'
         WHEN c.tag IN ('Recovery','Flexibility') OR MOD(d.n - 1, 7) IN (1,5) THEN 'Mobility'
         ELSE 'Training' END),
       CASE WHEN MOD(d.n - 1, 7) IN (3,6) THEN 'Rest'
         WHEN c.tag IN ('Recovery','Flexibility') OR MOD(d.n - 1, 7) IN (1,5) THEN 'Recovery'
         ELSE 'Workout' END,
       CASE WHEN MOD(d.n - 1, 7) IN (3,6) THEN 'Rest today. An easy walk is optional.'
         WHEN c.tag IN ('Recovery','Flexibility') OR MOD(d.n - 1, 7) IN (1,5)
           THEN 'Move gently and stay within a comfortable range. Do not force stretches.'
         ELSE 'Warm up for 3-5 minutes. Complete the listed sets with the prescribed rest, then cool down. Scale repetitions to maintain good form.' END,
       CASE WHEN MOD(d.n - 1, 7) IN (3,6) THEN 0
         WHEN MOD(d.n - 1, 7) IN (1,5) THEN 15 ELSE c.minutes END
FROM seed_new_plans c JOIN plans p ON p.title = c.title
JOIN seed_day_numbers d ON d.n <= c.weeks * 7;

DROP TEMPORARY TABLE IF EXISTS seed_session_exercises;
CREATE TEMPORARY TABLE seed_session_exercises (
  session_key VARCHAR(30), exercise_order INT, exercise_name VARCHAR(150),
  reps VARCHAR(50), seconds INT, notes VARCHAR(255)
);
INSERT INTO seed_session_exercises VALUES
('balanced',1,'Bodyweight Squats','10',NULL,'Use a comfortable depth.'),
('balanced',2,'Push-Ups','8',NULL,'Knees down to scale.'),
('balanced',3,'Glute Bridge','12',NULL,'Squeeze gently at the top.'),
('balanced',4,'Plank',NULL,20,'Keep breathing; shorten the hold if needed.'),
('upper',1,'Push-Ups','8',NULL,'Knees down to scale.'),
('upper',2,'Wall Push-Ups','12',NULL,'Keep your body aligned.'),
('upper',3,'Plank Shoulder Taps','10 total',NULL,'Keep hips still.'),
('upper',4,'Bird Dog','8 each side',NULL,'Reach slowly without arching.'),
('lower',1,'Bodyweight Squats','12',NULL,'Keep heels grounded.'),
('lower',2,'Reverse Lunges','8 each side',NULL,'Use support for balance if needed.'),
('lower',3,'Glute Bridge','12',NULL,'Do not overarch your back.'),
('lower',4,'Calf Raises','15',NULL,'Lower slowly.'),
('core',1,'Dead Bug','8 each side',NULL,'Keep the lower back stable.'),
('core',2,'Bird Dog','8 each side',NULL,'Pause briefly at extension.'),
('core',3,'Plank',NULL,20,'Stop before your hips sag.'),
('core',4,'Side Plank',NULL,15,'Hold each side; lower knee down to scale.'),
('lowimpact',1,'March in Place',NULL,40,'Keep an easy conversational pace.'),
('lowimpact',2,'Step Jacks',NULL,40,'Step sideways instead of jumping.'),
('lowimpact',3,'Side Steps',NULL,40,'Use soft knees.'),
('lowimpact',4,'Standing Knee Raises',NULL,30,'Alternate legs slowly.'),
('cardio',1,'Jumping Jacks',NULL,30,'Use step jacks to reduce impact.'),
('cardio',2,'High Knees',NULL,30,'March instead of running to scale.'),
('cardio',3,'Mountain Climbers',NULL,20,'Step feet in slowly if needed.'),
('cardio',4,'Skaters',NULL,30,'Step side to side instead of jumping to scale.'),
('conditioning',1,'Bodyweight Squats','12',NULL,'Use controlled repetitions.'),
('conditioning',2,'Step Jacks',NULL,40,'Maintain a steady pace.'),
('conditioning',3,'Push-Ups','8',NULL,'Knees down to scale.'),
('conditioning',4,'Mountain Climbers',NULL,20,'Step rather than run to scale.'),
('mobility',1,'Cat-Cow','8',NULL,'Move with your breath.'),
('mobility',2,'Hip Circles','8 each direction',NULL,'Use a comfortable range.'),
('mobility',3,'Child''s Pose Hold',NULL,30,'Keep the stretch gentle.'),
('mobility',4,'Deep Breathing',NULL,60,'Breathe slowly and comfortably.'),
('hips',1,'Hip Circles','8 each direction',NULL,'Do not force the range.'),
('hips',2,'Hip Flexor Stretch',NULL,30,'Hold each side without arching your back.'),
('hips',3,'Seated Figure Four Stretch',NULL,30,'Hold each side gently.'),
('hips',4,'Glute Bridge','10',NULL,'Move slowly.'),
('stretch',1,'Hamstring Stretch',NULL,30,'Hold each side without bouncing.'),
('stretch',2,'Calf Stretch',NULL,30,'Hold each side.'),
('stretch',3,'Hip Flexor Stretch',NULL,30,'Hold each side gently.'),
('stretch',4,'Child''s Pose Hold',NULL,30,'Breathe steadily.'),
('athletic',1,'Reverse Lunges','10 each side',NULL,'Step back with control.'),
('athletic',2,'Bodyweight Squats','12',NULL,'Maintain a steady tempo.'),
('athletic',3,'Plank Shoulder Taps','12 total',NULL,'Keep hips still.'),
('athletic',4,'Bird Dog','10 each side',NULL,'Pause at extension.');

INSERT INTO plan_exercises (plan_content_id, exercise_order, exercise_name, sets, reps, duration_seconds, rest_seconds, notes)
SELECT d.id, e.exercise_order, e.exercise_name,
       CASE WHEN d.activity_type = 'Recovery' OR c.intensity = 'Beginner' THEN 2 ELSE 3 END,
       e.reps, e.seconds, IF(d.activity_type = 'Recovery', 20, 45), e.notes
FROM seed_new_plans c JOIN plans p ON p.title = c.title
JOIN plan_contents d ON d.plan_id = p.id
JOIN seed_session_exercises e ON e.session_key =
  CASE WHEN d.activity_type = 'Recovery' AND c.tag NOT IN ('Recovery','Flexibility')
    THEN 'mobility' ELSE c.session_key END
WHERE d.activity_type <> 'Rest';

DROP TEMPORARY TABLE seed_session_exercises;
DROP TEMPORARY TABLE seed_day_numbers;
DROP TEMPORARY TABLE seed_new_plans;
DROP TEMPORARY TABLE seed_plan_catalog;

-- Public assets are served from /plans/, not /public/plans/.
-- Apply on every seed run, including plans that already exist.
DROP TEMPORARY TABLE IF EXISTS seed_plan_images;
CREATE TEMPORARY TABLE seed_plan_images (title VARCHAR(200), image_url VARCHAR(500));
INSERT INTO seed_plan_images VALUES
('Foundations of Strength', '/plans/lucid-origin_Filename_foundations-of-strength.png_Beginner-focused_controlled_bodyweight_squa-0.jpg'),
('Iron Forge Protocol', '/plans/lucid-origin_02_Iron_Forge_Protocol_Filename_iron-forge-protocol.png_Powerful_strength_traini-0.jpg'),
('Fat Loss Sprint', '/plans/lucid-origin_03_Fat_Loss_Sprint_Filename_fat-loss-sprint.png_writing_variant_standard_id_8200-0.jpg'),
('Cardio Surge', '/plans/lucid-origin_04_Cardio_Surge_Filename_cardio-surge.png_writing_variant_standard_id_82004_Crea-0.jpg'),
('Mobility Reset', '/plans/lucid-origin_05_Mobility_Reset_Filename_mobility-reset.png_writing_variant_standard_id_82005_-0.jpg'),
('Total Flexibility Flow', '/plans/lucid-origin_06_Total_Flexibility_Flow_Filename_total-flexibility-flow.png_writing_variant_st-0.jpg'),
('Bodyweight Basics', '/plans/lucid-origin_07_Bodyweight_Basics_Filename_bodyweight-basics.png_writing_variant_standard_id_-0.jpg'),
('Upper Body Foundations', '/plans/lucid-origin_08_Upper_Body_Foundations_Filename_upper-body-foundations.png_writing_variant_st-0.jpg'),
('Lower Body Builder', '/plans/gpt-image-2_09_Lower_Body_Builder_Filename_lower-body-builder.png_writing_variant_standard_i-0.jpg'),
('Core Control', '/plans/gpt-image-2_10_Core_Control_Filename_core-control.png_writing_variant_standard_id_82010_Crea-0.jpg'),
('Everyday Strength Circuit', '/plans/lucid-origin_11_Everyday_Strength_Circuit_Filename_everyday-strength-circuit.png_writing_vari-0.jpg'),
('Low Impact Cardio Start', '/plans/lucid-origin_12_Low_Impact_Cardio_Start_Filename_low-impact-cardio-start.png_writing_variant_-0.jpg'),
('Cardio Rhythm', '/plans/lucid-origin_13_Cardio_Rhythm_Filename_cardio-rhythm.png_writing_variant_standard_id_82013_Cr-0.jpg'),
('Steady Movement Habit', '/plans/lucid-origin_14_Steady_Movement_Habit_Filename_steady-movement-habit.png_writing_variant_stan-0.jpg'),
('Full Body Conditioning', '/plans/gpt-image-2_15_Full_Body_Conditioning_Filename_full-body-conditioning.png_writing_variant_st-0.jpg'),
('Quick Conditioning Circuit', '/plans/gpt-image-2_16_Quick_Conditioning_Circuit_Filename_quick-conditioning-circuit.png_writing_va-0.jpg'),
('Desk Break Mobility', '/plans/lucid-origin_17_Desk_Break_Mobility_Filename_desk-break-mobility.png_writing_variant_standard-0.jpg'),
('Gentle Recovery Week', '/plans/lucid-origin_18_Gentle_Recovery_Week_Filename_gentle-recovery-week.png_writing_variant_standa-0.jpg'),
('Hip Mobility Practice', '/plans/gpt-image-2_19_Hip_Mobility_Practice_Filename_hip-mobility-practice.png_writing_variant_stan-0.jpg'),
('Evening Stretch Routine', '/plans/gpt-image-2.5-sunburst_can_you_regenerate_the_20_cause_the_legs_looks_like_its_been_cut_of_regenerate_i-0.jpg'),
('Athletic Bodyweight Prep', '/plans/lucid-origin_21_Athletic_Bodyweight_Prep_Filename_athletic-bodyweight-prep.png_writing_varian-0.jpg');

-- Migration 030 precedes the image/ownership columns on fresh databases.
-- Run npm run seed:plans after npm run db:migrate to apply covers there.
SET @seed_image_sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE() AND table_name = 'plans'
     AND column_name IN ('image_url', 'owner_user_id', 'is_template')) = 3,
  'UPDATE plans p JOIN seed_plan_images i ON LOWER(TRIM(p.title)) = LOWER(TRIM(i.title))
   SET p.image_url = i.image_url WHERE p.owner_user_id IS NULL AND p.is_template = 1',
  'SELECT ''Plan covers require completed migrations; run npm run seed:plans afterwards'' AS seed_notice'
);
PREPARE seed_image_update FROM @seed_image_sql;
EXECUTE seed_image_update;
DEALLOCATE PREPARE seed_image_update;
DROP TEMPORARY TABLE seed_plan_images;
