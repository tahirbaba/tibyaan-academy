"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Video,
  Bot,
  Brain,
  ClipboardCheck,
  Gamepad2,
  Award,
  Users,
  Sparkles,
} from "lucide-react";
import {
  COURSE_KEYS,
  aiOnlyMonthly,
  formatPrice,
  lowestOneOnOnePrice,
  lowestPrice,
  yearlyPrice,
  type PricingConfig,
} from "@/lib/pricing";

const plan1Features = [
  { key: "liveClasses", icon: Video, included: true },
  { key: "aiUstaz", icon: Bot, included: true },
  { key: "hifzTracker", icon: Brain, included: true },
  { key: "weeklyTests", icon: ClipboardCheck, included: true },
  { key: "kidsActivities", icon: Gamepad2, included: true },
  { key: "certificates", icon: Award, included: true },
];

const plan2Features = [
  { key: "aiUstaz", icon: Bot, included: true },
  { key: "hifzTracker", icon: Brain, included: true },
  { key: "weeklyTests", icon: ClipboardCheck, included: false },
  { key: "kidsActivities", icon: Gamepad2, included: true },
  { key: "certificates", icon: Award, included: false },
];

export default function PricingPageClient({
  pricing,
}: {
  pricing: PricingConfig;
}) {
  const t = useTranslations("pricingPage");
  const tc = useTranslations("coursesSection");
  const tp = useTranslations("coursesPage");
  const [isYearly, setIsYearly] = useState(false);

  // Every figure on this page is derived from the one pricing config.
  const show = (monthly: number) =>
    formatPrice(isYearly ? yearlyPrice(pricing, monthly) : monthly);
  const tiers = [
    { key: "tier3Days", amount: pricing.oneOnOne.threeDays },
    { key: "tier5Days", amount: pricing.oneOnOne.fiveDays },
    { key: "tierHifz", amount: pricing.oneOnOne.hifz },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-20">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0MCA4ME0wIDQwTDgwIDQwTTAgMEw4MCA4ME04MCAwTDAgODBNMjAgMEwyMCA4ME02MCAwTDYwIDgwTTAgMjBMODAgMjBNMCA2MEw4MCA2MCIgc3Ryb2tlPSIjMUI0MzMyIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-primary"
            >
              {t("title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-lg text-muted-foreground"
            >
              {t("subtitle")}
            </motion.p>

            {/* Monthly / Yearly Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex items-center justify-center gap-3"
            >
              <span
                className={`text-sm font-medium ${
                  !isYearly ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {t("monthly")}
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isYearly ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    isYearly ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${
                  isYearly ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {t("yearly")}
              </span>
              {isYearly && (
                <Badge className="bg-accent text-white text-xs">
                  {t("yearlyDiscount")}
                </Badge>
              )}
            </motion.div>
          </div>
        </section>

        {/* Plan Cards */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plan 1: Human + AI */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-xl"
              >
                <Badge className="absolute -top-3 start-4 bg-accent text-white px-3">
                  {t("popular")}
                </Badge>
                <h3 className="text-xl font-bold text-foreground mt-2">
                  {t("plan1Title")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("plan1Desc")}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">{t("from")}</span>
                  <span className="text-4xl font-bold text-primary">
                    {show(lowestOneOnOnePrice(pricing))}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {isYearly ? t("perYear") : t("perMonth")}
                  </span>
                </div>
                <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-muted/30">
                  {tiers.map((tier) => (
                    <li
                      key={tier.key}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                    >
                      <span className="text-foreground">{t(tier.key)}</span>
                      <span className="font-semibold text-primary tabular-nums">
                        {show(tier.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
                {isYearly && (
                  <p className="text-xs text-accent mt-1">
                    {t("yearlyDiscount")}
                  </p>
                )}
                <ul className="mt-6 space-y-3">
                  {plan1Features.map((f) => {
                    const FIcon = f.icon;
                    return (
                      <li
                        key={f.key}
                        className="flex items-center gap-3 text-sm"
                      >
                        {f.included ? (
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <FIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-foreground">{tp(f.key)}</span>
                      </li>
                    );
                  })}
                </ul>
                <Link href="/signup" className="block mt-8">
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 font-semibold"
                  >
                    {t("selectPlan")}
                  </Button>
                </Link>
              </motion.div>

              {/* Plan 2: AI Only */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border bg-card p-8"
              >
                <h3 className="text-xl font-bold text-foreground">
                  {t("plan2Title")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("plan2Desc")}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">{t("from")}</span>
                  <span className="text-4xl font-bold text-accent">
                    {show(lowestPrice(pricing))}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {isYearly ? t("perYear") : t("perMonth")}
                  </span>
                </div>
                {isYearly && (
                  <p className="text-xs text-accent mt-1">
                    {t("yearlyDiscount")}
                  </p>
                )}
                <ul className="mt-6 space-y-3">
                  {plan2Features.map((f) => {
                    const FIcon = f.icon;
                    return (
                      <li
                        key={f.key}
                        className="flex items-center gap-3 text-sm"
                      >
                        {f.included ? (
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <FIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span
                          className={
                            f.included
                              ? "text-foreground"
                              : "text-muted-foreground line-through"
                          }
                        >
                          {tp(f.key)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <Link href="/signup" className="block mt-8">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent hover:text-white font-semibold"
                  >
                    {t("startTrial")}
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Money-back guarantee */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/refund-policy" className="text-primary hover:underline font-medium">
                {t("moneyBack")}
              </Link>
            </p>
          </div>
        </section>

        {/* All Course Pricing Table */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-center text-primary mb-10"
            >
              {t("allCoursePricing")}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-2xl border shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-primary/5">
                      <th className="px-6 py-4 text-start text-sm font-semibold text-foreground">
                        {t("course")}
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-primary">
                        {t("col3Days")}
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-primary">
                        {t("col5Days")}
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-accent">
                        {t("plan2Monthly")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COURSE_KEYS.map((course, i) => (
                      <tr key={course} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {tc(`${course}Title`)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {course === "hifz" ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className="font-bold text-primary tabular-nums">
                              {show(pricing.oneOnOne.threeDays)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-primary tabular-nums">
                            {show(
                              course === "hifz"
                                ? pricing.oneOnOne.hifz
                                : pricing.oneOnOne.fiveDays
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-accent tabular-nums">
                            {show(aiOnlyMonthly(pricing, course))}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {isYearly ? t("tableNoteYearly") : t("tableNoteMonthly")}
            </p>
          </div>
        </section>

        {/* Family Discount */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border p-8 md:p-10 text-center"
            >
              <Users className="w-10 h-10 text-primary mx-auto" />
              <h3 className="mt-4 text-2xl font-bold text-foreground">
                {t("familyTitle")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("familyDesc")}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2 bg-card border rounded-xl px-5 py-3">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{t("family2", { percent: pricing.familyDiscount.secondChildPercent })}</span>
                </div>
                <div className="flex items-center gap-2 bg-card border rounded-xl px-5 py-3">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{t("family3", { percent: pricing.familyDiscount.thirdChildOnwardPercent })}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Free Trial CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold"
            >
              {t("trialTitle")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-3 text-primary-foreground/80"
            >
              {t("trialDesc")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="mt-8 h-12 px-8 bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg"
                >
                  {t("trialButton")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-primary text-center mb-8"
            >
              FAQ
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Accordion>
                {[1, 2, 3, 4].map((n) => (
                  <AccordionItem key={n} className="border-b">
                    <AccordionTrigger className="py-4 text-sm font-medium">
                      {t(`faq${n}Q`)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground pb-2">
                        {t(`faq${n}A`)}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
