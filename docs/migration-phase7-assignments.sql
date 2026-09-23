-- =============================================================================
-- Phase 7 — tests_assignments: completion and attachment      (BRANCH-VERIFIED)
--
-- VERIFIED 2026-09-24 on a Neon branch cloned from production, with real
-- data, run twice: second pass changed nothing. Approved for production,
-- but only alongside the deploy and only after a fresh verified backup.
-- Still NOT RUN on production.
-- =============================================================================
-- Adds two columns to an existing table. Nothing is dropped, nothing is
-- rewritten, no enum is altered, no existing value is touched.
--
--   completed_at     when the student marked the item done (NULL = not done)
--   attachment_path  storage object path for the teacher's optional file
--                    (NULL = no attachment). A path, not a URL: the bucket is
--                    private and the app signs a short-lived URL on read, so a
--                    stored absolute URL would go stale and would also let
--                    anyone holding it bypass the auth check.
--
-- Idempotent: every statement is IF NOT EXISTS, so a second run changes
-- nothing. Verify that by running it twice and diffing the schema.
--
-- One transaction: any error rolls all of it back.
--
-- Run with:
--   psql "$DIRECT_URL" --single-transaction -v ON_ERROR_STOP=1 \
--        -f docs/migration-phase7-assignments.sql
--
-- Do NOT paste this into a SQL editor that autocommits statement by statement.
-- The Phase 3 replay proved that path silently downgraded enum columns to text.
-- =============================================================================

-- ── 1. Completion timestamp ─────────────────────────────────────────────────
-- The status enum already carries 'submitted'; this records *when*, which the
-- teacher's completed/not-completed view needs and the enum cannot express.
-- No new enum value is added: 'pending' -> 'submitted' is the whole change.
ALTER TABLE "public"."tests_assignments"
  ADD COLUMN IF NOT EXISTS "completed_at" timestamptz;

-- ── 2. Optional teacher attachment ──────────────────────────────────────────
ALTER TABLE "public"."tests_assignments"
  ADD COLUMN IF NOT EXISTS "attachment_path" text;

-- ── 3. Backfill ─────────────────────────────────────────────────────────────
-- Rows already marked 'submitted' or 'graded' before this migration have no
-- recorded completion time, and inventing one would be a fabricated timestamp
-- on a live record. They are left NULL; the UI reads NULL as "completed, time
-- not recorded" rather than as "not completed", so no row silently reverts to
-- pending. This statement is deliberately a no-op and is here to say so.

-- ── 4. Verification ─────────────────────────────────────────────────────────
-- Expect exactly two rows: completed_at | timestamptz | YES
--                          attachment_path | text | YES
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tests_assignments'
  AND column_name IN ('completed_at', 'attachment_path')
ORDER BY column_name;
