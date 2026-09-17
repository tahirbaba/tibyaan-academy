# Phase 20 — Diagnosis

Read-only investigation. No application file was changed, no migration run, no deploy made.
Only this document was added, on branch `phase-20`.

Evidence was taken from the code, from the live site (GET requests only), and from the
verified Supabase backup of 2026-09-11 held locally in `../backups/`. Where a cause could
not be established, it says **not determined** and names the access required.

**Two things in the brief do not match the repository — flagging rather than guessing:**

1. `00-constitution.md` does not exist anywhere in this repository or in `docs/`. I have
   followed the three rules quoted in the brief (nothing auto-publishes, no silent failure,
   scheduled jobs report success and failure), but I could not read the document itself.
2. The brief says the syllabus images "exist in the project alongside the PDFs". The images
   are in `public/`, but **no PDF is in the project at all** — `.gitignore:46` excludes
   `/public/**/*.pdf`, and every PDF link points at Supabase Storage
   (`course-syllabus.ts:21`). The PDFs are not the problem; only the images are.

---

## 1. Syllabus images do not render on three course pages

**Cause.** The image files are missing from the deployed site. They are requested from
`/public`, and on the live site three of the four folders return a genuine 404:

```
200  /Quran Parah Images/Para 1 — Alif Lam Meem.webp     (Hifz — works)
200  /Quran Parah Images/Para 3 — Tilkal Rusul.png
404  /Nazra/Huroof-e-Murakkabat.jpg
404  /Nazra/Huroof-e-Mufradat (Alif to Yaa).jpg
404  /Aalim Course/Sahih Bukhari.webp
404  /Aalim Course/Ibn Majah.jpg
404  /Arabic Language/Arabic Literature.jpg
200  /Our Team/Muhammad_Tahir_Hasni.jpg                  (not excluded — works)
```

The 404s return `content-type: text/html` (the app's 404 page); the Hifz image returns a
real `image/webp`, 61,208 bytes. So this is not a rendering bug — the files are not there.

`.vercelignore` deliberately excludes exactly these folders:

```
public/Aalim Course/
public/Arabic Language/
public/Quran Parah Images/
public/Nazra/
```

added in commit `0d1e046` (2026-05-08) with the comment *"Exclude large binary files from
Vercel upload (serve from Cloudflare R2 in prod)"*. **The images were excluded from the
deploy on the assumption they would be served from elsewhere, and that move was never made** —
`course-syllabus.ts` still points every image at a local `/public` path. Only the PDFs were
moved (to Supabase Storage, not R2).

Ruled out, with evidence:
- *Not* a filename or case mismatch: all 38 referenced paths exist on disk with exactly
  matching names (Linux is case-sensitive, Windows is not, so this was worth checking).
- *Not* untracked files: all four folders are fully tracked in git and none is git-ignored.
- *Not* a stale cache: the working image has `age: 152s` and a current `last-modified`.

**Why Hifz still works — not determined.** `public/Quran Parah Images/` is listed in
`.vercelignore` exactly like the other three, yet its files are present in production while
the others are not. I could not establish why from outside. To settle it I need **a Vercel
token with read access**, to list the files in the current deployment
(`GET /v6/deployments/{id}/files`). I am not going to invent a reason for the difference.
It does not change the fix: the images must be served from somewhere that is actually
deployed.

**Files:** `.vercelignore`, `src/lib/data/course-syllabus.ts`, `public/Nazra/`,
`public/Aalim Course/`, `public/Arabic Language/`.
**Size:** small if the folders are simply removed from `.vercelignore` (total 50 files,
well within limits); medium if they are moved to Supabase Storage as originally intended.
**Shares a cause with:** item 2.

---

## 2. Course books show as empty grey boxes in the student dashboard

**Cause.** The same missing files. `student/courses/[enrollmentId]/course-detail-client.tsx`
renders `<img src={section.bookImage}>` and `<img src={book.image}>` (lines 181, 192, 211,
226) from the same `course-syllabus.ts` data. A broken `<img>` inside a fixed-size container
is the grey box.

**Files:** as item 1, plus `src/app/[locale]/student/courses/[enrollmentId]/course-detail-client.tsx`.
**Size:** none of its own — fixed by item 1.
**Shares a cause with:** item 1.

---

## 3. Logout does nothing

Three separate faults, one per panel.

**Admin and teacher: there is no sign-out at all.** Both render a plain link:

```tsx
<Link href="/login"><Button><LogOut/></Button></Link>
```
`admin-shell.tsx:213`, `teacher-shell.tsx:188`

The session is never ended. The user navigates to `/login` still logged in, and `proxy.ts:75`
redirects an authenticated user away from any auth route back to their dashboard. The button
therefore appears to do nothing at all. This is the exact reported behaviour.

**Student: the button is wired, but through a client wrapper.** `student-shell.tsx:199`:

```tsx
<form action={() => signOut(locale)}>
```
The file is `"use client"`, so this is a client action that calls the server action inside a
closure rather than passing it to `action` directly. `signOut` ends with `redirect()`
(`(auth)/actions.ts`), and a redirect raised inside a server action invoked this way is not
applied to the browser. **Whether the sign-out itself still completes is not determined** —
confirming it needs a logged-in student session in a browser, which I do not have.

**"Bottom-left of the sidebar" — there is no logout button there.** The sidebar's bottom-left
block (`admin-shell.tsx:156-176`) is a non-interactive user panel: initial, name, email. The
only logout control is the icon at the top right of the header. Clicking the user block does
nothing because nothing is bound to it.

**Files:** `admin-shell.tsx`, `teacher-shell.tsx`, `student-shell.tsx`, `(auth)/actions.ts`, `proxy.ts`.
**Size:** small.
**Shares a cause with:** nothing.

---

## 4. Admin → Recordings: submitting a link does not save

**Cause.** `POST /api/admin/recordings` requires a `teacher_student_matches` row for the pair,
or an `enrollments` row for the student from which to create one. If neither exists it stops:

```ts
if (!matchId) return NextResponse.json(
  { error: "No enrollment found for this student-teacher pair" }, { status: 400 });
```
`src/app/api/admin/recordings/route.ts:57`

In the verified production backup of 2026-09-11, **`enrollments` has 0 rows and
`teacher_student_matches` has 0 rows.** With no enrollment and no match, every submission
takes that branch and nothing is ever inserted.

**"No error shown" does not match the code**, and I could not resolve that from outside. The
client does render the error (`admin-recordings-client.tsx:131`) and sets it on any non-OK
response. Either the message is being missed on screen, or the request fails earlier with a
403 — the route requires `users.role === 'admin'` in Neon (line 15), which is a different
source of truth from the Supabase metadata role the middleware uses. **Which of the two it is,
is not determined**; one submission with the browser's Network tab open settles it, or an
admin session for me to reproduce with.

**Files:** `src/app/api/admin/recordings/route.ts`, `admin-recordings-client.tsx`.
**Size:** small to fix the reporting; medium if enrollments must exist first.
**Related to:** item 8 — both depend on enrollment/match rows that the approval flow creates.

---

## 5. Login is slow

**Partly not determined.** What I could measure from outside:

| Page | TTFB | Total |
|---|---|---|
| `/en/login` (5 runs) | 0.51 – 0.65 s | 0.61 – 0.94 s |
| `/en/pricing` | 0.53 s | 0.77 s |
| `/en` | 0.62 s | 1.21 s |

The login **page** is not unusually slow; it is in line with every other page, and the HTML is
103 KB. **Time to interactive and the submit → dashboard duration are not determined** — both
need a real session in a browser. To measure them I need **a test account** (ideally a student
and a teacher) or permission to run a browser session against the live site with one.

What the app waits on, from the code, is a chain of sequential calls across three regions:

- Vercel functions run in **iad1 (US East)** — `vercel.json`.
- Supabase auth is in **ap-northeast-1 (Tokyo)** — established when the pooler
  `aws-1-ap-northeast-1.pooler.supabase.com` was the only region that authenticated.
- Neon is in **us-east-1** — from the connection host `ep-winter-hill-a4fend5v.us-east-1.aws.neon.tech`.

So every Supabase auth call is a US-East ⇄ Tokyo round trip. On submit (`(auth)/login/actions.ts`):

1. `signInWithPassword` → Tokyo
2. `getUserById` → Neon (us-east-1)
3. `supabase.auth.updateUser` → Tokyo — **on every first login**, because signup sets
   `needs_onboarding: true` and this branch clears it (line 36)
4. `getDashboardPath`
5. `redirect` → the dashboard request then re-runs `supabase.auth.getUser()` in
   `proxy.ts:64` → Tokyo again
6. the student layout and dashboard page then run 4 awaits each before first paint

That is up to three Tokyo round trips plus two database regions for one login. The region
split is the structural cause; the sequential `await`s make it worse.

**Files:** `(auth)/login/actions.ts`, `proxy.ts`, `lib/supabase/middleware.ts`, `vercel.json`.
**Size:** medium (parallelise and cut round trips) or large (move Supabase region).
**Shares a cause with:** nothing.

---

## 6. Teacher panel shows raw translation keys

**Cause.** The keys are used in code but exist in **no locale file at all**. This is not
translation drift: the five locale files are internally consistent — `en`, `ur`: 1363 keys
each; `ar`, `fr`, `id`: 1374 (11 extra); **none is missing a key that another has.**

I compared every static `t("…")` call in 361 files against all five locale files:
667 distinct keys used, **68 missing from all five**, 0 missing from only some.

**`teacherAI` — 44 keys** (`teacher/ai-assistant/page.tsx`):
`advancedStudents, analysisDescription, analysisReport, analysisTitle, analyze, assessment,
chatHistory, chatSubtitle, chatSuggested1, chatSuggested2, chatSuggested3, chatSuggested4,
chatSuggestedTitle, chatTitle, chatWelcome, differentiation, errorMessage, explanation,
generatedQuiz, hideAllAnswers, hideAnswer, hifzAnalysis, homework, lessonPlanTitle,
mainLesson, materials, memorized, minutes, nextSteps, noHistory, objective, pace, practice,
questionsLabel, quizTitle, quizTopicPlaceholder, revisionNeeded, showAllAnswers, showAnswer,
strugglingStudents, studentIdPlaceholder, teacherNotes, thinking, warmUp`

**`teacher` — 14 keys** (`teacher/dashboard/dashboard-client.tsx`, `teacher/lessons/lessons-client.tsx`, and others):
`classesToday, inProgress, noCertificatesYet, noClassesToday, noLessonsYet,
noMatchingStudents, noPendingActions, noRevenueYet, noStudentsYet, noTestsYet,
noUpcomingClasses, quickActions, upcomingClasses, viewAll`

**`darsCircles` — 9 keys** (`teacher/dars-circles/page.tsx`):
`circleCreated, circleTitles, descriptionPlaceholder, noTeacherCircles, scheduledDate,
scheduledTime, teacherSubtitle, teacherTitle, titlePlaceholder`

**`hifzTracker` — 1 key** (`student/hifz-tracker/page.tsx`): `averageScore` — this is item 9.

A further **16 call sites build keys dynamically** (template literals), so they cannot be
checked statically and are not included above: `kidsActivities`, `hifzTracker`, `teacherAI`,
`courseDetail`, `coursesSection` (×4), `coursesPage`, `dashboardPreview`, `features`,
`howItWorks`, `socialLinks`, `stats`, `pricingPage`, `gamification`. Any build-time checker
(Phase 3.6) must handle these or it will give false confidence.

**Worth your decision before Phase 3:** 44 of the 68 belong to `teacherAI`, and Phase 9.4 says
to delete that page, its menu item and its API route. Translating those keys first would be
wasted work.

**Files:** `messages/{en,ur,ar,fr,id}.json` and the pages listed above.
**Size:** medium (68 keys × 5 locales = 340 strings, of which 220 are the page you plan to delete).
**Shares a cause with:** item 9.

---

## 7. Admin sidebar renders twice

**Cause.** `admin/layout.tsx:34` already wraps every admin page in `<AdminShell>`. The
enrollment-requests page renders a second one inside it:

```
grep -l AdminShell src/app/[locale]/admin/
  admin-shell.tsx
  enrollment-requests/page.tsx   ← the only page that renders it again
  layout.tsx
```

Nested shells produce two sidebars. It is the only page in the panel that does this, which is
exactly why it is the only one that shows the fault.

**Files:** `src/app/[locale]/admin/enrollment-requests/page.tsx`.
**Size:** small — remove the wrapper from the page.
**Shares a cause with:** nothing.

---

## 8. Teacher schedule shows the same slot twice, 45 min and 30 min

**Cause.** One approval writes the class rows twice, from two code paths in the same file,
with two different hard-coded durations.

`src/app/api/admin/schedule-requests/[id]/route.ts`:

- `PATCH` inserts inline at line 172: `durationMinutes: 45`
- the same `PATCH` then calls `handleApproval(db, updated)` at line 224, which inserts again
  at line 335: `durationMinutes: 30`

Both run for a single approval, so each slot is written twice. The 45-minute row comes from
`getMonthWeekdayDates(...)`, the 30-minute row from `handleApproval`'s own date loop.

Note also that **confirming a schedule request does not create any class at all** —
`/api/scheduling/confirm` only sets `selectedSlot` and `status: 'confirmed'`. Classes appear
only when an **admin** approves, which is where the duplication happens.

**Files:** `src/app/api/admin/schedule-requests/[id]/route.ts`.
**Size:** small to stop the duplication; medium including cleanup of rows already written.
**Shares a cause with:** item 10 — same file, same two paths.

---

## 9. `hifzTracker.averageScore` and the stray 75% on Juz 1

Two separate faults in one screen.

**The raw key** is item 6: `averageScore` is used at `student/hifz-tracker/page.tsx:181` and
is in none of the five locale files.

**The 75%.** The Juz map is not computed from entries. `page.tsx:140-144`:

```ts
const approxAyaatPerJuz = Math.round(totalAyaat / 30);          // 6236/30 = 208
const juzStart = i * approxAyaatPerJuz;                          // Juz 1 → 0
const progress = Math.min(100, Math.round(
  Math.max(0, stats.totalAyaatMemorized - juzStart) / approxAyaatPerJuz * 100));
```

Every memorised ayah is poured into Juz 1 first, then Juz 2, in equal 208-ayah blocks. So a
student with ~156 memorised ayaat shows **75% on Juz 1** (156/208), while the overall figure
is 156/6236 = 2.5%, which displays as 0%. The two numbers disagree because they measure
different things, and the map does not reflect which juz the entries were actually for.

The 208-ayah block is also factually wrong — juz are not equal in length.

**Files:** `src/app/[locale]/student/hifz-tracker/page.tsx`, `messages/*.json`.
**Size:** small for the key; medium for the map (needs a real per-juz ayah dataset — Phase 6.3).
**Shares a cause with:** item 6 (the key).

---

## 10. Class times display as 3:00 AM

**Cause.** The local time is written to the database as if it were UTC. The time zone is
collected, carried, and then never used.

`schedule_requests` stores no instant at all — only `timezone` (varchar), `preferredTime`
(jsonb `{start, end}`) and `selectedSlot` (jsonb `{day, time}`), all local strings.

When an admin approves, both insert paths build the timestamp with `setHours`, which uses the
**server's** zone — UTC on Vercel:

```ts
const classDate = new Date(cursor);
classDate.setHours(hour, minute, 0, 0);     // route.ts:325, handleApproval
```
and in the other path the time zone is accepted and discarded — the parameter is literally
named `_timezone` and appears nowhere in the function body:

```ts
function getMonthWeekdayDates(days, time, _timezone: string)
```

So **22:00 selected in Asia/Karachi is stored as 22:00 UTC.** The teacher's browser then
renders it with `toLocaleTimeString("en-US", …)` and **no `timeZone` option**
(`schedule-client.tsx:78`), so it uses the viewer's own zone: 22:00 UTC + 5 = **03:00 next
morning in Karachi.** That is exactly the reported symptom, and it reproduces arithmetically.

End to end today: student picks local time → stored as a naive string → re-interpreted as UTC
on the server → rendered in the viewer's browser zone. There is no point at which the
student's zone is applied, and no class time in the database is trustworthy.

**Files:** `src/app/api/admin/schedule-requests/[id]/route.ts`,
`src/app/[locale]/teacher/schedule/schedule-client.tsx`, `src/lib/db/schema.ts`
(`schedule_requests`, `classes`).
**Size:** large — this is Phase 5, and it needs a data migration for rows already stored wrong.
**Shares a cause with:** item 8 (same file and approval paths).

---

## 11. Which features call the Claude API, and what happens when the key fails

| Feature | Route / file | On key failure |
|---|---|---|
| AI Ustaz (student chat) | `api/ai-ustaz/route.ts` | Missing key → 500 `"AI service not configured"`; upstream error → 502 `"AI service error"`. Visible to the student. |
| Teacher AI Assistant — chat | `api/teacher-ai/chat/route.ts` | Missing key → JSON error response. |
| Teacher AI Assistant — quiz | `api/teacher-ai/generate-quiz/route.ts` | Same pattern. |
| Teacher AI Assistant — lesson plan | `api/teacher-ai/generate-lesson-plan/route.ts` | Same pattern. |
| Teacher AI Assistant — analyse student | `api/teacher-ai/analyze-student/route.ts` | Same pattern. |
| Review spam check | `api/admin/reviews/spam-check/route.ts` | Missing key → error response; admin-only. |
| Blog generation (cron) | `api/blog/generate/route.ts` | Missing key → 500 `"AI service not configured"`. Since the September work order this is wrapped by `withCron`, so a failure now emails `SUPPORT_EMAIL`. |
| Blog generation (Inngest) | `inngest/functions/generate-blog.ts` | Throws; retried by Inngest, then `onFailure` emails `SUPPORT_EMAIL`. |
| Dars generation (cron) | via `lib/agents/base-agent.ts` → `orchestrate` | `base-agent.ts:78` throws `"ANTHROPIC_API_KEY not set"`; caught by `BaseAgent.execute`, written to `agent_logs` as `status: 'error'`, route returns 500, and `withCron` emails `SUPPORT_EMAIL`. |
| Health check | `api/health/route.ts` | Only checks that the variable is present; makes no API call. |

**Tajweed Checker does not call Claude for transcription** — it uses Groq Whisper
(`GROQ_API_KEY`, `lib/audio/transcribe.ts`) and then the tajweed agent for analysis.
**Hifz Tracker and AI Monitor make no Claude calls at all** — AI Monitor only reads
`ai_usage_logs`. The brief lists both as Claude features; they are not.

Every failure path returns an error rather than inventing content, and the two scheduled jobs
now report failure by email. Nothing here fails silently.

---

## 12. Where uploaded video is stored, and what it costs

**Not Cloudflare R2, despite the file name and comments.** `src/lib/r2/client.ts` is a
Supabase Storage client — its own header says *"Supabase Storage client — replaces Cloudflare
R2"*. Buckets: `videos` and `recordings`, both public, with a 500 MB per-file limit
(`client.ts:86`). The `.vercelignore` comment about serving from R2 is out of date.

**Space used today**, measured from the 2026-09-11 backup:

| Bucket | Objects | Size |
|---|---|---|
| `course-pdfs` | 60 | 644.8 MB |
| `videos` | 1 | 7.0 MB |
| `avatars` | 1 | 0.9 MB |
| **Total** | **62** | **652.7 MB** |

The Supabase free tier gives **1 GB of storage and 5 GB of egress per month**. You are at
**65% of the storage limit before the video feature is really used**, and almost all of it is
course PDFs, not video.

**At 20 teachers × 10 videos = 200 videos.** The one video on the platform is 7 MB, which is a
sample of one and almost certainly not representative of a full tilawat recording; treat the
first row as a floor, not a forecast.

| Average video | 200 videos | Plus 645 MB of PDFs | Over the 1 GB free tier? |
|---|---|---|---|
| 7 MB (measured) | 1.4 GB | 2.0 GB | yes, ~2× |
| 50 MB | 10 GB | 10.6 GB | yes, ~10× |
| 150 MB | 30 GB | 30.6 GB | yes, ~30× |

Egress is the sharper problem: the free allowance is 5 GB/month, so at 50 MB per video a
single video watched 100 times consumes the whole month's egress. Supabase's paid tier is
$25/month including 100 GB storage and 250 GB egress, then roughly $0.021/GB storage and
$0.09/GB egress beyond that — so the bill scales with viewers, which is the opposite of what
you want for a share link that is meant to spread. This is what Phase 9 addresses.

---

## 13. Does signup verify the email address?

**No. Nothing stops a fake address.**

The code supports both modes — `signupWithEmail` redirects to onboarding if a session comes
back, or to `login?confirmed=pending` if it does not (`(auth)/signup/actions.ts:100-108`) —
so the behaviour is decided by the Supabase project setting, not by this repository.

The backup shows the setting is **off**. Of 14 accounts, **11 had `email_confirmed_at` within
5 seconds of `created_at`**; the first row differs by **29 milliseconds**:

```
created_at            2026-03-27 19:40:54.162176+00
email_confirmed_at    2026-03-27 19:40:54.191577+00
```

No human opened an inbox in 29 ms. Accounts are being auto-confirmed at creation, so any
syntactically valid address creates a usable account — which is how a teacher account exists
on `2345@gmail.com`. That address is not in the 2026-09-11 backup, so it was created after
that date; I did not query production directly.

The fix is a Supabase Auth setting plus the flows in Phase 2 — it is not a code bug.
Note also that **`/en/forgot-password` does not exist**: there is no route matching
`*forgot*` or `*reset*` anywhere under `src/app`, confirming the Phase 2.5 report.

---

## 14. Trial popup trigger rules

`src/components/shared/exit-intent-popup.tsx`, mounted in `src/app/[locale]/layout.tsx:102`.

- **Where:** the locale layout wraps *every* page, so it is mounted on the student, teacher
  and admin panels as well as the public site. The only exclusion is
  `pathname.includes("/login") || pathname.includes("/signup")` (line 42).
- **Trigger:** `mouseleave` on the document, then a `setTimeout` (line 56). Being
  mouse-based, it effectively never fires on a phone or tablet.
- **How often:** suppressed by `sessionStorage.getItem("exit_intent_shown")` (line 47).
  `sessionStorage` is per tab and is cleared when the tab closes, so it is **once per tab, not
  once per visitor per week**. A returning visitor sees it again every session.
- **Login state / role:** **not checked at all.** There is no reference to the user or role in
  the component. A signed-in student, teacher or admin is shown the free-trial popup.

All three rules in Phase 10.4 are currently unmet.

---

## 15. Is Parent WhatsApp captured anywhere?

**It is collected at signup and then thrown away. Nothing ever writes it to the database.**

- The signup form passes `parentWhatsapp` into `supabase.auth.signUp({ options: { data: … } })`
  as `parent_whatsapp` — **Supabase user metadata only** (`(auth)/signup/actions.ts:53`).
- The admin Users table reads it from a completely different place — the Neon column
  `student_profiles.parent_whatsapp`, via a left join (`api/admin/users/route.ts:52-55`).
- Onboarding is the only code that writes `student_profiles`, and it writes **age, country,
  planType, classesPerWeek** — and nothing else (`(auth)/onboarding/actions.ts:69-85`).
- A search across `src/` finds **no write of any kind** to `parentWhatsapp` or
  `parent_whatsapp` in Neon; every occurrence is a read.

So the column is empty for every row because nothing has ever written to it. The value
entered at signup survives only in Supabase user metadata, where nothing reads it.

**Files:** `(auth)/signup/actions.ts`, `(auth)/onboarding/actions.ts`,
`api/admin/users/route.ts`, `lib/db/schema.ts`.
**Size:** small.
**Shares a cause with:** nothing, but it is the same gap Phase 2.4 asks to close.

---

# Summary

## Broken — wrong or absent for a real user today

Ordered by harm.

1. **Class times are wrong (item 10).** A class booked for 22:00 shows as 03:00. A student
   abroad misses the class and blames the school. Every class time in the database is
   currently untrustworthy.
2. **Every approved slot is booked twice (item 8).** Two rows per class, 45 and 30 minutes,
   from one approval.
3. **Logout does not work in the admin or teacher panel (item 3).** No sign-out happens at
   all. On a shared or family computer the next person has the previous user's session.
4. **Syllabus and course-book images are missing (items 1, 2).** Three of four course pages
   and the student dashboard show broken images to prospective and paying students.
5. **The teacher panel shows raw keys (items 6, 9).** 68 keys missing from all five locales;
   `/teacher/ai-assistant` is almost entirely untranslated.
6. **Admin cannot save a recording (item 4).** The feature cannot be used at all while
   `enrollments` and `teacher_student_matches` are empty.
7. **Hifz progress is misleading (item 9).** The Juz map contradicts the overall figure
   because it is invented from a linear model rather than from entries.
8. **The admin sidebar renders twice (item 7).** Cosmetic, one page.

## Incomplete — built part-way, quietly does nothing

1. **Parent WhatsApp (item 15)** — collected at signup, never stored, column empty for every row.
2. **Email verification (item 13)** — the code supports it; the Supabase setting has it off.
3. **Forgot password (item 13)** — the route does not exist at all.
4. **The trial popup (item 14)** — no login check, no role check, per-tab rather than per-week,
   and it never fires on a phone.
5. **Video hosting (item 12)** — on a 1 GB free tier that is already 65% full, named for a
   provider it does not use.
6. **`/api/scheduling/confirm` (item 8)** — marks a request confirmed but creates no class.

## Dangerous — risk of loss, cost or harm

1. **Anyone can create an account with a fake address (item 13).** Auto-confirmed in 29 ms.
   A live teacher account already exists on `2345@gmail.com`. Teacher accounts can upload
   video and be matched with children.
2. **Class times are stored with no time zone (item 10).** Fixing this later means migrating
   rows whose true meaning has to be inferred from the `timezone` column. Every day of delay
   adds rows that need interpreting.
3. **Storage and egress will break under normal use (item 12).** 65% of the free storage tier
   is gone before video is used in earnest; a single popular share link can consume the
   month's egress. This fails at the moment the site succeeds.
4. **Two sources of truth for a user's role (items 4, 5).** Supabase metadata drives the
   middleware; the Neon `users.role` column drives the API routes, and login copies one to the
   other on every sign-in. If they disagree, access differs depending on which layer is asked.
5. **Duplicate class rows (item 8)** are being written continuously, and any repair has to
   decide which of each pair was real.

---

## What I could not determine, and what I would need

| Question | Access needed |
|---|---|
| Why `public/Quran Parah Images/` is deployed while the other three `.vercelignore` folders are not (item 1) | A Vercel read token, to list the files in the current deployment |
| Whether the student logout completes the sign-out despite not redirecting (item 3) | A student test account |
| Whether the recordings failure is the 400 or a 403 role mismatch (item 4) | An admin session, or one submission with the Network tab open |
| Login time to interactive and submit → dashboard duration (item 5) | A test account, or permission to run a browser session against live with one |
| Current live values behind items measured from the 2026-09-11 backup (items 4, 12, 13) | A read-only Neon/Supabase connection string for fresh figures |

Nothing above has been fixed, and no file other than this document has been changed.
