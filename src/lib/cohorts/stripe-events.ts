import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb } from "@/lib/db";
import { cohortEnrollments } from "@/lib/db/schema";
import { notifyNextOnWaitlist } from "./queries";

/**
 * Stripe → cohort enrollment state.
 *
 * Each handler returns how many enrollment rows it changed. The webhook route
 * treats "a cohort event that changed nothing" as a failure and alerts: a paid
 * checkout that matches no enrollment is a student who paid and got no seat,
 * and that must never pass as a quiet 200.
 *
 * Every update is idempotent, so Stripe re-delivering an event is harmless.
 */

function periodEndOf(subscription: Stripe.Subscription): Date | null {
  // In Stripe v20 the period dates live on the subscription items.
  const item = subscription.items?.data?.[0];
  return item ? new Date(item.current_period_end * 1000) : null;
}

/** checkout.session.completed for a cohort: the seat is now paid for. */
export async function activateCohortEnrollment(
  session: Stripe.Checkout.Session
): Promise<number> {
  const enrollmentId = session.metadata?.enrollmentId;
  const cohortId = session.metadata?.cohortId;
  const studentId = session.metadata?.studentId;
  if (!enrollmentId || !cohortId || !studentId) return 0;

  const db = getDb();
  const rows = await db
    .update(cohortEnrollments)
    .set({
      status: "active",
      seatHeldUntil: null,
      waitlistedAt: null,
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : null,
      stripeSubscriptionId:
        typeof session.subscription === "string" ? session.subscription : null,
      stripeCheckoutSessionId: session.id,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      activatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(cohortEnrollments.id, enrollmentId),
        eq(cohortEnrollments.cohortId, cohortId),
        eq(cohortEnrollments.studentId, studentId)
      )
    )
    .returning({ id: cohortEnrollments.id });
  return rows.length;
}

/** customer.subscription.updated: renewals, failed payments, scheduled cancellation. */
export async function syncCohortSubscription(
  subscription: Stripe.Subscription
): Promise<number> {
  const db = getDb();

  // Only statuses that mean something for a seat are mapped. Anything else
  // (incomplete, paused, …) leaves the row as it is rather than guessing.
  const status =
    subscription.status === "active" || subscription.status === "trialing"
      ? ("active" as const)
      : subscription.status === "past_due" || subscription.status === "unpaid"
        ? ("past_due" as const)
        : null;

  const rows = await db
    .update(cohortEnrollments)
    .set({
      ...(status ? { status } : {}),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: periodEndOf(subscription),
      updatedAt: new Date(),
    })
    .where(eq(cohortEnrollments.stripeSubscriptionId, subscription.id))
    .returning({ id: cohortEnrollments.id });
  return rows.length;
}

/**
 * customer.subscription.deleted: the subscription has ended. The seat is
 * released and the first person on the waitlist is told.
 */
export async function cancelCohortEnrollment(
  subscription: Stripe.Subscription
): Promise<{ changed: number; notified: number }> {
  const db = getDb();
  const rows = await db
    .update(cohortEnrollments)
    .set({
      status: "cancelled",
      seatHeldUntil: null,
      cancelAtPeriodEnd: false,
      cancelledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(cohortEnrollments.stripeSubscriptionId, subscription.id))
    .returning({ cohortId: cohortEnrollments.cohortId });

  let notified = 0;
  for (const row of rows) {
    notified += await notifyNextOnWaitlist(row.cohortId);
  }
  return { changed: rows.length, notified };
}

/** invoice.payment_failed for a cohort subscription. */
export async function markCohortPastDue(subscriptionId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .update(cohortEnrollments)
    .set({ status: "past_due", updatedAt: new Date() })
    .where(
      and(
        eq(cohortEnrollments.stripeSubscriptionId, subscriptionId),
        eq(cohortEnrollments.status, "active")
      )
    )
    .returning({ id: cohortEnrollments.id });
  return rows.length;
}
