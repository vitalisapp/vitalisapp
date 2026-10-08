
const db = require('../config/db');

const MAX_AVATAR_CHARS = 200 * 1024; // 200KB — base64 data-URLs bigger than this risk max_allowed_packet

function cleanStr(v, max) {
  if (v === undefined || v === null) return { value: null };
  if (typeof v !== 'string') return { error: 'must be a string' };
  const t = v.trim();
  if (t.length > max) return { error: `must be at most ${max} chars` };
  return { value: t === '' ? null : t };
}
// PUT /api/profile/update

async function putupdate(req,res,next){
  try{
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });
        const { fullName, contact, bio, avatar_url } = req.body || {};
    
        if (typeof fullName !== 'string' || !fullName.trim()) {
            return res.status(400).json({ error: 'Full name is required' });
        }
        if (fullName.trim().length > 100) {
            return res.status(400).json({ error: 'Full name too long (max 100 chars)' });
        }
        const cContact = cleanStr(contact, 50);
        const cBio = cleanStr(bio, 1000);
        if (cContact.error) return res.status(400).json({ error: `contact ${cContact.error}` });
        if (cBio.error) return res.status(400).json({ error: `bio ${cBio.error}` });
        let avatar = null;
        if (avatar_url !== undefined && avatar_url !== null && avatar_url !== '') {
          if (typeof avatar_url !== 'string') return res.status(400).json({ error: 'avatar_url must be a string' });
          if (avatar_url.length > MAX_AVATAR_CHARS) {
            return res.status(400).json({ error: 'Avatar too large (max 200KB). Use a smaller image or URL.' });
          }
          avatar = avatar_url;
        }
    
        try {
            const [userResult] = await db.execute(
                'UPDATE users SET name = ? WHERE id = ?',
                [fullName.trim(), userId]
            );
            if (userResult.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // FIX: height_cm / weight_kg are intentionally NOT part of this
            // update anymore. They're owned by the BMI page (POST /api/bmi/:userId),
            // which upserts them into user_profiles. Touching them here would
            // overwrite that data with null every time the user saves their
            // name/contact/bio/avatar.
            await db.execute(`
                INSERT INTO user_profiles (user_id, contact, bio, avatar_url)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    contact    = VALUES(contact),
                    bio        = VALUES(bio),
                    avatar_url = VALUES(avatar_url)
            `, [
                userId,
                cContact.value,
                cBio.value,
                avatar,
            ]);
    
            res.json({ success: true, message: 'Profile Synchronized' });
    
        } catch (err) {
            console.error('profile update error:', err.code, err.message);
            next(err);
        }
  }catch(e){ next(e); }
}

async function getUserId(req,res,next){
  try{
        const userId = Number(req.params.userId);
    
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
    
        try {
            // height_cm / weight_kg still selected here — Profile page reads
            // them read-only; they're written only from the BMI page.
            const [rows] = await db.execute(`
                SELECT 
                    u.name     AS fullName,
                    u.email,
                    p.contact,
                    p.bio,
                    p.avatar_url,
                    p.height_cm,
                    p.weight_kg
                FROM users u
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE u.id = ?
            `, [userId]);
    
            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Attach active onboarding/fitness goal if exists (used by Profile page)
            let onboarding = null;
            try {
              const [gRows] = await db.execute(
                `SELECT goal_type, target_weight_kg, pace, focus, activity_level,
                        height_cm, weight_kg, bmi, dob, sex,
                        sleep_hours, sleep_quality, stress_level, exercise_freq, recovery_level,
                        daily_kcal, protein_g, carbs_g, fat_g, status, created_at
                 FROM fitness_goals WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`,
                [userId]
              );
              if (gRows.length) {
                const g = gRows[0];
                onboarding = {
                  goalType: g.goal_type,
                  targetWeightKg: g.target_weight_kg != null ? Number(g.target_weight_kg) : null,
                  pace: g.pace,
                  focus: g.focus,
                  activityLevel: g.activity_level,
                  heightCm: g.height_cm != null ? Number(g.height_cm) : null,
                  weightKg: g.weight_kg != null ? Number(g.weight_kg) : null,
                  bmi: g.bmi != null ? Number(g.bmi) : null,
                  dob: g.dob,
                  sex: g.sex,
                  sleepHours: g.sleep_hours != null ? Number(g.sleep_hours) : null,
                  sleepQuality: g.sleep_quality,
                  stressLevel: g.stress_level,
                  exerciseFreq: g.exercise_freq,
                  recoveryLevel: g.recovery_level,
                  dailyKcal: g.daily_kcal != null ? Number(g.daily_kcal) : null,
                  proteinG: g.protein_g != null ? Number(g.protein_g) : null,
                  carbsG: g.carbs_g != null ? Number(g.carbs_g) : null,
                  fatG: g.fat_g != null ? Number(g.fat_g) : null,
                  status: g.status,
                  createdAt: g.created_at,
                };
              }
            } catch (_) { /* onboarding optional */ }

            res.json({ ...rows[0], onboarding });
    
        } catch (err) {
            console.error('profile fetch error:', err.message);
            next(err);
        }
  }catch(e){ next(e); }
}

module.exports = { putupdate, getUserId };
