import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cohortEnrollments } from "@/lib/db/schema";
import { requireUser } from "@/lib/api-auth";
import { sendFailureAlert } from "@/lib/alerts";
import { cancelSubscription, reactivateSubscription } from "@/lib/stripe";

/**
 * POST /api/cohorts/[id]/cancel — cancel (or undo cancelling) the caller's OWN
 * cohort subscription at the end of the paid month.
 *
 * The subscription id is read from the caller's enrollment row; the request
 * cannot name one. The student keeps their seat until the period ends, when
 * Stripe sends `customer.subscription.deleted` and the webhook releases it.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { undo?: boolean };
  const undo = body.undo === true;

  try {
    const db = getDb();
    const [row] = await db
      .select({
        id: cohortEnrollments.id,
        status: cohortEnrollments.status,
        stripeSubscriptionId: cohortEnrollments.stripeSubscriptionId,
      })
      .from(cohortEnrollments)
      .where(
        and(
          eq(cohortEnrollments.cohortId, id),
          eq(cohortEnrollments.studentId, auth.user.id)
        )
      )
      .limit(1);

    if (
      !row ||
      !row.stripeSubscriptionId ||
      (row.status !== "active" && row.status !== "past_due")
    ) {
      return NextResponse.json({ error: "no_subscription" }, { status: 404 });
    }

    const subscription = undo
      ? await reactivateSubscription(row.stripeSubscriptionId)
      : await cancelSubscription(row.stripeSubscriptionId);

    // Record what Stripe now says, rather than what was asked for.
    await db
      .update(cohortEnrollments)
      .set({
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(cohortEnrollments.id, row.id));

    return NextResponse.json({
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    await sendFailureAlert({
      source: "/api/cohorts/[id]/cancel",
      summary: "A student could not change their group class subscription.",
      error,
      context: { cohortId: id, studentId: auth.user.id },
    });
    return NextResponse.json({ error: "cancel_failed" }, { status: 500 });
  }
}
