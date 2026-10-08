export default function RepCounterOverlay({ repCount }) {
  return (
    <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 z-20">
      <div className="text-right">
        <span className="text-[8px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] block mb-0.5 sm:mb-1">
          Total Reps
        </span>
        <span className="text-5xl sm:text-7xl md:text-8xl font-black text-[var(--accent)] tracking-tighter leading-none">
          {repCount.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}