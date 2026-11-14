"use client";

import { useTranslations } from "next-intl";
import {
  Bot,
  Video,
  Gamepad2,
  Languages,
  Brain,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { Reveal, SectionHeading } from "./primitives";

const features = [
  { key: "f1", icon: Bot },
  { key: "f2", icon: Video },
  { key: "f3", icon: Gamepad2 },
  { key: "f4", icon: Languages },
  { key: "f5", icon: Brain },
  { key: "f6", icon: GraduationCap },
  { key: "f7", icon: Calendar },
] as const;

export function FeaturesSection() {
  const t = useTranslations("features");

  return (
    <section className="pattern-stars pattern-stars-light bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t("title")} />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.key} delay={(i % 3) * 0.08}>
                <div className="premium-card group h-full p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {t(`${feature.key}Title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`${feature.key}Desc`)}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
