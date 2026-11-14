"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { formatPrice, lowestPrice, type PricingConfig } from "@/lib/pricing";
import { Reveal, SectionHeading } from "./primitives";

/**
 * The homepage pricing summary. Every number comes from the pricing config
 * the page was rendered with (Admin → Pricing) — the same source the pricing
 * page, the course pages and Stripe checkout use.
 */
export function PricingTeaserSection({ pricing }: { pricing: PricingConfig }) {
  const t = useTranslations("pricingTeaser");
  const tp = useTranslations("pricingPage");

  const tiers = [
    { label: tp("tier3Days"), amount: pricing.oneOnOne.threeDays },
    { label: tp("tier5Days"), amount: pricing.oneOnOne.fiveDays },
    { label: tp("tierHifz"), amount: pricing.oneOnOne.hifz },
  ];
  const liveFeatures = [t("f1"), t("f2"), t("f3"), t("f4")];
  const aiFeatures = [t("f2"), t("f5"), t("f3"), t("f6")];

  return (
    <section className="pattern-stars pattern-stars-light bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Live teacher */}
          <Reveal className="lg:col-span-1">
            <div className="relative h-full rounded-[1.25rem] border-2 border-accent bg-card p-7 shadow-xl">
              <span className="absolute -top-3 start-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-[#0F2922]">
                {t("popular")}
              </span>
              <h3 className="font-display text-xl font-semibold text-foreground">{t("plan1")}</h3>
              <ul className="mt-5 divide-y divide-border">
                {tiers.map((tier) => (
                  <li key={tier.label} className="flex items-baseline justify-between gap-3 py-3">
                    <span className="text-sm text-foreground">{tier.label}</span>
                    <span className="whitespace-nowrap">
                      <span className="font-display text-2xl font-semibold text-primary tabular-nums">
                        {formatPrice(tier.amount)}
                      </span>
                      <span className="ms-1 text-xs text-muted-foreground">{t("perMonth")}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="mt-5 space-y-2">
                {liveFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* AI only */}
          <Reveal delay={0.08}>
            <div className="premium-card h-full p-7">
              <h3 className="font-display text-xl font-semibold text-foreground">{t("plan2")}</h3>
              <p className="mt-5">
                <span className="text-sm text-muted-foreground">{tp("from")} </span>
                <span className="font-display text-4xl font-semibold text-primary tabular-nums">
                  {formatPrice(lowestPrice(pricing))}
                </span>
                <span className="ms-1 text-sm text-muted-foreground">{t("perMonth")}</span>
              </p>
              <ul className="mt-6 space-y-2">
                {aiFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Group classes */}
          <Reveal delay={0.16}>
            <div className="premium-card flex h-full flex-col p-7">
              <h3 className="font-display text-xl font-semibold text-foreground">{t("groupTitle")}</h3>
              <p className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {t("groupDesc")}
              </p>
              <Link href="/group-classes" className="mt-6 block">
                <Button variant="outline" className="w-full rounded-full border-primary/30">
                  {t("groupCta")}
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("familyNote", {
              second: pricing.familyDiscount.secondChildPercent,
              third: pricing.familyDiscount.thirdChildOnwardPercent,
            })}
          </p>
          <div className="mt-6 text-center">
            <Link href="/pricing">
              <Button size="lg" className="rounded-full px-9">
                {t("viewPricing")}
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
