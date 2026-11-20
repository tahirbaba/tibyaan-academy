"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatPrice, teacherShare, type PricingConfig } from "@/lib/pricing";
import {
  DollarSign,
  Globe,
  Bot,
  Clock,
  GraduationCap,
  LogIn,
} from "lucide-react";

const benefits = [
  { icon: DollarSign, key: "benefit1" as const },
  { icon: Globe, key: "benefit2" as const },
  { icon: Bot, key: "benefit3" as const },
  { icon: Clock, key: "benefit4" as const },
];

export function TeacherCtaSection({ pricing }: { pricing: PricingConfig }) {
  const t = useTranslations("teacherCta");

  // What a teacher actually earns per student: their share of each 1-on-1 fee.
  // Computed from the pricing config, so this sentence can never again promise
  // more than a student pays.
  const shares = Object.values(pricing.oneOnOne).map((fee) => teacherShare(pricing, fee));
  const earnings = {
    percent: pricing.teacherSharePercent,
    low: formatPrice(Math.min(...shares)),
    high: formatPrice(Math.max(...shares)),
  };

  return (
    <section className="pattern-stars pattern-stars-light bg-muted/40 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text & CTA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6F1F] dark:text-accent">
                <GraduationCap className="w-4 h-4" />
                Teachers
              </div>
              <h2 className="font-display text-3xl font-semibold leading-tight text-primary dark:text-foreground md:text-[2.75rem]">
                {t("title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("subtitle")}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full gap-2 rounded-full bg-primary px-8 text-primary-foreground shadow-lg hover:bg-primary/90 sm:w-auto"
                  >
                    <GraduationCap className="w-5 h-5" />
                    {t("joinButton")}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full gap-2 rounded-full border-primary/30 px-8 sm:w-auto"
                  >
                    <LogIn className="w-4 h-4" />
                    {t("alreadyTeacher")}
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="premium-card h-full p-6"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground leading-snug">
                      {benefit.key === "benefit1" ? t("benefit1", earnings) : t(benefit.key)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
