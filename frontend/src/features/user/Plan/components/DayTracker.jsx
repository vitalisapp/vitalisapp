import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/Icon.jsx';
import { formatExerciseDetail, REST_ACTIVITY_TYPES } from '../utils/planFormat.js';
import ExerciseGuideModal from '../components/ExerciseGuideModal.jsx';
import { muscleFor, matchExercise, summarizeMuscles, suggestAlternatives } from '../utils/exerciseMatch.js';
import { fitDayToMinutes } from '../utils/sessionFit.js';
import PlanDayRoutine from './PlanDayRoutine.jsx';

// ── Module 5 — day-cycling schedule ──────────────────────────────────────────
// Maps training days across the user's preferred weekdays: training day #1 →
// first preferred day, #2 → second, cycling. Rest days are just rest.
const WEEKDAY_LETTERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function mapPlanSchedule(content, preferredDays) {
  const days = Array.isArray(preferredDays) ? preferredDays.filter((d) => Number.isInteger(d)) : [];
  if (days.length === 0 || !Array.isArray(content)) return {};
  const map = {};
  let trainIdx = 0;
  for (const day of content) {
    if (day == null) continue;
    if (REST_ACTIVITY_TYPES.has(day.activity_type)) {
      map[day.day_number] = { isRest: true };
      continue;
    }
    map[day.day_number] = { isRest: false, weekday: Number(days[trainIdx % days.length]) };
    trainIdx += 1;
  }
  return map;
}

// DAY TRACKER COMPONENT
const DayTracker = ({ plan = undefined, content = undefined, progress = undefined, onClose = undefined, onCompleteDay = undefined, prefs = undefined, onToggleExclude = undefined, startDay = null, startFit = null }) => {
  const [guideName, setGuideName] = useState(null);
  const excludedNames = prefs?.excludedExercises || [];
  const navigate = useNavigate();
  const completedDays = progress.filter(p => p.is_completed).map(p => p.day_number);
  const totalDays     = content.length;
  const currentDay    = content.find(d => !completedDays.includes(d.day_number)) || content[0];
  // A day unlocks only once every earlier day is cleared (first incomplete day
  // is the current one; everything after it is locked).
  const isLocked = (dayNumber) => content.some(
    (d) => d.day_number < dayNumber && !completedDays.includes(d.day_number)
  );
  const [activeDay,  setActiveDay]  = useState(
    (startDay && content.some((d) => d.day_number === startDay) && !isLocked(startDay))
      ? startDay
      : (currentDay?.day_number || 1)
  );
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeDayData = content.find(d => d.day_number === activeDay);
  const isDayComplete = completedDays.includes(activeDay);
  const progressPct   = totalDays > 0 ? Math.round((completedDays.length / totalDays) * 100) : 0;
  const isRestDay = REST_ACTIVITY_TYPES.has(activeDayData?.activity_type);

  // ── Module 5 — fit-to-minutes + alternatives state ─────────────────────────
  const [localFit,  setLocalFit]  = useState(0);       // 0 = full session
  const [altExName, setAltExName] = useState(null);    // alternatives sheet source
  const sessionMins = prefs?.sessionDurationMins ?? null;

  // Trimming is derived (never stored): a fresh budget recomputes safely.
  const trimmedPlan = useMemo(() => (
    localFit ? fitDayToMinutes(activeDayData, localFit) : null
  ), [activeDayData, localFit]);
  const plannedMins = trimmedPlan?.trimmed
    ? trimmedPlan.durationMins
    : (activeDayData?.duration_mins ?? null);
  const fitChoices = useMemo(() => {
    const base = Number(activeDayData?.duration_mins ?? 0);
    const presets = [20, 30, 45, 60];
    const allowed = base > 0 ? presets.filter((m) => m < base) : [];
    // Preselect the user's saved session length when a sensible preset exists.
    if (allowed.length && sessionMins && allowed.includes(Number(sessionMins))) return allowed;
    return allowed;
  }, [activeDayData, sessionMins]);

  useEffect(() => {
    // Reset per-day fit choice; auto-apply the saved session minutes once.
    // Section 4: a coach "lighter week" cap wins for the day it was opened on.
    const budget = startFit && activeDayData?.day_number === startDay ? startFit : sessionMins;
    setLocalFit(budget && Number(activeDayData?.duration_mins ?? 0) > budget ? budget : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDayData?.day_number, activeDayData?.duration_mins]);

  const altList = useMemo(() => (
    altExName ? suggestAlternatives(altExName, prefs?.equipment ?? []) : []
  ), [altExName, prefs]);

  const muscleTags = useMemo(() => summarizeMuscles(activeDayData?.exercises), [activeDayData]);

  const activeExercises = trimmedPlan?.trimmed ? trimmedPlan.exercises : activeDayData?.exercises;

  // Day-cycling schedule: which weekday each plan day is suggested on.
  const daySchedule = useMemo(() => mapPlanSchedule(content, prefs?.preferredDays), [content, prefs]);
  const todayWeekday = new Date().getDay();

  // First exercise of the day the camera can run (auto-selected on start).
  const firstMatch = (activeExercises || [])
    .map((ex) => matchExercise(ex?.name))
    .find((m) => m?.slug) || null;

  // EMPTY STATE
  if (totalDays === 0) {
    return (
      <div
        className="fixed inset-0 z-[110] flex flex-col"
        style={{ background: 'var(--bg-primary)', animation: 'fadeIn 0.25s ease' }}
      >
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon name="arrow_back" className="text-[length:var(--fs-18)]" />
            <span className="hidden min-[480px]:inline">Back to Plans</span>
          </button>
          <div className="text-center">
            <p className="text-[length:var(--fs-10)] uppercase font-black tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {plan.title}
            </p>
          </div>
          <div className="w-8 sm:w-[88px]" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border"
            style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
          >
            <Icon name="hourglass_empty" className="text-[length:var(--fs-24)] sm:text-[length:var(--fs-28)]" style={{ color: 'var(--accent)' }} fill={1} />
          </div>
          <p className="text-base sm:text-lg font-black" style={{ color: 'var(--text-primary)' }}>Schedule coming soon</p>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            "{plan.title}" doesn't have its daily content set up yet. Check back shortly.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2.5 rounded-lg font-bold text-sm"
            style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  const handleComplete = async () => {
    if (isDayComplete || completing || isLocked(activeDay)) return;
    setCompleting(true);
    await onCompleteDay(activeDay);
    setCompleting(false);
    const nextDay = content.find(d => d.day_number > activeDay && !completedDays.includes(d.day_number));
    if (nextDay) setTimeout(() => setActiveDay(nextDay.day_number), 400);
  };

  const handleStartWorkout = () => {
    if (!activeDayData || isLocked(activeDay)) return;
    // Auto-select the day's first exercise the camera can run (like a real
    // workout app) instead of dropping the user on the generic chooser.
    navigate('/workouts', {
      state: {
        ...(firstMatch ? { exerciseId: firstMatch.slug } : {}),
        fromPlan: {
          planId:       plan.id,
          planTitle:    plan.title,
          dayNumber:    activeDayData.day_number,
          dayTitle:     activeDayData.title,
          activityType: activeDayData.activity_type,
          description:  activeDayData.description,
          // Module 5: fit-to-minutes — the camera completion target follows
          // the trimmed session instead of the full plan day.
          durationMins: plannedMins ?? activeDayData.duration_mins,
        },
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col"
      style={{ background: 'var(--bg-primary)', animation: 'fadeIn 0.25s ease' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Icon name="arrow_back" className="text-[length:var(--fs-16)] sm:text-[length:var(--fs-18)]" />
          <span className="hidden min-[480px]:inline">Back to Plans</span>
        </button>
        <div className="text-center flex-1 px-2 min-w-0">
          <p className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] uppercase font-black tracking-widest truncate max-w-[140px] sm:max-w-none mx-auto" style={{ color: 'var(--text-muted)' }}>
            {plan.title}
          </p>
          <p className="text-[length:var(--fs-10)] sm:text-xs font-bold" style={{ color: 'var(--accent)' }}>
            {completedDays.length}/{totalDays} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right hidden min-[480px]:block shrink-0">
            <p className="text-base sm:text-lg font-black" style={{ color: 'var(--accent)' }}>{progressPct}%</p>
            <p className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Progress</p>
          </div>
          {/* Mobile sidebar toggle */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border"
            style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle day list"
          >
            <Icon name="calendar_view_week" className="text-[length:var(--fs-18)]" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 sm:h-1 w-full flex-shrink-0" style={{ background: 'var(--border-light)' }}>
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${progressPct}%`, background: 'var(--accent)' }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile day list overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-20"
            style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-64 overflow-y-auto"
              style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-light)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Days</p>
                <button onClick={() => setSidebarOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <Icon name="close" className="text-[length:var(--fs-18)]" />
                </button>
              </div>
              {content.map(day => {
                const done     = completedDays.includes(day.day_number);
                const isActive = day.day_number === activeDay;
                const locked   = isLocked(day.day_number);
                return (
                  <button
                    key={day.day_number}
                    disabled={locked}
                    aria-label={locked ? `Day ${day.day_number} locked — finish Day ${day.day_number - 1} first` : undefined}
                    onClick={() => { setActiveDay(day.day_number); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-l-2 disabled:cursor-not-allowed"
                    style={{
                      opacity:         locked ? 0.5 : 1,
                      background:      isActive ? 'var(--bg-active)' : 'transparent',
                      borderLeftColor: isActive ? 'var(--accent)'    : 'transparent',
                      color:           isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    <div
                      className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-black"
                      style={{
                        background: done ? 'var(--accent)' : isActive ? 'var(--accent-bg)' : 'var(--bg-hover)',
                        color:      done ? 'var(--text-inverse)'       : isActive ? 'var(--accent)'    : 'var(--text-muted)',
                      }}
                    >
                      {done ? <Icon name="check" className="text-[length:var(--fs-14)]" weight={700} /> : locked ? <Icon name="lock" className="text-[length:var(--fs-14)]" /> : day.day_number}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {day.title}
                      </p>
                      <p className="text-[length:var(--fs-10)]" style={{ color: 'var(--text-muted)' }}>
                        {day.duration_mins} mins
                        {(() => {
                          const s = daySchedule[day.day_number];
                          if (!s || s.isRest || !Number.isInteger(s.weekday)) return null;
                          const isToday = s.weekday === todayWeekday;
                          return (
                            <span style={{ color: isToday ? 'var(--accent)' : undefined, fontWeight: isToday ? 900 : undefined }}>
                            {' · '}{WEEKDAY_LETTERS[s.weekday]}{isToday ? ' · today' : ''}
                            </span>
                          );
                        })()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Desktop day list sidebar */}
        <div
          className="hidden md:flex w-20 lg:w-56 border-r overflow-y-auto flex-shrink-0 flex-col"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}
        >
          {content.map(day => {
            const done     = completedDays.includes(day.day_number);
            const isActive = day.day_number === activeDay;
            const locked   = isLocked(day.day_number);
            return (
              <button
                key={day.day_number}
                disabled={locked}
                title={locked ? `Locked — finish Day ${day.day_number - 1} first` : undefined}
                aria-label={locked ? `Day ${day.day_number} locked — finish Day ${day.day_number - 1} first` : undefined}
                onClick={() => setActiveDay(day.day_number)}
                className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 lg:py-3.5 text-left transition-all border-l-2 disabled:cursor-not-allowed"
                style={{
                  opacity:         locked ? 0.5 : 1,
                  background:      isActive ? 'var(--bg-active)' : 'transparent',
                  borderLeftColor: isActive ? 'var(--accent)'    : 'transparent',
                  color:           isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                <div
                  className="w-7 h-7 lg:w-8 lg:h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-black"
                  style={{
                    background: done ? 'var(--accent)' : isActive ? 'var(--accent-bg)' : 'var(--bg-hover)',
                    color:      done ? 'var(--text-inverse)'       : isActive ? 'var(--accent)'    : 'var(--text-muted)',
                  }}
                >
                  {done ? <Icon name="check" className="text-[length:var(--fs-12)] lg:text-[length:var(--fs-14)]" weight={700} /> : locked ? <Icon name="lock" className="text-[length:var(--fs-12)] lg:text-[length:var(--fs-14)]" /> : day.day_number}
                </div>
                <div className="hidden lg:block overflow-hidden">
                  <p className="text-xs font-bold truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {day.title}
                  </p>
                  <p className="text-[length:var(--fs-10)]" style={{ color: 'var(--text-muted)' }}>
                    {day.duration_mins} mins
                    {/* Module 5 — day-cycling schedule: suggested weekday */}
                    {(() => {
                      const s = daySchedule[day.day_number];
                      if (!s || s.isRest || !Number.isInteger(s.weekday)) return null;
                      const isToday = s.weekday === todayWeekday;
                      return (
                        <span style={{ color: isToday ? 'var(--accent)' : undefined, fontWeight: isToday ? 900 : undefined }}>
                          {' · '}{WEEKDAY_LETTERS[s.weekday]}{isToday ? ' · today' : ''}
                        </span>
                      );
                    })()}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {activeDayData && (
            <div className="max-w-2xl mx-auto" key={activeDay} style={{ animation: 'slideUp 0.2s ease' }}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] font-black uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border"
                  style={{ color: 'var(--accent)', background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
                >
                  Day {activeDayData.day_number}
                </span>
                <span
                  className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                  style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}
                >
                  {activeDayData.activity_type}
                </span>
                {isDayComplete && (
                  <span
                    className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] font-black uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border"
                    style={{ color: 'var(--success)', background: 'var(--success-bg)', borderColor: 'var(--success)' }}
                  >
                    ✓ Completed
                  </span>
                )}
                {/* Module 5 — day-cycling schedule chip */}
                {(() => {
                  const s = daySchedule[activeDayData.day_number];
                  if (!s || s.isRest || !Number.isInteger(s.weekday)) return null;
                  return (
                    <span
                      className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                      style={{ color: s.weekday === todayWeekday ? 'var(--accent)' : 'var(--text-muted)', background: 'var(--bg-hover)' }}
                    >
                      {s.weekday === todayWeekday ? 'Scheduled today' : `Usually ${WEEKDAY_LETTERS[s.weekday]}`}
                    </span>
                  );
                })()}
              </div>

              <h1 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
                {activeDayData.title}
              </h1>
              <p className="text-sm leading-relaxed mb-6 sm:mb-8" style={{ color: 'var(--text-muted)' }}>
                {activeDayData.description}
              </p>

              <div
                className="rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border flex-shrink-0"
                    style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
                  >
                    <Icon name="fitness_center" className="text-[length:var(--fs-18)] sm:text-[length:var(--fs-20)]" style={{ color: 'var(--accent)' }} fill={1} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[length:var(--fs-10)] sm:text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      Today's Session
                    </p>
                    <p className="text-xs sm:text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {activeDayData.activity_type}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                      {plannedMins ?? '–'}
                    </p>
                    <p className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>minutes</p>
                  </div>
                </div>

                {/* Module 5 — fit-to-minutes: user-declared capacity, never stored */}
                {!isRestDay && !isDayComplete && fitChoices.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[length:var(--fs-9)] font-black uppercase tracking-widest mr-1" style={{ color: 'var(--text-muted)' }}>
                      Have less time?
                    </span>
                    <button
                      onClick={() => setLocalFit(0)}
                      className="px-2.5 h-8 rounded-lg text-[length:var(--fs-10)] font-black border cursor-pointer transition-all"
                      style={{
                        background: !localFit ? 'var(--accent)' : 'var(--bg-hover)',
                        borderColor: !localFit ? 'var(--accent)' : 'var(--border-light)',
                        color: !localFit ? 'var(--text-inverse)' : 'var(--text-muted)',
                      }}
                    >
                      Full · {activeDayData.duration_mins}m
                    </button>
                    {fitChoices.map((m) => (
                      <button
                        key={m}
                        onClick={() => setLocalFit(m)}
                        className="px-2.5 h-8 rounded-lg text-[length:var(--fs-10)] font-black border cursor-pointer transition-all"
                        style={{
                          background: localFit === m ? 'var(--accent)' : 'var(--bg-hover)',
                          borderColor: localFit === m ? 'var(--accent)' : 'var(--border-light)',
                          color: localFit === m ? 'var(--text-inverse)' : 'var(--text-muted)',
                        }}
                      >
                        {m}m
                      </button>
                    ))}
                    {trimmedPlan?.trimmed && (
                      <span className="w-full text-[length:var(--fs-9)] font-bold mt-0.5" style={{ color: 'var(--accent)' }}>
                        Fit to {trimmedPlan.durationMins} min — {trimmedPlan.exercises.length} of {activeDayData.exercises.length} exercises
                        {trimmedPlan.reduced ? ' · sets capped at 2' : ''}
                        {trimmedPlan.dropped ? ` · ${trimmedPlan.dropped} dropped` : ''}
                      </span>
                    )}
                  </div>
                )}

                {/* Module 5 — muscle-group tags for scheduling awareness */}
                {muscleTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[length:var(--fs-9)] font-black uppercase tracking-widest mr-1" style={{ color: 'var(--text-muted)' }}>Focus:</span>
                    {muscleTags.map(({ tag, n }) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[length:var(--fs-9)] font-black uppercase tracking-widest border"
                        style={{ color: 'var(--accent)', background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}>
                        {tag}{n > 1 ? ` ×${n}` : ''}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-2 sm:space-y-3">
                  {activeExercises && activeExercises.length > 0 ? (
                    activeExercises.map((ex, idx) => {
                      const muscle = muscleFor(ex.name);
                      return (
                      <div
                        key={`${activeDayData.day_number}-${idx}`}
                        className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border"
                        style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}
                      >
                        <span className="text-[length:var(--fs-9)] sm:text-[length:var(--fs-10)] font-black w-5 sm:w-6 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <Icon name="fitness_center" className="text-[length:var(--fs-14)] sm:text-[length:var(--fs-16)] flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill={1} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                            <span className="truncate">{ex.name}</span>
                            {muscle && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[length:var(--fs-8)] font-black uppercase tracking-widest"
                                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                                {muscle}
                              </span>
                            )}
                          </p>
                          <p className="text-[length:var(--fs-10)] sm:text-[length:var(--fs-11)] truncate" style={{ color: 'var(--text-muted)' }}>{formatExerciseDetail(ex)}</p>
                        </div>
                        {/* Section 3 — written instructions + "don't recommend" */}
                        <button
                          onClick={() => setGuideName(ex.name)}
                          title={`How to do ${ex.name}`}
                          aria-label={`How to do ${ex.name}`}
                          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--bg-active)]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Icon name="menu_book" className="text-[length:var(--fs-16)]" />
                        </button>
                        {/* Module 5 — equipment-compatible alternatives (user's gear) */}
                        <button
                          onClick={() => setAltExName(ex.name)}
                          title={`Alternatives for ${ex.name}`}
                          aria-label={`Show alternatives for ${ex.name}`}
                          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-[var(--bg-active)]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Icon name="swap_horiz" className="text-[length:var(--fs-16)]" />
                        </button>
                      </div>
                      );
                    })
                  ) : (
                    <div
                      className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border"
                      style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}
                    >
                      <Icon name="info" className="text-[length:var(--fs-16)] flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-[length:var(--fs-11)]" style={{ color: 'var(--text-muted)' }}>
                        Exercise breakdown for this day hasn't been added yet — follow the description above for now.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Revision #3 — personalized warm-up before, cool-down once done */}
              {!isRestDay && plan?.id && (
                <div className="mb-3 sm:mb-4">
                  <PlanDayRoutine
                    key={`${activeDayData.day_number}-${isDayComplete ? 'cool' : 'warm'}`}
                    planId={plan.id}
                    dayNumber={activeDayData.day_number}
                    phase={isDayComplete ? 'cooldown' : 'warmup'}
                    doneLabel={isDayComplete ? 'Done' : 'Start workout'}
                    onFinished={isDayComplete ? undefined : handleStartWorkout}
                  />
                </div>
              )}

              <div className="flex flex-col min-[480px]:flex-row gap-2 sm:gap-3">
                {isDayComplete ? (
                  <button
                    disabled
                    className="flex-1 py-3.5 min-h-[48px] rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2"
                    style={{
                      background: 'var(--success-bg)',
                      color:      'var(--success)',
                      border:     '1px solid var(--success)',
                      cursor:     'default',
                    }}
                  >
                    <Icon name="verified" className="text-[length:var(--fs-18)] shrink-0" fill={1} /> Day Complete
                  </button>
                ) : isRestDay ? (
                  <>
                    {firstMatch && (
                      <button
                        onClick={handleStartWorkout}
                        className="flex-1 py-3.5 min-h-[48px] rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
                      >
                        <Icon name="play_circle" className="text-[length:var(--fs-18)] shrink-0" fill={1} /> Start Workout
                      </button>
                    )}
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="flex-1 py-3.5 min-h-[48px] rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2"
                    style={firstMatch
                      ? { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', opacity: completing ? 0.7 : 1 }
                      : { background: 'var(--accent)', color: 'var(--text-inverse)', opacity: completing ? 0.7 : 1 }}
                  >
                    {completing ? (
                      <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <><Icon name="check_circle" className="text-[length:var(--fs-18)] shrink-0" fill={1} /> Mark Complete</>
                    )}
                  </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartWorkout}
                    className="flex-1 py-3.5 min-h-[48px] rounded-xl font-black text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
                  >
                    <Icon name="play_circle" className="text-[length:var(--fs-18)] shrink-0" fill={1} /> Start Workout
                  </button>
                )}
              </div>

              {!isDayComplete && (
                <p className="text-center text-[length:var(--fs-10)] sm:text-[length:var(--fs-11)] mt-3 sm:mt-4" style={{ color: 'var(--text-muted)' }}>
                  {isRestDay
                    ? `${firstMatch ? 'Finish the session or mark it done' : 'Complete this day'} to unlock Day ${activeDayData.day_number + 1}`
                    : `Finish your workout session to automatically unlock Day ${activeDayData.day_number + 1}`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Module 5 — alternatives sheet: same muscle, user-compatible equipment */}
      <ExerciseGuideModal
        name={guideName}
        detail={(() => {
          const ex = (activeExercises || []).find((e) => e.name === guideName);
          return ex ? formatExerciseDetail(ex) : undefined;
        })()}
        onClose={() => setGuideName(null)}
        excluded={Boolean(guideName) && excludedNames.some((n) => n.toLowerCase() === String(guideName).toLowerCase())}
        onToggleExclude={onToggleExclude}
      />
      {altExName && (
        <div
          className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-4 overflow-y-auto"
          style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(6px)' }}
          onClick={() => setAltExName(null)}
          role="dialog" aria-modal="true" aria-label="Exercise alternatives"
        >
          <div
            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[85dvh] overflow-y-auto"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[length:var(--fs-9)] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Swap in</p>
              <button onClick={() => setAltExName(null)} aria-label="Close alternatives" style={{ color: 'var(--text-muted)' }}>
                <Icon name="close" className="text-[length:var(--fs-18)]" />
              </button>
            </div>
            <h3 className="text-base font-black mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{altExName}</h3>
            <p className="text-[length:var(--fs-10)] mb-4" style={{ color: 'var(--text-muted)' }}>
              Same muscle, matching your available equipment{prefs?.equipment?.length ? ` (${prefs.equipment.join(', ')})` : ' (bodyweight)'}.
            </p>
            {altList.length > 0 ? (
              <div className="flex flex-col gap-2">
                {altList.map((alt) => (
                  <div key={alt.slug} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{alt.name}</p>
                      <p className="text-[length:var(--fs-10)] truncate" style={{ color: 'var(--text-muted)' }}>
                        {alt.muscle} · {String(alt.equipment || '').replace(/_/g, ' ')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAltExName(null);
                        navigate('/workouts', { state: { exerciseId: alt.slug } });
                      }}
                      className="h-9 px-3 shrink-0 rounded-lg bg-[var(--accent)] text-[var(--text-inverse)] text-[length:var(--fs-9)] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Start
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-light)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>No equipment-compatible substitute found</p>
                <p className="text-[length:var(--fs-10)] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Update preferences with your gear, or browse the Exercise library tab.
                </p>
              </div>
            )}
            <p className="text-[length:var(--fs-9)] mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
              Swapping here starts the alternative directly — your plan stays unchanged.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayTracker;
