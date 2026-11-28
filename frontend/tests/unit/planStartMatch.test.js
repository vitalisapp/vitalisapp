import test from 'node:test';
import assert from 'node:assert/strict';
import { matchExercise } from '../../src/features/user/Plan/utils/exerciseMatch.js';
import { resolveWorkout } from '../../src/features/user/CameraWorkout/constants/workoutGuide.js';

// Every name here must auto-select a real camera workout from Start Workout.
const NAMES = [
  'Mountain Climbers', 'Jumping Jacks', 'Barbell Bent-Over Row', 'Single-Arm Dumbbell Row',
  'Resistance Band Rows', 'Triceps Rope Pushdown', 'Cat-Cow Flow', 'Seated Spinal Twist',
  'Standing Forward Fold', 'Deep Lunge Hip Opener', 'Brisk Walk', 'Easy Run / Bike / Row',
  'Sprint Intervals', 'Bike or Row Cross-Train', 'Ankle Rocks', 'Hip 90/90 Stretch',
  'Thoracic Spine Rotations', 'Foam Rolling - Full Body',
];

for (const name of NAMES) {
  test(`plan exercise "${name}" resolves to a camera workout`, () => {
    const m = matchExercise(name);
    assert.ok(m?.slug, 'no catalog match');
    assert.ok(resolveWorkout(m.slug), 'slug does not resolve');
  });
}
