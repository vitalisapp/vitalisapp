// Post-run AI analysis (trend-aware motivational coaching + notification).
const db = require('../config/db');
const log = require('../utils/logger');
const { callGeminiWithFallback, safeParseAI } = require('../config/gemini');

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
                log.error('Notification insert failed:', notifErr.message);
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
            log.error('Run Analysis Error:', err?.message);
            next(err);
        }
  }catch(e){ next(e); }
}

module.exports = { postaiRunAnalysis };
