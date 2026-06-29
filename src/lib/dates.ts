/**
 * Date helpers. All persisted dates are ISO `yyyy-mm-dd` strings interpreted in
 * the server's local time; this mirrors the prototype and keeps the calendar
 * arithmetic free of timezone drift.
 */

export function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayIso(): string {
  return toIso(new Date());
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function monthName(monthIdx: number): string {
  return MONTHS[monthIdx] ?? "";
}

export function monthAbbr(monthIdx: number): string {
  return (MONTHS[monthIdx] ?? "").slice(0, 3);
}

/** Short weekday label ("Mon") for an ISO date. */
export function dowShort(iso: string): string {
  return WEEKDAYS[fromIso(iso).getDay()] ?? "";
}

export function monthLabel(monthIdx: number, year: number): string {
  return `${MONTHS[monthIdx]} ${year}`;
}

/** "27 Jun 2026" (em dash for empty). */
export function fmtDate(iso: string): string {
  if (!iso) return "\u2014";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

/** "Sat, 27 June 2026" */
export function prettyDate(iso: string): string {
  const d = fromIso(iso);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Weekly-off rule: Sunday is always off; Saturday is off only when it is the
 * 2nd or 4th Saturday of the month.
 */
export function isWeeklyOff(iso: string): boolean {
  const d = fromIso(iso);
  const dow = d.getDay();
  if (dow === 0) return true; // Sunday
  if (dow === 6) {
    const nth = Math.ceil(d.getDate() / 7);
    return nth === 2 || nth === 4;
  }
  return false;
}

export function isNonWorking(iso: string, holidayDates: Set<string>): boolean {
  return isWeeklyOff(iso) || holidayDates.has(iso);
}

/**
 * Inclusive count of working days between two ISO dates, excluding weekly-offs
 * and holidays.
 */
export function workingDays(
  fromIso_: string,
  toIso_: string,
  holidayDates: Set<string>,
): number {
  const start = fromIso(fromIso_);
  const end = fromIso(toIso_);
  if (end < start) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const iso = toIso(cur);
    if (!isNonWorking(iso, holidayDates)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/** Minute difference between two HH:MM clock times, formatted "Xh YYm". */
export function workedDuration(inT: string, outT: string): string {
  if (!inT || !outT) return "";
  const [ih, im] = inT.split(":").map(Number);
  const [oh, om] = outT.split(":").map(Number);
  let mins = oh * 60 + om - (ih * 60 + im);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

/** Current clock time as HH:MM. */
export function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
