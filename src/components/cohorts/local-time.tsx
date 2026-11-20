"use client";

import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";

/**
 * Class times in the VISITOR'S time zone.
 *
 * The server cannot know the visitor's zone, so it renders the UTC time
 * (labelled as UTC — never an unlabelled time) and the browser replaces it with
 * local time on hydration. useSyncExternalStore gives a mismatch-free
 * "am I in the browser" flag without a setState-in-effect.
 */
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/** Latin digits for every locale, so "19:00" reads the same next to "$30". */
function intlLocale(locale: string): string {
  if (locale === "ar") return "ar-u-nu-latn";
  if (locale === "ur") return "ur-PK-u-nu-latn";
  return locale;
}

export function useVisitorTimeZone(): string {
  const isClient = useIsClient();
  return isClient ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
}

/** "Tuesday 7:00 PM" for each weekly slot, plus which zone that is. */
export function WeeklySchedule({ slots }: { slots: string[] }) {
  const locale = useLocale();
  const t = useTranslations("cohorts");
  const timeZone = useVisitorTimeZone();
  const isClient = useIsClient();

  const format = new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });

  return (
    <div>
      <ul className="space-y-1">
        {slots.map((iso) => (
          <li key={iso} className="font-medium text-foreground">
            {format.format(new Date(iso))}
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {isClient ? t("timesInYourZone", { zone: timeZone }) : t("timesInUtc")}
      </p>
    </div>
  );
}

/** One instant ("Tue, 1 Dec, 7:00 PM GMT") in the visitor's zone. */
export function LocalDateTime({ iso }: { iso: string }) {
  const locale = useLocale();
  const timeZone = useVisitorTimeZone();
  return (
    <time dateTime={iso}>
      {new Intl.DateTimeFormat(intlLocale(locale), {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
        timeZone,
      }).format(new Date(iso))}
    </time>
  );
}

/** A calendar date only ("1 December 2026"), read as a UTC date. */
export function LocalDate({ date }: { date: string }) {
  const locale = useLocale();
  return (
    <time dateTime={date}>
      {new Intl.DateTimeFormat(intlLocale(locale), {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${date}T00:00:00Z`))}
    </time>
  );
}
