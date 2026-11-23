import BrandLoader from '../ui/BrandLoader.jsx';

export default function LoadingState({ message='Loading...' }) {
  return <div role="status" aria-busy="true" aria-live="polite" className="flex flex-col items-center justify-center py-12"><BrandLoader size="sm" message={message} /></div>;
}

// The ONE full-screen loader (app boot, lazy route chunks, auth guards).
// Every full-page wait renders this same markup so the loader never jumps
// size between stages; in-page waits use skeletons instead.
export function FullPageLoader({ message = 'Loading Vitalis…' }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-[var(--bg-primary)]" role="status" aria-busy="true" aria-live="polite">
      <BrandLoader size="lg" message={message} />
      <div className="w-48 max-w-[60vw] space-y-2" aria-hidden="true">
        <div className="h-2 rounded-full bg-[var(--bg-hover)] animate-pulse" />
        <div className="h-2 rounded-full bg-[var(--bg-hover)] animate-pulse w-3/4 mx-auto" />
      </div>
    </div>
  );
}
