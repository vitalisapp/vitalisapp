// pages/Profile.jsx — redesigned to match reference image (dark + green header + 3 stats + accordion)
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar, BottomNav, Topbar } from '../../../components/index.js';
import GlassAmbient from '../../../components/GlassAmbient.jsx';
import { useProfile } from '../hooks/useProfile.js';
import { useAvatar } from '../hooks/useAvatar.js';
import Toast from '../components/Toast.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import Button from '../../../components/ui/Button.jsx';
import ChangePasswordModal from '../components/ChangePasswordModal.jsx';
import ChangeGoalModal from '../components/ChangeGoalModal.jsx';
import { DEFAULT_AVATARS } from '../utils/avatar.js';
import { resolveAvatar, avatarGradient, getInitials } from '../../../lib/avatar.js';
import { apiFetch } from '../../../lib/apiClient.js';
import { goalLabel, activityLabel, GOAL_TYPES } from '../../Onboarding/constants/goals.js';
import { computeBMI, bmiCategory, calcBMR, activityFactors, humanize } from '../utils/metrics.js';

// Goal snapshot card — the single home for onboarding goal details.
// Rendered inside the "My Goals" section (not duplicated in Body Metrics).
const GoalSnapshotCard = ({ onboarding, onChangeGoal }) => {
  if (!onboarding) {
    return (
      <div className="text-center py-3 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] space-y-2">
        <p className="text-[12px] text-[var(--text-muted)]">No onboarding info yet</p>
        <Link to="/onboarding" className="inline-flex py-1.5 px-4 rounded-full bg-[var(--accent)] text-[var(--text-inverse)] text-[11px] font-black">Complete Onboarding</Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <Eyebrow>Your Plan</Eyebrow>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Goal</p>
          <p className="text-[13px] font-bold text-[var(--accent)] mt-1">{goalLabel(onboarding.goalType)}</p>
          {onboarding.focus && <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{humanize(onboarding.focus)}</p>}
          {onboarding.targetWeightKg != null && <p className="text-[11px] text-[var(--text-muted)] mt-0.5 tabular-nums">Target: {Number(onboarding.targetWeightKg).toFixed(1)} kg</p>}
        </div>
        <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Activity</p>
          <p className="text-[13px] font-bold text-[var(--text-primary)] mt-1">{activityLabel(onboarding.activityLevel)}</p>
          {onboarding.pace && <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{humanize(onboarding.pace)}</p>}
        </div>
      </div>
      {onboarding.dailyKcal != null && (
        <div className="rounded-[16px] p-4 text-center bg-[var(--accent)]">
          <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[var(--text-inverse)]/80">Plan Daily Target</p>
          <p className="text-[24px] font-black text-[var(--text-inverse)] mt-1 tabular-nums">{Number(onboarding.dailyKcal).toLocaleString()} <span className="text-[12px] font-bold text-[var(--text-inverse)]/70">kcal</span></p>
          <p className="text-[11px] font-bold text-[var(--text-inverse)]/70 mt-1 tabular-nums">P {onboarding.proteinG ?? '—'}g · C {onboarding.carbsG ?? '—'}g · F {onboarding.fatG ?? '—'}g</p>
        </div>
      )}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2 text-center [&>div]:min-w-0">
        <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] px-3 py-2.5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Sleep</p><p className="text-[12px] font-bold mt-1 break-words">{onboarding.sleepHours != null ? `${onboarding.sleepHours}h` : '—'} · {humanize(onboarding.sleepQuality)}</p></div>
        <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] px-3 py-2.5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Stress · Recovery</p><p className="text-[12px] font-bold mt-1 break-words">{humanize(onboarding.stressLevel)} · {humanize(onboarding.recoveryLevel)}</p></div>
        <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] px-3 py-2.5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Exercise</p><p className="text-[12px] font-bold mt-1 break-words">{humanize(onboarding.exerciseFreq)}</p></div>
      </div>
      <button onClick={onChangeGoal} className="w-full py-2.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-bg)] text-[11px] font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--text-inverse)] transition-colors">Change Goal</button>
    </div>
  );
};

const BodyMetricsPanel = ({ USER_ID, initialWeight, initialHeight, onboarding, showToast, onMetricsSaved, editSignal }) => {
  const [weight, setWeight] = useState(initialWeight || '');
  const [height, setHeight] = useState(initialHeight || '');
  const [age, setAge] = useState('23');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('Sedentary');
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [macroMode, setMacroMode] = useState('MODERATE CARB');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (initialWeight) setWeight(String(initialWeight)); }, [initialWeight]);
  useEffect(() => { if (initialHeight) setHeight(String(initialHeight)); }, [initialHeight]);
  useEffect(() => {
    if (!onboarding) return;
    if (onboarding.dob) {
      const dobDate = new Date(onboarding.dob);
      if (!Number.isNaN(dobDate.getTime())) {
        const ageCalc = Math.floor((Date.now() - dobDate.getTime()) / (365.25 * 24 * 3600 * 1000));
        if (ageCalc > 0 && ageCalc < 120) setAge(String(ageCalc));
      }
    }
    if (onboarding.sex) setGender(String(onboarding.sex).toLowerCase());
    if (onboarding.activityLevel) {
      const label = activityLabel(onboarding.activityLevel);
      if (activityFactors[label]) setActivity(label);
    }
  }, [onboarding]);
  // NOTE: no auto-collapse effect here — collapsing on weight/height/age change
  // would close the form while the user is typing. `editing` starts false.
  // Single master Edit button (Profile) drives this panel via editSignal.
  useEffect(() => {
    if (editSignal > 0) setEditing(true);
  }, [editSignal]);

  const bmi = computeBMI(height, weight);
  const bmr = calcBMR(weight, height, age, gender);
  const tdee = bmr ? Math.round(bmr * (activityFactors[activity] || 1.2)) : null;
  const activityKcal = tdee && bmr ? tdee - bmr : null;
  const bmiInfo = bmiCategory(bmi);
  const targets = tdee ? { cut: tdee - 500, maintain: tdee, bulk: tdee + 500 } : null;
  const macros = (() => {
    if (!tdee) return null;
    let pPct = 0.30, fPct = 0.35, cPct = 0.35;
    if (macroMode === 'LOWER CARB') { pPct = 0.35; fPct = 0.40; cPct = 0.25; }
    if (macroMode === 'HIGHER CARB') { pPct = 0.25; fPct = 0.25; cPct = 0.50; }
    const pKcal = Math.round(tdee * pPct), fKcal = Math.round(tdee * fPct), cKcal = Math.round(tdee * cPct);
    return {
      protein: { g: Math.round(pKcal / 4), kcal: pKcal, pct: Math.round(pPct * 100) },
      fat: { g: Math.round(fKcal / 9), kcal: fKcal, pct: Math.round(fPct * 100) },
      carbs: { g: Math.round(cKcal / 4), kcal: cKcal, pct: Math.round(cPct * 100) },
    };
  })();

  const handleSave = async () => {
    if (!weight || !height) { showToast?.('Enter weight and height', 'error'); return; }
    setIsSaving(true);
    try {
      await apiFetch(`/api/bmi/${USER_ID}`, {
        method: 'POST',
        body: JSON.stringify({ weight_kg: parseFloat(weight), height_cm: parseFloat(height), age: age || null, gender }),
      });
      showToast?.('Metrics saved — BMI updated');
      setEditing(false);
      onMetricsSaved?.();
    } catch (e) { showToast?.(e.message || 'Save failed', 'error'); } finally { setIsSaving(false); }
  };

  const hasResult = bmi != null && tdee != null;
  return (
    <div className="space-y-3">
      {/* Editable inputs — always visible when editing, collapsed to summary when not */}
      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0"><label htmlFor="bm-weight" className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Weight (kg)</label><input id="bm-weight" type="number" min="30" max="300" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="55.0" className="mt-1 w-full h-12 min-h-[44px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 text-[16px] sm:text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
            <div className="min-w-0"><label htmlFor="bm-height" className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Height (cm)</label><input id="bm-height" type="number" min="50" max="300" step="0.5" value={height} onChange={e=>setHeight(e.target.value)} placeholder="185.0" className="mt-1 w-full h-12 min-h-[44px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 text-[16px] sm:text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
            <div className="min-w-0"><label htmlFor="bm-age" className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Age</label><input id="bm-age" type="number" min="5" max="120" value={age} onChange={e=>setAge(e.target.value)} placeholder="23" className="mt-1 w-full h-12 min-h-[44px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 text-[16px] sm:text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" /></div>
            <div className="min-w-0"><label htmlFor="bm-gender" className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Gender</label><select id="bm-gender" value={gender} onChange={e=>setGender(e.target.value)} className="mt-1 w-full h-12 min-h-[44px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 text-[16px] sm:text-[13px] text-[var(--text-primary)] outline-none"><option value="male">male</option><option value="female">female</option><option value="other">other</option></select></div>
            <div className="col-span-2"><label htmlFor="bm-activity" className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Activity Level</label><select id="bm-activity" value={activity} onChange={e=>setActivity(e.target.value)} className="mt-1 w-full h-12 min-h-[44px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 text-[16px] sm:text-[13px] text-[var(--text-primary)] outline-none">{Object.keys(activityFactors).map(k=><option key={k} value={k}>{k}</option>)}</select></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={()=>setEditing(false)} className="flex-1 h-12 min-h-[44px] rounded-xl border border-[var(--border-light)] text-[12px] font-bold text-[var(--text-muted)] active:scale-[0.98] transition-all">Cancel</button>
            <button onClick={handleSave} disabled={isSaving || !weight || !height} className="flex-1 h-12 min-h-[44px] rounded-xl bg-[var(--accent)] text-[var(--text-inverse)] text-[12px] font-black disabled:opacity-50 active:scale-[0.98] transition-all">{isSaving ? 'Saving…' : 'Save & Calculate'}</button>
          </div>
        </div>
      ) : hasResult ? (
        <>
          <div className="grid grid-cols-3 gap-2 text-center [&>div]:min-w-0">
            <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] px-2 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Weight</p><p className="text-[13px] font-bold text-[var(--text-primary)] mt-1 break-words tabular-nums">{parseFloat(weight).toFixed(1)} kg</p></div>
            <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] px-2 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Height</p><p className="text-[13px] font-bold text-[var(--text-primary)] mt-1 break-words tabular-nums">{parseFloat(height).toFixed(1)} cm</p></div>
            <div className="bg-[var(--bg-hover)] border border-[var(--accent-border)] rounded-[12px] px-2 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">BMI</p><p className="text-[15px] font-black tabular-nums" style={{ color: bmiInfo.color }}>{bmi}</p><p className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: bmiInfo.color }}>{bmiInfo.label}</p></div>
          </div>
          <div className="h-px bg-[var(--border-light)]" />
          <button onClick={()=>setExpanded(v=>!v)} className="w-full flex items-center justify-center gap-1 text-[10px] font-black tracking-[0.15em] uppercase text-[var(--accent)] py-2 min-h-[44px]">VIEW ALL METRICS <span className={`material-symbols-outlined text-[14px] transition-transform ${expanded ? 'rotate-180' : ''}`}>expand_more</span></button>
          {expanded && (
            <>
              <div className="h-px bg-[var(--border-light)]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Details</p>
              <div className="grid grid-cols-3 gap-2 [&>div]:min-w-0">
                <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] p-3 text-center"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Age</p><p className="text-[13px] font-bold text-[var(--text-primary)] mt-1">{age}</p></div>
                <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] p-3 text-center"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Gender</p><p className="text-[13px] font-bold text-[var(--text-primary)] mt-1 capitalize">{gender}</p></div>
                <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] p-3 text-center"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Activity</p><p className="text-[11px] font-bold text-[var(--text-primary)] mt-1 leading-snug">{activity}</p></div>
              </div>
              <div className="rounded-[16px] p-4 text-center bg-[var(--accent)]">
                <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[var(--text-inverse)]/80">Total Daily Energy Expenditure</p>
                <p className="text-[28px] font-black text-[var(--text-inverse)] mt-1 tabular-nums">{tdee.toLocaleString()} <span className="text-[12px] font-bold text-[var(--text-inverse)]/70">kcal</span></p>
                <p className="text-[10px] font-bold text-[var(--text-inverse)]/70 mt-1 tabular-nums">BMR {bmr.toLocaleString()} <span className="opacity-40">|</span> Activity {activityKcal}</p>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Calorie Targets</p>
              <div className="grid grid-cols-3 gap-2 [&>div]:min-w-0">
                {[{label:'CUT', val:targets.cut, sub:'Fat loss'},{label:'MAINTAIN', val:targets.maintain, sub:'Current weight'},{label:'BULK', val:targets.bulk, sub:'Muscle gain'}].map(c=>(
                  <div key={c.label} className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] p-3 text-center">
                    <p className="text-[10px] font-bold tracking-[0.12em] text-[var(--accent)]">{c.label}</p>
                    <p className="text-[14px] font-black text-[var(--text-primary)] mt-1 break-words tabular-nums">{c.val.toLocaleString()}</p>
                    <p className="text-[9px] text-[var(--text-muted)]">{c.sub}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] shrink-0">Macronutrients</p>
                <div className="flex gap-1 bg-[var(--bg-hover)] rounded-full p-1 overflow-x-auto no-scrollbar max-w-full">
                  {['MODERATE CARB','LOWER CARB','HIGHER CARB'].map(m=>(
                    <button key={m} onClick={()=>setMacroMode(m)} aria-pressed={macroMode===m} className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.08em] whitespace-nowrap shrink-0 min-h-[32px] ${macroMode===m ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-muted)]'}`}>{m}</button>
                  ))}
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden flex bg-[var(--bg-hover)]">
                <div className="bg-[var(--accent)]" style={{width:`${macros.protein.pct}%`}} />
                <div className="bg-[var(--accent)] opacity-55" style={{width:`${macros.fat.pct}%`}} />
                <div className="bg-[var(--accent)] opacity-30" style={{width:`${macros.carbs.pct}%`}} />
              </div>
              <div className="grid grid-cols-3 gap-2 [&>div]:min-w-0">
                <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] p-3 text-center"><p className="text-[10px] font-bold tracking-[0.12em] text-[var(--accent)]">PROTEIN</p><p className="text-[14px] font-black text-[var(--text-primary)] break-words tabular-nums">{macros.protein.g}g</p><p className="text-[9px] text-[var(--text-muted)] tabular-nums">{macros.protein.kcal} kcal · {macros.protein.pct}%</p></div>
                <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] p-3 text-center"><p className="text-[10px] font-bold tracking-[0.12em] text-[var(--accent)]">FAT</p><p className="text-[14px] font-black text-[var(--text-primary)] break-words tabular-nums">{macros.fat.g}g</p><p className="text-[9px] text-[var(--text-muted)] tabular-nums">{macros.fat.kcal} kcal · {macros.fat.pct}%</p></div>
                <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] p-3 text-center"><p className="text-[10px] font-bold tracking-[0.12em] text-[var(--accent)]">CARBS</p><p className="text-[14px] font-black text-[var(--text-primary)] break-words tabular-nums">{macros.carbs.g}g</p><p className="text-[9px] text-[var(--text-muted)] tabular-nums">{macros.carbs.kcal} kcal · {macros.carbs.pct}%</p></div>
              </div>
              <p className="flex justify-between text-[9px] text-[var(--text-disabled)]"><span>{activity}</span><span>{new Date().toISOString().slice(0,10)} · {new Date().toLocaleTimeString()}</span></p>
            </>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-[12px] text-[var(--text-muted)] text-center py-2">Tap Edit Profile above to enter weight & height</p>
        </div>
      )}
    </div>
  );
};

// Single eyebrow recipe for every section header on this page:
// 11px semibold uppercase, relaxed tracking — readable at small sizes.
const Eyebrow = ({ children, className = '' }) => (
  <p className={`text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] ${className}`}>{children}</p>
);

const GOAL_LABEL_SET = new Set(GOAL_TYPES.map((g) => g.label));
const isGoalLikeBio = (v) => GOAL_LABEL_SET.has(String(v || '').trim());

const GoalPicker = ({ value, disabled, onPick }) => {
  const [open, setOpen] = useState(false);
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

const SectionRow = ({ icon, title, subtitle, expanded, onClick, danger, rightIcon }) => (
  <button
    onClick={onClick}
    aria-expanded={expanded ?? undefined}
    className={`w-full flex items-center gap-3 px-4 py-4 min-h-[64px] text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${danger ? 'hover:bg-red-500/5' : 'hover:bg-[var(--bg-hover)] active:bg-[var(--bg-hover)]'}`}
  >
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${danger ? 'bg-red-500/10 border-red-500/20' : 'bg-[var(--bg-hover)] border-[var(--border-light)]'}`}>
      <span className={`material-symbols-outlined text-[18px] ${danger ? 'text-[var(--error)]' : 'text-[var(--accent)]'}`}>{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-[13px] font-bold leading-tight truncate ${danger ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'}`}>{title}</p>
      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{subtitle}</p>
    </div>
    <span className={`material-symbols-outlined text-[20px] shrink-0 transition-transform text-[var(--text-muted)] ${expanded ? 'rotate-180' : ''}`}>
      {rightIcon || (expanded !== undefined ? 'expand_more' : 'chevron_right')}
    </span>
  </button>
);

const Profile = () => {
  const {
    USER_ID,
    loading, isLoading, isSaving, isDirty,
    toastVisible, toastMessage, toastVariant,
    sessions,
    formData, onboarding, setOnboarding, avatarSrc,
    dob, setDob, sex, setSex,
    setToastVisible, setAvatarSrc, setPendingAvatar, setIsEditing,
    handleInputChange, handleDiscard, confirmDiscard, cancelDiscard, showDiscardConfirm, handleSave, handleLogout,
    handleRevoke,
    showToast,
  } = useProfile();

  const {
    uploadPreview,
    fileInputRef,
    handleSelectPreset,
    handleFileChange,
    handleRemoveAvatar,
  } = useAvatar({ setAvatarSrc, setPendingAvatar });

  const [expanded, setExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [streakDays, setStreakDays] = useState(0);
  const [weightProgress, setWeightProgress] = useState(null); // { diff } | { pct } | null

  // MFP-style header stats: check-in streak + weight progress (both best-effort).
  // NOTE: kept above the early returns — hooks must run unconditionally.
  useEffect(() => {
    if (!USER_ID) return;
    const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    apiFetch(`/api/checkins/${USER_ID}/history?days=60`)
      .then((d) => {
        const days = new Set((d.history || []).map(h => String(h.checkin_date || h.check_date || '').slice(0, 10)));
        const cur = new Date();
        if (!days.has(dayKey(cur))) cur.setDate(cur.getDate() - 1); // today's check-in can still happen
        let s = 0;
        while (days.has(dayKey(cur))) { s++; cur.setDate(cur.getDate() - 1); }
        setStreakDays(s);
      })
      .catch(() => {});
    apiFetch(`/api/goals/active/${USER_ID}`)
      .then((d) => {
        const g = d.goal;
        const curW = d.currentWeightKg != null ? Number(d.currentWeightKg) : null;
        if (g?.weightKg != null && curW != null) {
          setWeightProgress({ diff: Number(g.weightKg) - curW });
        } else if (d.progressPct != null) {
          setWeightProgress({ pct: Number(d.progressPct) });
        }
      })
      .catch(() => {});
  }, [USER_ID]);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [changeGoalOpen, setChangeGoalOpen] = useState(false);
  const [pendingGoalType, setPendingGoalType] = useState(null);
  const [metricsEditSignal, setMetricsEditSignal] = useState(0);
  const [isMasterEditing, setIsMasterEditing] = useState(false);
  const profileSectionRef = useRef(null);

  const handleMasterEdit = () => {
    if (isGoalLikeBio(formData.bio)) {
      handleInputChange({ target: { value: '' } }, 'bio');
    }
    setIsMasterEditing(true);
    setMetricsEditSignal((n) => n + 1);
    setOpenSection('account');
    setTimeout(() => profileSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const handleMasterDone = () => {
    setIsMasterEditing(false);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex overflow-x-hidden">
        <Sidebar expanded={expanded} setExpanded={setExpanded} onClick={handleLogout} />
        <div className={`flex-1 flex flex-col min-w-0 ${expanded ? 'md:ml-60' : 'md:ml-18'}`}>
          <Topbar sidebarExpanded={expanded} userId={USER_ID} />
          <main className="w-full max-w-[720px] mx-auto px-4 pb-20 pt-[56px]">
            <div className="h-4 w-16 rounded-full bg-[var(--bg-hover)] animate-pulse mt-4 mb-3" />
            <div className="h-5 w-24 rounded-full bg-[var(--bg-hover)] animate-pulse mb-4" />
            <div className="h-24 rounded-[16px] bg-[var(--bg-hover)] animate-pulse flex items-center gap-4 p-5">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded-full bg-[var(--bg-card)] animate-pulse" />
                <div className="h-3 w-48 rounded-full bg-[var(--bg-card)] animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-[var(--bg-card)] animate-pulse" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <div className="flex-1 h-20 rounded-[16px] bg-[var(--bg-hover)] animate-pulse" />
              <div className="flex-1 h-20 rounded-[16px] bg-[var(--bg-hover)] animate-pulse" />
              <div className="flex-1 h-20 rounded-[16px] bg-[var(--bg-hover)] animate-pulse" />
            </div>
            <div className="h-64 rounded-[16px] bg-[var(--bg-hover)] animate-pulse mt-6" />
          </main>
        </div>
      </div>
    );
  }
  if (!USER_ID) return null;

  const toggle = (id) => setOpenSection(prev => prev === id ? null : id);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex overflow-x-hidden relative">
      <GlassAmbient />
      <div className="glass-content flex-1 min-w-0">
      <Toast message={toastMessage} visible={toastVisible} onDismiss={() => setToastVisible(false)} variant={toastVariant} />
      <Sidebar expanded={expanded} setExpanded={setExpanded} onClick={handleLogout} />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${expanded ? 'md:ml-60' : 'md:ml-18'}`}>
        <Topbar sidebarExpanded={expanded} userId={USER_ID} />

        <main className="w-full max-w-[720px] lg:max-w-4xl mx-auto px-4 pb-20 md:pb-8 pt-[56px]">
          {/* Header band: Streak | avatar+name+tier | Progress */}
          <div className="relative rounded-[20px] overflow-hidden text-[#08130A] shadow-md mt-4 bg-[linear-gradient(135deg,var(--accent-light)_0%,var(--accent)_60%,var(--accent-dark)_130%)]">
            <div className="flex items-center justify-between gap-2 px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5">
              <div className="text-center w-[64px] sm:w-[76px] shrink-0">
                <p className="text-[20px] sm:text-[22px] font-black leading-none tabular-nums">{streakDays}</p>
                <p className="text-[10px] font-bold mt-1 leading-tight opacity-80">Streak<br />days</p>
              </div>
              <div className="w-px self-stretch bg-black/15 rounded-full" aria-hidden="true" />
              <div className="flex flex-col items-center min-w-0 flex-1">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-full overflow-hidden border-2 border-black/25 bg-black/10 flex items-center justify-center font-bold text-[20px]">
                    {(() => {
                      const a = resolveAvatar(avatarSrc, formData.fullName);
                      return a.kind === 'image'
                        ? <img src={a.src} alt="avatar" className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-[var(--text-inverse)] bg-[var(--accent)]">{a.initials}</span>;
                    })()}
                  </div>
                  <button onClick={() => setPickerOpen(v => !v)} aria-label={pickerOpen ? 'Close avatar picker' : 'Change avatar'} aria-expanded={pickerOpen} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-[var(--accent-dark)] border border-black/20 flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-[15px]">{pickerOpen ? 'close' : 'photo_camera'}</span>
                  </button>
                </div>
                <p className="text-[15px] font-extrabold tracking-tight text-center leading-tight mt-2 break-words max-w-[180px] sm:max-w-[220px]">{formData.fullName || 'Athlete'}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-black opacity-80">
                  <span className="material-symbols-outlined text-[13px]">crown</span>
                  {onboarding?.goalType ? goalLabel(onboarding.goalType) : 'No goal yet'}
                </span>
              </div>
              <div className="w-px self-stretch bg-black/15 rounded-full" aria-hidden="true" />
              <div className="text-center w-[64px] sm:w-[76px] shrink-0">
                <p className="text-[22px] font-black leading-none tabular-nums">
                  {weightProgress == null ? '—' : weightProgress.diff != null ? Math.abs(weightProgress.diff).toFixed(1) : `${weightProgress.pct}%`}
                </p>
                <p className="text-[10px] font-bold mt-1 leading-tight">
                  {weightProgress?.diff != null
                    ? (weightProgress.diff > 0 ? <>kg<br />lost</> : weightProgress.diff < 0 ? <>kg<br />gained</> : 'on track')
                    : weightProgress?.pct != null ? <>of<br />goal</> : <>no<br />data</>}
                </p>
              </div>
            </div>
          </div>

          {/* Avatar picker */}
          {pickerOpen && (
            <div className="mt-3 glass-card border border-[var(--border-light)] rounded-[16px] p-4">
              <div className="flex items-center justify-between mb-3">
                <Eyebrow>Choose avatar</Eyebrow>
                <button onClick={() => setPickerOpen(false)}><span className="material-symbols-outlined text-[16px] text-[var(--text-muted)]">close</span></button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
                {DEFAULT_AVATARS.map(av => {
                  const isActive = avatarSrc === av.id;
                  return (
                    <button key={av.id} onClick={() => { handleSelectPreset(av.id); setPickerOpen(false); setIsEditing(true); }} className="flex flex-col items-center gap-1 group" aria-label={av.label}>
                      <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 flex items-center justify-center font-bold text-white ${isActive ? 'border-[var(--accent)]' : 'border-[var(--border-light)] group-hover:border-[var(--accent)]/50'}`} style={{ background: avatarGradient(av.seed) }}>
                        {getInitials(av.label)}
                      </div>
                    </button>
                  );
                })}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handleFileChange(e); setPickerOpen(false); setIsEditing(true); }} />
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 border border-dashed border-[var(--border-light)] rounded-xl text-[11px] font-bold text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-colors">Upload custom photo</button>
              {uploadPreview && <div className="mt-2 flex items-center gap-2 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-xl px-3 py-2"><img src={uploadPreview} alt="preview" className="w-7 h-7 rounded-lg object-cover" /><span className="text-[10px] font-bold text-[var(--accent)]">Custom photo ready</span></div>}
              {avatarSrc && <button onClick={() => { handleRemoveAvatar(); setIsEditing(true); }} className="w-full mt-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-red-400">Remove avatar</button>}
              {isDirty && (
                <div className="flex gap-2 mt-3">
                  <button onClick={handleDiscard} className="flex-1 py-2 rounded-full border border-[var(--border-light)] text-[11px] font-bold text-[var(--text-muted)]">Discard</button>
                  <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2 rounded-full bg-[var(--accent)] text-[var(--text-inverse)] text-[11px] font-black disabled:opacity-50">{isSaving ? 'Saving…' : 'Save'}</button>
                </div>
              )}
            </div>
          )}

          {/* Single master edit entry for the whole profile */}
          <button
            onClick={() => (isMasterEditing ? handleMasterDone() : handleMasterEdit())}
            aria-expanded={isMasterEditing}
            className={`w-full mt-3 h-12 min-h-[48px] rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm ${isMasterEditing ? 'border border-[var(--border-light)] bg-[var(--bg-card)]' : 'bg-[var(--accent)] text-[var(--text-inverse)]'}`}
            style={isMasterEditing ? { color: 'var(--text-primary)' } : undefined}
          >
            <span className="material-symbols-outlined text-[18px]" style={isMasterEditing ? { color: 'var(--accent)' } : undefined}>{isMasterEditing ? 'close' : 'edit'}</span> {isMasterEditing ? 'Done Editing' : 'Edit Profile'}
          </button>

          {/* Body Metrics — separated section (measurements, energy, targets, history) */}
          <div ref={profileSectionRef} className="scroll-mt-20" />
          <Eyebrow className="mt-6 mb-2 px-1">Body Metrics</Eyebrow>
          <div className="glass-card border border-[var(--border-light)] rounded-2xl p-4 sm:p-5 shadow-sm">
            <BodyMetricsPanel USER_ID={USER_ID} initialWeight={formData.weight_kg} initialHeight={formData.height_cm} onboarding={onboarding} showToast={showToast} editSignal={metricsEditSignal} />
          </div>

          {/* Account sections */}
          <Eyebrow className="mt-6 mb-2 px-1">Profile</Eyebrow>
          <div className="glass-card border border-[var(--border-light)] rounded-2xl overflow-hidden divide-y divide-[var(--border-light)] shadow-sm">
            {/* My Account */}
            <div>
              <SectionRow icon="person" title="My Account" subtitle="Personal info & contact details" expanded={openSection === 'account'} onClick={() => toggle('account')} />
              {openSection === 'account' && (
                <div className="px-4 pb-4 pt-1 bg-[var(--bg-primary)]/30">
                  {!isMasterEditing && (
                    <p className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-xl px-3 py-2 mb-1">Tap Edit Profile above to make changes.</p>
                  )}
                  <div className={`space-y-3 ${isMasterEditing ? '' : 'opacity-70'}`}>
                    <div>
                      <label htmlFor="pf-name" className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Full name</label>
                      <input id="pf-name" value={formData.fullName} disabled={!isMasterEditing} onChange={e => handleInputChange(e, 'fullName')} placeholder="Your name" autoComplete="name" className="mt-1 w-full h-12 min-h-[44px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 text-[16px] sm:text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] disabled:opacity-60" />
                    </div>
                    <div>
                      <label htmlFor="pf-email" className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Email (locked)</label>
                      <input id="pf-email" value={formData.email} readOnly className="mt-1 w-full h-12 min-h-[44px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 text-[16px] sm:text-[13px] text-[var(--text-muted)] opacity-60" />
                    </div>
                    <div>
                      <label htmlFor="pf-contact" className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Emergency contact</label>
                      <input id="pf-contact" value={formData.contact} disabled={!isMasterEditing} onChange={e => handleInputChange(e, 'contact')} placeholder="Name · phone" autoComplete="tel" className="mt-1 w-full h-12 min-h-[44px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 text-[16px] sm:text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] disabled:opacity-60" />
                    </div>
                    <div>
                      <label htmlFor="pf-bio" className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Bio</label>
                      <textarea id="pf-bio" value={isGoalLikeBio(formData.bio) ? '' : formData.bio} disabled={!isMasterEditing} onChange={e => handleInputChange(e, 'bio')} rows={2} placeholder="Tell us about yourself" className="mt-1 w-full rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 py-3 text-[16px] sm:text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] disabled:opacity-60 resize-y min-h-[76px]" />
                    </div>
                    <div>
                      <label htmlFor="pf-goal" className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Goal</label>
                      <GoalPicker
                        value={onboarding?.goalType || ''}
                        disabled={!isMasterEditing}
                        onPick={(key) => {
                          setPendingGoalType(key);
                          setChangeGoalOpen(true);
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <label htmlFor="pf-dob" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">DOB</label>
                        <input id="pf-dob" type="date" value={dob} disabled={!isMasterEditing || !onboarding} onChange={e => { setDob(e.target.value); setIsEditing(true); }} className="mt-1 w-full h-12 min-h-[44px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 text-[16px] sm:text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] disabled:opacity-50" />
                      </div>
                      <div className="min-w-0">
                        <label htmlFor="pf-sex" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Sex</label>
                        <select id="pf-sex" value={sex} disabled={!isMasterEditing || !onboarding} onChange={e => { setSex(e.target.value); setIsEditing(true); }} className="mt-1 w-full h-12 min-h-[44px] rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] px-3 text-[16px] sm:text-[13px] text-[var(--text-primary)] outline-none disabled:opacity-50">
                          <option value="">—</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[12px] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Created</p>
                      <p className="text-[12px] font-bold mt-1">{onboarding?.createdAt ? new Date(onboarding.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
                    </div>
                    {!onboarding && (
                      <p className="text-[11px] text-[var(--text-muted)]">Complete onboarding to unlock DOB / sex editing.</p>
                    )}
                    {isMasterEditing && isDirty && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <button onClick={() => { handleDiscard(); }} className="flex-1 h-12 min-h-[44px] rounded-xl border border-[var(--border-light)] text-[12px] font-bold text-[var(--text-muted)] active:scale-[0.98] transition-all">Discard</button>
                        <button onClick={async () => { await handleSave(); setIsMasterEditing(false); }} disabled={isSaving} className="flex-1 h-12 min-h-[44px] rounded-xl bg-[var(--accent)] text-[var(--text-inverse)] text-[12px] font-black disabled:opacity-50 active:scale-[0.98] transition-all">{isSaving ? 'Saving…' : 'Save changes'}</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* My Goals — full plan snapshot lives here (single home, no duplicate) */}
            <div>
              <SectionRow icon="flag" title="My Goals" subtitle={onboarding?.goalType ? goalLabel(onboarding.goalType) : 'Set your fitness goal'} expanded={openSection === 'goals'} onClick={() => toggle('goals')} />
              {openSection === 'goals' && (
                <div className="px-4 pb-4 pt-1 bg-[var(--bg-primary)]/30">
                  <GoalSnapshotCard onboarding={onboarding} onChangeGoal={() => setChangeGoalOpen(true)} />
                </div>
              )}
            </div>

            {/* Devices & Sessions */}
            <div>
              <SectionRow icon="devices" title="Devices & Sessions" subtitle={sessions.length ? `${sessions.length} signed-in ${sessions.length === 1 ? 'device' : 'devices'}` : "Manage where you're signed in"} expanded={openSection === 'devices'} onClick={() => toggle('devices')} />
              {openSection === 'devices' && (
                <div className="px-4 pb-4 pt-1 bg-[var(--bg-primary)]/30 space-y-2 max-h-[320px] overflow-auto">
                  {sessions.length === 0 ? <p className="text-[12px] text-[var(--text-muted)] py-4 text-center">No sessions</p> :
                    sessions.map(s => (
                      <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${s.is_current ? 'border-[var(--accent)]/30 bg-[var(--accent-bg)]' : 'border-[var(--border-light)] bg-[var(--bg-hover)]'}`}>
                        <span className="material-symbols-outlined text-[16px] text-[var(--text-muted)]">{s.is_current ? 'smartphone' : 'laptop_mac'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold truncate text-[var(--text-primary)]">{s.browser} on {s.os}</p>
                          <p className="text-[10px] font-mono text-[var(--text-muted)] truncate">{[s.city, s.country].filter(Boolean).join(', ') || 'UNKNOWN'} {s.is_current && '• ACTIVE NOW'}</p>
                        </div>
                        {s.is_current ? <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[var(--accent)] text-[var(--text-inverse)]">Active</span> :
                          <button onClick={() => handleRevoke(s.id)} className="text-[10px] font-bold text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10">Revoke</button>}
                      </div>
                    ))}
                </div>
              )}
            </div>

          </div>

          {/* Security */}
          <Eyebrow className="mt-6 mb-2 px-1">Security</Eyebrow>
          <div className="glass-card border border-[var(--border-light)] rounded-2xl overflow-hidden divide-y divide-[var(--border-light)] shadow-sm">
            <SectionRow icon="key" title="Change Password" subtitle="Keep your account secure" onClick={() => setChangePwOpen(true)} />
            <SectionRow icon="logout" title="Log Out" subtitle="Sign out of this device" danger onClick={handleLogout} />
          </div>

        </main>
      </div>

      <div className="md:hidden"><BottomNav variant="biometrics" /></div>

      {changePwOpen && <ChangePasswordModal onClose={() => setChangePwOpen(false)} onSuccess={() => showToast('Password updated')} />}
      {changeGoalOpen && <ChangeGoalModal userId={USER_ID} currentGoal={pendingGoalType ? { ...onboarding, goalType: pendingGoalType } : onboarding} onClose={() => { setChangeGoalOpen(false); setPendingGoalType(null); }} onUpdated={(goal) => { if (goal) setOnboarding(goal); setPendingGoalType(null); }} showToast={showToast} />}
      <Modal
        isOpen={!!showDiscardConfirm}
        onClose={cancelDiscard}
        title="Discard changes?"
        subtitle="Unsaved edits will be lost."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={cancelDiscard}>Keep editing</Button>
            <Button variant="danger" onClick={confirmDiscard}>Discard</Button>
          </div>
        }
      >
        <p className="text-[13px] text-[var(--text-muted)]">Discard unsaved profile changes?</p>
      </Modal>
      </div>
    </div>
  );
};

export default Profile;
