# Schema changes and migrations

**The rule: a schema change and its migration ship together. Always.**

Adding a column to `src/lib/db/schema.ts` is not a local edit. Drizzle builds
its SQL from that file, so the moment a column exists there, queries start
asking the database for it. If the database has not been migrated yet, Postgres
rejects the **entire query** — not just that column — with

```
ERROR 42703: column "<name>" does not exist
```

and every page that runs that query fails.

---

## What this cost, so it is not repeated

**September 2026.** `poster_url` was added to the `daily_dars` schema in one
commit and its migration was written but, correctly, not run yet — it was
waiting for the deploy. The code deployed to preview without it. Result:

- every `/{locale}/dars/[slug]` page returned **500**, in all five locales
- `/{locale}/dars` returned **200 with "No dars posts yet"** while 55
  published dars sat in the table
- `/api/admin/content-review` would have broken the approval queue itself

One nullable column nobody had written a value to yet took out the entire
public dars section. Had it reached production, Google would have crawled it.

The column was fine. The migration was fine. **The ordering was the fault.**

---

## The shape to avoid

```ts
// DANGEROUS on any table whose schema may be ahead of the database
const rows = await db.select().from(dailyDars).where(...);
```

A bare `select()` asks for **every column in the schema**, including ones added
five minutes ago that no migration has created. It is the widest possible
blast radius for the smallest possible change.

```ts
// Safe: you get exactly the columns you name
const rows = await db
  .select({ slug: dailyDars.slug, titleEn: dailyDars.titleEn })
  .from(dailyDars);
```

Named columns are also better for a second reason: `select()` on a `users` join
was handing students their teacher's email address, because nobody had chosen
what to send.

---

## What to do, in order

1. **Write the migration first**, in `docs/`, idempotent, one transaction. See
   `docs/migration-phase7-assignments.sql` for the shape.
2. **Verify it on a Neon branch** cloned from production, with real data, run
   **twice** — the second pass must change nothing.
3. **Only then** add the column to `schema.ts`.
4. **Deploy and migrate together.** The migration runs before or with the
   deploy, never after, and never on its own.

If steps 3 and 4 cannot be simultaneous — a preview, a staged rollout, a
rollback that leaves old code running against a new database — then the code
must tolerate the column being absent. See below.

---

## Tolerating a column that may not exist yet

`src/lib/db/dars-queries.ts` is the worked example. It lists every column
explicitly, and if a column named in `RECOVERABLE_COLUMNS` is missing it
retries without it and reads that field as `null`.

Three things make it safe rather than a way of hiding schema drift:

- **Only listed columns are recoverable.** Any other missing column still
  throws. This survives a half-landed deploy of one known-optional field; it is
  not a blanket `catch`.
- **A recoverable column must be nullable, and its absence must degrade one
  feature rather than a page.** `poster_url` qualifies: no stored poster means
  the page falls back to rendering one on demand, which is what a dars approved
  before posters existed already does.
- **It alerts.** Degrading quietly is the failure mode this whole document
  exists to prevent, so a recovered query emails SUPPORT_EMAIL once per
  process.

This is a safety net for deploy ordering. **It is not a licence to skip the
migration** — without it, the feature never actually works.

---

## Dropping things

A migration that destroys data follows the same rules plus one more: it refuses
to run if its precondition no longer holds. See
`docs/migration-phase7b-drop-student-assignments.sql`, which aborts the whole
transaction if the table it is dropping is no longer empty. Do not edit that
guard away — if it fires, something changed since the migration was written and
that is worth understanding before anything is dropped.

---

## Related

- `docs/silent-failure-sites.md` — the other half of this incident: why the
  list page showed an empty shelf instead of an error, and the 25 places that
  still would.
- `docs/phase-7-8-database-checks.md` — how to verify a migration on a Neon
  branch without handing anyone a production credential.
