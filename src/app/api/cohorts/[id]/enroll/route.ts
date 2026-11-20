import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getDb } from "@/lib/db";
import { cohortEnrollments, cohorts } from "@/lib/db/schema";
import { requireUser } from "@/lib/api-auth";
import { sendFailureAlert } from "@/lib/alerts";
import { SITE_URL } from "@/lib/site-config";
import { createCohortCheckoutSession } from "@/lib/stripe";
import { CHECKOUT_HOLD_MINUTES, claimSeat } from "@/lib/cohorts/queries";
import { hasEnded } from "@/lib/cohorts/schedule";

/**
 * POST /api/cohorts/[id]/enroll — start a monthly Stripe subscription for a seat.
 *
 * 1. Take a seat in the database (held for 30 minutes). Full cohort -> 409.
 * 2. Create a Stripe Checkout session that expires when the hold does.
 * 3. The webhook marks the enrollment active when Stripe confirms payment.
 *
 * The fee comes from the cohort row. The browser sends no amount.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const body = (await request.json().catch(() => ({}))) as { locale?: string };
  const locale = hasLocale(routing.locales, body.locale) ? body.locale : "en";

  if (!auth.user.email) {
    return NextResponse.json({ error: "Account has no email" }, { status: 400 });
  }

  const db = getDb();
  let enrollmentId: string | null = null;

  try {
    const [cohort] = await db
      .select({
        id: cohorts.id,
        slug: cohorts.slug,
        titleEn: cohorts.titleEn,
        monthlyFee: cohorts.monthlyFee,
        currency: cohorts.currency,
        weekdaysUtc: cohorts.weekdaysUtc,
        startTimeUtc: cohorts.startTimeUtc,
        sessionMinutes: cohorts.sessionMinutes,
        startDate: cohorts.startDate,
        durationWeeks: cohorts.durationWeeks,
        isPublished: cohorts.isPublished,
      })
      .from(cohorts)
      .where(eq(cohorts.id, id))
      .limit(1);

    if (!cohort || !cohort.isPublished) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (hasEnded(cohort)) {
      return NextResponse.json({ error: "ended" }, { status: 409 });
    }

    const heldUntil = new Date(Date.now() + CHECKOUT_HOLD_MINUTES * 60 * 1000);
    const claim = await claimSeat({
      cohortId: id,
      studentId: auth.user.id,
      mode: "pending",
      heldUntil,
    });
    if (!claim.ok) {
      return NextResponse.json(
        { error: claim.reason },
        { status: claim.reason === "not_found" ? 404 : 409 }
      );
    }
    enrollmentId = claim.enrollmentId;

    const session = await createCohortCheckoutSession({
      customerEmail: auth.user.email,
      cohortId: cohort.id,
      cohortTitle: cohort.titleEn,
      enrollmentId,
      studentId: auth.user.id,
      monthlyFee: Number(cohort.monthlyFee),
      currency: cohort.currency,
      // Stripe requires at least 30 minutes; a few seconds of margin keeps the
      // request valid, and the seat hold above is the binding limit.
      expiresAt: new Date(heldUntil.getTime() + 60 * 1000),
      successUrl: `${SITE_URL}/${locale}/student/group-classes?enrolled=${cohort.slug}`,
      cancelUrl: `${SITE_URL}/${locale}/group-classes/${cohort.slug}?checkout=cancelled`,
    });

    if (!session.url) throw new Error("Stripe returned a session with no URL");

    await db
      .update(cohortEnrollments)
      .set({ stripeCheckoutSessionId: session.id, updatedAt: new Date() })
      .where(eq(cohortEnrollments.id, enrollmentId));

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Checkout could not be started: give the seat back at once rather than
    // leaving it blocked for 30 minutes. Only a still-pending row is released.
    if (enrollmentId) {
      await db
        .update(cohortEnrollments)
        .set({ status: "cancelled", seatHeldUntil: null, updatedAt: new Date() })
        .where(
          and(
            eq(cohortEnrollments.id, enrollmentId),
            eq(cohortEnrollments.status, "pending")
          )
        )
        .catch((releaseError) =>
          console.error("[cohort enroll] seat release failed:", releaseError)
        );
    }
    await sendFailureAlert({
      source: "/api/cohorts/[id]/enroll",
      summary: "A student could not start checkout for a group class.",
      error,
      context: { cohortId: id, studentId: auth.user.id },
    });
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
