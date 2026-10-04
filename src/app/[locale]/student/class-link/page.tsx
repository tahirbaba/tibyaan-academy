import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getClassLinksForStudent } from "@/lib/db/class-links-queries";
import { karachiToday, formatPktLabel } from "@/lib/pkt";
import { Video, CalendarClock } from "lucide-react";

/**
 * The student's class link(s) for today (PKT) — one per teacher they are
 * actively matched with. A student only ever sees their own teacher's link.
 */
export default async function StudentClassLinkPage({
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

  const t = await getTranslations("classLinks");
  const today = karachiToday();
  const dayLabel = formatPktLabel(today);
  const links = await getClassLinksForStudent(user.id, today);

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

      {links.length > 0 ? (
        <div className="space-y-3">
          {links.map((l) => (
            <div
              key={l.teacherId}
              className="rounded-xl border bg-card p-5 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-foreground">{l.teacherName}</p>
                <p className="text-xs text-muted-foreground">
                  {t("todaysLink", { day: dayLabel })}
                </p>
              </div>
              <a
                href={l.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shrink-0"
              >
                <Video className="w-4 h-4" /> {t("joinClass")}
              </a>
            </div>
          ))}
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
