"use client";

import { useTranslations } from "next-intl";
import { SITE_STATS } from "@/lib/site-stats";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Globe, BookOpen, Award } from "lucide-react";

function AnimatedCounter({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(target);

  useEffect(() => {
    const duration = 1800;
    const startTime = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    // 300ms delay ensures first animated value is well above 0 (no "0+" flash)
    const tid = window.setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, 300);

    return () => {
      clearTimeout(tid);
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return <span>{displayed}</span>;
}

const signals = [
  { key: "students", value: SITE_STATS.students, suffix: "+", icon: Users },
  { key: "countries", value: SITE_STATS.countries, suffix: "+", icon: Globe },
  { key: "classes", value: SITE_STATS.classes, suffix: "+", icon: BookOpen },
  { key: "huffaz", value: SITE_STATS.huffaz, suffix: "+", icon: Award },
] as const;

export function TrustSignalsSection() {
  const t = useTranslations("stats");

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div key={signal.key} className="text-center">
                <Icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold">
                  <AnimatedCounter target={signal.value} />
                  {signal.suffix}
                </div>
                <div className="text-sm mt-1 opacity-80">{t(signal.key)}</div>
                <div className="text-xs mt-1 opacity-60">{t(`${signal.key}Sub`)}</div>
              </div>
            );
          })}
        </motion.div>

        <p className="mt-10 text-center text-xs opacity-40">
          {t("footnote")}
        </p>
      </div>
    </section>
  );
}
