"use client";

import { useTranslations } from "next-intl";
import {
  aiOnlyMonthly,
  formatPrice,
  liveTeacherPrice,
  type CourseKey,
  type PricingConfig,
} from "@/lib/pricing";

/**
 * THE way a course's fee is shown on a card — on the homepage, the Courses
 * page and the country pages alike.
 *
 * A course has two fees (with a live teacher, and AI-only). Cards used to show
 * only one of them, and not the same one everywhere: the homepage said
 * "From $25" (the AI-only fee, unlabelled) while the Courses page led with
 * $55 (the live-teacher fee). Both numbers were correct and a parent still saw
 * two different prices for the same course. Every card now shows both fees,
 * each with its label, in the same order, from this one component.
 */
export function CoursePrice({
  pricing,
  course,
  className = "",
}: {
  pricing: PricingConfig;
  course: CourseKey;
  className?: string;
}) {
  const t = useTranslations("pricingPage");
  const live = liveTeacherPrice(pricing, course);

  const row = (label: string, amount: number, isFrom: boolean, strong: boolean) => (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="whitespace-nowrap">
        {isFrom && (
          <span className="me-1 text-xs text-muted-foreground">{t("from")}</span>
        )}
        <span
          className={`font-display font-semibold tabular-nums ${
            strong ? "text-xl text-primary" : "text-base text-foreground"
          }`}
        >
          {formatPrice(amount)}
        </span>
        <span className="text-xs text-muted-foreground">{t("perMonth")}</span>
      </dd>
    </div>
  );

  return (
    <dl className={`space-y-1.5 ${className}`}>
      {row(t("liveTeacherLabel"), live.amount, live.isFrom, true)}
      {row(t("aiOnlyLabel"), aiOnlyMonthly(pricing, course), false, false)}
    </dl>
  );
}
