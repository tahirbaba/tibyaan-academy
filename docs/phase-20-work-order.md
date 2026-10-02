# Phase 20 — Tibyaan Academy

**How to use this file.** Each phase is a delegation brief: Outcome, Context, Constraints, Authority, Deliverable, Verification. Work through them **in order**. Stop at the end of each phase and report before starting the next. Do not merge phases.

**Rules that apply to every phase, without exception:**

- Nothing goes to `main` and nothing deploys to production without my explicit go-ahead. Work on branch `phase-20`.
- Before writing code in any phase, list your planned steps and wait for my go-ahead.
- One concern per commit, with a clear message.
- If a phase turns out to be larger than it looks, stop and tell me before doing it. Do not expand the job on your own.
- If anything in this file contradicts what you find in the code, tell me. Do not guess which is right.
- `00-constitution.md` still governs: nothing auto-publishes, no silent failure, every scheduled job reports success and failure.

---

## Phase 1 — Diagnose. Change nothing.

**Outcome:** a written explanation of the real cause of every fault listed below, so that I can decide what to fix and in what order.

**Context:** Tibyaan Academy is live with real students. Several things look broken in the browser but the build passes and typecheck is clean, so the causes are not visible from the code alone. The platform has four surfaces — public site, student panel, teacher panel, admin panel — and they share data. Several of these faults may share one cause.

Faults to explain:

1. **Syllabus images do not render** on `/courses/nazra-quran`, `/courses/arabic-language`, `/courses/aalim-course`. The files exist in the project alongside the PDFs. On `/courses/hifz-quran` the Juz cover images **do** render. Explain why one works and the others do not.
2. **Course books show as empty grey boxes** in the student dashboard.
3. **Logout button at the bottom-left of the sidebar does nothing.** Check every panel — student, teacher, admin.
4. **Admin → Recordings: submitting a recording link does not save.** Nothing appears, no error shown.
5. **Login is slow.** Measure it: time to first byte, time to interactive, and what the app is waiting on.
6. **Teacher panel shows raw translation keys** — `teacher.noClassesToday`, `teacher.viewAll`, `teacher.quickActions`, `teacher.upcomingClasses`, and on `/teacher/ai-assistant` the whole page (`teacherAI.chatTitle`, `teacherAI.tab_chat`, and so on). List **every** missing key across all five locales, not just the ones I have seen.
7. **Admin sidebar renders twice** — a second green panel appears when Enrollment Requests is opened.
8. **Teacher schedule shows two classes for the same slot**, one 45 minutes and one 30 minutes. Explain how a single confirmed schedule request produces two entries.
9. **Hifz Tracker shows `hifzTracker.averageScore`** as a raw key, and the Surah Progress Map shows a stray `75%` on Juz 1 that does not match the `0%` overall figure or the entries below it.
10. **Class times display as 3:00 AM** in the teacher panel for a request confirmed at 22:00–22:45 Asia/Karachi. Explain exactly how times are stored, converted and displayed, end to end.

Also report, without changing anything:

11. **Which features call the Claude API**, and what each one does when the key fails. Name every one: AI Ustaz, AI Monitor, Tajweed Checker, Hifz Tracker, teacher AI Assistant, dars generation, blog generation, and anything else.
12. **Where uploaded video is stored today**, how much space is used, and what happens to cost and speed at 20 teachers × 10 videos each.
13. **Whether signup verifies the email address at all**, and what currently stops a fake address from creating an account.
14. **What the trial popup's trigger rules are** — where it fires, how often, and whether it checks login state or role.
15. **Whether Parent WhatsApp is captured anywhere** at signup or enrolment. The admin Users table shows the column empty for every row.

**Constraints:** read-only. Do not edit, fix, refactor or "clean up" anything in this phase, however small the fix looks. Do not run migrations. Read from production only with read-only queries.

**Authority:** you choose how to investigate and in what order. You may run the app locally and in a production build. You may not change files, push, or deploy.

**Deliverable:** one Markdown file, `docs/phase-20-diagnosis.md`, with one section per numbered item above. Each section states: the real cause (not a guess), the files involved, how big the fix is (small / medium / large), and whether it shares a cause with another item. End with three lists — **Broken**, **Incomplete**, **Dangerous** — ordered by how much harm each does to a real student or teacher today.

**Verification:** for anything you call a cause, show the evidence — the error, the log line, the code path. For anything you could not determine, write "not determined" and say what access you would need. Do not fill gaps with plausible explanations.

**Stop here. I will read the diagnosis and tell you what to fix.**

---

## Phase 2 — Accounts and access

**Outcome:** only a person with a real email address can create an account, and no account can silently gain powers it should not have.

**Context:** fake addresses currently create working accounts — there is a live teacher account on `2345@gmail.com`. My real students are in the UK, USA, Canada and Australia, so any verification email must actually reach them. `RESEND_API_KEY` is set in production and mail already sends from the site's own domain.

**Work:**

1. **Email verification on signup.** The account exists but cannot be used until the address is confirmed. Existing accounts are unaffected — do not lock anyone out.
2. The verification email must come from the site's own domain, in the language the user signed up in, and the signup screen must tell the user to check their spam folder.
3. A clear way to **resend** the verification email.
4. **WhatsApp number field at signup**, with country code. Store it so it appears in the admin Users table, which is empty today. Decide and tell me whether it should be required or optional.
5. **Forgot password.** `/en/forgot-password` is a 404. Build the full flow: request, email, reset, confirmation. Check every locale.
6. **Remember me** on the login form.
7. **Role change in the admin Users table must ask for confirmation** before it takes effect, naming the user and the new role. A mis-click currently makes a student an admin instantly.
8. Record who changed a role, and when.

**Constraints:** no existing user loses access. No password or token is ever written to a log. Verification and reset links expire. Do not weaken any auth guard that already exists.

**Authority:** you choose the implementation and the email wording. You may not disable verification for convenience, and you may not change any other auth rule that is not listed here without asking.

**Deliverable:** working flows on the branch, plus a short note listing what changed and what I must set in Vercel.

**Verification:** I will create an account with a real address and confirm the email arrives and the link works. I will try a fake address and confirm the account cannot be used. I will run forgot-password end to end. I will attempt a role change and confirm it asks first. Show me that an existing user can still log in unaffected.

---

## Phase 3 — Fix what is broken

**Outcome:** every fault confirmed in Phase 1 is fixed, and no page in any panel shows a raw translation key or an empty box where content should be.

**Context:** these are existing faults on a live platform. Some have been live for months. The causes come from the Phase 1 diagnosis, not from guesswork.

**Work:**

1. Syllabus images render on all four course pages.
2. Course book images render in the student dashboard.
3. Logout works in every panel.
4. Admin recording submission saves and shows the result, and shows a clear error when it fails.
5. Login is measurably faster. Tell me the before and after numbers.
6. **Every** missing translation key filled, in all five locales. Add a build-time check that fails when a key used in the app is missing from any locale file — a missing translation must never again reach a live page silently.
7. Admin sidebar renders once.
8. `hifzTracker.averageScore` and the stray `75%` on the Surah Progress Map corrected.

**Constraints:** fix the cause, not the symptom. Do not hide a fault behind a fallback string or a placeholder image. If a fix needs a schema change, stop and tell me first — the migration rules in the constitution apply.

**Authority:** you choose the approach for each fix. You may not change a feature's behaviour while fixing it. If a fix turns out to need a design decision, ask me.

**Deliverable:** the fixes on the branch, and a table of what was wrong and what changed.

**Verification:** for each item, tell me the URL and the exact steps to see it working. I will check every one myself, on desktop and on a phone.

---

## Phase 4 — Course and content pages

**Outcome:** the dars list and the course syllabus pages read as a proper grid instead of a long vertical stack, and every page carries the site header.

**Work:**

1. **`/dars` (Daily Dars):** the list is a single vertical column. Make it a grid — 3 or 4 cards per row on desktop, 2 on tablet, 1 on phone. Each card keeps its category badge, date, title and citation line.
2. **`/dars` has no site header.** Add the same navbar and footer every other page has.
3. **`/courses/hifz-quran`:** the 30 Juz are stacked vertically with a large cover image each. Make it a grid, 3 or 4 per row, with a smaller cover, the Juz name, the ayah range, and the PDF link.
4. **All four course pages:** syllabus items in a consistent grid, with the title page thumbnail beside each PDF.
5. **YouTube embeds:** if the video is a Short (vertical), render it in a vertical frame; otherwise render it at normal 16:9. Detect it rather than asking the uploader. The thumbnail must match the shape.

**Constraints:** keep the existing colours, fonts and spacing — this is layout work, not a redesign. Every grid must collapse correctly on a phone. No layout may push the page sideways.

**Authority:** you choose the grid implementation and the breakpoints. You may not change the site's visual identity or introduce a UI library.

**Deliverable:** the pages on the branch.

**Verification:** I will open each page on desktop and phone. Tell me the exact widths at which each grid changes from 4 to 2 to 1.

---

## Phase 5 — Classes, scheduling and time zones

**Outcome:** a student abroad and a teacher in another country see the same class at the correct local time on each of their screens, join it through one link, and no duplicate class is ever created.

**Context:** this is the most important phase in this file. My students are in the UK, the USA, Canada and Australia; my teachers are elsewhere. A class shown at the wrong hour is a missed class and a lost student. Right now a request confirmed for 22:00–22:45 Asia/Karachi appears in the teacher panel as 3:00 AM, and appears twice — once as 30 minutes and once as 45.

**Work:**

1. **Every class time is stored in UTC.** One source of truth. No local time is ever stored.
2. **Every user has a time zone**, captured at signup from the browser, editable in their profile.
3. **Every screen shows times in that user's own time zone**, with the zone named beside the time so there is no doubt. The same class therefore reads correctly for a student in London and a teacher in Karachi.
4. **Class length is 30 minutes.** One length only. Remove the 45-minute path, and remove the duplicate entries the current flow creates. Tell me what happens to existing 45-minute rows before you touch them.
5. **One class link for both sides.** When a class is scheduled, a single meeting link is attached to it, and both the student and the teacher see the same link on their own screen, with a Join button that becomes active shortly before the class and stays active while it runs. I will tell you in Phase 5a which approach to use — do not choose it yourself.
6. **Remove the separate admin Recordings page.** Class Recordings is the only one that stays. Confirm nothing else links to the removed page before deleting it.

**Constraints:** do not lose or shift any existing scheduled class. Any change to stored times must be reversible and must be tested on a copy of real data first — the constitution's migration rules apply in full. Daylight saving must be handled correctly: the UK and North America change clocks, Pakistan does not.

**Authority:** you choose the storage and conversion approach. You may not choose the meeting-link provider, and you may not delete any schedule row without showing me first.

**Deliverable:** the work on the branch, plus a short note on how a time travels from the student's screen to the database and back to the teacher's screen.

**Verification:** show me one class, created by a student set to Europe/London, viewed by a teacher set to Asia/Karachi, correct on both screens, with the same link on both, and once each in the list. Then show me the same test across a daylight-saving change.

---

## Phase 6 — Hifz Tracker

**Outcome:** the tracker's numbers are correct and its progress display is clear at a glance.

**Work:**

1. **The total ayah count.** The tracker shows 6236. I will confirm the number I want before you change anything — do not change it on your own. Wherever it is used, it must come from one constant, not be hard-coded in several places.
2. **Overall progress** shown as a circular ring that fills to the percentage, with the figure in the centre. It must animate once on load, and be readable on a phone.
3. **The Surah Progress Map** must agree with the entries below it. A Juz shows a percentage only when there are entries for it.
4. Sabaq, Sabqi and Manzil each keep their own record, and the calendar reflects real entries.

**Constraints:** the ayah numbering must be consistent throughout — the tracker, the surah list and the entry form must all use the same source. Do not invent surah or ayah data; use a single verified dataset and tell me which one you are using before you add it.

**Authority:** you choose the chart implementation. You may not change any religious or numerical content without my confirmation.

**Deliverable:** the tracker on the branch, plus the name and source of the Quran dataset used.

**Verification:** I will log a Sabaq entry and check that the count, the percentage, the ring, the map and the calendar all move together and agree.

---

## Phase 7 — Tests and assignments

**Outcome:** a teacher can assign work in a usable form, and a student can complete it and mark it done.

**Context:** today a teacher assigns an item and the student sees it as a line of text with a Pending badge and no way to act on it.

**Work:**

1. A proper assign form for the teacher: title, instructions, type (test or assignment), due date, and an optional file.
2. The student sees the full item, can open any attachment, and can **mark it done**.
3. When the student marks it done, the status changes for both of them, and the teacher is notified.
4. The teacher can see who has completed and who has not.
5. Overdue items are visibly marked on both sides.

**Constraints:** do not build grading, marks or feedback in this phase. Assign, view, complete, notify — nothing more.

**Authority:** you choose the form and the status model. Ask before adding any field that is not listed here.

**Deliverable:** the flow on the branch.

**Verification:** I will assign an item as a teacher, complete it as a student, and confirm both sides update and the notification arrives.

---

## Phase 8 — Dars posters and the dars page

**Outcome:** every dars carries a poster that suits its category, generated automatically, shown on the dars page and used as the social preview image.

**Context:** an OG image route already exists at `/api/og/dars/[slug]`, built with `next/og`. This phase extends it rather than replacing it. Dars content is already generated by the content agent and waits for my approval before publishing — that stays exactly as it is.

**Work:**

1. **One poster template per category** — Dua, Quran, Fiqh, Seerah, Hadith — each with its own colour treatment, but all clearly from the same family.
2. The poster carries the Tibyaan logo, the category, the title, the citation line, and where the dars is a Dua or an Ayah, **the Arabic text itself**, correctly shaped and right-to-left.
3. The poster is generated when the dars is approved, not on every page view, and is stored so it is not regenerated each time.
4. The poster appears as the card image on `/dars` and at the top of each dars page.
5. It remains the `openGraph` and `twitter` image, and stays downloadable at a plain URL so I can post it by hand.

**Constraints:** **do not use an AI image generator for this.** Not Gemini, not any other. Generated images render Arabic text unreliably and a wrong letter in an ayah is not an acceptable risk. The poster is rendered from HTML and CSS, from the dars text itself, so every character is exactly what was approved. Load the Arabic font explicitly and verify the shaping.

**Authority:** you choose the layouts and the colour treatment per category. You may not change the approval flow, and you may not alter any dars text while generating a poster.

**Deliverable:** the templates and the route on the branch, plus one sample poster per category for me to look at.

**Verification:** I will check one poster of each category for correct Arabic shaping, correct citation, and a clean appearance on a phone-sized share preview.

---

## Phase 9 — Video: where it lives and how much of it there is

**Outcome:** teacher videos are hosted somewhere built for video, the home page shows only a chosen few, and each teacher has a sensible limit.

**Context:** a teacher uploads a tilawat video from the teacher panel, the admin approves it, and any visitor can share the link — that share flow is the fastest way students find us and must not change. But the video currently sits in the same storage as everything else, on a free tier, and the cost of serving it grows with every viewer. Twenty teachers uploading regularly will break both the storage limit and the bill.

**Work:**

1. **Move video hosting** to a service built for it. I will tell you which one in Phase 9a — do not choose it yourself. Migrate existing videos. The upload flow, the approval step and the share link must all behave exactly as they do now.
2. **Home page shows three chosen videos**, not all of them, with a link to a page that lists the rest. I choose the three; build the mechanism.
3. **A per-teacher total limit** on published videos, not a daily one. I will give you the number.
4. **Remove AI Assistant from the teacher panel** entirely — the page, the menu item and the API route. It spends tokens with no return.
5. **Show the platform's share clearly in the teacher panel**: 25% of the per-student fee. I will give you the exact wording. It must be visible where a teacher sees their revenue, not buried in a settings page.

**Constraints:** no existing video may be lost. Every existing share link must keep working, or redirect to the new one. Removing the AI Assistant must not break anything else that calls the same route.

**Authority:** you choose how to migrate. You may not choose the hosting provider, the video limit, or the wording of the revenue notice.

**Deliverable:** the work on the branch, plus a note telling me the expected monthly cost at 20 teachers × 10 videos with moderate viewing.

**Verification:** I will play an existing video, share a link and open it fresh, and upload a new one end to end including approval.

---

## Phase 10 — The home page

**Outcome:** a parent abroad, landing for the first time, immediately sees who teaches, what makes us different, and only true numbers.

**Work:**

1. **The large empty green panel in the hero** carries a video — my guiding video, or a teacher's tilawat. I will give you the link. It must not slow the page down; embed it, never host it on the site.
2. **The four statistics must agree with each other and be true.** They currently read 500+ Students, 15+ Countries, 10,000+ Classes, 50+ Huffaz, and earlier copy elsewhere said 5,000+ students. I will give you the real figures, or tell you to remove the block. Whichever I choose, the number must come from one place and not be repeated anywhere with a different value.
3. **Explain the Human + AI teaching properly.** It currently appears as five words under the heading. It is the thing that sets us apart and needs its own short section: what the human teacher does, what the AI does, and what a parent gets from the combination. I will give you the text.
4. **The trial popup** appears only to a logged-out visitor on the public site, never in the teacher, student or admin panel, and at most once per visitor per week. Dismissing it must be remembered.

**Constraints:** no visual redesign — the colours, fonts and layout stay. Do not add any statistic, testimonial or claim I have not given you.

**Authority:** you choose the layout of the new section and the popup's storage mechanism. You may not write marketing copy or invent figures.

**Deliverable:** the home page on the branch.

**Verification:** I will load it as a logged-out visitor and as each role, on desktop and phone, and confirm the popup rule holds in each case.

---

## Phase 11 — Ship it

**Outcome:** everything above is live, and I have seen it working before it went there.

**Work:** push the branch, build a preview, check it yourself first, then hand me the preview URL with a click-through checklist. After I have tested and approved, merge and deploy. After deploying, crawl every sitemap URL and report the status of each, and confirm on the live site: canonical on the real domain, GA4 firing once, all five `/about` pages returning 200, and the protected API routes still rejecting unauthenticated requests.

**Constraints:** the preview will be pointed at the production database. Warn me clearly about anything in it that writes real data, so I do not change live content while testing.

**Authority:** none over merging or deploying. Both wait for me.

**Verification:** mine, in the browser, before anything merges.
