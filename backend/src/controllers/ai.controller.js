
const db = require('../config/db');
const { genAI, callGeminiWithFallback, safeParseAI, withTimeout, AI_VISION_TIMEOUT_MS, getVisionModels, aiConfigured } = require('../config/gemini');
// AI POSE ANALYSIS

async function postanalyzePose(req,res,next){
  try{
        try {
            const { image, metadata } = req.body;
            if (!image || typeof image !== 'string' || !image.includes(',')) {
              return res.status(400).json({ error: 'Valid base64 image (data:mime;base64,...) is required' });
            }
            if (image.length > 10 * 1024 * 1024) {
              return res.status(413).json({ error: 'Image payload too large (max 10MB).' });
            }
            // Cap metadata to bound prompt cost / injection surface
            const safeMetadata = typeof metadata === 'string' ? metadata.slice(0, 5000) : '';
            const base64 = image.split(',')[1];
            if (!base64) return res.status(400).json({ error: 'Could not decode image' });
            const visionModels = typeof getVisionModels === 'function' ? getVisionModels() : ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash"];
            let lastErr = null;
            for (const visionModel of visionModels) {
              try {
                const model = genAI.getGenerativeModel({ model: visionModel });
                const prompt = `
                Context: The user is exercising. 
                Skeletal Data: ${safeMetadata}
                Task: Using the image and the skeletal data, give a 1-sentence coach's correction. 
                If the form is perfect, say something encouraging. 
                Be very concise.
            `;
                const imageParts = [{ inlineData: { data: base64, mimeType: "image/jpeg" } }];
                const result = await withTimeout(
                  model.generateContent([prompt, ...imageParts]),
                  AI_VISION_TIMEOUT_MS,
                  `${visionModel} vision (pose)`
                );
                const suggestion = result.response.text();
                if (suggestion) return res.json({ suggestion });
              } catch (e) {
                lastErr = e;
                if (process.env.NODE_ENV !== 'production') console.warn(`[analyze-pose] ${visionModel} failed:`, e.message);
              }
            }
            // All vision models failed — degrade to text fallback coach tip instead of 500 when possible
            try {
              if (typeof aiConfigured === 'function' && !aiConfigured()) {
                return res.status(503).json({ error: 'AI vision is not configured. Set GEMINI_API_KEY.', code: 'AI_NOT_CONFIGURED' });
              }
              const fallback = await callGeminiWithFallback(
                `You are a concise gym coach. Skeletal context: ${safeMetadata.slice(0, 1000)}. Give a 1-sentence form correction or encouragement.`
              );
              if (fallback && !fallback.toLowerCase().includes('high demand')) {
                return res.json({ suggestion: fallback, degraded: true });
              }
            } catch (_) { /* fall through to error below */ }
            throw lastErr || new Error('All vision providers failed');
        } catch (error) {
            // Message only: full error can serialize the image payload.
            console.error("Gemini Error:", error?.message);
            next(error);
        }
  }catch(e){ next(e); }
}

async function postaiChat(req,res,next){
  try{
        const { message } = req.body;
        if (!message?.trim()) {
            return res.status(400).json({ reply: "Message cannot be empty." });
        }
        if (message.length > 2000) {
            return res.status(400).json({ reply: "Message too long (max 2000 chars)." });
        }
        const systemPrompt = `
            Identity: You are Vitalis AI, a specialized Fitness and Health Assistant.
            Rules: 
            1. ONLY discuss fitness, health, and nutrition.
            2. Answer general greetings (Hi, Hello) and the date briefly.
            3. REJECT any questions about CODING, PROGRAMMING, or MATH.
            4. Keep replies concise (2-4 sentences) unless asked for detail.
            5. Use an encouraging, professional tone like a knowledgeable personal trainer.
            Current Date: ${new Date().toLocaleDateString()}
            User message: "${message}"
        `;
        try {
            const reply = await callGeminiWithFallback(systemPrompt);
            // Never surface the overload fallback as a real coach reply
            if (typeof reply === 'string' && /high demand|currently experiencing|try again later/i.test(reply)) {
              return res.json({ reply: 'Our AI coach is busy right now — try again in a moment.', degraded: true });
            }
            res.json({ reply, degraded: false });
        } catch (err) {
            console.error("[/api/ai-chat] Fatal:", err.message);
            next(err);
        }
  }catch(e){ next(e); }
}

async function postaiClinicalAnalysis(req,res,next){
  try{
        const { stats } = req.body;
        // Identity comes from JWT — never trust a body userId
        const userId = req.user.id;
    
        try {
            const [userRows] = await db.execute(
                'SELECT name, fitness_goal FROM users WHERE id = ? LIMIT 1',
                [userId]
            );
            const user = userRows[0] || { name: 'Athlete', fitness_goal: 'general fitness' };
            const firstName = user.name ? user.name.split(' ')[0] : 'Athlete';
            const [sleepRows] = await db.execute(
                `SELECT sleep_duration, sleep_quality, recovery_score, water_intake_ml, recorded_at
                 FROM sleep_logs 
                 WHERE user_id = ? 
                   AND (sleep_duration > 0 OR sleep_quality > 0 OR water_intake_ml > 0)
                 ORDER BY recorded_at DESC LIMIT 1`,
                [userId]
            );
    
            if (process.env.NODE_ENV !== 'production') {
              console.log(`[VITALIS AI] ── SLEEP DB QUERY RESULT for user ${userId} ──`);
              console.log(`  Rows returned: ${sleepRows.length}`);
              console.log(`  Latest row   :`, sleepRows[0] || '⚠️ NO ROW FOUND IN DB');
            }
    
            const dbSleep = sleepRows[0] || {};
            if (process.env.NODE_ENV !== 'production') console.log(`[VITALIS AI] Stats from frontend:`, stats);
    
            const sleep = {
                sleep_duration:  (stats?.sleep_duration  > 0) ? stats.sleep_duration  : (dbSleep.sleep_duration  || 0),
                sleep_quality:   (stats?.sleep_quality   > 0) ? stats.sleep_quality   : (dbSleep.sleep_quality   || 0),
                water_intake_ml: (stats?.water_intake_ml > 0) ? stats.water_intake_ml : (dbSleep.water_intake_ml || 0),
            };
    
            const activity = {
                calories_burned:       stats?.calories_burned       ?? 0,
                steps:                 stats?.steps                 ?? 0,
                workout_duration_mins: stats?.workout_duration_mins ?? 0,
            };
    
            if (!stats || Object.keys(stats).length === 0) {
                const [activityRows] = await db.execute(
                    'SELECT calories_burned, steps, workout_duration_mins FROM daily_stats WHERE user_id = ? ORDER BY stat_date DESC LIMIT 1',
                    [userId]
                );
                if (activityRows[0]) {
                    activity.calories_burned       = activityRows[0].calories_burned;
                    activity.steps                 = activityRows[0].steps;
                    activity.workout_duration_mins = activityRows[0].workout_duration_mins;
                }
            }
    
            if (process.env.NODE_ENV !== 'production') {
              console.log(`[VITALIS AI] ── FINAL SLEEP OBJECT ──`);
              console.log(`  sleep_duration : ${sleep.sleep_duration}  ${sleep.sleep_duration === 0 ? '⚠️ ZERO' : '✅'}`);
              console.log(`  sleep_quality  : ${sleep.sleep_quality}   ${sleep.sleep_quality  === 0 ? '⚠️ ZERO' : '✅'}`);
              console.log(`  water_intake_ml: ${sleep.water_intake_ml} ${sleep.water_intake_ml === 0 ? '⚠️ ZERO' : '✅'}`);
              console.log(`[VITALIS AI] ── FINAL ACTIVITY OBJECT ──`);
              console.log(`  calories_burned      : ${activity.calories_burned}       ${activity.calories_burned       === 0 ? '⚠️ ZERO' : '✅'}`);
              console.log(`  steps                : ${activity.steps}                 ${activity.steps                 === 0 ? '⚠️ ZERO' : '✅'}`);
              console.log(`  workout_duration_mins: ${activity.workout_duration_mins} ${activity.workout_duration_mins === 0 ? '⚠️ ZERO' : '✅'}`);
            }
    
            // 5. Guard: If sleep data is still all zeros after DB fallback, return early
            if (sleep.sleep_duration === 0 && sleep.sleep_quality === 0 && sleep.water_intake_ml === 0) {
                if (process.env.NODE_ENV !== 'production') console.log(`[VITALIS AI] ⚠️ All sleep values are zero — returning early for user ${userId}`);
                return res.status(200).json({
                    insights: [
                        {
                            id: `sleep-${Date.now()}`,
                            message: `${firstName}, we don't have enough sleep data to generate an accurate analysis yet. Please log your sleep and water intake to unlock personalized insights.`,
                            category: 'Rest Advisory',
                            trend: 'stable'
                        }
                    ],
                    fromCache: false,
                    warning: 'No valid sleep data found for this user.'
                });
            }
    
            const today = new Date().toISOString().slice(0, 10); // e.g. "2025-05-02"
            const signature = `s${sleep.sleep_duration}-q${sleep.sleep_quality}-w${sleep.water_intake_ml}-c${activity.calories_burned}-st${activity.steps}-m${activity.workout_duration_mins}-u${userId}-d${today}`;
    
            if (process.env.NODE_ENV !== 'production') console.log(`[VITALIS AI] Cache signature: ${signature}`);
    
            const [cached] = await db.execute(
                'SELECT sleep_suggestion, activity_suggestion FROM ai_insight_cache WHERE user_id = ? AND data_signature = ? LIMIT 1',
                [userId, signature]
            );
    
            if (cached.length > 0) {
                if (process.env.NODE_ENV !== 'production') console.log(`[VITALIS AI] ✅ Cache HIT for user ${userId}`);
                let sleepCached = null; let activityCached = null;
                try { sleepCached = JSON.parse(cached[0].sleep_suggestion); } catch { sleepCached = { message: cached[0].sleep_suggestion }; }
                try { activityCached = JSON.parse(cached[0].activity_suggestion); } catch { activityCached = { message: cached[0].activity_suggestion }; }
                return res.json({
                    insights: [
                        { id: `sleep-${Date.now()}`,    ...sleepCached },
                        { id: `activity-${Date.now()}`, ...activityCached }
                    ],
                    fromCache: true
                });
            }
    
            if (process.env.NODE_ENV !== 'production') console.log(`[VITALIS AI] Cache MISS for user ${userId} — calling Gemini`);
    
            // 8. Contextual flags
            const waterGlass      = Math.round(sleep.water_intake_ml / 250);
            const sleepStatus     = sleep.sleep_duration >= 7 ? 'adequate' : sleep.sleep_duration >= 5 ? 'below optimal' : 'critically low';
            const qualityStatus   = sleep.sleep_quality  >= 7 ? 'excellent' : sleep.sleep_quality  >= 5 ? 'fair' : 'poor';
            const stepGoalPercent = Math.round((activity.steps / 10000) * 100);
            const calorieStatus   = activity.calories_burned >= 500 ? 'strong' : activity.calories_burned >= 200 ? 'moderate' : 'low';
            const workoutStatus   = activity.workout_duration_mins >= 45 ? 'solid session' : activity.workout_duration_mins >= 20 ? 'light session' : 'minimal activity';
            const hydrationStatus = sleep.water_intake_ml >= 2500 ? 'well-hydrated' : sleep.water_intake_ml >= 1500 ? 'approaching goal' : 'under-hydrated';
            const todayDate       = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
            // Prompt — general fitness coaching only, no diagnosis/treatment language
            const DISCLAIMER = 'General fitness info only — not medical advice. Consult a professional if concerned.';
            const prompt = `
                    You are Vitalis AI Coach, a fitness coaching assistant embedded in a training dashboard.
                    Your job is to give ${firstName} a personalized, specific, and motivating fitness insight — not generic advice.

                    ATHLETE PROFILE:
                    - Name: ${firstName}
                    - Fitness Goal: ${user.fitness_goal || 'general fitness'}
                    - Date: ${todayDate}
    
                    BIOMETRIC DATA:
                    Sleep & Recovery:
                    - Sleep Duration:  ${sleep.sleep_duration} hours (${sleepStatus})
                    - Sleep Quality:   ${sleep.sleep_quality}/10 (${qualityStatus})
                    - Water Intake:    ${sleep.water_intake_ml} ml (~${waterGlass} glasses, ${hydrationStatus})
    
                    Daily Activity:
                    - Calories Burned: ${activity.calories_burned} kcal (${calorieStatus} output)
                    - Steps:           ${activity.steps} steps (${stepGoalPercent}% of 10,000 goal)
                    - Workout:         ${activity.workout_duration_mins} mins (${workoutStatus})
    
                    INSTRUCTIONS:
                    1. Address ${firstName} by name naturally in each message — not robotically.
                    2. Reference their EXACT numbers in the advice (e.g., "your ${sleep.sleep_duration} hours", "those ${activity.steps} steps").
                    3. Each message must be 2–3 sentences. Be specific, supportive, and actionable — never vague. Do not diagnose, treat, or prescribe.
                    4. Choose the trend ("up", "down", "stable") based on whether the metric is improving, declining, or neutral.
                    5. For sleep_suggestion: focus on sleep quality, recovery habits, and hydration relative to their numbers.
                    6. For activity_suggestion: focus on workout output, step count, and calorie burn relative to their goal.
                    7. Tone: supportive fitness coach — warm but data-driven.
                    8. NEVER say "great job" or "keep it up" as opening words. Start with ${firstName}'s name or an observation.
                    9. Do not use clinical/diagnostic language. This is general fitness info only (${DISCLAIMER}).
    
                    RESPONSE FORMAT (strict JSON only, no markdown, no extra text):
                    {
                    "sleep_suggestion": {
                        "message": "...",
                        "category": "Rest Advisory",
                        "trend": "up|down|stable"
                    },
                    "activity_suggestion": {
                        "message": "...",
                        "category": "Performance Tip",
                        "trend": "up|down|stable"
                    }
                    }`.trim();
    
            const raw = await callGeminiWithFallback(prompt);
    
            if (!raw || typeof raw !== 'string') {
                throw new Error("Invalid or empty response from AI Fallback Engine");
            }
    
            const { parsed: aiResult, raw: rawStr } = safeParseAI(raw);
            if (!aiResult?.sleep_suggestion || !aiResult?.activity_suggestion) {
              // AI returned non-JSON fallback string — degrade gracefully, don't 500
              return res.status(200).json({
                insights: [
                  { id: `sleep-${Date.now()}`, message: String(rawStr).slice(0, 500), category: 'Rest Advisory', trend: 'stable' },
                ],
                fromCache: false,
                warning: 'AI returned plain text; showing raw insight.',
              });
            }
    
            // UPDATE CACHE
            if (aiResult?.sleep_suggestion && aiResult?.activity_suggestion) {
                await db.execute(
                    `INSERT INTO ai_insight_cache (user_id, data_signature, sleep_suggestion, activity_suggestion)
                     VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                       sleep_suggestion    = VALUES(sleep_suggestion),
                       activity_suggestion = VALUES(activity_suggestion),
                       created_at          = NOW()`,
                    [userId, signature, JSON.stringify(aiResult.sleep_suggestion), JSON.stringify(aiResult.activity_suggestion)]
                );
            }
    
            res.json({
                insights: [
                    { id: `sleep-${Date.now()}`,    ...aiResult.sleep_suggestion },
                    { id: `activity-${Date.now()}`, ...aiResult.activity_suggestion }
                ],
                fromCache: false
            });
    
            } catch (err) {
                    // Message only: full error can embed sleep/activity rows.
                    console.error("AI Logic Error:", err?.message);
                    next(err);
            }
  }catch(e){ next(e); }
}

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
                console.error("Coach Error:", error?.message);
                next(error);
        }
  }catch(e){ next(e); }
}

async function getaiHistoryUserId(req,res,next){
  try{
                const { userId } = req.params;
                try {
                    const [rows] = await db.execute(
                        `SELECT sleep_suggestion, activity_suggestion, created_at 
                         FROM ai_insight_cache 
                         WHERE user_id = ? 
                         ORDER BY created_at DESC 
                         LIMIT 20`,
                        [userId]
                    );
                 const history = rows.map(row => {
                   let s = {}; let a = {};
                   try { s = JSON.parse(row.sleep_suggestion); } catch { s = { message: row.sleep_suggestion }; }
                   try { a = JSON.parse(row.activity_suggestion); } catch { a = { message: row.activity_suggestion }; }
                   return [
                        { ...s,    id: `sleep-${row.created_at}`,    timestamp: new Date(row.created_at).        toLocaleString() },
                        { ...a, id: `activity-${row.created_at}`, timestamp: new Date(row.created_at).        toLocaleString() },
                   ];
                 }).flat();
                    res.json(history);
                } catch (err) {
                    next(err);
              }
  }catch(e){ next(e); }
}

async function getlogsLatestUserId(req,res,next){
  try{
                    const { userId } = req.params;
                    try {
                        const [latestLog] = await db.execute(
                            `SELECT calories_burned, steps, workout_duration_mins               
                             FROM daily_stats 
                             WHERE user_id = ? 
                             ORDER BY stat_date DESC LIMIT 1`,
                            [userId]
                        );
    
                     const [latestSleep] = await db.execute(
                            `SELECT * FROM sleep_logs 
                             WHERE user_id = ? 
                               AND (sleep_duration > 0 OR sleep_quality > 0 OR water_intake_ml > 0)
                             ORDER BY recorded_at DESC LIMIT 1`,
                            [userId]
                     );
    
            if (process.env.NODE_ENV !== 'production') {
              console.log(`[LATEST LOGS] ── DB RESULTS for user ${userId} ──`);
              console.log(`  latestLog  :`, latestLog[0]  || '⚠️ NO ROW RETURNED');
              console.log(`  latestSleep:`, latestSleep[0] || '⚠️ NO ROW RETURNED');
            }
    
            if (!latestLog.length && !latestSleep.length) {
                return res.status(404).json({ message: "No historical data found for this user." });
            }
    
            res.json({
                stats: {
                    calories_burned:       latestLog[0]?.calories_burned       || 0,
                    steps:                 latestLog[0]?.steps                 || 0,
                    workout_duration_mins: latestLog[0]?.workout_duration_mins || 0,
                    water_intake_ml:       latestSleep[0]?.water_intake_ml     || 0,
                    sleep_duration:        latestSleep[0]?.sleep_duration      || 0,
                    sleep_quality:         latestSleep[0]?.sleep_quality       || 0,
                },
                last_updated: latestLog[0]?.stat_date || latestSleep[0]?.recorded_at
            });
        } catch (error) {
            console.error("Error fetching latest logs:", error?.message);
            next(error);
        }
  }catch(e){ next(e); }
}

async function postaiRunAnalysis(req,res,next){
  try{
                const { run } = req.body;
                const userId = req.user.id;
                // Guard: missing/non-object run used to throw TypeError → 500.
                // Frontend tolerates failure (.catch(()=>null)), but 400 with a
                // clear message is cheaper than a 500 + error-handler noise.
                if (!run || typeof run !== 'object') {
                  return res.status(400).json({ error: 'run object is required (distance, duration, pace, calories).' });
                }
                // Sanitize: clamp absurd values so a bad client can't make the
                // coach praise a 500km / -100kcal run. Valid runs pass through
                // untouched; only out-of-range values are bounded.
                const cleanRun = {
                  distance: Math.min(500, Math.max(0, Number(run.distance) || 0)),
                  duration: String(run.duration || '00:00:00').slice(0, 32),
                  pace: String(run.pace || '--:--').slice(0, 32),
                  calories: Math.min(20000, Math.max(0, Math.round(Number(run.calories) || 0))),
                  splits: Array.isArray(run.splits) ? run.splits.slice(0, 100) : [],
                };
    
            try {
            // Fetch user profile
                const [userRows] = await db.execute(
                    'SELECT name, fitness_goal FROM users WHERE id = ? LIMIT 1',
                 [userId]
            );
                const user = userRows[0] || { name: 'Athlete', fitness_goal: 'general fitness' };
                const firstName = user.name ? user.name.split(' ')[0] : 'Athlete';
    
                // Fetch last 7 runs for trend/predictive analysis
                const [runHistory] = await db.execute(
                `SELECT distance, duration, pace, calories, created_at
                 FROM activity_logs
                 WHERE user_id = ?
                 ORDER BY created_at DESC
                 LIMIT 7`,
                [userId]
            );
    
            const totalRuns     = runHistory.length;
            const avgDistance   = totalRuns > 0 ? (runHistory.reduce((s, r) => s + parseFloat(r.distance || 0), 0) / totalRuns).toFixed(2) : 0;
            const avgCalories   = totalRuns > 0 ? Math.round(runHistory.reduce((s, r) => s + (r.calories || 0), 0) / totalRuns) : 0;
            // Robust trend: avg of last 3 vs previous 3 (not single-point noisy compare).
            // Pace-aware: improving if distance up OR same distance at better pace.
            const parsePaceSec = (p) => {
              const m = String(p || '').match(/(\d+):(\d+)/);
              if (!m) return null;
              const s = Number(m[1]) * 60 + Number(m[2]);
              return Number.isFinite(s) && s > 0 && s < 3600 ? s : null;
            };
            const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
            let isImproving = false;
            let trendDetail = 'not enough history';
            if (totalRuns >= 2) {
              const recent = runHistory.slice(0, 3);
              const prev = runHistory.slice(3, 6);
              const recentDist = avg(recent.map((r) => parseFloat(r.distance || 0)));
              const prevDist = prev.length ? avg(prev.map((r) => parseFloat(r.distance || 0))) : avg(recent.slice(1).map((r) => parseFloat(r.distance || 0)));
              const recentPace = avg(recent.map((r) => parsePaceSec(r.pace)).filter((v) => v != null));
              const prevPace = avg(runHistory.slice(1, 4).map((r) => parsePaceSec(r.pace)).filter((v) => v != null));
              const distUp = recentDist > prevDist * 1.02; // >2% to ignore GPS noise
              const paceBetter = recentPace && prevPace && recentPace < prevPace * 0.98;
              isImproving = Boolean(distUp || paceBetter);
              trendDetail = `recent ${recentDist.toFixed(2)}km vs prev ${prevDist.toFixed(2)}km${recentPace && prevPace ? `, pace ${Math.round(recentPace)}s vs ${Math.round(prevPace)}s` : ''}`;
            }
            const consistency   = totalRuns >= 5 ? 'very consistent' : totalRuns >= 3 ? 'building consistency' : 'just getting started';
    
            const prompt = `
                    You are Vitalis AI, a warm, friendly, and encouraging running coach embedded in a fitness app.
                    Your job is to give ${firstName} a personalized post-run analysis with a friendly tone — like a supportive coach who's genuinely proud              of them.
    
                    RUNNER PROFILE:
                    - Name: ${firstName}
                    - Fitness Goal: ${user.fitness_goal || 'general fitness'}
                    - Consistency Level: ${consistency} (${totalRuns} runs logged)
    
                    THIS RUN:
                    - Distance:  ${cleanRun.distance} km
                    - Duration:  ${cleanRun.duration} (hh:mm:ss)
                    - Pace:      ${cleanRun.pace} /km
                    - Calories:  ${cleanRun.calories} kcal
                    - Splits:    ${cleanRun.splits?.length > 0 ? cleanRun.splits.map(s => `KM ${s.km}: ${s.pace}`).join(', ') : 'No splits recorded'}
    
                    HISTORICAL AVERAGES (last ${totalRuns} runs):
                    - Avg Distance: ${avgDistance} km
                    - Avg Calories: ${avgCalories} kcal
                    - Trend: ${isImproving ? 'improving 📈' : 'steady — encourage consistency'} (${trendDetail})
                    NOTE: This is motivational coaching, not medical or physiological prediction.
    
                    INSTRUCTIONS:
                    1. Start with a warm, genuine reaction to this specific run — reference their exact numbers.
                    2. For summary: 2-3 sentences covering what they did well and one thing to watch.
                    3. For prediction: based on their history and consistency, predict what they could realistically achieve in 30 days if they keep it up.                 Be specific (e.g., "you could hit 5km runs" or "shave 30 seconds off your pace"). Make it exciting but realistic.
                    4. For tip: one specific, actionable tip for their next run based on their pace and splits.
                    5. Tone: warm, friendly, like a coach who genuinely cares — not robotic. Use their name naturally.
                    6. NEVER say "great job" or "keep it up" as opening words.
    
                    RESPONSE FORMAT (strict JSON only, no markdown, no extra text):
                    {
                    "summary": "...",
                    "prediction": "...",
                    "tip": "...",
                    "emoji_verdict": "🔥|💪|⚡|🏃|✨"
                    }`.trim();
    
            const raw = await callGeminiWithFallback(prompt);
    
            if (!raw || typeof raw !== 'string') {
                throw new Error("Invalid response from AI");
            }
    
            const { parsed: aiResult, raw: rawText } = safeParseAI(raw);
            if (!aiResult?.summary) {
              return res.status(200).json({
                firstName,
                summary: String(rawText).slice(0, 600),
                prediction: 'Keep logging runs to unlock predictions.',
                tip: 'Focus on steady pacing for your next run.',
                emoji_verdict: '🏃',
                stats: {
                    distance:  cleanRun.distance,
                    duration:  cleanRun.duration,
                    pace:      cleanRun.pace,
                    calories:  cleanRun.calories,
                },
                warning: 'AI returned plain text.',
              });
            }
    
            // Send notification
            try {
                await db.execute(
                    'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
                    [
                        userId,
                        `${aiResult.emoji_verdict} Run Analysis: ${aiResult.summary}`,
                        'info'
                    ]
                );
            } catch (notifErr) {
                console.error('Notification insert failed:', notifErr.message);
            }
    
            res.json({
                firstName,
                summary:       aiResult.summary,
                prediction:    aiResult.prediction,
                tip:           aiResult.tip,
                emoji_verdict: aiResult.emoji_verdict,
                stats: {
                    distance:  cleanRun.distance,
                    duration:  cleanRun.duration,
                    pace:      cleanRun.pace,
                    calories:  cleanRun.calories,
                }
            });
    
        } catch (err) {
            console.error('Run Analysis Error:', err?.message);
            next(err);
        }
  }catch(e){ next(e); }
}

module.exports = { postanalyzePose, postaiChat, postaiClinicalAnalysis, postaiCoach, getaiHistoryUserId, getlogsLatestUserId, postaiRunAnalysis };
