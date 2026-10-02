import { NextRequest, NextResponse } from "next/server";
import { setAuthDisabledFlag } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, enrollments, subscriptions, courses, aiChatHistory, teacherProfiles, studentProfiles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();

    const [targetUser] = await db.select().from(users).where(eq(users.id, id));
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Enrollments with course names
    const userEnrollments = await db
      .select({
        id: enrollments.id,
        courseName: courses.nameEn,
        status: enrollments.status,
        planType: enrollments.planType,
        createdAt: enrollments.createdAt,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, id));

    // Subscriptions with course names
    const userSubs = await db
      .select({
        id: subscriptions.id,
        planType: subscriptions.planType,
        status: subscriptions.status,
        amountUsd: subscriptions.amountUsd,
        courseName: courses.nameEn,
      })
      .from(subscriptions)
      .leftJoin(courses, eq(subscriptions.courseId, courses.id))
      .where(eq(subscriptions.studentId, id));

    // Chat sessions (grouped)
    const chatSessions = await db.execute(sql`
      SELECT session_id as "sessionId",
             COUNT(*) as "messageCount",
             MAX(content) as "lastMessage"
      FROM ai_chat_history
      WHERE student_id = ${id}
      GROUP BY session_id
      ORDER BY MAX(created_at) DESC
      LIMIT 10
    `);

    // Teacher profile (if teacher)
    let teacherProfile: { specializations: string[] | null; bio: string | null; yearsExperience: number | null } | null = null;
    if (targetUser.role === "teacher") {
      const [tp] = await db
        .select({
          specializations: teacherProfiles.specializations,
          bio: teacherProfiles.bio,
          yearsExperience: teacherProfiles.yearsExperience,
        })
        .from(teacherProfiles)
        .where(eq(teacherProfiles.userId, id))
        .limit(1);
      teacherProfile = tp ?? null;
    }

    // Student profile (if student) - for parentWhatsapp
    let parentWhatsapp: string | null = null;
    if (targetUser.role === "student") {
      const [sp] = await db
        .select({ parentWhatsapp: studentProfiles.parentWhatsapp })
        .from(studentProfiles)
        .where(eq(studentProfiles.userId, id))
        .limit(1);
      parentWhatsapp = sp?.parentWhatsapp ?? null;
    }

    return NextResponse.json({
      ...targetUser,
      enrollments: userEnrollments,
      subscriptions: userSubs,
      chatSessions: chatSessions.rows,
      teacherProfile,
      parentWhatsapp,
    });
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const updates: Record<string, unknown> = {};
    if (typeof body.role === "string" && ["student", "teacher", "admin"].includes(body.role)) {
      updates.role = body.role;
    }
    if (typeof body.isBanned === "boolean") {
      updates.isBanned = body.isBanned;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    updates.updatedAt = new Date();

    await db.update(users).set(updates).where(eq(users.id, id));

    // Mirror a ban change into the auth metadata so the middleware blocks an
    // already-open session, not only the next login. The DB flag is the source
    // of truth (the login check and email queries read it); this is the edge
    // copy, so a failure to mirror is surfaced but does not fail the ban.
    if (typeof body.isBanned === "boolean") {
      const mirrored = await setAuthDisabledFlag(id, body.isBanned);
      if (!mirrored) {
        return NextResponse.json({
          success: true,
          warning:
            "The account flag was set, but syncing it to the session layer failed — an already-open session may persist until it expires. Check the logs.",
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
