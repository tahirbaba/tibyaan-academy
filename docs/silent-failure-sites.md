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

## A confident explanation is not a verified one

On 28 Sep 2026 a real failure alert was refused by Resend with a 403,
"domain is not verified". The reasonable explanation was that the DNS outage
minutes earlier had knocked the domain out of verified status. It was
reasonable, it fit the timeline — and it was **wrong**. The domain had been
verified since 26 September and never lapsed. The actual cause: the API key in
production belonged to a *different Resend account* from the one that owns the
verified domain. The wrong account will reject the send no matter what the
right account's dashboard says.

Five things on 29 Sep 2026 alone passed while the thing they checked had
failed, or explained a failure without checking:

1. **Backup verification** compared empty strings — CRLF made every table name
   invalid, `2>/dev/null` hid it, and 44/44 "matched" while querying nothing.
2. **The `arabic: yes` sample script** reported extraction succeeded while the
   flag meant nothing was rendered.
3. **A piped build** (`next build | grep`) reported grep's exit code, so a
   build that died out of memory reported success.
4. **A DNS edit** took the whole site down while build, deploy and app were all
   green (below).
5. **A confident explanation** of the Resend 403 that fit the evidence and was
   still wrong.

The rule for all five: **a check that cannot fail proves nothing, and an
explanation that was not tested is a guess wearing a lab coat.** Before trusting
a green result, ask what it would show if the thing had failed. Before trusting
an explanation, verify it against the source — here, the account the key
actually belongs to — not against a story that merely fits.

## A DNS edit can take the whole site down with every check still green

On 28 Sep 2026 the apex and www records for tibyaanacademy.com were deleted
by accident while unrelated records were being added at the registrar. For
roughly an hour the site was unreachable to everyone, and:

  * the build was green
  * the deploy was READY
  * the application was running and answering on its .vercel.app URL
  * no alert fired, because nothing had failed — the app was fine

Nothing in the platform was broken. The platform simply could not be reached.
Every signal we had was measuring the wrong thing.

**Any liveness check must fetch the real domain from outside.** Not the
deployment URL, not localhost, not an internal health call — those all stay
green in exactly this scenario. The check has to answer "can a stranger on the
internet load tibyaanacademy.com", which is the only question that matters,
and it must alert when the answer is no.

Corollary for anything resolved by name: a cached resolver will keep answering
after the record is gone, so a check that passes on one machine proves nothing
about the others.

## The same pattern outside the app: pipes hide exit codes

`next build | grep …` reports the exit status of **grep**, not the build. On
28 Sep 2026 a build died with `FATAL ERROR: Zone Allocation failed - process
out of memory` and the run was reported as **exit code 0**. Deploying on the
strength of that would have shipped from a half-written `.next`.

Any build, test or migration whose result you intend to trust must not be
piped. Capture the status first, then filter:

```bash
npm run build > /tmp/build.log 2>&1; echo "EXIT: $?"   # right
npm run build 2>&1 | grep -i error                     # WRONG: grep's status
```

Same family as everything else here: a check that can report success while
doing nothing, or while the thing it checked actually failed.

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

---

# More of the same, found 29–30 Sep 2026

## A 200 with a `warning` field nobody reads is worse than a failure

`/api/admin/content-review` returned `{ success: true, warning: "Published, but
the poster could not be generated: …" }` when a dars was approved but its poster
failed to store. The admin client checked `if (!res.ok)` — a 200 passes — called
`onDone()`, and **never read `warning`**. The reviewer saw success. The first
dars published in four months has no stored poster and nobody was told.

A failure at least stops someone. A success-with-an-ignored-warning teaches
everyone that the operation worked. It is the more dangerous of the two.

Rule: a partial success is a failure until the caller has proven it surfaced the
partial part. If a route can return `warning`, `notified: false`, `sent`, or any
"it mostly worked" field, the client must render it — or the route should not
pretend it was a 200.

### The three found by audit (29 Sep)

1. `admin/content-review` — poster `warning` ignored client-side. (fixed here)
2. `student/assignments/[id]` — returns `notified: false` when the teacher
   notification fails to write; the student UI ignores it, so a completed
   assignment silently never reaches the teacher. **Live since Phase 7.**
3. `notifications/send` — reports `sent: <intended count>` while the actual
   sends sit in a swallowed try/catch; returns `success: true` even if every
   send failed. (dead route, deleted here)

## Setting an environment variable changes nothing until the next deploy

Three times now a secret was changed in Vercel and did not take effect until a
redeploy: the Anthropic key (changed 18 Sep, live 21 Sep), the Resend key, and
`ADMIN_SECRET` (set to a random value 30 Sep, still not live — production runs
the old value until the next deploy).

The gap between "I changed it" and "it took effect" is where people stop
believing the change happened. After changing any environment variable, either
redeploy or state plainly that it is not yet live. A changed-but-not-deployed
secret is a change that has not happened.

## A check that cannot tell "destroyed" from "hidden" is not a check

Reading a Vercel env var back through the API returns an empty value for any
`sensitive`-typed variable — whether it is genuinely empty or merely hidden.
On 30 Sep this reported `len=0` for three secrets I had just set to real
values, and would have reported the identical `len=0` had I actually blanked
them (which, minutes earlier, I had). The read cannot distinguish the two
states it most needs to, so it proves nothing. The only trustworthy check was
behavioural: does the key authenticate, does the send deliver.

## This platform cannot audit its own secrets for weak patterns

Every secret is stored `sensitive` or `encrypted`, so their values cannot be
read back — not by an operator, not by a script. That privacy is correct, and
its cost is that there is **no way to scan the project's secrets for weak or
predictable values**. `ADMIN_SECRET` was `tibyaan-admin-secret-2024` — brand +
role + year — and nothing in the system could have flagged it; it was caught
only because a human recognised it.

What it would take to close this, none of which exists today:
- a written generation standard (e.g. `openssl rand -hex 32` for every secret
  that is not an externally-issued key), enforced at set time rather than
  audited after;
- a rotation record — when each secret was last changed and by whom — kept
  outside the secret store, since the values themselves are deliberately
  unreadable;
- for externally-issued keys (Anthropic, Resend, Stripe), a note of which
  account/workspace each belongs to, because the value cannot be inspected to
  tell (the Resend 403 was exactly this: the key belonged to a different
  account than the verified domain).

Until those exist, the honest position is the one taken on 30 Sep: *I cannot
see the values, so I will not claim they are safe.*

## Two hand-typed lists of the same thing, disagreeing (Phase 6)

The Hifz tracker held the 114 surah names twice: once in the entry-form dropdown
and once (implicitly, by number) elsewhere, both typed by hand. They had drifted
apart — the form said "Ta-Ha", "As-Saf", "Aal-e-Imran" where the other spelling
was "Taha", "As-Saff", "Aal-E-Imran". A student would pick a name on the form and
see a different spelling of it on the tracker, with nothing flagging that the two
were meant to be the same list.

This is the silent-failure pattern applied to data rather than control flow: two
sources of the same truth, no check that they agree, so they diverge and only a
reader notices. The fix is the general one — a single source. Both now derive
from src/lib/quran/metadata.ts, which additionally proves itself arithmetically
at import, so the names, the counts and the juz boundaries cannot drift from each
other or from 6236.

Rule: the same fact must live in exactly one place. A second hand-typed copy of
anything — surah names, a fee, a status enum, a figure — is a divergence waiting
to happen, and nothing will report it when it does.
