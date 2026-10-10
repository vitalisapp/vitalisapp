// Vision providers: food-image analysis + meal plan suggestion.
const { FOOD_ANALYSIS_PROMPT } = require('../../constants/foodAnalysisPrompt');
const { getGenAI } = require('./providers');
const { getVisionModels } = require('./models');
const { AI_VISION_TIMEOUT_MS, withTimeout, isRetryableError, backoffSleep } = require('./retry');
const { normalizeItems, emptyItemsFallback } = require('./parsers');
const { callGeminiWithFallback } = require('./textFallback');
const { devLog, devWarn, devError } = require('./log');

async function analyzeWithGeminiVision(base64Data, mimeType, modelName) {
  devLog(`[VITALIS IMAGE] Trying ${modelName}...`);
  const model = getGenAI().getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0, maxOutputTokens: 1500 },
  });

  const result = await withTimeout(model.generateContent([
    FOOD_ANALYSIS_PROMPT,
    { inlineData: { data: base64Data, mimeType } },
  ]), AI_VISION_TIMEOUT_MS, modelName);

  const text = result.response.text();
  if (!text) {
    try {
      const reason = result?.response?.candidates?.[0]?.finishReason
        || result?.response?.promptFeedback?.blockReason;
      if (reason) devWarn(`[VITALIS IMAGE] ${modelName} empty (finishReason=${reason})`);
    } catch { /* best effort */ }
    throw new Error(`${modelName} returned empty response`);
  }
  devLog(`[VITALIS IMAGE] ${modelName} raw:`, String(text).slice(0, 200));
  return text;
}

// MAIN EXPORT
async function analyzeFoodImage(base64Data, mimeType = 'image/jpeg') {
  // Normalize: callers may send a full data-URI or raw base64. Strip prefix
  // so vision payloads and cache keys are stable either way.
  const cleanBase64 = String(base64Data || '').includes(',')
    ? String(base64Data).split(',').pop()
    : String(base64Data || '');
  const models = getVisionModels();
  let seenRetryable = false;
  let seenOther = false;

  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    try {
      const raw = await analyzeWithGeminiVision(
        cleanBase64,
        mimeType,
        modelName,
      );
      const result = normalizeItems(raw);

      if (!result || !result.items || result.items.length === 0) {
        devWarn('[VITALIS IMAGE] Parse failed or absurd result rejected — trying next provider');
        seenOther = true;
        continue;
      }

      devLog(
        '[VITALIS IMAGE] ✅ Final result:',
        JSON.stringify(result).slice(0, 300),
      );
      return JSON.stringify(result);
    } catch (err) {
      if (isRetryableError(err)) {
        devWarn(`[VITALIS IMAGE] ↻ ${modelName} busy — trying next provider…`);
        seenRetryable = true;
      } else {
        devError('[VITALIS IMAGE] ❌ Provider failed:', err.message);
        seenOther = true;
      }
      await backoffSleep(i, err);
    }
  }

  devError('[VITALIS IMAGE] All vision providers failed — returning fallback');
  // Overload-only failure (all 503/429): tell the client to retry instead of
  // the generic "clearer photo" hint. Shape unchanged (items + suggestion)
  // plus a retryable flag, so existing UI keeps working.
  if (seenRetryable && !seenOther) {
    const fb = emptyItemsFallback('AI is busy right now (high demand). Please wait a moment and try again.');
    fb.retryable = true;
    return JSON.stringify(fb);
  }
  return JSON.stringify(emptyItemsFallback());
}

// SECTION 3 — PLAN SUGGESTION

function buildSuggestPlanPrompt(meal, plans, dailyContext) {
  const plansForPrompt = plans.map((p) => ({
    id: p.id,
    title: p.title,
    tag: p.tag,
    intensity: p.intensity,
    target_focus: p.target_focus,
    duration: p.duration,
    description: p.description,
    is_enrolled: p.is_enrolled === 1,
  }));

  return `
You are a fitness AI coach inside a nutrition and training app.

The user just logged this meal:
- Food: ${meal.food_name}
- Calories: ${meal.calories} kcal
- Protein: ${meal.protein}g, Carbs: ${meal.carbs}g, Fat: ${meal.fat}g

Daily context:
- Calories logged today (including this meal): ${dailyContext.caloriesSoFar} kcal
- Daily calorie goal: ${dailyContext.calorieGoal} kcal

Available training plans:
${JSON.stringify(plansForPrompt)}

Instructions:
1. Judge whether this meal is light, balanced, or heavy relative to the day.
2. If plans exist, pick the single best plan id. Prefer enrolled plans; only recommend
   a non-enrolled plan if no enrolled plan fits. If plans array is empty, set recommended_plan_id to null.
3. Estimate how many minutes of that plan would help balance this meal. Null if no plan.
4. Write a friendly 1-2 sentence message. Reassuring if balanced/light; practical and motivating if heavy. Never shame the user.
5. One short sentence of reasoning: why this plan fits nutritionally.

Respond with ONLY raw JSON, no markdown:
{
  "message": "string",
  "reasoning": "string",
  "recommended_plan_id": number or null,
  "estimated_minutes": number or null
}
`.trim();
}

async function suggestPlanForMeal(meal, plans, dailyContext) {
  const prompt = buildSuggestPlanPrompt(meal, plans, dailyContext);
  const raw = await callGeminiWithFallback(prompt);
  return raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
}

module.exports = {
  analyzeWithGeminiVision,
  analyzeFoodImage,
  buildSuggestPlanPrompt,
  suggestPlanForMeal,
};
