import { NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site-config";
import { getDb } from "@/lib/db";
import { courses, enrollments } from "@/lib/db/schema";
import { createCheckoutSession } from "@/lib/stripe";
import { sendFailureAlert } from "@/lib/alerts";
import { getPricingForCharge } from "@/lib/pricing-server";
import {
  aiOnlyMonthly,
  familyDiscountPercent,
  oneOnOneMonthly,
} from "@/lib/pricing";

/**
 * Which child of the family this student is (1 = first).
 *
 * There is no family table. Siblings are recognised by the parent WhatsApp
 * number on their student profile: a student is the Nth child when N-1 OTHER
 * students with the same parent number already hold an active or trial
 * enrollment and enrolled earlier. No parent number -> first child, no
 * discount. The number is self-declared at onboarding, so this is a
 * convenience rule, not a verified one — see the PR's "Found issues".
 */
async function familyChildIndex(studentId: string): Promise<number> {
  const db = getDb();
  const result = await db.execute(sql`
    SELECT count(DISTINCT other.user_id)::int AS earlier_siblings
    FROM student_profiles me
    JOIN student_profiles other
      ON other.parent_whatsapp = me.parent_whatsapp
     AND other.user_id <> me.user_id
     AND other.created_at < me.created_at
    WHERE me.user_id = ${studentId}
      AND me.parent_whatsapp IS NOT NULL
      AND btrim(me.parent_whatsapp) <> ''
      AND EXISTS (
        SELECT 1 FROM enrollments e
        WHERE e.student_id = other.user_id
          AND e.status IN ('active', 'trial')
      )
  `);
  const earlier = Number(
    (result.rows[0] as { earlier_siblings?: number } | undefined)
      ?.earlier_siblings ?? 0
  );
  return earlier + 1;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { enrollmentId?: string; billingInterval?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { enrollmentId } = body;
  const billingInterval = body.billingInterval === "year" ? "year" : "month";

  if (!enrollmentId) {
    return Response.json(
      { error: "Missing required field: enrollmentId" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();

    // The enrollment row — not the request body — decides what is being sold.
    // The body used to carry courseType, planType and even discountPercent, so
    // a browser could ask to be charged 1% of the fee.
    const [enrollment] = await db
      .select({
        id: enrollments.id,
        courseId: enrollments.courseId,
        planType: enrollments.planType,
        classesPerWeek: enrollments.classesPerWeek,
        stripeSubscriptionId: enrollments.stripeSubscriptionId,
        courseType: courses.courseType,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(
        and(eq(enrollments.id, enrollmentId), eq(enrollments.studentId, user.id))
      )
      .limit(1);

    if (!enrollment) {
      return Response.json({ error: "Enrollment not found" }, { status: 404 });
    }
    if (enrollment.stripeSubscriptionId) {
      // Existing subscriptions are never re-priced or replaced from here.
      return Response.json(
        { error: "This enrollment already has a subscription" },
        { status: 409 }
      );
    }

    const pricing = await getPricingForCharge();
    const isHumanAi = enrollment.planType === "human_ai";
    const monthlyAmount = isHumanAi
      ? oneOnOneMonthly(pricing, enrollment.courseType, enrollment.classesPerWeek)
      : aiOnlyMonthly(pricing, enrollment.courseType);

    // The family discount belongs to the live-teacher plans.
    const discountPercent = isHumanAi
      ? familyDiscountPercent(pricing, await familyChildIndex(user.id))
      : 0;

    const session = await createCheckoutSession({
      customerEmail: user.email!,
      courseType: enrollment.courseType,
      planType: isHumanAi ? "plan1" : "plan2",
      billingInterval,
      successUrl: `${SITE_URL}/en/student/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${SITE_URL}/en/student/payments?cancelled=true`,
      studentId: user.id,
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      monthlyAmount,
      yearlyMonthsCharged: pricing.yearlyMonthsCharged,
      discountPercent,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    await sendFailureAlert({
      source: "/api/payments/checkout",
      summary: "A student could not start checkout.",
      error,
      context: { studentId: user.id, enrollmentId },
    });
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
