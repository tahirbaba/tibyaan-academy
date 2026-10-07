# Phase 13 — Storage (R2 + YouTube + recordings)

**Branch:** `phase-13-storage`. This completes the usable part of Phase 9 of
`Phase_20.md`. Everything type-checks; no file was deleted from Supabase Storage.

## What changed (code, in this preview)

- **R2 S3 client** (`src/lib/r2/s3-client.ts`) over `@aws-sdk/client-s3`: upload,
  byte-size head, public-URL builder, and short-lived presigned PUT/GET. **Two
  buckets kept separate in code** with the "never merge" reason in a comment.
- **Build guard** (`next.config.ts` → `assertR2Config`): the production build
  fails if any of the six R2 vars is missing or blank — same rule as
  `NEXT_PUBLIC_SITE_URL`. It checks presence, not correctness (see the R2 check).
- **Class recordings → private `tibyaan-recordings`.** Upload is a presigned PUT;
  the row stores the object key (not a URL); playback is a presigned GET valid
  ~15 min, fetched at click time via `/api/recordings/[id]/play` (auth: the
  student, that class's teacher, or an admin). Expiry is **3 days** (was 7),
  matching the Cloudflare lifecycle. The screen stops offering a recording ~6h
  **before** the 72h deletion and shows "no longer available" from the
  recording's own date — it never hands out a link to a file about to be deleted.
  Old Supabase recording URLs still play (the route redirects to them).
- **New dars posters → public `tibyaan-files/posters/`.** Existing posters keep
  their old URLs; the on-demand `/api/og` fallback still covers any null. No copy.
- **Teacher videos → YouTube links.** No file upload. Teacher pastes a link
  (max 10/teacher, enforced in the DB), admin can add on a teacher's behalf, the
  same pending→approved queue, approved videos embed on the home page (the Phase
  4 `YouTubeEmbed`). **Duration is not enforced** — it cannot be read without the
  YouTube Data API; the 10-minute guidance is the admin's eye at approval, said
  so on screen.
- **Recordings cleanup cron deleted** (route, `vercel.json` entry, and
  `RECORDINGS_CLEANUP_ENABLED`). Cloudflare's lifecycle rule replaces it.

## R2 verification (present AND correct)

`node --env-file=.env.local scripts/r2-check.mjs`, run 7 Oct 2026, **PASSED**:

| Bucket | Round-trip |
|---|---|
| `tibyaan-files` | wrote 41 B → R2 returned size 41, etag `db518b3d…` → read-back matched → deleted |
| `tibyaan-recordings` | wrote 41 B → R2 returned size 41, etag `407806ab…` → read-back matched → deleted |

(ListBuckets returns AccessDenied — expected for a correctly bucket-scoped token;
the round-trip is the real proof.)

## What did NOT move this round — deferred by the owner, awaiting your word

- **Syllabus images** — 110 files, ~28 MB, in the **repo** `/public`
  (`Aalim Course` 28, `Arabic Language` 11, `Nazra` 11, `Quran Parah Images` 60).
  **Proven live on production** (all four course pages return 206 + `image/*`), so
  moving them is a 28 MB deploy trim, not a fix. Deferred to a later round to avoid
  risking the images in this single testing session. No reads were switched;
  `course-syllabus.ts` still points at `/public`.
- **PDFs** — in **Supabase `course-pdfs` only** (0 in the repo; referenced via
  `sbPdf()`). Moving them needs the Supabase key, so deferred to its own pass.
- **Existing dars posters** — remain in Supabase; only *new* posters write to R2.

## Object counts / bytes

**Nothing was bulk-migrated this round** (the migrations above are deferred), so
there is no before/after delta to report. R2 currently holds only the Phase 13
check's (now-deleted) test objects; it fills with new recordings and new posters
as they are created after deploy. The deferred image migration's figures (110
files / 28 MB from the repo) are recorded above for the next round.

## Still in Supabase Storage, nothing deleted

`videos`, `recordings`, `course-pdfs`, `avatars`, `dars-posters` buckets and
their existing objects remain untouched, awaiting your separate instruction.
