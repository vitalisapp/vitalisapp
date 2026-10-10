import { useState, useRef, useEffect } from "react";
import Icon from "../../../components/Icon.jsx";
import CalendarPopup from "./CalendarPopup.jsx";
import { toLocalKey } from "../utils/dateKey.js";

const WEEK_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── SVG progress ring ──────────────────────────────────────────────────────
// NOTE: stroke colors go through `style`, not the `stroke` attribute —
// presentation attributes don't resolve var(), which rendered black rings.
export function MacroRing({ size = 120, stroke = 12, pct = 0, color = "var(--accent)", track = "var(--bg-hover)", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, Number(pct) || 0));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" style={{ stroke: track }} />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease", stroke: color }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

// ─── Header "Today" date picker (calendar popup + Today shortcut) ───────
export function TodayButton({ selectedDate, today, onDateChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const isToday = selectedDate === today;
  const label = isToday
    ? "Today"
    : (() => { const [y, m, d] = selectedDate.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); })();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Pick a date"
        aria-expanded={open}
        className="flex items-center gap-1.5 pl-3 pr-2.5 py-2 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)] text-[13px] font-bold"
      >
        <Icon name="calendar_month" className="text-[17px]" />
        {label}
        <Icon name="expand_more" className="text-[16px]" />
      </button>
      {open && (
        <CalendarPopup currentDate={selectedDate} today={today} onPick={(key) => { onDateChange(key); setOpen(false); }} />
      )}
    </div>
  );
}

// ─── Week strip (Mon–Sun, selected day filled) ────────────────────────────
export function WeekStrip({ selectedDate, onDateChange }) {
  const today = toLocalKey(new Date());
  const parseDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

  const sel = parseDate(selectedDate);
  const weekStart = new Date(sel);
  weekStart.setDate(sel.getDate() - sel.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const shiftWeek = (delta) => {
    const n = new Date(weekStart);
    n.setDate(n.getDate() + delta);
    if (delta > 0 && toLocalKey(n) > today) return;
    const key = toLocalKey(new Date(n.getFullYear(), n.getMonth(), n.getDate() + (sel.getDay())));
    onDateChange(key > today ? today : key);
  };
  const monthLabel = weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="glass-card rounded-2xl border border-[var(--border-light)] px-2 py-4">
      <div className="flex items-center justify-between px-2 mb-3">
        <button onClick={() => shiftWeek(-7)} aria-label="Previous week" className="w-9 h-9 rounded-full hover:bg-[var(--bg-hover)] flex items-center justify-center">
          <Icon name="chevron_left" className="text-[20px] text-[var(--text-primary)]" />
        </button>
        <p className="text-[14px] font-bold text-[var(--text-primary)]">{monthLabel}</p>
        <button onClick={() => shiftWeek(7)} aria-label="Next week" className="w-9 h-9 rounded-full hover:bg-[var(--bg-hover)] flex items-center justify-center disabled:opacity-30" disabled={toLocalKey(new Date(weekStart.getTime() + 7 * 864e5)) > today}>
          <Icon name="chevron_right" className="text-[20px] text-[var(--text-primary)]" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="tablist" aria-label="Week days">
        {days.map((d) => {
          const key = toLocalKey(d);
          const future = key > today;
          const isSel = key === selectedDate;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isSel}
              disabled={future}
              onClick={() => onDateChange(key)}
              className={`flex flex-col items-center gap-1 py-2 rounded-2xl transition-colors disabled:opacity-30 min-h-[64px] justify-center ${
                isSel ? "bg-[var(--accent-solid)]" : "hover:bg-[var(--bg-hover)]"
              }`}
            >
              <span className={`text-[10px] font-semibold ${isSel ? "text-[var(--accent-solid-fg)]" : "text-[var(--text-muted)]"}`}>
                {WEEK_LABELS[d.getDay()].slice(0, 3)}
              </span>
              <span className={`text-[14px] font-bold tabular-nums ${isSel ? "text-[var(--accent-solid-fg)]" : "text-[var(--text-primary)]"}`}>
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
