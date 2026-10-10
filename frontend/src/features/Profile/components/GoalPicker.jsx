import { useState, useEffect } from 'react';
import { GOAL_TYPES } from '../../Onboarding/constants/goals.js';

const GoalPicker = ({ value, disabled, onPick }) => {  const [open, setOpen] = useState(false);
  const current = GOAL_TYPES.find((g) => g.key === value) || null;
  const isOpen = open && !disabled;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        id="pf-goal"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setOpen((v) => !v)}
        className="mt-1 w-full h-12 min-h-[48px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 flex items-center gap-3 text-left outline-none focus:border-[var(--accent)] disabled:opacity-60 transition-colors"
      >
        {current ? (
          <>
            <span className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[var(--accent)]">{current.icon}</span>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-bold text-[var(--text-primary)] truncate">{current.label}</span>
              <span className="block text-[10px] text-[var(--text-muted)] truncate">{current.desc}</span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-[13px] text-[var(--text-muted)]">Select your goal</span>
        )}
        <span className={`material-symbols-outlined text-[20px] shrink-0 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="listbox" aria-label="Choose your goal" className="absolute z-50 left-0 right-0 mt-2 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-card)] shadow-xl overflow-hidden">
            <div className="max-h-[280px] overflow-y-auto p-1.5 space-y-1">
              {GOAL_TYPES.map((g) => {
                const selected = g.key === value;
                return (
                  <button
                    key={g.key}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setOpen(false);
                      onPick(g.key);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${selected ? 'bg-[var(--accent-bg)] border border-[var(--accent-border)]' : 'border border-transparent hover:bg-[var(--bg-hover)]'}`}
                  >
                    <span className="w-9 h-9 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[var(--accent)]">{g.icon}</span>
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-bold text-[var(--text-primary)]">{g.label}</span>
                      <span className="block text-[11px] text-[var(--text-muted)] leading-snug">{g.desc}</span>
                    </span>
                    {selected && <span className="material-symbols-outlined text-[18px] shrink-0 text-[var(--accent)]">check_circle</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GoalPicker;
