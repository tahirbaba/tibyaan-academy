import { createClient } from "@/lib/supabase/server";
import { sendFailureAlert } from "@/lib/alerts";
import { redirect } from "next/navigation";
import { getTeacherRevenue } from "@/lib/db/teacher-queries";
import { RevenueClient } from "./revenue-client";

export default async function TeacherRevenuePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  let earnings: Array<{
    studentName: string;
    courseName: string;
    planType: string;
    monthlyAmount: number;
  }> = [];

  try {
    const raw = await getTeacherRevenue(user.id);
    const localeKey = `name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof raw[0]["course"];
    earnings = raw.map((r) => ({
      studentName: r.student.fullName,
      courseName: (r.course[localeKey] as string) || r.course.nameEn,
      planType: r.subscription.planType,
      monthlyAmount: parseFloat(r.subscription.amountUsd ?? "0"),
    }));
  } catch (error) {
    // Alert and rethrow — never fall through to earnings = [].
    //
    // This page renders money. A caught error here showed the teacher a
    // confident $0 earned, which is indistinguishable from genuinely having
    // earned nothing, so nobody would ever report it. A teacher quietly
    // believing they are owed nothing is the worst outcome available here.
    await sendFailureAlert({
      source: "/teacher/revenue",
      summary: "The revenue query failed — a teacher would otherwise have been shown $0 earned.",
      error,
      context: { teacherId: user.id },
    });
    throw error;
  }

  return <RevenueClient earnings={earnings} />;
}
