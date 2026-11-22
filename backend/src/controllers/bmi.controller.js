// BMI — thin controller. Logic + DB live in services/bmi.service.js.
const bmiService = require('../services/bmi.service');
const { MIN_AGE, MAX_AGE } = require('../utils/age');

const VALID_GENDERS = ['male', 'female', 'other'];

// Save BMI and return AI suggestion
async function postUserId(req,res,next){
  try{
        const userId = Number(req.params.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
          return res.status(400).json({ error: 'Invalid user id' });
        }
        const { weight_kg, height_cm, age, gender } = req.body || {};
    
        const w = Number(weight_kg);
        const h = Number(height_cm);
        if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
            return res.status(400).json({ error: 'Please enter your weight (kg) and height (cm) as numbers.' });
        }
        if (h < 50 || h > 300) return res.status(400).json({ error: 'Height must be between 50 and 300 cm. Check that you entered centimetres, not feet or metres.' });
        if (w < 10 || w > 1000) return res.status(400).json({ error: 'Weight must be between 10 and 1000 kg. Check that you entered kilograms, not pounds.' });
    
        const bmi = bmiService.computeBmi(w, h);
        if (!Number.isFinite(bmi)) return res.status(400).json({ error: 'We could not calculate a BMI from those values. Please check your height and weight.' });

        const ageNum = age == null || age === '' ? null : Number(age);
        if (ageNum !== null && !Number.isInteger(ageNum)) {
          return res.status(400).json({ error: 'Please enter your age as a whole number of years.' });
        }
        if (ageNum !== null && ageNum < MIN_AGE) {
          return res.status(400).json({
            error: `Vitalis is for users aged ${MIN_AGE} and up, because its calorie targets and workout plans are designed for teens and adults. If you entered the wrong age, please correct it.`,
            code: 'AGE_TOO_YOUNG',
          });
        }
        if (ageNum !== null && ageNum > MAX_AGE) {
          return res.status(400).json({ error: `An age of ${ageNum} looks like a typo. Please check it.`, code: 'AGE_TOO_OLD' });
        }
        const genderNorm = gender == null || gender === '' ? null
          : String(gender).trim().toLowerCase();
        if (genderNorm !== null && !VALID_GENDERS.includes(genderNorm)) {
          return res.status(400).json({ error: 'Please choose Male, Female or Other for sex.' });
        }
    
        try {
            const saved = await bmiService.saveBmi(userId, {
              weight: w, height: h, bmi, age: ageNum, gender: genderNorm,
            });

            if (process.env.NODE_ENV !== 'production') console.log(`[BMI] Saved — userId:${userId} bmi:${saved.bmi} category:${saved.category}`);
            res.status(200).json({ message: 'BMI saved', id: saved.id, bmi: saved.bmi, category: saved.category, aiSuggestion: saved.aiSuggestion, degraded: saved.degraded });

        } catch (err) {
            console.error('[BMI] Insert Error:', err.message);
            next(err);
        }
  }catch(e){ next(e); }
}

async function getUserId(req,res,next){
  try{
        const userId = Number(req.params.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
          return res.status(400).json({ error: 'Invalid user id' });
        }
        const limit  = Math.min(Math.max(parseInt(req.query.limit, 10)  || 10, 1), 100);
        const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    
        try {
            const data = await bmiService.listRecords(userId, limit, offset);
            res.json(data);
        } catch (err) {
            console.error('[BMI] Fetch Error:', err.message);
            next(err);
        }
  }catch(e){ next(e); }
}

// GET /api/bmi/:userId/yearly
async function getYearly(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    res.json(await bmiService.yearlySummary(userId));
  } catch (e) { next(e); }
}

module.exports = { postUserId, getUserId, getYearly };
