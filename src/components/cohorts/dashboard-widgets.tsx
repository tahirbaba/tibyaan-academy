import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  canSeeMeetingLink,
  listStudentCohorts,
  listTeacherCohorts,
  scheduleOf,
} from "@/lib/cohorts/queries";
import { cohortsIfMigrated } from "@/lib/cohorts/migration-guard";
import { cohortTitle } from "@/lib/cohorts/localize";
import { hasEnded, nextSession } from "@/lib/cohorts/schedule";
import { LocalDateTime } from "./local-time";
import { Button } from "@/components/ui/button";
import { Users2, Video } from "lucide-react";

function WidgetShell({
  title,
  href,
  linkText,
  children,
}: {
  title: string;
  href: "/student/group-classes" | "/teacher/group-classes";
  linkText: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Users2 className="h-5 w-5 text-primary" aria-hidden />
          {title}
        </h2>
        <Link href={href} className="text-sm font-medium text-primary hover:underline">
          {linkText}
        </Link>
      </div>
      <ul className="mt-4 divide-y">{children}</ul>
    </section>
  );
}

function JoinButton({ link, label }: { link: string; label: string }) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      <Button size="sm" className="gap-2">
        <Video className="h-4 w-4" aria-hidden />
        {label}
      </Button>
    </a>
  );
}

/** Student dashboard: my group classes, next class time and meeting link. */
export async function StudentGroupClassesWidget({
  studentId,
  locale,
}: {
  studentId: string;
  locale: string;
}) {
  const rows = await cohortsIfMigrated("/student/dashboard (group classes)", () =>
    listStudentCohorts(studentId)
  );
  if (rows === null) return null;

  const now = new Date();
  const live = rows.filter(
    (r) => canSeeMeetingLink(r, now) && !hasEnded(scheduleOf(r), now)
  );
  // A student with no group classes sees no widget; that is a true statement.
  if (live.length === 0) return null;

  const t = await getTranslations("cohorts");
  return (
    <WidgetShell title={t("myTitle")} href="/student/group-classes" linkText={t("viewAll")}>
      {live.map((row) => {
        const next =
          row.status === "trial" && row.trialClassAt
            ? row.trialClassAt
            : nextSession(scheduleOf(row), now);
        return (
          <li key={row.enrollmentId} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium text-foreground">{cohortTitle(row, locale)}</p>
              <p className="text-sm text-muted-foreground">
                {row.status === "trial" ? t("yourTrialClass") : t("nextClass")}{" "}
                {next ? <LocalDateTime iso={next.toISOString()} /> : "—"}
              </p>
            </div>
            {row.meetingLink ? (
              <JoinButton link={row.meetingLink} label={t("joinClass")} />
            ) : (
              <span className="text-sm text-muted-foreground">{t("linkNotSet")}</span>
            )}
          </li>
        );
      })}
    </WidgetShell>
  );
}

/** Teacher dashboard: my cohorts, next class time, seats filled. */
export async function TeacherGroupClassesWidget({
  teacherId,
  locale,
}: {
  teacherId: string;
  locale: string;
}) {
  const rows = await cohortsIfMigrated("/teacher/dashboard (group classes)", () =>
    listTeacherCohorts(teacherId)
  );
  if (rows === null) return null;

  const now = new Date();
  const running = rows.filter((c) => !hasEnded(scheduleOf(c), now));
  if (running.length === 0) return null;

  const t = await getTranslations("cohorts");
  return (
    <WidgetShell title={t("teacherTitle")} href="/teacher/group-classes" linkText={t("viewRoster")}>
      {running.map((cohort) => {
        const next = nextSession(scheduleOf(cohort), now);
        return (
          <li key={cohort.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium text-foreground">{cohortTitle(cohort, locale)}</p>
              <p className="text-sm text-muted-foreground">
                {t("nextClass")} {next ? <LocalDateTime iso={next.toISOString()} /> : "—"} ·{" "}
                {t("seatsFilled", { taken: cohort.seatsTaken, total: cohort.maxSeats })}
              </p>
            </div>
            {cohort.meetingLink ? (
              <JoinButton link={cohort.meetingLink} label={t("startClass")} />
            ) : (
              <span className="text-sm text-amber-700 dark:text-amber-300">{t("linkNotSet")}</span>
            )}
          </li>
        );
      })}
    </WidgetShell>
  );
}
