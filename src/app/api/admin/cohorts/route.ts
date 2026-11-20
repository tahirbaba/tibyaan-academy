import { NextRequest, NextResponse } from "next/server";
import { eq, inArray, like } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cohorts, users } from "@/lib/db/schema";
import { requireDbAdmin } from "@/lib/db-role";
import { sendFailureAlert } from "@/lib/alerts";
import { listAllCohorts } from "@/lib/cohorts/queries";
import { cohortInputSchema, slugify } from "@/lib/cohorts/validation";

/** GET /api/admin/cohorts — every cohort plus the teachers that can be assigned. */
export async function GET() {
  const auth = await requireDbAdmin();
  if (!auth.ok) return auth.response;

  try {
    const db = getDb();
    const [cohortRows, teachers] = await Promise.all([
      listAllCohorts(),
      db
        .select({ id: users.id, fullName: users.fullName })
        .from(users)
        .where(inArray(users.role, ["teacher", "admin"])),
    ]);
    return NextResponse.json({ cohorts: cohortRows, teachers });
  } catch (error) {
    await sendFailureAlert({
      source: "/api/admin/cohorts GET",
      summary: "The admin cohort list failed to load.",
      error,
    });
    return NextResponse.json({ error: "Could not load cohorts" }, { status: 500 });
  }
}

/** POST /api/admin/cohorts — create a cohort. */
export async function POST(request: NextRequest) {
  const auth = await requireDbAdmin();
  if (!auth.ok) return auth.response;

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

    // Unique slug: "nahw-sarf", then "nahw-sarf-2", …
    const base = slugify(input.titleEn);
    const taken = new Set(
      (
        await db
          .select({ slug: cohorts.slug })
          .from(cohorts)
          .where(like(cohorts.slug, `${base}%`))
      ).map((r) => r.slug)
    );
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

    const [created] = await db
      .insert(cohorts)
      .values({
        ...input,
        slug,
        monthlyFee: input.monthlyFee.toFixed(2),
      })
      .returning({ id: cohorts.id, slug: cohorts.slug });

    return NextResponse.json({ cohort: created }, { status: 201 });
  } catch (error) {
    await sendFailureAlert({
      source: "/api/admin/cohorts POST",
      summary: "Creating a cohort failed — nothing was saved.",
      error,
    });
    return NextResponse.json({ error: "Could not create cohort" }, { status: 500 });
  }
}
