import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { subscriptions, enrollments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { sendFailureAlert } from "@/lib/alerts";
import {
  activateCohortEnrollment,
  cancelCohortEnrollment,
  markCohortPastDue,
  syncCohortSubscription,
} from "@/lib/cohorts/stripe-events";

/**
 * Stripe webhook.
 *
 * Two kinds of subscription pass through here, told apart by `metadata.kind`,
 * which our own checkout code sets on both the session and the subscription:
 *   "cohort" — a group class seat   -> cohort_enrollments
 *   anything else — a course plan   -> enrollments + subscriptions (as before)
 *
 * Any failure returns 500 so Stripe retries, and sends an alert: a swallowed
 * webhook error is a student who paid and whose access never switched on.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.kind === "cohort") {
          const changed = await activateCohortEnrollment(session);
          if (changed === 0) {
            // Paid, but no enrollment row matched. Do not acknowledge quietly.
            throw new Error(
              `Cohort checkout ${session.id} was paid but matched no enrollment ` +
                `(enrollmentId=${session.metadata?.enrollmentId}).`
            );
          }
          console.log(`Cohort enrollment ${session.metadata.enrollmentId} activated`);
          break;
        }

        const { studentId, enrollmentId, courseId, planType } =
          session.metadata || {};

        if (!studentId || !enrollmentId) break;

        // Activate enrollment
        const activated = await db
          .update(enrollments)
          .set({
            status: "active",
            stripeSubscriptionId: session.subscription as string,
            subscriptionStartDate: new Date(),
          })
          .where(eq(enrollments.id, enrollmentId))
          .returning({ courseId: enrollments.courseId });

        // The subscription row needs the COURSE id. This used to be written as
        // `courseId: enrollmentId`, which the foreign key to `courses` rejects,
        // so the insert failed after the enrollment had already been activated.
        const resolvedCourseId = courseId || activated[0]?.courseId;
        if (!resolvedCourseId) {
          throw new Error(
            `Checkout ${session.id}: enrollment ${enrollmentId} not found, cannot record the subscription.`
          );
        }

        // Create subscription record. amount_total is what the student was
        // actually charged (after any family discount) — the teacher's share
        // is calculated from this figure.
        await db.insert(subscriptions).values({
          studentId,
          courseId: resolvedCourseId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          planType: planType === "plan1" ? "human_ai" : "pure_ai",
          amountUsd: session.amount_total
            ? (session.amount_total / 100).toString()
            : "0",
          status: "active",
          currentPeriodStart: new Date(),
        });

        console.log(`Enrollment ${enrollmentId} activated for student ${studentId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subId = subscription.id;

        if (subscription.metadata?.kind === "cohort") {
          const changed = await syncCohortSubscription(subscription);
          console.log(`Cohort subscription ${subId} synced (${changed} row)`);
          break;
        }

        const newStatus = subscription.cancel_at_period_end
          ? "cancelled"
          : subscription.status === "active"
            ? "active"
            : subscription.status === "past_due"
              ? "past_due"
              : "active";

        // In Stripe v20, period dates are on subscription items
        const firstItem = subscription.items?.data?.[0];
        const updateData: Record<string, unknown> = {
          status: newStatus as "active" | "cancelled" | "past_due" | "trialing",
        };
        if (firstItem) {
          updateData.currentPeriodStart = new Date(
            firstItem.current_period_start * 1000
          );
          updateData.currentPeriodEnd = new Date(
            firstItem.current_period_end * 1000
          );
        }

        await db
          .update(subscriptions)
          .set(updateData)
          .where(eq(subscriptions.stripeSubscriptionId, subId));

        console.log(`Subscription ${subId} updated to ${newStatus}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subId = subscription.id;

        if (subscription.metadata?.kind === "cohort") {
          const { changed, notified } = await cancelCohortEnrollment(subscription);
          console.log(
            `Cohort subscription ${subId} ended — ${changed} seat released, ${notified} waitlisted student notified`
          );
          break;
        }

        // Mark subscription as cancelled
        await db
          .update(subscriptions)
          .set({ status: "cancelled" })
          .where(eq(subscriptions.stripeSubscriptionId, subId));

        // Deactivate enrollment
        await db
          .update(enrollments)
          .set({ status: "cancelled" })
          .where(eq(enrollments.stripeSubscriptionId, subId));

        console.log(`Subscription ${subId} deleted — enrollment deactivated`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // In Stripe v20, subscription is under parent.subscription_details
        const details = invoice.parent?.subscription_details;
        const parentSub = details?.subscription;
        const subId =
          typeof parentSub === "string" ? parentSub : parentSub?.id;

        if (subId) {
          if (details?.metadata?.kind === "cohort") {
            await markCohortPastDue(subId);
            console.log(`Payment failed for cohort subscription ${subId}`);
            break;
          }

          await db
            .update(subscriptions)
            .set({ status: "past_due" })
            .where(eq(subscriptions.stripeSubscriptionId, subId));

          console.log(`Payment failed for subscription ${subId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    await sendFailureAlert({
      source: "/api/webhooks/stripe",
      summary: `Stripe event ${event.type} could not be processed — a payment may not be reflected in the student's access.`,
      error,
      context: { eventId: event.id, eventType: event.type },
    });
    return Response.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return Response.json({ received: true });
}
