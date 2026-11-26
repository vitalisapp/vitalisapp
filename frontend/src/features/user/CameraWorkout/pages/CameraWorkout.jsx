import { useState, useRef, useEffect, useCallback } from 'react';
import { BottomNav } from '../../../../components/index.js';
import AppShell from '../../../../components/AppShell.jsx';
import Icon from '../../../../components/Icon.jsx';
import { useAuth } from '../../../../hooks/useAuth.jsx';
import { WORKOUT_OPTIONS } from '../constants/workout.js';
import { resolveWorkout, frameUrl } from '../constants/workoutGuide.js';
import { useRepCounter, speak, assessPose } from '../hooks/useRepCounter.js';
import { useHoldTimer } from '../hooks/useHoldTimer.js';
import { useWorkoutSession } from '../hooks/useWorkoutSession.js';
import { apiPost } from '../../../../lib/apiClient.js';
import { safeGet, safeSet } from '../../../../lib/storage.js';
import { useNavigate, useLocation } from 'react-router-dom';
import WebcamFeed from '../components/WebcamFeed.jsx';
import SessionHeader from '../components/SessionHeader.jsx';
import DesktopWorkoutSelector from '../components/DesktopWorkoutSelector.jsx';
import MobileWorkoutPills from '../components/MobileWorkoutPills.jsx';
import RightPanel from '../components/RightPanel.jsx';
import RepProgressRing, { FormStatusPill } from '../components/RepProgressRing.jsx';
import { formStatus } from '../components/formStatus.js';
import CorrectionBanner from '../components/CorrectionBanner.jsx';
import SessionBottomBar from '../components/SessionBottomBar.jsx';
import WorkoutSummary from '../components/WorkoutSummary.jsx';
import PlanDayRoutine from '../../Plan/components/PlanDayRoutine.jsx';
import UnlockCelebration from '../../Progression/components/UnlockCelebration.jsx';
import ChallengeResultCard from '../../Progression/components/ChallengeResultCard.jsx';
import { useRefreshProgression } from '../../Progression/hooks/useProgression.js';
import WorkoutFeedbackSheet from '../components/WorkoutFeedbackSheet.jsx';
import AddWorkoutModal from '../../Log/components/AddWorkoutModal.jsx';
import ExerciseChoiceModal from '../components/ExerciseChoiceModal.jsx';
import ExerciseBriefing from '../components/ExerciseBriefing.jsx';
import { COUNTER_GUIDES, partialHint } from '../constants/exerciseInstructions.js';
import { useAICoach } from '../hooks/useAiCoach.js';
import { usePoseEngine } from '../hooks/usePoseEngine.js';
import EarlyExitDialog from '../components/EarlyExitDialog.jsx';
import WorkoutChooser from '../components/WorkoutChooser.jsx';

// ── Minimum reps required to count a session as complete ─────────────────────
const MIN_REPS_DEFAULT = 5;


// ── Activity types that should NOT launch the camera (use manual complete) ───
const REST_ACTIVITY_TYPES = new Set(['Recovery', 'Mobility', 'Flexibility']);


// ══════════════════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════════════════
const CameraWorkout = () => {
  const { user } = useAuth();
  const USER_ID = user?.id ?? user?.userId ?? null;
  const navigate = useNavigate();
  const location = useLocation();
  const fromPlan = location.state?.fromPlan ?? null;
  // Revision #4 — optional challenge started from Plans › Levels.
  const challenge = fromPlan ? null : (location.state?.challenge ?? null);
  const [challengeResult, setChallengeResult] = useState(null);
  const refreshProgression = useRefreshProgression();

  const requiredMins = fromPlan?.durationMins ?? 0;
  const minReps      = MIN_REPS_DEFAULT;
  const minHoldSecs  = 30;

  const [workoutType, setWorkoutType] = useState(() => {
    // Deep links: Bryl slugs ('push-up') or legacy ids ('pushup') both resolve.
    // Otherwise null -> user picks a workout first, camera opens after.
    if (location.state?.exerciseId) {
      if (resolveWorkout(location.state.exerciseId)) return location.state.exerciseId;
      const match = WORKOUT_OPTIONS.find(o => o.id === location.state.exerciseId);
      if (match) return match.id;
    }
    if (fromPlan?.activityType) {
      const bySlug = resolveWorkout(fromPlan.activityType.toLowerCase().replace(/\s+/g, '-'));
      if (bySlug) return bySlug.id;
      const match = WORKOUT_OPTIONS.find(
        o =>
          o.label.toLowerCase() === fromPlan.activityType.toLowerCase() ||
          o.id === fromPlan.activityType.toLowerCase()
      );
      if (match) return match.id;
    }
    return null;
  });

  const chosen = workoutType !== null;
  const resolved = (workoutType ? resolveWorkout(workoutType) : null) ?? (workoutType ? null : null);
  const workoutMode = resolved?.mode ?? 'rep';
  const counterType = resolved?.counterType ?? 'generic';
  const selfTracked = workoutMode !== 'hold' && counterType === 'generic';

  // Rep + hold targets (user picks before Start). Manual input allowed.
  const [repTarget, setRepTarget] = useState(() => (challenge?.mode === 'rep' && challenge.reps) || 5);
  const [repCustom, setRepCustom] = useState('');
  const [setTarget, setSetTarget] = useState(() => (challenge?.mode === 'rep' && challenge.sets) || 3);
  const [setCustom, setSetCustom] = useState('');
  const [completedSets, setCompletedSets] = useState(0);
  const completedSetsRef = useRef(0);
  const [holdTarget, setHoldTarget] = useState(() => (challenge?.mode === 'hold' && challenge.target) || 45);
  const [holdCustom, setHoldCustom] = useState('');

  const [isRecording,     setIsRecording]     = useState(false);
  const [paused,          setPaused]          = useState(false);
  const [summary,         setSummary]         = useState(null);
  const [feedbackFor,     setFeedbackFor]     = useState(null); // Module 5 — feedback sheet
  const [cameraOn,        setCameraOn]        = useState(() => safeGet('vitalis_cameraOn', 'true') !== 'false');
  const [voiceEnabled,    setVoiceEnabled]    = useState(() => safeGet('vitalis_voiceEnabled', 'true') !== 'false');
  const [logs,            setLogs]            = useState([]);
  const [biometrics,      setBiometrics]      = useState({ alignment: 0, velocity: 0, symmetry: 0 });
  // Skeleton lock: true only while shoulders/hips are confidently visible.
  // Flips state on transitions only (pose fires ~10/sec) to avoid re-renders.
  const [tracking, setTracking] = useState(false);
  const trackingRef = useRef(false);
  const [trackingHint, setTrackingHint] = useState('Step into view and keep your whole body visible');
  const trackingHintRef = useRef('');
  const fullBodySinceRef = useRef(0);
  const poseSideRef = useRef(null);

  // Session timer
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const sessionStartRef               = useRef(null);
  const timerRef                      = useRef(null);

  // FIX: snapshot of repCount at the moment the early-exit dialog is opened,
  // so JSX receives a plain number instead of reading repCountRef.current during render.
  const [earlyExitReps,    setEarlyExitReps]    = useState(0);
  const [showEarlyExit,    setShowEarlyExit]    = useState(false);
  const [pickerOpen,       setPickerOpen]       = useState(false);
  const [manualOpen,       setManualOpen]       = useState(false);
  // Chosen library exercise awaiting the "camera or manual?" decision.
  const [choiceEx,         setChoiceEx]         = useState(null);
  // Exercise label carried from the choice modal into the manual form.
  const [manualTitle,      setManualTitle]      = useState('');

  const webcamRef = useRef(null);
  const doStopRef = useRef(null);
  // Back-navigation stops the session without the summary sheet (the page
  // is leaving anyway) — only explicit stops show it.
  const skipSummaryRef = useRef(false);
  // Latest pose landmarks for the skeleton overlay (ref: no re-renders).
  const landmarksRef = useRef(null);
  // Rolling form samples while recording (capped) — the complete summary
  // averages these client-side. Cleared on every Start.
  const samplesRef = useRef([]);
  // Mirrors for callbacks that must read fresh values through refs.
  const elapsedSecsRef = useRef(0);
  const pendingNavRef = useRef(null);
  // Voice-warning cooldowns: onPoseResult fires ~10/sec, so unguarded speak()
  // calls cancel+restart audio every frame into garbled stutter. Max one
  // warning voice per 4s; overlay text still updates every frame.
  const lastWarnRef = useRef(0);
  const lastHoldCueRef = useRef(0);
  const wasHoldingRef = useRef(true);
  const WARN_COOLDOWN_MS = 4000;
  const lastPartialRef = useRef(0);
  useEffect(() => {
    partialHandlerRef.current = (type) => {
      const hint = partialHint(type);
      if (!hint || Date.now() - lastPartialRef.current < WARN_COOLDOWN_MS) return;
      lastPartialRef.current = Date.now();
      setAiFeedback(hint);
      if (voiceEnabled) speak(hint, 0.95, 1.0, false);
    };
  });
  // Target-reached fires the stop sequence once — without this the rep/hold
  // branch re-triggers every frame until the 800ms stop lands (double logs,
  // double notifications, double navigations).
  const reachedRef = useRef(false);
  // Pose results arrive ~10/sec. The stat cards only need a few refreshes per
  // second — publishing every frame re-rendered the whole workout tree and
  // made menus/camera controls feel sluggish on ordinary laptops.
  const bioPublishRef = useRef(0);
  const publishBiometrics = useCallback((next) => {
    const now = performance.now();
    if (now - bioPublishRef.current < 400) return;
    bioPublishRef.current = now;
    setBiometrics((prev) => (
      prev.alignment === next.alignment &&
      prev.velocity === next.velocity &&
      prev.symmetry === next.symmetry
    ) ? prev : next);
  }, []);

  // Section 7: a shallow rep (started but not deep enough) gets a spoken tip.
  const partialHandlerRef = useRef(null);
  const [briefingHiddenFor, setBriefingHiddenFor] = useState(null);
  const { repCount, repCountRef, countRep, resetReps, invalidateRep, addRep } = useRepCounter({
    voiceEnabled,
    onPartialRep: (type) => partialHandlerRef.current?.(type),
  });
  const { holdSecs, holdRef, updateHold, resetHold, setHoldTarget: setHoldGoal } = useHoldTimer({ voiceEnabled });
  const { aiFeedback, isAnalyzing, setAiFeedback, maybeAnalyze, cancelAnalysis } = useAICoach({ workoutType: resolved?.label ?? workoutType, voiceEnabled });
  const { startSession, pauseSession, resumeSession, endSession, sessionResult } = useWorkoutSession();

  useEffect(() => { setHoldGoal(holdTarget); }, [holdTarget, setHoldGoal]);

  // Warm up speech voices on mount: getVoices() is async and returns [] on
  // first call in Chrome — without this the opening "Starting…" cue speaks in
  // a fallback/robotic voice (or clips) instead of the preferred English one.
  useEffect(() => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return undefined;
      synth.getVoices();
      const warm = () => { try { synth.getVoices(); } catch { /* noop */ } };
      synth.addEventListener?.('voiceschanged', warm);
      return () => { try { synth.removeEventListener?.('voiceschanged', warm); } catch { /* noop */ } };
    } catch { return undefined; }
  }, []);

  // ── Timer: tick every second while recording and not paused ──────
  useEffect(() => {
    if (isRecording && !paused) {
      // Preserve elapsed time across pause/resume cycles
      sessionStartRef.current = Date.now() - elapsedSecs * 1000;
      timerRef.current = setInterval(() => {
        setElapsedSecs(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  // elapsedSecs intentionally excluded: we only want to (re)start the interval
  // when isRecording/paused flips, not on every tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, paused]);

  useEffect(() => { elapsedSecsRef.current = elapsedSecs; }, [elapsedSecs]);

  const elapsedMins = Math.floor(elapsedSecs / 60);

  const isSessionComplete = useCallback(() => {
    if (!fromPlan) return true;
    if (workoutMode === 'hold') {
      if (requiredMins > 0) {
        return elapsedMins >= Math.ceil(requiredMins * 0.5) && Math.floor(holdRef.current) >= minHoldSecs;
      }
      return Math.floor(holdRef.current) >= minHoldSecs;
    }
    const reps = completedSetsRef.current * repTarget + repCountRef.current;
    if (requiredMins > 0) {
      return elapsedMins >= Math.ceil(requiredMins * 0.5) && reps >= minReps;
    }
    return reps >= minReps;
  }, [fromPlan, requiredMins, elapsedMins, minReps, minHoldSecs, workoutMode, repCountRef, holdRef, repTarget]);

  // ── The actual stop logic (called after confirmation if needed) ─
  const doStop = useCallback(() => {
    cancelAnalysis();
    const final = workoutMode === 'hold' ? repCountRef.current : completedSetsRef.current * repTarget + repCountRef.current;
    const held = Math.floor(holdRef.current);
    // ── Complete summary (reference screen 3). Score is a documented
    // client-side heuristic: average of sampled postural symmetry for
    // alignment/balance + rep-cadence tempo. No backend change.
    const samples = samplesRef.current;
    const avgSym = samples.length
      ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
      : 0;
    const elapsed = elapsedSecsRef.current;
    let tempoState = '—';
    let tempoNum = null;
    if (workoutMode === 'hold') {
      const completedHold = held >= holdTarget;
      tempoState = completedHold ? 'Good' : 'Needs work';
      tempoNum = completedHold ? 90 : 50;
    } else if (final > 0 && elapsed > 0) {
      const secsPerRep = elapsed / final;
      const goodTempo = secsPerRep >= 1 && secsPerRep <= 8;
      tempoState = goodTempo ? 'Good' : 'Needs work';
      tempoNum = goodTempo ? 90 : 50;
    }
    const alignGood = avgSym >= 70;
    const scoreParts = [avgSym, avgSym];
    if (tempoNum !== null) scoreParts.push(tempoNum);
    const score = Math.max(0, Math.min(100, Math.round(scoreParts.reduce((a, b) => a + b, 0) / scoreParts.length)));

    // Revision #4: technique signal — only real camera pose data counts.
    const formScore = cameraOn && samples.length >= 10 && avgSym > 0 ? score : null;
    const challengeSets = challenge?.mode === 'hold' && workoutMode === 'hold'
      ? [{ exercise_name: resolved?.label ?? workoutType, set_number: 1, duration_seconds: held }]
      : undefined;
    setChallengeResult(null);
    endSession('completed', final, challengeSets, formScore === null ? undefined : { form_score: formScore })
      .then((log) => {
        refreshProgression();
        if (!challenge || !log?.id || log.status !== 'completed') return;
        setChallengeResult({ loading: true });
        apiPost(`/api/progression/challenges/${encodeURIComponent(challenge.key)}/complete`, { workoutLogId: log.id })
          .then((r) => { setChallengeResult(r); refreshProgression(); })
          .catch((err) => setChallengeResult({ error: err?.message || 'Could not check the challenge.' }));
      })
      .catch(err => {
        if (import.meta.env.DEV) console.warn('[endSession] background error:', err);
      });

    const label = resolved?.label ?? workoutType;
    const msg = workoutMode === 'hold'
      ? `Session complete! You held ${held} seconds. Great work!`
      : `Session complete! You did ${final} ${final === 1 ? 'rep' : 'reps'}. Great work!`;
    setAiFeedback(msg);
    if (voiceEnabled) speak(msg, 1.0, 1.05);

    setLogs(prev => [...prev, {
      exercise: label,
      reps:     workoutMode === 'hold' ? `${held}s` : final,
      time:     new Date().toLocaleTimeString(),
    }]);

    const resolvedUserId = user?.id ?? user?.userId ?? null;

    const lastCue = aiFeedback && !/^(Select Exercise|Starting|Switched|Session complete)/.test(aiFeedback)
      ? aiFeedback
      : 'Nice work — consistency beats intensity. Keep it up.';
    if (!skipSummaryRef.current) {
      setSummary({
      exercise: label,
      achieved: workoutMode === 'hold'
        ? `${held}s / ${holdTarget}s held`
        : `${final} / ${repTarget * setTarget} reps (${setTarget} × ${repTarget})`,
      score,
      rows: [
        { label: 'Alignment', icon: 'accessibility_new', good: alignGood, state: avgSym > 0 ? (alignGood ? 'Good' : 'Needs work') : '—' },
        { label: 'Balance', icon: 'balance', good: alignGood, state: avgSym > 0 ? (alignGood ? 'Good' : 'Needs work') : '—' },
        { label: 'Tempo', icon: 'timer', good: tempoState === 'Good', state: tempoState },
      ],
      coach: lastCue,
      });
    }

    if (fromPlan) {
      // Deferred until Done — the summary shows first.
      pendingNavRef.current = () => navigate('/plans', {
        state: { openTracker: fromPlan.planId },
      });
    }

    if (fromPlan && resolvedUserId && isSessionComplete()) {
      apiPost('/api/plans/progress/complete', {
        planId:    fromPlan.planId,
        dayNumber: fromPlan.dayNumber,
      })
        .catch(err => { if (import.meta.env.DEV) console.error('[fromPlan] day complete failed:', err); });
    }

    // The "Workout complete" notification is created server-side when the
    // session ends (workoutLogs.service → TRAINING), so it also covers manual
    // logs and never doubles up here.

    setElapsedSecs(0);
    setIsRecording(false);
    setPaused(false);
  }, [cancelAnalysis, endSession, repCountRef, holdRef, workoutType, workoutMode, resolved, voiceEnabled, user, fromPlan, isSessionComplete, navigate, setAiFeedback, aiFeedback, repTarget, setTarget, holdTarget, cameraOn, challenge, refreshProgression]);

  // Pause / resume: freezes timer + rep counting; video and skeleton
  // preview keep running. Voice cues are gated on paused upstream.
  // Module 5: the server row is paused/resumed too, so logged duration
  // excludes pause time (fire-and-forget — never blocks the session UI).
  const handlePauseToggle = useCallback(() => {
    if (!isRecording) return;
    invalidateRep();
    setPaused(prev => {
      const next = !prev;
      if (next) {
        pauseSession();
        // Clear the previous frame timestamp so resuming cannot credit the
        // pause interval toward a held pose.
        updateHold(null, false);
        wasHoldingRef.current = false;
      }
      else resumeSession();
      const msg = next ? 'Paused — press Resume to continue' : 'Resumed — keep going';
      setAiFeedback(msg);
      if (voiceEnabled) speak(msg, 0.95, 1.0);
      return next;
    });
  }, [isRecording, voiceEnabled, setAiFeedback, pauseSession, resumeSession, updateHold, invalidateRep]);

  // Summary Done: dismiss, then either collect the post-workout self-report
  // (Module 5) or flush any deferred plan navigation. Feedback only for
  // sessions we actually persisted — otherwise it's just skipped.
  const flushPendingNav = useCallback(() => {
    const go = pendingNavRef.current;
    pendingNavRef.current = null;
    if (go) go();
  }, []);

  const handleSummaryDone = useCallback(() => {
    setSummary(null);
    if (sessionResult?.id) {
      setFeedbackFor(sessionResult.id);
      return;
    }
    flushPendingNav();
  }, [sessionResult, flushPendingNav]);

  const handleFeedbackClose = useCallback(() => {
    setFeedbackFor(null);
    refreshProgression();
    flushPendingNav();
  }, [flushPendingNav, refreshProgression]);

  useEffect(() => { doStopRef.current = doStop; }, [doStop]);

  const handleStartStop = async () => {
    if (!chosen) return;
    if (!isRecording) {
      // ── START ──────────────────────────────────────────────────
      startSession(workoutType).catch(err => {
        if (import.meta.env.DEV) console.warn('[startSession] background error:', err);
      });
      resetReps();
      resetHold();
      completedSetsRef.current = 0;
      setCompletedSets(0);
      samplesRef.current = [];
      pendingNavRef.current = null;
      skipSummaryRef.current = false;
      setSummary(null);
      setPaused(false);
      reachedRef.current = false;
      setHoldGoal(holdTarget);
      setElapsedSecs(0);

      const label = resolved?.label ?? workoutType;
      const cue = selfTracked
        ? 'Timer running. Use +1 rep to record each rep; sets advance automatically.'
        : resolved?.cue ?? '';
      // Section 7: always repeat the camera setup when the session starts.
      const setupGuide = COUNTER_GUIDES[counterType]?.setup;
      const setupCue = workoutMode === 'hold' || !setupGuide
        ? 'Place your phone about 2 meters away so your whole body is visible.'
        : `Place your phone about ${setupGuide.distanceM === 2 ? '2' : '1.5'} meters away and stand ${setupGuide.view === 'side' ? 'sideways' : 'facing the camera'}.`;
      const goal = workoutMode === 'hold'
        ? `Hold for ${holdTarget} seconds.`
        : `Target ${setTarget} sets of ${repTarget} reps.`;
      const msg = fromPlan
        ? `Starting Day ${fromPlan.dayNumber}: ${fromPlan.dayTitle}. ${cue} ${goal}`
        : `Starting ${label}. ${cue} ${goal}`;
      const fullMsg = `${msg} ${setupCue}`;

      setAiFeedback(fullMsg);
      if (voiceEnabled) speak(fullMsg, 0.95, 1.0);
      setIsRecording(true);

    } else {
      // ── STOP — check if session qualifies ──────────────────────
      if (fromPlan && !isSessionComplete()) {
        // FIX: snapshot the current rep count into state NOW (event handler,
        // not during render) so the dialog can display it as a plain number.
        setEarlyExitReps(completedSetsRef.current * repTarget + repCountRef.current);
        setShowEarlyExit(true);
        return;
      }
      doStop();
    }
  };

  const completeSetIfReady = () => {
    if (repCountRef.current < repTarget || reachedRef.current) return;
    const nextSet = completedSetsRef.current + 1;
    completedSetsRef.current = nextSet;
    setCompletedSets(nextSet);
    resetReps();
    if (nextSet >= setTarget) {
      reachedRef.current = true;
      doStopRef.current?.();
    } else {
      const restCue = `Set ${nextSet} of ${setTarget} complete — rest, then press Resume when ready`;
      setAiFeedback(restCue);
      pauseSession();
      setPaused(true);
      if (voiceEnabled) speak(restCue, 0.95, 1.0, false);
    }
  };

  const handleAddRep = () => {
    if (!selfTracked || !isRecording || paused || reachedRef.current) return;
    addRep();
    completeSetIfReady();
  };

  const handleEarlyExitConfirm = () => {
    setShowEarlyExit(false);
    doStop();
  };
  const handleEarlyExitCancel = () => {
    setShowEarlyExit(false);
  };

  // Back navigation: end an in-progress session first so reps/hold progress
  // is logged instead of silently discarded, then leave.
  const handleBack = useCallback(() => {
    if (isRecording) {
      try { skipSummaryRef.current = true; doStopRef.current?.(); } catch { /* noop */ }
    }
    if (fromPlan) {
      navigate('/plans', { state: { openTracker: fromPlan.planId } });
    } else {
      navigate('/dashboard');
    }
  }, [isRecording, fromPlan, navigate]);

  const { poseReady, loadError, retryPose } = usePoseEngine({
    cameraOn,
    webcamRef,
    workoutType: counterType,
    onPoseResult: (landmarks, type, world) => {
      landmarksRef.current = landmarks;
      const setTracked = (t) => {
        if (t !== trackingRef.current) { trackingRef.current = t; setTracking(t); }
      };
      const setFrame = (ready, hint) => {
        setTracked(ready);
        if (trackingHintRef.current !== hint) {
          trackingHintRef.current = hint;
          setTrackingHint(hint);
        }
        if (isRecording && !paused && !ready) {
          setAiFeedback(hint);
          if (voiceEnabled && Date.now() - lastWarnRef.current > WARN_COOLDOWN_MS) {
            lastWarnRef.current = Date.now();
            speak(hint, 0.95, 1.0, false);
          }
        }
      };
      if (!landmarks) {
        invalidateRep();
        updateHold(null, false);
        fullBodySinceRef.current = 0;
        setFrame(false, 'Step into view so your whole body can be seen');
        publishBiometrics({ alignment: 0, velocity: 0, symmetry: 0 });
        return;
      }

      const video = webcamRef.current?.video;
      const framing = assessPose(landmarks, type, video?.videoWidth / video?.videoHeight || 1, world, poseSideRef.current);
      if (framing.ready) poseSideRef.current = framing.side;
      if (!framing.ready) fullBodySinceRef.current = 0;
      else if (!fullBodySinceRef.current) fullBodySinceRef.current = Date.now();
      const isVisible = framing.ready && Date.now() - fullBodySinceRef.current >= 350;
      setFrame(isVisible, isVisible ? framing.hint : framing.ready ? 'Hold still — checking exercise landmarks' : framing.hint);

      if (!isVisible || paused) {
        invalidateRep();
        updateHold(null, false);
        setBiometrics(prev => (prev.alignment === 30 ? prev : { ...prev, alignment: 30 }));
        return;
      }

      if (isRecording && isVisible && !paused) {
        if (workoutMode === 'hold') {
          const { holding } = updateHold(landmarks, true);
          if (!holding && wasHoldingRef.current && voiceEnabled && Date.now() - lastHoldCueRef.current > WARN_COOLDOWN_MS) {
            lastHoldCueRef.current = Date.now();
            setAiFeedback('Hold steady — keep your position');
            speak('Hold steady — keep your position', 0.95, 1.0, false);
          }
          wasHoldingRef.current = holding;
          maybeAnalyze(landmarks);
          if (Math.floor(holdRef.current) >= holdTarget && !reachedRef.current) {
            reachedRef.current = true;
            const msg = `Target reached! ${holdTarget} seconds held.`;
            setAiFeedback(msg);
            doStopRef.current?.();
          }
        } else if (!selfTracked) {
          countRep(landmarks, type, framing);
          maybeAnalyze(landmarks);
          completeSetIfReady();
        }
      }

      const lShoulder = landmarks[11];
      const rShoulder = landmarks[12];
      const symScore  = Math.max(0, 100 - Math.abs(lShoulder.y - rShoulder.y) * 500);
      // Honest biometrics: symmetry is computed from real shoulder landmarks.
      // Alignment mirrors the same real postural signal (not random); rep speed
      // is not instrumented yet so velocity stays 0 until wired. Card header
      // drives the form pill + alignment % (no fake precision).
      publishBiometrics({
        alignment: isVisible ? Math.round(symScore) : 0,
        velocity:  0,
        symmetry:  Math.floor(symScore),
      });
      // Rolling form samples for the complete summary (capped, ref only).
      if (isRecording && !paused && isVisible) {
        samplesRef.current.push(Math.round(symScore));
        if (samplesRef.current.length > 600) samplesRef.current.shift();
      }
    },
  });

  const handleStreamReset = useCallback(() => {
    poseSideRef.current = null;
    landmarksRef.current = null;
    trackingRef.current = false;
    setTracking(false);
    fullBodySinceRef.current = 0;
    invalidateRep();
    updateHold(null, false);
  }, [invalidateRep, updateHold]);

  const handleCameraToggle = () => {
    const next = !cameraOn;
    setCameraOn(next);
    safeSet('vitalis_cameraOn', String(next));
    if (!next) {
      // Drop the last pose so a stale skeleton never freezes on screen.
      landmarksRef.current = null;
      trackingRef.current = false;
      setTracking(false);
      trackingHintRef.current = 'Camera is off — turn it on to frame your body';
      setTrackingHint(trackingHintRef.current);
      fullBodySinceRef.current = 0;
      updateHold(null, false);
      if (isRecording) setIsRecording(false);
    }
    if (voiceEnabled) speak(next ? 'Camera on.' : 'Camera off.');
  };

  const handleVoiceToggle = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    safeSet('vitalis_voiceEnabled', String(next));
    speak(next ? 'Voice on.' : 'Voice off.');
  };

  const handleWorkoutChange = (opt) => {
    const id = opt?.id ?? opt;
    if (!id) return;
    // State first so selection always sticks, even if feedback fails.
    setWorkoutType(id);
    try {
      resetReps();
      resetHold();
      const r = resolveWorkout(id);
      setAiFeedback(`Switched to ${r?.label ?? opt?.label ?? id}. ${r?.cue ?? opt?.cue ?? ''}`);
      if (isRecording) setIsRecording(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (import.meta.env.DEV) console.error('[workout pick]', err);
    }
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <AppShell
      userId={USER_ID}
      mobileTitle="Camera Workout"
      contentClassName=""
      mainClassName="app-main--flush"
      bottomNav={<BottomNav />}
    >
      {showEarlyExit && (
        <EarlyExitDialog
          mode={workoutMode}
          reps={earlyExitReps}
          holdSecs={holdRef.current}
          minReps={minReps}
          minHoldSecs={minHoldSecs}
          elapsedMins={elapsedMins}
          requiredMins={requiredMins > 0 ? Math.ceil(requiredMins * 0.5) : 0}
          onConfirm={handleEarlyExitConfirm}
          onCancel={handleEarlyExitCancel}
        />
      )}

      {/* ── Exercise choice: camera vs manual entry ── */}
      {choiceEx && (
        <ExerciseChoiceModal
          exercise={choiceEx}
          onUseCamera={() => {
            const id = choiceEx.id;
            setChoiceEx(null);
            handleWorkoutChange({ id });
          }}
          onLogManually={() => {
            const label = choiceEx.label;
            setChoiceEx(null);
            setManualOpen(true);
            // Pre-fill the manual modal's session name with the chosen exercise.
            setManualTitle(label);
          }}
          onClose={() => setChoiceEx(null)}
        />
      )}

      {/* ── Manual workout entry (reused Log-page modal) ── */}
      {manualOpen && (
        <AddWorkoutModal
          initialTitle={manualTitle}
          onClose={() => { setManualOpen(false); setManualTitle(''); }}
          onSaved={(log) => {
            // Surface the save in the in-page session history, same shape as camera rows.
            const mins = Number(log?.duration_seconds) > 0
              ? Math.round(Number(log.duration_seconds) / 60)
              : null;
            const detail = log?.rep_count > 0
              ? `${log.rep_count} ${log.rep_count === 1 ? 'rep' : 'reps'}${mins != null ? ` · ${mins}m` : ''}`
              : (mins != null ? `${mins}m` : 'logged');
            setLogs(prev => [...prev, {
              exercise: log?.workout_type ?? 'Manual workout',
              reps: detail,
              time: new Date().toLocaleTimeString(),
            }]);
            setAiFeedback(`Logged manually: ${log?.workout_type ?? 'workout'}. Nice work!`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      <div>
        {/* ── Unified app topbar (menu + Vitalis + bell + theme + avatar) ── */}
        <div>
        {challenge && (
          <div className="bg-[var(--accent-bg)] border-b border-[var(--accent-border)] px-4 py-2.5 flex items-center gap-2 min-w-0">
            <Icon name="emoji_events" className="text-[length:var(--fs-16)] text-[var(--accent)] shrink-0" />
            <span className="text-[length:var(--fs-10)] font-black uppercase tracking-widest text-[var(--accent)] truncate">
              Challenge: {challenge.name}
            </span>
            <span className="text-[length:var(--fs-10)] text-[var(--text-secondary)] uppercase tracking-widest truncate">
              · {challenge.mode === 'hold' ? `${challenge.target}s total hold` : `${challenge.target} reps in one session`}
            </span>
          </div>
        )}
        {fromPlan && (
          <div className="bg-[var(--accent-bg)] border-b border-[var(--accent-border)] px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[length:var(--fs-10)] font-black uppercase tracking-widest text-[var(--accent)] truncate">
                {fromPlan.planTitle}
              </span>
              <span className="text-[length:var(--fs-10)] text-[var(--text-muted)] uppercase tracking-widest truncate">
                · Day {fromPlan.dayNumber}: {fromPlan.dayTitle}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {requiredMins > 0 && (
                <span className="text-[length:var(--fs-10)] text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">
                  Goal: {Math.ceil(requiredMins * 0.5)} min
                </span>
              )}
            </div>
          </div>
        )}

        {chosen && (
          <SessionHeader
            workoutLabel={resolved?.label ?? workoutType}
            workoutSub={`${resolved?.muscle ?? 'Full body'} · ${workoutMode === 'hold' ? `${holdTarget}s hold` : `${setTarget} sets × ${repTarget} reps`}`}
            isRecording={isRecording}
            paused={paused}
            cameraOn={cameraOn}
            voiceEnabled={voiceEnabled}
            onCameraToggle={handleCameraToggle}
            onVoiceToggle={handleVoiceToggle}
            onBack={handleBack}
            onChangeExercise={() => setPickerOpen(true)}
            onLogManual={() => setManualOpen(true)}
          />
        )}

        {chosen && (
          <>
            <MobileWorkoutPills
              workoutType={workoutType ?? undefined}
              onSelect={handleWorkoutChange}
              hideTrigger
              sheetOpen={pickerOpen}
              onSheetClose={() => setPickerOpen(false)}
            />
            <DesktopWorkoutSelector workoutType={workoutType ?? undefined} onSelect={handleWorkoutChange} isRecording={isRecording} paused={paused} cameraOn={cameraOn} />
          </>
        )}

        {!chosen ? (
          <WorkoutChooser
            onPick={(opt) => {
              // Every picked exercise asks: camera tracker or manual logging?
              const slug = opt?.slug ?? opt?.id;
              setChoiceEx(slug ? {
                id: slug,
                label: opt?.name ?? opt?.label ?? slug,
                img: frameUrl(slug, 1),
              } : null);
            }}
            onBack={handleBack}
          />
        ) : (
        <>
        {/* Section 7: instructions before starting (and a way to reopen them). */}
        {!isRecording && resolved && (
          <div className="px-[clamp(16px,3vw,32px)] max-w-7xl 2xl:max-w-[1400px] mx-auto w-full pt-3 sm:pt-4">
            {briefingHiddenFor !== workoutType ? (
              <ExerciseBriefing
                workout={resolved}
                onHide={() => setBriefingHiddenFor(workoutType)}
                onReady={() => { setBriefingHiddenFor(workoutType); handleStartStop(); }}
              />
            ) : (
              <button type="button" className="cw-brief-reopen" onClick={() => setBriefingHiddenFor(null)}>
                <Icon name="menu_book" /> How to do {resolved.label} &amp; camera setup
              </button>
            )}
          </div>
        )}
        {/* Camera feed — upper position, above the rep card */}
        <div className="px-[clamp(16px,3vw,32px)] max-w-7xl 2xl:max-w-[1400px] mx-auto w-full pt-3 sm:pt-4">
          <div className="relative">
            <WebcamFeed
              webcamRef={webcamRef}
              cameraOn={cameraOn}
              isRecording={isRecording}
              poseReady={poseReady}
              loadError={loadError}
              onRetryPose={retryPose}
              aiFeedback={aiFeedback}
              isAnalyzing={isAnalyzing}
              repCount={workoutMode === 'hold' ? Math.floor(holdSecs) : repCount}
              onCameraToggle={handleCameraToggle}
              landmarksRef={landmarksRef}
              onStartStop={handleStartStop}
              onAddRep={selfTracked ? handleAddRep : undefined}
              elapsedTime={formatTime(elapsedSecs)}
              tracking={tracking}
               trackingHint={trackingHint}
               onStreamReset={handleStreamReset}
               workoutLabel={resolved?.label ?? workoutType}
               workoutSub={`${resolved?.muscle ?? 'Full body'} · ${workoutMode === 'hold' ? `${holdTarget}s hold` : `${setTarget} sets × ${repTarget} reps`}`}
               target={workoutMode === 'hold' ? holdTarget : repTarget}
               setNumber={Math.min(completedSets + 1, setTarget)}
               setTarget={setTarget}
               paused={paused}
               onPauseToggle={handlePauseToggle}
               voiceEnabled={voiceEnabled}
               onVoiceToggle={handleVoiceToggle}
               dismissFullscreen={Boolean(summary || showEarlyExit || manualOpen)}
              hideRepCount
            />
            {isRecording && aiFeedback && aiFeedback !== 'Select Exercise & Start' && (
              <CorrectionBanner
                text={aiFeedback}
                warn={formStatus(biometrics.alignment, biometrics.symmetry) === 'adjust'}
                onOpen={() => { if (voiceEnabled) speak(aiFeedback, 0.95, 1.0); }}
              />
            )}
          </div>
        </div>
        {/* Rep status card — ring + form + target in one place */}
        <div className="px-[clamp(16px,3vw,32px)] max-w-7xl 2xl:max-w-[1400px] mx-auto w-full mt-3 sm:mt-4">
          <div className="glass-card border border-[var(--border-light)] rounded-3xl p-4 sm:p-5">
            <div className="flex flex-col min-[440px]:flex-row min-[440px]:items-center gap-4 sm:gap-5">
              <div className="flex justify-center min-[440px]:justify-start shrink-0">
                <RepProgressRing
                  value={workoutMode === 'hold' ? Math.floor(holdSecs) : repCount}
                  target={workoutMode === 'hold' ? holdTarget : repTarget}
                  label={workoutMode === 'hold' ? 'SECS' : `SET ${Math.min(completedSets + 1, setTarget)}/${setTarget}`}
                  size={112}
                />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[length:var(--fs-10)] font-black uppercase tracking-widest text-[var(--text-muted)] truncate">
                    {workoutMode === 'hold' ? `Hold target · ${resolved?.label ?? ''}` : `Rep target · ${resolved?.label ?? ''}`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 py-2.5">
                    <p className="text-[length:var(--fs-9)] font-bold uppercase tracking-widest text-[var(--text-muted)]">Alignment</p>
                    <p className="text-[length:var(--fs-13)] font-bold tabular-nums text-[var(--text-primary)] mt-0.5">
                      {biometrics.alignment > 0 ? `${Math.round(biometrics.alignment)}%` : '—'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 py-2.5">
                    <p className="text-[length:var(--fs-9)] font-bold uppercase tracking-widest text-[var(--text-muted)]">Tempo</p>
                    <p className="text-[length:var(--fs-13)] font-bold tabular-nums text-[var(--text-primary)] mt-0.5">
                      {workoutMode === 'hold'
                        ? formatTime(Math.floor(holdSecs))
                        : (repCount > 0 && elapsedSecs > 0 ? `${(elapsedSecs / repCount).toFixed(1)}s/rep` : '—')}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <FormStatusPill alignment={biometrics.alignment} symmetry={biometrics.symmetry} />
                </div>
              </div>
            </div>
            <p className="text-[length:var(--fs-10)] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-4 mb-2">{workoutMode === 'hold' ? 'Hold target' : 'Reps per set'}</p>
            {selfTracked && (
              <div className="flex items-center justify-between gap-3 my-3">
                <p className="text-xs text-[var(--text-muted)]">
                  Self-tracked reps · {formatTime(elapsedSecs)} elapsed. Automatic rep counting is unavailable for this exercise.
                </p>
                <button type="button" onClick={handleAddRep} disabled={!isRecording || paused}
                  className="shrink-0 min-h-[44px] px-4 rounded-xl bg-[var(--accent)] text-[var(--text-inverse)] font-bold disabled:opacity-40">
                  +1 rep
                </button>
              </div>
            )}
            {workoutMode === 'hold' ? (
              <div className="flex items-center gap-2 flex-wrap">
                {[30, 45, 60, 90].map((s) => (
                  <button key={s} onClick={() => setHoldTarget(s)} disabled={isRecording}
                    className={`px-4 py-2.5 min-h-[44px] rounded-xl text-[length:var(--fs-12)] font-bold border transition-all active:scale-95 ${holdTarget === s ? 'bg-[var(--accent)] text-[var(--text-inverse)] border-[var(--accent)]' : 'border-[var(--border-light)] text-[var(--text-muted)]'}`}>
                    {s}s
                  </button>
                ))}
                <input type="number" min={5} max={600} placeholder="Custom (s)" value={holdCustom}
                  disabled={isRecording}
                  onChange={(e) => {
                    setHoldCustom(e.target.value);
                    const v = Number(e.target.value);
                    if (Number.isFinite(v) && v >= 5 && v <= 600) setHoldTarget(Math.round(v));
                  }}
                  className="flex-1 min-w-[110px] h-12 min-h-[48px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-4 text-[length:var(--fs-16)] sm:text-[length:var(--fs-12)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {[5, 10, 15, 20].map((r) => (
                  <button key={r} onClick={() => { setRepTarget(r); setRepCustom(''); }} disabled={isRecording}
                    className={`px-4 py-2.5 min-h-[44px] rounded-xl text-[length:var(--fs-12)] font-bold border transition-all active:scale-95 ${repTarget === r ? 'bg-[var(--accent)] text-[var(--text-inverse)] border-[var(--accent)]' : 'border-[var(--border-light)] text-[var(--text-muted)]'}`}>
                    {r}
                  </button>
                ))}
                <input type="number" min={1} max={500} placeholder="Custom reps" value={repCustom}
                  disabled={isRecording}
                  onChange={(e) => {
                    setRepCustom(e.target.value);
                    const v = Number(e.target.value);
                    if (Number.isFinite(v) && v >= 1 && v <= 500) setRepTarget(Math.round(v));
                  }}
                  className="flex-1 min-w-[110px] h-12 min-h-[48px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-4 text-[length:var(--fs-16)] sm:text-[length:var(--fs-12)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
              </div>
            )}
            {workoutMode !== 'hold' && (
              <>
                <p className="text-[length:var(--fs-10)] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-4 mb-2">Sets</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((count) => (
                    <button key={count} onClick={() => { setSetTarget(count); setSetCustom(''); }} disabled={isRecording}
                      className={`px-4 py-2.5 min-h-[44px] rounded-xl text-[length:var(--fs-12)] font-bold border transition-all active:scale-95 ${setTarget === count ? 'bg-[var(--accent)] text-[var(--text-inverse)] border-[var(--accent)]' : 'border-[var(--border-light)] text-[var(--text-muted)]'}`}>
                      {count}
                    </button>
                  ))}
                  <input type="number" min={1} max={20} placeholder="Custom sets" value={setCustom}
                    disabled={isRecording}
                    onChange={(e) => {
                      setSetCustom(e.target.value);
                      const value = Number(e.target.value);
                      if (Number.isInteger(value) && value >= 1 && value <= 20) setSetTarget(value);
                    }}
                    className="flex-1 min-w-[110px] h-12 min-h-[48px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-4 text-[length:var(--fs-16)] sm:text-[length:var(--fs-12)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
                </div>
              </>
            )}
          </div>
        </div>

        <main className="p-4 sm:p-4 md:p-8 md:pt-4 pb-4 md:pb-6 max-w-7xl 2xl:max-w-[1400px] mx-auto w-full">
          <div className="flex flex-col gap-4 sm:gap-6">
            <RightPanel logs={logs} />
          </div>
        </main>
        {/* Mobile: float above the fixed BottomNav (12px offset + ~60px pill
            + gap), including the iOS home-indicator inset. Desktop: inline
            with breathing room under it, since app-main--flush drops padding. */}
        <div
          className="sticky md:static z-30 px-[clamp(16px,3vw,32px)] max-w-7xl 2xl:max-w-[1400px] mx-auto w-full pb-2 md:pb-10 md:pt-2"
          style={{ bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="glass-card border border-[var(--border-light)] rounded-3xl p-3 shadow-lg md:shadow-none md:bg-none md:border-0 md:p-0 md:rounded-none md:shadow-none">
            <SessionBottomBar
              isRecording={isRecording}
              paused={paused}
              cameraOn={cameraOn}
              onPauseToggle={handlePauseToggle}
              onStartStop={handleStartStop}
            />
          </div>
        </div>
        {/* Room for the fixed BottomNav so the bar never rests underneath it at page end. */}
        <div className="md:hidden" style={{ height: 'calc(84px + env(safe-area-inset-bottom, 0px))' }} aria-hidden="true" />
        <WorkoutSummary summary={summary} kcalBurned={sessionResult?.calories_burned ?? null} onDone={handleSummaryDone}>
          {challenge && challengeResult ? (
            <ChallengeResultCard challenge={challenge} result={challengeResult} />
          ) : null}
          {fromPlan?.planId && fromPlan?.dayNumber ? (
            <PlanDayRoutine planId={fromPlan.planId} dayNumber={fromPlan.dayNumber} phase="cooldown" defaultOpen />
          ) : null}
        </WorkoutSummary>
        <WorkoutFeedbackSheet logId={feedbackFor} onClose={handleFeedbackClose} />
        <UnlockCelebration suppressed={Boolean(isRecording || summary || feedbackFor)} />
        </>
        )}
      </div>
      </div>

      <style>{`
        @keyframes scan {
          0%   { top: 0%;   opacity: 0; }
          50%  {             opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </AppShell>
  );
};

export default CameraWorkout;
