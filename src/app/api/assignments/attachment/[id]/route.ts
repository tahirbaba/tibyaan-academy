import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, testsAssignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPresignedDownloadUrl } from "@/lib/r2/client";
import { ASSIGNMENT_FILES_BUCKET } from "@/app/api/teacher/assignments/upload/route";

/**
 * GET /api/assignments/attachment/[id]
 *
 * Signs a short-lived URL for one assignment's attachment, for the student it
 * was set for or the teacher who set it — nobody else.
 *
 * The bucket is private and the database stores a path rather than a URL, so
 * this check is the only way in: there is no long-lived link that keeps
 * working once someone is no longer party to the assignment.
 */
export async function GET(
  _request: NextRequest,
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
    if (!dbUser) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [item] = await db
      .select()
      .from(testsAssignments)
      .where(eq(testsAssignments.id, id))
      .limit(1);

    if (!item?.attachmentPath) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isParty =
      item.studentId === authUser.id ||
      item.teacherId === authUser.id ||
      dbUser.role === "admin";

    // 404, not 403: a stranger learns nothing about whether the id is real.
    if (!isParty) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const url = await getPresignedDownloadUrl(item.attachmentPath, 300, ASSIGNMENT_FILES_BUCKET);
    return NextResponse.json({ url, expiresInSeconds: 300 });
  } catch (error) {
    console.error("Assignment attachment read error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
