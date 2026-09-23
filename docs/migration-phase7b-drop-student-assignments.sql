-- =============================================================================
-- Phase 7b — drop the unused student_assignments table        (NOT YET RUN)
-- =============================================================================
-- student_assignments backed three pages and one API route that were never
-- linked from any sidebar. Verified empty in production on 2026-09-23:
--
--     student_assignments = 0 rows
--     tests_assignments   = 1 row   (the live table, kept)
--
-- The code that referenced it is removed in the same commit as this file.
--
-- This is the only migration in this set that destroys anything, so unlike the
-- others it refuses to run unless the table is still empty. If a row has
-- appeared since the count above — someone reaching the unlinked page by URL,
-- or a restore — the whole transaction aborts and nothing is dropped. Re-check
-- by hand in that case; do not edit this guard away.
--
-- Idempotent: if the table is already gone the DO block does nothing.
-- One transaction: any error rolls it back.
--
-- Run with:
--   psql "$DIRECT_URL" --single-transaction -v ON_ERROR_STOP=1 \
--        -f docs/migration-phase7b-drop-student-assignments.sql
--
-- Do NOT paste into a SQL editor that autocommits statement by statement.
-- =============================================================================

DO $$
DECLARE
  n bigint;
BEGIN
  IF to_regclass('public.student_assignments') IS NULL THEN
    RAISE NOTICE 'student_assignments does not exist; nothing to do.';
    RETURN;
  END IF;

  EXECUTE 'SELECT count(*) FROM public.student_assignments' INTO n;

  IF n <> 0 THEN
    RAISE EXCEPTION
      'REFUSING TO DROP: student_assignments holds % row(s). It was empty when '
      'this migration was written. Investigate where those rows came from '
      'before dropping anything.', n;
  END IF;

  DROP TABLE public.student_assignments;
  RAISE NOTICE 'student_assignments dropped (was empty).';
END $$;

-- ── Verification ────────────────────────────────────────────────────────────
-- Expect: student_assignments_gone = true, tests_assignments_kept = true
SELECT
  to_regclass('public.student_assignments') IS NULL     AS student_assignments_gone,
  to_regclass('public.tests_assignments')   IS NOT NULL AS tests_assignments_kept;
