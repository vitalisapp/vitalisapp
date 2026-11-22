// Demo-only records for the disposable database used by build-database-sql.
// Never runs automatically during application startup or normal migrations.
const bcrypt = require('bcryptjs');
const { createHash } = require('crypto');
const { isoLocal, addDays, weekStartOf, buildWeek } = require('../src/utils/coachEngine');

module.exports = async function seedDemoData(db) {
  const [[{ name }]] = await db.query('SELECT DATABASE() AS name');
  if (!/^vitalis_sqlbuild_\d+$/.test(name)) throw new Error('Demo seeding requires a disposable SQL-build database.');
  const today = isoLocal(new Date());
  const day = (offset) => addDays(today, offset);
  const at = (offset, time = '09:00:00') => `${day(offset)} ${time}`;
  const digest = (value) => createHash('sha256').update(value).digest('hex');
  const password = await bcrypt.hash('12345678', 10);
  const insert = async (table, row) => {
    const keys = Object.keys(row);
    const [result] = await db.execute(
      `INSERT INTO \`${table}\` (${keys.map((k) => `\`${k}\``).join(',')}) VALUES (${keys.map(() => '?').join(',')})`,
      Object.values(row).map((v) => v !== null && typeof v === 'object' ? JSON.stringify(v) : v),
    );
    return result.insertId;
  };
  await db.beginTransaction();
  try {
    // The migrations supply the sole admin; refuse an unexpected dataset.
    const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM users');
    const [[admin]] = await db.query("SELECT id FROM users WHERE email = 'admin@gmail.com'");
    if (Number(count) !== 1 || !admin) throw new Error('Expected only the migration-seeded admin.');
    await db.execute(
      `UPDATE users SET name = 'Admin', password = ?, role = 'admin', status = 'active',
       is_verified = 1, onboarding_completed = 1, created_at = ?, accepted_terms_at = ? WHERE id = ?`,
      [password, at(-35), at(-35), admin.id],
    );
    const group = await insert('access_groups', {
      code: 'VITALISDEMO', label: 'Demo members', description: 'Five fictional accounts for local demonstrations.',
      kind: 'register', created_by: admin.id, scan_count: 5, created_at: at(-30),
    });
    const [plans] = await db.query(
      `SELECT p.id FROM plans p WHERE p.is_template = 1 AND EXISTS
       (SELECT 1 FROM plan_contents c WHERE c.plan_id = p.id AND c.activity_type = 'Workout')
       ORDER BY p.id LIMIT 5`,
    );
    if (plans.length !== 5) throw new Error('Expected at least five seeded plans.');
    const goals = ['LOSE_WEIGHT', 'BUILD_MUSCLE', 'MAINTAIN_WEIGHT', 'PERFORMANCE', 'GAIN_WEIGHT'];
    const users = [];
    for (let n = 5; n <= 9; n += 1) {
      const id = await insert('users', {
        name: `user${n}`, email: `user${n}@gmail.com`, password, role: 'member',
        status: 'active', is_verified: 1, onboarding_completed: 1, fitness_goal: goals[n - 5],
        access_group_id: group, created_at: at(-30), accepted_terms_at: at(-30),
      });
      users.push({ id, name: `user${n}`, index: n - 5 });
    }
    for (const user of [{ id: admin.id, name: 'Admin', index: 0 }, ...users]) {
      await insert('user_profiles', { user_id: user.id, bio: 'Fictional Vitalis demo account.', height_cm: 170, weight_kg: 70 + user.index });
      await insert('user_settings', { user_id: user.id, units: 'metric', step_goal: 8000, theme: 'system' });
      // Keep demo email reminders disabled; in-app examples remain visible.
      await insert('reminder_prefs', { user_id: user.id, email_weekly: 0 });
      await insert('user_sessions', {
        user_id: user.id, device: 'Demo desktop', browser: 'Chrome', os: 'Windows',
        ip_address: '192.0.2.5', location: 'Demo location', is_current: 0, created_at: at(-1),
      });
    }
    const activities = [];
    const posts = [];
    // A tiny valid PNG is explicitly a placeholder, not a person's progress photo.
    const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5WQAAAAASUVORK5CYII=';
    for (const { id, name: username, index } of users) {
      const planId = plans[index].id;
      const weight = 70 + index;
      const bmi = Number((weight / 1.7 ** 2).toFixed(2));
      await insert('training_preferences', {
        user_id: id, equipment: ['Bodyweight', 'Dumbbells'], preferred_days: [1, 3, 5],
        session_duration_mins: 30, workout_location: 'Home', excluded_categories: [], excluded_exercises: [],
      });
      await insert('fitness_goals', {
        user_id: id, dob: `199${index}-06-15`, sex: index % 2 ? 'female' : 'male',
        height_cm: 170, weight_kg: weight, bmi, goal_type: goals[index],
        target_weight_kg: weight + (index === 0 ? -4 : index === 4 ? 3 : 0),
        target_date: day(120), activity_level: 'MODERATE', experience_level: 'BEGINNER',
        exercise_freq: '3', sleep_hours: 7.5, daily_kcal: 2200, protein_g: 140, carbs_g: 275, fat_g: 60,
        source_plan_id: planId, calibrated_weight_kg: weight, calibrated_at: at(-1), created_at: at(-30),
      });
      await insert('user_plans', { user_id: id, plan_id: planId, enrolled_at: at(-14) });
      const [planDays] = await db.execute(
        'SELECT day_number, title, activity_type, duration_mins FROM plan_contents WHERE plan_id = ? ORDER BY day_number LIMIT 7',
        [planId],
      );
      if (!planDays.length) throw new Error(`Demo plan ${planId} has no scheduled days.`);
      await insert('coach_weeks', {
        user_id: id, plan_id: planId, week_start: weekStartOf(),
        schedule: buildWeek(planDays, [1, 3, 5], weekStartOf()), handled: [],
      });
      for (const p of planDays.slice(0, 3)) {
        await insert('user_plan_progress', {
          user_id: id, plan_id: planId, day_number: p.day_number,
          is_completed: 1, completed_at: at(-8 + p.day_number),
        });
      }
      await insert('progress_settings', { user_id: id, cadence_days: 7 });
      await insert('user_allergies', { user_id: id, allergy_name: 'Peanuts' });
      for (const [nutrient, target] of [['PROTEIN', 140], ['CARBOHYDRATES', 275], ['FAT', 60]]) {
        await insert('user_nutrient_goals', { user_id: id, nutrient, target_value: target });
      }
      for (let offset = -13; offset <= 0; offset += 1) {
        const workoutDay = offset % 2 === 0;
        await insert('daily_stats', {
          user_id: id, stat_date: day(offset), calories_burned: workoutDay ? 280 : 100,
          steps: 6500 + index * 300 + (offset + 13) * 110, workout_duration_mins: workoutDay ? 30 : 0,
        });
        const foods = [
          ['Oatmeal with banana', 'breakfast', 350, 12, 60, 7, 180, '08:00:00'],
          ['Grilled chicken with rice', 'lunch', 650, 45, 80, 17, 350, '12:00:00'],
          ['Fish with vegetables and rice', 'dinner', 580, 38, 65, 19, 320, '18:00:00'],
        ];
        for (const [food, meal, kcal, protein, carbs, fat, grams, time] of foods) {
          await insert('food_logs', {
            user_id: id, food_name: food, serving: '1 plate', grams, meal_type: meal,
            calories: kcal, protein, carbs, fat, sugar: 5, sodium: 300, logged_at: at(offset, time),
          });
        }
        if (workoutDay) {
          const log = await insert('workout_logs', {
            user_id: id, workout_type: 'Squat', status: 'completed', rep_count: 30,
            start_time: at(offset, '06:00:00'), end_time: at(offset, '06:30:00'),
            duration_seconds: 1800, difficulty_rating: 3, session_notes: 'Demo workout: three controlled sets.',
            created_at: at(offset, '06:00:00'),
          });
          for (let set = 1; set <= 3; set += 1) {
            await insert('workout_sets', {
              workout_log_id: log, user_id: id, exercise_name: 'Squat', set_number: set,
              reps: 10, weight_kg: 0, duration_seconds: 60, created_at: at(offset, '06:10:00'),
            });
          }
        }
      }
      for (const offset of [-28, -14, -7, 0]) {
        const recordedWeight = Number((weight + (index === 0 ? -offset * 0.04 : index === 4 ? offset * 0.025 : 0)).toFixed(2));
        const recordedBmi = Number((recordedWeight / 1.7 ** 2).toFixed(2));
        await insert('bmi_records', {
          user_id: id, weight_kg: recordedWeight, height_cm: 170, bmi: recordedBmi,
          bmi_category: recordedBmi >= 25 ? 'Overweight' : 'Normal', recorded_at: at(offset),
        });
        await insert('body_measurements', {
          user_id: id, recorded_at: day(offset), weight_kg: recordedWeight, body_fat_pct: 22,
          chest_cm: 94, waist_cm: 80 + index, hips_cm: 96, arm_cm: 30, thigh_cm: 53, notes: 'Demo measurement.',
        });
      }
      for (const offset of [-14, -7]) {
        await insert('progress_photos', {
          user_id: id, pose: 'front', image_data: placeholder,
          ai_summary: 'Demo placeholder image; no physical assessment has been performed.', captured_at: at(offset),
        });
      }
      activities.push(await insert('activity_logs', {
        user_id: id, duration: 1800, distance: 3, pace: '10:00', calories: 150, is_gps: 0, created_at: at(-1, '17:00:00'),
      }));
      posts.push(await insert('community_posts', {
        user_id: id, author_name: username, text: `Finished my weekly workout goal! — ${username} (demo)`,
        tag: 'General', created_at: at(-1, '18:00:00'),
      }));
      await insert('notifications', { user_id: id, message: 'Your demo workout has been logged. Keep up the steady progress!', type: 'success', category: 'WORKOUT', source: 'demo' });
      await insert('reminder_log', { user_id: id, kind: 'workout', channel: 'inapp', sent_on: day(-1), variant: 0 });
      await insert('ai_daily_usage', { user_id: id, usage_day: day(-1), count: 1 });
      await insert('ai_insight_cache', {
        user_id: id, data_signature: `demo-${id}`,
        activity_suggestion: { message: 'Demo suggestion: try a comfortable walk on your next recovery day.' },
      });
      // Historical, consumed records populate these tables without creating live credentials.
      await insert('email_verifications', { user_id: id, token_hash: digest(`demo-email-${id}`), used: 1, expires_at: at(-29), created_at: at(-30) });
      await insert('password_reset_otps', { user_id: id, otp_hash: digest(`demo-reset-${id}`), used: 1, expires_at: at(-20), created_at: at(-21) });
      await insert('phone_verifications', {
        user_id: id, phone: `+1202555010${index}`, otp_hash: digest(`demo-phone-${id}`),
        used: 1, expires_at: at(-20), last_sent_at: at(-21), created_at: at(-21), reference_id: `demo-${id}`,
      });
    }
    for (let i = 0; i < users.length; i += 1) {
      const user = users[i];
      const friend = users[(i + 1) % users.length];
      await insert('friendships', { user_id: user.id, friend_id: friend.id, status: 'accepted', created_at: at(-7) });
      await insert('messages', { sender_id: user.id, receiver_id: friend.id, content: 'Ready for our next workout? (Demo conversation)', is_read: 1, sent_at: at(-1, '19:00:00') });
      await insert('messages', { sender_id: friend.id, receiver_id: user.id, content: 'Yes! Let us keep a comfortable pace. (Demo)', sent_at: at(-1, '19:05:00') });
      await insert('activity_kudos', { activity_id: activities[i], user_id: friend.id });
      await insert('community_likes', { post_id: posts[i], user_id: friend.id });
      await insert('community_comments', { post_id: posts[i], user_id: friend.id, author_name: friend.name, text: 'Great consistency! (Demo)' });
      await insert('landing_visits', { ip_hash: digest(`demo-visitor-${i}`), visit_date: day(-i), created_at: at(-i) });
    }
    await insert('admin_actions', { admin_user_id: admin.id, action: 'demo_seed', target_user_id: users[0].id, details: 'Created five fictional demo members and linked sample records.' });
    await insert('email_delivery_events', { message_id: 'demo-email-not-sent', status: 'delivered', updated_at: at(-29) });
    await insert('food_nutrition_cache', { name_normalized: 'demo oatmeal', display_name: 'Demo oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3, source: 'demo', model: 'fixture' });
    await db.commit();
  } catch (error) {
    await db.rollback();
    throw error;
  }
};
