import Stripe from "stripe";
import { applyDiscount, type CourseKey } from "@/lib/pricing";

// Lazy initialization to avoid build-time errors when env vars are empty
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

export type CourseType = CourseKey;
export type PlanType = "plan1" | "plan2";

/**
 * Create a Stripe Checkout Session for a 1-on-1 / AI-only course subscription.
 *
 * `monthlyAmount` and `discountPercent` are decided by the SERVER from the
 * pricing config and the enrollment row (see /api/payments/checkout). Nothing
 * here accepts a price or a discount from the browser.
 *
 * This only ever creates a NEW subscription. It never modifies an existing
 * one, so students already subscribed keep the amount they signed up at.
 */
export async function createCheckoutSession({
  customerEmail,
  courseType,
  planType,
  billingInterval,
  successUrl,
  cancelUrl,
  studentId,
  enrollmentId,
  courseId,
  monthlyAmount,
  yearlyMonthsCharged,
  discountPercent = 0,
}: {
  customerEmail: string;
  courseType: CourseType;
  planType: PlanType;
  billingInterval: "month" | "year";
  successUrl: string;
  cancelUrl: string;
  studentId: string;
  enrollmentId: string;
  courseId: string;
  /** List price per month in USD, before any family discount. */
  monthlyAmount: number;
  yearlyMonthsCharged: number;
  /** Family discount as a percentage, e.g. 15. */
  discountPercent?: number;
}) {
  const stripe = getStripe();
  const listAmount =
    billingInterval === "year"
      ? monthlyAmount * yearlyMonthsCharged
      : monthlyAmount;
  const unitAmountCents = Math.round(
    applyDiscount(listAmount, discountPercent) * 100
  );
  if (!Number.isFinite(unitAmountCents) || unitAmountCents <= 0) {
    throw new Error(`Refusing to create a checkout for ${unitAmountCents} cents`);
  }

  const metadata = {
    kind: "course",
    studentId,
    enrollmentId,
    courseId,
    courseType,
    planType,
    billingInterval,
    discountPercent: String(discountPercent),
  };

  const session = await stripe.checkout.sessions.create({
    customer_email: customerEmail,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Tibyaan Academy — ${courseType.charAt(0).toUpperCase() + courseType.slice(1)} (${planType === "plan1" ? "Human + AI" : "AI Only"})`,
            description: `${billingInterval === "year" ? "Annual" : "Monthly"} subscription`,
          },
          unit_amount: unitAmountCents,
          recurring: {
            interval: billingInterval,
          },
        },
        quantity: 1,
      },
    ],
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: { metadata },
  });

  return session;
}

/**
 * Create a Stripe Checkout Session for a group cohort seat: one monthly
 * subscription at the fee the admin set on that cohort.
 *
 * The session expires after 30 minutes (Stripe's minimum), which is exactly as
 * long as the seat is held for the student — an unpaid checkout can never
 * outlive its seat reservation.
 */
export async function createCohortCheckoutSession({
  customerEmail,
  cohortId,
  cohortTitle,
  enrollmentId,
  studentId,
  monthlyFee,
  currency,
  expiresAt,
  successUrl,
  cancelUrl,
}: {
  customerEmail: string;
  cohortId: string;
  cohortTitle: string;
  enrollmentId: string;
  studentId: string;
  monthlyFee: number;
  currency: string;
  expiresAt: Date;
  successUrl: string;
  cancelUrl: string;
}) {
  const unitAmountCents = Math.round(monthlyFee * 100);
  if (!Number.isFinite(unitAmountCents) || unitAmountCents <= 0) {
    throw new Error(`Refusing to create a cohort checkout for ${unitAmountCents} cents`);
  }

  const metadata = { kind: "cohort", cohortId, enrollmentId, studentId };

  return getStripe().checkout.sessions.create({
    customer_email: customerEmail,
    mode: "subscription",
    payment_method_types: ["card"],
    client_reference_id: enrollmentId,
    expires_at: Math.floor(expiresAt.getTime() / 1000),
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `Tibyaan Academy — Group Class: ${cohortTitle}`,
            description: "Monthly group class subscription",
          },
          unit_amount: unitAmountCents,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    metadata,
    subscription_data: { metadata },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

// Cancel a Stripe subscription
export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// Reactivate a cancelled subscription (before period end)
export async function reactivateSubscription(subscriptionId: string) {
  return getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

// Create a billing portal session for the customer
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
