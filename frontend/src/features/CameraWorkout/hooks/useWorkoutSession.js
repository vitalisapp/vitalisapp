import { useCallback, useRef, useState } from 'react';
import { apiPost, apiPatch } from '../../../lib/apiClient.js';

export function useWorkoutSession() {
  const [sessionId,     setSessionId]     = useState(null);
  const [isActive,      setIsActive]      = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [sessionError,  setSessionError]  = useState(null);

  const sessionIdRef = useRef(null);

  const startSession = useCallback(async (workoutType) => {
    setSessionError(null);
    setSessionResult(null);

    try {
      const data = await apiPost('/api/workout-logs/start', { workout_type: workoutType });
      sessionIdRef.current = data.session_id;
      setSessionId(data.session_id);
      setIsActive(true);
      if (import.meta.env.DEV) console.info('[useWorkoutSession] started → id:', data.session_id);
    } catch (err) {
      if (import.meta.env.DEV) console.error('[useWorkoutSession] startSession failed:', err.message);
      setSessionError(err.message);
      // Don't rethrow — caller is fire-and-forget
    }
  }, []);

  const endSession = useCallback(async (status = 'completed', repCount = 0) => {
    const id = sessionIdRef.current;
    if (!id) {
      if (import.meta.env.DEV) console.warn('[useWorkoutSession] endSession called with no active session');
      return;
    }

    setSessionError(null);

    try {
      const data = await apiPatch(`/api/workout-logs/${id}/end`, { status, rep_count: repCount });
      setSessionResult(data);
      if (import.meta.env.DEV) console.info('[useWorkoutSession] ended → duration:', data.duration_seconds, 's');
    } catch (err) {
      if (import.meta.env.DEV) console.error('[useWorkoutSession] endSession failed:', err.message);
      setSessionError(err.message);
      // Don't rethrow — caller is fire-and-forget
    } finally {
      sessionIdRef.current = null;
      setSessionId(null);
      setIsActive(false);
    }
  }, []);

  return { sessionId, isActive, startSession, endSession, sessionResult, sessionError };
}