import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cohortEnrollments, cohorts, notifications, users } from "@/lib/db/schema";
import type { CohortSchedule } from "./schedule";

/**
 * Cohort data access.
 *
 * Every query names its columns (docs/schema-and-migrations.md) and nothing
 * here catches an error to return an empty list: callers alert and rethrow, or
 * let the error surface. An empty roster must mean an empty roster.
 */

/** How long a seat is held while a student is on the Stripe checkout page. */
export const CHECKOUT_HOLD_MINUTES = 30;

/**
 * SQL for "this enrollment row currently occupies a seat".
 * Paying students always do; a checkout-in-progress or a booked trial does
 * only until its hold runs out. Written once so the public seat count, the
 * seat claim and the admin roster can never disagree.
 */
const HOLDS_SEAT = sql`(
  e.status IN ('active', 'past_due')
  OR (e.status IN ('pending', 'trial') AND e.seat_held_until > now())
)`;

const cohortColumns = {
  id: cohorts.id,
  slug: cohorts.slug,
  teacherId: cohorts.teacherId,
  titleEn: cohorts.titleEn,
  titleUr: cohorts.titleUr,
  titleAr: cohorts.titleAr,
  titleFr: cohorts.titleFr,
  titleId: cohorts.titleId,
  descriptionEn: cohorts.descriptionEn,
  descriptionUr: cohorts.descriptionUr,
  descriptionAr: cohorts.descriptionAr,
  descriptionFr: cohorts.descriptionFr,
  descriptionId: cohorts.descriptionId,
  weekdaysUtc: cohorts.weekdaysUtc,
  startTimeUtc: cohorts.startTimeUtc,
  sessionMinutes: cohorts.sessionMinutes,
  startDate: cohorts.startDate,
  durationWeeks: cohorts.durationWeeks,
  monthlyFee: cohorts.monthlyFee,
  currency: cohorts.currency,
  maxSeats: cohorts.maxSeats,
  enrollmentOpen: cohorts.enrollmentOpen,
  trialEnabled: cohorts.trialEnabled,
  isPublished: cohorts.isPublished,
} as const;

/** Seats taken, computed in the same statement as the cohort row. */
const seatsTaken = sql<number>`(
  SELECT count(*)::int FROM cohort_enrollments e
  WHERE e.cohort_id = ${cohorts.id} AND ${HOLDS_SEAT}
)`;

const waitlistCount = sql<number>`(
  SELECT count(*)::int FROM cohort_enrollments e
  WHERE e.cohort_id = ${cohorts.id} AND e.status = 'waitlisted'
)`;

export type CohortRow = Awaited<ReturnType<typeof listPublishedCohorts>>[number];

export function scheduleOf(c: {
  weekdaysUtc: number[];
  startTimeUtc: string;
  sessionMinutes: number;
  startDate: string;
  durationWeeks: number;
}): CohortSchedule {
  return {
    weekdaysUtc: c.weekdaysUtc,
    startTimeUtc: c.startTimeUtc,
    sessionMinutes: c.sessionMinutes,
    startDate: c.startDate,
    durationWeeks: c.durationWeeks,
  };
}

/** Public listing: published cohorts, with teacher name and live seat count. */
export async function listPublishedCohorts() {
  const db = getDb();
  return db
    .select({
      ...cohortColumns,
      teacherName: users.fullName,
      teacherAvatar: users.avatarUrl,
      seatsTaken,
    })
    .from(cohorts)
    .innerJoin(users, eq(cohorts.teacherId, users.id))
    .where(eq(cohorts.isPublished, true))
    .orderBy(asc(cohorts.startDate));
}

export async function getPublishedCohortBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select({
      ...cohortColumns,
      teacherName: users.fullName,
      teacherAvatar: users.avatarUrl,
      seatsTaken,
    })
    .from(cohorts)
    .innerJoin(users, eq(cohorts.teacherId, users.id))
    .where(and(eq(cohorts.slug, slug), eq(cohorts.isPublished, true)))
    .limit(1);
  return rows[0] ?? null;
}

/** Slugs for the sitemap. */
export async function listPublishedCohortSlugs() {
  const db = getDb();
  return db
    .select({ slug: cohorts.slug, updatedAt: cohorts.updatedAt })
    .from(cohorts)
    .where(eq(cohorts.isPublished, true));
}

/** Admin: every cohort, published or not, including the meeting link. */
export async function listAllCohorts() {
  const db = getDb();
  return db
    .select({
      ...cohortColumns,
      meetingLink: cohorts.meetingLink,
      teacherName: users.fullName,
      seatsTaken,
      waitlistCount,
    })
    .from(cohorts)
    .innerJoin(users, eq(cohorts.teacherId, users.id))
    .orderBy(desc(cohorts.createdAt));
}

/** A teacher's own cohorts. */
export async function listTeacherCohorts(teacherId: string) {
  const db = getDb();
  return db
    .select({
      ...cohortColumns,
      meetingLink: cohorts.meetingLink,
      seatsTaken,
      waitlistCount,
    })
    .from(cohorts)
    .where(eq(cohorts.teacherId, teacherId))
    .orderBy(asc(cohorts.startDate));
}

/**
 * Roster for one or more cohorts. Email is included because this is only ever
 * handed to the admin or to the cohort's own teacher — callers must have
 * checked that before calling.
 */
export async function getRosters(cohortIds: string[]) {
  if (cohortIds.length === 0) return [];
  const db = getDb();
  return db
    .select({
      id: cohortEnrollments.id,
      cohortId: cohortEnrollments.cohortId,
      studentId: cohortEnrollments.studentId,
      studentName: users.fullName,
      studentEmail: users.email,
      status: cohortEnrollments.status,
      seatHeldUntil: cohortEnrollments.seatHeldUntil,
      trialClassAt: cohortEnrollments.trialClassAt,
      monthlyFee: cohortEnrollments.monthlyFee,
      currency: cohortEnrollments.currency,
      currentPeriodEnd: cohortEnrollments.currentPeriodEnd,
      cancelAtPeriodEnd: cohortEnrollments.cancelAtPeriodEnd,
      waitlistedAt: cohortEnrollments.waitlistedAt,
      createdAt: cohortEnrollments.createdAt,
    })
    .from(cohortEnrollments)
    .innerJoin(users, eq(cohortEnrollments.studentId, users.id))
    .where(inArray(cohortEnrollments.cohortId, cohortIds))
    .orderBy(asc(cohortEnrollments.createdAt));
}

/** One student's row for one cohort (or null). */
export async function getStudentEnrollment(cohortId: string, studentId: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: cohortEnrollments.id,
      status: cohortEnrollments.status,
      seatHeldUntil: cohortEnrollments.seatHeldUntil,
      trialClassAt: cohortEnrollments.trialClassAt,
      stripeSubscriptionId: cohortEnrollments.stripeSubscriptionId,
      cancelAtPeriodEnd: cohortEnrollments.cancelAtPeriodEnd,
      currentPeriodEnd: cohortEnrollments.currentPeriodEnd,
    })
    .from(cohortEnrollments)
    .where(
      and(
        eq(cohortEnrollments.cohortId, cohortId),
        eq(cohortEnrollments.studentId, studentId)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

/** Everything a student has joined, with the cohort and its meeting link. */
export async function listStudentCohorts(studentId: string) {
  const db = getDb();
  return db
    .select({
      enrollmentId: cohortEnrollments.id,
      status: cohortEnrollments.status,
      seatHeldUntil: cohortEnrollments.seatHeldUntil,
      trialClassAt: cohortEnrollments.trialClassAt,
      cancelAtPeriodEnd: cohortEnrollments.cancelAtPeriodEnd,
      currentPeriodEnd: cohortEnrollments.currentPeriodEnd,
      paidFee: cohortEnrollments.monthlyFee,
      paidCurrency: cohortEnrollments.currency,
      ...cohortColumns,
      meetingLink: cohorts.meetingLink,
      teacherName: users.fullName,
    })
    .from(cohortEnrollments)
    .innerJoin(cohorts, eq(cohortEnrollments.cohortId, cohorts.id))
    .innerJoin(users, eq(cohorts.teacherId, users.id))
    .where(eq(cohortEnrollments.studentId, studentId))
    .orderBy(asc(cohorts.startDate));
}

/**
 * May this student see the meeting link right now?
 * Paying students: yes. A trial: only until its one class ends. Everyone else: no.
 */
export function canSeeMeetingLink(
  row: { status: string; seatHeldUntil: Date | null },
  now: Date = new Date()
): boolean {
  if (row.status === "active" || row.status === "past_due") return true;
  if (row.status === "trial") {
    return !!row.seatHeldUntil && row.seatHeldUntil.getTime() > now.getTime();
  }
  return false;
}

export type ClaimResult =
  | { ok: true; enrollmentId: string }
  | {
      ok: false;
      reason:
        | "not_found"
        | "closed"
        | "full"
        | "already_enrolled"
        | "trial_used"
        | "trial_disabled";
    };

/**
 * Take a seat — for a checkout in progress ("pending") or a free trial class.
 *
 * Seat limits are enforced HERE, in the database, in one transaction:
 *   1. lock the cohort row, so two students cannot count the seats at once;
 *   2. insert/refresh the student's row only if a seat is actually free.
 * The second statement takes its snapshot after the lock is held, so it sees
 * every seat a concurrent request just took. Checking the count in JavaScript
 * and inserting afterwards would let the 31st student in.
 *
 * A student's own existing hold never counts against them (they can retry a
 * checkout), a paying student is never downgraded, and a trial can be booked
 * only once per cohort because trial_class_at is never cleared.
 */
export async function claimSeat(args: {
  cohortId: string;
  studentId: string;
  mode: "pending" | "trial";
  heldUntil: Date;
  trialClassAt?: Date;
}): Promise<ClaimResult> {
  const db = getDb();
  const { cohortId, studentId, mode } = args;
  const heldUntil = args.heldUntil.toISOString();
  const trialClassAt = args.trialClassAt?.toISOString() ?? null;

  const [, claimed] = await db.batch([
    db.execute(sql`SELECT id FROM cohorts WHERE id = ${cohortId} FOR UPDATE`),
    db.execute(sql`
      INSERT INTO cohort_enrollments
        (cohort_id, student_id, status, seat_held_until, trial_class_at, monthly_fee, currency)
      SELECT c.id, ${studentId}, ${mode}::cohort_enrollment_status,
             ${heldUntil}::timestamptz, ${trialClassAt}::timestamptz,
             c.monthly_fee, c.currency
      FROM cohorts c
      WHERE c.id = ${cohortId}
        AND c.is_published
        AND c.enrollment_open
        AND (${mode} <> 'trial' OR c.trial_enabled)
        AND (
          SELECT count(*) FROM cohort_enrollments e
          WHERE e.cohort_id = c.id
            AND e.student_id <> ${studentId}
            AND ${HOLDS_SEAT}
        ) < c.max_seats
      ON CONFLICT (cohort_id, student_id) DO UPDATE SET
        status = EXCLUDED.status,
        seat_held_until = EXCLUDED.seat_held_until,
        trial_class_at = COALESCE(cohort_enrollments.trial_class_at, EXCLUDED.trial_class_at),
        monthly_fee = EXCLUDED.monthly_fee,
        currency = EXCLUDED.currency,
        waitlisted_at = NULL,
        updated_at = now()
      WHERE cohort_enrollments.status NOT IN ('active', 'past_due')
        AND (EXCLUDED.status <> 'trial' OR cohort_enrollments.trial_class_at IS NULL)
      RETURNING id
    `),
  ]);

  const row = claimed.rows[0] as { id: string } | undefined;
  if (row) return { ok: true, enrollmentId: row.id };

  // No seat taken. Work out why, so the student is told the truth.
  const [cohort] = await db
    .select({
      isPublished: cohorts.isPublished,
      enrollmentOpen: cohorts.enrollmentOpen,
      trialEnabled: cohorts.trialEnabled,
    })
    .from(cohorts)
    .where(eq(cohorts.id, cohortId))
    .limit(1);
  if (!cohort || !cohort.isPublished) return { ok: false, reason: "not_found" };
  if (!cohort.enrollmentOpen) return { ok: false, reason: "closed" };
  if (mode === "trial" && !cohort.trialEnabled) {
    return { ok: false, reason: "trial_disabled" };
  }

  const existing = await getStudentEnrollment(cohortId, studentId);
  if (existing && (existing.status === "active" || existing.status === "past_due")) {
    return { ok: false, reason: "already_enrolled" };
  }
  if (mode === "trial" && existing?.trialClassAt) {
    return { ok: false, reason: "trial_used" };
  }
  return { ok: false, reason: "full" };
}

export type WaitlistResult =
  | { ok: true; position: number }
  | { ok: false; reason: "not_found" | "closed" | "already_enrolled" | "seats_available" };

/**
 * Join the waitlist — only when the cohort really is full. Never moves a
 * paying student or a student with a live seat hold onto the waitlist.
 */
export async function joinWaitlist(
  cohortId: string,
  studentId: string
): Promise<WaitlistResult> {
  const db = getDb();

  const [, joined] = await db.batch([
    db.execute(sql`SELECT id FROM cohorts WHERE id = ${cohortId} FOR UPDATE`),
    db.execute(sql`
      INSERT INTO cohort_enrollments (cohort_id, student_id, status, waitlisted_at)
      SELECT c.id, ${studentId}, 'waitlisted', now()
      FROM cohorts c
      WHERE c.id = ${cohortId}
        AND c.is_published
        AND c.enrollment_open
        AND (
          SELECT count(*) FROM cohort_enrollments e
          WHERE e.cohort_id = c.id AND ${HOLDS_SEAT}
        ) >= c.max_seats
      ON CONFLICT (cohort_id, student_id) DO UPDATE SET
        status = 'waitlisted',
        waitlisted_at = COALESCE(cohort_enrollments.waitlisted_at, now()),
        seat_held_until = NULL,
        updated_at = now()
      WHERE cohort_enrollments.status NOT IN ('active', 'past_due')
        AND NOT (
          cohort_enrollments.status IN ('pending', 'trial')
          AND cohort_enrollments.seat_held_until > now()
        )
      RETURNING id
    `),
  ]);

  if (joined.rows[0]) {
    const position = await waitlistPosition(cohortId, studentId);
    return { ok: true, position };
  }

  const [cohort] = await db
    .select({
      isPublished: cohorts.isPublished,
      enrollmentOpen: cohorts.enrollmentOpen,
    })
    .from(cohorts)
    .where(eq(cohorts.id, cohortId))
    .limit(1);
  if (!cohort || !cohort.isPublished) return { ok: false, reason: "not_found" };
  if (!cohort.enrollmentOpen) return { ok: false, reason: "closed" };

  const existing = await getStudentEnrollment(cohortId, studentId);
  if (
    existing &&
    (existing.status === "active" ||
      existing.status === "past_due" ||
      ((existing.status === "pending" || existing.status === "trial") &&
        !!existing.seatHeldUntil &&
        existing.seatHeldUntil.getTime() > Date.now()))
  ) {
    return { ok: false, reason: "already_enrolled" };
  }
  return { ok: false, reason: "seats_available" };
}

export async function waitlistPosition(
  cohortId: string,
  studentId: string
): Promise<number> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT count(*)::int AS position
    FROM cohort_enrollments e
    JOIN cohort_enrollments me
      ON me.cohort_id = e.cohort_id AND me.student_id = ${studentId}
    WHERE e.cohort_id = ${cohortId}
      AND e.status = 'waitlisted'
      AND e.waitlisted_at <= me.waitlisted_at
  `);
  return Number((result.rows[0] as { position?: number } | undefined)?.position ?? 0);
}

/** Leave the waitlist. Only ever touches a `waitlisted` row. */
export async function leaveWaitlist(cohortId: string, studentId: string) {
  const db = getDb();
  const rows = await db
    .update(cohortEnrollments)
    .set({ status: "cancelled", waitlistedAt: null, cancelledAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(cohortEnrollments.cohortId, cohortId),
        eq(cohortEnrollments.studentId, studentId),
        eq(cohortEnrollments.status, "waitlisted")
      )
    )
    .returning({ id: cohortEnrollments.id });
  return rows.length > 0;
}

/**
 * Tell the first person on the waitlist that a seat has opened.
 *
 * A seat cannot be handed over automatically — the student still has to pay —
 * so this writes them a notification with a link to the cohort. Returns the
 * number of people notified (0 or 1) so the caller can log what happened.
 */
export async function notifyNextOnWaitlist(cohortId: string): Promise<number> {
  const db = getDb();
  const [next] = await db
    .select({
      studentId: cohortEnrollments.studentId,
      slug: cohorts.slug,
      titleEn: cohorts.titleEn,
      language: users.preferredLanguage,
    })
    .from(cohortEnrollments)
    .innerJoin(cohorts, eq(cohortEnrollments.cohortId, cohorts.id))
    .innerJoin(users, eq(cohortEnrollments.studentId, users.id))
    .where(
      and(
        eq(cohortEnrollments.cohortId, cohortId),
        eq(cohortEnrollments.status, "waitlisted")
      )
    )
    .orderBy(asc(cohortEnrollments.waitlistedAt))
    .limit(1);

  if (!next) return 0;

  await db.insert(notifications).values({
    userId: next.studentId,
    type: "system",
    titleEn: "A seat has opened in your group class",
    titleUr: "آپ کی گروپ کلاس میں ایک نشست خالی ہو گئی ہے",
    titleAr: "أصبح هناك مقعد متاح في حصتك الجماعية",
    message: `A seat is now available in "${next.titleEn}". Seats are first come, first served — enroll now to take it.`,
    link: `/${next.language}/group-classes/${next.slug}`,
  });
  return 1;
}
