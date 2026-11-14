import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { EnrollPanel } from "@/components/cohorts/enroll-panel";
import {
  LocalDate,
  LocalDateTime,
  WeeklySchedule,
} from "@/components/cohorts/local-time";
import {
  getPublishedCohortBySlug,
  getStudentEnrollment,
  scheduleOf,
  waitlistPosition,
} from "@/lib/cohorts/queries";
import {
  cohortDescription,
  cohortTitle,
  formatFee,
} from "@/lib/cohorts/localize";
import { hasEnded, nextSession, weeklySlots } from "@/lib/cohorts/schedule";
import { createClient } from "@/lib/supabase/server";
import { sendFailureAlert } from "@/lib/alerts";
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  localeMetadataAlternates,
} from "@/lib/site-config";
import { CalendarDays, Clock, Timer, UserRound, Users } from "lucide-react";

type Params = Promise<{ locale: string; slug: string }>;

async function loadCohort(slug: string) {
  try {
    return await getPublishedCohortBySlug(slug);
  } catch (error) {
    // Rethrow: a failed query must be a 500, not a 404 that tells Google the
    // class was deleted.
    await sendFailureAlert({
      source: "/group-classes/[slug]",
      summary: "A group class page failed to load.",
      error,
      context: { slug },
    });
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const cohort = await loadCohort(slug);
  if (!cohort) return { title: "Not Found", robots: { index: false } };

  const title = cohortTitle(cohort, locale);
  const description =
    cohortDescription(cohort, locale)?.slice(0, 160) ??
    `${title} — ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: localeMetadataAlternates(locale, `/group-classes/${slug}`),
    openGraph: {
      title,
      description,
      url: absoluteUrl(locale, `/group-classes/${slug}`),
    },
  };
}

export default async function CohortDetailPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const cohort = await loadCohort(slug);
  if (!cohort) notFound();

  const t = await getTranslations("cohorts");
  const schedule = scheduleOf(cohort);
  const now = new Date();
  const ended = hasEnded(schedule, now);
  const next = nextSession(schedule, now);
  const seatsLeft = Math.max(0, cohort.maxSeats - cohort.seatsTaken);
  const title = cohortTitle(cohort, locale);
  const description = cohortDescription(cohort, locale);
  const fee = formatFee(cohort.monthlyFee, cohort.currency, locale);

  // The visitor's own state. Not signed in is a normal state; a failing
  // enrollment lookup for a signed-in visitor is not, and surfaces.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const enrollment = user ? await getStudentEnrollment(cohort.id, user.id) : null;
  const seatLive =
    !!enrollment &&
    (enrollment.status === "active" ||
      enrollment.status === "past_due" ||
      ((enrollment.status === "pending" || enrollment.status === "trial") &&
        !!enrollment.seatHeldUntil &&
        enrollment.seatHeldUntil.getTime() > now.getTime()));
  const position =
    user && enrollment?.status === "waitlisted"
      ? await waitlistPosition(cohort.id, user.id)
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: cohort.titleEn,
    description: cohort.descriptionEn ?? cohort.titleEn,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    inLanguage: ["en", "ur", "ar", "fr", "id"],
    offers: {
      "@type": "Offer",
      price: Number(cohort.monthlyFee).toFixed(2),
      priceCurrency: cohort.currency,
      category: "Subscription",
      availability:
        ended || !cohort.enrollmentOpen || seatsLeft === 0
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      url: absoluteUrl(locale, `/group-classes/${slug}`),
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      startDate: cohort.startDate,
      instructor: { "@type": "Person", name: cohort.teacherName },
    },
  };

  const facts = [
    {
      icon: CalendarDays,
      label: t("starts"),
      value: <LocalDate date={cohort.startDate} />,
    },
    {
      icon: Timer,
      label: t("duration"),
      value: `${t("weeks", { count: cohort.durationWeeks })} · ${t("minutesPerClass", { count: cohort.sessionMinutes })}`,
    },
    { icon: UserRound, label: t("teacher"), value: cohort.teacherName },
    {
      icon: Users,
      label: t("classSize"),
      value: t("upToStudents", { count: cohort.maxSeats }),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <section className="pattern-stars relative overflow-hidden bg-primary text-primary-foreground">
          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
            <Link
              href="/group-classes"
              className="text-sm text-primary-foreground/70 hover:text-accent"
            >
              <span aria-hidden className="rtl:hidden">← </span>
              <span aria-hidden className="hidden rtl:inline">→ </span>
              {t("allGroupClasses")}
            </Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              {t("eyebrow")}
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-primary-foreground/80">
              {t("withTeacher", { name: cohort.teacherName })}
            </p>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div className="space-y-10">
            <section>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {t("schedule")}
              </h2>
              <div className="mt-4 flex gap-3 rounded-2xl border border-border bg-card p-5">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden />
                <div className="text-lg">
                  <WeeklySchedule
                    slots={weeklySlots(schedule).map((d) => d.toISOString())}
                  />
                </div>
              </div>
              {next && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("nextClass")}{" "}
                  <strong className="text-foreground">
                    <LocalDateTime iso={next.toISOString()} />
                  </strong>
                </p>
              )}
            </section>

            <section>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex gap-3 rounded-2xl border border-border bg-card p-5"
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="mt-1 font-medium text-foreground">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>

            {description && (
              <section>
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {t("about")}
                </h2>
                <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-accent/40 bg-card p-6 shadow-lg">
              <p>
                <span className="font-display text-4xl font-semibold text-primary tabular-nums">
                  {fee}
                </span>
                <span className="ms-1 text-sm text-muted-foreground">
                  {t("perMonth")}
                </span>
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {ended
                  ? t("badgeEnded")
                  : seatsLeft === 0
                    ? t("badgeFull")
                    : t("seatsLeftOf", { count: seatsLeft, total: cohort.maxSeats })}
              </p>
              <div className="mt-5">
                <EnrollPanel
                  cohortId={cohort.id}
                  feeLabel={`${fee}${t("perMonth")}`}
                  seatsLeft={seatsLeft}
                  ended={ended}
                  enrollmentOpen={cohort.enrollmentOpen}
                  trialEnabled={cohort.trialEnabled}
                  signedIn={!!user}
                  mine={
                    enrollment
                      ? {
                          status: enrollment.status,
                          seatLive,
                          trialUsed: !!enrollment.trialClassAt,
                          trialClassAt:
                            enrollment.trialClassAt?.toISOString() ?? null,
                          waitlistPosition: position,
                        }
                      : null
                  }
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
