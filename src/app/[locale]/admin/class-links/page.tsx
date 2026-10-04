import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  listActiveTeachers,
  getClassLinksForDates,
} from "@/lib/db/class-links-queries";
import { karachiToday, shiftDate, formatPktLabel } from "@/lib/pkt";
import { ClassLinksClient } from "./class-links-client";

/**
 * Admin issues one meeting link per teacher per day. Today's links are
 * editable; yesterday's are shown read-only for reference. The day is PKT.
 */
export default async function AdminClassLinksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const db = getDb();
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!dbUser || dbUser.role !== "admin") redirect(`/${locale}`);

  const today = karachiToday();
  const yesterday = shiftDate(today, -1);

  // Not swallowed: a failure here should error the page, not render an empty one.
  const [teachers, links] = await Promise.all([
    listActiveTeachers(),
    getClassLinksForDates([today, yesterday]),
  ]);

  const todayByTeacher: Record<string, string> = {};
  const yesterdayByTeacher: Record<string, string> = {};
  for (const l of links) {
    if (l.validOn === today) todayByTeacher[l.teacherId] = l.meetingUrl;
    else if (l.validOn === yesterday) yesterdayByTeacher[l.teacherId] = l.meetingUrl;
  }

  return (
    <ClassLinksClient
      teachers={teachers}
      todayByTeacher={todayByTeacher}
      yesterdayByTeacher={yesterdayByTeacher}
      todayLabel={formatPktLabel(today)}
      yesterdayLabel={formatPktLabel(yesterday)}
    />
  );
}
