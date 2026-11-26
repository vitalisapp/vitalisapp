// Warm-up and cool-down movement library (Revision #3).
//
// Guidance followed (ACSM Guidelines for Exercise Testing and Prescription):
//   • Warm-up: 5–10 min of light-to-moderate cardio + dynamic movement that
//     rehearses the session's patterns. Beginners keep it gentle.
//   • Static stretching: mainly AFTER training (or when muscles are warm);
//     hold 10–30 s, to mild tension, never pain.
//
//   phase    warmup | cooldown
//   kind     pulse (light cardio) | dynamic (mobility) | activation | static
//   regions  lower | upper | core | full   (body areas it prepares/stretches)
//   level    1 suitable for everyone · 2 intermediate+ · 3 advanced only
//   impact   low | high
//   flags    exclusion categories (see exercisePool EXCLUSION_CATEGORIES);
//            a move is never suggested to users who excluded one of them
//   measure  time (seconds) | reps
//   perSide  true → the dose applies to each side
//   easier   a gentler version the user can switch to at any time

const WARMUP_MOVES = [
  // ── Pulse raisers (light cardio) ─────────────────────────────────────
  {
    key: 'march_in_place', name: 'March in Place', phase: 'warmup', kind: 'pulse', regions: ['full', 'lower'], level: 1, impact: 'low', flags: [], measure: 'time',
    steps: ['Stand tall with your arms relaxed.', 'Lift one knee to about hip height, then the other, at an easy rhythm.', 'Swing your arms naturally and breathe steadily.'],
    cue: 'Easy pace — you should be able to talk.',
    easier: { name: 'Seated Marching', steps: ['Sit near the front of a sturdy chair.', 'Lift one knee, then the other, as if marching.', 'Move your arms along if comfortable.'] },
  },
  {
    key: 'step_jacks', name: 'Step Jacks', phase: 'warmup', kind: 'pulse', regions: ['full'], level: 1, impact: 'low', flags: [], measure: 'time',
    steps: ['Stand with feet together.', 'Step one foot out to the side while raising both arms.', 'Step back in and lower the arms. Alternate sides.'],
    cue: 'No jumping — step and reach.',
    easier: { name: 'March in Place', steps: ['Lift one knee, then the other, at an easy rhythm.', 'Swing your arms naturally.'] },
  },
  {
    key: 'jumping_jacks', name: 'Jumping Jacks', phase: 'warmup', kind: 'pulse', regions: ['full'], level: 2, impact: 'high', flags: ['HIGH_IMPACT'], measure: 'time',
    steps: ['Stand with feet together and arms by your sides.', 'Jump your feet apart while raising your arms overhead.', 'Jump back to the start. Keep a light, steady rhythm.'],
    cue: 'Land softly on the balls of your feet.',
    easier: { name: 'Step Jacks', steps: ['Step one foot out to the side while raising both arms.', 'Step back in. Alternate sides.'] },
  },
  {
    key: 'high_knees', name: 'High Knees', phase: 'warmup', kind: 'pulse', regions: ['full', 'lower'], level: 3, impact: 'high', flags: ['HIGH_IMPACT', 'RUNNING'], measure: 'time',
    steps: ['Jog in place, driving your knees up toward hip height.', 'Pump your arms.', 'Build from easy to moderate speed.'],
    cue: 'Stay tall; quick, light feet.',
    easier: { name: 'Fast March', steps: ['March in place, lifting the knees high.', 'Keep one foot on the floor at all times.'] },
  },

  // ── Dynamic mobility ─────────────────────────────────────────────────
  {
    key: 'arm_circles', name: 'Arm Circles', phase: 'warmup', kind: 'dynamic', regions: ['upper'], level: 1, impact: 'low', flags: [], measure: 'time',
    steps: ['Stand with arms out to the sides at shoulder height.', 'Make small circles forward, slowly getting bigger.', 'Halfway through, reverse direction.'],
    cue: 'Relax the neck and keep shoulders down.',
    easier: { name: 'Shoulder Rolls', steps: ['Let your arms hang by your sides.', 'Roll your shoulders up, back and down in slow circles.'] },
  },
  {
    key: 'shoulder_rolls', name: 'Shoulder Rolls', phase: 'warmup', kind: 'dynamic', regions: ['upper'], level: 1, impact: 'low', flags: [], measure: 'time',
    steps: ['Stand or sit tall with arms relaxed.', 'Roll your shoulders up, back and down in slow circles.', 'Switch to forward circles halfway.'],
    cue: 'Slow and smooth.',
    easier: { name: 'Seated Shoulder Rolls', steps: ['Do the same movement sitting on a chair, with a smaller range.'] },
  },
  {
    key: 'torso_twists', name: 'Standing Torso Twists', phase: 'warmup', kind: 'dynamic', regions: ['core', 'full'], level: 1, impact: 'low', flags: [], measure: 'time',
    steps: ['Stand with feet hip-width apart, arms bent in front of your chest.', 'Turn your upper body gently to one side, then the other.', 'Let your hips follow a little.'],
    cue: 'Turn from the middle back, not by swinging hard.',
    easier: { name: 'Seated Torso Twists', steps: ['Sit tall on a chair, hands on your shoulders.', 'Turn gently to each side within a comfortable range.'] },
  },
  {
    key: 'hip_circles', name: 'Hip Circles', phase: 'warmup', kind: 'dynamic', regions: ['lower', 'core'], level: 1, impact: 'low', flags: [], measure: 'time',
    steps: ['Stand with hands on your hips, feet shoulder-width apart.', 'Draw slow circles with your hips.', 'Reverse direction halfway.'],
    cue: 'Keep the circles slow and controlled.',
    easier: { name: 'Supported Hip Circles', steps: ['Hold the back of a chair for balance.', 'Make smaller circles with your hips.'] },
  },
  {
    key: 'leg_swings', name: 'Leg Swings', phase: 'warmup', kind: 'dynamic', regions: ['lower'], level: 1, impact: 'low', flags: [], measure: 'reps', perSide: true,
    steps: ['Hold a wall or chair with one hand.', 'Swing the outside leg forward and back in a relaxed arc.', 'Do all reps, then switch legs.'],
    cue: 'Let the range grow gradually — never kick.',
    easier: { name: 'Supported Knee Lifts', steps: ['Hold a wall or chair.', 'Slowly lift one knee toward your chest and lower it.', 'Switch legs.'] },
  },
  {
    key: 'good_mornings', name: 'Bodyweight Good Mornings', phase: 'warmup', kind: 'dynamic', regions: ['lower', 'core'], level: 1, impact: 'low', flags: [], measure: 'reps',
    steps: ['Stand with feet hip-width apart, hands on your hips.', 'Soften your knees and push your hips back, tipping your chest forward with a flat back.', 'Stop when you feel the back of your legs, then stand tall.'],
    cue: 'Flat back; the movement comes from the hips.',
    easier: { name: 'Half Good Mornings', steps: ['Rest your hands on your thighs.', 'Hinge only a small way forward and back up.'] },
  },
  {
    key: 'squat_to_reach', name: 'Squat to Overhead Reach', phase: 'warmup', kind: 'dynamic', regions: ['lower', 'full'], level: 2, impact: 'low', flags: [], measure: 'reps',
    steps: ['Stand with feet shoulder-width apart.', 'Sit into an easy squat, reaching your hands toward the floor.', 'Stand up and reach both arms overhead.'],
    cue: 'Move through a comfortable depth; it gets deeper as you warm up.',
    easier: { name: 'Chair Sit-to-Stand', steps: ['Stand in front of a chair.', 'Sit down slowly, then stand back up without using your hands if you can.'] },
  },
  {
    key: 'reverse_lunge_reach', name: 'Reverse Lunge with Reach', phase: 'warmup', kind: 'dynamic', regions: ['lower', 'core'], level: 2, impact: 'low', flags: [], measure: 'reps', perSide: true,
    steps: ['Step one foot back into a gentle lunge.', 'Reach both arms overhead and lean slightly away from the back leg.', 'Step back to standing and switch sides.'],
    cue: 'Short step at first; front knee over the ankle.',
    easier: { name: 'Supported Step-Backs', steps: ['Hold a chair.', 'Step one foot back a short distance, bend both knees a little, and return.'] },
  },
  {
    key: 'inchworm', name: 'Inchworms', phase: 'warmup', kind: 'dynamic', regions: ['full', 'upper', 'core'], level: 3, impact: 'low', flags: ['WRIST_LOAD'], measure: 'reps',
    steps: ['From standing, bend forward and place your hands on the floor (bend the knees as needed).', 'Walk your hands out to a high plank.', 'Walk the hands back toward your feet and stand up.'],
    cue: 'Keep your core tight in the plank.',
    easier: { name: 'Wall Walk-Outs', steps: ['Face a wall, hands on it at shoulder height.', 'Walk your feet back until you lean at an angle, then walk back in.'] },
  },
  {
    key: 'cat_cow', name: 'Cat-Cow', phase: 'warmup', kind: 'dynamic', regions: ['core'], level: 1, impact: 'low', flags: ['KNEELING', 'WRIST_LOAD'], measure: 'time',
    steps: ['Start on hands and knees.', 'Breathe in, drop your belly and lift your chest.', 'Breathe out, round your back and tuck your chin.'],
    cue: 'Move with your breath.',
    easier: { name: 'Seated Cat-Cow', steps: ['Sit on a chair, hands on your knees.', 'Arch your back as you breathe in, round it as you breathe out.'] },
  },

  // ── Activation (light rehearsal of the session) ──────────────────────
  {
    key: 'wall_pushups', name: 'Wall Push-Ups', phase: 'warmup', kind: 'activation', regions: ['upper'], level: 1, impact: 'low', flags: [], measure: 'reps',
    steps: ['Stand an arm’s length from a wall, hands on it at shoulder height.', 'Bend your elbows to bring your chest toward the wall.', 'Push back to the start.'],
    cue: 'Body in one straight line.',
    easier: { name: 'Wall Push-Ups, Close Stance', steps: ['Stand closer to the wall so less body weight is used.', 'Do small, slow bends of the elbows.'] },
  },
  {
    key: 'glute_squeeze_bridge', name: 'Glute Bridges', phase: 'warmup', kind: 'activation', regions: ['lower', 'core'], level: 1, impact: 'low', flags: ['FLOOR'], measure: 'reps',
    steps: ['Lie on your back, knees bent, feet flat.', 'Squeeze your glutes and lift your hips until your body is straight from knees to shoulders.', 'Lower slowly.'],
    cue: 'Push through your heels.',
    easier: { name: 'Standing Glute Squeezes', steps: ['Stand tall holding a chair.', 'Squeeze your glutes for 2 seconds, then relax.'] },
  },
  {
    key: 'standing_glute_kickback', name: 'Standing Glute Kickbacks', phase: 'warmup', kind: 'activation', regions: ['lower'], level: 1, impact: 'low', flags: [], measure: 'reps', perSide: true,
    steps: ['Hold a wall or chair.', 'Keeping your leg straight, press it back a short way, squeezing the glute.', 'Return slowly and repeat, then switch legs.'],
    cue: 'Don’t arch your lower back.',
    easier: { name: 'Standing Glute Squeezes', steps: ['Stand tall holding a chair.', 'Squeeze your glutes for 2 seconds, then relax.'] },
  },
];

const COOLDOWN_MOVES = [
  {
    key: 'walk_it_out', name: 'Easy Walk / Slow March', phase: 'cooldown', kind: 'pulse', regions: ['full'], level: 1, impact: 'low', flags: [], measure: 'time',
    steps: ['Walk or march slowly in place.', 'Let your breathing and heart rate settle.'],
    cue: 'Gradually slow down — don’t stop suddenly.',
    easier: { name: 'Seated Rest with Deep Breaths', steps: ['Sit on a chair and breathe slowly in through the nose and out through the mouth.'] },
  },
  {
    key: 'hamstring_stretch', name: 'Standing Hamstring Stretch', phase: 'cooldown', kind: 'static', regions: ['lower'], level: 1, impact: 'low', flags: [], measure: 'time', perSide: true,
    steps: ['Place one heel on a low step, leg straight, toes up.', 'Hinge forward from your hips with a flat back.', 'Hold where you feel a gentle stretch, then switch legs.'],
    cue: 'Mild tension, never pain. Breathe slowly.',
    easier: { name: 'Seated Hamstring Stretch', steps: ['Sit on the edge of a chair with one leg straight, heel on the floor.', 'Lean forward slightly with a flat back. Switch legs.'] },
  },
  {
    key: 'quad_stretch', name: 'Standing Quad Stretch', phase: 'cooldown', kind: 'static', regions: ['lower'], level: 1, impact: 'low', flags: [], measure: 'time', perSide: true,
    steps: ['Stand tall holding a wall for balance.', 'Bend one knee and hold your ankle behind you.', 'Gently bring your heel toward your glutes. Switch legs.'],
    cue: 'Knees side by side, hips tucked under.',
    easier: { name: 'Towel-Assisted Quad Stretch', steps: ['Loop a towel around your ankle and hold the ends.', 'Bend the knee only as far as is comfortable.'] },
  },
  {
    key: 'calf_stretch', name: 'Wall Calf Stretch', phase: 'cooldown', kind: 'static', regions: ['lower'], level: 1, impact: 'low', flags: [], measure: 'time', perSide: true,
    steps: ['Stand facing a wall, hands on it.', 'Step one foot back, heel down, back leg straight.', 'Lean toward the wall until you feel the calf stretch. Switch legs.'],
    cue: 'Back heel stays on the floor.',
    easier: { name: 'Short-Stance Calf Stretch', steps: ['Do the same stretch with a shorter step back.'] },
  },
  {
    key: 'figure_four_chair', name: 'Seated Figure-4 Glute Stretch', phase: 'cooldown', kind: 'static', regions: ['lower'], level: 1, impact: 'low', flags: [], measure: 'time', perSide: true,
    steps: ['Sit tall on a chair.', 'Cross one ankle over the opposite knee.', 'Lean forward slightly with a flat back until you feel the hip. Switch sides.'],
    cue: 'Flat back; let the knee relax down.',
    easier: { name: 'Ankle-Over-Knee Rest', steps: ['Cross the ankle over the knee and simply sit tall without leaning forward.'] },
  },
  {
    key: 'standing_hip_flexor', name: 'Standing Hip Flexor Stretch', phase: 'cooldown', kind: 'static', regions: ['lower', 'core'], level: 1, impact: 'low', flags: [], measure: 'time', perSide: true,
    steps: ['Take a long step forward into a split stance, holding a chair if needed.', 'Tuck your hips under and gently shift forward.', 'Feel the stretch at the front of the back hip. Switch sides.'],
    cue: 'Squeeze the back glute; don’t arch the lower back.',
    easier: { name: 'Short Split-Stance Stretch', steps: ['Use a shorter step and hold a chair.', 'Only tuck the hips — no forward shift.'] },
  },
  {
    key: 'chest_doorway', name: 'Doorway Chest Stretch', phase: 'cooldown', kind: 'static', regions: ['upper'], level: 1, impact: 'low', flags: [], measure: 'time',
    steps: ['Stand in a doorway with forearms on the frame, elbows at shoulder height.', 'Step one foot forward and lean gently until you feel the chest open.'],
    cue: 'Shoulders down, chin level.',
    easier: { name: 'Hands-Behind-Back Chest Opener', steps: ['Clasp your hands lightly behind your back (or hold a towel).', 'Gently squeeze the shoulder blades together.'] },
  },
  {
    key: 'cross_body_shoulder', name: 'Cross-Body Shoulder Stretch', phase: 'cooldown', kind: 'static', regions: ['upper'], level: 1, impact: 'low', flags: [], measure: 'time', perSide: true,
    steps: ['Bring one arm across your chest.', 'Use the other hand to hold it just above the elbow.', 'Gently draw it closer. Switch arms.'],
    cue: 'Keep the shoulder down, away from the ear.',
    easier: { name: 'Light Cross-Body Hold', steps: ['Rest the arm across your chest without pulling.'] },
  },
  {
    key: 'triceps_overhead', name: 'Overhead Triceps Stretch', phase: 'cooldown', kind: 'static', regions: ['upper'], level: 1, impact: 'low', flags: [], measure: 'time', perSide: true,
    steps: ['Raise one arm and bend the elbow so the hand drops behind your head.', 'Use the other hand to gently press the elbow.', 'Switch arms.'],
    cue: 'Stand tall; don’t lean back.',
    easier: { name: 'Towel Triceps Stretch', steps: ['Hold a towel in the raised hand and let it hang behind you.', 'Gently pull the towel down with the other hand.'] },
  },
  {
    key: 'seated_side_bend', name: 'Seated Side Bend', phase: 'cooldown', kind: 'static', regions: ['core', 'upper'], level: 1, impact: 'low', flags: [], measure: 'time', perSide: true,
    steps: ['Sit tall on a chair.', 'Raise one arm overhead and lean gently to the opposite side.', 'Switch sides.'],
    cue: 'Lengthen up before you lean.',
    easier: { name: 'Hand-on-Hip Side Bend', steps: ['Keep the hand on your hip instead of overhead and lean a short way.'] },
  },
  {
    key: 'childs_pose', name: "Child's Pose", phase: 'cooldown', kind: 'static', regions: ['core', 'lower'], level: 1, impact: 'low', flags: ['KNEELING', 'FLOOR'], measure: 'time',
    steps: ['Kneel and sit back toward your heels.', 'Fold forward and reach your arms in front.', 'Rest and breathe slowly.'],
    cue: 'Let your back relax with every breath out.',
    easier: { name: 'Seated Forward Fold', steps: ['Sit on a chair, feet apart.', 'Fold forward and let your arms hang toward the floor.'] },
  },
  {
    key: 'deep_breathing', name: 'Deep Breathing', phase: 'cooldown', kind: 'static', regions: ['full'], level: 1, impact: 'low', flags: [], measure: 'time',
    steps: ['Stand or sit comfortably.', 'Breathe in through your nose for 4 counts.', 'Breathe out through your mouth for 6 counts.'],
    cue: 'Let your shoulders drop on every breath out.',
    easier: { name: 'Natural Breathing', steps: ['Just breathe slowly and comfortably.'] },
  },
];

module.exports = { WARMUP_MOVES, COOLDOWN_MOVES };
