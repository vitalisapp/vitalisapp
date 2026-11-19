const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const { OpenRouter } = require("@openrouter/sdk");

function devLog(...args) {
  if (process.env.NODE_ENV !== "production") console.log(...args);
}
function devWarn(...args) {
  if (process.env.NODE_ENV !== "production") console.warn(...args);
}
function devError(...args) {
  console.error(...args);
}

let _genAI = null;
let _groq = null;
let _openRouter = null;
function getGenAI() {
  if (!_genAI)
    _genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || "missing-key",
    );
  return _genAI;
}
function getGroq() {
  if (!_groq)
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "missing-key" });
  return _groq;
}
function getOpenRouter() {
  if (!_openRouter)
    _openRouter = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY || "missing-key",
    });
  return _openRouter;
}
function aiConfigured() {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.OPENROUTER_API_KEY,
  );
}

function envList(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Model IDs rotatable via env.
// Verified live (Nov 2026) with the project key: 3.6/3.7/3.8-flash answer
// 503 or hang past the timeout, and 3.5-flash hung >200s. The flash-lite
// family answers correctly in 2–4s, so it leads every default chain.
const DEFAULT_GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
];

function getTextModels() {
  const fromEnv = envList(process.env.GEMINI_TEXT_MODELS);
  if (fromEnv.length) return fromEnv;
  return [...DEFAULT_GEMINI_MODELS];
}

function getVisionModels() {
  const fromEnv = envList(process.env.GEMINI_VISION_MODELS);
  if (fromEnv.length) return fromEnv;
  return [...DEFAULT_GEMINI_MODELS];
}

// Independent Groq vision leg — catches Gemini-wide outages/overload.
// qwen/qwen3.8-27b is Groq's documented vision model (image_url + JSON mode).
// Groq's free tier caps input at 7,000 tokens/minute, so this leg uses the
// compact prompt (the full anchor list alone is ~4.3k tokens).
function getGroqVisionModels() {
  const fromEnv = envList(process.env.GROQ_VISION_MODELS);
  if (fromEnv.length) return fromEnv;
  return ["qwen/qwen3.8-27b"];
}

function getGroqTextModel() {
  return String(process.env.GROQ_TEXT_MODEL || "openai/gpt-oss-20b").trim();
}

// Final leg: OpenRouter free vision models (verified in the live catalog:
// image input, $0 prompt/completion, 1M context). Env-overridable; the first
// usable one wins. Never a paid model unless the operator explicitly sets it.
function getOpenRouterVisionModels() {
  const fromEnv = envList(
    process.env.OPENROUTER_VISION_MODELS ||
      process.env.OPENROUTER_VISION_MODEL,
  );
  if (fromEnv.length) return fromEnv;
  return [
    "inclusionai/ling-3.2-flash:free",
    "nvidia/nemotron-3.5-super-vl:free",
  ];
}

function getOpenRouterTextModels() {
  const fromEnv = envList(
    process.env.OPENROUTER_TEXT_MODELS || process.env.OPENROUTER_TEXT_MODEL,
  );
  if (fromEnv.length) return fromEnv;
  return [
    "inclusionai/ling-3.2-flash:free",
    "google/gemma-4-31b-it:free",
  ];
}

// Exponential backoff with jitter for 503/429; fixed 1s for the rest.
function isRetryableError(err) {
  const msg = String((err && err.message) || err || "").toLowerCase();
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("high demand") ||
    msg.includes("overloaded") ||
    msg.includes("try again later") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource exhausted")
  );
}

// Groq free tier returns 413 with "input tokens per minute" — the provider is
// healthy, the prompt simply does not fit. Move to the next provider instead
// of retrying the same oversized request.
function isTokenLimitError(err) {
  const msg = String((err && err.message) || err || "").toLowerCase();
  return (
    msg.includes("413") ||
    msg.includes("request too large") ||
    msg.includes("tokens per minute") ||
    msg.includes("itpm") ||
    msg.includes("context length")
  );
}

function isAuthError(err) {
  const msg = String((err && err.message) || err || "").toLowerCase();
  return (
    msg.includes("401") ||
    msg.includes("403") ||
    msg.includes("unauthorized") ||
    msg.includes("api key not valid") ||
    msg.includes("invalid api key") ||
    msg.includes("user not found") ||
    msg.includes("no auth credentials")
  );
}

function backoffSleep(attempt, err) {
  const base = isRetryableError(err) ? 2000 * Math.pow(2, attempt) : 1000;
  const capped = Math.min(base, 15000);
  const jitter = Math.floor(Math.random() * 500);
  return new Promise((r) => setTimeout(r, capped + jitter));
}

// Healthy flash-lite models answer in 2–9s; 15s caps a hung provider without
// burning the whole client window on one dead model.
const AI_TEXT_TIMEOUT_MS = Number.parseInt(process.env.AI_TEXT_TIMEOUT_MS || "15000", 10) || 15000;
const AI_VISION_TIMEOUT_MS = Number.parseInt(process.env.AI_VISION_TIMEOUT_MS || "15000", 10) || 15000;
// Groq vision is a plain chat.completions call (no thinking budget) — fast.
const AI_GROQ_VISION_TIMEOUT_MS = Number.parseInt(process.env.AI_GROQ_VISION_TIMEOUT_MS || "15000", 10) || 15000;
const AI_OPENROUTER_TIMEOUT_MS = Number.parseInt(process.env.AI_OPENROUTER_TIMEOUT_MS || "20000", 10) || 20000;

// SDKs expose no AbortSignal: race caps a hung provider so it fails over
// instead of parking the request (and its 10MB body) forever.

function withTimeout(promise, ms, label) {
  let t;
  const timeout = new Promise((_, rej) => {
    t = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(t));
}

// Single OpenRouter call used by both the text and vision chains. The key
// never leaves the backend; images ride as data URIs, never third-party storage.
async function callOpenRouter({
  model,
  prompt,
  base64Data = null,
  mimeType = "image/jpeg",
  timeoutMs = AI_OPENROUTER_TIMEOUT_MS,
  maxTokens = 2048,
  json = false,
}) {
  const content = [{ type: "text", text: prompt }];
  if (base64Data) {
    content.push({
      type: "image_url",
      imageUrl: { url: `data:${mimeType};base64,${base64Data}` },
    });
  }
  const res = await withTimeout(
    getOpenRouter().chat.send({
      appTitle: "Vitalis",
      chatRequest: {
        model,
        messages: [{ role: "user", content }],
        temperature: 0,
        maxTokens,
        ...(json ? { responseFormat: { type: "json_object" } } : {}),
      },
    }),
    timeoutMs,
    `OpenRouter ${model}`,
  );
  const raw = res?.choices?.[0]?.message?.content;
  const text = typeof raw === "string"
    ? raw
    : Array.isArray(raw)
      ? raw.map((part) => (typeof part?.text === "string" ? part.text : "")).join("")
      : "";
  if (!text) throw new Error(`OpenRouter ${model} returned empty response`);
  return text;
}

// Ordered chain for every non-vision AI feature: Gemini → Groq → OpenRouter.
async function callGeminiWithFallback(prompt) {
  // Fail fast when no keys are configured — same static fallback as before,
  // but without burning 15s x N timeouts first.
  if (!aiConfigured()) {
    devWarn("[VITALIS AI] No AI keys configured — static fallback");
    return "I'm currently experiencing high demand. Please try again in a moment.";
  }

  if (process.env.GEMINI_API_KEY) {
    for (const modelName of getTextModels()) {
      try {
        devLog(`[VITALIS AI] Trying ${modelName}...`);
        const model = getGenAI().getGenerativeModel({ model: modelName });
        const result = await withTimeout(model.generateContent(prompt), AI_TEXT_TIMEOUT_MS, modelName);
        const text = result.response.text();
        if (text) {
          devLog(`[VITALIS AI] ✅ Success with ${modelName}`);
          return text;
        }
        try {
          const reason = result?.response?.candidates?.[0]?.finishReason
            || result?.response?.promptFeedback?.blockReason;
          if (reason) devWarn(`[VITALIS AI] ${modelName} empty text (finishReason=${reason})`);
        } catch { /* candidates shape varies by SDK — best effort only */ }
      } catch (err) {
        // A different model is not rate-limited by the previous one's 503, so
        // move on immediately; long backoff only delays the user for no gain.
        if (isRetryableError(err)) {
          devWarn(`[VITALIS AI] ↻ ${modelName} busy (${String(err.message).slice(0, 120)}) — trying next model…`);
        } else {
          devWarn(`[VITALIS AI] ✕ ${modelName} failed: ${String(err.message).slice(0, 160)}`);
        }
      }
    }
  }

  if (process.env.GROQ_API_KEY) {
    const groqModel = getGroqTextModel();
    try {
      const resp = await withTimeout(getGroq().chat.completions.create({
        model: groqModel,
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      }), AI_TEXT_TIMEOUT_MS, `Groq ${groqModel}`);
      const text = resp.choices[0]?.message?.content;
      if (text) {
        devLog(`[VITALIS AI] ✅ Success with Groq ${groqModel}`);
        return text;
      }
    } catch (groqErr) {
      devWarn("[VITALIS AI] ✕ Groq text leg failed:", String(groqErr.message).slice(0, 160));
    }
  }

  if (process.env.OPENROUTER_API_KEY) {
    for (const model of getOpenRouterTextModels()) {
      try {
        const text = await callOpenRouter({
          model,
          prompt,
          timeoutMs: AI_OPENROUTER_TIMEOUT_MS,
          maxTokens: 2048,
        });
        if (text) {
          devLog(`[VITALIS AI] ✅ Success with OpenRouter ${model}`);
          return text;
        }
      } catch (orErr) {
        devWarn(`[VITALIS AI] ✕ OpenRouter ${model} failed: ${String(orErr.message).slice(0, 160)}`);
      }
    }
  }

  devWarn("[VITALIS AI] All text providers failed — returning static fallback");
  return "I'm currently experiencing high demand. Please try again in a moment.";
}

// SECTION 2 — FOOD IMAGE ANALYSIS (vision)

// Prompt extracted to constants/foodAnalysisPrompt.js (clean separation).
// The compact variant exists because Groq's free tier caps input at 7k tokens.
const {
  FOOD_ANALYSIS_PROMPT,
  FOOD_ANALYSIS_PROMPT_COMPACT,
} = require("../constants/foodAnalysisPrompt");

// ─── FOOD CATEGORY DETECTION ──────────────────────────────────────────────────

const BREADED_FOOD_KEYWORDS = [
  "fried",
  "breaded",
  "battered",
  "crispy",
  "nugget",
  "tempura",
  "katsu",
  "schnitzel",
  "fish and chips",
  "popcorn chicken",
  "tender",
  "wing",
  "drumstick",
  "karaage",
  "panko",
  "chicken piece",
  "chickenjoy",
  "kwek",
  "fish ball",
  "kikiam",
  "calamares",
];

const ZERO_CARB_ALLOWED = [
  "grilled chicken breast",
  "plain grilled",
  "boiled egg",
  "hard boiled",
  "steamed fish",
  "grilled fish",
  "tuna steak",
  "salmon fillet",
  "beef steak",
  "pork chop grilled",
  "shrimp grilled",
  "bacon",
];

const ZERO_FAT_ALLOWED = [
  "steamed white rice",
  "plain rice",
  "fruit",
  "watermelon",
  "banana",
  "apple",
  "mango",
  "papaya",
  "grapes",
  "black coffee",
];

// Meaty / high-protein foods must never come back with 0g protein.
// Used for the protein floor + absurd-result reject below.
const MEATY_FOOD_KEYWORDS = [
  "burger",
  "cheeseburger",
  "chicken",
  "beef",
  "pork",
  "bacon",
  "steak",
  "meat",
  "fish",
  "tuna",
  "salmon",
  "shrimp",
  "egg",
  "hotdog",
  "hot dog",
  "sausage",
  "ham",
  "turkey",
  "duck",
  "crab",
  "lobster",
  "squid",
  "octopus",
  "mussel",
  "clam",
  "oyster",
  "scallop",
  "tofu",
  "tempeh",
  "seitan",
  "cheese",
  "yogurt",
  "kebab",
  "shawarma",
  "meatball",
  "patty",
  "fillet",
  "drumstick",
  "wing",
  "thigh",
  "breast",
  "lechon",
  "adobo",
  "sisig",
  "tapa",
  "tocino",
  "longganisa",
];

// Main-dish keywords for the absurd-low-calorie reject. A full meal
// photographed as the subject can never plausibly be < 120 kcal.
const MAIN_DISH_KEYWORDS = [
  "burger",
  "cheeseburger",
  "pizza",
  "pasta",
  "spaghetti",
  "rice",
  "chicken",
  "beef",
  "pork",
  "fish",
  "sandwich",
  "noodle",
  "pancit",
  "ramen",
  "steak",
  "chop",
  "fillet",
  "platter",
  "meal",
  "combo",
  "bucket",
  "spaghetti",
  "fries",
  "lasagna",
  "burrito",
  "taco",
  "kebab",
  "curry",
  "stew",
  "soup",
  "salmon",
  "tuna",
  "shrimp",
];

function isMeatyFood(foodName = "") {
  const lower = foodName.toLowerCase();
  return MEATY_FOOD_KEYWORDS.some((kw) => lower.includes(kw));
}

function isMainDish(foodName = "") {
  const lower = foodName.toLowerCase();
  return MAIN_DISH_KEYWORDS.some((kw) => lower.includes(kw));
}

function isBreadedFood(foodName = "") {
  const lower = foodName.toLowerCase();
  return BREADED_FOOD_KEYWORDS.some((kw) => lower.includes(kw));
}

function isZeroCarbAllowed(foodName = "") {
  const lower = foodName.toLowerCase();
  return ZERO_CARB_ALLOWED.some((kw) => lower.includes(kw));
}

function isZeroFatAllowed(foodName = "") {
  const lower = foodName.toLowerCase();
  return ZERO_FAT_ALLOWED.some((kw) => lower.includes(kw));
}

function extractPieceCount(foodName = "") {
  const match = foodName.match(/\(?\b(\d+)\s*p(?:cs|ieces?|c)?\b\)?/i);
  return match ? parseInt(match[1]) : null;
}

// ─── ANCHOR DB (canonical per-serving values, mirrors foodAnalysisPrompt) ────
// References flag unusual estimates only. They must not replace the visible
// portion with a generic serving or force retries toward larger estimates.
const ANCHOR_DB = [
  { keys: ["double cheeseburger", "double burger", "double patty burger"], unit: "pc", qty: 1, calories: 750, protein: 44, carbs: 44, fat: 40 },
  { keys: ["cheeseburger", "burger"], unit: "pc", qty: 1, calories: 550, protein: 30, carbs: 40, fat: 30 },
  { keys: ["chickenjoy", "fried chicken"], unit: "pc", qty: 1, calories: 310, protein: 22, carbs: 16, fat: 18 },
  { keys: ["steamed white rice", "steamed rice", "plain rice", "cooked rice"], unit: "cup", qty: 1, calories: 206, protein: 4, carbs: 45, fat: 0 },
  { keys: ["fried rice", "garlic fried rice", "sinangag"], unit: "cup", qty: 1, calories: 295, protein: 6, carbs: 43, fat: 10 },
  { keys: ["jolly spaghetti", "filipino spaghetti", "sweet spaghetti"], unit: "serving", qty: 1, calories: 440, protein: 14, carbs: 62, fat: 14 },
  { keys: ["carbonara"], unit: "serving", qty: 1, calories: 520, protein: 18, carbs: 52, fat: 26 },
  { keys: ["pancit canton"], unit: "serving", qty: 1, calories: 320, protein: 12, carbs: 48, fat: 8 },
  { keys: ["pancit bihon"], unit: "serving", qty: 1, calories: 280, protein: 10, carbs: 44, fat: 6 },
  { keys: ["pizza"], unit: "slice", qty: 1, calories: 270, protein: 11, carbs: 35, fat: 9 },
  { keys: ["fries", "french fries"], unit: "serving", qty: 1, calories: 365, protein: 4, carbs: 48, fat: 17 },
  { keys: ["chicken adobo"], unit: "serving", qty: 1, calories: 320, protein: 28, carbs: 8, fat: 18 },
  { keys: ["sinigang"], unit: "bowl", qty: 1, calories: 225, protein: 20, carbs: 11, fat: 10 },
  { keys: ["sisig"], unit: "serving", qty: 1, calories: 480, protein: 28, carbs: 10, fat: 36 },
  { keys: ["lechon kawali"], unit: "serving", qty: 1, calories: 480, protein: 22, carbs: 8, fat: 40 },
  { keys: ["crispy pata"], unit: "serving", qty: 1, calories: 650, protein: 38, carbs: 10, fat: 50 },
  { keys: ["tocino"], unit: "serving", qty: 1, calories: 220, protein: 14, carbs: 14, fat: 12 },
  { keys: ["longganisa"], unit: "serving", qty: 1, calories: 240, protein: 10, carbs: 10, fat: 18 },
  { keys: ["tapa"], unit: "serving", qty: 1, calories: 200, protein: 20, carbs: 4, fat: 12 },
  { keys: ["grilled chicken breast"], unit: "pc", qty: 1, calories: 330, protein: 62, carbs: 0, fat: 7 },
  { keys: ["boiled egg", "hard boiled egg", "hard-boiled egg"], unit: "pc", qty: 1, calories: 78, protein: 6, carbs: 1, fat: 5 },
  { keys: ["scrambled egg"], unit: "serving", qty: 1, calories: 180, protein: 12, carbs: 2, fat: 14 },
  { keys: ["banana"], unit: "pc", qty: 1, calories: 105, protein: 1, carbs: 27, fat: 0 },
  { keys: ["pandesal"], unit: "pc", qty: 1, calories: 150, protein: 4, carbs: 28, fat: 2 },
  { keys: ["peach mango pie"], unit: "pc", qty: 1, calories: 240, protein: 2, carbs: 36, fat: 10 },
  { keys: ["cola", "softdrink", "soft drink", "soda"], unit: "serving", qty: 1, calories: 140, protein: 0, carbs: 36, fat: 0 },
  { keys: ["milk tea", "milktea", "boba"], unit: "serving", qty: 1, calories: 380, protein: 4, carbs: 72, fat: 8 },
  // Indian
  { keys: ["chicken biryani", "biryani"], unit: "serving", qty: 1, calories: 550, protein: 28, carbs: 58, fat: 20 },
  { keys: ["butter chicken", "murgh makhani"], unit: "serving", qty: 1, calories: 480, protein: 30, carbs: 14, fat: 32 },
  { keys: ["masala dosa", "dosa"], unit: "pc", qty: 1, calories: 320, protein: 7, carbs: 55, fat: 8 },
  { keys: ["naan", "garlic naan"], unit: "pc", qty: 1, calories: 260, protein: 7, carbs: 48, fat: 5 },
  // Middle-Eastern
  { keys: ["chicken shawarma", "shawarma"], unit: "serving", qty: 1, calories: 520, protein: 32, carbs: 42, fat: 22 },
  { keys: ["falafel"], unit: "serving", qty: 1, calories: 380, protein: 12, carbs: 36, fat: 20 },
  { keys: ["hummus"], unit: "serving", qty: 1, calories: 280, protein: 8, carbs: 20, fat: 18 },
  // Western / fine-dining
  { keys: ["caesar salad", "chicken caesar"], unit: "serving", qty: 1, calories: 420, protein: 30, carbs: 14, fat: 28 },
  { keys: ["salmon", "grilled salmon"], unit: "serving", qty: 1, calories: 380, protein: 34, carbs: 2, fat: 24 },
  { keys: ["steak", "ribeye", "sirloin"], unit: "serving", qty: 1, calories: 520, protein: 42, carbs: 0, fat: 36 },
  { keys: ["ramen"], unit: "bowl", qty: 1, calories: 550, protein: 24, carbs: 62, fat: 20 },
  { keys: ["pho"], unit: "bowl", qty: 1, calories: 450, protein: 28, carbs: 58, fat: 8 },
];

// Parse "2 pcs" / "0.5 cup" / "250g" / "3 slices" / "1 bowl" from serving text.
function parseServingQuantity(serving = "") {
  const s = String(serving || "").toLowerCase()
    .replace(/(\d)?([½¼¾⅓⅔])/g, (_, whole, fraction) => String((Number(whole) || 0) + ({ '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 })[fraction]))
    .replace(/(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)/g, (_, whole, numerator, denominator) => Number(denominator) > 0 ? String((Number(whole) || 0) + Number(numerator) / Number(denominator)) : 'invalid');
  const m = s.match(/(\d+(?:\.\d+)?)\s*(cups?|pcs?|pieces?|g(?:rams?)?|kg|slices?|bowls?|servings?|plates?|bottles?|cans?|glasses?|sachets?)/);
  if (!m) return null;
  let qty = parseFloat(m[1]);
  let unit = m[2];
  if (unit.startsWith("kg")) { qty *= 1000; unit = "g"; }
  else if (unit.startsWith("cup")) unit = "cup";
  else if (unit.startsWith("pc") || unit.startsWith("piece")) unit = "pc";
  else if (unit.startsWith("slic")) unit = "slice";
  else if (unit.startsWith("bowl")) unit = "bowl";
  else if (unit.startsWith("serv") || unit.startsWith("plate")) unit = "serving";
  else if (unit === "g" || unit.startsWith("gram")) unit = "g";
  else return { qty, unit: "other" };
  return { qty, unit };
}

function anchorExpected(foodName = "", serving = "") {
  const lower = String(foodName || "").toLowerCase();
  const anchor = ANCHOR_DB.find((a) => a.keys.some((k) => lower.includes(k)));
  if (!anchor) return null;
  const parsed = parseServingQuantity(serving);
  // Scale when serving unit matches anchor unit (2 pcs burger = 2x).
  if (parsed && parsed.unit === anchor.unit && parsed.qty > 0 && parsed.qty <= 12) {
    const scale = parsed.qty / anchor.qty;
    return {
      calories: anchor.calories * scale,
      protein: anchor.protein * scale,
      carbs: anchor.carbs * scale,
      fat: anchor.fat * scale,
      scaled: true,
    };
  }
  // Incompatible units (e.g. grams vs pieces) cannot establish portion size.
  return null;
}

// ─── MACRO VALIDATION & CORRECTION ───────────────────────────────────────────

function validateAndCorrectMacros(parsed) {
  let { calories, protein, carbs, fat, food_name = "" } = parsed;
  let saturated_fat = Math.max(0, Number(parsed.saturated_fat ?? 0));
  let trans_fat = Math.max(0, Number(parsed.trans_fat ?? 0));
  let polyunsaturated_fat = Math.max(
    0,
    Number(parsed.polyunsaturated_fat ?? 0),
  );
  let monounsaturated_fat = Math.max(
    0,
    Number(parsed.monounsaturated_fat ?? 0),
  );

  // Clamp negatives
  const nutrient = (value) => Number.isFinite(Number(value)) ? Math.max(0, Math.round(Number(value) * 10) / 10) : 0;
  const hasCalories = calories != null && calories !== "" && Number.isFinite(Number(calories)) && Number(calories) >= 0;
  protein = nutrient(protein);
  carbs = nutrient(carbs);
  fat = nutrient(fat);
  calories = Math.round(nutrient(calories));
  // Clamp fats to 1 decimal
  saturated_fat = Math.round(saturated_fat * 10) / 10;
  trans_fat = Math.round(trans_fat * 10) / 10;
  polyunsaturated_fat = Math.round(polyunsaturated_fat * 10) / 10;
  monounsaturated_fat = Math.round(monounsaturated_fat * 10) / 10;
  const sumFats =
    saturated_fat + trans_fat + polyunsaturated_fat + monounsaturated_fat;
  if (sumFats > fat + 0.5) {
    const scale = fat / Math.max(sumFats, 1);
    saturated_fat = Math.round(saturated_fat * scale * 10) / 10;
    trans_fat = Math.round(trans_fat * scale * 10) / 10;
    polyunsaturated_fat = Math.round(polyunsaturated_fat * scale * 10) / 10;
    monounsaturated_fat = Math.round(monounsaturated_fat * scale * 10) / 10;
  }

  // Missing nutrients are uncertain, not evidence for inventing extra food.
  let low_confidence = Boolean(parsed.low_confidence) ||
    (protein === 0 && isMeatyFood(food_name));

  // Both calories and macros are estimates. A disagreement must not silently
  // replace portion calories with a larger, equally uncertain macro estimate.
  const macroCalories = protein * 4 + carbs * 4 + fat * 9;

  if (!hasCalories) {
    calories = Math.round(macroCalories);
    low_confidence = true;
  } else {
    const diff = Math.abs(macroCalories - calories) / Math.max(calories, 1);
    if (diff > 0.05) {
      low_confidence = true;
    }
  }

  // Shared meals can legitimately exceed 2500 kcal; flag rather than truncate.
  if (calories > 2500) {
    low_confidence = true;
  }

  // Serving is free text from AI — cap length so it fits the DB column
  const serving =
    typeof parsed.serving === "string"
      ? parsed.serving.trim().slice(0, 100)
      : "";

  // Small main-dish estimates need review, but may be legitimate small portions.
  const totalMacros = protein + carbs + fat;
  if (isMainDish(food_name) && calories < 120 && totalMacros < 30) {
    low_confidence = true;
  }

  // Weight plausibility: when the model supplies estimated_weight_g,
  // kcal/g must be physically possible (0.05–9.5 covers lettuce → oil).
  // Outside that band flag uncertainty without inventing a replacement portion.
  const estW = Number(parsed.estimated_weight_g);
  if (estW > 0 && Number.isFinite(estW)) {
    const perGram = calories / estW;
    if (perGram < 0.05 || perGram > 9.5) {
      low_confidence = true;
    }
  }
  // Compare references only for compatible units, without overriding calories.
  const expected = anchorExpected(food_name, serving);
  if (expected && expected.calories > 0) {
    if (calories < expected.calories * 0.4) {
      low_confidence = true;
    }
    if (calories > expected.calories * 2.5) {
      low_confidence = true;
    }
  }

  return {
    ...parsed,
    serving,
    calories,
    protein,
    carbs,
    fat,
    saturated_fat,
    trans_fat,
    polyunsaturated_fat,
    monounsaturated_fat,
    ...(low_confidence ? { low_confidence: true } : {}),
  };
}

// ─── JSON PARSER ──────────────────────────────────────────────────────────────

// Balanced-brace extraction: finds the largest valid JSON object containing
// "items" (or a single food object). Replaces the old non-greedy
// /\{[\s\S]*?\}/ which stopped at the FIRST inner "}" and silently dropped
// every item past the first on multi-item plates.
function extractBalancedJSON(str) {
  let best = null;
  let searchFrom = 0;
  while (true) {
    const start = str.indexOf('{', searchFrom);
    if (start < 0) break;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < str.length; i++) {
      const c = str[i];
      if (inStr) {
        if (esc) esc = false;
        else if (c === '\\') esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          const slice = str.slice(start, i + 1);
          try {
            const obj = JSON.parse(slice);
            if (obj && (Array.isArray(obj.items) || obj.food_name)) {
              // Prefer the parse with the most items.
              const count = Array.isArray(obj.items) ? obj.items.length : 1;
              const bestCount = best && Array.isArray(best.items) ? best.items.length : (best ? 1 : 0);
              if (!best || count > bestCount) best = obj;
            }
          } catch (_) {}
          break;
        }
      }
    }
    searchFrom = start + 1;
  }
  return best;
}

// Last resort: scrape every flat {...} block containing food_name + calories
// (for outputs truncated mid-array where no balanced object parses).
function scrapeItemBlocks(str) {
  const items = [];
  const re = /\{[^{}]*"food_name"[^{}]*\}/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    try {
      const obj = JSON.parse(m[0]);
      if (obj.food_name && obj.calories != null) items.push(obj);
    } catch (_) {}
  }
  return items;
}

function parseNutritionJSON(raw) {
  const clean = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch (_) {}

  const balanced = extractBalancedJSON(clean);
  if (balanced) return balanced;

  const scraped = scrapeItemBlocks(clean);
  if (scraped.length > 0) {
    return { items: scraped.slice(0, 8), suggestion: "" };
  }

  const extract = (key) => {
    const m = clean.match(new RegExp(`"${key}"\\s*:\\s*"?([^",}]+)"?`));
    return m ? m[1].trim() : null;
  };

  const food_name = extract("food_name");
  const calories = extract("calories");
  if (!food_name || !calories) return null;

  return {
    food_name: food_name,
    serving: extract("serving") || "",
    calories: Number(calories) || 0,
    protein: Number(extract("protein")) || 0,
    carbs: Number(extract("carbs")) || 0,
    fat: Number(extract("fat")) || 0,
    saturated_fat: Number(extract("saturated_fat")) || 0,
    trans_fat: Number(extract("trans_fat")) || 0,
    polyunsaturated_fat: Number(extract("polyunsaturated_fat")) || 0,
    monounsaturated_fat: Number(extract("monounsaturated_fat")) || 0,
    suggestion: extract("suggestion") || "",
  };
}

// MULTI-ITEM NORMALIZER
// Provider outcome classification: ok (items), empty (the model explicitly saw
// no food), invalid (unparseable output). Keeping these separate is what lets
// the API say "AI unavailable" instead of pretending the photo had no food.
function isPlaceholderItem(item) {
  return (
    String(item?.food_name || "").trim().toLowerCase() === "unknown food" &&
    Number(item?.calories) === 0
  );
}

function visionOutcome(raw) {
  const parsed = parseNutritionJSON(raw);
  if (!parsed) return { status: "invalid" };

  if (Array.isArray(parsed.items)) {
    const items = parsed.items
      .filter(Boolean)
      .slice(0, 8)
      .map(validateAndCorrectMacros)
      .filter((it) => it && !isPlaceholderItem(it));
    if (items.length === 0) {
      return {
        status: "empty",
        suggestion:
          typeof parsed.suggestion === "string"
            ? parsed.suggestion.slice(0, 200)
            : "",
      };
    }
    return {
      status: "ok",
      result: {
        items,
        suggestion:
          typeof parsed.suggestion === "string"
            ? parsed.suggestion.slice(0, 200)
            : "",
      },
    };
  }

  // Legacy single-object shape → one-item list
  if (parsed.food_name && parsed.calories != null) {
    const item = validateAndCorrectMacros(parsed);
    if (!item || isPlaceholderItem(item)) return { status: "empty", suggestion: "" };
    return {
      status: "ok",
      result: {
        items: [item],
        suggestion: typeof parsed.suggestion === "string" ? parsed.suggestion : "",
      },
    };
  }
  return { status: "invalid" };
}

function normalizeItems(raw) {
  const outcome = visionOutcome(raw);
  return outcome.status === "ok" ? outcome.result : null;
}

// VISION PROVIDERS
// Gemini 3.x are thinking models: hidden reasoning shares the OUTPUT token
// budget, so maxOutputTokens:1500 clipped the JSON mid-stream (diagnosed live:
// response started mid-sentence with no opening brace). Thinking is disabled,
// the budget raised, and a thinkingConfig-incompatible model degrades cleanly.
function visionGenerationConfig(modelName, allowThinkingConfig = true) {
  const config = { temperature: 0, maxOutputTokens: 4096 };
  if (allowThinkingConfig) config.thinkingConfig = { thinkingBudget: 0 };
  return config;
}

// Models that 400-rejected thinkingConfig at least once (degrade without it).
const thinkingRejected = new Set();

async function analyzeWithGeminiVision(base64Data, mimeType, modelName) {
  devLog(`[VITALIS IMAGE] Trying ${modelName}...`);
  const genAI = getGenAI();
  const call = async (allowThinkingConfig) => genAI
    .getGenerativeModel({
      model: modelName,
      generationConfig: visionGenerationConfig(modelName, allowThinkingConfig),
    })
    .generateContent([
      FOOD_ANALYSIS_PROMPT,
      { inlineData: { data: base64Data, mimeType } },
    ]);

  let result;
  try {
    result = await withTimeout(call(true), AI_VISION_TIMEOUT_MS, modelName);
  } catch (err) {
    // Older models reject thinkingConfig with INVALID_ARGUMENT — retry once
    // without it instead of burning the whole provider.
    const msg = String(err?.message || err).toLowerCase();
    // Gemini reports thinkingConfig rejection as a bare
    // "[400 Bad Request] Request contains an invalid argument." with no field
    // name, so treat any 400 as worth one retry without the field.
    if (!thinkingRejected.has(modelName) && (msg.includes("thinking") || msg.includes("invalid_argument") || msg.includes("invalid argument") || msg.includes("400") || msg.includes("unknown field") || msg.includes("unexpected"))) {
      devWarn(`[VITALIS IMAGE] ${modelName} rejected thinkingConfig — retrying without it`);
      thinkingRejected.add(modelName);
      result = await withTimeout(call(false), AI_VISION_TIMEOUT_MS, modelName);
    } else {
      throw err;
    }
  }

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

// Chain-wide budget: Gemini gets the first 40s (three fast models), then the
// Groq and OpenRouter legs split the remaining ~35s. Healthy providers answer
// in 2–4s, so this only matters when a provider is hung or overloaded.
const VISION_TOTAL_BUDGET_MS = Number.parseInt(process.env.AI_VISION_BUDGET_MS || "75000", 10) || 75000;
const VISION_GEMINI_BUDGET_MS = Number.parseInt(process.env.AI_VISION_GEMINI_BUDGET_MS || "40000", 10) || 40000;

// Groq vision fallback: chat.completions with a base64 data-URI image part.
// JSON mode is safe here — the prompt explicitly asks for JSON. Groq's free
// tier caps input at 7k tokens/minute, so the compact prompt is mandatory.
async function analyzeWithGroqVision(base64Data, mimeType, modelName, prompt = FOOD_ANALYSIS_PROMPT_COMPACT) {
  devLog(`[VITALIS IMAGE] Trying Groq ${modelName}...`);
  const completion = await withTimeout(
    getGroq().chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Data}` },
            },
          ],
        },
      ],
      temperature: 0,
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
    }),
    AI_GROQ_VISION_TIMEOUT_MS,
    `Groq ${modelName}`,
  );

  const text = completion?.choices?.[0]?.message?.content;
  if (!text) throw new Error(`Groq ${modelName} returned empty response`);
  devLog(`[VITALIS IMAGE] Groq ${modelName} raw:`, String(text).slice(0, 200));
  return text;
}

// OpenRouter vision leg — last real attempt. Uses the full prompt: the free
// models have a 1M-token context window, so the anchor list fits comfortably.
async function analyzeWithOpenRouterVision(base64Data, mimeType, modelName, prompt = FOOD_ANALYSIS_PROMPT) {
  devLog(`[VITALIS IMAGE] Trying OpenRouter ${modelName}...`);
  const text = await callOpenRouter({
    model: modelName,
    prompt,
    base64Data,
    mimeType,
    timeoutMs: AI_OPENROUTER_TIMEOUT_MS,
    maxTokens: 4096,
    json: true,
  });
  devLog(`[VITALIS IMAGE] OpenRouter ${modelName} raw:`, String(text).slice(0, 200));
  return text;
}

// MAIN EXPORT
// Returns a JSON string. Success → { items, suggestion }. Failure → a
// machine-readable code so the controller/UI can tell "AI busy" apart from
// "no food in the photo" instead of showing one generic error for both.
function visionFailure(code, retryable, suggestion) {
  return JSON.stringify({
    success: false,
    detected: false,
    items: [],
    code,
    retryable: Boolean(retryable),
    suggestion,
  });
}

async function analyzeFoodImage(base64Data, mimeType = "image/jpeg") {
  // Normalize: callers may send a full data-URI or raw base64. Strip prefix
  // so vision payloads and cache keys are stable either way.
  const cleanBase64 = String(base64Data || "").includes(",")
    ? String(base64Data).split(",").pop()
    : String(base64Data || "");

  if (!cleanBase64) {
    return visionFailure("INVALID_IMAGE", false, "That image could not be read. Try another photo.");
  }
  if (!aiConfigured()) {
    return visionFailure("AI_NOT_CONFIGURED", false, "AI scanning is not configured. Enter the meal manually.");
  }

  const started = Date.now();
  const totalDeadline = started + VISION_TOTAL_BUDGET_MS;
  const geminiDeadline = started + VISION_GEMINI_BUDGET_MS;

  let sawEmpty = false;
  let emptySuggestion = "";
  let sawInvalid = false;
  let sawAuth = false;
  let sawTransient = false;
  let lastError = null;

  // Each provider attempt is classified, never silently collapsed into an
  // "Unknown food" success. A valid response with zero items is a real
  // "no food" signal; a thrown error is not.
  const attempt = async (label, call) => {
    if (Date.now() >= totalDeadline) return null;
    try {
      const raw = await call();
      const outcome = visionOutcome(raw);
      if (outcome.status === "ok") {
        devLog("[VITALIS IMAGE] ✅ Final result:", JSON.stringify(outcome.result).slice(0, 300));
        return JSON.stringify(outcome.result);
      }
      if (outcome.status === "empty") {
        sawEmpty = true;
        if (outcome.suggestion) emptySuggestion = outcome.suggestion;
        devLog(`[VITALIS IMAGE] ${label}: no food visible`);
      } else {
        sawInvalid = true;
        devWarn(`[VITALIS IMAGE] ${label}: unparseable JSON — trying next provider`);
      }
    } catch (err) {
      lastError = err;
      if (isAuthError(err)) {
        sawAuth = true;
        devWarn(`[VITALIS IMAGE] ✕ ${label} auth rejected: ${String(err.message).slice(0, 140)}`);
      } else if (isTokenLimitError(err)) {
        sawInvalid = true;
        devWarn(`[VITALIS IMAGE] ✕ ${label} prompt too large for provider limit`);
      } else if (isRetryableError(err)) {
        sawTransient = true;
        devWarn(`[VITALIS IMAGE] ↻ ${label} busy — trying next provider…`);
      } else {
        sawInvalid = true;
        devWarn(`[VITALIS IMAGE] ✕ ${label} failed: ${String(err.message).slice(0, 160)}`);
      }
    }
    return null;
  };

  // Leg 1 — Gemini (verified flash-lite models).
  if (process.env.GEMINI_API_KEY) {
    for (const modelName of getVisionModels()) {
      if (Date.now() >= geminiDeadline) break;
      const json = await attempt(modelName, () =>
        analyzeWithGeminiVision(cleanBase64, mimeType, modelName),
      );
      if (json) return json;
    }
  }

  // Leg 2 — Groq vision (compact prompt so the 7k ITPM free tier fits).
  if (process.env.GROQ_API_KEY) {
    for (const groqModel of getGroqVisionModels()) {
      if (Date.now() >= totalDeadline) break;
      const json = await attempt(`Groq ${groqModel}`, () =>
        analyzeWithGroqVision(cleanBase64, mimeType, groqModel),
      );
      if (json) return json;
    }
  }

  // Leg 3 — OpenRouter free vision models (last resort; never a paid model
  // unless the operator explicitly configured one).
  if (process.env.OPENROUTER_API_KEY) {
    for (const orModel of getOpenRouterVisionModels()) {
      if (Date.now() >= totalDeadline) break;
      const json = await attempt(`OpenRouter ${orModel}`, () =>
        analyzeWithOpenRouterVision(cleanBase64, mimeType, orModel),
      );
      if (json) return json;
    }
  }

  // Every provider that answered said "no food" and none failed → that is a
  // genuine empty photo, not an AI outage.
  if (sawEmpty && !sawInvalid) {
    return visionFailure(
      "NO_FOOD_DETECTED",
      false,
      emptySuggestion ||
        "No food was detected in this photo. Try a clearer, brighter shot or another angle.",
    );
  }
  if (sawAuth) {
    devError("[VITALIS IMAGE] Provider authentication failed — check the backend AI keys");
    return visionFailure(
      "AI_AUTH_ERROR",
      false,
      "AI is not configured correctly. Please enter the meal manually.",
    );
  }
  if (sawTransient && !sawInvalid) {
    return visionFailure(
      "AI_RATE_LIMITED",
      true,
      "AI is busy right now (high demand). Please wait a moment and try again.",
    );
  }

  devError(
    "[VITALIS IMAGE] All vision providers failed",
    lastError ? `— ${String(lastError.message).slice(0, 180)}` : "",
  );
  return visionFailure(
    "AI_UNAVAILABLE",
    true,
    "The AI scan could not complete. Please retry, or enter the meal manually.",
  );
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
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

// EXPORTS + SAFE JSON HELPER (never throws — returns { parsed, raw })

function safeParseAI(raw, fallback = null) {
  if (raw == null) return { parsed: fallback, raw: "" };
  const str = String(raw);
  const clean = str
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  try {
    return { parsed: JSON.parse(clean), raw: str };
  } catch (_) {}
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return { parsed: JSON.parse(match[0]), raw: str };
    } catch (_) {}
  }
  return { parsed: fallback, raw: str };
}

module.exports = {
  AI_TEXT_TIMEOUT_MS,
  AI_VISION_TIMEOUT_MS,
  AI_GROQ_VISION_TIMEOUT_MS,
  AI_OPENROUTER_TIMEOUT_MS,
  withTimeout,
  get genAI() {
    return getGenAI();
  },
  get groq() {
    return getGroq();
  },
  get openRouter() {
    return getOpenRouter();
  },
  aiConfigured,
  getTextModels,
  getVisionModels,
  getGroqVisionModels,
  getGroqTextModel,
  getOpenRouterVisionModels,
  getOpenRouterTextModels,
  stripDataUriPrefix(base64) {
    const s = String(base64 || "");
    return s.includes(",") ? s.split(",").pop() : s;
  },
  callGeminiWithFallback,
  callOpenRouter,
  analyzeFoodImage,
  normalizeItems,
  visionOutcome,
  validateAndCorrectMacros,
  parseNutritionJSON,
  anchorExpected,
  parseServingQuantity,
  isMeatyFood,
  isMainDish,
  isRetryableError,
  isTokenLimitError,
  isAuthError,
  backoffSleep,
  suggestPlanForMeal,
  safeParseAI,
};
