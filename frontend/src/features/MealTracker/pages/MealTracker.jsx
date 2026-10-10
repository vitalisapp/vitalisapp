import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar, Topbar, BottomNav } from "../../../components/index.js";
import GlassAmbient from "../../../components/GlassAmbient.jsx";
import Icon from "../../../components/Icon.jsx";
import MacroCoachCard from "../components/MacroCoachCard.jsx";
import ScanResult from "../components/ScanResult.jsx";
import CameraScanner from "../components/CameraScanner.jsx";
import Button from "../../../components/ui/Button.jsx";
import Spinner from "../../../components/ui/Spinner.jsx";
import { useAuth } from "../../../hooks/useAuth.jsx";
import { useNutritionTracker } from "../hooks/useNutritionTracker.js";
import { apiGet } from "../../../lib/apiClient.js";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../components/feedback/ErrorState.jsx";
import LoadingState from "../../../components/feedback/LoadingState.jsx";
import { toLocalKey, buildMonthGrid } from "../utils/dateKey.js";

const FALLBACK_CALORIE_GOAL = 2000;
const FALLBACK_MACRO_TARGETS = { protein: 120, carbs: 200, fat: 60 };
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const EMPTY_FORM = { name: "", calories: "", protein: "", carbs: "", fat: "", mealType: "Breakfast", image_url: "" };

function SectionLabel({ text }) { return <p className="text-[10px] sm:text-xs font-semibold text-[var(--accent)] uppercase tracking-widest mb-3">{text}</p>; }
function InputField({ label, type = "text", placeholder, value, onChange, error, className = "" }) {
  const base = `w-full h-10 bg-[var(--bg-hover)] rounded-xl px-3 text-sm text-[var(--text-primary)] border outline-none focus:border-[var(--accent)]/50 transition-colors ${error ? "border-red-500/60" : "border-[var(--border-light)]"} ${className}`;
  return <div>{label && <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">{label}</label>}<input type={type} placeholder={placeholder} value={value} onChange={onChange} className={base} />{error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}</div>;
}
// Local YYYY-MM-DD key + month grid live in ../utils/dateKey.js (tested).

// App-styled calendar dropdown (replaces the unstyled native picker popup).
function CalendarPopup({ currentDate, today, onPick }) {
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

const WEEK_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MEAL_ICONS = { Breakfast: "bakery_dining", Lunch: "lunch_dining", Dinner: "dinner_dining", Snack: "cookie" };

// ─── SVG progress ring ──────────────────────────────────────────────────────
// NOTE: stroke colors go through `style`, not the `stroke` attribute —
// presentation attributes don't resolve var(), which rendered black rings.
function MacroRing({ size = 120, stroke = 12, pct = 0, color = "var(--accent)", track = "var(--bg-hover)", children }) {
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
function TodayButton({ selectedDate, today, onDateChange }) {
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
function WeekStrip({ selectedDate, onDateChange }) {
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
                isSel ? "bg-[var(--accent)]" : "hover:bg-[var(--bg-hover)]"
              }`}
            >
              <span className={`text-[10px] font-semibold ${isSel ? "text-[var(--text-inverse)]" : "text-[var(--text-muted)]"}`}>
                {WEEK_LABELS[d.getDay()].slice(0, 3)}
              </span>
              <span className={`text-[14px] font-bold tabular-nums ${isSel ? "text-[var(--text-inverse)]" : "text-[var(--text-primary)]"}`}>
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Log actions: Scan Meal (camera) + Add Manually rows. When a photo is
// picked, a slim preview row replaces the buttons until cleared.
function ScannerCard({ preview, isAnalyzing, onCamera, onManual, onClear }) {
  if (preview || isAnalyzing) {
    return (
      <div className="glass-card rounded-[24px] border border-[var(--border-light)] p-3 flex items-center gap-3">
        {preview ? (
          <img src={preview} alt="Meal to analyze" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
        ) : (
          <span className="w-14 h-14 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center shrink-0">
            <Icon name="image" className="text-[22px] text-[var(--text-muted)]" />
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {isAnalyzing ? "Analyzing…" : "Photo ready"}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] truncate">
            {isAnalyzing ? "Detecting foods in your photo" : "Results appear in the panel below"}
          </p>
        </div>
        {isAnalyzing && <Spinner className="w-5 h-5 shrink-0" />}
        <button onClick={onClear} aria-label="Clear photo" className="w-11 h-11 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0">
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>
    );
  }
  const actions = [
    { label: "Scan Meal", sub: "Use your camera to log food", icon: "photo_camera", primary: true, onPress: onCamera },
    { label: "Add Manually", sub: "Search or enter food", icon: "add", primary: false, onPress: onManual },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onPress}
          className={`flex items-center gap-3 p-4 rounded-2xl text-left transition-all active:scale-[0.99] ${
            a.primary
              ? "bg-[var(--accent)] text-[var(--text-inverse)] shadow-md hover:bg-[var(--accent-hover)]"
              : "glass-card border border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          }`}
        >
          <span className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${a.primary ? "bg-black/15" : "bg-[var(--accent-bg)]"}`}>
            <Icon name={a.icon} className={`text-[22px] ${a.primary ? "" : "text-[var(--accent)]"}`} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold leading-tight">{a.label}</span>
            <span className={`block text-[12px] leading-tight mt-0.5 ${a.primary ? "text-[var(--text-inverse)]/70" : "text-[var(--text-muted)]"}`}>{a.sub}</span>
          </span>
          <Icon name="chevron_right" className={`text-[20px] shrink-0 ${a.primary ? "text-[var(--text-inverse)]/70" : "text-[var(--text-muted)]"}`} />
        </button>
      ))}
    </div>
  );
}

// Single "Daily Goals" card — big calorie total + ring + remaining, then
// the three macros with rings, grams, and bars. All values real.
const MACRO_META = [
  { key: "protein", label: "Protein", icon: "restaurant", color: "var(--accent)" },
  { key: "carbs", label: "Carbs", icon: "bakery_dining", color: "#5BA4E6" },
  { key: "fat", label: "Fat", icon: "water_drop", color: "#9B7EDE" },
];
function DailyGoalsCard({ calories, goal, protein, proteinGoal, carbs, carbsGoal, fat, fatGoal }) {
  const kcalPct = goal > 0 ? Math.min(100, Math.round((calories / goal) * 100)) : 0;
  const remaining = Math.max(0, Math.round(goal - calories));
  const byKey = { protein: { actual: protein, target: proteinGoal }, carbs: { actual: carbs, target: carbsGoal }, fat: { actual: fat, target: fatGoal } };
  const minis = MACRO_META.map((m) => {
    const actual = byKey[m.key].actual;
    const target = byKey[m.key].target;
    return { ...m, actual, target, pct: target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0 };
  });
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl border border-[var(--border-light)] p-5">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[var(--text-muted)] font-semibold">Daily Calories</p>
            <p className="text-4xl font-black text-[var(--text-primary)] leading-none mt-1 tabular-nums">
              {Math.round(calories).toLocaleString()}
              <span className="text-[13px] font-semibold text-[var(--text-muted)]"> / {goal.toLocaleString()} kcal</span>
            </p>
            <div className="h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden mt-3">
              <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${kcalPct}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] font-bold text-[var(--accent)] tabular-nums">{kcalPct}%</span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Remaining <span className="font-bold text-[var(--text-primary)] tabular-nums">{remaining.toLocaleString()} kcal</span>
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <MacroRing size={104} stroke={12} pct={kcalPct} color="var(--accent)" track="var(--bg-hover)">
              <Icon name="restaurant" className="text-[28px] text-[var(--accent)]" />
            </MacroRing>
          </div>
        </div>
      </div>
      <div className="glass-card rounded-2xl border border-[var(--border-light)] p-5">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.14em] mb-4">Macronutrients</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {minis.map((m) => (
            <div key={m.label} className="flex flex-col items-center min-w-0">
              <MacroRing size={72} stroke={8} pct={m.pct} color={m.color} track="var(--bg-hover)">
                <span className="text-[12px] font-black text-[var(--text-primary)] tabular-nums">{m.pct}%</span>
              </MacroRing>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                <Icon name={m.icon} className="text-[14px] text-[var(--text-muted)]" />
                {m.label}
              </span>
              <span className="text-[12px] font-black text-[var(--text-primary)] tabular-nums mt-0.5">
                {Math.round(m.actual)} <span className="font-semibold text-[var(--text-muted)]">/ {m.target} g</span>
              </span>
              <span className="w-full h-1 rounded-full bg-[var(--bg-hover)] overflow-hidden mt-2">
                <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${m.pct}%`, background: m.color }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MealTracker() {  const { user } = useAuth();
  const userId = user?.id;
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { result, isAnalyzing, isLogging, history, historyLoading, historyError, loadHistory, toast, lastLoggedMeal, handleAnalyze, handleLog, handleLogSelected, toggleItem, scaleSelected, addCustomItem, clearResult, handleDeleteMeal } = useNutritionTracker(userId);
  const [preview, setPreview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [manualForm, setManualForm] = useState(EMPTY_FORM);
  const [manualError, setManualError] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => toLocalKey(new Date()));
  const fileRef = useRef(null);
  const [showScanner, setShowScanner] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  // Deep links from Quick Log: ?scan=1 opens the camera, ?manual=1 expands
  // the manual form. Consumed once so back-nav doesn't retrigger.
  useEffect(() => {
    if (searchParams.get("scan") === "1") {
      setShowScanner(true);
      searchParams.delete("scan");
      setSearchParams(searchParams, { replace: true });
    } else if (searchParams.get("manual") === "1") {
      setShowManual(true);
      searchParams.delete("manual");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Real goals: nutrient-goals API + active goal dailyKcal (fall back to constants offline).
  const [calorieGoal, setCalorieGoal] = useState(FALLBACK_CALORIE_GOAL);
  const [macroTargets, setMacroTargets] = useState(FALLBACK_MACRO_TARGETS);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    Promise.all([
      apiGet(`/api/nutrient-goals/${userId}`).catch(() => null),
      apiGet(`/api/goals/active/${userId}`).catch(() => null),
    ]).then(([ng, ag]) => {
      if (cancelled) return;
      const goals = ng?.goals || [];
      const find = (k) => { const g = goals.find((x) => x.nutrient === k); return g?.target_value != null ? Number(g.target_value) : null; };
      const kcal = find('CALORIES') ?? ag?.goal?.dailyKcal ?? FALLBACK_CALORIE_GOAL;
      setCalorieGoal(Number(kcal) || FALLBACK_CALORIE_GOAL);
      setMacroTargets({
        protein: find('PROTEIN') ?? ag?.goal?.proteinG ?? FALLBACK_MACRO_TARGETS.protein,
        carbs: find('CARBOHYDRATES') ?? ag?.goal?.carbsG ?? FALLBACK_MACRO_TARGETS.carbs,
        fat: find('FAT') ?? ag?.goal?.fatG ?? FALLBACK_MACRO_TARGETS.fat,
      });
    });
    return () => { cancelled = true; };
  }, [userId]);

  // Single pass over history for the selected day (was: one filter pass per macro).
  const dayStats = useMemo(() => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const items = [];
    for (const h of history) {
      if (!(h.logged_at || "").startsWith(selectedDate)) continue;
      items.push(h);
      totals.calories += Number(h.calories) || 0;
      totals.protein += Number(h.protein) || 0;
      totals.carbs += Number(h.carbs) || 0;
      totals.fat += Number(h.fat) || 0;
    }
    return { items, ...totals };
  }, [history, selectedDate]);
  const dayHistory = dayStats.items;
  const caloriesToday = dayStats.calories;
  const proteinToday = dayStats.protein;
  const carbsToday = dayStats.carbs;
  const fatToday = dayStats.fat;
  // Diary grouping: Breakfast → Lunch → Dinner → Snack → Other, each with a
  // kcal subtotal (MyFitnessPal-style instead of one flat wall of rows).
  const mealGroups = useMemo(() => {
    const order = [...MEAL_TYPES, "Other"];
    const norm = (m) => {
      const s = String(m.serving || "").trim().toLowerCase();
      const hit = MEAL_TYPES.find((t) => t.toLowerCase() === s);
      return hit || "Other";
    };
    return order
      .map((type) => {
        const items = dayHistory.filter((m) => norm(m) === type);
        if (items.length === 0) return null;
        return { type, items, kcal: items.reduce((s, m) => s + Number(m.calories || 0), 0) };
      })
      .filter(Boolean);
  }, [dayHistory]);
  const remainingKcal = Math.max(0, Math.round(calorieGoal - caloriesToday));

  const onFile = (e) => {
    if (isAnalyzing || isLogging) { e.target.value = ''; return; }
    const file = e.target.files?.[0];
    // Reset so picking the same photo twice still fires onChange
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result); handleAnalyze(reader.result); };
    reader.readAsDataURL(file);
  };

  const onScanCapture = (dataUrl) => {
    setShowScanner(false);
    if (!dataUrl) return;
    setPreview(dataUrl);
    handleAnalyze(dataUrl);
  };

  const handleManualSave = async () => {
    if (!manualForm.name.trim()) { setManualError("Meal name is required"); return; }
    setManualError("");
    await handleLog({ food_name: manualForm.name.trim(), serving: manualForm.mealType, calories: Number(manualForm.calories)||0, protein: Number(manualForm.protein)||0, carbs: Number(manualForm.carbs)||0, fat: Number(manualForm.fat)||0, image_url: manualForm.image_url || null });
    setManualForm(EMPTY_FORM); setShowManual(false);
  };

  const handleResultSave = async () => {
    await handleLogSelected(preview);
    setPreview(null);
  };

  const onDeleteMeal = async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    try { await handleDeleteMeal(id); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] overflow-x-hidden relative">
      <GlassAmbient />
      <div className="glass-content">
      <div className="hidden md:block"><Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} /></div>
      <Topbar sidebarExpanded={sidebarExpanded} />
      <main className={`pt-[56px] pb-20 md:pb-6 transition-all duration-200 ${sidebarExpanded ? 'md:ml-60' : 'md:ml-18'}`}>
        <div className="max-w-[1120px] mx-auto w-full px-4 pt-4 md:px-6 pb-6">
        <div className="flex flex-row items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-[var(--accent)] font-bold tracking-[0.2em] text-[10px] uppercase">Nutrition</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] truncate">Meal Tracker</h1>
            <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Fuel your goals. Track your progress.</p>
          </div>
          <TodayButton selectedDate={selectedDate} today={toLocalKey(new Date())} onDateChange={setSelectedDate} />
        </div>

        {/* Week strip */}
        <WeekStrip selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Daily goals (single card: calories + macros with grams) */}
        <div className="mt-4">
          <DailyGoalsCard
            calories={caloriesToday} goal={calorieGoal}
            protein={proteinToday} proteinGoal={macroTargets.protein}
            carbs={carbsToday} carbsGoal={macroTargets.carbs}
            fat={fatToday} fatGoal={macroTargets.fat}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {/* Scanner + manual entry */}
          <div className="space-y-4">
            <ScannerCard
              preview={preview}
              isAnalyzing={isAnalyzing}
              onCamera={() => setShowScanner(true)}
              onManual={() => setShowManual((v) => !v)}
              onClear={() => { clearResult(); setPreview(null); }}
            />
            {/* sr-only (not display:none): keeps the input tappable on mobile browsers */}
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onFile} />
            {showManual && (
            <div className="glass-card rounded-[24px] border border-[var(--border-light)] p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-[10px] sm:text-xs font-semibold text-[var(--accent)] uppercase tracking-widest">Manual Entry</p>
                <button onClick={() => { setShowManual(false); setManualError(""); }} aria-label="Close manual form" className="w-11 h-11 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0">
                  <Icon name="close" className="text-[16px]" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">Meal type</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {MEAL_TYPES.map((t) => {
                      const active = manualForm.mealType === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setManualForm((f) => ({ ...f, mealType: t }))}
                          aria-pressed={active}
                          className={`py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all min-w-0 truncate ${
                            active
                              ? "bg-[var(--accent)] text-[var(--text-inverse)] shadow-md"
                              : "bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <InputField label="Meal name" placeholder="e.g. Chicken adobo + rice" value={manualForm.name} onChange={e=>setManualForm({...manualForm, name:e.target.value})} error={manualError} />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Calories" type="number" placeholder="0" value={manualForm.calories} onChange={e=>setManualForm({...manualForm, calories:e.target.value})} />
                  <InputField label="Protein (g)" type="number" placeholder="0" value={manualForm.protein} onChange={e=>setManualForm({...manualForm, protein:e.target.value})} />
                  <InputField label="Carbs (g)" type="number" placeholder="0" value={manualForm.carbs} onChange={e=>setManualForm({...manualForm, carbs:e.target.value})} />
                  <InputField label="Fat (g)" type="number" placeholder="0" value={manualForm.fat} onChange={e=>setManualForm({...manualForm, fat:e.target.value})} />
                </div>
                <Button onClick={handleManualSave} loading={isLogging} disabled={isLogging || isAnalyzing} className="w-full">{isLogging ? 'Saving…' : `Save to ${manualForm.mealType}`}</Button>
              </div>
            </div>
            )}
          </div>

          {/* Result sheet (reference style) */}
          {result ? (
            <ScanResult
              result={result}
              isLogging={isLogging}
              onToggle={toggleItem}
              onScale={scaleSelected}
              onAddCustom={addCustomItem}
              onSave={handleResultSave}
              onRescan={() => fileRef.current?.click()}
              onClear={() => { clearResult(); setPreview(null); }}
            />
          ) : (
            <div className="space-y-4">
              <div className="glass-card rounded-[24px] border border-[var(--border-light)] p-5">
                <SectionLabel text="Result" />
                <p className="text-sm text-[var(--text-muted)] py-8 text-center">Upload a photo or log manually to see results.</p>
              </div>
              <MacroCoachCard userId={userId} lastMeal={lastLoggedMeal} />
            </div>
          )}
        </div>
        {result && (
          <div className="mt-4">
            <MacroCoachCard userId={userId} lastMeal={lastLoggedMeal} />
          </div>
        )}

        {/* History — diary grouped by meal, follows the selected calendar day */}
        <div className="mt-4 glass-card rounded-[24px] border border-[var(--border-light)] p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0"><SectionLabel text="Meal History" /></div>
            {dayHistory.length > 0 && (
              <p className="text-[11px] font-bold text-[var(--text-muted)] tabular-nums">
                {Math.round(caloriesToday)} of {calorieGoal} kcal · {remainingKcal} left
              </p>
            )}
          </div>
          {historyLoading ? <LoadingState message="Loading meal history…" /> : historyError ? <ErrorState message={historyError.message || 'Could not load meal history.'} onRetry={loadHistory} /> : dayHistory.length === 0 ? <EmptyState message="No meals logged for this day. Pick another date or log one above." /> : (
            <div className="space-y-5 max-h-[460px] overflow-auto pr-1">
              {mealGroups.map((g) => (
                <section key={g.type}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full bg-[var(--bg-hover)] flex items-center justify-center shrink-0">
                      <Icon name={MEAL_ICONS[g.type] || "restaurant"} className="text-[15px] text-[var(--text-muted)]" />
                    </span>
                    <h3 className="text-[13px] font-bold text-[var(--text-primary)]">{g.type}</h3>
                    <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                      {g.items.length} item{g.items.length > 1 ? "s" : ""}
                    </span>
                    <span className="ml-auto text-[13px] font-black tabular-nums text-[var(--text-primary)]">
                      {Math.round(g.kcal)} <span className="text-[10px] font-semibold text-[var(--text-muted)]">kcal</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    {g.items.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 bg-[var(--bg-hover)] rounded-2xl px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{m.food_name}</p>
                          <p className="text-[11px] text-[var(--text-muted)] tabular-nums mt-0.5">
                            P {Math.round(Number(m.protein) || 0)}g · C {Math.round(Number(m.carbs) || 0)}g · F {Math.round(Number(m.fat) || 0)}g
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-black tabular-nums text-[var(--text-primary)]">
                          {Math.round(Number(m.calories) || 0)}
                          <span className="text-[10px] font-semibold text-[var(--text-muted)] ml-0.5">kcal</span>
                        </span>
                        <button onClick={() => onDeleteMeal(m.id)} disabled={deletingId === m.id} aria-label={`Delete ${m.food_name}`} className="shrink-0 w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-light)] flex items-center justify-center hover:border-red-400/50 disabled:opacity-50">
                          {deletingId === m.id ? <Spinner className="w-4 h-4" /> : <Icon name="delete" className="text-[15px] text-red-400" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
        </div>
        {toast && <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm px-4 py-2 rounded-full shadow-lg z-[var(--z-toast)]">{toast}</div>}
        {showScanner && <CameraScanner onCapture={onScanCapture} onClose={() => setShowScanner(false)} />}
        <div className="md:hidden"><BottomNav variant="mealtracker" onManualLog={()=>setShowManual(true)} /></div>
      </main>
      </div>
    </div>
  );
}
