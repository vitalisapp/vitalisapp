// Single source for the Vitalis age rule (mirrored in frontend/src/lib/age.js).
// Calorie targets, BMR and training plans are designed for teens and adults,
// so accounts must belong to someone at least MIN_AGE years old.
const MIN_AGE = 13;
const MAX_AGE = 120;

/** Whole years between dob and `now` (birthday-accurate, not 365.25 maths). */
function ageOn(dob, now = new Date()) {
  const d = dob instanceof Date ? dob : new Date(`${String(dob).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return age;
}

/**
 * Validate a date of birth and explain any problem in plain language.
 * @returns {{ ok: true, value: string, age: number } | { ok: false, code: string, message: string }}
 */
function checkDob(v, now = new Date()) {
  if (v === undefined || v === null || v === '') {
    return { ok: false, code: 'DOB_REQUIRED', message: 'Please enter your date of birth.' };
  }
  const iso = String(v).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return { ok: false, code: 'DOB_INVALID', message: 'That date of birth is not a real date. Use the format YYYY-MM-DD.' };
  }
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) {
    return { ok: false, code: 'DOB_INVALID', message: 'That date of birth is not a real date. Check the day and month.' };
  }
  if (d.getTime() > now.getTime()) {
    return { ok: false, code: 'DOB_FUTURE', message: 'Your date of birth cannot be in the future.' };
  }
  const age = ageOn(d, now);
  if (age < MIN_AGE) {
    return {
      ok: false,
      code: 'AGE_TOO_YOUNG',
      message:
        `Based on this date you are ${age} year${age === 1 ? '' : 's'} old. Vitalis is for users aged ${MIN_AGE} and up, ` +
        'because its calorie targets and workout plans are designed for teens and adults. ' +
        'If you entered the wrong year, please correct it.',
    };
  }
  if (age > MAX_AGE) {
    return { ok: false, code: 'AGE_TOO_OLD', message: `That would make you ${age} years old. Please check the year you entered.` };
  }
  return { ok: true, value: iso, age };
}

module.exports = { MIN_AGE, MAX_AGE, ageOn, checkDob };
