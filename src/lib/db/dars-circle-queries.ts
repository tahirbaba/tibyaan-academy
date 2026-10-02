import { getDb } from ".";
import {
  darsCircles,
  darsCircleEnrollments,
  users,
} from "./schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

/**
 * List circles with teacher info, optionally filter by status/category
 */
export async function getCircles(filter?: {
  status?: "upcoming" | "live" | "completed" | "cancelled";
  category?: "quran" | "hadith" | "fiqh" | "seerah" | "dua";
}) {
  const db = getDb();

  const conditions = [];
  if (filter?.status) {
    conditions.push(eq(darsCircles.status, filter.status));
  }
  if (filter?.category) {
    conditions.push(eq(darsCircles.category, filter.category));
  }

  const query = db
    .select({
      circle: darsCircles,
      teacher: users,
    })
    .from(darsCircles)
    .innerJoin(users, eq(darsCircles.teacherId, users.id));

  if (conditions.length > 0) {
    return query
      .where(and(...conditions))
      .orderBy(desc(darsCircles.scheduledAt));
  }

  return query.orderBy(desc(darsCircles.scheduledAt));
}

/**
 * Get single circle with enrollments count
 */
export async function getCircleById(id: string) {
  const db = getDb();

  const result = await db
    .select({
      circle: darsCircles,
      teacher: users,
    })
    .from(darsCircles)
    .innerJoin(users, eq(darsCircles.teacherId, users.id))
    .where(eq(darsCircles.id, id))
    .limit(1);

  if (!result[0]) return null;

  const enrollmentCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(darsCircleEnrollments)
    .where(eq(darsCircleEnrollments.circleId, id));

  return {
    ...result[0],
    enrollmentCount: enrollmentCount[0]?.count ?? 0,
  };
}

/**
 * Insert new darsCircles row
 */
export async function createCircle(data: {
  teacherId: string;
  titleUr?: string | null;
  titleAr?: string | null;
  titleEn?: string | null;
  titleFr?: string | null;
  titleId?: string | null;
  descriptionUr?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  descriptionId?: string | null;
  category: "quran" | "hadith" | "fiqh" | "seerah" | "dua";
  meetingLink?: string | null;
  scheduledAt: Date;
  maxStudents?: number;
}) {
  const db = getDb();

  const [circle] = await db
    .insert(darsCircles)
    .values({
      teacherId: data.teacherId,
      titleUr: data.titleUr,
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      titleFr: data.titleFr,
      titleId: data.titleId,
      descriptionUr: data.descriptionUr,
      descriptionAr: data.descriptionAr,
      descriptionEn: data.descriptionEn,
      descriptionFr: data.descriptionFr,
      descriptionId: data.descriptionId,
      category: data.category,
      meetingLink: data.meetingLink,
      scheduledAt: data.scheduledAt,
      maxStudents: data.maxStudents ?? 30,
    })
    .returning();

  return circle;
}

/**
 * Patch circle fields
 */
export async function updateCircle(
  id: string,
  data: Partial<{
    titleUr: string | null;
    titleAr: string | null;
    titleEn: string | null;
    titleFr: string | null;
    titleId: string | null;
    descriptionUr: string | null;
    descriptionAr: string | null;
    descriptionEn: string | null;
    descriptionFr: string | null;
    descriptionId: string | null;
    category: "quran" | "hadith" | "fiqh" | "seerah" | "dua";
    meetingLink: string | null;
    scheduledAt: Date;
    maxStudents: number;
    status: "upcoming" | "live" | "completed" | "cancelled";
  }>
) {
  const db = getDb();

  const [updated] = await db
    .update(darsCircles)
    .set(data)
    .where(eq(darsCircles.id, id))
    .returning();

  return updated;
}

/**
 * Insert darsCircleEnrollments, increment currentStudents
 */
export async function joinCircle(circleId: string, studentId: string) {
  const db = getDb();

  // Check if already enrolled
  const existing = await db
    .select()
    .from(darsCircleEnrollments)
    .where(
      and(
        eq(darsCircleEnrollments.circleId, circleId),
        eq(darsCircleEnrollments.studentId, studentId)
      )
    )
    .limit(1);

  if (existing[0]) {
    return { error: "already_joined" as const };
  }

  // Check circle capacity
  const circle = await db
    .select()
    .from(darsCircles)
    .where(eq(darsCircles.id, circleId))
    .limit(1);

  if (!circle[0]) {
    return { error: "not_found" as const };
  }

  if (circle[0].currentStudents >= circle[0].maxStudents) {
    return { error: "circle_full" as const };
  }

  // Insert enrollment
  const [enrollment] = await db
    .insert(darsCircleEnrollments)
    .values({ circleId, studentId })
    .returning();

  // Increment currentStudents
  await db
    .update(darsCircles)
    .set({
      currentStudents: sql`${darsCircles.currentStudents} + 1`,
    })
    .where(eq(darsCircles.id, circleId));

  return { enrollment };
}

/**
 * Delete enrollment, decrement currentStudents
 */
export async function leaveCircle(circleId: string, studentId: string) {
  const db = getDb();

  const existing = await db
    .select()
    .from(darsCircleEnrollments)
    .where(
      and(
        eq(darsCircleEnrollments.circleId, circleId),
        eq(darsCircleEnrollments.studentId, studentId)
      )
    )
    .limit(1);

  if (!existing[0]) {
    return { error: "not_enrolled" as const };
  }

  await db
    .delete(darsCircleEnrollments)
    .where(
      and(
        eq(darsCircleEnrollments.circleId, circleId),
        eq(darsCircleEnrollments.studentId, studentId)
      )
    );

  // Decrement currentStudents (but not below 0)
  await db
    .update(darsCircles)
    .set({
      currentStudents: sql`greatest(${darsCircles.currentStudents} - 1, 0)`,
    })
    .where(eq(darsCircles.id, circleId));

  return { success: true };
}

/**
 * Get circles a student has joined
 */
export async function getStudentCircles(studentId: string) {
  const db = getDb();

  return db
    .select({
      circle: darsCircles,
      teacher: users,
      enrollment: darsCircleEnrollments,
    })
    .from(darsCircleEnrollments)
    .innerJoin(darsCircles, eq(darsCircleEnrollments.circleId, darsCircles.id))
    .innerJoin(users, eq(darsCircles.teacherId, users.id))
    .where(eq(darsCircleEnrollments.studentId, studentId))
    .orderBy(desc(darsCircles.scheduledAt));
}

/**
 * Get circles created by teacher
 */
export async function getTeacherCircles(teacherId: string) {
  const db = getDb();

  return db
    .select({
      circle: darsCircles,
      enrollmentCount: sql<number>`(
        select count(*)::int from dars_circle_enrollments
        where dars_circle_enrollments.circle_id = ${darsCircles.id}
      )`,
    })
    .from(darsCircles)
    .where(eq(darsCircles.teacherId, teacherId))
    .orderBy(desc(darsCircles.scheduledAt));
}

/**
 * Get enrolled students for a circle (with email + name)
 */
export async function getCircleEnrolledStudents(circleId: string) {
  const db = getDb();

  return db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
    })
    .from(darsCircleEnrollments)
    .innerJoin(users, eq(darsCircleEnrollments.studentId, users.id))
    .where(and(eq(darsCircleEnrollments.circleId, circleId), eq(users.isBanned, false)));
}

/**
 * Get circles scheduled within next hour that are 'upcoming'
 */
export async function getUpcomingReminders() {
  const db = getDb();

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  return db
    .select({
      circle: darsCircles,
      teacher: users,
    })
    .from(darsCircles)
    .innerJoin(users, eq(darsCircles.teacherId, users.id))
    .where(
      and(
        eq(darsCircles.status, "upcoming"),
        gte(darsCircles.scheduledAt, now),
        lte(darsCircles.scheduledAt, oneHourLater)
      )
    )
    .orderBy(darsCircles.scheduledAt);
}
