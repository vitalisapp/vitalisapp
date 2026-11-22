// AI coach cue over the camera feed.
// Media overlay: fixed dark glass + fixed light text so it stays legible over
// the video in BOTH themes (theme text colors flip dark in light mode).
export default function CoachFeedbackOverlay({ aiFeedback = undefined, isAnalyzing = undefined, fullscreen = false, voiceEnabled = undefined, onVoiceToggle = undefined }) {
  const message = aiFeedback || 'Get into position to begin your workout.';

  if (fullscreen) {
    return (
      <div className="relative mx-2 shrink-0 pointer-events-auto">
        <div style={{ background: 'rgba(36,40,33,.9)' }} className="relative overflow-hidden rounded-[20px] border border-white/12 backdrop-blur-md shadow-[var(--shadow-xl)] p-4 sm:p-5 pr-14 sm:pr-16">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#90ff45]" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-[#90ff45]">
              {isAnalyzing ? 'graphic_eq' : 'smart_toy'}
            </span>
            <span className="text-[11px] sm:text-sm font-bold uppercase tracking-[0.2em] text-[#90ff45]">
              {isAnalyzing ? 'Analyzing…' : 'Coach Response'}
            </span>
            {onVoiceToggle && <button onClick={onVoiceToggle} aria-label={voiceEnabled ? 'Mute coaching' : 'Enable voice coaching'} className="absolute right-2 top-1/2 -translate-y-1/2 min-w-11 min-h-11 text-[#90ff45] material-symbols-outlined">{voiceEnabled ? 'volume_up' : 'volume_off'}</button>}
          </div>
          <p style={{ fontSize: 'clamp(14px, 3.5vw, 20px)' }} className="mt-1.5 text-white leading-snug line-clamp-3 text-sm sm:text-xl">
            {message}
          </p>
        </div>
      </div>
    );
  }

  // Inline (non-fullscreen): compact, quiet card that leaves the feed visible.
  return (
    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 max-w-[calc(100%-6.5rem)] sm:max-w-[260px]" role="status" aria-live="polite">
      <div className="flex items-start gap-2.5 rounded-[14px] border border-white/10 bg-black/60 backdrop-blur-md shadow-[var(--shadow-md)] pl-3 pr-1.5 py-2">
        <span
          aria-hidden="true"
          className={`material-symbols-outlined mt-px text-[18px] text-[#90ff45] shrink-0 ${isAnalyzing ? 'animate-pulse motion-reduce:animate-none' : ''}`}
        >
          {isAnalyzing ? 'graphic_eq' : 'smart_toy'}
        </span>
        <div className="min-w-0 flex-1 py-px">
          <p className="text-[11px] font-medium leading-none text-white/60">
            {isAnalyzing ? 'Analyzing…' : 'Coach'}
          </p>
          <p className="mt-1 text-[12.5px] leading-snug text-white line-clamp-2">{message}</p>
        </div>
        {onVoiceToggle && (
          <button
            type="button"
            onClick={onVoiceToggle}
            aria-label={voiceEnabled ? 'Mute coaching' : 'Enable voice coaching'}
            className="shrink-0 w-8 h-8 pointer-coarse:w-10 pointer-coarse:h-10 -my-0.5 rounded-full inline-flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#90ff45]"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{voiceEnabled ? 'volume_up' : 'volume_off'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
