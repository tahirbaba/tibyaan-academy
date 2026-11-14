import { createClient } from "@/lib/supabase/server";
import { getStudentEnrollments, getStudentStats, getUpcomingClasses } from "@/lib/db/queries";
import { DashboardClient } from "./dashboard-client";
import { redirect } from "next/navigation";
import { StudentGroupClassesWidget } from "@/components/cohorts/dashboard-widgets";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch real data from DB — gracefully handle if DB call fails
  let enrollmentsData: Awaited<ReturnType<typeof getStudentEnrollments>> = [];
  let stats = { completedLessons: 0, totalLessons: 0, completedHifzEntries: 0 };
  let upcomingClasses: Awaited<ReturnType<typeof getUpcomingClasses>> = [];

  try {
    [enrollmentsData, stats, upcomingClasses] = await Promise.all([
      getStudentEnrollments(user.id),
      getStudentStats(user.id),
      getUpcomingClasses(user.id),
    ]);
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";

  // Transform enrollments for client
  const courseColors = ["bg-emerald-500", "bg-amber-500", "bg-blue-500", "bg-purple-500"];
  const courseColorsBg = ["bg-emerald-500/10", "bg-amber-500/10", "bg-blue-500/10", "bg-purple-500/10"];

  const enrolledCourses = enrollmentsData.map((e, i) => ({
    id: e.enrollment.id,
    name: locale === "ar" ? e.course.nameAr
      : locale === "fr" ? e.course.nameFr
      : locale === "id" ? e.course.nameId
      : locale === "ur" ? e.course.nameUr
      : e.course.nameEn,
    courseType: e.course.courseType,
    status: e.enrollment.status,
    planType: e.enrollment.planType,
    trialEndDate: e.enrollment.trialEndDate?.toISOString() ?? null,
    color: courseColors[i % courseColors.length],
    bgColor: courseColorsBg[i % courseColorsBg.length],
  }));

  const nextClass = upcomingClasses[0] ? {
    classId: upcomingClasses[0].class_.id,
    courseName: locale === "en" ? upcomingClasses[0].course.nameEn : upcomingClasses[0].course.nameUr,
    scheduledAt: upcomingClasses[0].class_.scheduledAt.toISOString(),
    meetingLink: upcomingClasses[0].class_.meetingLink ?? upcomingClasses[0].matchZoomLink ?? null,
  } : null;

  return (
    <>
      <DashboardClient
        userId={user.id}
        userName={userName}
        enrolledCourses={enrolledCourses}
        stats={stats}
        nextClass={nextClass}
        locale={locale}
      />
      <StudentGroupClassesWidget studentId={user.id} locale={locale} />
    </>
  );
}
