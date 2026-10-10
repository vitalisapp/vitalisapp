// AI config barrel — thin re-export over src/config/ai/* modules.
//
// Split from a 926-line single file (Batch 11) with zero behavior change:
// every export name, shape, and default is preserved so the four consumers
// (ai/bmi/coach/foodLogs controllers) keep requiring '../config/gemini'
// untouched. New code should import the focused module directly.
const { getGenAI, getGroq, aiConfigured } = require('./ai/providers');
const { getTextModels, getVisionModels } = require('./ai/models');
const {
  AI_TEXT_TIMEOUT_MS,
  AI_VISION_TIMEOUT_MS,
  withTimeout,
  isRetryableError,
  backoffSleep,
} = require('./ai/retry');
const { callGeminiWithFallback } = require('./ai/textFallback');
const {
  isMeatyFood,
  isMainDish,
  parseServingQuantity,
  anchorExpected,
  validateAndCorrectMacros,
} = require('./ai/nutrition');
const {
  normalizeItems,
  parseNutritionJSON,
  stripDataUriPrefix,
  safeParseAI,
} = require('./ai/parsers');
const { analyzeFoodImage, suggestPlanForMeal } = require('./ai/vision');

module.exports = {
  AI_TEXT_TIMEOUT_MS,
  AI_VISION_TIMEOUT_MS,
  withTimeout,
  get genAI() {
    return getGenAI();
  },
  get groq() {
    return getGroq();
  },
  aiConfigured,
  getTextModels,
  getVisionModels,
  stripDataUriPrefix,
  callGeminiWithFallback,
  analyzeFoodImage,
  normalizeItems,
  validateAndCorrectMacros,
  parseNutritionJSON,
  anchorExpected,
  parseServingQuantity,
  isMeatyFood,
  isMainDish,
  isRetryableError,
  backoffSleep,
  suggestPlanForMeal,
  safeParseAI,
};
