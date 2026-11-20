/**
 * Cohort schedule arithmetic. Pure — safe on the server and in the browser.
 *
 * A cohort's weekly schedule is stored in UTC (weekdays 0 = Sunday … 6 =
 * Saturday, start time "HH:MM"). Every session is therefore a fixed instant,
 * and each visitor's browser turns that instant into their own local time.
 *
 * Known consequence of storing UTC: the class does not move when a country
 * changes its clocks, so for a student in a daylight-saving country the local
 * time shifts by one hour twice a year. The pages show the real local time of
 * each upcoming class, so what is displayed is always correct.
 */

export interface CohortSchedule {
  weekdaysUtc: number[];
  /** "HH:MM" in UTC */
  startTimeUtc: string;
  sessionMinutes: number;
  /** "YYYY-MM-DD", read as a UTC calendar date */
  startDate: string;
  durationWeeks: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function startOfCohort(schedule: CohortSchedule): number {
  return new Date(`${schedule.startDate}T00:00:00Z`).getTime();
}

/** The instant the cohort's last possible day ends (exclusive). */
export function cohortEnd(schedule: CohortSchedule): Date {
  return new Date(
    startOfCohort(schedule) + schedule.durationWeeks * 7 * DAY_MS
  );
}

/** Every session start in the cohort, in order. */
export function allSessions(schedule: CohortSchedule): Date[] {
  const [hours, minutes] = schedule.startTimeUtc.split(":").map(Number);
  const days = new Set(schedule.weekdaysUtc);
  const start = startOfCohort(schedule);
  const totalDays = schedule.durationWeeks * 7;
  const sessions: Date[] = [];

  for (let i = 0; i < totalDays; i++) {
    const day = new Date(start + i * DAY_MS);
    if (days.has(day.getUTCDay())) {
      sessions.push(
        new Date(day.getTime() + (hours * 60 + minutes) * 60 * 1000)
      );
    }
  }
  return sessions;
}

export function sessionEnd(schedule: CohortSchedule, start: Date): Date {
  return new Date(start.getTime() + schedule.sessionMinutes * 60 * 1000);
}

/**
 * The next session that has not finished yet (a class in progress counts),
 * or null when the cohort is over.
 */
export function nextSession(
  schedule: CohortSchedule,
  now: Date = new Date()
): Date | null {
  for (const start of allSessions(schedule)) {
    if (sessionEnd(schedule, start).getTime() > now.getTime()) return start;
  }
  return null;
}

/** The next session that has not STARTED yet — the one a free trial books. */
export function nextUnstartedSession(
  schedule: CohortSchedule,
  now: Date = new Date()
): Date | null {
  for (const start of allSessions(schedule)) {
    if (start.getTime() > now.getTime()) return start;
  }
  return null;
}

export function hasEnded(schedule: CohortSchedule, now: Date = new Date()): boolean {
  return nextSession(schedule, now) === null;
}

/**
 * One representative instant per weekly slot, for rendering "Tue & Thu 7:00 PM"
 * in a visitor's zone: the first session on each scheduled weekday. Returned in
 * chronological order of the first week.
 */
export function weeklySlots(schedule: CohortSchedule): Date[] {
  const seen = new Set<number>();
  const slots: Date[] = [];
  for (const start of allSessions(schedule)) {
    const day = start.getUTCDay();
    if (!seen.has(day)) {
      seen.add(day);
      slots.push(start);
    }
    if (seen.size === new Set(schedule.weekdaysUtc).size) break;
  }
  return slots;
}
