import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, teacherVideos, notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * PATCH /api/videos/[id]/approve
 * Admin approves or rejects a video.
 * Body: { action: "approve" | "reject", adminNotes?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser[0] || dbUser[0].role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { action, adminNotes } = body;

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid action. Use 'approve' or 'reject'" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(teacherVideos)
    .set({
      status: action === "approve" ? "approved" : "rejected",
      isPublic: action === "approve",
      adminNotes: adminNotes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(teacherVideos.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  // Tell the teacher. Four videos were approved or rejected with no
  // notification code here at all, so the teacher was never told a decision
  // had been made. video_approved / video_rejected already exist in the enum.
  // The failure is reported, not swallowed: a notification insert that fails
  // must not roll back the decision that already committed.
  let notified = true;
  try {
    await db.insert(notifications).values({
      userId: updated.teacherId,
      type: action === "approve" ? "video_approved" : "video_rejected",
      titleEn:
        action === "approve" ? "Your video was approved" : "Your video needs changes",
      message:
        action === "approve"
          ? `"${updated.title}" is now visible.`
          : `"${updated.title}" was not approved.${
              updated.adminNotes ? ` Note: ${updated.adminNotes}` : ""
            }`,
      link: "/teacher/videos",
    });
  } catch (error) {
    notified = false;
    console.error("Video decision notification failed:", error);
  }

  return NextResponse.json({ video: updated, notified });
}
