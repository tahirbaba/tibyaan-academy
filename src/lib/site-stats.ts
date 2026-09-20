/**
 * The four public figures, in one place.
 *
 * They were previously retyped in four different files and had drifted into
 * four different claims: 500+ students on the home page, 2000+ on the About
 * page, 5,000+ under the testimonials, and per-country numbers that summed to
 * 1,550+ — more than the site-wide total. Every surface now reads from here.
 *
 * These are marketing figures set by the academy, not counts from the database.
 * Nothing computes them; changing a number here changes it everywhere.
 */
export const SITE_STATS = {
  students: 500,
  countries: 15,
  classes: 10000,
  huffaz: 50,
} as const;

export type SiteStatKey = keyof typeof SITE_STATS;

/** 10000 -> "10,000+" */
export function formatStat(key: SiteStatKey): string {
  return `${SITE_STATS[key].toLocaleString("en-US")}+`;
}

/**
 * Values for next-intl message placeholders, so a figure inside a translated
 * sentence still comes from the constant instead of being typed into the
 * locale file. Use as: t("statStudents", STAT_VALUES)
 */
export const STAT_VALUES = {
  students: formatStat("students"),
  countries: formatStat("countries"),
  classes: formatStat("classes"),
  huffaz: formatStat("huffaz"),
} as const;

/**
 * Bare numbers, for sentences that already carry the comparison in words -
 * e.g. Urdu "20 سے زیادہ ممالک" / French "plus de 20 pays". Using the
 * suffixed form there would read "more than 15+ countries".
 */
export const STAT_COUNTS = {
  studentsCount: String(SITE_STATS.students),
  countriesCount: String(SITE_STATS.countries),
  classesCount: SITE_STATS.classes.toLocaleString("en-US"),
  huffazCount: String(SITE_STATS.huffaz),
} as const;
