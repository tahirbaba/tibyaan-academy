// Phase 13 — class-recording lifetime and private-playback rules.
//
// Recordings are student class videos. They live in the PRIVATE
// tibyaan-recordings R2 bucket, whose Cloudflare lifecycle deletes each object 3
// days (72h) after it is created. Two rules keep the screen honest about that:
//
//   1. Playback is a presigned URL valid for MINUTES, fetched fresh on click —
//      never a public link. Private only means something if the link is short.
//
//   2. The screen stops offering a recording a few hours BEFORE the 72h deletion,
//      not at the exact moment. Cloudflare deletes only at or after 72h, so
//      showing it playable until 66h guarantees the object still exists when a
//      student clicks — the screen never promises a file storage has removed.

export const RECORDING_STORAGE_HOURS = 72; // Cloudflare lifecycle on the bucket
export const RECORDING_SCREEN_MARGIN_HOURS = 6; // hide this long before deletion
export const RECORDING_PLAY_URL_TTL_SECONDS = 15 * 60; // 15 minutes
export const RECORDING_UPLOAD_URL_TTL_SECONDS = 60 * 60; // 1h to finish uploading

/** The moment the screen should stop offering the recording (before deletion). */
export function recordingVisibleUntil(expiresAt: Date): Date {
  return new Date(expiresAt.getTime() - RECORDING_SCREEN_MARGIN_HOURS * 3_600_000);
}

/** Is the recording still safe to offer? false once inside the pre-deletion margin. */
export function isRecordingPlayable(expiresAt: Date, now: Date = new Date()): boolean {
  return now.getTime() < recordingVisibleUntil(expiresAt).getTime();
}

/**
 * New R2 recordings store the object KEY in recording_url; old Supabase rows
 * stored a full public URL. Detect which, so we presign a key but pass an
 * existing URL through untouched (old rows keep working; nothing is deleted).
 */
export function isStoredR2Key(recordingUrl: string): boolean {
  return !/^https?:\/\//i.test(recordingUrl);
}
