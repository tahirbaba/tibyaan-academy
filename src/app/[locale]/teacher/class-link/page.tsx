import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { getClassLinkForTeacher } from "@/lib/db/class-links-queries";
import { karachiToday, formatPktLabel } from "@/lib/pkt";
import { Video, CalendarClock } from "lucide-react";

/** The teacher's own meeting link for today (PKT), with a Join button. */
export default async function TeacherClassLinkPage({
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
  if (!dbUser || (dbUser.role !== "teacher" && dbUser.role !== "admin")) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations("classLinks");
  const today = karachiToday();
  const link = await getClassLinkForTeacher(user.id, today);
  const dayLabel = formatPktLabel(today);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Video className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("classTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("todayIs", { day: dayLabel })}</p>
        </div>
      </div>

      {link ? (
        <div className="rounded-xl border bg-card p-6 space-y-4 text-center">
          <p className="text-sm text-muted-foreground">{t("todaysLink", { day: dayLabel })}</p>
          <a
            href={link.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
          >
            <Video className="w-5 h-5" /> {t("joinClass")}
          </a>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center space-y-2">
          <CalendarClock className="w-10 h-10 text-muted-foreground/50 mx-auto" />
          <p className="text-muted-foreground">{t("notIssuedYet")}</p>
        </div>
      )}
    </div>
  );
}
