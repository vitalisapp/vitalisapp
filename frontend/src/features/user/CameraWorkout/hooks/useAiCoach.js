import { useCallback, useEffect, useRef, useState } from 'react';
import { speak } from './useRepCounter.js';
import { apiPost } from '../../../../lib/apiClient.js';

export function useAICoach({ workoutType, voiceEnabled }) {
  const [aiFeedback,  setAiFeedback]  = useState('Select Exercise & Start');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const lastAICallRef  = useRef(0);
  const analyzingGuard = useRef(false);
  const requestIdRef = useRef(0);
  const lastVoiceRef = useRef({ text: '', at: 0 });

  const speakCue = useCallback((text) => {
    if (!voiceEnabled || !text) return;
    const now = Date.now();
    const previous = lastVoiceRef.current;
    if (now - previous.at < 7000 || (previous.text === text && now - previous.at < 20000)) return;
    lastVoiceRef.current = { text, at: now };
    speak(text, 0.95, 1.0, false);
  }, [voiceEnabled]);

  const cancelAnalysis = useCallback(() => {
    requestIdRef.current += 1;
    analyzingGuard.current = false;
    setIsAnalyzing(false);
  }, []);

  useEffect(() => {
    requestIdRef.current += 1;
    analyzingGuard.current = false;
    lastAICallRef.current = 0;
    setIsAnalyzing(false);
  }, [workoutType]);

  const analyzeWithAI = useCallback(async (landmarks) => {
    if (analyzingGuard.current) return;
    analyzingGuard.current = true;
    const requestId = ++requestIdRef.current;
    setIsAnalyzing(true);

    // landmarks is null when camera is blocked / no body detected.
    // Guard partial poses: need indices up to 28 for the snapshot below.
    const hasFullPose = Array.isArray(landmarks) && landmarks.length >= 29;
    const isBlocked = !hasFullPose;
    const y = (i) => {
      const p = hasFullPose ? landmarks[i] : null;
      const v = Number(p?.y);
      return Number.isFinite(v) ? v.toFixed(3) : '?.???';
    };

    const userPrompt = isBlocked
      ? `Exercise: ${workoutType}\nThe camera is completely blocked or the athlete is out of frame. Give ONE short (≤10 word) instruction to fix their position. No quotes.`
      : `
Exercise: ${workoutType}
Pose snapshot (normalised y-coords, 0=top 1=bottom):
  shoulders L=${y(11)} R=${y(12)}
  elbows    L=${y(13)} R=${y(14)}
  wrists    L=${y(15)} R=${y(16)}
  hips      L=${y(23)} R=${y(24)}
  knees     L=${y(25)} R=${y(26)}
  ankles    L=${y(27)} R=${y(28)}

Give ONE short (≤12 word) coaching cue. No quotes. No punctuation at end.
`.trim();

    try {
      // 60s (not 10s): backend fails over across 4 Gemini models with
      // backoff + Groq before answering. During 503 demand spikes the cascade
      // takes ~20-30s — a 10s client timeout abandons the real answer and the
      // dev proxy (15s) 502s it. Canned-cue fallback below still covers worst case.
      const data = await apiPost('/api/coach', {
        workoutType,
        context: userPrompt,
        // Legacy compat: backend ignores `system`, uses server-owned prompt
        system: 'You are a terse, encouraging personal trainer. Reply with ONE coaching cue of 12 words or fewer. No quotes, no trailing punctuation.',
        prompt: userPrompt,
      }, { timeoutMs: 60000 });
      if (requestId !== requestIdRef.current) return;
      const tip = data?.text?.trim();

      if (tip && !/high demand|currently experiencing|try again later/i.test(tip) && !data?.degraded) {
        setAiFeedback(tip);
        // Routine cue: never cut off start/warning/milestone audio (stutter fix).
        speakCue(tip);
      } else if (tip && data?.degraded) {
        // Backend signalled overload — fall back to canned cue, don't speak overload text
        const exerciseFallbacksDegraded = {
          pushup: 'Keep your core tight and back flat',
          squat: 'Drive through your heels as you rise',
        };
        const fb = exerciseFallbacksDegraded[workoutType] ?? 'Great form, keep it up';
        setAiFeedback(fb);
        speakCue(fb);
      } else if (tip) {
        setAiFeedback(tip);
        // Routine cue: never cut off start/warning/milestone audio (stutter fix).
        speakCue(tip);
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (import.meta.env.DEV) console.warn('[useAICoach] API error:', err.message);
      const blockedFallbacks = [
        'Step back so your full body is visible',
        'Position yourself in frame and try again',
        'Camera blocked — adjust your position',
      ];
      const exerciseFallbacks = {
        pushup:        'Keep your core tight and back flat',
        squat:         'Drive through your heels as you rise',
        lunge:         'Keep front knee over ankle',
        bicep_curl:    'Squeeze at the top, lower slowly',
        overhead:      'Lock arms fully at the top',
        crunch:        'Exhale on the way up',
        situp:         'Engage your core, not your neck',
        lateral_raise: 'Lead with your elbows, not wrists',
        calfraise:     'Full range — pause at the top',
      };
      const fb = isBlocked
        ? blockedFallbacks[Math.floor(Math.random() * blockedFallbacks.length)]
        : (exerciseFallbacks[workoutType] ?? 'Great form, keep it up');
      setAiFeedback(fb);
      speakCue(fb);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsAnalyzing(false);
        analyzingGuard.current = false;
      }
    }
  }, [workoutType, speakCue]);

  const maybeAnalyze = useCallback((landmarks) => {
    const now = Date.now();
    // Blocked camera fires faster (every 2s) vs normal pose (every 3.5s)
    const throttle = landmarks ? 3500 : 2000;
    if (now - lastAICallRef.current > throttle) {
      lastAICallRef.current = now;
      analyzeWithAI(landmarks);
    }
  }, [analyzeWithAI]);

  return { aiFeedback, isAnalyzing, setAiFeedback, maybeAnalyze, cancelAnalysis };
}
