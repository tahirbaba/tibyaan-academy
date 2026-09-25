import { createClient } from "@/lib/supabase/server";
import { sendFailureAlert } from "@/lib/alerts";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { StudentProgressClient } from "./student-progress-client";

export default async function StudentProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const db = getDb();
  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  if (!dbUser || dbUser.role !== "student") redirect(`/${locale}/login`);

  let entries: Array<{
    id: string;
    teacherName: string;
    lessonCovered: string;
    rating: string;
    notes: string | null;
    sessionDate: string;
  }> = [];

  try {
    const rows = await db.execute(sql`
      SELECT
        pe.id,
        pe.lesson_covered,
        pe.rating,
        pe.notes,
        pe.session_date,
        t.full_name AS teacher_name
      FROM progress_entries pe
      JOIN users t ON pe.teacher_id = t.id
      WHERE pe.student_id = ${user.id}
      ORDER BY pe.session_date DESC
      LIMIT 200
    `);
    entries = (rows.rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      teacherName: r.teacher_name as string,
      lessonCovered: r.lesson_covered as string,
      rating: r.rating as string,
      notes: (r.notes as string | null) ?? null,
      sessionDate: new Date(r.session_date as string).toISOString(),
    }));
  } catch (error) {
    // Alert and rethrow — never fall through to entries = [].
    //
    // An empty progress page tells a student, and the parent reading over
    // their shoulder, that no work has been recorded. If the query simply
    // failed, that is a lie that looks like a fact: their teacher HAS been
    // recording sessions. Fail visibly instead.
    await sendFailureAlert({
      source: "/student/progress",
      summary: "The progress query failed — a student would otherwise have been shown no progress at all.",
      error,
      context: { studentId: user.id },
    });
    throw error;
  }

  return <StudentProgressClient entries={entries} />;
}
