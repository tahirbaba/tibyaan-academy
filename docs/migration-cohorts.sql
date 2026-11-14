-- =============================================================================
-- Cohorts — paid, recurring group classes               (NOT BRANCH-VERIFIED)
--
-- STATUS, stated plainly:
--   * Written 2026-11-14.
--   * Run TWICE on a throwaway local PostgreSQL 16 with a stand-in "users"
--     table: first run created everything, second run changed nothing, and the
--     seat-limit statements were exercised against it.
--   * NOT yet run on a Neon branch cloned from production. That is still to do
--     (working-agreement rule 5) and is the owner's step — see "How to run".
--   * NOT RUN on production.
-- =============================================================================
-- Purely additive:
--   + 1 enum   cohort_enrollment_status
--   + 2 tables cohorts, cohort_enrollments
--   + 3 indexes on cohort_enrollments
-- No existing table, column, enum or row is altered, dropped or rewritten.
-- Nothing that existed before this migration reads the new tables, so the old
-- code keeps working whether or not this has been run. The NEW code (group
-- class pages, cohort checkout) needs it: without it those pages fail loudly
-- with "relation cohorts does not exist" — they do not show an empty list.
--
-- Pricing settings need NO migration: they are stored as one row in the
-- existing admin_settings table (key = 'pricing_config').
--
-- Idempotent: every statement is IF NOT EXISTS or guarded, so a second run
-- changes nothing.
--
-- One transaction: any error rolls all of it back.
--
-- How to run (in this order):
--   1. Neon console -> create a branch from production (e.g. "cohorts-check").
--   2. Run this file against the BRANCH, twice:
--        psql "$BRANCH_DIRECT_URL" --single-transaction -v ON_ERROR_STOP=1 \
--             -f docs/migration-cohorts.sql
--      The second run must print the same verification rows and no errors.
--   3. Point the Vercel PREVIEW environment's DATABASE_URL at that branch and
--      test the preview (the test checklist in the PR).
--   4. When approved: take a fresh production backup and restore-check it
--      (docs/phase-7-8-database-checks.md), then run this file against
--      production WITH the deploy — never on its own, never after it.
--        psql "$DIRECT_URL" --single-transaction -v ON_ERROR_STOP=1 \
--             -f docs/migration-cohorts.sql
--
-- Do NOT paste this into a SQL editor that autocommits statement by statement.
-- Do NOT use `drizzle-kit push` or `drizzle-kit migrate` for this: the drizzle
-- snapshot in drizzle/meta is from migration 0002 and knows nothing about the
-- tables added by hand since, so drizzle would try to re-create them.
--
-- Rollback (only while both tables are still empty):
--   DROP TABLE IF EXISTS cohort_enrollments;
--   DROP TABLE IF EXISTS cohorts;
--   DROP TYPE  IF EXISTS cohort_enrollment_status;
-- =============================================================================

-- ── 1. Enrollment status ────────────────────────────────────────────────────
--   pending     checkout started; seat held until seat_held_until
--   trial       one free trial class; seat held until that class ends
--   active      subscription paid
--   past_due    a renewal failed; Stripe is retrying
--   cancelled   subscription ended, or the student left
--   waitlisted  the cohort was full
DO $$ BEGIN
  CREATE TYPE "public"."cohort_enrollment_status" AS ENUM
    ('pending', 'trial', 'active', 'past_due', 'cancelled', 'waitlisted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ── 2. cohorts ──────────────────────────────────────────────────────────────
-- weekdays_utc: UTC weekdays, 0 = Sunday … 6 = Saturday.
-- start_time_utc: "HH:MM" in UTC. Pages convert to the visitor's time zone.
-- There is deliberately NO seats-taken / seats-remaining column: it is always
-- counted from cohort_enrollments so it cannot drift from the roster.
-- teacher_id is ON DELETE RESTRICT: deleting a teacher must not silently
-- delete a class that students are paying for.
CREATE TABLE IF NOT EXISTS "public"."cohorts" (
  "id"               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug"             varchar(255) NOT NULL,
  "teacher_id"       uuid NOT NULL,
  "title_en"         varchar(500) NOT NULL,
  "title_ur"         varchar(500),
  "title_ar"         varchar(500),
  "title_fr"         varchar(500),
  "title_id"         varchar(500),
  "description_en"   text,
  "description_ur"   text,
  "description_ar"   text,
  "description_fr"   text,
  "description_id"   text,
  "weekdays_utc"     smallint[] NOT NULL,
  "start_time_utc"   varchar(5) NOT NULL,
  "session_minutes"  integer NOT NULL DEFAULT 60,
  "start_date"       date NOT NULL,
  "duration_weeks"   integer NOT NULL,
  "monthly_fee"      numeric(10, 2) NOT NULL,
  "currency"         varchar(3) NOT NULL DEFAULT 'USD',
  "max_seats"        integer NOT NULL DEFAULT 30,
  "enrollment_open"  boolean NOT NULL DEFAULT true,
  "trial_enabled"    boolean NOT NULL DEFAULT true,
  "is_published"     boolean NOT NULL DEFAULT false,
  "meeting_link"     text,
  "created_at"       timestamptz NOT NULL DEFAULT now(),
  "updated_at"       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "cohorts_slug_unique" UNIQUE ("slug"),
  CONSTRAINT "cohorts_teacher_id_users_id_fk"
    FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT,
  CONSTRAINT "cohorts_fee_positive" CHECK ("monthly_fee" > 0),
  CONSTRAINT "cohorts_seats_positive" CHECK ("max_seats" > 0),
  CONSTRAINT "cohorts_weeks_positive" CHECK ("duration_weeks" > 0),
  CONSTRAINT "cohorts_time_format" CHECK ("start_time_utc" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  CONSTRAINT "cohorts_weekdays_valid" CHECK (
    cardinality("weekdays_utc") BETWEEN 1 AND 7
    AND "weekdays_utc" <@ ARRAY[0,1,2,3,4,5,6]::smallint[]
  )
);

-- ── 3. cohort_enrollments ───────────────────────────────────────────────────
-- One row per (cohort, student), reused across pending -> active -> cancelled.
-- trial_class_at is set once and never cleared: one free trial per cohort.
-- monthly_fee/currency record what THIS student signed up at; a later change
-- to the cohort's fee does not alter them.
-- cohort_id is ON DELETE RESTRICT: a cohort with enrollments cannot be deleted
-- out from under paying students.
CREATE TABLE IF NOT EXISTS "public"."cohort_enrollments" (
  "id"                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "cohort_id"                   uuid NOT NULL,
  "student_id"                  uuid NOT NULL,
  "status"                      "public"."cohort_enrollment_status" NOT NULL,
  "seat_held_until"             timestamptz,
  "trial_class_at"              timestamptz,
  "stripe_customer_id"          varchar(255),
  "stripe_subscription_id"      varchar(255),
  "stripe_checkout_session_id"  varchar(255),
  "monthly_fee"                 numeric(10, 2),
  "currency"                    varchar(3),
  "current_period_end"          timestamptz,
  "cancel_at_period_end"        boolean NOT NULL DEFAULT false,
  "waitlisted_at"               timestamptz,
  "activated_at"                timestamptz,
  "cancelled_at"                timestamptz,
  "created_at"                  timestamptz NOT NULL DEFAULT now(),
  "updated_at"                  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "cohort_enrollments_cohort_id_cohorts_id_fk"
    FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE RESTRICT,
  CONSTRAINT "cohort_enrollments_student_id_users_id_fk"
    FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
);

-- ── 4. Indexes ──────────────────────────────────────────────────────────────
-- The unique index is what makes "one row per student per cohort" true, and
-- what the seat claim's ON CONFLICT relies on.
CREATE UNIQUE INDEX IF NOT EXISTS "cohort_enrollments_cohort_student_uq"
  ON "public"."cohort_enrollments" ("cohort_id", "student_id");
CREATE INDEX IF NOT EXISTS "cohort_enrollments_student_idx"
  ON "public"."cohort_enrollments" ("student_id");
CREATE INDEX IF NOT EXISTS "cohort_enrollments_subscription_idx"
  ON "public"."cohort_enrollments" ("stripe_subscription_id");

-- ── 5. Verification ─────────────────────────────────────────────────────────
-- Expect: cohorts = 27 columns, cohort_enrollments = 18 columns,
--         3 indexes besides the two primary keys and the slug constraint,
--         6 enum labels. Identical output on the second run.
SELECT table_name, count(*) AS columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('cohorts', 'cohort_enrollments')
GROUP BY table_name
ORDER BY table_name;

SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('cohorts', 'cohort_enrollments')
ORDER BY indexname;

SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) AS cohort_enrollment_status
FROM pg_enum
WHERE enumtypid = 'public.cohort_enrollment_status'::regtype;
