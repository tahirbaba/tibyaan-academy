"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles, Languages, GraduationCap } from "lucide-react";
import type { PricingConfig } from "@/lib/pricing";
import { CoursePrice } from "@/components/pricing/course-price";
import { Reveal, SectionHeading } from "./primitives";

const courses = [
  { key: "nazra", icon: BookOpen, slug: "nazra-quran" },
  { key: "hifz", icon: Sparkles, slug: "hifz-quran" },
  { key: "arabic", icon: Languages, slug: "arabic-language" },
  { key: "aalim", icon: GraduationCap, slug: "aalim-course" },
] as const;

export function CoursesSection({ pricing }: { pricing: PricingConfig }) {
  const t = useTranslations("coursesSection");

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t("title")} />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course, i) => {
            const Icon = course.icon;
            return (
              <Reveal key={course.key} delay={i * 0.08}>
                <div className="premium-card group flex h-full flex-col overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" aria-hidden />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-[#8A6F1F] ring-1 ring-accent/30 dark:text-accent">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>

                    <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                      {t(`${course.key}Title`)}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
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

                    <Link href={`/courses/${course.slug}`} className="mt-4 block">
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-primary/30 transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                      >
                        {t("viewCourse")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
