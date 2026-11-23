async (page) => {
  const SHOTS = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\shots';
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const dayDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return iso(d);
  });
  const todayIso = iso(today);
  const todayIndex = dayDates.indexOf(todayIso);

  const minutes = [42, 28, 0, 55, 31, 0, 0];
  const sessions = [1, 1, 0, 2, 1, 0, 0];
  const meals = [3, 2, 0, 3, 2, 0, 0];
  const steps = [8200, 6400, 0, 10100, 7600, 0, 0];

  const week = {
    weekStart: dayDates[0],
    weekEnd: dayDates[6],
    today: todayIso,
    days: dayDates.map((date, i) => ({
      date,
      isToday: date === todayIso,
      isFuture: date > todayIso,
      workouts: { sessions: sessions[i], minutes: minutes[i], reps: sessions[i] * 12 },
      meals: { count: meals[i], kcal: meals[i] * 520 },
      steps: steps[i],
    })),
    totals: {
      sessions: sessions.reduce((a, b) => a + b, 0),
      minutes: minutes.reduce((a, b) => a + b, 0),
      kcal: meals.reduce((a, b) => a + b, 0) * 520,
      steps: steps.reduce((a, b) => a + b, 0),
    },
  };

  const dashboard = {
    stats: { calories_burned: 480, steps: 8200, workout_duration_mins: 42 },
    profile: { name: 'Alex Morgan', fitness_goal: 'LOSE_WEIGHT', avatar_url: '' },
    streak: {
      current: 12,
      longest: 18,
      activeToday: true,
      workoutDays: 9,
      mealDays: 11,
      today: todayIso,
      weekStart: dayDates[0],
      weekEnd: dayDates[6],
      week: week.days,
      history: [],
    },
  };

  const records = [
    { calories: 520, protein: 38, carbs: 55, fat: 18, logged_at: `${todayIso} 08:10`, meal_type: 'breakfast' },
    { calories: 640, protein: 42, carbs: 70, fat: 22, logged_at: `${todayIso} 13:05`, meal_type: 'lunch' },
    { calories: 410, protein: 28, carbs: 45, fat: 14, logged_at: `${todayIso} 19:20`, meal_type: 'dinner' },
  ];

  const summary = {
    goal: {
      goal_type: 'LOSE_WEIGHT',
      target_weight_kg: 72,
      target_date: '2027-02-01',
      daily_kcal: 2100,
      protein_g: 140,
      carbs_g: 210,
      fat_g: 65,
    },
    currentWeightKg: 78.4,
    progressPct: 62,
  };

  const user = {
    id: 1,
    name: 'Alex Morgan',
    email: 'alex@example.com',
    role: 'user',
    onboardingCompleted: true,
    avatar_url: '',
  };

  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 220));
  });
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + String(e).slice(0, 220)));

  await page.addInitScript((u) => {
    localStorage.setItem('vitalis_user', JSON.stringify(u));
    localStorage.setItem('vitalis_user_ts', String(Date.now()));
    localStorage.setItem('vitalis:onboarding', 'skipped');
    localStorage.removeItem('vitalis:widgets:1');
  }, user);

  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = (body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    if (path === '/api/auth/me') return json({ user });
    // SSE stream must answer as text/event-stream (a JSON reply made EventSource log errors).
    if (path.startsWith('/api/notifications/stream')) {
      return route.fulfill({ status: 200, contentType: 'text/event-stream', body: ': ok\n\n' });
    }
    if (path === '/api/settings') return json({ settings: { units: 'metric', step_goal: 8000, theme: 'dark' } });
    if (path === '/api/dashboard/week-calendar') return json(week);
    if (path.startsWith('/api/dashboard/')) return json(dashboard);
    if (path.startsWith('/api/food-logs/')) return json({ records, total: records.length });
    if (path === '/api/progress/summary') return json(summary);
    if (path.startsWith('/api/notifications/')) return json({ count: 0, notifications: [] });
    return json({});
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://localhost:5199/dashboard/preferences', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.hw-grid .hw-card', { timeout: 20000 });
  await page.waitForTimeout(600);

  const widths = [320, 375, 390, 768, 1024, 1440];
  const results = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(250);
    const info = await page.evaluate(() => {
      const doc = document.documentElement;
      const cards = [...document.querySelectorAll('.hw-card')];
      const arts = [...document.querySelectorAll('.hw-art')];
      const clipped = arts
        .filter((a) => a.scrollHeight > a.clientHeight + 1 || a.scrollWidth > a.clientWidth + 1)
        .map((a) => a.getAttribute('aria-label'));
      const stageHeights = [...new Set([...document.querySelectorAll('.hw-stage')].map((s) => Math.round(s.getBoundingClientRect().height)))];
      const cardWidths = [...new Set(cards.map((c) => Math.round(c.getBoundingClientRect().width)))];
      const section = document.querySelector('.hw-root');
      const rect = section ? section.getBoundingClientRect() : null;
      return {
        overflowX: doc.scrollWidth - doc.clientWidth,
        cards: cards.length,
        clipped,
        stageHeights,
        cardWidths,
        sectionWidth: rect ? Math.round(rect.width) : null,
      };
    });
    results.push({ width, ...info });
    if ([320, 390, 768, 1440].includes(width)) {
      await page.locator('.hw-root').screenshot({ path: `${SHOTS}\\prefs-${width}.png` });
    }
  }

  // Configuration flow at phone width
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.hw-card').first().locator('.hw-btn--ghost').click();
  await page.waitForSelector('.hw-config');
  await page.waitForTimeout(500); // let the modal enter animation finish before reading/screenshotting
  const modal = await page.evaluate(() => {
    const m = document.querySelector('.hw-config');
    return {
      chips: [...m.querySelectorAll('.hw-chip-btn')].map((b) => b.innerText.replace(/\s+/g, ' ').trim()),
      skins: [...m.querySelectorAll('.hw-skin-btn')].map((b) => b.getAttribute('aria-pressed')),
      toggles: [...m.querySelectorAll('[role="switch"]')].map((b) => b.getAttribute('aria-checked')),
    };
  });
  await page.screenshot({ path: `${SHOTS}\\prefs-modal-390.png` });

  await page.locator('.hw-chip-btn', { hasText: 'Large' }).click();
  await page.locator('.hw-skin-btn', { hasText: 'Lime' }).click();
  await page.locator('.hw-modal-actions .hw-btn--primary').click();
  await page.waitForTimeout(400);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('vitalis:widgets:1') || 'null'));

  // Honest "how to add" path
  await page.locator('.hw-card').nth(1).getByRole('button', { name: /How to add/ }).click();
  await page.waitForSelector('.hw-guide');
  await page.waitForTimeout(500); // guide modal enter animation
  const guide = await page.evaluate(() => document.querySelector('.hw-guide')?.innerText.replace(/\s+/g, ' ').slice(0, 240));
  await page.screenshot({ path: `${SHOTS}\\prefs-guide-390.png` });

  return { results, modal, savedToday: saved && saved.today, guide, consoleErrors: consoleErrors.slice(0, 8) };
}
