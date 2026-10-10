// Calendar date-key helpers for the MealTracker. Pure functions, no DOM —
// covered by frontend/tests/unit/dateKey.test.js.

// Local YYYY-MM-DD key — never toISOString() (UTC shifts the day in +UTC timezones).
export function toLocalKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Month grid cells (null = leading blank). Week starts Sunday.
export function buildMonthGrid(year, month) {
  const startDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}
