# VITALIS — AI Integration and Technical Justification

> Checklist Section 9. This document explains **why Google Gemini is the primary
> AI platform** for VITALIS, how it compares with OpenAI, Anthropic Claude and
> Microsoft Copilot, and how the system handles cost, performance and internet
> connectivity. Everything under "How it is built" describes the actual code
> (`backend/src/config/gemini.js` and the services that call it).
>
> **Before submission:** AI pricing and free-tier limits change often. Check the
> vendors' current pricing pages and add the date you checked to the thesis.

---

## 1. What the AI does in VITALIS

| Feature | Input | AI task | Code |
|---|---|---|---|
| Meal photo analysis | Food photo | Vision: identify dishes and estimate calories, macros, sugar and sodium | `foodLogs.service.js` → `analyzeFoodImage()` |
| Meal → plan suggestion | Logged meal + plans | Text: recommend a suitable plan | `suggestPlanForMeal()` |
| AI coach / insights | Activity, goals, logs | Text: personalized guidance | `ai.service.js`, `coach.service.js`, `coachPlan.service.js` |
| BMI context | BMI record | Text: plain-language explanation | `bmi.service.js` |
| Progress photos | Front/side/back photos | Vision: estimated visual changes (never a diagnosis) | `progress.service.js` |

The following do **not** use a cloud AI model:
- **Camera rep counting** uses MediaPipe Pose, which runs **on the device** in the browser.
- **Progress summaries** (Section 8) are rule-based, in `utils/progressInsights.js`.
- **Plan/macro math** uses the deterministic `planEngine.js` (BMR/TDEE formulas).

So the cloud AI is used only where it adds real value, mainly **vision**
(reading food photos) and **natural-language coaching**.

---

## 2. Evaluation criteria

VITALIS's needs decided the weighting:

1. **Multimodal (image) input.** Meal scanning is the core AI feature, so the model must read photos.
2. **Cost.** This is a student capstone with no revenue, so a usable **free tier** is essential.
3. **Latency.** Users wait at the camera screen, so the model must be fast.
4. **Structured output.** Nutrition must come back as reliable JSON.
5. **Integration effort.** It needs an official Node.js SDK and a simple API-key setup.
6. **Suitability.** Food knowledge, including Filipino dishes, and safe, non-diagnostic tone.

---

## 3. Platform comparison

| Criterion | **Google Gemini** (selected) | OpenAI (GPT models) | Anthropic Claude | Microsoft Copilot |
|---|---|---|---|---|
| Image (vision) input | ✅ Native multimodal | ✅ Yes | ✅ Yes | ⚠️ Consumer product; developer access goes through Azure OpenAI |
| Free tier for developers | ✅ Free API tier via Google AI Studio (rate-limited) | ❌ Pay-as-you-go; no ongoing free API tier | ❌ Pay-as-you-go; no ongoing free API tier | ❌ Requires an Azure subscription |
| Fast/low-cost model class | ✅ Flash / Flash-Lite models built for low latency | ✅ Mini models (paid) | ✅ Haiku models (paid) | Same as Azure OpenAI |
| JSON / structured output | ✅ `responseMimeType: application/json` | ✅ Structured outputs | ✅ Tool use / JSON | Via Azure OpenAI |
| Node.js SDK | ✅ `@google/generative-ai` | ✅ `openai` | ✅ `@anthropic-ai/sdk` | Azure SDK |
| Setup for a student team | ✅ Google account + API key in minutes | Card required | Card required | Azure tenant + resource provisioning |
| Fit for VITALIS | **Best overall for a free, vision-first app** | Strong quality, but ongoing cost | Strong reasoning and safety, but ongoing cost | Built as an end-user assistant, not an embeddable API |

### Why Gemini over OpenAI

Both offer capable vision models and good SDKs. The deciding factor is
**cost to operate**. Gemini's free API tier lets VITALIS run meal scanning
and coaching for testing, demos and evaluation **at no cost**. OpenAI's API is
billed per token from the first request. Gemini's Flash-Lite models are also
built for fast responses, which matters on the meal-scan screen. OpenAI
remains a valid alternative if the project later gets a budget, because the
AI layer is isolated in one module (`config/gemini.js`).

### Why not Claude or Copilot as the primary

- **Claude:** strong reasoning and safety-focused output, but also paid per
  token with no ongoing free API tier, so the cost concern is the same as OpenAI.
- **Copilot:** an end-user assistant inside Microsoft products. Programmatic
  access means Azure OpenAI, which requires an Azure subscription and
  provisioning. That adds setup and cost with no benefit over calling a model
  API directly.

---

## 4. How it is built (reliability and cost controls)

### 4.1 Provider fallback chain

One provider outage must never break meal logging, so `gemini.js` tries
providers in order and stops at the first good answer:

```
Meal photo (vision)                     Text (coach, suggestions)
──────────────────                      ──────────────────────────
1. Gemini Flash-Lite models             1. Gemini Flash-Lite models
2. Groq vision model                    2. Groq text model
3. OpenRouter free vision models        3. OpenRouter free text models
4. Friendly error + manual entry        4. Static / rule-based fallback
```

- Models are configurable through env vars (`GEMINI_TEXT_MODELS`,
  `GEMINI_VISION_MODELS`, `GROQ_*`, `OPENROUTER_*`) without code changes.
- Each leg has a timeout (`AI_TEXT_TIMEOUT_MS`, `AI_VISION_TIMEOUT_MS`, …) and
  an overall vision budget (`AI_VISION_BUDGET_MS`), so users never wait forever.
- Retryable errors (rate limits, overload) back off and retry; auth and
  token-limit errors skip straight to the next provider.
- OpenRouter defaults are **free** (`:free`) models. A paid model is used only
  if an operator sets one explicitly.
- With **no AI keys at all**, the app still runs: AI features fall back to
  static or rule-based output (see README).

### 4.2 Cost controls

| Control | Where | Effect |
|---|---|---|
| Daily AI quota per user | `middleware/aiQuota.js` (`AI_DAILY_LIMIT`, default 50) | Caps usage so the free tier is never exhausted by one user |
| AI rate limiter | `middleware/rateLimits.js` (`aiLimiter`) | Blocks bursts and abuse |
| Image-hash analysis cache | `foodLogs.service.js` (`imageHash`, `analysisCache`) | The same photo is never analyzed twice |
| Insight cache | `ai_insight_cache` table | Reuses recent coaching output |
| Food density cache | `food_density_cache` table | Avoids repeated portion lookups |
| Client image compression | `Log/utils/compressImage.js` | Smaller uploads, fewer tokens, faster responses |
| Output validation | `validateAndCorrectMacros()` | Fixes implausible AI numbers using a reference anchor table |

### 4.3 Safety and data minimization

- AI output is labeled as an **estimate**. Progress-photo reviews are never a
  diagnosis or a body-fat measurement.
- Only the data needed for a task is sent: a meal photo for a meal scan, and
  activity, goal and nutrition numbers for coaching. **No personal identifiers
  are sent**: not the name, email, phone number or password. To still greet
  users by name, prompts ask the model to write the placeholder `{{name}}`, and
  the server replaces it with the user's first name after the reply returns
  (`personalize()` in `ai.service.js`, covered by `tests/unit/ai-privacy.test.js`).
- Progress photos are stored privately and are owner-scoped.

---

## 5. Internet connectivity requirements

VITALIS is **online-first**: the database and AI providers live on the server.

| Needs internet | Works offline |
|---|---|
| Logging workouts, meals and weight (saved to server) | Opening the installed app shell (PWA cache) |
| Meal photo analysis, AI coach, photo review | Staying signed in (cached session) |
| Notifications, plans, admin dashboard | Camera rep counting (MediaPipe runs on device) once loaded |

How the app communicates connectivity (`frontend/src`):
- `components/NetworkStatus.jsx` shows an app-wide pill, "You're offline…",
  when the device loses connection and briefly shows "Back online" when it returns.
- `lib/apiClient.js` turns raw network failures into plain messages
  ("You're offline…" / "Can't reach the VITALIS server…") instead of
  "Failed to fetch".
- AI calls have timeouts, so a slow connection ends in a clear retry message
  rather than an endless spinner.

**Recommended minimum:** a stable mobile-data or Wi-Fi connection. Meal
photos are compressed on the device before upload to keep data use low.

---

## 6. Summary

Gemini was selected because it is the only major platform that combines
**native image understanding, fast low-cost models, JSON output, an official
Node SDK and a free developer tier**. That fits a vision-first, zero-budget
capstone. VITALIS does not depend on a single vendor: Groq and OpenRouter
fallbacks, quotas, caching, output validation and rule-based features keep
the system reliable and inexpensive. Switching to OpenAI or Claude later is a
change in one module, not a redesign.
