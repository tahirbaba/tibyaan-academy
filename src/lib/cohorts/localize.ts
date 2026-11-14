type Locale = "en" | "ur" | "ar" | "fr" | "id";

interface Localizable {
  titleEn: string;
  titleUr: string | null;
  titleAr: string | null;
  titleFr: string | null;
  titleId: string | null;
  descriptionEn: string | null;
  descriptionUr: string | null;
  descriptionAr: string | null;
  descriptionFr: string | null;
  descriptionId: string | null;
}

/** Cohort title in the visitor's language, falling back to English. */
export function cohortTitle(c: Localizable, locale: string): string {
  const byLocale: Record<Locale, string | null> = {
    en: c.titleEn,
    ur: c.titleUr,
    ar: c.titleAr,
    fr: c.titleFr,
    id: c.titleId,
  };
  return byLocale[locale as Locale] || c.titleEn;
}

export function cohortDescription(c: Localizable, locale: string): string | null {
  const byLocale: Record<Locale, string | null> = {
    en: c.descriptionEn,
    ur: c.descriptionUr,
    ar: c.descriptionAr,
    fr: c.descriptionFr,
    id: c.descriptionId,
  };
  return byLocale[locale as Locale] || c.descriptionEn;
}

/** "$30", "£25", "€28.50" — the cohort's own currency, not always USD. */
export function formatFee(amount: number | string, currency: string, locale: string): string {
  const value = Number(amount);
  return new Intl.NumberFormat(locale === "ur" ? "en" : locale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}
