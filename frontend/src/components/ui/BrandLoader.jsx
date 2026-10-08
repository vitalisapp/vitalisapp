const SIZES = {
  sm: 'w-24',
  md: 'w-36',
  lg: 'w-52',
};

// Brand loader — green lifter artwork (the PNG already carries real
// transparency: background pixels are A=0) + indeterminate loading bar,
// no text. Page-level moments only; tiny inline spinners stay CSS rings.
export default function BrandLoader({ size = 'md', message = 'Loading', className = '' }) {
  const width = SIZES[size] || SIZES.md;

  return (
    <div role="status" aria-busy="true" aria-live="polite" aria-label={message} className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <style>{`
        .vl-loadbar { position: relative; overflow: hidden; }
        .vl-loadbar::after {
          content: ''; position: absolute; inset: 0; width: 40%;
          border-radius: inherit; background: var(--accent);
          animation: vl-loadslide 1.1s ease-in-out infinite;
        }
        @keyframes vl-loadslide {
          0% { left: -40%; }
          100% { left: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vl-loadbar::after { animation: none; left: 0; width: 100%; opacity: 0.6; }
        }
      `}</style>
      <img
        src="/Loading_green.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className={`${width} h-auto block`}
      />
      <div className="vl-loadbar w-40 max-w-[60vw] h-1 rounded-full bg-[var(--bg-hover)]" aria-hidden="true" />
    </div>
  );
}
