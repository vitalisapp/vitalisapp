// Sample progress dataset for demonstrations (Section 8).
//
// Pure + deterministic: the same `today` always yields the same records, so a
// demo looks identical every time it is shown. NOTHING here is written to the
// database. Every API response built from it carries `sample: true`, and the
// UI labels it "Sample data" so it is never mistaken for real user records.
//
// Story: a LOSE_WEIGHT goal (78 → 72 kg) started 8 weeks ago with a target
// 8 weeks out. Training ~4 days/week with a dip two weeks ago, near-daily
// meal logging, weekly weigh-ins trending down ~0.4 kg/week.

const SAMPLE_DAYS = 120;
const SAMPLE_ID_BASE = 900000;

const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (iso, n) => {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
const round1 = (n) => Math.round(n * 10) / 10;

// Small seeded PRNG (mulberry32) — deterministic noise per calendar day.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const daySeed = (iso) => Number(iso.replace(/-/g, ''));

const WORKOUTS = [
  { type: 'Squats', reps: [36, 60], mins: [18, 30], sets: 4, kg: 0 },
  { type: 'Push-ups', reps: [30, 55], mins: [12, 22], sets: 4, kg: 0 },
  { type: 'Full body circuit', reps: [60, 110], mins: [30, 45], sets: 5, kg: 0 },
  { type: 'Brisk walk', reps: [0, 0], mins: [30, 50], sets: 0, kg: 0 },
  { type: 'Dumbbell strength', reps: [40, 72], mins: [25, 40], sets: 4, kg: 10 },
];

const MEALS = {
  breakfast: [
    ['Oatmeal with banana', '1 bowl', 320, 11, 58, 6],
    ['Pandesal with egg', '2 pcs + 1 egg', 340, 15, 44, 11],
    ['Greek yogurt & fruit', '1 cup', 220, 17, 28, 4],
  ],
  lunch: [
    ['Grilled chicken with rice', '1 plate', 560, 42, 62, 13],
    ['Chicken adobo with rice', '1 plate', 620, 35, 66, 22],
    ['Tuna salad wrap', '1 wrap', 430, 30, 40, 15],
  ],
  dinner: [
    ['Steamed fish with vegetables', '1 plate', 420, 38, 30, 14],
    ['Sinigang na baboy', '1 bowl + rice', 540, 30, 52, 21],
    ['Tofu stir-fry with rice', '1 plate', 480, 24, 60, 15],
  ],
  snack: [
    ['Boiled egg', '2 pcs', 140, 12, 1, 10],
    ['Apple', '1 medium', 95, 0, 25, 0],
    ['Protein shake', '1 scoop', 130, 24, 4, 2],
  ],
};

function pick(list, r) {
  return list[Math.floor(r() * list.length) % list.length];
}
function between([lo, hi], r) {
  return Math.round(lo + (hi - lo) * r());
}

function buildSampleDataset(today = toISO(new Date())) {
  const start = addDays(today, -(SAMPLE_DAYS - 1));
  const goalStart = addDays(today, -56);
  const goal = {
    id: SAMPLE_ID_BASE,
    goalType: 'LOSE_WEIGHT',
    pace: 'MODERATE',
    weightKg: 78,
    targetWeightKg: 72,
    heightCm: 170,
    createdAt: goalStart,
    targetDate: addDays(today, 56),
    dailyKcal: 1900,
    proteinG: 120,
    carbsG: 200,
    fatG: 60,
    secondaryGoals: ['BUILD_MUSCLE'],
    status: 'active',
  };

  const sessions = [];
  const meals = [];
  const weights = [];
  const waists = [];
  let sessionId = SAMPLE_ID_BASE;
  let mealId = SAMPLE_ID_BASE;

  for (let i = 0; i < SAMPLE_DAYS; i++) {
    const day = addDays(start, i);
    const r = rng(daySeed(day));
    const ago = SAMPLE_DAYS - 1 - i;
    const dow = parseISO(day).getDay(); // 0 = Sunday

    // Training: Mon/Tue/Thu/Sat usually, a quiet week 8–14 days ago, and a
    // slightly stronger current week so the "trend" insight has a story.
    const planned = [1, 2, 4, 6].includes(dow);
    const dipWeek = ago >= 8 && ago <= 14;
    const trains = dipWeek ? planned && r() < 0.35 : planned ? r() < 0.88 : r() < 0.12;
    if (trains) {
      const w = pick(WORKOUTS, r);
      const minutes = between(w.mins, r);
      const hour = 6 + Math.floor(r() * 12);
      const startMin = Math.floor(r() * 60);
      const startTime = `${day}T${pad(hour)}:${pad(startMin)}:00`;
      // End = start + duration (start minute included, so end is never before start).
      const endD = new Date(parseISO(day).getTime() + (hour * 60 + startMin + minutes) * 60000);
      const completed = r() < 0.92;
      const reps = between(w.reps, r);
      sessions.push({
        id: ++sessionId,
        workout_type: w.type,
        rep_count: reps,
        status: completed ? 'completed' : 'incomplete',
        start_time: startTime,
        end_time: `${toISO(endD)}T${pad(endD.getHours())}:${pad(endD.getMinutes())}:00`,
        duration_seconds: minutes * 60,
        exercise_count: w.sets ? 2 + Math.floor(r() * 3) : null,
        set_rows: w.sets ? w.sets * 2 : null,
        volume_kg: w.kg ? Math.round(reps * w.kg) : null,
        sample: true,
      });
    }

    // Meals: ~90% of days logged; 3–4 meals on a logged day.
    if (r() < (ago <= 6 ? 0.86 : 0.9)) {
      const slots = ['breakfast', 'lunch', 'dinner'];
      if (r() < 0.55) slots.push('snack');
      const times = { breakfast: '07:15', lunch: '12:20', dinner: '19:05', snack: '15:40' };
      for (const slot of slots) {
        const [name, serving, kcal, protein, carbs, fat] = pick(MEALS[slot], r);
        meals.push({
          id: ++mealId,
          food_name: name,
          serving,
          meal_type: slot,
          calories: kcal,
          protein,
          carbs,
          fat,
          logged_at: `${day} ${times[slot]}`,
          sample: true,
        });
      }
    }

    // Weekly weigh-in (Sundays) + waist every other Sunday.
    if (dow === 0) {
      const weeksIn = Math.max(0, (i - (SAMPLE_DAYS - 1 - 56)) / 7);
      const base = i < SAMPLE_DAYS - 56 ? 78.4 - (i / (SAMPLE_DAYS - 56)) * 0.4 : 78 - weeksIn * 0.42;
      weights.push({ day, value: round1(base + (r() - 0.5) * 0.4) });
      if (Math.floor(i / 7) % 2 === 0) waists.push({ day, value: round1(91 - weeksIn * 0.45 + (r() - 0.5) * 0.4) });
    }
  }

  // Daily rollups in the shapes the service aggregators expect.
  const workoutDays = new Map();
  for (const s of sessions) {
    const day = s.start_time.slice(0, 10);
    const row = workoutDays.get(day) || { day, sessions: 0, minutes: 0, completed: 0 };
    row.sessions += 1;
    row.minutes += Math.round(s.duration_seconds / 60);
    row.completed += s.status === 'completed' ? 1 : 0;
    workoutDays.set(day, row);
  }
  const mealDays = new Map();
  for (const m of meals) {
    const day = m.logged_at.slice(0, 10);
    const row = mealDays.get(day) || { day, kcal: 0, protein: 0 };
    row.kcal += m.calories;
    row.protein += m.protein;
    mealDays.set(day, row);
  }

  const latest = weights[weights.length - 1];
  const progressPct = latest
    ? Math.max(0, Math.min(100, Math.round(((goal.weightKg - latest.value) / (goal.weightKg - goal.targetWeightKg)) * 100)))
    : null;

  return {
    sample: true,
    today,
    goal,
    currentWeightKg: latest ? latest.value : goal.weightKg,
    progressPct,
    sessionsSinceStart: sessions.filter((s) => s.start_time.slice(0, 10) >= goalStart).length,
    sessions: sessions.slice().reverse(), // newest first, like the real API
    meals: meals.slice().reverse(),
    workouts: [...workoutDays.values()],
    mealDays: [...mealDays.values()],
    weights,
    waists,
  };
}

module.exports = { SAMPLE_DAYS, buildSampleDataset };
