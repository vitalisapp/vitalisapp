// Model IDs rotatable via env. 2.0/1.5/2.5-flash are retired (404);
// 3.6-flash verified working, Groq is the final fallback.
function getTextModels() {
  const fromEnv = String(process.env.GEMINI_TEXT_MODELS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;
  return ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash'];
}

function getVisionModels() {
  const fromEnv = String(process.env.GEMINI_VISION_MODELS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;
  return ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash'];
}

module.exports = { getTextModels, getVisionModels };
