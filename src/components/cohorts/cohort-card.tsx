import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CalendarDays, Clock, Users, UserRound } from "lucide-react";
import { cohortTitle, formatFee } from "@/lib/cohorts/localize";
import { scheduleOf, type CohortRow } from "@/lib/cohorts/queries";
import { hasEnded, weeklySlots } from "@/lib/cohorts/schedule";
import { LocalDate, WeeklySchedule } from "./local-time";

/** One cohort on the Group Classes listing. */
export async function CohortCard({
  cohort,
  locale,
}: {
  cohort: CohortRow;
  locale: string;
}) {
  const t = await getTranslations("cohorts");
  const schedule = scheduleOf(cohort);
  const seatsLeft = Math.max(0, cohort.maxSeats - cohort.seatsTaken);
  const ended = hasEnded(schedule);
  const slots = weeklySlots(schedule).map((d) => d.toISOString());

  const badge = ended
    ? { text: t("badgeEnded"), tone: "bg-muted text-muted-foreground" }
    : !cohort.enrollmentOpen
      ? { text: t("badgeClosed"), tone: "bg-muted text-muted-foreground" }
      : seatsLeft === 0
        ? { text: t("badgeFull"), tone: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200" }
        : { text: t("seatsLeft", { count: seatsLeft }), tone: "bg-primary/10 text-primary" };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" aria-hidden />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-semibold leading-snug text-foreground">
            <Link
              href={`/group-classes/${cohort.slug}`}
              className="after:absolute after:inset-0"
            >
              {cohortTitle(cohort, locale)}
            </Link>
          </h2>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badge.tone}`}>
            {badge.text}
          </span>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex gap-3">
            <dt className="sr-only">{t("schedule")}</dt>
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <dd>
              <WeeklySchedule slots={slots} />
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="sr-only">{t("starts")}</dt>
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <dd className="text-muted-foreground">
              {t("starts")} <LocalDate date={cohort.startDate} /> ·{" "}
              {t("weeks", { count: cohort.durationWeeks })}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="sr-only">{t("teacher")}</dt>
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <dd className="text-muted-foreground">{cohort.teacherName}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="sr-only">{t("classSize")}</dt>
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <dd className="text-muted-foreground">
              {t("upToStudents", { count: cohort.maxSeats })}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
          <p>
            <span className="font-display text-3xl font-semibold text-primary tabular-nums">
              {formatFee(cohort.monthlyFee, cohort.currency, locale)}
            </span>
            <span className="ms-1 text-sm text-muted-foreground">{t("perMonth")}</span>
          </p>
          <span className="text-sm font-semibold text-accent transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
            {t("viewDetails")} <span aria-hidden className="rtl:hidden">→</span>
            <span aria-hidden className="hidden rtl:inline">←</span>
          </span>
        </div>
      </div>
    </article>
  );
}
