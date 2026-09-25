import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, testsAssignments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const assignments = await db
      // The student is shown the teachers name only. Selecting the whole
      // users row handed them the teachers email address as well.
      .select({
        assignment: testsAssignments,
        teacher: { id: users.id, fullName: users.fullName },
      })
      .from(testsAssignments)
      .innerJoin(users, eq(testsAssignments.teacherId, users.id))
      .where(eq(testsAssignments.studentId, authUser.id))
      .orderBy(desc(testsAssignments.createdAt))
      .limit(100);

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Student assignments GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
