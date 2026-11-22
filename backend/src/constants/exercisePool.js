// Curated exercise pool for the workout recommender (Section 3).
//
// Every `name` matches an exercise in the @bryllim/workout-guide catalog the
// frontend uses, so plan days show the right pictures. Each entry carries the
// metadata the recommender filters on and plain-language instructions
// (steps, form cues, common mistakes) shown in the exercise detail view.
//
//   pattern  — movement slot: squat | lunge | hinge | glute | push | pull |
//              core | cardio | mobility
//   equip    — bodyweight | dumbbell | kettlebell | band | pullup | barbell |
//              cardio  (bodyweight is always available)
//   level    — 1 beginner · 2 intermediate · 3 advanced
//   impact   — low | high (jumping / running / ballistic)
//   flags    — exclusion categories this exercise belongs to (see
//              EXCLUSION_CATEGORIES)
//   measure  — reps | time

const EXCLUSION_CATEGORIES = [
  { key: 'HIGH_IMPACT', label: 'Jumping / high-impact', desc: 'Jumps, hops and fast moves that pound the joints.' },
  { key: 'RUNNING', label: 'Running', desc: 'Running, sprinting and jogging in place.' },
  { key: 'FLOOR', label: 'Lying on the floor', desc: 'Exercises done lying face-up or face-down.' },
  { key: 'KNEELING', label: 'Kneeling', desc: 'Moves that put weight on your knees.' },
  { key: 'OVERHEAD', label: 'Overhead pressing', desc: 'Pushing weight or your body above your head.' },
  { key: 'HEAVY_LIFTING', label: 'Heavy barbell lifting', desc: 'Barbell squats, deadlifts and presses.' },
  { key: 'WRIST_LOAD', label: 'Weight on the wrists', desc: 'Planks, push-ups and crawls on your hands.' },
];

const EXERCISES = [
  // ── Squat ────────────────────────────────────────────────────────────
  {
    name: 'Bodyweight Squat', pattern: 'squat', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Quads, glutes',
    steps: ['Stand with feet shoulder-width apart, toes slightly out.', 'Push your hips back and bend your knees as if sitting on a chair.', 'Lower until your thighs are about parallel to the floor, or as low as is comfortable.', 'Push through your whole foot to stand back up.'],
    cues: ['Keep your chest up and back flat.', 'Knees track in line with your toes.', 'Weight stays on your heels and mid-foot.'],
    mistakes: ['Knees caving inward.', 'Heels lifting off the floor.', 'Rounding the lower back at the bottom.'],
  },
  {
    name: 'Wall Sit', pattern: 'squat', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'time', muscle: 'Quads',
    steps: ['Stand with your back against a wall, feet about 60 cm in front of you.', 'Slide down until your knees are bent close to 90°.', 'Hold the position, breathing steadily.', 'Slide back up to finish.'],
    cues: ['Back and head stay flat on the wall.', 'Knees stay above your ankles, not past your toes.'],
    mistakes: ['Holding your breath.', 'Pushing your hands on your thighs to help.'],
  },
  {
    name: 'Goblet Squat', pattern: 'squat', equip: 'dumbbell', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Quads, glutes, core',
    steps: ['Hold one dumbbell vertically at your chest with both hands.', 'Stand with feet slightly wider than shoulder-width.', 'Sit down between your heels, keeping the weight close to your chest.', 'Drive up through your feet to stand tall.'],
    cues: ['Elbows point down and stay inside your knees.', 'Chest stays proud the whole time.'],
    mistakes: ['Letting the dumbbell drift away from your body.', 'Leaning forward and rounding the back.'],
  },
  {
    name: 'Banded Squat', pattern: 'squat', equip: 'band', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Quads, glutes',
    steps: ['Place a loop band just above your knees.', 'Stand with feet shoulder-width apart.', 'Squat down while pushing your knees out against the band.', 'Stand back up, keeping tension on the band.'],
    cues: ['Keep pressing your knees outward.', 'Sit back, not straight down.'],
    mistakes: ['Letting the band pull your knees together.'],
  },
  {
    name: 'Squat', pattern: 'squat', equip: 'barbell', level: 3, impact: 'low', flags: ['HEAVY_LIFTING'], measure: 'reps', muscle: 'Quads, glutes, back',
    steps: ['Set the bar on your upper back (not your neck) in a rack.', 'Step back, feet shoulder-width, brace your core.', 'Sit down and back until your thighs are at least parallel.', 'Drive up, keeping your chest and hips rising together.'],
    cues: ['Big breath and tight core before each rep.', 'Knees out, whole foot on the floor.'],
    mistakes: ['Good-morning squat (hips rise first).', 'Lifting without safety bars set.'],
  },
  {
    name: 'Jump Squat', pattern: 'squat', equip: 'bodyweight', level: 2, impact: 'high', flags: ['HIGH_IMPACT'], measure: 'reps', muscle: 'Quads, glutes, calves',
    steps: ['Start in a shoulder-width stance.', 'Squat down to about half depth.', 'Explode up and jump, swinging your arms.', 'Land softly on the balls of your feet and sink straight into the next squat.'],
    cues: ['Land quietly with bent knees.', 'Use your arms to drive upward.'],
    mistakes: ['Landing with straight, locked knees.', 'Knees collapsing inward on landing.'],
  },

  // ── Lunge / single leg ───────────────────────────────────────────────
  {
    name: 'Forward Lunge', pattern: 'lunge', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Quads, glutes',
    steps: ['Stand tall with feet hip-width apart.', 'Take a big step forward and lower your back knee toward the floor.', 'Both knees should bend to about 90°.', 'Push off the front foot to return to standing. Alternate legs.'],
    cues: ['Torso stays upright.', 'Front knee stays over the ankle.'],
    mistakes: ['Taking too short a step so the knee shoots past the toes.', 'Slamming the back knee into the floor.'],
  },
  {
    name: 'Reverse Lunge', pattern: 'lunge', equip: 'dumbbell', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Quads, glutes',
    steps: ['Hold a dumbbell in each hand at your sides.', 'Step one foot back and lower until both knees are bent about 90°.', 'Push through the front heel to bring the back foot in.', 'Alternate legs or finish one side first.'],
    cues: ['Most of your weight stays on the front leg.', 'Shoulders stay over your hips.'],
    mistakes: ['Leaning forward over the front knee.'],
  },
  {
    name: 'Lateral Lunge', pattern: 'lunge', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Inner thighs, glutes',
    steps: ['Stand with feet together.', 'Take a wide step to the side and sit your hips back over that foot.', 'Keep the other leg straight.', 'Push back to the start and switch sides.'],
    cues: ['Toes point forward.', 'Chest up, back flat.'],
    mistakes: ['Bending the straight leg.', 'Letting the bent knee cave in.'],
  },
  {
    name: 'Bulgarian Split Squat', pattern: 'lunge', equip: 'dumbbell', level: 2, impact: 'low', flags: [], measure: 'reps', muscle: 'Quads, glutes',
    steps: ['Stand about two steps in front of a bench and rest the top of your back foot on it.', 'Hold dumbbells at your sides.', 'Lower straight down until your front thigh is near parallel.', 'Drive up through the front heel. Finish all reps, then switch legs.'],
    cues: ['Front shin stays fairly vertical.', 'Control the lowering for 2 seconds.'],
    mistakes: ['Standing too close to the bench.', 'Bouncing out of the bottom.'],
  },
  {
    name: 'Step-Up', pattern: 'lunge', equip: 'dumbbell', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Quads, glutes',
    steps: ['Stand facing a sturdy box or step, dumbbells at your sides (optional).', 'Place one whole foot on the step.', 'Push through that foot to stand up on the step.', 'Step back down slowly. Alternate legs.'],
    cues: ['Drive through the heel of the top foot.', 'Avoid pushing off the bottom foot.'],
    mistakes: ['Using a step that is too high to control.'],
  },

  // ── Hinge / glutes ───────────────────────────────────────────────────
  {
    name: 'Glute Bridge', pattern: 'glute', equip: 'bodyweight', level: 1, impact: 'low', flags: ['FLOOR'], measure: 'reps', muscle: 'Glutes, hamstrings',
    steps: ['Lie on your back, knees bent, feet flat and hip-width apart.', 'Press through your heels and lift your hips.', 'Stop when your body forms a straight line from shoulders to knees.', 'Pause and squeeze, then lower slowly.'],
    cues: ['Squeeze your glutes at the top.', 'Ribs down, do not arch your lower back.'],
    mistakes: ['Pushing through the toes.', 'Over-arching the back at the top.'],
  },
  {
    name: 'Dumbbell Hip Thrust', pattern: 'glute', equip: 'dumbbell', level: 2, impact: 'low', flags: [], measure: 'reps', muscle: 'Glutes',
    steps: ['Sit with your upper back against a bench, dumbbell resting on your hips.', 'Plant your feet hip-width apart, knees bent.', 'Drive your hips up until your thighs and torso are level.', 'Lower under control.'],
    cues: ['Chin tucked, eyes forward.', 'Shins vertical at the top.'],
    mistakes: ['Hyperextending the lower back instead of using the glutes.'],
  },
  {
    name: 'Banded Glute Bridge', pattern: 'glute', equip: 'band', level: 1, impact: 'low', flags: ['FLOOR'], measure: 'reps', muscle: 'Glutes',
    steps: ['Place a loop band above your knees and lie on your back, knees bent.', 'Push your knees out against the band.', 'Lift your hips until your body is straight from shoulders to knees.', 'Lower slowly, keeping the band tight.'],
    cues: ['Keep tension on the band throughout.'],
    mistakes: ['Letting the knees fall inward.'],
  },
  {
    name: 'Dumbbell Romanian Deadlift', pattern: 'hinge', equip: 'dumbbell', level: 2, impact: 'low', flags: [], measure: 'reps', muscle: 'Hamstrings, glutes, back',
    steps: ['Stand holding dumbbells in front of your thighs, knees slightly bent.', 'Push your hips back and slide the weights down your legs.', 'Stop when you feel a stretch in your hamstrings (around mid-shin).', 'Drive your hips forward to stand tall.'],
    cues: ['Back stays flat, never rounded.', 'Weights stay close to your legs.'],
    mistakes: ['Bending the knees into a squat.', 'Rounding the back to reach lower.'],
  },
  {
    name: 'Kettlebell Swing', pattern: 'hinge', equip: 'kettlebell', level: 2, impact: 'high', flags: ['HIGH_IMPACT'], measure: 'reps', muscle: 'Glutes, hamstrings, core',
    steps: ['Stand with feet wider than hips, kettlebell on the floor in front.', 'Hike the bell back between your legs.', 'Snap your hips forward to swing it to chest height.', 'Let it fall back between your legs and repeat.'],
    cues: ['Power comes from the hips, not the arms.', 'Stand tall and squeeze glutes at the top.'],
    mistakes: ['Squatting the swing.', 'Lifting with the shoulders.'],
  },
  {
    name: 'Deadlift', pattern: 'hinge', equip: 'barbell', level: 3, impact: 'low', flags: ['HEAVY_LIFTING'], measure: 'reps', muscle: 'Posterior chain',
    steps: ['Stand with the bar over your mid-foot.', 'Hinge down and grip the bar just outside your legs.', 'Brace, flatten your back and push the floor away to stand.', 'Lower by pushing hips back, bar close to your legs.'],
    cues: ['Bar stays in contact with your legs.', 'Brace hard before every rep.'],
    mistakes: ['Rounded back.', 'Lifting the bar abruptly instead of using a controlled movement.'],
  },
  {
    name: 'Superman', pattern: 'hinge', equip: 'bodyweight', level: 1, impact: 'low', flags: ['FLOOR'], measure: 'reps', muscle: 'Lower back, glutes',
    steps: ['Lie face down, arms stretched overhead.', 'Lift your arms, chest and legs a few centimetres off the floor.', 'Hold for a second.', 'Lower slowly.'],
    cues: ['Look at the floor to keep your neck neutral.'],
    mistakes: ['Raising your upper body too quickly or too high, which can strain the lower back.'],
  },

  // ── Push ─────────────────────────────────────────────────────────────
  {
    name: 'Incline Push-up', pattern: 'push', equip: 'bodyweight', level: 1, impact: 'low', flags: ['WRIST_LOAD'], measure: 'reps', muscle: 'Chest, triceps',
    steps: ['Place your hands on a bench, table or wall, a little wider than shoulders.', 'Walk your feet back so your body is straight.', 'Lower your chest to the edge with control.', 'Push back up to straight arms.'],
    cues: ['Body stays in one straight line.', 'Elbows about 45° from your body.'],
    mistakes: ['Sagging hips.', 'Flaring elbows straight out.'],
  },
  {
    name: 'Knee Push-up', pattern: 'push', equip: 'bodyweight', level: 1, impact: 'low', flags: ['KNEELING', 'WRIST_LOAD', 'FLOOR'], measure: 'reps', muscle: 'Chest, triceps',
    steps: ['Start on your hands and knees, hands slightly wider than shoulders.', 'Walk your hands forward so your body is straight from head to knees.', 'Lower your chest toward the floor.', 'Push back up.'],
    cues: ['Squeeze your glutes to keep hips in line.'],
    mistakes: ['Hips piking up in the air.'],
  },
  {
    name: 'Push-up', pattern: 'push', equip: 'bodyweight', level: 2, impact: 'low', flags: ['WRIST_LOAD', 'FLOOR'], measure: 'reps', muscle: 'Chest, triceps, shoulders',
    steps: ['Start in a high plank, hands under shoulders.', 'Lower your body as one unit until your chest is just above the floor.', 'Push the floor away to return to the top.'],
    cues: ['Tight core and glutes.', 'Elbows angled back about 45°.'],
    mistakes: ['Head dropping first.', 'Partial reps.'],
  },
  {
    name: 'Dumbbell Bench Press', pattern: 'push', equip: 'dumbbell', level: 2, impact: 'low', flags: [], measure: 'reps', muscle: 'Chest, triceps',
    steps: ['Lie on a bench with a dumbbell in each hand at chest level.', 'Plant your feet and squeeze your shoulder blades together.', 'Press the weights up until your arms are straight.', 'Lower slowly to the sides of your chest.'],
    cues: ['Wrists stacked over elbows.', 'Control the way down for 2 seconds.'],
    mistakes: ['Bouncing the weights at the bottom.', 'Lifting your hips off the bench.'],
  },
  {
    name: 'Dumbbell Seated Shoulder Press', pattern: 'push', equip: 'dumbbell', level: 1, impact: 'low', flags: ['OVERHEAD'], measure: 'reps', muscle: 'Shoulders, triceps',
    steps: ['Sit on a bench with back support, dumbbells at shoulder height.', 'Press the weights up until your arms are straight overhead.', 'Lower back to shoulder height with control.'],
    cues: ['Ribs down; do not arch your back.', 'Press slightly in front of your head.'],
    mistakes: ['Arching the lower back to push the weight.'],
  },
  {
    name: 'Pike Push-up', pattern: 'push', equip: 'bodyweight', level: 2, impact: 'low', flags: ['OVERHEAD', 'WRIST_LOAD'], measure: 'reps', muscle: 'Shoulders, triceps',
    steps: ['Start in a downward-dog position, hips high, hands shoulder-width.', 'Bend your elbows and lower the top of your head toward the floor.', 'Push back up to straight arms.'],
    cues: ['Keep your hips high throughout.'],
    mistakes: ['Turning it into a regular push-up by dropping the hips.'],
  },
  {
    name: 'Bench Dip', pattern: 'push', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Triceps',
    steps: ['Sit on the edge of a bench, hands beside your hips.', 'Slide forward so your hips are off the bench, legs bent.', 'Bend your elbows to lower until they reach about 90°.', 'Press back up.'],
    cues: ['Keep your back close to the bench.', 'Shoulders down, away from your ears.'],
    mistakes: ['Dropping too low and straining the shoulders.'],
  },

  // ── Pull ─────────────────────────────────────────────────────────────
  {
    name: 'One-Arm Dumbbell Row', pattern: 'pull', equip: 'dumbbell', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Back, biceps',
    steps: ['Place one knee and hand on a bench, other foot on the floor.', 'Hold a dumbbell with the free hand, arm straight.', 'Pull the weight toward your hip, elbow close to your body.', 'Lower slowly. Finish one side, then switch.'],
    cues: ['Back flat like a table.', 'Lead with the elbow, not the hand.'],
    mistakes: ['Twisting the torso to lift the weight.'],
  },
  {
    name: 'Banded Row', pattern: 'pull', equip: 'band', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Back, biceps',
    steps: ['Anchor a band at chest height (or loop it around your feet while seated).', 'Hold the ends with straight arms.', 'Pull your elbows back and squeeze your shoulder blades.', 'Return slowly.'],
    cues: ['Shoulders down, chest up.'],
    mistakes: ['Shrugging the shoulders toward your ears.'],
  },
  {
    name: 'Band Pull-Apart', pattern: 'pull', equip: 'band', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Upper back, rear shoulders',
    steps: ['Hold a band in front of you at shoulder height, arms straight.', 'Pull the band apart until it touches your chest.', 'Return slowly.'],
    cues: ['Squeeze between the shoulder blades.'],
    mistakes: ['Bending the elbows a lot.'],
  },
  {
    name: 'Inverted Row', pattern: 'pull', equip: 'bodyweight', level: 2, impact: 'low', flags: [], measure: 'reps', muscle: 'Back, biceps',
    steps: ['Lie under a sturdy table or low bar and grip the edge.', 'Keep your body straight, heels on the floor.', 'Pull your chest up to the edge.', 'Lower slowly.'],
    cues: ['Body stays rigid like a plank.'],
    mistakes: ['Letting the hips sag.', 'Using an unstable table.'],
  },
  {
    name: 'Prone Y Raise', pattern: 'pull', equip: 'bodyweight', level: 1, impact: 'low', flags: ['FLOOR'], measure: 'reps', muscle: 'Upper back',
    steps: ['Lie face down, arms overhead in a Y shape, thumbs up.', 'Lift your arms a few centimetres off the floor.', 'Hold for a second and lower.'],
    cues: ['Lead with the thumbs; keep your neck neutral.'],
    mistakes: ['Lifting the head instead of the arms.'],
  },
  {
    name: 'Negative Pull-up', pattern: 'pull', equip: 'pullup', level: 2, impact: 'low', flags: [], measure: 'reps', muscle: 'Lats, biceps',
    steps: ['Use a step to get your chin above the bar.', 'Hold the top position.', 'Lower yourself as slowly as you can (3–5 seconds) to straight arms.', 'Step back up and repeat.'],
    cues: ['Control the whole way down.'],
    mistakes: ['Dropping quickly at the bottom.'],
  },
  {
    name: 'Pull-up', pattern: 'pull', equip: 'pullup', level: 3, impact: 'low', flags: [], measure: 'reps', muscle: 'Lats, biceps',
    steps: ['Hang from the bar, hands a bit wider than shoulders, palms away.', 'Pull your chest toward the bar until your chin clears it.', 'Lower to straight arms with control.'],
    cues: ['Start by pulling your shoulder blades down.'],
    mistakes: ['Kicking or swinging for momentum.'],
  },

  // ── Core ─────────────────────────────────────────────────────────────
  {
    name: 'Dead Bug', pattern: 'core', equip: 'bodyweight', level: 1, impact: 'low', flags: ['FLOOR'], measure: 'reps', muscle: 'Core',
    steps: ['Lie on your back, arms pointing to the ceiling, knees bent at 90° above your hips.', 'Lower the opposite arm and leg toward the floor.', 'Return and switch sides.'],
    cues: ['Press your lower back into the floor the whole time.', 'Move slowly and breathe out as you extend.'],
    mistakes: ['Lower back arching off the floor.'],
  },
  {
    name: 'Bird Dog', pattern: 'core', equip: 'bodyweight', level: 1, impact: 'low', flags: ['KNEELING', 'WRIST_LOAD'], measure: 'reps', muscle: 'Core, lower back',
    steps: ['Start on hands and knees.', 'Reach one arm forward and the opposite leg back until both are straight.', 'Hold for a second, then return.', 'Alternate sides.'],
    cues: ['Keep your hips level, as if balancing a cup on your back.'],
    mistakes: ['Rotating the hips as the leg lifts.'],
  },
  {
    name: 'Plank', pattern: 'core', equip: 'bodyweight', level: 1, impact: 'low', flags: ['WRIST_LOAD', 'FLOOR'], measure: 'time', muscle: 'Core',
    steps: ['Rest on your forearms and toes, elbows under shoulders.', 'Make a straight line from head to heels.', 'Hold while breathing normally.'],
    cues: ['Squeeze glutes and brace your stomach.'],
    mistakes: ['Hips sagging or piking up.'],
  },
  {
    name: 'Side Plank', pattern: 'core', equip: 'bodyweight', level: 2, impact: 'low', flags: ['FLOOR'], measure: 'time', muscle: 'Obliques',
    steps: ['Lie on your side, elbow under your shoulder.', 'Lift your hips so your body is straight.', 'Hold, then switch sides.'],
    cues: ['Hips stacked; do not roll forward.'],
    mistakes: ['Letting the bottom hip sag.'],
  },
  {
    name: 'Banded Pallof Press', pattern: 'core', equip: 'band', level: 1, impact: 'low', flags: [], measure: 'reps', muscle: 'Core',
    steps: ['Anchor a band at chest height and stand side-on to it.', 'Hold the band at your chest with both hands.', 'Press your arms straight out, resisting the pull.', 'Bring the hands back to your chest. Switch sides.'],
    cues: ['Do not let your torso twist toward the anchor.'],
    mistakes: ['Standing too close so there is no tension.'],
  },
  {
    name: 'Bicycle Crunch', pattern: 'core', equip: 'bodyweight', level: 2, impact: 'low', flags: ['FLOOR'], measure: 'reps', muscle: 'Core, obliques',
    steps: ['Lie on your back, hands lightly behind your head, legs lifted.', 'Bring one knee in while turning the opposite elbow toward it.', 'Switch sides in a slow pedalling motion.'],
    cues: ['Rotate from your ribs, not your neck.'],
    mistakes: ['Pulling on the head.'],
  },
  {
    name: 'Mountain Climber', pattern: 'core', equip: 'bodyweight', level: 2, impact: 'high', flags: ['HIGH_IMPACT', 'WRIST_LOAD'], measure: 'time', muscle: 'Core, shoulders',
    steps: ['Start in a high plank.', 'Drive one knee toward your chest.', 'Quickly switch legs, like running in place.'],
    cues: ['Hips stay low and level.'],
    mistakes: ['Bouncing the hips up and down.'],
  },

  // ── Cardio ───────────────────────────────────────────────────────────
  {
    name: 'Walking', pattern: 'cardio', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'time', muscle: 'Full body',
    steps: ['Walk at a brisk pace where you can talk but not sing.', 'Swing your arms naturally.', 'Keep going for the full time.'],
    cues: ['Stand tall, eyes ahead.'],
    mistakes: ['Strolling too slowly to raise your heart rate.'],
  },
  {
    name: 'Lateral Shuffle', pattern: 'cardio', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'time', muscle: 'Legs',
    steps: ['Stand in a half-squat, feet hip-width.', 'Step sideways several steps, then back the other way.', 'Keep moving for the full interval.'],
    cues: ['Stay low; feet do not cross.'],
    mistakes: ['Standing up tall between steps.'],
  },
  {
    name: 'Fast Feet', pattern: 'cardio', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'time', muscle: 'Calves, legs',
    steps: ['Stand in a slight squat on the balls of your feet.', 'Tap your feet up and down as fast as you can, staying close to the floor.', 'Keep going for the full interval.'],
    cues: ['Tiny, quick steps; arms ready in front.'],
    mistakes: ['Lifting the feet too high, which turns it into jogging.'],
  },
  {
    name: 'Jumping Jack', pattern: 'cardio', equip: 'bodyweight', level: 1, impact: 'high', flags: ['HIGH_IMPACT'], measure: 'time', muscle: 'Full body',
    steps: ['Stand with feet together, arms at sides.', 'Jump your feet out while raising your arms overhead.', 'Jump back to the start.'],
    cues: ['Land softly on the balls of your feet.'],
    mistakes: ['Landing flat-footed and stiff.'],
  },
  {
    name: 'High Knees', pattern: 'cardio', equip: 'bodyweight', level: 2, impact: 'high', flags: ['HIGH_IMPACT', 'RUNNING'], measure: 'time', muscle: 'Legs, core',
    steps: ['Run in place, driving your knees up to hip height.', 'Pump your arms fast.', 'Stay on the balls of your feet.'],
    cues: ['Quick, light steps.'],
    mistakes: ['Leaning backward.'],
  },
  {
    name: 'Burpee', pattern: 'cardio', equip: 'bodyweight', level: 3, impact: 'high', flags: ['HIGH_IMPACT', 'FLOOR', 'WRIST_LOAD'], measure: 'reps', muscle: 'Full body',
    steps: ['From standing, squat and place your hands on the floor.', 'Jump your feet back into a plank.', 'Jump your feet back in.', 'Explode up into a jump.'],
    cues: ['Keep your core tight in the plank.'],
    mistakes: ['Sagging hips in the plank.', 'Landing hard.'],
  },
  {
    name: 'Running', pattern: 'cardio', equip: 'bodyweight', level: 2, impact: 'high', flags: ['HIGH_IMPACT', 'RUNNING'], measure: 'time', muscle: 'Legs, heart',
    steps: ['Warm up with 3–5 minutes of brisk walking.', 'Run at a pace where you can speak in short sentences.', 'Walk for a minute whenever you need to recover.'],
    cues: ['Short, quick steps landing under your hips.'],
    mistakes: ['Starting too fast.'],
  },
  {
    name: 'Cycling', pattern: 'cardio', equip: 'cardio', level: 1, impact: 'low', flags: [], measure: 'time', muscle: 'Legs, heart',
    steps: ['Adjust the seat so your knee is slightly bent at the bottom.', 'Pedal at a steady, moderate effort.', 'Add short faster bursts if you feel good.'],
    cues: ['Relaxed shoulders, steady breathing.'],
    mistakes: ['Seat set too low.'],
  },

  // ── Mobility / recovery ──────────────────────────────────────────────
  {
    name: 'Cat-Cow Stretch', pattern: 'mobility', equip: 'bodyweight', level: 1, impact: 'low', flags: ['KNEELING', 'WRIST_LOAD'], measure: 'time', muscle: 'Spine',
    steps: ['Start on hands and knees.', 'Breathe in, drop your belly and lift your chest (cow).', 'Breathe out, round your back and tuck your chin (cat).', 'Move slowly with your breath.'],
    cues: ['Move one vertebra at a time.'], mistakes: ['Rushing the movement.'],
  },
  {
    name: "World's Greatest Stretch", pattern: 'mobility', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'time', muscle: 'Hips, spine',
    steps: ['Step into a deep lunge, both hands on the floor inside the front foot.', 'Rotate your chest and reach the inside arm to the ceiling.', 'Return the hand and switch sides.'],
    cues: ['Keep the back leg straight.'], mistakes: ['Holding your breath.'],
  },
  {
    name: 'Hamstring Stretch', pattern: 'mobility', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'time', muscle: 'Hamstrings',
    steps: ['Place one heel on a low step, leg straight.', 'Hinge forward from your hips with a flat back.', 'Hold where you feel a gentle stretch. Switch legs.'],
    cues: ['Gentle stretch, never pain.'], mistakes: ['Rounding the back to reach further.'],
  },
  {
    name: 'Standing Quad Stretch', pattern: 'mobility', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'time', muscle: 'Quads',
    steps: ['Stand tall, holding a wall for balance.', 'Bend one knee and hold your ankle behind you.', 'Gently pull your heel toward your glutes. Switch legs.'],
    cues: ['Knees stay side by side.'], mistakes: ['Arching the lower back.'],
  },
  {
    name: "Child's Pose", pattern: 'mobility', equip: 'bodyweight', level: 1, impact: 'low', flags: ['KNEELING', 'FLOOR'], measure: 'time', muscle: 'Back, hips',
    steps: ['Kneel and sit back on your heels.', 'Fold forward and stretch your arms in front.', 'Rest your forehead down and breathe slowly.'],
    cues: ['Let your back relax with each breath out.'], mistakes: ['Forcing the hips down.'],
  },
  {
    name: 'Arm Circles', pattern: 'mobility', equip: 'bodyweight', level: 1, impact: 'low', flags: [], measure: 'time', muscle: 'Shoulders',
    steps: ['Stand with arms out to the sides.', 'Make small circles, slowly getting bigger.', 'Reverse direction halfway.'],
    cues: ['Relax the neck.'], mistakes: ['Shrugging the shoulders.'],
  },
];

module.exports = { EXERCISES, EXCLUSION_CATEGORIES };
