export default function CoachFeedbackOverlay({ aiFeedback, isAnalyzing, fullscreen = false, voiceEnabled, onVoiceToggle }) {
  return (
    <div className={fullscreen
      ? "relative mx-2 shrink-0 pointer-events-auto"
      : "absolute top-3 left-3 sm:top-6 sm:left-6 z-20 max-w-[calc(100%-6.5rem)] sm:max-w-[300px]"}>
      {/* Media overlay: fixed dark glass + fixed light text so it stays legible
          over the video feed in BOTH themes (theme text colors flip to dark in
          light mode and would vanish on a dark scrim). */}
      <div className={`relative overflow-hidden rounded-[20px] border border-white/12 bg-black/75 backdrop-blur-md shadow-[var(--shadow-xl)] ${fullscreen ? 'p-4 sm:p-5 pr-14 sm:pr-16' : 'p-3.5 sm:p-4'}`}>
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#90ff45]" />
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-[#90ff45]">
            {isAnalyzing ? 'graphic_eq' : 'smart_toy'}
          </span>
          <span className="text-[11px] sm:text-sm font-bold uppercase tracking-[0.2em] text-[#90ff45]">
            {isAnalyzing ? 'Analyzing…' : 'Coach Response'}
          </span>
          {onVoiceToggle && <button onClick={onVoiceToggle} aria-label={voiceEnabled ? 'Mute coaching' : 'Enable voice coaching'} className={`${fullscreen ? 'absolute right-2 top-1/2 -translate-y-1/2' : 'ml-auto'} min-w-11 min-h-11 text-[#90ff45] material-symbols-outlined`}>{voiceEnabled ? 'volume_up' : 'volume_off'}</button>}
        </div>
        <p className={`mt-1.5 text-white leading-snug line-clamp-3 ${fullscreen ? 'text-sm sm:text-xl' : 'text-[length:var(--fs-12)] sm:text-[length:var(--fs-13)]'}`}>
          {aiFeedback || 'Get into position to begin your workout.'}
        </p>
      </div>
    </div>
  );
}
