import { z } from "zod";

/**
 * THE pricing source of truth.
 *
 * Every fee, the teacher/academy split and the family discounts live here and
 * nowhere else. Pages, metadata, JSON-LD, Stripe checkout and the teacher
 * revenue pages all read a `PricingConfig`; none of them may carry a number of
 * their own. (Before Nov 2026 the same fees were typed by hand in ~70 places
 * and had drifted — the student Payments page said Nazra was $40 while the
 * pricing page said $33.)
 *
 * `PRICING_DEFAULTS` is what applies until an admin saves different values on
 * Admin → Pricing. Saved values are stored in `admin_settings` under
 * `PRICING_SETTINGS_KEY` and read through `src/lib/pricing-server.ts`.
 *
 * This file is pure (no database, no server-only imports) so client components
 * can use the helpers on a config handed to them by the server.
 */

export const PRICING_SETTINGS_KEY = "pricing_config";

export const COURSE_KEYS = ["nazra", "hifz", "arabic", "aalim"] as const;
export type CourseKey = (typeof COURSE_KEYS)[number];

const money = z.number().positive().max(100000);
const percent = z.number().min(0).max(100);

export const pricingConfigSchema = z.object({
  currency: z.literal("USD"),
  /** 1-on-1 plans with a live teacher (monthly). */
  oneOnOne: z.object({
    threeDays: money,
    fiveDays: money,
    /** Hifz is taught 5 days a week only. */
    hifz: money,
  }),
  /** AI-only plan (monthly), per course. */
  aiOnly: z.object({
    nazra: money,
    hifz: money,
    arabic: money,
    aalim: money,
  }),
  /** Share of a 1-on-1 student's paid fee that goes to the teacher. */
  teacherSharePercent: percent,
  familyDiscount: z.object({
    secondChildPercent: percent,
    thirdChildOnwardPercent: percent,
  }),
  /** A yearly plan is billed as this many months (10 = two months free). */
  yearlyMonthsCharged: z.number().int().min(1).max(12),
});

export type PricingConfig = z.infer<typeof pricingConfigSchema>;

export const PRICING_DEFAULTS: PricingConfig = {
  currency: "USD",
  oneOnOne: { threeDays: 55, fiveDays: 69, hifz: 89 },
  aiOnly: { nazra: 25, hifz: 37, arabic: 35, aalim: 40 },
  teacherSharePercent: 70,
  familyDiscount: { secondChildPercent: 15, thirdChildOnwardPercent: 20 },
  yearlyMonthsCharged: 10,
};

export type OneOnOneTier = "threeDays" | "fiveDays" | "hifz";

/** Round to cents. Money is never left with float dust. */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** "$55" for whole amounts, "$38.50" otherwise. */
export function formatPrice(amount: number): string {
  const rounded = roundMoney(amount);
  return Number.isInteger(rounded) ? `$${rounded}` : `$${rounded.toFixed(2)}`;
}

/**
 * Which 1-on-1 tier a live-teacher enrollment falls in.
 * Hifz is always the Hifz tier; otherwise 5+ classes a week is the 5-day tier
 * and anything less is the 3-day tier.
 */
export function oneOnOneTier(
  course: CourseKey,
  classesPerWeek: number | null | undefined
): OneOnOneTier {
  if (course === "hifz") return "hifz";
  return (classesPerWeek ?? 3) >= 5 ? "fiveDays" : "threeDays";
}

export function oneOnOneMonthly(
  config: PricingConfig,
  course: CourseKey,
  classesPerWeek: number | null | undefined
): number {
  return config.oneOnOne[oneOnOneTier(course, classesPerWeek)];
}

/** Cheapest live-teacher price available for a course. */
export function oneOnOneFrom(config: PricingConfig, course: CourseKey): number {
  return course === "hifz"
    ? config.oneOnOne.hifz
    : Math.min(config.oneOnOne.threeDays, config.oneOnOne.fiveDays);
}

export function aiOnlyMonthly(config: PricingConfig, course: CourseKey): number {
  return config.aiOnly[course];
}

export function yearlyPrice(config: PricingConfig, monthly: number): number {
  return roundMoney(monthly * config.yearlyMonthsCharged);
}

/**
 * Family discount for the Nth child of a family (1 = first child, no discount).
 * Returned as a percentage, e.g. 15.
 */
export function familyDiscountPercent(
  config: PricingConfig,
  childIndex: number
): number {
  if (childIndex >= 3) return config.familyDiscount.thirdChildOnwardPercent;
  if (childIndex === 2) return config.familyDiscount.secondChildPercent;
  return 0;
}

export function applyDiscount(amount: number, discountPercent: number): number {
  return roundMoney(amount * (1 - discountPercent / 100));
}

/**
 * The teacher's share of what a 1-on-1 student ACTUALLY paid — i.e. of the
 * discounted fee, never of the list price.
 */
export function teacherShare(config: PricingConfig, amountPaid: number): number {
  return roundMoney((amountPaid * config.teacherSharePercent) / 100);
}

export function lowestPrice(config: PricingConfig): number {
  return Math.min(...Object.values(config.aiOnly));
}

export function highestPrice(config: PricingConfig): number {
  return Math.max(...Object.values(config.oneOnOne));
}

export function lowestOneOnOnePrice(config: PricingConfig): number {
  return Math.min(...Object.values(config.oneOnOne));
}

export const COURSE_SLUG_TO_KEY: Record<string, CourseKey> = {
  "nazra-quran": "nazra",
  "hifz-quran": "hifz",
  "arabic-language": "arabic",
  "aalim-course": "aalim",
};

/**
 * The live-teacher fee to quote for a course, and whether it is a "from"
 * price. Hifz has one fee; the other courses start at the cheaper of the
 * 3-day and 5-day fees.
 */
export function liveTeacherPrice(
  config: PricingConfig,
  course: CourseKey
): { amount: number; isFrom: boolean } {
  if (course === "hifz") return { amount: config.oneOnOne.hifz, isFrom: false };
  return {
    amount: oneOnOneFrom(config, course),
    isFrom: config.oneOnOne.threeDays !== config.oneOnOne.fiveDays,
  };
}

/**
 * The fee sentence used in page descriptions (search results, link previews)
 * and the FAQ, in the visitor's language. It always names BOTH fees with their
 * labels — never a bare "from $25" — so the description a parent reads on
 * Google says the same thing as the page they land on.
 *
 * Pass a course for that course's fees; omit it for the site-wide starting
 * fees.
 */
export function feeSentence(
  locale: string,
  config: PricingConfig,
  course?: CourseKey
): string {
  const live = course
    ? liveTeacherPrice(config, course)
    : { amount: lowestOneOnOnePrice(config), isFrom: true };
  const ai = roundMoney(course ? aiOnlyMonthly(config, course) : lowestPrice(config));
  const aiIsFrom = !course;
  const l = roundMoney(live.amount);
  switch (locale) {
    case "ur":
      return `لائیو استاد کے ساتھ $${l} ماہانہ${live.isFrom ? " سے" : ""}، صرف AI استاذ $${ai} ماہانہ${aiIsFrom ? " سے" : ""}۔`;
    case "ar":
      return `مع معلم مباشر ${live.isFrom ? "من " : ""}${l}$ شهرياً، والأستاذ الذكي فقط ${aiIsFrom ? "من " : ""}${ai}$ شهرياً.`;
    case "fr":
      return `Avec enseignant en direct ${live.isFrom ? "dès " : ""}${l} $/mois, AI Ustaz seul ${aiIsFrom ? "dès " : ""}${ai} $/mois.`;
    case "id":
      return `Dengan guru langsung ${live.isFrom ? "mulai " : ""}$${l}/bulan, hanya AI Ustaz ${aiIsFrom ? "mulai " : ""}$${ai}/bulan.`;
    default:
      return `With a live teacher ${live.isFrom ? "from " : ""}$${l}/month, AI Ustaz only ${aiIsFrom ? "from " : ""}$${ai}/month.`;
  }
}

/**
 * Add the fee sentence to a page description when the result still fits in a
 * search result (about 165 characters). A description that would be cut off
 * mid-price is worse than one without the price, so a long description is
 * returned unchanged.
 */
export function appendFeeSentence(
  description: string,
  locale: string,
  config: PricingConfig,
  course?: CourseKey,
  maxLength = 165
): string {
  const combined = `${description} ${feeSentence(locale, config, course)}`;
  return combined.length <= maxLength ? combined : description;
}

/**
 * Parse a stored settings value. Throws on anything that is not a complete,
 * valid config — a half-valid price table must never be silently "repaired"
 * into numbers nobody chose.
 */
export function parsePricingConfig(raw: unknown): PricingConfig {
  const value = typeof raw === "string" ? JSON.parse(raw) : raw;
  return pricingConfigSchema.parse(value);
}
