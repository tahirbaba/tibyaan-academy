import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import {
  users,
  scheduleRequests,
  teacherStudentMatches,
  enrollments,
  classes,
  notifications,
} from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

type Db = ReturnType<typeof getDb>;

function getMonthWeekdayDates(
  preferredDays: string[],
  startTime: { start: string; end: string } | null,
  _timezone: string
): Date[] {
  const dayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const targetDays = preferredDays.map((d) => dayMap[d.toLowerCase().slice(0, 3)]).filter((d) => d !== undefined);
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const dates: Date[] = [];
  const hour = startTime ? parseInt(startTime.start.split(":")[0]) : 10;
  const minute = startTime ? parseInt(startTime.start.split(":")[1] ?? "0") : 0;
  for (let d = new Date(now); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
    if (targetDays.includes(d.getDay())) {
      const dt = new Date(d);
      dt.setHours(hour, minute, 0, 0);
      dates.push(new Date(dt));
    }
  }
  return dates;
}

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
    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const status = body.status as string;
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }

    // Fetch full request details
    const rows = await db.execute(sql`
      SELECT
        sr.student_id,
        sr.teacher_id,
        sr.course_id,
        sr.preferred_days,
        sr.preferred_time,
        sr.timezone,
        s.full_name AS student_name,
        t.full_name AS teacher_name,
        c.name_en   AS course_name,
        c.course_type
      FROM schedule_requests sr
      JOIN users s ON sr.student_id = s.id
      JOIN users t ON sr.teacher_id = t.id
      JOIN courses c ON sr.course_id = c.id
      WHERE sr.id = ${id}
      LIMIT 1
    `);

    const existing = (rows.rows as Array<Record<string, unknown>>)[0];
    if (!existing) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const preferredDays = (existing.preferred_days as string[]) ?? [];
    const preferredTime = existing.preferred_time as { start: string; end: string } | null;
    const timezone     = (existing.timezone as string) || "UTC";
    const studentId    = existing.student_id as string;
    const teacherId    = existing.teacher_id as string;
    const courseId     = existing.course_id as string;
    const studentName  = existing.student_name as string;
    const teacherName  = existing.teacher_name as string;
    const courseName   = existing.course_name as string;
    const courseType   = existing.course_type as string;
    const startTime    = preferredTime?.start ?? "09:00";

    const selectedSlot =
      status === "approved" && preferredDays.length > 0
        ? { day: preferredDays[0], time: startTime }
        : null;

    const [updated] = await db
      .update(scheduleRequests)
      .set({ status: status as "approved" | "rejected", updatedAt: new Date() })
      .where(eq(scheduleRequests.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });

    // ── On approval ────────────────────────────────────────────────────────
    if (status === "approved" && preferredDays.length > 0) {
      // 1. Upsert teacher-student match (enables Teacher's "My Students" list)
      const [existingMatch] = await db
        .select({ id: teacherStudentMatches.id })
        .from(teacherStudentMatches)
        .where(
          and(
            eq(teacherStudentMatches.studentId, studentId),
            eq(teacherStudentMatches.teacherId, teacherId),
            eq(teacherStudentMatches.courseId, courseId),
          )
        )
        .limit(1);

      let matchId: string;
      if (existingMatch) {
        matchId = existingMatch.id;
        await db.update(teacherStudentMatches).set({
          status: "active",
          schedule: { days: preferredDays, time: startTime, timezone },
          respondedAt: new Date(),
        }).where(eq(teacherStudentMatches.id, matchId));
      } else {
        const [nm] = await db.insert(teacherStudentMatches).values({
          studentId, teacherId, courseId,
          status: "active",
          schedule: { days: preferredDays, time: startTime, timezone },
          requestedAt: new Date(),
          respondedAt: new Date(),
        }).returning({ id: teacherStudentMatches.id });
        matchId = nm.id;
      }

      // 2. Ensure enrollment exists, create trial if missing
      let enrollmentId: string | null = null;
      const [enrollment] = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)))
        .limit(1);

      if (enrollment) {
        enrollmentId = enrollment.id;
      } else {
        const [newEnr] = await db.insert(enrollments).values({
          studentId, courseId,
          planType: "human_ai",
          status: "trial",
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        }).returning({ id: enrollments.id });
        enrollmentId = newEnr?.id ?? null;
      }

      // 3. Create weekday-only recurring classes for rest of month
      // No Jitsi/WebRTC — Admin will set Zoom link separately per match
      if (enrollmentId) {
        const scheduledDates = getMonthWeekdayDates(preferredDays, preferredTime, timezone);
        if (scheduledDates.length > 0) {
          await db.insert(classes).values(
            scheduledDates.map((scheduledAt) => ({
              enrollmentId: enrollmentId!,
              teacherId,
              scheduledAt,
              durationMinutes: 45,
              status: "scheduled" as const,
              meetingLink: null,
            }))
          );
        }
      }
    }

    // ── Notifications ──────────────────────────────────────────────────────
    const days = preferredDays.join(", ");
    const time = preferredTime ? `${preferredTime.start} – ${preferredTime.end}` : "";

    if (status === "approved") {
      await db.insert(notifications).values([
        {
          userId:  studentId,
          type:    "match_accepted" as const,
          titleEn: "Schedule Request Approved ✓",
          titleUr: "شیڈول درخواست منظور ہو گئی",
          titleAr: "تمت الموافقة على طلب الجدول",
          message: `Your class has been confirmed! Teacher: ${teacherName} | Course: ${courseName} | Days: ${days} | Time: ${time} (${timezone})`,
          link:    "/student/schedule",
        },
        {
          userId:  teacherId,
          // match_accepted, not match_request: the student is already assigned,
          // nothing for the teacher to action. The other path that sends this
          // same "New Student Assigned" used match_accepted, so the two were
          // the same event under two types — one title, one type now.
          type:    "match_accepted" as const,
          titleEn: "New Student Assigned",
          titleUr: "آپ کے پاس ایک نیا طالب علم تفویض ہوا ہے",
          titleAr: "تم تعيين طالب علم جديد إليك",
          message: `Aapke paas ek naya Student assign hua hai: ${studentName} (${courseType}) — Class: ${days} at ${startTime} (${timezone})`,
          link:    "/teacher/students",
        },
      ]);
    } else {
      await db.insert(notifications).values({
        userId:  studentId,
        type:    "match_rejected" as const,
        titleEn: "Schedule Request Rejected",
        titleUr: "شیڈول درخواست مسترد ہو گئی",
        titleAr: "تم رفض طلب الجدول",
        message: "Your schedule request was not approved. Please submit a new request with updated preferences.",
        link:    "/student/schedule",
      });
    }

    if (status === "approved") {
      await handleApproval(db, updated);
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Admin schedule request update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleApproval(db: Db, req: any) {
  const { studentId, teacherId, courseId, preferredDays, preferredTime, selectedSlot, timezone } =
    req as {
      studentId: string;
      teacherId: string;
      courseId: string;
      preferredDays: string[] | null;
      preferredTime: { start: string; end: string } | null;
      selectedSlot: { day: string; time: string } | null;
      timezone: string;
    };

  // 1. Find or create enrollment for student + course
  const [existingEnrollment] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)))
    .limit(1);

  let enrollmentId: string;
  if (existingEnrollment) {
    enrollmentId = existingEnrollment.id;
    if (existingEnrollment.status !== "active") {
      await db
        .update(enrollments)
        .set({ status: "active", subscriptionStartDate: new Date() })
        .where(eq(enrollments.id, existingEnrollment.id));
    }
  } else {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values({
        studentId,
        courseId,
        planType: "human_ai",
        status: "active",
        subscriptionStartDate: new Date(),
      })
      .returning();
    enrollmentId = newEnrollment.id;
  }

  // 2. Create or activate teacher-student match
  const [existingMatch] = await db
    .select()
    .from(teacherStudentMatches)
    .where(
      and(
        eq(teacherStudentMatches.studentId, studentId),
        eq(teacherStudentMatches.teacherId, teacherId),
        eq(teacherStudentMatches.courseId, courseId)
      )
    )
    .limit(1);

  const schedule = {
    days: preferredDays ?? (selectedSlot?.day ? [selectedSlot.day] : []),
    time: selectedSlot?.time ?? preferredTime?.start ?? "10:00",
    timezone,
  };

  if (existingMatch) {
    await db
      .update(teacherStudentMatches)
      .set({ status: "active", respondedAt: new Date(), schedule })
      .where(eq(teacherStudentMatches.id, existingMatch.id));
  } else {
    await db.insert(teacherStudentMatches).values({
      studentId,
      teacherId,
      courseId,
      status: "active",
      respondedAt: new Date(),
      schedule,
    });
  }

  // 3. Generate class dates for current month based on schedule
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const days = schedule.days.map((d) => d.toLowerCase());
  const [hourStr, minuteStr] = schedule.time.split(":");
  const hour = parseInt(hourStr ?? "10", 10);
  const minute = parseInt(minuteStr ?? "0", 10);

  const classDates: Date[] = [];
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= monthEnd && classDates.length < 20) {
    const dayName = cursor.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    if (days.length === 0 || days.includes(dayName)) {
      const classDate = new Date(cursor);
      classDate.setHours(hour, minute, 0, 0);
      if (classDate > now) classDates.push(classDate);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  if (classDates.length > 0) {
    await db.insert(classes).values(
      classDates.map((scheduledAt) => ({
        enrollmentId,
        teacherId,
        scheduledAt,
        durationMinutes: 30,
        status: "scheduled" as const,
      }))
    );
  }

  // 4. Notify teacher
  const [student] = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  const studentName = student?.fullName ?? "A student";
  const scheduleDesc = `${schedule.days.map((d) => d.slice(0, 3)).join(", ")} at ${schedule.time} (${timezone})`;

  await db.insert(notifications).values({
    userId: teacherId,
    type: "match_accepted",
    titleEn: "New Student Assigned",
    titleUr: "نیا طالب علم تفویض کیا گیا",
    message: `${studentName} has been assigned to you. Schedule: ${scheduleDesc}`,
    link: "/teacher/students",
  });
}
