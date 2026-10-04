-- Phase 15 — class_links: one meeting link per teacher per day (PKT date).
--
-- NEW TABLE ONLY. No existing table is touched. Run the UP block in Neon's SQL
-- Editor, after a verified backup. Idempotent: safe to run more than once.
--
-- What it builds:
--   * class_links, with teacher_id -> users(id) ON DELETE CASCADE (teachers are
--     rows in `users`; there is no separate teachers table) and created_by ->
--     users(id) ON DELETE SET NULL (removing an admin never deletes their links).
--   * a (teacher_id, valid_on) UNIQUE constraint — one link per teacher per day,
--     in the database, not only in the form.
--   * a CHECK that meeting_url is non-empty — text NOT NULL still accepts "", and
--     an empty link would show a Join button that goes nowhere ("empty" is not
--     "absent").
--   * a BEFORE UPDATE trigger that sets updated_at = now() on every update, by
--     any write path — so the column always reflects the real last-change time,
--     not a value that never changes.
--
-- Verify by eye: each statement reports success and the final SELECT returns one
-- row. If ANY statement errors, stop — do not treat a partial run as done.

-- ========================= UP (run this) =========================
CREATE TABLE IF NOT EXISTS class_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meeting_url text NOT NULL CHECK (length(trim(meeting_url)) > 0),
  valid_on    date NOT NULL,
  created_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'class_links_teacher_valid_on_unique'
  ) THEN
    ALTER TABLE class_links
      ADD CONSTRAINT class_links_teacher_valid_on_unique UNIQUE (teacher_id, valid_on);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS class_links_valid_on_idx ON class_links (valid_on);
CREATE INDEX IF NOT EXISTS class_links_teacher_idx  ON class_links (teacher_id);

CREATE OR REPLACE FUNCTION class_links_touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS class_links_set_updated_at ON class_links;
CREATE TRIGGER class_links_set_updated_at
  BEFORE UPDATE ON class_links
  FOR EACH ROW EXECUTE FUNCTION class_links_touch_updated_at();

-- Should return exactly one row:
SELECT table_name FROM information_schema.tables WHERE table_name = 'class_links';

-- ================= DOWN (rollback ONLY — destroys all issued links) =================
-- Run these three only to undo Phase 15; take a backup first if any links exist.
-- DROP TRIGGER IF EXISTS class_links_set_updated_at ON class_links;
-- DROP FUNCTION IF EXISTS class_links_touch_updated_at();
-- DROP TABLE IF EXISTS class_links;
