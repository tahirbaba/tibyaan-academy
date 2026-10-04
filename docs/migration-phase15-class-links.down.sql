-- Phase 15 — class_links (DOWN)
-- Reverses the up migration. Dropping the table removes its constraint and
-- indexes with it. This destroys every issued class link; only run it to roll
-- Phase 15 back, and take a backup first if any links have been issued.

DROP TABLE IF EXISTS class_links;
