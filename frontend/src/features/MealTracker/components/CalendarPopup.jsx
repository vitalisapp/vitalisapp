import { useState } from "react";
import Icon from "../../../components/Icon.jsx";
import { toLocalKey, buildMonthGrid } from "../utils/dateKey.js";

// App-styled calendar dropdown (replaces the unstyled native picker popup).
export default function CalendarPopup({ currentDate, today, onPick }) {
  const [view, setView] = useState(() => {
    const [y, m] = currentDate.split('-').map(Number);
    return { y, m: m - 1 };
  });
  const now = new Date();
  const maxY = now.getFullYear();
  const maxM = now.getMonth();
  const canNext = view.y < maxY || (view.y === maxY && view.m < maxM);
  const shiftMonth = (delta) => setView((v) => {
    let y = v.y;
    let m = v.m + delta;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    if (y > maxY || (y === maxY && m > maxM)) return v;
    return { y, m };
  });
  const label = new Date(view.y, view.m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const pick = (day) => {
    const key = toLocalKey(new Date(view.y, view.m, day));
    if (key > today) return;
    onPick(key);
  };
  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[300px] max-w-[calc(100vw-2rem)] glass-card border border-[var(--border-light)] rounded-2xl p-4" role="dialog" aria-modal="true" aria-label="Choose date">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[14px] font-bold text-[var(--text-primary)]">{label}</p>
        <div className="flex gap-1">
          <button onClick={() => shiftMonth(-1)} aria-label="Previous month" className="w-9 h-9 rounded-full hover:bg-[var(--bg-hover)] flex items-center justify-center">
            <Icon name="chevron_left" className="text-[18px] text-[var(--text-primary)]" />
          </button>
          <button onClick={() => shiftMonth(1)} disabled={!canNext} aria-label="Next month" className={`w-9 h-9 rounded-full flex items-center justify-center ${canNext ? 'hover:bg-[var(--bg-hover)]' : 'opacity-30'}`}>
            <Icon name="chevron_right" className="text-[18px] text-[var(--text-primary)]" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] py-1">{d}</span>
        ))}
        {buildMonthGrid(view.y, view.m).map((day, i) => {
          if (day === null) return <span key={`b-${i}`} />;
          const key = toLocalKey(new Date(view.y, view.m, day));
          const future = key > today;
          const isSel = key === currentDate;
          const isToday = key === today;
          return (
            <button
              key={day}
              disabled={future}
              onClick={() => pick(day)}
              className={`h-9 w-9 mx-auto rounded-full text-[13px] font-semibold flex items-center justify-center transition-colors ${
                isSel
                  ? 'bg-[var(--accent)] text-[var(--text-inverse)]'
                  : future
                    ? 'text-[var(--text-muted)] opacity-30'
                    : isToday
                      ? 'ring-2 ring-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-light)]">
        <button
          onClick={() => { const [y, m] = currentDate.split('-').map(Number); setView({ y, m: m - 1 }); }}
          className="text-[12px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-2 py-2.5 min-h-[44px]"
        >
          Reset view
        </button>
        <button
          onClick={() => onPick(today)}
          className="text-[12px] font-bold text-[var(--accent)] hover:brightness-110 transition-all px-2 py-1"
        >
          Today
        </button>
      </div>
    </div>
  );
}
