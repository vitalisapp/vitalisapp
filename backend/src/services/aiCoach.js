// Real-time form-coach endpoint (landmarks → one technical tip).
const log = require('../utils/logger');
const { callGeminiWithFallback } = require('../config/gemini');

async function postaiCoach(req,res,next){
  try{
            const { landmarks, workoutType } = req.body;
            // Whitelist mirrors coach.controller.js WORKOUT_TYPES. Unknown types
            // fall back to 'general' (same as /api/coach) — never 400, so no
            // caller breaks. No frontend calls this endpoint today (useAiCoach
            // uses /api/coach); this only tightens any direct API use.
            const KNOWN_TYPES = ['pushup', 'squat', 'plank', 'lunge', 'bicep_curl', 'overhead', 'crunch', 'situp', 'lateral_raise', 'calfraise', 'calf_raise', 'general'];
            const rawType = (workoutType || 'general').toString().toLowerCase().trim().slice(0, 32);
            const normalized = rawType === 'calf_raise' ? 'calfraise' : rawType;
            const safeType = KNOWN_TYPES.includes(normalized) ? normalized.toUpperCase() : 'GENERAL';
            if (!landmarks || (typeof landmarks !== 'object' && !Array.isArray(landmarks))) {
              return res.status(400).json({ error: 'landmarks are required' });
            }
            try {
                const prompt = `
                    You are a real-time gym coach. Analyze these landmarks for a ${safeType} set.
                    Landmarks: ${JSON.stringify(landmarks).slice(0, 4000)}
                    Give ONE technical tip (max 10 words).
                    - If PUSHUP: focus on "flat back" or "elbow angle".
                    - If SQUAT: focus on "depth" or "weight on heels".
                    - If PLANK: focus on "hips height".
                    Strict Rule: Only reply with the coaching tip text. No conversational filler.
                    `;
                const tip = (await callGeminiWithFallback(prompt)).trim().slice(0, 300);
                res.json({ tip });
            } catch (error) {
                // Message only: full error can embed landmark arrays.
                log.error("Coach Error:", error?.message);
                next(error);
        }
  }catch(e){ next(e); }
}

module.exports = { postaiCoach };
