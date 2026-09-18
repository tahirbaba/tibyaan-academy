# Where the translation check cannot see

`scripts/check-i18n.mjs` fails the build when a key used in the app is missing from any of
the five locale files. It checks **static keys only** — `t("someKey")` where `t` is bound to
a namespace by `useTranslations` or `getTranslations`.

It cannot check a key that is built at runtime:

```tsx
const t = useTranslations("coursesSection");
t(`${course.key}Title`)      // resolves only when `course` is known
```

There is no safe way to resolve those without executing the code, so the checker reports
them rather than pretending to cover them. **A missing key in one of these places will not
fail the build.** It is caught at runtime instead: `src/i18n/missing-key.ts` renders a
readable fallback (`teacher.noClassesToday` → "No classes today") and sends one alert per
key to `SUPPORT_EMAIL`, so it is visible without a raw key ever reaching a live page.

## The 15 call sites

| File | Namespace |
|---|---|
| `src/app/[locale]/student/courses/nazra/activities/page.tsx` | `kidsActivities` |
| `src/app/[locale]/student/hifz-tracker/page.tsx` | `hifzTracker` |
| `src/components/courses/course-detail-client.tsx` | `courseDetail` |
| `src/components/courses/course-detail-client.tsx` | `coursesSection` |
| `src/components/courses/courses-page-client.tsx` | `coursesPage` |
| `src/components/courses/courses-page-client.tsx` | `coursesSection` |
| `src/components/homepage/courses-section.tsx` | `coursesSection` |
| `src/components/homepage/dashboard-preview-section.tsx` | `dashboardPreview` |
| `src/components/homepage/features-section.tsx` | `features` |
| `src/components/homepage/how-it-works-section.tsx` | `howItWorks` |
| `src/components/homepage/social-links-section.tsx` | `socialLinks` |
| `src/components/homepage/trust-signals-section.tsx` | `stats` |
| `src/components/pricing/pricing-page-client.tsx` | `coursesSection` |
| `src/components/pricing/pricing-page-client.tsx` | `pricingPage` |
| `src/components/student/badges-grid.tsx` | `gamification` |

Regenerate this list at any time:

```bash
npm run check:i18n -- --json
```

Most of these interpolate a known, closed set — the four course keys, the badge types, the
activity types. If you want them covered by the build too, the fix is to replace the computed
key with an explicit map, for example:

```tsx
const TITLE_KEY = { nazra: "nazraTitle", hifz: "hifzTitle", arabic: "arabicTitle", aalim: "aalimTitle" } as const;
t(TITLE_KEY[course.key])
```

That is a change to how those components are written, so it is not part of Phase 3.
