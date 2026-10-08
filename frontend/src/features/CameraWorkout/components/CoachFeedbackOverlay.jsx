export default function CoachFeedbackOverlay({ aiFeedback, isAnalyzing, fullscreen = false }) {
  return (
    <div className={fullscreen
      // Fullscreen: below the top controls + scrim, full-width, above scrims
      ? "absolute top-16 left-3 right-3 z-40"
      : "absolute top-3 left-3 sm:top-6 sm:left-6 z-20 max-w-[calc(100%-6.5rem)] sm:max-w-[280px]"}>
      <div className="bg-[var(--bg-overlay)] backdrop-blur-xl p-3 sm:p-5 rounded-2xl border border-[var(--border-medium)] border-l-[var(--accent)] border-l-4 shadow-[var(--shadow-xl)]">
        <span className="text-[8px] sm:text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.2em] block mb-1 sm:mb-2">
          {isAnalyzing ? '⚡ Analyzing…' : 'Coach Response'}
        </span>
        <p className={`font-bold text-[var(--text-primary)] leading-relaxed line-clamp-3 ${fullscreen ? 'text-[13px] not-italic' : 'text-[10px] sm:text-[12px] italic'}`}>
          {`"${aiFeedback}"`}
        </p>
      </div>
    </div>
  );
}