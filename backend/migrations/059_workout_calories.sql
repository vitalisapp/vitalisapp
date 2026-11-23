-- Net calories burned per workout session (MET × body weight × active time,
-- see src/utils/energyBurn.js). Feeds the dashboard's "burned" total so a
-- finished workout raises the day's remaining calorie budget.
-- NULL = saved before tracking; the read path estimates those on the fly.
ALTER TABLE `workout_logs` ADD COLUMN `calories_burned` int(11) DEFAULT NULL;
