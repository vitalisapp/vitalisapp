import { useState, useRef, useEffect } from 'react';

// ui/Dropdown — themed replacement for native <select>.
// The browser's select popup can't be sized or styled (renders a giant
// unthemed list); this popover stays anchored, capped, and scrollable.
export default function Dropdown({ label, value, onChange, options = [], allLabel = 'All', className = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.includes(value) ? value : '';

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  const pick = (v) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      {label && (
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-[var(--text-muted)]">{label}</p>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full h-11 rounded-2xl bg-[var(--bg-hover)] border px-3 flex items-center justify-between gap-2 text-[12px] font-semibold outline-none transition-colors touch-manipulation ${
          open
            ? 'border-[var(--accent)] text-[var(--text-primary)]'
            : 'border-[var(--border-light)] text-[var(--text-primary)]'
        }`}
      >
        <span className="truncate">{selected || allLabel}</span>
        <span className={`material-symbols-outlined text-[18px] text-[var(--text-muted)] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] rounded-2xl border border-[var(--border-medium)] glass-card shadow-[var(--shadow-lg)] overflow-hidden"
        >
          <div className="max-h-56 overflow-y-auto py-1.5">
            {[{ v: '', label: allLabel }, ...options.map((o) => ({ v: o, label: o }))].map((o) => {
              const active = (o.v || '') === (selected || '');
              return (
                <button
                  key={o.label + o.v}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => pick(o.v)}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 min-h-[44px] text-left text-[13px] transition-colors ${
                    active
                      ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-bold'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {active && <span className="material-symbols-outlined text-[16px] shrink-0">check</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
