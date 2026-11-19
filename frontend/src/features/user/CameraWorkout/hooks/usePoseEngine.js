import { useCallback, useEffect, useRef, useState } from 'react';

/** @typedef {{ Pose?: new (config: { locateFile?: (file: string) => string }) => any }} WindowWithPose */

// Pinned: mismatched pose.js/wasm versions break with Aborted(Assertion failed).
const POSE_VERSION = '0.5.1675469404';
const POSE_SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js',
  `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${POSE_VERSION}/pose.js`,
];
// pose.js + wasm + model is ~15 MB on a cold cache. 40 s covers a slow phone;
// the old fixed 300 ms sample gave up before pose.js had even finished.
const POSE_LOAD_TIMEOUT_MS = 40000;

// Shared across effect passes: React StrictMode mounts this twice, and the
// second pass must await the SAME load (and see the SAME failure) instead of
// racing its own copy. Cleared on failure so a retry can try again.
/** @type {Promise<void> | null} */
let poseLoadPromise = null;

function startScriptLoad() {
  return new Promise((resolve, reject) => {
    if (/** @type {WindowWithPose} */ (window).Pose) { resolve(); return; }

    let settled = false;
    /** @type {HTMLScriptElement[]} */
    const added = [];
    /** @param {Error | null} err */
    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearInterval(poll);
      clearTimeout(timer);
      if (!err) { resolve(); return; }
      // A tag that failed (or stalled) must not survive the attempt: the retry
      // path skips tags that already exist, so leaving it would make every
      // retry wait out the timeout instead of re-requesting the script.
      added.forEach((el) => { try { el.remove(); } catch { /* detached */ } });
      reject(err);
    };

    // A <script> tag already in the DOM is NOT a loaded script: the second
    // StrictMode pass used to count the tag as "loaded" and then sample once
    // 300 ms later, while pose.js was still downloading.
    POSE_SCRIPTS.forEach((src) => {
      if (document.querySelector(`script[src="${src}"]`)) return;
      const s = document.createElement('script');
      s.src = src;
      s.crossOrigin = 'anonymous';
      s.addEventListener('error', () => finish(new Error(`Failed to load ${src}`)), { once: true });
      document.head.appendChild(s);
      added.push(s);
    });

    // Poll for the real global. Covers tags owned by another pass and retries
    // where the scripts are cached and only the model needs re-initialising.
    const poll = setInterval(() => {
      if (/** @type {WindowWithPose} */ (window).Pose) finish(null);
    }, 50);
    const timer = setTimeout(
      () => finish(new Error('window.Pose not found after script load')),
      POSE_LOAD_TIMEOUT_MS,
    );
  });
}

function loadMediaPipe() {
  if (/** @type {WindowWithPose} */ (window).Pose) return Promise.resolve();
  if (!poseLoadPromise) {
    poseLoadPromise = startScriptLoad().catch((err) => {
      poseLoadPromise = null;
      throw err;
    });
  }
  return poseLoadPromise;
}

/**
 * @param {{ cameraOn: boolean, webcamRef: { current?: { video?: HTMLVideoElement | null } | null }, onPoseResult: Function, workoutType: unknown }} params
 */
export function usePoseEngine({
  cameraOn,
  webcamRef,
  onPoseResult,
  workoutType,
}) {
  const [poseReady, setPoseReady]     = useState(false);
  const [loadError, setLoadError]     = useState(false);
  // Bumping this re-runs the init effect — the only way out of a failed load
  // without a full page reload.
  const [retryToken, setRetryToken]   = useState(0);
  const poseRef         = useRef(null);
  const onPoseResultRef = useRef(onPoseResult);
  const workoutTypeRef  = useRef(workoutType);
  const noDetectRef     = useRef(0);
  const inputRef = useRef(null);

  useEffect(() => { onPoseResultRef.current = onPoseResult; }, [onPoseResult]);
  useEffect(() => { workoutTypeRef.current  = workoutType;  }, [workoutType]);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        await loadMediaPipe();
        if (!active) return;

        const pose = new (/** @type {WindowWithPose} */ (window).Pose)({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${POSE_VERSION}/${file}`,
        });
        pose.setOptions({
          modelComplexity:        1,
          smoothLandmarks:        true,
          enableSegmentation:     false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence:  0.5,
        });

        pose.onResults((results) => {
          if (!active) return;
          const input = inputRef.current;
          const video = webcamRef.current?.video;
          if (!input || video !== input.video || video.srcObject !== input.stream || !input.stream?.active) return;

          if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
            noDetectRef.current += 1;
            onPoseResultRef.current(null, workoutTypeRef.current, null);
            return;
          }

          noDetectRef.current = 0;
          onPoseResultRef.current(results.poseLandmarks, workoutTypeRef.current, results.poseWorldLandmarks);
        });

        await pose.initialize();
        if (!active) { await pose.close(); return; }

        poseRef.current = pose;
        if (active) { setLoadError(false); setPoseReady(true); }
      } catch (err) {
        if (import.meta.env.DEV) console.error('[usePoseEngine] init failed:', err);
        if (active) setLoadError(true);
      }
    };

    init();

    return () => {
      active = false;
      try {
        const p = poseRef.current?.close?.();
        if (p?.catch) p.catch(() => {});
      } catch { /* unmount — best effort */ }
      poseRef.current = null;
      setPoseReady(false);
    };
  }, [webcamRef, retryToken]);

  // Recovery path for a failed model load. Pose scripts stay cached in the
  // DOM, so a retry is fast — it re-runs initialize(), not the 15 MB download.
  const retryPose = useCallback(() => {
    setLoadError(false);
    setPoseReady(false);
    setRetryToken((n) => n + 1);
  }, []);

  // Live skeleton during preview too; counting stays gated on isRecording.
  useEffect(() => {
    if (!cameraOn || !poseReady) return;

    // One inference at a time. The 100ms interval is faster than the model
    // on low-end laptops; without this guard sends queue up and the preview
    // stutters while MediaPipe burns CPU on stale frames.
    let inFlight = false;
    const sendFrame = async () => {
      if (inFlight) return;
      const video = webcamRef.current?.video;
      if (!poseRef.current || !video || video.readyState < 2 || video.paused || video.videoWidth === 0 || !video.srcObject?.active) {
        inputRef.current = null;
        onPoseResultRef.current(null, workoutTypeRef.current, null);
        return;
      }
      inFlight = true;
      try {
        if (inputRef.current?.stream !== video.srcObject) {
          onPoseResultRef.current(null, workoutTypeRef.current, null);
          await poseRef.current.reset();
        }
        inputRef.current = { video, stream: video.srcObject };
        await poseRef.current.send({ image: video });
      } catch {
        onPoseResultRef.current(null, workoutTypeRef.current, null);
      } finally {
        inFlight = false;
      }
    };

    const id = setInterval(sendFrame, 100);
    return () => { clearInterval(id); inputRef.current = null; };
  }, [cameraOn, poseReady, webcamRef]);

  return { poseReady, loadError, retryPose };
}
