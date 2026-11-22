export default function PoseStatusBadge({ poseReady = undefined, loadError = undefined, onRetry = undefined }) {
  const label = loadError ? 'Load Failed' : poseReady ? 'Pose AI' : 'Loading model';
  const title = loadError
    ? 'Pose AI failed to load — tap to retry'
    : poseReady
      ? 'Pose AI ready'
      : 'Loading pose model (~15 MB, first load only)';
  const style = loadError
    ? 'bg-red-500/10 border-red-500/30 text-red-400'
    : poseReady
      ? 'bg-green-500/10 border-green-500/30 text-green-400'
      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
  const dotStyle = loadError ? 'bg-red-400' : poseReady ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse';
  const boxStyle = `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[length:var(--fs-8)] font-black uppercase tracking-widest backdrop-blur-md ${style}`;
  // Failure is actionable: the whole badge becomes the retry control so a
  // dead model never traps the session until a page reload.
  const clickable = loadError && typeof onRetry === 'function';

  const content = (
    <>
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle}`} />
      {/* Phones: dot only, so the coach card beside it keeps its text clear.
          From sm up there is room for the full status label. */}
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only sm:hidden">{label}</span>
    </>
  );

  return (
    <div className="absolute top-3 right-14 z-20" title={title} aria-label={title}>
      {clickable ? (
        <button type="button" onClick={onRetry} className={boxStyle} aria-label={title}>
          {content}
        </button>
      ) : (
        <div className={boxStyle}>{content}</div>
      )}
    </div>
  );
}
