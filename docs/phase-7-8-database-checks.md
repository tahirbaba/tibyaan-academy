# Phase 7 & 8 — database steps, run by you, no credential shared

Two things need the database. Neither needs a credential to leave your hands.

---

## 1. Row counts: did the orphaned assignment code ever write anything?

Read-only. Neon console → your project → **SQL Editor** → paste and run:

```sql
-- Does the orphaned table exist at all, and does it hold anything?
SELECT
  to_regclass('public.student_assignments') IS NOT NULL AS student_assignments_exists,
  to_regclass('public.tests_assignments')   IS NOT NULL AS tests_assignments_exists;
```

If `student_assignments_exists` comes back **false**, stop there — the orphaned
pages have been querying a table that does not exist, every call 500s, and
nothing was ever written. That answers the question on its own.

If it comes back **true**, run this as well:

```sql
SELECT 'student_assignments' AS table_name, count(*) AS rows FROM student_assignments
UNION ALL
SELECT 'tests_assignments',                 count(*)          FROM tests_assignments;
```

Read me both numbers. That tells us whether the orphaned code ever wrote real
work, which decides whether it can be deleted or has to be migrated first.

---

## 2. Migration test, without handing over a credential

Use a **Neon branch**. A branch is a copy-on-write clone of production data —
real rows, isolated, free to throw away — and it never leaves your account.

Neon console → **Branches** → **Create branch**, from `main`/production,
name it `phase-7-8-migration-test`.

Then, with that branch selected in the SQL Editor:

**Step 1 — take the "before" reading.**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (   (table_name = 'tests_assignments' AND column_name IN ('completed_at','attachment_path'))
       OR (table_name = 'daily_dars'        AND column_name  = 'poster_url'))
ORDER BY table_name, column_name;
```

Expect **0 rows** — none of the columns exist yet.

**Step 2 — run the migrations, first pass.**
Paste the contents of `docs/migration-phase7-assignments.sql`, run it.
Then `docs/migration-phase8-poster.sql`, run it.
Each ends with its own verification SELECT; note what each prints.

**Step 3 — run both again, second pass.** Same two files, unchanged.
They must succeed and change nothing. Every statement is `IF NOT EXISTS`.

**Step 4 — take the "after" reading.** Run the Step 1 query again.
Expect exactly **3 rows**:

| table_name | column_name | data_type | is_nullable |
|---|---|---|---|
| daily_dars | poster_url | text | YES |
| tests_assignments | attachment_path | text | YES |
| tests_assignments | completed_at | timestamp with time zone | YES |

**Step 5 — prove the data survived.** On the same branch:

```sql
SELECT count(*) AS assignments, count(completed_at) AS with_completion FROM tests_assignments;
SELECT count(*) AS dars, count(poster_url) AS with_poster FROM daily_dars;
```

Both new columns must be all-NULL (`with_completion` and `with_poster` = 0) and
the row counts must match production. Nothing is backfilled and nothing is
rewritten — that is the intended result, not a problem.

Paste me the output of Steps 2, 3 and 4. If the second pass is clean and the
column list matches, the migration is proven and I will ask for your approval
to run exactly the same two files against production.

**Delete the test branch afterwards.** Neon console → Branches → delete.

---

## Note on the backup

The Phase 3 rule was: fresh verified backup before production is touched.
A Neon branch is not a backup — it shares storage with its parent. Before the
production run, take a real one:

Neon console → **Backups** (or `pg_dump` from your own machine, whichever you
used in Phase 3), confirm the file size is non-zero, and keep it until the
migration has been verified on production.
