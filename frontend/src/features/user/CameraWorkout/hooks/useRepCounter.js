import { useCallback, useEffect, useRef, useState } from 'react';

function angle3(a, b, c) {
  const u = [a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0)];
  const v = [c.x - b.x, c.y - b.y, (c.z ?? 0) - (b.z ?? 0)];
  const length = Math.hypot(...u) * Math.hypot(...v);
  return length > 0.0001 ? Math.acos(Math.max(-1, Math.min(1, u.reduce((s, n, i) => s + n * v[i], 0) / length))) * 180 / Math.PI : NaN;
}

const reliable = (lm, ids) => ids.every(i => {
  const p = lm?.[i];
  return p && (p.visibility ?? 0) >= 0.6 && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x > 0.01 && p.x < 0.99 && p.y > 0.01 && p.y < 0.99;
});

export function assessPose(lm, type, aspect = 1, world, preferredSide) {
  const fail = hint => ({ ready: false, hint });
  if (!lm) return fail('Step into view so the camera can see your movement');
  const chains = {
    pushup: [11, 13, 15, 23, 27], squat: [11, 23, 25, 27], lunge: [11, 23, 25, 27],
    bicep_curl: [11, 13, 15], overhead: [11, 13, 15, 23],
    crunch: [11, 23, 25], situp: [11, 23, 25],
  };
  const left = chains[type] ?? [11, 23, 27];
  const right = left.map(i => i + 1);
  const score = ids => reliable(lm, ids) ? Math.min(...ids.map(i => lm[i].visibility)) : 0;
  const side = preferredSide != null && score(preferredSide ? right : left) >= 0.6
    ? preferredSide : score(right) > score(left) ? 1 : 0;
  const ids = ['jumpingjack', 'lateral_raise', 'calfraise'].includes(type)
    ? (type === 'jumpingjack' ? [11, 12, 15, 16, 23, 24, 27, 28] : type === 'lateral_raise' ? [11, 12, 13, 14, 23, 24] : [23, 24, 27, 28, 29, 30, 31, 32])
    : side ? right : left;
  if (!reliable(lm, ids)) return fail('Move back and keep the working joints fully visible');
  const torso = Math.hypot((lm[11 + side].x - lm[23 + side].x) * aspect, lm[11 + side].y - lm[23 + side].y);
  const width = Math.hypot((lm[11].x - lm[12].x) * aspect, lm[11].y - lm[12].y);
  const sideView = width < torso * 0.55;
  const view = sideView ? 'Side view' : 'Front / back view';
  if (type === 'pushup' && !sideView) return fail('Turn sideways for reliable push-up tracking');
  if (type === 'jumpingjack' && sideView) return fail('Face toward or away from the camera for jumping jacks');
  const hasWorld = world && ids.every(i => ['x', 'y', 'z'].every(k => Number.isFinite(world[i]?.[k])));
  if (['squat', 'lunge'].includes(type) && !sideView && !hasWorld) return fail('Turn sideways while depth tracking recovers');
  const points = hasWorld && !['calfraise', 'lateral_raise', 'jumpingjack'].includes(type)
    ? world : lm.map(p => ({ ...p, x: p.x * aspect, z: 0 }));
  if (type === 'pushup') {
    const shoulder = lm[11 + side], ankle = lm[27 + side];
    if (Math.abs(shoulder.x - ankle.x) * aspect < Math.abs(shoulder.y - ankle.y)) return fail('Get into a horizontal push-up position, camera to your side');
    if (angle3(points[11 + side], points[23 + side], points[27 + side]) < 150) return fail('Keep your hips in line with your shoulders and ankles');
  }
  return { ready: true, hint: `${view} · Tracking active`, view, side, points };
}

export function buildRepCounter() {
  let phase = 'ready';
  let source = '';
  let changedAt = 0;
  let lastFrame = 0;
  let heelBaseline = null;
  const angleHistory = [];
  const HIST = 3;
  const push = (v) => {
    angleHistory.push(v);
    if (angleHistory.length > HIST) angleHistory.shift();
    const sorted = [...angleHistory].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  const visible = (lm, idxs) => idxs.every((i) => {
    const p = lm?.[i];
    if (!p) return false;
    if (p.visibility != null && p.visibility < 0.5) return false;
    return Number.isFinite(p.x) && Number.isFinite(p.y);
  });
  return function countRep(landmarks, workoutType, assessment, now = performance.now()) {
    const reset = () => { phase = 'ready'; angleHistory.length = 0; source = ''; heelBaseline = null; return false; };
    const pose = assessment ?? assessPose(landmarks, workoutType);
    if (!pose.ready) return reset();
    const key = `${workoutType}:${pose.side}:${pose.view}`;
    if (source !== key || now - lastFrame > 500) reset();
    source = key;
    lastFrame = now;
    // Remap the selected visible side into the existing left-side indices.
    const lm = (pose.points ?? landmarks).map((p, i, all) =>
      pose.side && !['lateral_raise', 'calfraise', 'jumpingjack'].includes(workoutType) && [11, 13, 15, 23, 25, 27].includes(i) ? all[i + 1] : p);
    const cycle = (start, end) => {
      if (phase === 'ready' && start) { phase = 'up'; changedAt = now; }
      else if (phase === 'up' && end && now - changedAt >= 200) { phase = 'down'; changedAt = now; }
      else if (phase === 'down' && start && now - changedAt >= 200) { phase = 'up'; changedAt = now; return true; }
      return false;
    };
    try {
      if (!Array.isArray(lm) || lm.length < 29) return false;
      switch (workoutType) {
        case 'pushup': {
          if (!visible(lm, [11, 13, 15])) return false;
          const ang = push(angle3(lm[11], lm[13], lm[15]));
           return cycle(ang > 155, ang < 100);
        }
        case 'squat': {
          if (!visible(lm, [23, 25, 27])) return false;
          const ang = push(angle3(lm[23], lm[25], lm[27]));
           return cycle(ang > 160, ang < 105);
        }
        case 'lunge': {
          if (!visible(lm, [23, 25, 27])) return false;
          const ang = push(angle3(lm[23], lm[25], lm[27]));
           return cycle(ang > 160, ang < 110);
        }
        case 'bicep_curl': {
          if (!visible(lm, [11, 13, 15])) return false;
          const ang = push(angle3(lm[11], lm[13], lm[15]));
           return cycle(ang > 150, ang < 60);
        }
        case 'overhead': {
          if (!visible(lm, [13, 11, 23])) return false;
          const ang = push(angle3(lm[13], lm[11], lm[23]));
           return cycle(ang < 80, ang > 160);
        }
        case 'crunch':
        case 'situp': {
          if (!visible(lm, [11, 23, 25])) return false;
          const ang = push(angle3(lm[11], lm[23], lm[25]));
           return cycle(ang > 140, ang < 80);
        }
        case 'lateral_raise': {
          if (!visible(lm, [11, 12, 13, 14])) return false;
          const shoulderY = (lm[11].y + lm[12].y) / 2;
          const elbowY    = (lm[13].y + lm[14].y) / 2;
           return cycle(elbowY > shoulderY + 0.04, elbowY < shoulderY - 0.02);
        }
        case 'calfraise': {
          if (!visible(lm, [23, 24, 27, 28])) return false;
           const leg = (Math.abs(lm[23].y - lm[27].y) + Math.abs(lm[24].y - lm[28].y)) / 2;
           if (leg < 0.1) return reset();
           const lift = ((lm[31].y - lm[29].y) + (lm[32].y - lm[30].y)) / (2 * leg);
           if (heelBaseline === null) heelBaseline = lift;
           return cycle(lift < heelBaseline + 0.025, lift > heelBaseline + 0.08);
         }
         case 'jumpingjack': {
           const p = landmarks;
           const hipWidth = Math.abs(p[23].x - p[24].x);
           if (hipWidth < 0.025) return reset();
           const spread = Math.abs(p[27].x - p[28].x) / hipWidth;
           return cycle(p[15].y > p[11].y && p[16].y > p[12].y && spread < 1.5,
             p[15].y < p[11].y && p[16].y < p[12].y && spread > 2);
         }
        default: {
          // Never invent reps for a movement with no exercise-specific counter.
          return false;
        }
      }
    } catch {
      return false;
    }
  };
}

// interrupt=true (default): cut off whatever is playing — for start/stop/
// warnings/milestones. interrupt=false: skip silently when something is
// already spoken — for routine AI coaching cues, so a cue arriving mid-speech
// doesn't cancel+restart audio into garbled stutter.
export function speak(text, rate = 1.05, pitch = 1.0, interrupt = true) {
  try {
    const synth = window.speechSynthesis;
    if (!synth || !text) return;
    if (!interrupt && (synth.speaking || synth.pending)) return;
    if (synth.speaking) synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate   = rate;
    u.pitch  = pitch;
    u.volume = 1;
    const voices    = synth.getVoices();
    const preferred =
      voices.find(v => /en[-_](US|GB|AU)/i.test(v.lang) && /Natural|Samantha|Google/i.test(v.name)) ||
      voices.find(v => /en/i.test(v.lang));
    if (preferred) u.voice = preferred;
    synth.speak(u);
  } catch {
    /* voice unavailable — stay silent, overlay text still shows */
  }
}

export function useRepCounter({ voiceEnabled }) {
  const [repCount, setRepCount] = useState(0);

  const repCountRef      = useRef(0);
  const lastSpokenRef    = useRef(0);
  const repCounterRef    = useRef(buildRepCounter());

  useEffect(() => { repCountRef.current = repCount; }, [repCount]);

  // Voice milestone announcements — spoken-rep guard lives in a ref (not state)
  // so announcing never triggers a render cascade.
  useEffect(() => {
    if (!voiceEnabled || repCount === 0 || repCount === lastSpokenRef.current) return;
    if (repCount % 10 === 0) {
      speak(`${repCount} reps! Great work, keep going!`, 1.1, 1.05);
    } else if (repCount % 5 === 0) {
      speak(`${repCount}!`);
    }
    lastSpokenRef.current = repCount;
  }, [repCount, voiceEnabled]);

  const countRep = useCallback((landmarks, type, assessment) => {
    const didRep = repCounterRef.current(landmarks, type, assessment);
    if (didRep) {
      // Update synchronously so target auto-stop sees this final rep before
      // React schedules its render.
      const next = repCountRef.current + 1;
      repCountRef.current = next;
      setRepCount(next);
    }
  }, []);

  const invalidateRep = useCallback(() => { repCounterRef.current = buildRepCounter(); }, []);
  const resetReps = useCallback(() => {
    repCounterRef.current = buildRepCounter();
    setRepCount(0);
    lastSpokenRef.current = 0;
    repCountRef.current = 0;
  }, []);

  const addRep = useCallback(() => {
    repCountRef.current += 1;
    setRepCount(repCountRef.current);
  }, []);

  return { repCount, repCountRef, countRep, resetReps, invalidateRep, addRep };
}
