import { useCallback, useEffect, useRef, useState } from 'react';

/** @typedef {{ Pose?: new (config: { locateFile?: (file: string) => string }) => any }} WindowWithPose */

// Pinned: mismatched pose.js/wasm versions break with Aborted(Assertion failed).
// Must equal the exact @mediapipe/pose version in package.json — the local
// copy lives at public/mediapipe/pose/<version>/ (scripts/copy-mediapipe.mjs).
const POSE_VERSION = '0.5.1675469404';

// Runtime sources, tried in order. Our own origin first: no third-party
// dependency, works on networks that block jsDelivr, and the service worker
// caches it. The CDN stays as a fallback for builds without the local copy.
const POSE_SOURCES = [
  `${import.meta.env.BASE_URL || '/'}mediapipe/pose/${POSE_VERSION}/`,
  `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${POSE_VERSION}/`,
];
// pose.js + wasm + model is ~10-15 MB on a cold cache. 40 s covers a slow
// phone; the old fixed 300 ms sample gave up before pose.js had finished.
const POSE_LOAD_TIMEOUT_MS = 40000;

// Lite model on weaker devices: the full model is ~2x the inference cost and
// is what made the preview stutter on budget phones/laptops. Lite keeps rep
// counting usable there; capable devices keep the more precise full model.
function pickModelComplexity() {
  if (typeof navigator === 'undefined') return 1;
  const nav = /** @type {Navigator & { deviceMemory?: number }} */ (navigator);
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
  const fewCores = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4;
  return lowMemory || fewCores ? 0 : 1;
}

// Shared across effect passes: React StrictMode mounts this twice, and the
// second pass must await the SAME load (and see the SAME failure) instead of
// racing its own copy. Cleared on failure so a retry can try again.
/** @type {Promise<string> | null} */
let poseLoadPromise = null;
/** Base URL whose pose.js defined window.Pose; its wasm/model must match. */
/** @type {string | null} */
let loadedBase = null;

/**
 * A missing static file on our origin still returns 200 + index.html (SPA
 * rewrite), so "did the request succeed" is not enough — check it is not HTML.
 * @param {string} base
 */
async function localCopyAvailable(base) {
  try {
    const res = await fetch(`${base}pose_web.binarypb`, { method: 'HEAD', cache: 'no-store' });
    return res.ok && !(res.headers.get('content-type') || '').includes('text/html');
  } catch {
    return false;
  }
}

/** @param {string} src */
function startScriptLoad(src) {
  return new Promise((resolve, reject) => {
    if (/** @type {WindowWithPose} */ (window).Pose) { resolve(undefined); return; }

    let settled = false;
    /** @type {HTMLScriptElement | null} */
    let added = null;
    /** @param {Error | null} err */
    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearInterval(poll);
      clearTimeout(timer);
      if (!err) { resolve(undefined); return; }
      // A tag that failed (or stalled) must not survive the attempt: the retry
      // path skips tags that already exist, so leaving it would make every
      // retry wait out the timeout instead of re-requesting the script.
      try { added?.remove(); } catch { /* detached */ }
      reject(err);
    };

    // A <script> tag already in the DOM is NOT a loaded script: the second
    // StrictMode pass used to count the tag as "loaded" and then sample once
    // 300 ms later, while pose.js was still downloading.
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement('script');
      s.src = src;
      s.crossOrigin = 'anonymous';
      s.addEventListener('error', () => finish(new Error(`Failed to load ${src}`)), { once: true });
      document.head.appendChild(s);
      added = s;
    }

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

/** @returns {Promise<string>} the base URL to load wasm/model files from */
async function loadFromFirstSource() {
  let lastErr = null;
  for (const [i, base] of POSE_SOURCES.entries()) {
    const isLocal = i === 0;
    if (isLocal && !(await localCopyAvailable(base))) continue;
    try {
      await startScriptLoad(`${base}pose.js`);
      return base;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('No MediaPipe Pose source available');
}

function loadMediaPipe() {
  if (/** @type {WindowWithPose} */ (window).Pose && loadedBase) return Promise.resolve(loadedBase);
  if (!poseLoadPromise) {
    poseLoadPromise = loadFromFirstSource().then((base) => {
      loadedBase = base;
      return base;
    }).catch((err) => {
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

  // Don't download/initialise the ~10-15 MB model until the camera is first
  // turned on — manual-only sessions never pay for it. Latched: once wanted it
  // stays loaded, so toggling the camera off/on doesn't re-initialise.
  // (Adjusting state during render is React's documented pattern for
  // deriving from a prop change; it re-renders before commit.)
  const [poseWanted, setPoseWanted] = useState(cameraOn);
  if (cameraOn && !poseWanted) setPoseWanted(true);

  useEffect(() => { onPoseResultRef.current = onPoseResult; }, [onPoseResult]);
  useEffect(() => { workoutTypeRef.current  = workoutType;  }, [workoutType]);

  useEffect(() => {
    if (!poseWanted) return undefined;
    let active = true;

    const init = async () => {
      try {
        const base = await loadMediaPipe();
        if (!active) return;

        const pose = new (/** @type {WindowWithPose} */ (window).Pose)({
          locateFile: (file) => `${base}${file}`,
        });
        pose.setOptions({
          modelComplexity:        pickModelComplexity(),
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

        // Warm-up inference on a blank frame. The first send() compiles the
        // WebGL shaders and allocates GPU buffers, which freezes the main
        // thread for a moment. Doing it here keeps that hitch behind the
        // loading overlay instead of stuttering the live preview. onResults
        // ignores it because inputRef is still null.
        try {
          const warm = document.createElement('canvas');
          warm.width = 256; warm.height = 256;
          warm.getContext('2d')?.fillRect(0, 0, 256, 256);
          await pose.send({ image: warm });
          await pose.reset?.();
        } catch { /* warm-up is best effort */ }
        if (!active) { await pose.close(); return; }

        poseRef.current = pose;
        if (active) { setLoadError(false); setPoseReady(true); }
      } catch (err) {
        if (import.meta.env.DEV) console.error('[usePoseEngine] init failed:', err);
        // Local wasm/model failed after pose.js loaded (e.g. blocked or
        // truncated deploy): point the retry at the CDN. Same pinned version,
        // so the already-defined window.Pose stays compatible.
        if (loadedBase === POSE_SOURCES[0]) loadedBase = POSE_SOURCES[1];
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
  }, [webcamRef, retryToken, poseWanted]);

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
