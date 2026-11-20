"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export function CtaSection() {
  const t = useTranslations("cta");

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="pattern-stars relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[2rem] border border-[#C9A84C]/30 bg-gradient-to-br from-[#0F2922] via-[#1B4332] to-[#143528] px-8 py-12 shadow-2xl md:flex-row md:px-12"
        >
          <div className="relative z-10">
            <h2 className="font-display text-2xl font-semibold text-white md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-white/75">
              {t("subtitle")}
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto"
          >
            <Input
              type="text"
              placeholder={t("namePlaceholder")}
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent min-w-0 sm:w-44 rounded-full"
            />
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent min-w-0 sm:w-52 rounded-full"
            />
            <Button
              type="submit"
              className="h-12 whitespace-nowrap rounded-full bg-[#C9A84C] px-8 font-semibold text-[#0F2922] shadow-lg hover:bg-[#D4BD6E]"
            >
              {t("button")}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
