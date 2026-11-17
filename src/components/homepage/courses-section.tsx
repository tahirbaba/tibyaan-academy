"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Check, Sparkles, Languages, GraduationCap } from "lucide-react";
import type { PricingConfig } from "@/lib/pricing";
import { CoursePrice } from "@/components/pricing/course-price";
import { Reveal, SectionHeading, TiltCard } from "./primitives";

const courses = [
  { key: "nazra", icon: BookOpen, slug: "nazra-quran" },
  { key: "hifz", icon: Sparkles, slug: "hifz-quran" },
  { key: "arabic", icon: Languages, slug: "arabic-language" },
  { key: "aalim", icon: GraduationCap, slug: "aalim-course" },
] as const;

/**
 * Course cards. Each card leans toward the cursor, and resting the cursor on
 * it opens what the course covers and the two actions; moving away closes it
 * again. The fee is always visible. On a touch screen (no cursor) the extra
 * part is simply always open, and the whole card is one link to the course
 * either way, so nothing depends on being able to hover.
 */
export function CoursesSection({ pricing }: { pricing: PricingConfig }) {
  const t = useTranslations("coursesSection");
  const tp = useTranslations("coursesPage");
  const tc = useTranslations("common");

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t("title")} />

        <div className="mt-14 grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course, i) => {
            const Icon = course.icon;
            return (
              <Reveal key={course.key} delay={i * 0.08}>
                <TiltCard className="premium-card group flex flex-col overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" aria-hidden />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="tilt-lift flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-[#8A6F1F] ring-1 ring-accent/30 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110 dark:text-accent">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>

                    <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                      <Link href={`/courses/${course.slug}`} className="hover:text-primary">
                        {t(`${course.key}Title`)}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(`${course.key}Desc`)}
                    </p>

                    <div className="mt-4">
                      <Badge variant="secondary" className="text-xs">
                        {t(`${course.key}Duration`)}
                      </Badge>
                    </div>

                    <CoursePrice
                      pricing={pricing}
                      course={course.key}
                      className="mt-5 border-t border-border pt-4"
                    />

                    {/* Opens on hover / keyboard focus; always open on touch. */}
                    <div className="hover-reveal">
                      <div>
                        <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
                          {[1, 2, 3].map((n) => (
                            <li key={n} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                              {tp(`${course.key}Feature${n}`)}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 grid gap-2">
                          <Link href="/signup">
                            <Button className="w-full rounded-full bg-accent font-semibold text-[#0F2922] hover:bg-accent/90">
                              {tc("startFreeTrial")}
                            </Button>
                          </Link>
                          <Link href={`/courses/${course.slug}`}>
                            <Button variant="outline" className="w-full rounded-full border-primary/30">
                              {t("viewCourse")}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
