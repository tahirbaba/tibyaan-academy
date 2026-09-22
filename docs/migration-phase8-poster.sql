-- =============================================================================
-- Phase 8 — daily_dars: stored poster                          (NOT YET RUN)
-- =============================================================================
-- Adds one nullable column. Nothing is dropped, no enum is altered, no
-- existing value is touched, no dars text is read or modified.
--
--   poster_url  public URL of the poster generated when the dars was approved
--               (NULL = not generated yet; the page falls back to the
--               on-demand /api/og/dars/[slug] route, which still works)
--
-- A URL rather than a path here, unlike the Phase 7 attachment column: the
-- poster bucket is public on purpose. It is the social preview image, so
-- Twitter, WhatsApp and Facebook must be able to fetch it with no credential,
-- and you asked to be able to download it by hand from a plain URL.
--
-- Idempotent: IF NOT EXISTS, so a second run changes nothing.
-- One transaction: any error rolls it back.
--
-- Run with:
--   psql "$DIRECT_URL" --single-transaction -v ON_ERROR_STOP=1 \
--        -f docs/migration-phase8-poster.sql
--
-- Do NOT paste into a SQL editor that autocommits statement by statement.
-- =============================================================================

ALTER TABLE "public"."daily_dars"
  ADD COLUMN IF NOT EXISTS "poster_url" text;

-- ── Verification ────────────────────────────────────────────────────────────
-- Expect exactly one row: poster_url | text | YES
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'daily_dars'
  AND column_name = 'poster_url';
