"use client";

import { useTranslations } from "next-intl";
import { UserPlus, BookMarked, Rocket } from "lucide-react";
import { Reveal, SectionHeading } from "./primitives";

const steps = [
  { key: "step1", icon: UserPlus, num: "1" },
  { key: "step2", icon: BookMarked, num: "2" },
  { key: "step3", icon: Rocket, num: "3" },
] as const;

export function HowItWorksSection() {
  const t = useTranslations("howItWorks");

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t("title")} />

        <div className="relative mt-16">
          {/* Connecting line */}
          <div
            aria-hidden
            className="absolute start-[16.67%] end-[16.67%] top-12 hidden h-px bg-gradient-to-r from-transparent via-accent to-transparent md:block"
          />

          <ol className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal as="li" key={step.key} delay={i * 0.15} className="relative text-center">
                  <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-accent/40 bg-card shadow-lg ring-8 ring-background">
                    <Icon className="h-9 w-9 text-primary" aria-hidden />
                    <span className="absolute -end-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-[#0F2922] shadow-md">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-foreground">
                    {t(`${step.key}Title`)}
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {t(`${step.key}Desc`)}
                  </p>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
