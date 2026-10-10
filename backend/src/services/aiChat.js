// AI chat endpoint (fitness-only assistant with overload fallback).
const log = require('../utils/logger');
const { callGeminiWithFallback } = require('../config/gemini');

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
            log.error("[/api/ai-chat] Fatal:", err.message);
            next(err);
        }
  }catch(e){ next(e); }
}

module.exports = { postaiChat };
