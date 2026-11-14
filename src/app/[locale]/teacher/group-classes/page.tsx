import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { sendFailureAlert } from "@/lib/alerts";
import {
  getRosters,
  listTeacherCohorts,
  scheduleOf,
} from "@/lib/cohorts/queries";
import { cohortTitle, formatFee } from "@/lib/cohorts/localize";
import { hasEnded, nextSession, weeklySlots } from "@/lib/cohorts/schedule";
import { LocalDateTime, WeeklySchedule } from "@/components/cohorts/local-time";
import { Button } from "@/components/ui/button";
import { Users2, Video } from "lucide-react";

export default async function TeacherGroupClassesPage({
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

  const t = await getTranslations("cohorts");

  // Alert and rethrow: "no cohorts" and "the query failed" must never look
  // the same to a teacher who has a class to teach tonight.
  let cohorts: Awaited<ReturnType<typeof listTeacherCohorts>>;
  let roster: Awaited<ReturnType<typeof getRosters>>;
  try {
    // Only this teacher's own cohorts — and so only their own rosters.
    cohorts = await listTeacherCohorts(user.id);
    roster = await getRosters(cohorts.map((c) => c.id));
  } catch (error) {
    await sendFailureAlert({
      source: "/teacher/group-classes",
      summary: "A teacher's cohort list failed to load.",
      error,
      context: { teacherId: user.id },
    });
    throw error;
  }

  const now = new Date();
  const statusLabel: Record<string, string> = {
    active: t("statusActive"),
    past_due: t("statusPastDue"),
    trial: t("statusTrial"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users2 className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("teacherTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("teacherSubtitle")}</p>
        </div>
      </div>

      {cohorts.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          {t("teacherNone")}
        </p>
      ) : (
        <ul className="space-y-6">
          {cohorts.map((cohort) => {
            const schedule = scheduleOf(cohort);
            const next = nextSession(schedule, now);
            // In class = paying, or on a trial whose class has not ended yet.
            const students = roster.filter(
              (r) =>
                r.cohortId === cohort.id &&
                (r.status === "active" ||
                  r.status === "past_due" ||
                  (r.status === "trial" &&
                    !!r.seatHeldUntil &&
                    r.seatHeldUntil.getTime() > now.getTime()))
            );

            return (
              <li key={cohort.id} className="rounded-xl border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {cohortTitle(cohort, locale)}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatFee(cohort.monthlyFee, cohort.currency, locale)}
                      {t("perMonth")} ·{" "}
                      {t("seatsFilled", { taken: cohort.seatsTaken, total: cohort.maxSeats })}
                      {cohort.waitlistCount > 0 &&
                        ` · ${t("waitlistCount", { count: cohort.waitlistCount })}`}
                      {!cohort.isPublished && ` · ${t("notPublished")}`}
                    </p>
                  </div>
                  {cohort.meetingLink ? (
                    <a href={cohort.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Button className="gap-2">
                        <Video className="h-4 w-4" aria-hidden />
                        {t("startClass")}
                      </Button>
                    </a>
                  ) : (
                    <span className="text-sm text-amber-700 dark:text-amber-300">
                      {t("linkNotSet")}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <WeeklySchedule slots={weeklySlots(schedule).map((d) => d.toISOString())} />
                  <p>
                    <span className="text-muted-foreground">{t("nextClass")} </span>
                    <strong className="text-foreground">
                      {hasEnded(schedule, now) || !next ? (
                        t("badgeEnded")
                      ) : (
                        <LocalDateTime iso={next.toISOString()} />
                      )}
                    </strong>
                  </p>
                </div>

                <h3 className="mt-6 text-sm font-semibold text-foreground">
                  {t("roster")} ({students.length})
                </h3>
                {students.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">{t("rosterEmpty")}</p>
                ) : (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-start text-xs uppercase text-muted-foreground">
                          <th className="py-2 pe-4 text-start font-medium">{t("colStudent")}</th>
                          <th className="py-2 pe-4 text-start font-medium">{t("colStatus")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s) => (
                          <tr key={s.id} className="border-b last:border-0">
                            <td className="py-2 pe-4 font-medium text-foreground">{s.studentName}</td>
                            <td className="py-2 pe-4 text-muted-foreground">
                              {statusLabel[s.status] ?? s.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
