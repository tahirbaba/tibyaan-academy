"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "@/lib/data/team";
import { Reveal, SectionHeading } from "./primitives";

/**
 * The real teaching team, with their own names, photographs and roles — the
 * same people and the same wording as the About page (one shared list), not
 * illustrations. Photos are below the fold and lazy-loaded at a fixed aspect
 * ratio, so they cost nothing on first paint and cannot shift the layout.
 */
export function TeachersSection() {
  const t = useTranslations("aboutPage");
  const th = useTranslations("teachersSection");
  const team = t.raw("team") as Array<{ role: string; description: string }>;

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={th("eyebrow")}
          title={t("teamSectionTitle")}
          subtitle={t("teamSectionSubtitle")}
        />

        <ul className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
          {TEAM_MEMBERS.map((member, i) => (
            <Reveal as="li" key={member.id} delay={(i % 4) * 0.06}>
              <div className="premium-card group h-full overflow-hidden">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0F2922]/70 to-transparent" aria-hidden />
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="text-sm font-semibold leading-snug text-foreground md:text-base" dir="ltr">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[#8A6F1F] dark:text-accent md:text-sm">
                    {team[member.translationIndex]?.role}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/teachers">
            <Button size="lg" className="rounded-full px-8">
              {th("meetAll")}
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline" className="rounded-full border-primary/30 px-8">
              {th("aboutUs")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
