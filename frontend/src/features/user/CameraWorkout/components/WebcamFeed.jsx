import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Icon from "../../../../components/Icon.jsx";
import { safeGet, safeSet } from "../../../../lib/storage.js";
import ScanLineOverlay from "./ScanLineOverlay.jsx";
import CameraOffPlaceholder from "./CameraOffPlaceholder.jsx";
import Webcam from "react-webcam";
import CoachFeedbackOverlay from "./CoachFeedbackOverlay.jsx";
import RepCounterOverlay from "./RepCounterOverlay.jsx";
import PoseStatusBadge from "./PoseStatusBadge.jsx";
import PoseSkeletonOverlay from "./PoseSkeletonOverlay.jsx";

const mobileConstraints  = {
  facingMode: 'user',
  width: { ideal: 720 },
  height: { ideal: 1280 },
  // Resolution ideals only: never ask the browser to crop the sensor image.
  resizeMode: 'none',
};
const desktopConstraints = {
  facingMode: 'user',
  width: { ideal: 1280 },
  height: { ideal: 720 },
  resizeMode: 'none',
};

// Viewport tracking: narrow screens get the portrait camera profile.
// Fullscreen stays in whatever orientation the user holds — no forced
// rotation, portrait camera keeps its complete frame visible on portrait screens.
function useViewport() {
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : true
  );
  useEffect(() => {
    const update = () => setIsNarrow(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return isNarrow;
}

export default function WebcamFeed({
  webcamRef,
  cameraOn,
  isRecording,
  poseReady,
  loadError,
  onRetryPose,
  aiFeedback,
  isAnalyzing,
  repCount,
  onCameraToggle,
  landmarksRef,
  onStartStop,
  onAddRep,
  elapsedTime,
  tracking = false,
  trackingHint = 'Fit your head, hands and feet in the frame',
  hideRepCount = false,
  workoutLabel, workoutSub, target, setNumber, setTarget,
  paused, onPauseToggle, voiceEnabled, onVoiceToggle, onStreamReset,
  dismissFullscreen = false,
}) {
  const isNarrow = useViewport();
  // fsMode: 'api' = Fullscreen API, 'css' = fixed-position fallback for
  // browsers without element fullscreen (iPhone Safari). null = windowed.
  const [fsMode, setFsMode] = useState(null);
  const isFullscreen = fsMode !== null;
  const [streamLive, setStreamLive] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const [facing, setFacing] = useState(() => safeGet('vitalis_facing', 'user') || 'user');
  const [actualFacing, setActualFacing] = useState(null);
  const containerRef = useRef(null);

  // getUserMedia is missing on HTTP origins and camera-less devices — without
  // this guard the UI hangs on "Starting camera…" forever with no recovery.
  const cameraSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  // Stable constraints: memoized so the stream only renegotiates when the
  // profile or lens actually changes (never on fullscreen toggle).
  const videoConstraints = useMemo(() => ({
    ...(isNarrow ? mobileConstraints : desktopConstraints),
    facingMode: { ideal: facing },
  }), [isNarrow, facing]);

  const flipCamera = useCallback(() => {
    onStreamReset?.();
    webcamRef.current?.stream?.getTracks().forEach(track => track.stop());
    setFacing((f) => {
      const next = f === 'user' ? 'environment' : 'user';
      safeSet('vitalis_facing', next);
      return next;
    });
    setStreamLive(false);
    setStreamError('');
  }, [onStreamReset, webcamRef]);

  const describeStreamError = (err) => {
    switch (err?.name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return 'Camera blocked — allow camera access in your browser, then tap Retry.';
      case 'NotFoundError':
      case 'OverconstrainedError':
        return 'No camera found on this device.';
      case 'NotReadableError':
        return 'Camera is in use by another app — close it and tap Retry.';
      default:
        return 'Could not start the camera. Check connection or tap Retry.';
    }
  };

  const enterFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
        setFsMode('api');
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
        setFsMode('api');
      } else {
        // No element fullscreen (iPhone Safari): pin the feed with CSS.
        setFsMode('css');
      }
    } catch (err) {
      if (import.meta.env.DEV) console.warn('Fullscreen failed:', err);
      // API request failed after all: fall back to CSS pinning so the
      // button never leaves a broken giant in-flow box.
      setFsMode('css');
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    try {
      if (fsMode === 'api') {
        if (document.exitFullscreen)            document.exitFullscreen();
        else if (/** @type {any} */ (document).webkitExitFullscreen) /** @type {any} */ (document).webkitExitFullscreen();
      }
    } catch { void 0; /* fullscreen exit unsupported — safe to ignore */ }
    setFsMode(null);
  }, [fsMode]);

  useEffect(() => {
    if (fsMode === 'css') {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [fsMode]);

  const toggleFullscreen = useCallback(() => {
    isFullscreen ? exitFullscreen() : enterFullscreen();
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  const handleTurnOn = useCallback(() => {
    setStreamLive(false);
    setStreamError('');
    onCameraToggle?.();
  }, [onCameraToggle]);

  const handleRetry = useCallback(() => {
    setStreamLive(false);
    setStreamError('');
    onStreamReset?.();
    setCameraAttempt(n => n + 1);
  }, [onStreamReset]);

  const feedLive = cameraOn && streamLive && !streamError;
  // Front camera behaves like a mirror; skeleton and video share orientation.
  const mirrored = (actualFacing ?? facing) === 'user';

  // A camera driver can retain zoom from another capture session. Contain-fit
  // cannot undo that sensor crop: reset the actual track, never scale the UI.
  useEffect(() => {
    if (!feedLive) return;
    const track = webcamRef.current?.video?.srcObject?.getVideoTracks?.()[0];
    if (!track?.applyConstraints) return;
    let active = true;
    const resetCapture = async () => {
      try {
        const caps = track.getCapabilities?.() ?? {};
        const constraints = {};
        if (caps.resizeMode?.includes('none')) {
          constraints.resizeMode = { exact: 'none' };
          // Prefer a native portrait mode only when capture cropping is disabled.
          // A landscape-only sensor is allowed to keep its complete frame.
          if (isNarrow) constraints.aspectRatio = { ideal: 3 / 4 };
        }
        if (Number.isFinite(caps.zoom?.min) && Number.isFinite(caps.zoom?.max)) {
          // Restore native 1x, or the nearest supported value. Do not assume
          // a phone exposes its ultrawide lens as a zoom setting.
          constraints.zoom = { exact: Math.max(caps.zoom.min, Math.min(1, caps.zoom.max)) };
        }
        if (!Object.keys(constraints).length) return;
        onStreamReset?.();
        await track.applyConstraints(constraints);
        if (active) onStreamReset?.();
      } catch {
        // Some drivers advertise controls they reject. Retain the live feed.
      }
    };
    resetCapture();
    return () => { active = false; };
  }, [feedLive, facing, cameraAttempt, isNarrow, onStreamReset, webcamRef]);

  useEffect(() => {
    if (!dismissFullscreen || !isFullscreen) return;
    const frame = requestAnimationFrame(exitFullscreen);
    return () => cancelAnimationFrame(frame);
  }, [dismissFullscreen, isFullscreen, exitFullscreen]);

  useEffect(() => {
    const onFSChange = () => {
      const fsEl = document.fullscreenElement || /** @type {any} */ (document).webkitFullscreenElement;
      if (!fsEl) {
        // System-gesture exit only applies to API mode; CSS mode exits
        // exclusively through our own Back button.
        setFsMode((m) => (m === 'api' ? null : m));
      }
    };
    document.addEventListener('fullscreenchange', onFSChange);
    document.addEventListener('webkitfullscreenchange', onFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFSChange);
      document.removeEventListener('webkitfullscreenchange', onFSChange);
    };
  }, []);

  // Collapsed banner (no live feed, not fullscreen): slim status card instead
  // of a tall dead camera box. Feed overlays (coach card, rep counter,
  // status badge, veils, fullscreen toggle) are gated behind !collapsed
  // below — they are absolutely positioned for the live feed and would
  // otherwise clip/overlap inside this slim banner (overflow-hidden).
  // Coach feedback is re-rendered in-flow so the message is never lost.
  const collapsed = !isFullscreen && !feedLive;
  const off = !cameraOn;

  const webcamEl = cameraOn && cameraSupported && (
    <Webcam
      key={`${facing}:${cameraAttempt}`}
      audio={false}
      ref={webcamRef}
      mirrored={mirrored}
      playsInline
      screenshotFormat="image/jpeg"
      videoConstraints={videoConstraints}
       style={{
         width: '100%',
         height: '100%',
         objectFit: 'contain',
         objectPosition: 'center',
         display: 'block',
         backgroundColor: isFullscreen ? 'transparent' : '#000',
       }}
        className={collapsed
          ? 'absolute bottom-0 right-0 w-px h-px opacity-0 pointer-events-none'
         : 'absolute inset-0 w-full h-full'}
      onUserMedia={(stream) => {
        const track = stream.getVideoTracks()[0];
        setActualFacing(track?.getSettings?.().facingMode || facing);
        setStreamLive(true);
        setStreamError('');
      }}
      onUserMediaError={(err) => {
        setStreamLive(false);
        onStreamReset?.();
        setStreamError(describeStreamError(err));
      }}
    />
  );

  // Single root (never unmounted): only the chrome switches between the
  // slim banner and the full feed, so the camera stream and pose engine
  // survive the collapsed → live transition without reconnecting.
  return (
    <div
      ref={containerRef}
      style={isFullscreen ? {
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        maxHeight: '100dvh',
        maxWidth: 'none',
        aspectRatio: 'auto',
        border: 0,
        zIndex: 200,
      } : undefined}
      className={collapsed
        ? 'col-span-1 lg:col-span-8 relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl px-4 py-3'
        : [
            'col-span-1 lg:col-span-8 relative bg-black overflow-hidden',
            'border border-[var(--border-light)] shadow-[var(--shadow-lg)]',
            fsMode === 'api'
              ? 'fixed inset-0 z-[200] w-screen h-[100dvh] max-h-[100dvh] rounded-none'
              : fsMode === 'css'
                ? 'fixed inset-0 z-[200] w-screen h-[100dvh] max-h-[100dvh] rounded-none'
                : 'rounded-2xl aspect-[3/4] sm:aspect-[4/5] md:aspect-video w-full',
          ].join(' ')}
    >
      {collapsed ? (
        <div className="w-full flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[var(--bg-hover)] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[length:var(--fs-20)] text-[var(--text-muted)]">
                {off ? 'videocam_off' : 'videocam'}
              </span>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[length:var(--fs-13)] font-bold text-[var(--text-primary)]">
                {!cameraSupported ? 'Camera not supported' : off ? 'Camera off' : 'Camera unavailable'}
              </p>
              <p className="text-[length:var(--fs-11)] text-[var(--text-muted)] truncate">
                {!cameraSupported
                  ? 'This browser or connection blocks camera access — use HTTPS on a device with a camera.'
                  : off
                    ? 'Turn it on for live rep counting'
                    : streamError
                      ? streamError
                      : loadError
                        ? 'Pose AI failed to load — tap Retry'
                        : !poseReady
                          ? 'Loading pose model…'
                          : !streamLive
                            ? 'Starting camera… allow access when asked.'
                            : 'Camera ready — step into frame.'}
              </p>
            </div>
            {cameraSupported && (
              <button
                onClick={off ? handleTurnOn : (loadError && onRetryPose ? onRetryPose : handleRetry)}
                className="shrink-0 px-4 py-2 min-h-[40px] rounded-full bg-[var(--accent)] text-[var(--text-inverse)] text-[length:var(--fs-12)] font-bold active:scale-95 transition-transform"
              >
                {off ? 'Turn on' : loadError ? 'Retry AI' : 'Retry'}
              </button>
            )}
          </div>
          {aiFeedback ? (
            <div className="border-t border-[var(--border-light)] pt-2.5 mt-1">
              <span className="text-[length:var(--fs-8)] font-black text-[var(--accent)] uppercase tracking-[0.2em] block mb-1.5">
                {isAnalyzing ? 'Analyzing…' : 'Coach'}
              </span>
              <p className="text-[length:var(--fs-12)] text-[var(--text-secondary)] leading-relaxed break-words bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-xl px-3 py-2.5">
                {aiFeedback}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          {!isFullscreen && <ScanLineOverlay isRecording={isRecording} cameraOn={cameraOn} />}
          <CameraOffPlaceholder cameraOn={cameraOn} onTurnOn={() => { setStreamLive(false); setStreamError(''); onCameraToggle?.(); }} />
        </>
      )}

      {webcamEl}


      {/* Skeleton tracker over the live feed */}
      {!collapsed && <PoseSkeletonOverlay landmarksRef={landmarksRef} webcamRef={webcamRef} mirrored={mirrored} />}

      {/* Framing guidance remains visible in both preview and fullscreen. */}
      {!collapsed && !isFullscreen && feedLive && !tracking && (
        <div className={`absolute inset-x-0 z-20 flex flex-col items-center gap-3 px-6 pointer-events-none text-center ${isFullscreen ? 'bottom-28' : 'top-1/2 -translate-y-1/2'}`}>
          <span className="w-16 h-16 rounded-2xl bg-[rgba(8,11,8,0.72)] border border-[var(--accent-border)] backdrop-blur-xl flex items-center justify-center shadow-[var(--shadow-lg)]">
            <span className="material-symbols-outlined text-[length:var(--fs-32)] text-[var(--accent)]">accessibility_new</span>
          </span>
          <div className="rounded-2xl bg-[rgba(8,11,8,0.72)] border border-white/12 backdrop-blur-xl px-4 py-2.5 shadow-[var(--shadow-lg)]">
            <p className="text-[length:var(--fs-13)] font-bold text-white">{trackingHint}</p>
             <p className="text-[length:var(--fs-11)] text-white/75 mt-0.5">Counting waits for reliable exercise landmarks</p>
          </div>
        </div>
      )}

      {/* Fullscreen — deliberately minimal: the feed is the interface.
          Only a slim glass top bar, one hint line and a compact control bar
          sit over the video. Neutral glass + fixed light text keeps it legible
          over any camera image in both light and dark theme. */}
      {isFullscreen && (
        <>
          <div className="absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-black/65 to-transparent pointer-events-none" />

          <div
            className="absolute inset-x-0 top-0 z-30 flex items-center gap-2 px-3 pb-2.5"
            style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}
          >
            <button
              onClick={exitFullscreen}
              aria-label="Back to workout"
              className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-transform active:scale-95"
            >
              <Icon name="arrow_back" className="text-xl" />
            </button>
            <div className="min-w-0 flex-1 px-0.5">
              <p className="truncate text-[13px] font-semibold leading-tight text-white">{workoutLabel}</p>
              <p className="truncate text-[11px] leading-tight text-white/65">{workoutSub}</p>
            </div>
            <button
              onClick={flipCamera}
              disabled={!feedLive}
              aria-label="Switch camera"
              className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-transform active:scale-95 disabled:opacity-40"
            >
              <Icon name="flip_camera_ios" className="text-lg" />
            </button>
            <button
              onClick={exitFullscreen}
              aria-label="Exit fullscreen"
              className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-transform active:scale-95"
            >
              <Icon name="fullscreen_exit" className="text-lg" />
            </button>
          </div>

          {/* One quiet line until the model finds a body — no cards, no HUD. */}
          {!tracking && (
            <p className="pointer-events-none absolute inset-x-0 top-[42%] z-30 mx-auto max-w-[290px] px-8 text-center text-[12.5px] leading-snug text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,.9)]">
              {trackingHint}
            </p>
          )}

          <div
            className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2 px-3 pt-6"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            {aiFeedback && aiFeedback !== 'Select Exercise & Start' && (
              <div className="pointer-events-auto flex w-full max-w-[420px] items-start gap-2 rounded-2xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-md">
                <span
                  aria-hidden="true"
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isAnalyzing ? 'animate-pulse' : ''}`}
                  style={{ background: 'var(--accent)' }}
                />
                <p className="line-clamp-2 flex-1 text-[12px] leading-snug text-white/90">{aiFeedback}</p>
                {onVoiceToggle && (
                  <button
                    onClick={onVoiceToggle}
                    aria-label={voiceEnabled ? 'Mute coaching' : 'Enable voice coaching'}
                    className="pointer-events-auto -my-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition-transform active:scale-95"
                  >
                    <Icon name={voiceEnabled ? 'volume_up' : 'volume_off'} className="text-base" />
                  </button>
                )}
              </div>
            )}

            {onAddRep && isRecording && (
              <div className="flex w-full max-w-[420px] justify-end">
                <button
                  type="button"
                  onClick={onAddRep}
                  disabled={paused}
                  className="pointer-events-auto rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md transition-transform active:scale-95 disabled:opacity-40"
                >
                  +1 rep · {elapsedTime}
                </button>
              </div>
            )}

            <div className="pointer-events-auto grid w-full max-w-[420px] grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-md">
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/55">
                  {workoutSub?.includes('hold') ? 'Seconds' : 'Reps'}
                </p>
                <p className="mt-0.5 text-xl font-semibold leading-none tabular-nums text-white">
                  {repCount}
                  <span className="ml-1 text-[12px] font-normal text-white/50">/ {target}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isRecording && (
                  <button
                    onClick={onPauseToggle}
                    aria-label={paused ? 'Resume workout' : 'Pause workout'}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-transform active:scale-95"
                  >
                    <Icon name={paused ? 'play_arrow' : 'pause'} className="text-lg" fill={1} />
                  </button>
                )}
                <button
                  onClick={onStartStop}
                  disabled={(!feedLive || !poseReady) && !isRecording}
                  aria-label={isRecording ? 'Stop workout' : 'Start workout'}
                  className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 disabled:opacity-40 ${
                    isRecording ? 'bg-[#ff3b30] text-white' : 'bg-[var(--accent)] text-[var(--text-inverse)]'
                  }`}
                >
                  {isRecording
                    ? <span className="h-5 w-5 rounded-[5px] bg-white" />
                    : <Icon name="play_arrow" className="text-2xl" fill={1} />}
                </button>
              </div>

              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-right backdrop-blur-md">
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/55">Set</p>
                <p className="mt-0.5 text-xl font-semibold leading-none tabular-nums text-white">
                  {setNumber}
                  <span className="ml-1 text-[12px] font-normal text-white/50">/ {setTarget}</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {cameraOn && !streamLive && !collapsed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6 text-center bg-black">
          <span className="material-symbols-outlined text-[length:var(--fs-36)] text-[var(--accent)] animate-pulse">videocam</span>
          <p className="text-[length:var(--fs-13)] font-bold text-white">
            {streamError || 'Starting camera… allow access when asked.'}
          </p>
          {streamError && (
            <button onClick={handleRetry}
              className="px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--text-inverse)] text-[length:var(--fs-12)] font-bold">
              Retry camera
            </button>
          )}
        </div>
      )}

      {loadError && !collapsed && (
        <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 bg-[var(--error-bg)] border border-[var(--error)]/30 pl-3 pr-1.5 py-1.5 rounded-xl">
          <p className="text-[length:var(--fs-9)] text-[var(--error)] font-bold uppercase tracking-widest">
            Pose AI failed to load
          </p>
          {onRetryPose && (
            <button
              type="button"
              onClick={onRetryPose}
              className="shrink-0 min-h-[28px] px-2.5 rounded-lg bg-[var(--error)] text-white text-[length:var(--fs-9)] font-black uppercase tracking-widest active:scale-95 transition-transform"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Live-feed overlays only — hidden in the collapsed banner (see above)
          where they would clip/overlap inside the slim overflow-hidden box. */}
      {!collapsed && !isFullscreen && <CoachFeedbackOverlay aiFeedback={!tracking ? trackingHint : aiFeedback} isAnalyzing={isAnalyzing} voiceEnabled={voiceEnabled} onVoiceToggle={onVoiceToggle} />}
      {!collapsed && !hideRepCount && <RepCounterOverlay repCount={repCount} />}
      {!collapsed && !isFullscreen && <PoseStatusBadge poseReady={poseReady} loadError={loadError} onRetry={onRetryPose} />}

      {/* Fullscreen toggle — live feed only */}
      {!collapsed && !isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-40 flex items-center justify-center w-9 h-9 rounded-xl bg-[rgba(8,11,8,0.72)] border border-white/15 shadow-[var(--shadow-md)] backdrop-blur-md active:scale-95 transition-transform touch-manipulation"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <Icon
            name={isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            className="text-white text-xl leading-none"
          />
        </button>
      )}

      {/* Front/back lens switch — tablets and phones without a usable
          front camera can still train with the rear lens. */}
      {cameraOn && streamLive && !isFullscreen && (
        <button
          onClick={flipCamera}
          aria-label={facing === 'user' ? 'Switch to back camera' : 'Switch to front camera'}
          className="absolute top-3 right-14 z-40 flex items-center justify-center w-9 h-9 rounded-xl bg-[rgba(8,11,8,0.72)] border border-white/15 shadow-[var(--shadow-md)] backdrop-blur-md active:scale-95 transition-transform touch-manipulation"
        >
          <Icon name="flip_camera_ios" className="text-white text-xl leading-none" />
        </button>
      )}


    </div>
  );
}
