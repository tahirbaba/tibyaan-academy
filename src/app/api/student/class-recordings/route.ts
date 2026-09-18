import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, adminClassRecordings, classRecordings } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Every recording a student can watch, from both sources, newest first.
 *
 * There are two independent pipelines, and until now a student could only reach
 * one of them:
 *
 *   class_recordings        teacher uploads a file; stored in Supabase Storage;
 *                           expires after 30 days and is removed by the
 *                           recordings cleanup cron. Was rendered only by
 *                           /student/recordings, which nothing ever linked to —
 *                           so teacher uploads were invisible to students.
 *   admin_class_recordings  an admin pastes a link (YouTube, Drive, mp4). No
 *                           file, no expiry. This is the one students could see.
 *
 * Both are kept: the upload pipeline is the real one, the link list is the
 * manual fallback. They are merged here rather than in the page so the shape is
 * defined in one place.
 */

export type StudentRecordingSource = "teacher_upload" | "admin_link";

export interface StudentRecording {
  id: string;
  source: StudentRecordingSource;
  title: string;
  recordingUrl: string;
  /** ISO date — session date for uploads, class date for admin links. */
  date: string;
  teacherName: string | null;
  durationMinutes: number | null;
  /** Only teacher uploads expire. null means it stays available. */
  expiresAt: string | null;
  notes: string | null;
}

export async function GET() {
  try {
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

    const [adminRows, uploadRows] = await Promise.all([
      db
        .select({ recording: adminClassRecordings })
        .from(adminClassRecordings)
        .where(eq(adminClassRecordings.studentId, authUser.id))
        .orderBy(desc(adminClassRecordings.classDate))
        .limit(100),
      db
        .select({ recording: classRecordings, teacher: users })
        .from(classRecordings)
        .innerJoin(users, eq(classRecordings.teacherId, users.id))
        .where(
          and(
            eq(classRecordings.studentId, authUser.id),
            eq(classRecordings.isDeletedBySystem, false)
          )
        )
        .orderBy(desc(classRecordings.sessionDate))
        .limit(100),
    ]);

    const fromAdmin: StudentRecording[] = adminRows.map(({ recording: r }) => ({
      id: r.id,
      source: "admin_link",
      title: r.title,
      recordingUrl: r.recordingUrl,
      date: r.classDate.toISOString(),
      teacherName: null,
      durationMinutes: null,
      expiresAt: null,
      notes: r.notes,
    }));

    const fromUpload: StudentRecording[] = uploadRows.map(({ recording: r, teacher }) => ({
      id: r.id,
      source: "teacher_upload",
      // These rows carry no title; name them after the teacher and the session.
      title: teacher.fullName ? `Class with ${teacher.fullName}` : "Class recording",
      recordingUrl: r.recordingUrl,
      date: r.sessionDate.toISOString(),
      teacherName: teacher.fullName ?? null,
      // stored in seconds
      durationMinutes: r.duration ? Math.max(1, Math.round(r.duration / 60)) : null,
      expiresAt: r.expiresAt.toISOString(),
      notes: null,
    }));

    const recordings = [...fromAdmin, ...fromUpload].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ recordings });
  } catch (error) {
    console.error("Student class-recordings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
