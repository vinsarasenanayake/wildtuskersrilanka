/**
 * @file localDate.js
 * @description Local timezone date and time formatting and validation utilities.
 */

/**
 * Today's date as "YYYY-MM-DD" in the visitor's own time zone.
 * (toISOString() uses UTC, which is still "yesterday" in Sri Lanka
 * between midnight and 5:30 AM.)
 */
export function todayLocalISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Current local time as "HH:mm" in 24-hour format.
 */
export function currentTimeHHMM() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Checks whether a given date or (date + time) is in the future.
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {string} [timeStr] - "HH:mm" (24-hour)
 * @returns {boolean}
 */
export function isFutureDateTime(dateStr, timeStr) {
  if (!dateStr) return false;
  const today = todayLocalISO();
  if (dateStr > today) return true;
  if (dateStr === today && timeStr) {
    const curTime = currentTimeHHMM();
    return timeStr > curTime;
  }
  return false;
}

/**
 * Converts a 24-hr "HH:mm" string into a 12-hr readable format e.g. "09:30 AM" or "02:15 PM".
 */
export function formatDisplayTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${m} ${period}`;
}

