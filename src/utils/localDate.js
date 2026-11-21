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
