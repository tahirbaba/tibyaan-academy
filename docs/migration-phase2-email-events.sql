-- =============================================================================
-- Phase 2 — email_events: verification/reset mail observability   (NOT YET RUN)
-- =============================================================================
-- One new table and one new enum. Nothing existing is touched.
-- Idempotent (IF NOT EXISTS / guarded enum create); one transaction.
--
-- Run with:
--   psql "$DIRECT_URL" --single-transaction -v ON_ERROR_STOP=1 \
--        -f docs/migration-phase2-email-events.sql
-- Do NOT paste into a SQL editor that autocommits statement by statement.
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE "public"."email_event_status" AS ENUM
    ('sent', 'delivered', 'bounced', 'complained', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "public"."email_events" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"     uuid REFERENCES "public"."users"("id") ON DELETE SET NULL,
  "recipient"   varchar(320) NOT NULL,
  "type"        varchar(50)  NOT NULL,
  "status"      "public"."email_event_status" NOT NULL DEFAULT 'sent',
  "provider_id" varchar(255),
  "detail"      text,
  "created_at"  timestamptz  NOT NULL DEFAULT now(),
  "updated_at"  timestamptz  NOT NULL DEFAULT now()
);

-- Webhook events look up by the provider's message id; the admin view lists by
-- recipient and recency.
CREATE INDEX IF NOT EXISTS "email_events_provider_id_idx" ON "public"."email_events" ("provider_id");
CREATE INDEX IF NOT EXISTS "email_events_recipient_idx"   ON "public"."email_events" ("recipient");
CREATE INDEX IF NOT EXISTS "email_events_created_at_idx"  ON "public"."email_events" ("created_at");

-- Verification: expect the table with 9 columns.
SELECT count(*) AS email_events_columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'email_events';
