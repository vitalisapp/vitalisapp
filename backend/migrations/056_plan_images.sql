-- 056 — Catalog plan cover images.
-- The artwork lives in frontend/public/plans/<slug>.jpg (served by the
-- frontend at /plans/<slug>.jpg), but no migration ever stored those paths,
-- so freshly migrated databases (e.g. production) had image_url = NULL and
-- the Plans page fell back to the tag icon. Matched by title on catalog rows
-- only (owner_user_id IS NULL); personal plans are never touched.
-- Idempotent: re-running writes the same values.

UPDATE `plans` SET `image_url` = CASE TRIM(`title`)
  WHEN 'Athletic Bodyweight Prep' THEN '/plans/athletic-bodyweight-prep.jpg'
  WHEN 'Bodyweight Basics' THEN '/plans/bodyweight-basics.jpg'
  WHEN 'Cardio Rhythm' THEN '/plans/cardio-rhythm.jpg'
  WHEN 'Cardio Surge' THEN '/plans/cardio-surge.jpg'
  WHEN 'Core Control' THEN '/plans/core-control.jpg'
  WHEN 'Desk Break Mobility' THEN '/plans/desk-break-mobility.jpg'
  WHEN 'Evening Stretch Routine' THEN '/plans/evening-stretch-routine.jpg'
  WHEN 'Everyday Strength Circuit' THEN '/plans/everyday-strength-circuit.jpg'
  WHEN 'Fat Loss Sprint' THEN '/plans/fat-loss-sprint.jpg'
  WHEN 'Foundations of Strength' THEN '/plans/foundations-of-strength.jpg'
  WHEN 'Full Body Conditioning' THEN '/plans/full-body-conditioning.jpg'
  WHEN 'Gentle Recovery Week' THEN '/plans/gentle-recovery-week.jpg'
  WHEN 'Hip Mobility Practice' THEN '/plans/hip-mobility-practice.jpg'
  WHEN 'Iron Forge Protocol' THEN '/plans/iron-forge-protocol.jpg'
  WHEN 'Lower Body Builder' THEN '/plans/lower-body-builder.jpg'
  WHEN 'Low Impact Cardio Start' THEN '/plans/low-impact-cardio-start.jpg'
  WHEN 'Mobility Reset' THEN '/plans/mobility-reset.jpg'
  WHEN 'Quick Conditioning Circuit' THEN '/plans/quick-conditioning-circuit.jpg'
  WHEN 'Steady Movement Habit' THEN '/plans/steady-movement-habit.jpg'
  WHEN 'Total Flexibility Flow' THEN '/plans/total-flexibility-flow.jpg'
  WHEN 'Upper Body Foundations' THEN '/plans/upper-body-foundations.jpg'
  ELSE `image_url`
END
WHERE `owner_user_id` IS NULL;
