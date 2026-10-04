/**
 * Asia/Karachi calendar-date helpers for class links (Phase 15).
 *
 * A class link's day is defined in Pakistan time, because that is where the
 * admin issuing it sits. Everyone else sees it labelled "(PKT)" so a student in
 * Canada or Australia can tell which day's link they are looking at without
 * doing timezone arithmetic. These helpers deal in plain "YYYY-MM-DD" strings,
 * which is exactly how the `date` column stores and returns the value.
 */

/** Today's date in Asia/Karachi, as "YYYY-MM-DD". */
export function karachiToday(): string {
  // en-CA formats as YYYY-MM-DD; the timeZone makes it the Karachi calendar day.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Shift a "YYYY-MM-DD" string by n days (n may be negative). */
export function shiftDate(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

/**
 * A short, unambiguous label for a PKT day, e.g. "4 Oct (PKT)". The month stays
 * English so the "(PKT)" marker reads consistently in every locale's UI; the
 * surrounding sentence is translated, this token is the fixed reference point.
 */
export function formatPktLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDate();
  const month = dt.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${day} ${month} (PKT)`;
}
