/**
 * The canonical public origin — every canonical, hreflang, og:url, sitemap,
 * robots, RSS, share and referral URL is built from it.
 *
 * There is deliberately NO silent fallback outside `next dev`. A preview built
 * without NEXT_PUBLIC_SITE_URL once shipped "http://localhost:3000" in every
 * canonical; a wrong domain in every page is worse than a visible failure.
 * next.config.ts fails the production build first; this is the runtime guard.
 */
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is not set. It is required outside `next dev` — " +
      "set it to the site's public origin, e.g. https://tibyaanacademy.com."
  );
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Tibyaan Academy";

/**
 * The one real mailbox. Used as the support address shown to users, the
 * recipient of admin notifications, and the From: on outgoing mail.
 * The old @tibyaan.com addresses were never real inboxes.
 */
export const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL ?? "academytibyaan@gmail.com";

/**
 * The address outgoing mail is sent FROM.
 *
 * This must be on a domain verified with the mail provider. It previously used
 * SUPPORT_EMAIL, which is a gmail.com address — Resend rejects any send from a
 * free-mail domain, because nobody can prove ownership of gmail.com. Every
 * failure alert this platform produced between 11 and 19 September was refused
 * for that reason and dropped with a console.error, which is how the dars cron
 * failing every morning reached nobody.
 *
 * SUPPORT_EMAIL stays as it is: it is the real mailbox people write TO, and it
 * is where alerts are delivered. Only the From: has to be on the domain.
 */
export const MAIL_FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS ?? "noreply@tibyaanacademy.com";

/** From: header for transactional mail, e.g. `Tibyaan Academy <noreply@…>`. */
export const MAIL_FROM = `${SITE_NAME} <${MAIL_FROM_ADDRESS}>`;

/** Domains no mail provider will ever let you send FROM. */
const UNSENDABLE_FROM_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "aol.com",
];

/**
 * True when MAIL_FROM_ADDRESS could never be accepted by the provider. Checked
 * at send time so the cause is named in the logs, and surfaced by /api/health
 * so a broken alerting channel is visible without waiting for a failure.
 */
export function mailFromIsUnsendable(): boolean {
  const domain = MAIL_FROM_ADDRESS.split("@")[1]?.toLowerCase() ?? "";
  return domain === "" || UNSENDABLE_FROM_DOMAINS.includes(domain);
}

/** @deprecated use SUPPORT_EMAIL */
export const ADMIN_EMAIL = SUPPORT_EMAIL;
export const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP ?? "+923129114002";

export const SITE_LOCALES = ["ur", "ar", "en", "fr", "id"] as const;
export const DEFAULT_LOCALE = "ur";

/** Absolute URL for a locale-prefixed path, e.g. absoluteUrl("en", "/pricing"). */
export function absoluteUrl(locale: string, path = ""): string {
  return `${SITE_URL}/${locale}${path}`;
}

/**
 * hreflang map for a page: every locale version of the same path,
 * plus an x-default pointing at the site's default locale.
 */
export function localeAlternates(path = ""): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of SITE_LOCALES) {
    languages[locale] = absoluteUrl(locale, path);
  }
  languages["x-default"] = absoluteUrl(DEFAULT_LOCALE, path);
  return languages;
}

export function isSiteLocale(locale: string): boolean {
  return (SITE_LOCALES as readonly string[]).includes(locale);
}

/**
 * Ready-made `alternates` block: self-referencing canonical + hreflang map.
 *
 * An unknown locale segment is a 404 (e.g. /uk, whose real page is /en/uk).
 * Returning an empty block there keeps the 404 from advertising itself to
 * Google with a self-canonical and a full hreflang set.
 */
export function localeMetadataAlternates(locale: string, path = "") {
  if (!isSiteLocale(locale)) return {};
  return {
    canonical: absoluteUrl(locale, path),
    languages: localeAlternates(path),
  };
}
