// Section 7 — how to set up the camera, perform the movement and how Vitalis
// counts it. Keyed by rep-counter type (see useRepCounter.js). The counting
// text mirrors the real thresholds in buildRepCounter, so what users read is
// exactly what the system checks.

const FULL_BODY = 2; // metres from the phone
const UPPER_BODY = 1.5;

/** @typedef {{ distanceM: number, view: 'side'|'front', frame: string, height: string }} Setup */

export const COUNTER_GUIDES = {
  pushup: {
    setup: { distanceM: FULL_BODY, view: 'side', frame: 'Your whole body from head to feet', height: 'Phone on the floor or a low step, landscape' },
    steps: [
      'Place your hands slightly wider than your shoulders.',
      'Straighten your body from head to heels. Brace your stomach.',
      'Bend your elbows and lower your chest toward the floor.',
      'Push back up until your arms are straight.',
    ],
    cues: ['Keep hips in line with shoulders and ankles', 'Elbows about 45° from your body', 'Breathe out as you push up'],
    mistakes: ['Hips sagging or piking up', 'Only going halfway down', 'Head dropping forward'],
    counting: 'Vitalis measures your elbow angle. A rep counts when your arms go from straight (over 155°) to bent (under 100°) and back to straight.',
    partial: 'Lower your chest a little more. That rep was too shallow to count.',
    easier: 'Do them with your knees on the floor or hands on a bench.',
  },
  squat: {
    setup: { distanceM: FULL_BODY, view: 'side', frame: 'Your whole body, including feet', height: 'Phone at hip height, portrait or landscape' },
    steps: [
      'Stand with feet shoulder-width apart, toes slightly out.',
      'Push your hips back and bend your knees as if sitting on a chair.',
      'Go down until your thighs are about parallel to the floor.',
      'Push through your heels to stand back up.',
    ],
    cues: ['Chest up, back straight', 'Knees follow your toes', 'Heels stay on the floor'],
    mistakes: ['Knees caving inward', 'Heels lifting', 'Rounding the lower back'],
    counting: 'Vitalis measures your knee angle. A rep counts when you go from standing (knee over 160°) to a squat (under 105°) and stand up again.',
    partial: 'Squat a bit deeper. Aim for thighs parallel to the floor.',
    easier: 'Squat down to a chair and stand back up.',
  },
  lunge: {
    setup: { distanceM: FULL_BODY, view: 'side', frame: 'Your whole body, including both feet', height: 'Phone at hip height' },
    steps: [
      'Stand tall with feet hip-width apart.',
      'Take a long step forward (or back).',
      'Lower until both knees are bent about 90°.',
      'Push back to standing and switch legs.',
    ],
    cues: ['Front knee over the ankle', 'Upper body upright', 'Control the way down'],
    mistakes: ['Front knee going far past the toes', 'Leaning forward', 'Steps too short'],
    counting: 'Vitalis measures the knee of the leg facing the camera. A rep counts when it goes from straight (over 160°) to bent (under 110°) and back.',
    partial: 'Lower your back knee closer to the floor.',
    easier: 'Hold a wall or chair for balance.',
  },
  bicep_curl: {
    setup: { distanceM: UPPER_BODY, view: 'side', frame: 'Your upper body and hips', height: 'Phone at chest height' },
    steps: [
      'Stand tall holding weights (or water bottles), arms down, palms forward.',
      'Keep your elbows close to your sides.',
      'Curl the weights up toward your shoulders.',
      'Lower slowly until your arms are straight.',
    ],
    cues: ['Elbows stay pinned to your sides', 'No swinging', 'Lower for 2 seconds'],
    mistakes: ['Swinging the body', 'Elbows drifting forward', 'Not straightening the arm'],
    counting: 'Vitalis measures your elbow angle. A rep counts when your arm goes from straight (over 150°) to fully curled (under 60°) and back down.',
    partial: 'Curl all the way up, then straighten your arm fully.',
    easier: 'Use lighter weights or water bottles.',
  },
  overhead: {
    setup: { distanceM: UPPER_BODY, view: 'side', frame: 'Your upper body, hips and raised hands', height: 'Phone at chest height' },
    steps: [
      'Stand tall with weights at shoulder height, palms forward.',
      'Brace your stomach and squeeze your glutes.',
      'Press the weights straight up until your arms are straight.',
      'Lower back to your shoulders with control.',
    ],
    cues: ['Do not arch your lower back', 'Press straight up, not forward', 'Head stays neutral'],
    mistakes: ['Leaning back', 'Stopping halfway', 'Elbows flaring way out'],
    counting: 'Vitalis measures the angle at your shoulder. A rep counts when your arm goes from down (under 80°) to fully overhead (over 160°) and back.',
    partial: 'Press all the way up until your arms are straight.',
    easier: 'Press one arm at a time, or sit on a chair.',
  },
  crunch: {
    setup: { distanceM: FULL_BODY, view: 'side', frame: 'Your shoulders, hips and knees', height: 'Phone on the floor, landscape' },
    steps: [
      'Lie on your back, knees bent, feet flat on the floor.',
      'Put your hands across your chest or lightly behind your head.',
      'Curl your shoulders up off the floor using your stomach.',
      'Lower back down slowly.',
    ],
    cues: ['Do not pull on your neck', 'Breathe out on the way up', 'Lower back stays down'],
    mistakes: ['Pulling the head forward', 'Using momentum', 'Holding your breath'],
    counting: 'Vitalis measures the angle at your hips. A rep counts when you curl up from lying (over 140°) to under 80° and lie back down.',
    partial: 'Curl up a little higher before lowering.',
    easier: 'Keep your hands on your thighs and slide them toward your knees.',
  },
  situp: {
    setup: { distanceM: FULL_BODY, view: 'side', frame: 'Your shoulders, hips and knees', height: 'Phone on the floor, landscape' },
    steps: [
      'Lie on your back, knees bent, feet flat or anchored.',
      'Cross your arms over your chest.',
      'Sit all the way up using your stomach.',
      'Lower back down with control.',
    ],
    cues: ['Move slowly', 'Breathe out on the way up', 'Keep feet down'],
    mistakes: ['Using your arms to pull yourself up', 'Dropping back fast', 'Pulling on the neck'],
    counting: 'Vitalis measures the angle at your hips. A rep counts when you go from lying (over 140°) to sitting up (under 80°) and back down.',
    partial: 'Sit up a little higher so the rep counts.',
    easier: 'Do crunches instead.',
  },
  lateral_raise: {
    setup: { distanceM: UPPER_BODY, view: 'front', frame: 'Your upper body and both arms out to the side', height: 'Phone at chest height' },
    steps: [
      'Stand tall holding light weights at your sides.',
      'Keep a small bend in your elbows.',
      'Raise both arms out to the sides up to shoulder height.',
      'Lower slowly back to your sides.',
    ],
    cues: ['Lead with your elbows', 'Stop at shoulder height', 'Shoulders down, away from ears'],
    mistakes: ['Shrugging', 'Swinging the weights', 'Going too heavy'],
    counting: 'Vitalis compares your elbows with your shoulders. A rep counts when your elbows go from below your shoulders to just above them and back down.',
    partial: 'Raise your elbows up to shoulder height.',
    easier: 'Use water bottles or no weight.',
  },
  calfraise: {
    setup: { distanceM: FULL_BODY, view: 'front', frame: 'Your legs and feet clearly visible', height: 'Phone at knee height' },
    steps: [
      'Stand tall with feet hip-width apart, near a wall for balance.',
      'Rise up onto the balls of your feet as high as you can.',
      'Pause for a second at the top.',
      'Lower your heels slowly to the floor.',
    ],
    cues: ['Go straight up, not forward', 'Pause at the top', 'Lower slowly'],
    mistakes: ['Bouncing', 'Rolling onto the outer foot', 'Rushing the reps'],
    counting: 'Vitalis tracks how high your heels lift compared with where they started. A rep counts when your heels rise clearly and return to the floor. Stand still for a moment first so it can learn your starting position.',
    partial: 'Rise a little higher onto your toes.',
    easier: 'Hold a wall or chair.',
  },
  jumpingjack: {
    setup: { distanceM: FULL_BODY, view: 'front', frame: 'Your whole body with arms raised overhead', height: 'Phone at waist height' },
    steps: [
      'Stand with feet together, arms at your sides.',
      'Jump your feet out wide while raising your arms overhead.',
      'Jump back to feet together, arms down.',
      'Keep a steady rhythm.',
    ],
    cues: ['Land softly on the balls of your feet', 'Arms fully overhead', 'Breathe steadily'],
    mistakes: ['Arms only halfway up', 'Landing heavily', 'Feet not wide enough'],
    counting: 'Vitalis checks your hands and feet. A rep counts when your hands go above your shoulders with feet wide apart, then back down with feet together.',
    partial: 'Raise your hands above your head and jump your feet wider.',
    easier: 'Step one foot out at a time instead of jumping.',
  },
};

const HOLD_GUIDE = {
  setup: { distanceM: FULL_BODY, view: 'side', frame: 'Your whole body from head to feet', height: 'Phone on the floor or a low step, landscape' },
  counting: 'The timer only runs while the camera sees you holding still in position. If you move out of position or out of view, it pauses until you are back.',
};

const GENERIC_GUIDE = {
  setup: { distanceM: FULL_BODY, view: 'front', frame: 'Your whole body', height: 'Phone at waist height' },
  counting: 'This exercise has no automatic counter yet. The timer runs while you train. Tap "+1 rep" after each rep so your log stays accurate.',
};

/**
 * Everything the briefing needs for one resolved workout.
 * @param {{counterType?: string, mode?: string, label?: string}} workout
 * @param {{steps?: string[], cues?: string[], mistakes?: string[]}} [libraryGuide] steps from the Section 3 exercise guide
 */
export function briefingFor(workout, libraryGuide) {
  const type = workout?.counterType;
  const isHold = workout?.mode === 'hold';
  const base = isHold ? HOLD_GUIDE : COUNTER_GUIDES[type] || GENERIC_GUIDE;
  const counted = !isHold && Boolean(COUNTER_GUIDES[type]);
  const g = COUNTER_GUIDES[type] || {};
  const pick = (k) => (libraryGuide?.[k]?.length ? libraryGuide[k] : g[k] || []);
  return {
    label: workout?.label || 'Exercise',
    setup: base.setup,
    steps: pick('steps'),
    cues: pick('cues'),
    mistakes: pick('mistakes'),
    easier: g.easier || null,
    counting: base.counting,
    method: isHold ? 'hold' : counted ? 'auto' : 'manual',
  };
}

/** Short spoken version (text-to-speech). */
export function spokenBriefing(b) {
  const s = b.setup;
  const parts = [
    `${b.label}.`,
    `Set up: place your phone about ${s.distanceM === 2 ? 'two' : 'one and a half'} meters away, ${s.height.toLowerCase()}.`,
    `Stand ${s.view === 'side' ? 'sideways to the camera' : 'facing the camera'}, so it can see ${s.frame.toLowerCase()}.`,
  ];
  if (b.steps.length) parts.push('How to do it.', ...b.steps.map((t, i) => `Step ${i + 1}. ${t}`));
  if (b.cues.length) parts.push(`Remember: ${b.cues.slice(0, 2).join('. ')}.`);
  parts.push(b.counting);
  return parts.join(' ');
}

/** Hint spoken when a movement is started but not finished (see buildRepCounter onPartial). */
export function partialHint(type) {
  return COUNTER_GUIDES[type]?.partial || null;
}
