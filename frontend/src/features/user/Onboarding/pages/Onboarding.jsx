import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars -- false positive: `motion` is used as <motion.*> JSX namespace below
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useAuth } from '../../../../hooks/useAuth.jsx';
import Icon from '../../../../components/Icon.jsx';
import { apiFetch, apiPost } from '../../../../lib/apiClient.js';
import { safeSet, safeSetJSON, safeGetJSON } from '../../../../lib/storage.js';
import {
  GOAL_TYPES, ACTIVITY_LEVELS, PACES, FOCUSES,
  SLEEP_QUALITY, STRESS_LEVELS, EXERCISE_FREQ, RECOVERY_LEVELS,
  goalLabel, humanizeOption,
} from '../constants/goals.js';
import '../Onboarding.css';

const TOTAL_STEPS = 8;

const calcBmi = (hCm, wKg) => {
  const h = Number(hCm) / 100;
  const w = Number(wKg);
  if (!h || !w || h <= 0) return null;
  return Number((w / (h * h)).toFixed(1));
};

const bmiCategory = (bmi) => {
  if (bmi == null) return '—';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy range';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// Common allergens offered as toggle chips; "Something else?" adds free text.
const ALLERGEN_PRESETS = ['Gluten', 'Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Fish', 'Shellfish', 'Soy', 'Sesame'];

const TITLES = [
  "Let's start with you.",
  'What moves you forward?',
  'Make your goal your own.',
  'Find your everyday rhythm.',
  'Training that fits your life.',
  'Good progress starts with balance.',
  'Putting it all together.',
  'A fresh start, made for you.',
];

const STEP_LABELS = ['The basics', 'Your goal', 'The details', 'Daily activity', 'Training setup', 'Your wellbeing', 'Creating your plan', 'Ready to begin'];
const STEP_DESCRIPTIONS = [
  'A few details help us find the right starting point for your body.',
  'Choose your main focus. We’ll build your starting plan around it.',
  'Set a direction that feels right. You can adjust it as you go.',
  'Think about a typical week, including work, movement and exercise.',
  'Your space, your schedule, your pace. Every preference here is optional.',
  'Help us understand your sleep, energy and recovery.',
  'Turning your answers into your personal starting targets.',
  'Here’s your starting point. Your plan evolves as you build your routine.',
];
const SETUP_PHASES = [
  { title: 'Your foundation', description: 'A little about you', start: 0, end: 0, icon: 'person' },
  { title: 'Your direction', description: 'Goals & daily movement', start: 1, end: 3, icon: 'flag' },
  { title: 'Your routine', description: 'Training & wellbeing', start: 4, end: 5, icon: 'fitness_center' },
  { title: 'Your personal plan', description: 'Bring it all together', start: 6, end: 7, icon: 'auto_awesome' },
];

// Module 3 — Training setup step mirrors trainingPreferences exactly (same
// canonical labels as backend EQUIPMENT_OPTIONS), so what onboarding saves is
// what the Plans-page preferences sheet later shows.
const EQUIPMENT_CHOICES = ['Bodyweight', 'Dumbbells', 'Barbell', 'Kettlebell', 'Resistance Bands', 'Machines', 'Pull-up Bar', 'Cardio Equipment'];
const LOCATION_CHOICES = ['Home', 'Gym', 'Outdoor', 'BFP Office', 'Other'];
const SESSION_MINS_CHOICES = [20, 30, 45, 60];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Chip = ({ active, onClick, children, label = undefined }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={Boolean(active)}
    aria-label={label}
    className={`onb-chip${active ? ' is-selected' : ''}`}
  >
    <Icon name="check" className="onb-chip__check" />
    <span>{children}</span>
  </button>
);

const ChoiceCard = ({ active, onClick, icon, title, description }) => (
  <button
    type="button"
    aria-pressed={Boolean(active)}
    onClick={onClick}
    className={`onb-choice${active ? ' is-selected' : ''}`}
  >
    <span className="onb-choice__icon" aria-hidden="true">
      <Icon name={icon} />
    </span>
    <span className="onb-choice__copy">
      <span className="onb-choice__title">{title}</span>
      {description && <span className="onb-choice__desc">{description}</span>}
    </span>
    <span className="onb-choice__indicator" aria-hidden="true">
      {active ? <Icon name="check" /> : <span />}
    </span>
  </button>
);

// Eight screens, not nine: BMI previews inline on "About you" and optional
// allergies share the lifestyle screen. Training setup (Module 3) gets its
// own screen — equipment/days/minutes/location feed both the generated
// starter plan and every later adaptive recommendation. Skippable; gate re-prompts.
const Onboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // `?edit=1` = explicit re-entry from Profile (e.g. a user who skipped).
  // In edit mode we never auto-bounce, so the wizard can be finished later.
  const editMode = searchParams.get('edit') === '1';
  const { user, loading, refreshAuth } = useAuth();
  const [step, setStep] = useState(0);

  // Step 1 — About you
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  // Step 3 — Goal
  const [goalType, setGoalType] = useState('');
  // Step 4 — Details
  const [targetWeight, setTargetWeight] = useState('');
  const [pace, setPace] = useState('');
  const [focus, setFocus] = useState('');
  // Step 5 — Activity
  const [activityLevel, setActivityLevel] = useState('');
  // Step 6 — Lifestyle
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('MODERATE');
  const [stressLevel, setStressLevel] = useState('MODERATE');
  const [exerciseFreq, setExerciseFreq] = useState('1_2_DAYS');
  const [recoveryLevel, setRecoveryLevel] = useState('MODERATE');
  // Step 5 — Training setup (Module 3): optional; saved into
  // training_preferences so the generated starter plan matches reality
  // (plan length, day-cycling schedule, exercise swaps).
  const [trainingEquipment, setTrainingEquipment] = useState(/** @type {string[]} */ ([]));
  const [prefDays, setPrefDays] = useState(/** @type {number[]} */ ([]));
  const [sessionMins, setSessionMins] = useState(30);
  const [workoutLocation, setWorkoutLocation] = useState('');
  // Step 6 — Allergies (optional, many allowed; sent with complete-onboarding)
  const [allergies, setAllergies] = useState(/** @type {string[]} */ ([]));
  const [customAllergy, setCustomAllergy] = useState('');
  const [showAllergies, setShowAllergies] = useState(false);
  const allergiesRef = useRef(null);
  const toggleAllergy = (name) => setAllergies((list) => (
    list.includes(name) ? list.filter((x) => x !== name) : (list.length >= 30 ? list : [...list, name])
  ));
  const addCustomAllergy = () => {
    const v = customAllergy.trim().replace(/\s+/g, ' ');
    if (v.length < 2 || allergies.length >= 30) return;
    if (!allergies.some((x) => x.toLowerCase() === v.toLowerCase())) setAllergies((l) => [...l, v]);
    setCustomAllergy('');
  };
  // Step 8 — Result
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const bmi = useMemo(() => calcBmi(heightCm, weightKg), [heightCm, weightKg]);
  const scrollRef = useRef(null);

  // UI-only: bring the optional allergy fields into view when expanded so the
  // toggle never feels like it did nothing on shorter screens.
  useEffect(() => {
    if (!showAllergies) return;
    const timer = window.setTimeout(() => {
      const scroller = scrollRef.current;
      const section = allergiesRef.current;
      if (!scroller || !section) return;
      const scrollerBox = scroller.getBoundingClientRect();
      const sectionBox = section.getBoundingClientRect();
      if (sectionBox.top >= scrollerBox.top && sectionBox.bottom <= scrollerBox.bottom) return;
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      scroller.scrollTo({
        top: scroller.scrollTop + sectionBox.top - scrollerBox.top - 8,
        behavior: reduce ? 'auto' : 'smooth',
      });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [showAllergies]);

  // UI-only: move screen-reader + keyboard focus to the step title on change.
  const titleRef = useRef(null);
  useEffect(() => {
    titleRef.current?.focus?.({ preventScroll: true });
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  // UI-only: progressive "generating" indicator (pure cosmetic timing).
  const GEN_STEPS = ['Analyzing your profile', 'Understanding your goals', 'Calculating your targets', 'Building your plan'];
  const [genIdx, setGenIdx] = useState(0);
  useEffect(() => {
    if (step !== 6 || error) return;
    setGenIdx(0);
    const t = setInterval(() => setGenIdx((i) => Math.min(i + 1, GEN_STEPS.length - 1)), 320);
    return () => clearInterval(t);
  }, [step, error]); // eslint-disable-line react-hooks/exhaustive-deps

  // One-time onboarding: users who already completed (or skipped) never see
  // the wizard again — their data lives in Profile from then on.
  useEffect(() => {
    if (!loading && !editMode && user?.onboardingCompleted === true) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user?.onboardingCompleted, navigate, editMode]);

  // Skip is permanent per account, not per device: persist server-side so a
  // logout, a new device, or a cleared cache never re-prompts onboarding.
  const skip = async () => {
    try {
      await apiPost('/api/auth/complete-onboarding', {});
      safeSet('vitalis:onboarding', 'skipped');
      try { await refreshAuth?.(); } catch { /* cache fallback below covers it */ }
      const cached = safeGetJSON('vitalis_user', null);
      if (cached) safeSetJSON('vitalis_user', { ...cached, onboardingCompleted: true });
      navigate('/dashboard');
    } catch {
      // Offline/server failure: navigate for this session only, do NOT set
      // permanent 'skipped' — user will be re-prompted next load (no divergence).
      try { sessionStorage.setItem('vitalis:onboarding:session-skip', '1'); } catch { /* ignore */ }
      navigate('/dashboard');
    }
  };

  const isValidDob = (v) => {
    if (!v) return false;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    if (d > now) return false;
    const age = (now.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 13 && age <= 120;
  };

  const canContinue = () => {
    switch (step) {
      case 0: {
        const h = Number(heightCm);
        const w = Number(weightKg);
        return isValidDob(dob) && Boolean(sex) && h >= 100 && h <= 230 && w >= 30 && w <= 250;
      }
      case 1: return Boolean(goalType);
      case 2:
        if (goalType === 'LOSE_WEIGHT' || goalType === 'GAIN_WEIGHT') {
          return Boolean(Number(targetWeight) > 0 && pace);
        }
        if (goalType === 'BUILD_MUSCLE') return Boolean(focus);
        if (goalType === 'MAINTAIN_WEIGHT' || goalType === 'PERFORMANCE') return Boolean(focus);
        return false;
      case 3: return Boolean(activityLevel);
      // Training setup is optional — empty choices mean "use sensible defaults".
      case 4: return true;
      case 5: {
        const s = Number(sleepHours);
        return sleepHours !== '' && Number.isFinite(s) && s > 0 && s <= 14;
      }
      default: return true;
    }
  };

  // UI-only hint explaining what the disabled Continue is waiting for.
  // Mirrors canContinue() without touching its logic.
  const stepHint = () => {
    switch (step) {
      case 0: {
        if (!isValidDob(dob)) return 'Enter a valid birth date (age 13–120).';
        if (!sex) return 'Select an option for metabolic calculation.';
        const h = Number(heightCm);
        const w = Number(weightKg);
        if (!(h >= 100 && h <= 230)) return 'Height must be 100–230 cm.';
        if (!(w >= 30 && w <= 250)) return 'Weight must be 30–250 kg.';
        return '';
      }
      case 1: return goalType ? '' : 'Select a goal to continue.';
      case 2: {
        if (goalType === 'LOSE_WEIGHT' || goalType === 'GAIN_WEIGHT') {
          if (!(Number(targetWeight) > 0)) return 'Enter your target weight.';
          if (!pace) return 'Choose your preferred progress pace.';
          return '';
        }
        if (!focus) return 'Choose a focus to continue.';
        return '';
      }
      case 3: return activityLevel ? '' : 'Choose the level closest to your week.';
      case 5: {
        const s = Number(sleepHours);
        if (sleepHours === '' || !Number.isFinite(s) || s <= 0 || s > 14) {
          return 'Enter average sleep (0–14 hours).';
        }
        return '';
      }
      default: return '';
    }
  };

  // Step 6 — generate plan on entry (short response delay keeps the state legible).
  useEffect(() => {
    if (step !== 6 || !user?.id || plan) return;
    (async () => {
      setSaving(true); setError('');
      try {
        const data = await apiPost(`/api/goals/${user.id}`, {
          dob, sex, heightCm: Number(heightCm), weightKg: Number(weightKg),
          goalType, targetWeightKg: targetWeight ? Number(targetWeight) : null,
          pace: pace || null, focus: focus || null, activityLevel,
          sleepHours: Number(sleepHours),
          sleepQuality, stressLevel, exerciseFreq, recoveryLevel,
        });
        if (!data?.goal) throw new Error('Could not generate your plan.');
        // Module 3 — persist the training setup BEFORE the starter plan is
        // generated (finish() fires /api/plans/auto-from-goal, which reads
        // training_preferences). Fail-soft: preferences must never block
        // going through onboarding — defaults still produce a sane plan.
        try {
          await apiFetch('/api/training-preferences', {
            method: 'PUT',
            body: JSON.stringify({
              equipment: trainingEquipment,
              preferred_days: prefDays,
              session_duration_mins: sessionMins || undefined,
              workout_location: workoutLocation || undefined,
            }),
          });
        } catch { /* fall back to defaults; user can edit in Plans later */ }
        setPlan(data);
        setTimeout(() => setStep(7), 220);
      } catch (e) {
        setError(e.message);
      } finally {
        setSaving(false);
      }
    })();
  }, [step, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = async () => {
    setSaving(true); setError('');
    try {
      // Fail-closed: do NOT swallow — on failure we must stay and show error,
      // never mark done / navigate (was: .catch(()=>null) faked success).
      // Allergies ride along with completion (absent only in skip()).
      await apiPost('/api/auth/complete-onboarding', { allergies });
      try { await refreshAuth?.(); } catch { /* fallback below covers it */ }
      safeSet('vitalis:onboarding', 'done');
      const cached = safeGetJSON('vitalis_user', null);
      if (cached) safeSetJSON('vitalis_user', { ...cached, onboardingCompleted: true });
      // Best-effort: seed a personal 7-day starter from the new goal.
      // Fire-and-forget so it never delays the dashboard transition.
      apiPost('/api/plans/auto-from-goal', {}).catch(() => {});
      navigate('/dashboard/plans?mine=1');
    } catch (e) {
      setError(e?.message || 'Could not finish. Check connection and try again — you can skip for now.');
    } finally {
      setSaving(false);
    }
  };

  const next = () => { setError(''); setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)); };

  // UI-only: evaluate the gate once per render for nav + hint.
  const canGo = canContinue();
  const hint = canGo || step >= 7 ? '' : stepHint();
  const progress = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  return (
    <main className="onboarding" aria-labelledby="onboarding-title">
      <div className="onb-shell">
        <aside className="onb-rail" aria-label="Onboarding progress">
          <div className="onb-brand">
            <img src="/pwa-192x192.png" alt="" width="40" height="40" />
            <span className="onb-brand__copy">
              <strong>Vitalis</strong>
              <small>Personal setup</small>
            </span>
          </div>

          <div className="onb-rail__intro">
            <p className="onb-rail__eyebrow">A stronger everyday</p>
            <h2>A little setup.<br />A lot of possibility.</h2>
            <p>Let’s build a routine that feels like you.</p>
          </div>

          <ol className="onb-rail__list">
            {SETUP_PHASES.map((phase) => {
              const state = phase.end < step ? 'done' : step >= phase.start && step <= phase.end ? 'active' : 'todo';
              return (
                <li
                  key={phase.title}
                  className={`onb-rail__item is-${state}`}
                  aria-current={state === 'active' ? 'step' : undefined}
                >
                  <span className="onb-rail__marker" aria-hidden="true">
                    <Icon name={state === 'done' ? 'check' : phase.icon} />
                  </span>
                  <span className="onb-rail__copy">
                    <span className="onb-rail__title">{phase.title}</span>
                    <span className="onb-rail__meta">{state === 'done' ? 'Completed' : phase.description}</span>
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="onb-rail__note">
            <span className="onb-rail__note-icon" aria-hidden="true"><Icon name="spa" /></span>
            <p>Small steps.<br /><strong>Lasting progress.</strong></p>
            <span>A plan shaped around your everyday.</span>
          </div>
          <div className="onb-rail__progress">
            <span>Your setup</span><span>{progress}%</span>
            <div><span style={{ width: `${progress}%` }} /></div>
          </div>
        </aside>

        <section className="onb-main">
          <div className="onb-topbar">
            <div className="onb-brand onb-brand--mobile">
              <img src="/pwa-192x192.png" alt="" width="34" height="34" />
              <span className="onb-brand__copy">
                <strong>Vitalis</strong>
                <small>Personal setup</small>
              </span>
            </div>
            <span className="onb-topbar__label"><Icon name="tune" /> Your personal setup</span>
            {step < 6 && (
              <button type="button" onClick={skip} className="onb-skip">
                Set up later <Icon name="arrow_forward" />
              </button>
            )}
          </div>

          <div className="onb-progress" role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={TOTAL_STEPS} aria-valuenow={step + 1} aria-valuetext={`Step ${step + 1} of ${TOTAL_STEPS}: ${STEP_LABELS[step]}`}>
            {TITLES.map((title, index) => <span key={title} className={index <= step ? 'is-complete' : ''} />)}
          </div>

          <div className="onb-scroll" ref={scrollRef} style={{ scrollbarWidth: 'thin' }}>
          <header className="onb-head">
            <div className="onb-head__meta">
              <p className="onb-eyebrow"><span>{String(step + 1).padStart(2, '0')} / {String(TOTAL_STEPS).padStart(2, '0')}</span>{STEP_LABELS[step]}</p>
              {step === 0 && <span className="onb-time"><Icon name="schedule" /> About 3 min</span>}
            </div>
            <h1
              id="onboarding-title"
              ref={titleRef}
              tabIndex={-1}
              className="onb-title"
            >
              {TITLES[step]}
            </h1>
            <p className="onb-lede">{STEP_DESCRIPTIONS[step]}</p>
          </header>

            {/* UI-only step transition (respects OS reduced-motion via MotionConfig) */}
            <MotionConfig reducedMotion="user">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  className="onb-scroll__inner"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                >
                  {/* STEP 1 — About you */}
                  {step === 0 && (
                    <div className="onb-form">
                      <div className="onb-field">
                        <label className="onb-label" htmlFor="ob-dob">Date of birth</label>
                        <input id="ob-dob" type="date" autoComplete="bday" value={dob} onChange={(e) => setDob(e.target.value)} className="onb-input" />
                      </div>

                      <fieldset className="onb-fieldset">
                        <legend className="onb-label">
                          Sex <span className="onb-label__hint">(for metabolic calculation)</span>
                        </legend>
                        <div className="onb-chip-row onb-chip-row--segments">
                          {['MALE', 'FEMALE', 'OTHER'].map((s) => (
                            <Chip key={s} active={sex === s} onClick={() => setSex(s)}>{humanizeOption(s)}</Chip>
                          ))}
                        </div>
                      </fieldset>

                      <div className="onb-grid-2">
                        <div className="onb-field">
                          <label className="onb-label" htmlFor="ob-height">Height <span className="onb-label__hint">(cm)</span></label>
                          <div className="onb-input-wrap"><input id="ob-height" type="number" inputMode="decimal" min="100" max="230" placeholder="175" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="onb-input" /><span aria-hidden="true">cm</span></div>
                        </div>
                        <div className="onb-field">
                          <label className="onb-label" htmlFor="ob-weight">Weight <span className="onb-label__hint">(kg)</span></label>
                          <div className="onb-input-wrap"><input id="ob-weight" type="number" inputMode="decimal" min="30" max="250" placeholder="80" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="onb-input" /><span aria-hidden="true">kg</span></div>
                        </div>
                      </div>

                        <div className="onb-bmi" aria-live="polite">
                          <span className="onb-bmi__icon" aria-hidden="true"><Icon name="monitor_weight" /></span>
                          <div>
                            <p className="onb-bmi__label">Your starting snapshot</p>
                            <p className="onb-bmi__category">{bmi == null ? 'Add your height and weight to see your BMI.' : bmiCategory(bmi)}</p>
                          </div>
                          <p className="onb-bmi__value">{bmi ?? '—'}<span>BMI</span></p>
                        </div>
                    </div>
                  )}

                  {/* STEP 2 — Primary goal */}
                  {step === 1 && (
                    <div className="onb-choice-grid" role="group" aria-label="Primary goal">
                      {GOAL_TYPES.map((g) => (
                        <ChoiceCard
                          key={g.key}
                          active={goalType === g.key}
                          icon={g.icon}
                          title={g.label}
                          description={g.desc}
                          onClick={() => { setGoalType(g.key); setPace(''); setFocus(''); setTargetWeight(''); }}
                        />
                      ))}
                    </div>
                  )}

                  {/* STEP 3 — Goal details (depends on goal) */}
                  {step === 2 && (
                    <div className="onb-form">
                      {(goalType === 'LOSE_WEIGHT' || goalType === 'GAIN_WEIGHT') && (
                        <>
                          <div className="onb-grid-2">
                            <div className="onb-field">
                              <label className="onb-label" htmlFor="ob-current">Current (kg)</label>
                              <input id="ob-current" value={weightKg} disabled className="onb-input" />
                            </div>
                            <div className="onb-field">
                              <label className="onb-label" htmlFor="ob-target">Target (kg)</label>
                              <input id="ob-target" type="number" min="30" max="250" placeholder={goalType === 'LOSE_WEIGHT' ? '70' : '65'}
                                value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="onb-input" />
                            </div>
                          </div>
                          <fieldset className="onb-fieldset">
                            <legend className="onb-label">Preferred progress</legend>
                            <div className="onb-chip-row">
                              {PACES[goalType].map((p) => (
                                <Chip key={p} active={pace === p} onClick={() => setPace(p)}>{humanizeOption(p)}</Chip>
                              ))}
                            </div>
                          </fieldset>
                        </>
                      )}
                      {goalType === 'BUILD_MUSCLE' && (
                        <>
                          <fieldset className="onb-fieldset">
                            <legend className="onb-label">Training focus</legend>
                            <div className="onb-chip-row">
                              {FOCUSES.BUILD_MUSCLE.map((f) => (
                                <Chip key={f} active={focus === f} onClick={() => setFocus(f)}>{humanizeOption(f)}</Chip>
                              ))}
                            </div>
                          </fieldset>
                          <div className="onb-field">
                            <label className="onb-label" htmlFor="ob-target-muscle">
                              Target weight <span className="onb-label__hint">optional (kg)</span>
                            </label>
                            <input id="ob-target-muscle" type="number" min="30" max="250" placeholder="—" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="onb-input" />
                          </div>
                        </>
                      )}
                      {goalType === 'MAINTAIN_WEIGHT' && (
                        <>
                          <div className="onb-field">
                            <label className="onb-label" htmlFor="ob-maintain">Maintain approximately (kg)</label>
                            <input id="ob-maintain" type="number" min="30" max="250" value={targetWeight || weightKg} onChange={(e) => setTargetWeight(e.target.value)} className="onb-input" />
                          </div>
                          <fieldset className="onb-fieldset">
                            <legend className="onb-label">Primary focus</legend>
                            <div className="onb-chip-row">
                              {FOCUSES.MAINTAIN_WEIGHT.map((f) => {
                                const text = humanizeOption(f);
                                return <Chip key={f} label={text} active={focus === f} onClick={() => setFocus(f)}>{text}</Chip>;
                              })}
                            </div>
                          </fieldset>
                        </>
                      )}
                      {goalType === 'PERFORMANCE' && (
                        <fieldset className="onb-fieldset">
                          <legend className="onb-label">Performance focus</legend>
                          <div className="onb-chip-row">
                            {FOCUSES.PERFORMANCE.map((f) => {
                              const text = humanizeOption(f);
                              return <Chip key={f} label={text} active={focus === f} onClick={() => setFocus(f)}>{text}</Chip>;
                            })}
                          </div>
                        </fieldset>
                      )}
                    </div>
                  )}

                  {/* STEP 4 — Activity level */}
                  {step === 3 && (
                    <div className="onb-choice-grid" role="group" aria-label="Activity level">
                      {ACTIVITY_LEVELS.map((a) => (
                        <ChoiceCard
                          key={a.key}
                          active={activityLevel === a.key}
                          icon={a.icon}
                          title={a.label}
                          description={a.desc}
                          onClick={() => setActivityLevel(a.key)}
                        />
                      ))}
                    </div>
                  )}

                  {/* STEP 5 — Training setup (Module 3, optional) */}
                  {step === 4 && (
                    <div className="onb-form">
                      <p className="onb-note">
                        <Icon name="info" /> Pick what works for you. You can update these in Plans → Preferences anytime.
                      </p>
                      <fieldset className="onb-fieldset">
                        <legend className="onb-label">
                          Available equipment <span className="onb-label__hint">(none is fine)</span>
                        </legend>
                        <div className="onb-chip-row">
                          {EQUIPMENT_CHOICES.map((eq) => (
                            <Chip key={eq} active={trainingEquipment.includes(eq)}
                              onClick={() => setTrainingEquipment((list) => (list.includes(eq) ? list.filter((x) => x !== eq) : [...list, eq]))}>
                              {eq}
                            </Chip>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset className="onb-fieldset">
                        <legend className="onb-label">Preferred training days</legend>
                        <div className="onb-day-grid">
                          {DAY_SHORT.map((d, i) => {
                            const active = prefDays.includes(i);
                            return (
                              <button
                                key={`${d}-${i}`}
                                type="button"
                                title={DAY_NAMES[i]}
                                aria-pressed={active}
                                aria-label={DAY_NAMES[i]}
                                onClick={() => setPrefDays((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]))}
                                className={`onb-day${active ? ' is-selected' : ''}`}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                      <fieldset className="onb-fieldset">
                        <legend className="onb-label">Minutes you have per session</legend>
                        <div className="onb-chip-row">
                          {SESSION_MINS_CHOICES.map((m) => (
                            <Chip key={m} label={`${m} minutes`} active={sessionMins === m} onClick={() => setSessionMins(m)}>{m} min</Chip>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset className="onb-fieldset">
                        <legend className="onb-label">
                          Where you usually train <span className="onb-label__hint">(optional)</span>
                        </legend>
                        <div className="onb-chip-row">
                          {LOCATION_CHOICES.map((loc) => (
                            <Chip key={loc} active={workoutLocation === loc}
                              onClick={() => setWorkoutLocation((cur) => (cur === loc ? '' : loc))}>
                              {loc}
                            </Chip>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  )}

                  {/* STEP 6 — Lifestyle baseline + optional allergies */}
                  {step === 5 && (
                    <div className="onb-form">
                      <div className="onb-field">
                        <label className="onb-label" htmlFor="ob-sleep">Average sleep duration (hours)</label>
                        <input id="ob-sleep" type="number" min="0" max="14" step="0.5" placeholder="7.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="onb-input" />
                      </div>

                      <div className="onb-lifestyle-grid">
                        {/** @type {[string, string[], string, any][]} */ ([
                          ['Typical sleep quality', SLEEP_QUALITY, sleepQuality, setSleepQuality],
                          ['Typical stress level', STRESS_LEVELS, stressLevel, setStressLevel],
                          ['Current exercise frequency', EXERCISE_FREQ, exerciseFreq, setExerciseFreq],
                          ['Typical recovery / energy', RECOVERY_LEVELS, recoveryLevel, setRecoveryLevel],
                        ]).map(([label, opts, val, set]) => (
                          <fieldset className="onb-fieldset" key={label}>
                            <legend className="onb-label">{label}</legend>
                            <div className="onb-chip-row">
                              {opts.map((o) => {
                                const text = humanizeOption(o);
                                return <Chip key={o} label={text} active={val === o} onClick={() => set(o)}>{text}</Chip>;
                              })}
                            </div>
                          </fieldset>
                        ))}
                      </div>

                      <div className="onb-allergies" ref={allergiesRef}>
                        <button
                          type="button"
                          onClick={() => setShowAllergies((open) => !open)}
                          aria-expanded={showAllergies}
                          aria-controls="ob-allergies"
                          className="onb-allergies__toggle"
                        >
                          <span className="onb-allergies__heading">
                            <span className="onb-allergies__title">
                              Food allergies <span className="onb-label__hint">(optional)</span>
                            </span>
                            {allergies.length > 0 && (
                              <span className="onb-allergies__count">{allergies.length} selected</span>
                            )}
                          </span>
                          <Icon name={showAllergies ? 'expand_less' : 'expand_more'} className="onb-allergies__chevron" />
                        </button>

                        {showAllergies && (
                          <div id="ob-allergies" className="onb-allergies__panel">
                            <p className="onb-note onb-note--small">
                              Meal Tracker scans will flag foods that may contain these. Guidance only — always verify the label.
                            </p>

                            <fieldset className="onb-fieldset">
                              <legend className="onb-label">Allergies</legend>
                              <div className="onb-chip-row">
                                {[...ALLERGEN_PRESETS, ...allergies.filter((a) => !ALLERGEN_PRESETS.includes(a))].map((a) => (
                                  <Chip key={a} label={a} active={allergies.includes(a)} onClick={() => toggleAllergy(a)}>{a}</Chip>
                                ))}
                              </div>
                            </fieldset>

                            <div className="onb-field">
                              <label className="onb-label" htmlFor="custom-allergy">Something else?</label>
                              <div className="onb-inline">
                                <input
                                  id="custom-allergy"
                                  value={customAllergy}
                                  onChange={(e) => setCustomAllergy(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAllergy(); } }}
                                  placeholder="Type it, then Add"
                                  maxLength={40}
                                  className="onb-input"
                                />
                                <button type="button" onClick={addCustomAllergy} disabled={customAllergy.trim().length < 2} className="onb-btn onb-btn--ghost onb-btn--compact">
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 7 — Generating */}
                  {step === 6 && (
                    <div className="onb-generating">
                      {error ? (
                        <div className="onb-inline-error">
                          <span className="onb-inline-error__icon" aria-hidden="true"><Icon name="error" /></span>
                          <p role="alert">{error}</p>
                          <button type="button" onClick={() => setStep(5)} className="onb-btn onb-btn--ghost">Back</button>
                        </div>
                      ) : (
                        <div className="onb-generating__panel">
                          <span className="onb-generating__mark" aria-hidden="true"><Icon name="auto_awesome" /></span>
                          <ul className="onb-generating__list" aria-live="polite">
                            {GEN_STEPS.map((t, i) => {
                              const done = i < genIdx || (!saving && i <= genIdx);
                              return (
                                <li key={t} className={`onb-generating__item${i > genIdx ? ' is-upcoming' : ''}`}>
                                  {done ? (
                                    <span className="onb-generating__check" aria-hidden="true"><Icon name="check" /></span>
                                  ) : (
                                    <span className={`onb-generating__spinner${i === genIdx ? ' is-active' : ''}`} aria-hidden="true" />
                                  )}
                                  <span>{t}{i === GEN_STEPS.length - 1 && saving ? '...' : ''}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 8 — Plan ready */}
                  {step === 7 && plan?.goal && (
                    <div className="onb-result">
                      <div className="onb-result__goal">
                        <p className="onb-result__label">Primary goal</p>
                        <p className="onb-result__goal-value">{goalLabel(plan.goal.goalType)}</p>
                      </div>

                      <div className="onb-result__stats">
                        <div className="onb-result__stat">
                          <p className="onb-result__label">Current</p>
                          <p className="onb-result__stat-value">{plan.goal.weightKg} kg</p>
                        </div>
                        <div className="onb-result__stat">
                          <p className="onb-result__label">Target</p>
                          <p className="onb-result__stat-value">{plan.goal.targetWeightKg ?? '—'}{plan.goal.targetWeightKg ? ' kg' : ''}</p>
                        </div>
                        <div className="onb-result__stat">
                          <p className="onb-result__label">BMI</p>
                          <p className="onb-result__stat-value">{plan.goal.bmi ?? '—'}</p>
                        </div>
                      </div>

                      <div className="onb-result__energy">
                        <p className="onb-result__label">Daily energy target</p>
                        <p className="onb-result__energy-value">
                          {plan.plan?.dailyKcal?.toLocaleString() ?? '—'} <span>kcal</span>
                        </p>
                        <p className="onb-result__macros">
                          Protein {plan.plan?.proteinG ?? '—'}g · Carbs {plan.plan?.carbsG ?? '—'}g · Fat {plan.plan?.fatG ?? '—'}g
                        </p>
                      </div>

                      <p className="onb-result__note">
                        Initial estimates based on your info. Vitalis refines them as you log nutrition, activity, weight and recovery.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </MotionConfig>
          </div>

          {step !== 6 && (
            <footer className="onb-footer">
              <div className="onb-footer__feedback">
                {error && <p role="alert" className="onb-feedback onb-feedback--error">{error}</p>}
                {!error && hint ? <p role="status" className="onb-feedback">{hint}</p> : null}
              </div>
              <div className={`onb-footer__actions${step === 0 ? ' is-first' : ''}${step === 7 ? ' is-final' : ''}`}>
                <div className="onb-footer__secondary">
                  {step > 0 && step < 6 && (
                    <button type="button" onClick={() => setStep((s) => s - 1)} className="onb-btn onb-btn--ghost">
                      <Icon name="arrow_back" className="onb-btn__icon" />
                      Back
                    </button>
                  )}
                </div>
                <div className="onb-footer__primary">
                  {step < 6 && (
                    <button type="button" onClick={next} disabled={!canGo} aria-disabled={!canGo} className="onb-btn onb-btn--primary">
                      {step === 5 ? 'Create my plan' : 'Continue'}
                      <Icon name="arrow_forward" className="onb-btn__icon" />
                    </button>
                  )}
                  {step === 7 && (
                    <button type="button" onClick={finish} disabled={saving} className="onb-btn onb-btn--primary">
                      {saving && <span className="onb-btn__spinner" aria-hidden="true" />}
                      {saving ? 'Saving...' : 'Explore my plan'}
                      {!saving && <Icon name="arrow_forward" className="onb-btn__icon" />}
                    </button>
                  )}
                </div>
              </div>
            </footer>
          )}
        </section>
      </div>
    </main>
  );
};

export default Onboarding;
