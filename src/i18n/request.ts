import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { humaniseKey, reportMissingMessage } from "./missing-key";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  const activeLocale = locale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,

    // A missing key must never reach a live page as a raw key. The build check
    // (scripts/check-i18n.mjs) catches static keys; this covers anything that
    // slips past it — dynamically built keys, or a locale file changed without
    // a rebuild.
    onError(error) {
      const key = (error as { originalMessage?: string }).originalMessage ?? String(error);
      if (error.code === "MISSING_MESSAGE") {
        reportMissingMessage(key, activeLocale);
        return;
      }
      console.error("[i18n]", error);
    },
    getMessageFallback({ namespace, key }) {
      const full = namespace ? `${namespace}.${key}` : key;
      reportMissingMessage(full, activeLocale);
      return humaniseKey(full);
    },
  };
});
