// Text fallback chain: configured Gemini models in order, then Groq,
// then a static fallback string (never throws on outage).
const { getGenAI, getGroq, aiConfigured } = require('./providers');
const { getTextModels } = require('./models');
const { AI_TEXT_TIMEOUT_MS, withTimeout, isRetryableError, backoffSleep } = require('./retry');
const { devLog, devWarn, devError } = require('./log');

async function callGeminiWithFallback(prompt) {
  // Fail fast when no keys are configured — same static fallback as before,
  // but without burning 25s x N timeouts first.
  if (!aiConfigured()) {
    devWarn('[VITALIS AI] No GEMINI_API_KEY/GROQ_API_KEY — static fallback');
    return "I'm currently experiencing high demand. Please try again in a moment.";
  }
  const models = getTextModels();

  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    try {
      devLog(`[VITALIS AI] Trying ${modelName}...`);
      const model = getGenAI().getGenerativeModel({ model: modelName });
      const result = await withTimeout(model.generateContent(prompt), AI_TEXT_TIMEOUT_MS, modelName);
      const text = result.response.text();
      if (text) {
        devLog(`[VITALIS AI] ✅ Success with ${modelName}`);
        return text;
      }
      // Empty text: distinguish safety-block from capacity failure
      try {
        const reason = result?.response?.candidates?.[0]?.finishReason
          || result?.response?.promptFeedback?.blockReason;
        if (reason) devWarn(`[VITALIS AI] ${modelName} empty text (finishReason=${reason})`);
      } catch { /* candidates shape varies by SDK — best effort only */ }
    } catch (err) {
      // Retryable 503/429 (capacity pressure) is routine during demand spikes
      // and the chain continues — log as warn with next-step, not ❌ error, so
      // consoles don't look crashed when failover is working as designed.
      if (isRetryableError(err)) {
        devWarn(`[VITALIS AI] ↻ ${modelName} busy (${String(err.message).slice(0, 120)}) — trying next model…`);
      } else {
        devError(`[VITALIS AI] ❌ ${modelName} failed:`, err.message);
      }
      await backoffSleep(i, err);
    }
  }

  devWarn('[VITALIS AI] All Gemini text models failed → Groq fallback');
  try {
    const resp = await withTimeout(getGroq().chat.completions.create({
      model: 'openai/gpt-oss-20b',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }), AI_TEXT_TIMEOUT_MS, 'Groq openai/gpt-oss-20b');
    const text = resp.choices[0]?.message?.content;
    if (text) {
      devLog('[VITALIS AI] ✅ Success with Groq openai/gpt-oss-20b');
      return text;
    }
  } catch (groqErr) {
    devError('[VITALIS AI] ❌ Groq fallback failed:', groqErr.message);
  }

  devWarn('[VITALIS AI] All models failed — returning static fallback');
  return "I'm currently experiencing high demand. Please try again in a moment.";
}

module.exports = { callGeminiWithFallback };
