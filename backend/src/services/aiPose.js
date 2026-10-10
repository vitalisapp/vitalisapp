// Pose-analysis endpoint (image + skeletal landmarks → 1-sentence tip).
const log = require('../utils/logger');
const { genAI, callGeminiWithFallback, withTimeout, AI_VISION_TIMEOUT_MS, getVisionModels, aiConfigured } = require('../config/gemini');

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
                if (process.env.NODE_ENV !== 'production') log.warn(`[analyze-pose] ${visionModel} failed:`, e.message);
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
            log.error("Gemini Error:", error?.message);
            next(error);
        }
  }catch(e){ next(e); }
}

module.exports = { postanalyzePose };
