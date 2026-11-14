import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendFailureAlert } from "@/lib/alerts";
import {
  canSeeMeetingLink,
  listStudentCohorts,
  scheduleOf,
} from "@/lib/cohorts/queries";
import { cohortTitle, formatFee } from "@/lib/cohorts/localize";
import { hasEnded, nextSession, weeklySlots } from "@/lib/cohorts/schedule";
import {
  LocalDate,
  LocalDateTime,
  WeeklySchedule,
} from "@/components/cohorts/local-time";
import { CohortSubscriptionButton } from "@/components/cohorts/subscription-button";
import { Button } from "@/components/ui/button";
import { CalendarClock, Users2, Video } from "lucide-react";

export default async function StudentGroupClassesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ enrolled?: string }>;
}) {
  const { locale } = await params;
  const { enrolled } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const t = await getTranslations("cohorts");

  // Alert and rethrow — never fall through to an empty list. A paying student
  // shown "you have no group classes" would believe it and miss the class.
  let rows: Awaited<ReturnType<typeof listStudentCohorts>>;
  try {
    rows = await listStudentCohorts(user.id);
  } catch (error) {
    await sendFailureAlert({
      source: "/student/group-classes",
      summary:
        "A student's group class list failed to load — they see an error, not an empty list.",
      error,
      context: { studentId: user.id },
    });
    throw error;
  }

  const now = new Date();
  const visible = rows.filter((r) => r.status !== "cancelled" || r.trialClassAt);
  const justPaid = enrolled ? rows.find((r) => r.slug === enrolled) : undefined;

  const statusLabel: Record<string, string> = {
    active: t("statusActive"),
    past_due: t("statusPastDue"),
    trial: t("statusTrial"),
    pending: t("statusPending"),
    waitlisted: t("statusWaitlisted"),
    cancelled: t("statusCancelled"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users2 className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("myTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("mySubtitle")}</p>
        </div>
      </div>

      {justPaid && (
        <p
          role="status"
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground"
        >
          {justPaid.status === "active"
            ? t("paymentConfirmed")
            : t("paymentProcessing")}
        </p>
      )}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">{t("myNone")}</p>
          <Link href="/group-classes" className="mt-4 inline-block">
            <Button>{t("browse")}</Button>
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {visible.map((row) => {
            const schedule = scheduleOf(row);
            const ended = hasEnded(schedule, now);
            const next = nextSession(schedule, now);
            const linkVisible = canSeeMeetingLink(row, now) && !ended;
            const trialOver = row.status === "trial" && !canSeeMeetingLink(row, now);
            const pendingLive =
              row.status === "pending" &&
              !!row.seatHeldUntil &&
              row.seatHeldUntil.getTime() > now.getTime();
            const paying = row.status === "active" || row.status === "past_due";

            return (
              <li key={row.enrollmentId} className="rounded-xl border bg-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    <Link href={`/group-classes/${row.slug}`} className="hover:text-primary">
                      {cohortTitle(row, locale)}
                    </Link>
                  </h2>
                  <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {ended
                      ? t("badgeEnded")
                      : trialOver
                        ? t("statusTrialOver")
                        : (statusLabel[row.status] ?? row.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("withTeacher", { name: row.teacherName })}
                </p>

                <div className="mt-4 text-sm">
                  <WeeklySchedule slots={weeklySlots(schedule).map((d) => d.toISOString())} />
                </div>

                {!ended && (paying || row.status === "trial") && !trialOver && (
                  <div className="mt-4 flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                    <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        {row.status === "trial" ? t("yourTrialClass") : t("nextClass")}
                      </p>
                      <p className="font-semibold text-foreground">
                        {row.status === "trial" && row.trialClassAt ? (
                          <LocalDateTime iso={row.trialClassAt.toISOString()} />
                        ) : next ? (
                          <LocalDateTime iso={next.toISOString()} />
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {linkVisible &&
                  (row.meetingLink ? (
                    <a
                      href={row.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex"
                    >
                      <Button className="gap-2">
                        <Video className="h-4 w-4" aria-hidden />
                        {t("joinClass")}
                      </Button>
                    </a>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">{t("linkNotSet")}</p>
                  ))}

                {row.status === "past_due" && (
                  <p role="alert" className="mt-4 text-sm font-medium text-amber-700 dark:text-amber-300">
                    {t("pastDueNote")}
                  </p>
                )}

                {paying && !ended && (
                  <div className="mt-4 border-t pt-4 text-sm">
                    <p className="text-muted-foreground">
                      {row.paidFee && row.paidCurrency
                        ? `${formatFee(row.paidFee, row.paidCurrency, locale)}${t("perMonth")}`
                        : null}
                      {row.currentPeriodEnd && (
                        <>
                          {" · "}
                          {row.cancelAtPeriodEnd ? t("endsOn") : t("renewsOn")}{" "}
                          <LocalDate date={row.currentPeriodEnd.toISOString().slice(0, 10)} />
                        </>
                      )}
                    </p>
                    <div className="mt-2">
                      <CohortSubscriptionButton
                        cohortId={row.id}
                        cancelAtPeriodEnd={row.cancelAtPeriodEnd}
                      />
                    </div>
                  </div>
                )}

                {!ended && (trialOver || row.status === "cancelled" || row.status === "waitlisted" || row.status === "pending") && (
                  <div className="mt-4 border-t pt-4 text-sm">
                    <p className="text-muted-foreground">
                      {trialOver
                        ? t("trialOverNote")
                        : row.status === "waitlisted"
                          ? t("waitlistNote")
                          : pendingLive
                            ? t("pendingNote")
                            : t("notEnrolledNote")}
                    </p>
                    <Link href={`/group-classes/${row.slug}`} className="mt-2 inline-block">
                      <Button variant="outline" size="sm">
                        {t("viewDetails")}
                      </Button>
                    </Link>
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
