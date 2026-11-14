import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cohorts } from "@/lib/db/schema";
import { requireUser } from "@/lib/api-auth";
import { sendFailureAlert } from "@/lib/alerts";
import { claimSeat } from "@/lib/cohorts/queries";
import { nextUnstartedSession, sessionEnd } from "@/lib/cohorts/schedule";

/**
 * POST /api/cohorts/[id]/trial — book ONE free trial class.
 *
 * Same idea as the existing 5-day course trial (an enrollment in `trial`
 * status with an end date, no card needed), scoped to a single class: the
 * student gets the next class that has not started yet, holds a seat until
 * that class ends, and can see the meeting link until then. One trial per
 * student per cohort — enforced in the seat claim, not here.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  try {
    const db = getDb();
    const [cohort] = await db
      .select({
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

    const trialClassAt = nextUnstartedSession(cohort);
    if (!trialClassAt) {
      return NextResponse.json({ error: "ended" }, { status: 409 });
    }

    const claim = await claimSeat({
      cohortId: id,
      studentId: auth.user.id,
      mode: "trial",
      heldUntil: sessionEnd(cohort, trialClassAt),
      trialClassAt,
    });
    if (!claim.ok) {
      return NextResponse.json(
        { error: claim.reason },
        { status: claim.reason === "not_found" ? 404 : 409 }
      );
    }

    return NextResponse.json({ trialClassAt: trialClassAt.toISOString() });
  } catch (error) {
    await sendFailureAlert({
      source: "/api/cohorts/[id]/trial",
      summary: "A student could not book a free trial class.",
      error,
      context: { cohortId: id, studentId: auth.user.id },
    });
    return NextResponse.json({ error: "trial_failed" }, { status: 500 });
  }
}
