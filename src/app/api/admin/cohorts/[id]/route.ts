import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cohorts, users } from "@/lib/db/schema";
import { requireDbAdmin } from "@/lib/db-role";
import { sendFailureAlert } from "@/lib/alerts";
import { getRosters } from "@/lib/cohorts/queries";
import { cohortInputSchema } from "@/lib/cohorts/validation";

/** GET /api/admin/cohorts/[id] — the roster (enrolled, trial, pending, waitlist). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireDbAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  try {
    const roster = await getRosters([id]);
    return NextResponse.json({ roster });
  } catch (error) {
    await sendFailureAlert({
      source: "/api/admin/cohorts/[id] GET",
      summary: "A cohort roster failed to load for the admin.",
      error,
      context: { cohortId: id },
    });
    return NextResponse.json({ error: "Could not load roster" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/cohorts/[id] — edit a cohort.
 *
 * Changing the fee here changes what NEW enrollments are charged. A student
 * already subscribed keeps the fee on their Stripe subscription; nothing in
 * this route talks to Stripe.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireDbAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = cohortInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid cohort", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const input = parsed.data;

  try {
    const db = getDb();
    const [teacher] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, input.teacherId))
      .limit(1);
    if (!teacher || (teacher.role !== "teacher" && teacher.role !== "admin")) {
      return NextResponse.json(
        { error: "The selected teacher is not a teacher account" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(cohorts)
      .set({
        ...input,
        monthlyFee: input.monthlyFee.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(cohorts.id, id))
      .returning({ id: cohorts.id, slug: cohorts.slug });

    if (updated.length === 0) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }
    return NextResponse.json({ cohort: updated[0] });
  } catch (error) {
    await sendFailureAlert({
      source: "/api/admin/cohorts/[id] PATCH",
      summary: "Saving a cohort failed — the change was NOT applied.",
      error,
      context: { cohortId: id },
    });
    return NextResponse.json({ error: "Could not save cohort" }, { status: 500 });
  }
}
