-- 030_seeds.sql — plan seeds (idempotent)
-- Runner does NOT ignore 1062: must stay INSERT IGNORE.

INSERT IGNORE INTO `plans` (`id`, `name`, `title`, `tag`, `intensity`, `duration`, `target_focus`, `price`, `image_seed`, `description`, `duration_days`) VALUES
(40, '', 'Foundations of Strength', 'Strength', 'Beginner', '4 Weeks', 'Full-Body Strength & Power', 0.00, 'foundations', 'Beginner progressive program', 28),
(41, '', 'Iron Forge Protocol', 'Strength', 'Advanced', '8 Weeks', 'Hypertrophy & Max Strength', 19.99, 'ironforge', 'Advanced 8-week hypertrophy block', 56),
(42, '', 'Fat Loss Sprint', 'Fat Loss', 'Moderate', '2 Weeks', 'Fat Loss', 9.99, 'fatloss', 'High-intensity 2-week block', 14),
(43, '', 'Cardio Surge', 'Cardio', 'Moderate', '4 Weeks', 'Cardio Endurance', 0.00, 'cardiosurge', '4-week aerobic base', 28),
(44, '', 'Mobility Reset', 'Recovery', 'Beginner', '1 Week', 'Recovery', 0.00, 'mobilityreset', '7-day mobility reset', 7),
(45, '', 'Total Flexibility Flow', 'Flexibility', 'Beginner', '2 Weeks', 'Flexibility', 4.99, 'flexflow', '2-week flexibility routine', 14);
