import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { classLinks, users, teacherStudentMatches } from "@/lib/db/schema";

export interface ClassLinkRow {
  teacherId: string;
  teacherName: string;
  meetingUrl: string;
  validOn: string;
}

/** Every active (non-banned) teacher, for the admin's issue screen. */
export async function listActiveTeachers(): Promise<
  { id: string; fullName: string; email: string }[]
> {
  const db = getDb();
  const rows = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email })
    .from(users)
    .where(and(eq(users.role, "teacher"), eq(users.isBanned, false)));
  return rows.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

/** All links for the given PKT days (admin screen shows today + yesterday). */
export async function getClassLinksForDates(
  dates: string[]
): Promise<{ teacherId: string; meetingUrl: string; validOn: string }[]> {
  if (dates.length === 0) return [];
  const db = getDb();
  return db
    .select({
      teacherId: classLinks.teacherId,
      meetingUrl: classLinks.meetingUrl,
      validOn: classLinks.validOn,
    })
    .from(classLinks)
    .where(inArray(classLinks.validOn, dates));
}

/** One teacher's own link for a day (the teacher dashboard view). */
export async function getClassLinkForTeacher(
  teacherId: string,
  validOn: string
): Promise<{ meetingUrl: string } | null> {
  const db = getDb();
  const [row] = await db
    .select({ meetingUrl: classLinks.meetingUrl })
    .from(classLinks)
    .where(and(eq(classLinks.teacherId, teacherId), eq(classLinks.validOn, validOn)))
    .limit(1);
  return row ?? null;
}

/** The teacher ids a student is actively matched with. */
export async function getTeacherIdsForStudent(studentId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ teacherId: teacherStudentMatches.teacherId })
    .from(teacherStudentMatches)
    .where(
      and(
        eq(teacherStudentMatches.studentId, studentId),
        inArray(teacherStudentMatches.status, ["accepted", "active"])
      )
    );
  // De-duplicate: a student may match the same teacher on more than one course.
  return [...new Set(rows.map((r) => r.teacherId))];
}

/** A student's teachers' links for a day, with the teacher's name to show. */
export async function getClassLinksForStudent(
  studentId: string,
  validOn: string
): Promise<ClassLinkRow[]> {
  const teacherIds = await getTeacherIdsForStudent(studentId);
  if (teacherIds.length === 0) return [];
  const db = getDb();
  const rows = await db
    .select({
      teacherId: classLinks.teacherId,
      teacherName: users.fullName,
      meetingUrl: classLinks.meetingUrl,
      validOn: classLinks.validOn,
    })
    .from(classLinks)
    .innerJoin(users, eq(users.id, classLinks.teacherId))
    .where(and(inArray(classLinks.teacherId, teacherIds), eq(classLinks.validOn, validOn)));
  return rows;
}

/**
 * Issue or replace a teacher's link for a day. The (teacher_id, valid_on)
 * unique constraint makes this a safe upsert — a second save for the same day
 * updates the one row rather than creating a duplicate.
 */
export async function upsertClassLink(opts: {
  teacherId: string;
  meetingUrl: string;
  validOn: string;
  createdBy: string;
}): Promise<void> {
  const db = getDb();
  await db
    .insert(classLinks)
    .values({
      teacherId: opts.teacherId,
      meetingUrl: opts.meetingUrl,
      validOn: opts.validOn,
      createdBy: opts.createdBy,
    })
    .onConflictDoUpdate({
      target: [classLinks.teacherId, classLinks.validOn],
      set: {
        meetingUrl: opts.meetingUrl,
        createdBy: opts.createdBy,
        updatedAt: new Date(),
      },
    });
}
