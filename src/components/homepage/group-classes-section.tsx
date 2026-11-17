"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { CalendarClock, Globe2, Sparkles, Users } from "lucide-react";
import { Reveal, SectionHeading, TiltCard } from "./primitives";
import { HeroOrnamentLazy } from "./hero-ornament-lazy";

const points = [
  { key: "p1", icon: CalendarClock },
  { key: "p2", icon: Users },
  { key: "p3", icon: Globe2 },
  { key: "p4", icon: Sparkles },
] as const;

/**
 * Homepage entry point to the Group Classes pages.
 *
 * Deliberately static: it describes what a group class is and links to the
 * live list. It does not query the database, so the homepage stays fast and
 * cannot be affected by the cohort tables — the list itself, with real seats
 * and fees, lives on /group-classes.
 */
export function GroupClassesSection() {
  const t = useTranslations("groupClassesSection");

  return (
    <section className="pattern-stars relative overflow-hidden bg-gradient-to-br from-[#0F2922] via-[#1B4332] to-[#143528] py-20 text-white md:py-28">
      <div aria-hidden className="pointer-events-none absolute -end-24 top-1/2 hidden h-[34rem] w-[34rem] -translate-y-1/2 opacity-40 lg:block">
        <HeroOrnamentLazy />
      </div>
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading
            align="start"
            tone="dark"
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
          />
          <Reveal delay={0.15} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/group-classes">
              <Button
                size="lg"
                className="h-13 w-full rounded-full bg-[#C9A84C] px-9 text-base font-semibold text-[#0F2922] shadow-lg shadow-black/25 transition-transform hover:-translate-y-0.5 hover:bg-[#D4BD6E] sm:w-auto"
              >
                {t("cta")}
              </Button>
            </Link>
          </Reveal>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {points.map(({ key, icon: Icon }, i) => (
            <Reveal as="li" key={key} delay={i * 0.08}>
              <TiltCard className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-[#C9A84C]/50 hover:bg-white/[0.09]">
                <Icon className="h-6 w-6 text-[#C9A84C]" aria-hidden />
                <h3 className="mt-4 font-semibold text-white">{t(`${key}Title`)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">{t(`${key}Desc`)}</p>
              </TiltCard>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
