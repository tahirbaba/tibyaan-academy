# Silent failure sites

**The pattern:** a server component queries the database inside a `try`, the
`catch` logs and leaves the variable as `[]`, and the page renders normally —
returning HTTP 200 with an empty list.

**Why it matters more than a crash:** a 500 gets reported within hours. A clean
empty page gets believed. The reader concludes there is no data, which is a
different and much worse statement than "something went wrong", and nobody
opens a ticket about a page that looks fine.

This has now cost this platform months **three separate times**:

1. **Class recordings** — teacher uploads existed but the student page read a
   different source and showed nothing. Students concluded no recordings had
   been made.
2. **The orphaned assignments system** — three pages queried a table that was
   never written to; the catch rendered an empty list rather than an error, so
   the dead code looked like working code for months.
3. **The dars list** (Sept 2026) — `poster_url` was missing from the database,
   the query failed outright, and the page said *"No dars posts yet. Check back
   soon!"* while 55 published dars sat in the table. Google read the cheerful
   version.

So: **a catch around a data query must make the failure louder, never absorb
it.** If you catch, alert and rethrow. The only legitimate fallback is one
where an empty result and a failed query genuinely mean the same thing to the
reader — which is almost never true.

The fixed ones follow this shape:

```ts
try {
  rows = await query();
} catch (error) {
  await sendFailureAlert({ source: "/the/page", summary: "...", error });
  throw error;             // the catch exists to be louder, not quieter
}
```

---

## Fixed

| Page | What it used to show on failure |
|---|---|
| `(public)/dars/page.tsx` | "No dars posts yet" — with 55 dars published |
| `(public)/dars/[slug]/page.tsx` | risked a 404, telling Google the dars was deleted |
| `api/admin/content-review` | the approval queue breaking outright |
| `teacher/revenue/page.tsx` | **$0 earned**, indistinguishable from having earned nothing |
| `student/progress/page.tsx` | **no progress recorded**, read by the student and their parent |

`daily_dars` reads additionally survive a missing *optional* column via
`src/lib/db/dars-queries.ts`, so a half-landed deploy costs one field rather
than every dars page. See the header of that file.

---

## Outstanding — 25 sites

Not yet fixed. Ordered by what the lie costs, worst first.

### Money, and records a person relies on

| Site | What it would show |
|---|---|
| `api/progress/route.ts:80` | progress API returns empty — feeds the student and teacher progress views |
| `teacher/students/page.tsx:42` | a teacher with students sees **no students assigned** |
| `teacher/schedule/page.tsx:40` | **no classes scheduled** — a teacher could miss a real class |
| `student/dashboard/page.tsx:30` | the student's whole dashboard, empty on arrival |
| `student/courses/page.tsx:22` | a paying student sees **no courses enrolled** |
| `student/courses/[enrollmentId]/page.tsx:27` | one course opens with no lessons in it |
| `teacher/lessons/page.tsx:42` | no lessons recorded against real teaching |
| `teacher/progress/page.tsx:30` | teacher's view of student progress, blank |
| `teacher/certificates/page.tsx:36` | issued certificates invisible |
| `admin/certificates/page.tsx:65` | same, for admin |

### Communication — an empty inbox reads as "nobody wrote to me"

| Site | What it would show |
|---|---|
| `student/messages/page.tsx:38` | no messages, when messages exist |
| `teacher/messages/page.tsx:38` | as above |
| `api/notifications/route.ts:26` | notification list silently empty |
| `api/notifications/route.ts:32` | unread count silently 0 — the bell never rings |
| `admin/notifications/page.tsx:62` | admin notification history empty |

### Content and moderation — work appears not to have been submitted

| Site | What it would show |
|---|---|
| `teacher/videos/page.tsx:60` | an uploaded video looks like it was never uploaded |
| `admin/videos/page.tsx:68` | the moderation queue looks clear when it is not |
| `teacher/recordings/page.tsx:38` | recordings missing — see failure 1 above |
| `teacher/tests/page.tsx:44` | assigned tests invisible to the teacher |
| `(public)/reviews/page.tsx:87` | **public page** — no reviews, on a page that sells trust |
| `admin/dars-circles/page.tsx:69` | circles missing from admin |

### Admin and operations

| Site | What it would show |
|---|---|
| `api/admin/users/route.ts:90` | user list empty — looks like an empty platform |
| `admin/progress/page.tsx:63` | platform-wide progress reporting, blank |
| `admin/agents/page.tsx:58` | agent logs empty — hides whether AI jobs ran at all |
| `api/recordings/cleanup/route.ts:80` | cleanup reports success having done nothing |

---

## The other half of this incident

The dars list showed an empty shelf because its query failed; the query failed
because a column existed in the Drizzle schema but not yet in the database. The
swallow is what made it invisible, but the schema/migration ordering is what
broke it in the first place. Both rules matter, and they are different rules.

**See `docs/schema-and-migrations.md`** — a schema change and its migration
ship together, and a bare `select()` on a table whose schema may be ahead of
the database is the shape to avoid.

---

## How to find them again

```bash
node scripts/find-silent-failures.cjs
```

It flags server components and route handlers where a `catch` neither rethrows
nor calls `notFound()`/`redirect()`, and a variable nearby was initialised to
`[]`. It over-reports slightly — read each hit — but it will not miss the
pattern.

Client components are excluded: there the failure is usually visible as a
stuck spinner or an error state, and an empty list is not passed off as truth
in the same way. They are still worth reviewing, just not by this script.
