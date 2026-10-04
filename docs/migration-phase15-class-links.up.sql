-- Phase 15 — class_links (UP)
-- One meeting link per teacher per day, issued by an admin. New table only;
-- no existing table is touched. Idempotent: safe to run more than once.
-- Run this alongside the Phase 15 deploy, after a verified backup.

CREATE TABLE IF NOT EXISTS class_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meeting_url text NOT NULL,
  valid_on    date NOT NULL,
  created_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- One link per teacher per day, enforced in the database — not only in the form.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'class_links_teacher_valid_on_unique'
  ) THEN
    ALTER TABLE class_links
      ADD CONSTRAINT class_links_teacher_valid_on_unique UNIQUE (teacher_id, valid_on);
  END IF;
END $$;

-- Lookup helpers: a day across teachers (admin screen), and a teacher's links.
CREATE INDEX IF NOT EXISTS class_links_valid_on_idx ON class_links (valid_on);
CREATE INDEX IF NOT EXISTS class_links_teacher_idx  ON class_links (teacher_id);
