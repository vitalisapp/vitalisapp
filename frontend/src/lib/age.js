// Vitalis age rule — mirrors backend/src/utils/age.js (keep in sync).
// Calorie targets, BMR and training plans are designed for teens and adults,
// so accounts must belong to someone at least MIN_AGE years old.
export const MIN_AGE = 13;
export const MAX_AGE = 120;

/** Whole years between an ISO date (YYYY-MM-DD) and `now`, birthday-accurate. */
export function ageOn(iso, now = new Date()) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').slice(0, 10));
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = now.getFullYear() - y;
  const md = now.getMonth() + 1 - mo;
  if (md < 0 || (md === 0 && now.getDate() < d)) age--;
  return age;
}

/** Today as YYYY-MM-DD in the user's local time (for <input type="date" max>). */
export function todayIso(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/**
 * Explain what is wrong with a date of birth in plain language.
 * @returns {{ ok: true, age: number } | { ok: false, code: string, title: string, message: string }}
 */
export function checkDob(iso, now = new Date()) {
  if (!iso) {
    return { ok: false, code: 'DOB_REQUIRED', title: 'Date of birth needed', message: 'Enter your date of birth so we can calculate your calorie needs.' };
  }
  const s = String(iso).slice(0, 10);
  const age = ageOn(s, now);
  const d = new Date(`${s}T00:00:00`);
  if (age === null || Number.isNaN(d.getTime())) {
    return { ok: false, code: 'DOB_INVALID', title: 'Check the date', message: 'That is not a real date. Check the day, month and year.' };
  }
  if (s > todayIso(now)) {
    return { ok: false, code: 'DOB_FUTURE', title: 'Date is in the future', message: 'Your date of birth cannot be after today.' };
  }
  if (age < MIN_AGE) {
    return {
      ok: false,
      code: 'AGE_TOO_YOUNG',
      title: `You need to be at least ${MIN_AGE} to use Vitalis`,
      message:
        `Based on this date you are ${age} year${age === 1 ? '' : 's'} old. ` +
        'Vitalis calculates calorie targets and workout plans that are designed for teens and adults, ' +
        "so they may not be safe for younger users. If you entered the wrong year, just correct it.",
    };
  }
  if (age > MAX_AGE) {
    return { ok: false, code: 'AGE_TOO_OLD', title: 'Check the year', message: `That would make you ${age} years old. Please check the year you entered.` };
  }
  return { ok: true, age };
}
