import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, testsAssignments, notifications } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * The student marks an item done.
 *
 * pending -> submitted, stamping completed_at. No new status value: the enum
 * already carries 'submitted', and altering a live enum is not worth it for
 * this. Grading is out of scope for this phase, so 'graded' is only ever set
 * elsewhere and is treated here as already-complete.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as { action?: string };
    if (body.action !== "complete") {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    // Scoped to this student's own row, so one student cannot complete
    // another's item by guessing an id. A miss is 404 either way.
    const [item] = await db
      .select()
      .from(testsAssignments)
      .where(and(eq(testsAssignments.id, id), eq(testsAssignments.studentId, authUser.id)))
      .limit(1);

    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Already done. Return the row unchanged rather than re-stamping the time
    // or notifying the teacher a second time.
    if (item.status !== "pending") {
      return NextResponse.json({ assignment: item, alreadyComplete: true });
    }

    const completedAt = new Date();
    const [updated] = await db
      .update(testsAssignments)
      .set({ status: "submitted", completedAt })
      .where(and(eq(testsAssignments.id, id), eq(testsAssignments.studentId, authUser.id)))
      .returning();

    // The teacher is told. A notification failure must not lose the
    // completion the student just recorded, so this is reported, not thrown:
    // silent failure is what the constitution forbids, but so is discarding
    // a write that already succeeded.
    let notified = true;
    try {
      const label = item.type === "test" ? "test" : "assignment";
      await db.insert(notifications).values({
        userId: item.teacherId,
        // Reusing 'system' deliberately. Adding a value to a live Postgres
        // enum is a migration risk not worth taking for a label; revisit if
        // assignment notifications ever need their own handling.
        type: "system",
        titleEn: `${dbUser.fullName ?? "A student"} completed a ${label}`,
        message: `"${item.title}" was marked done.`,
        link: "/teacher/tests-assignments",
      });
    } catch (error) {
      notified = false;
      console.error("Assignment completion notification failed:", error);
    }

    return NextResponse.json({ assignment: updated, notified });
  } catch (error) {
    console.error("Student assignment PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
