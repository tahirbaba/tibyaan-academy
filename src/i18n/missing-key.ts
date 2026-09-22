import { sendFailureAlert } from "@/lib/alerts";

/**
 * What to do when a translation key is missing at runtime.
 *
 * The build (scripts/check-i18n.mjs, wired in next.config.ts) is what should
 * catch this, but it can only see static keys. If one slips through — from a
 * dynamically built key, or a locale file edited without a rebuild — a live page
 * must never show `teacher.noClassesToday` to a student.
 *
 * So: render a readable fallback, and tell someone.
 */

/** "teacher.noClassesToday" -> "No classes today" */
export function humaniseKey(key: string): string {
  const last = key.split(".").pop() ?? key;
  const words = last
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// One alert per key per process. A missing key on a busy page would otherwise
// send an email per render.
const alerted = new Set<string>();

export function reportMissingMessage(key: string, locale: string): void {
  const id = `${locale}:${key}`;
  if (alerted.has(id)) return;
  alerted.add(id);

  console.error(`[i18n] missing message "${key}" for locale "${locale}"`);

  // Only in production: in dev the build check already failed loudly, and no
  // one needs mail while editing.
  if (process.env.NODE_ENV !== "production") return;

  void sendFailureAlert({
    source: "i18n",
    summary: `Missing translation "${key}" (${locale})`,
    error: new Error(
      `No message for "${key}" in messages/${locale}.json. ` +
        `The page rendered the fallback "${humaniseKey(key)}" instead of the key.`
    ),
    context: { key, locale },
  });
}
