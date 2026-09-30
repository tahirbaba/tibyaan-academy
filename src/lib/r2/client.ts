/**
 * Supabase Storage client — replaces Cloudflare R2
 * Uses Supabase Storage with public buckets for video/file hosting
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const VIDEOS_BUCKET = "videos";
const RECORDINGS_BUCKET = "recordings";

function getAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

export function getVideoKey(teacherId: string, videoId: string, ext = "mp4") {
  return `teachers/${teacherId}/${videoId}.${ext}`;
}

export function getThumbnailKey(teacherId: string, videoId: string) {
  return `teachers/${teacherId}/thumbnails/${videoId}.jpg`;
}

export function getRecordingKey(matchId: string, recordingId: string) {
  return `${matchId}/${recordingId}.mp4`;
}

export function getPublicUrl(key: string, bucket = VIDEOS_BUCKET) {
  const supabase = getAdminClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Generate a presigned URL for direct browser upload to Supabase Storage.
 * Auto-creates the bucket if it doesn't exist.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600,
  bucket = VIDEOS_BUCKET,
  bucketOptions: BucketOptions = {}
): Promise<string> {
  const supabase = getAdminClient();

  // Ensure bucket exists before generating a signed URL
  await ensureBucket(bucket, bucketOptions);

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(key, { upsert: true });

  if (error) throw new Error(`Failed to create upload URL: ${error.message}`);
  return data.signedUrl;
}

/**
 * Generate a presigned URL for downloading/viewing a private object
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600,
  bucket = VIDEOS_BUCKET
): Promise<string> {
  const supabase = getAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(key, expiresIn);

  if (error) throw new Error(`Failed to create download URL: ${error.message}`);
  return data.signedUrl;
}

/**
 * Ensure a storage bucket exists (creates if missing)
 */
export type BucketOptions = {
  /**
   * Public buckets serve every object to anyone holding the URL, with no auth
   * check at all. Only pass true for content that is genuinely public.
   * Defaults to true to preserve the behaviour of the buckets that already
   * exist (videos, recordings, course-pdfs, avatars) — changing those here
   * would not alter the live buckets anyway, since this only runs on create.
   */
  publicBucket?: boolean;
  fileSizeLimit?: number;
};

async function ensureBucket(bucket: string, options: BucketOptions = {}) {
  const supabase = getAdminClient();
  const { data } = await supabase.storage.getBucket(bucket);
  if (data) return;

  // createBucket's error used to be discarded, so a bucket that failed to
  // create looked created — and the upload then failed with the confusing
  // "Bucket not found", far from the real cause. The error is surfaced now.
  // If the reason is that the service role cannot create buckets, the bucket
  // must be made once by hand in Supabase; this at least says so plainly.
  const { error } = await supabase.storage.createBucket(bucket, {
    public: options.publicBucket ?? true,
    fileSizeLimit: options.fileSizeLimit ?? 524288000, // 500MB
  });

  // "already exists" is not a failure — a concurrent create won the race.
  if (error && !/exist/i.test(error.message)) {
    throw new Error(
      `Could not create storage bucket "${bucket}": ${error.message}. ` +
        `If this is a permissions error, create the bucket once in the Supabase dashboard.`
    );
  }
}

/**
 * Upload a file to Supabase Storage from the server
 */
export async function uploadToStorage(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  bucket = VIDEOS_BUCKET,
  bucketOptions: BucketOptions = {}
): Promise<string> {
  const supabase = getAdminClient();

  // Auto-create bucket if it doesn't exist. bucketOptions matters here: the
  // default 500MB fileSizeLimit exceeds the Supabase project's global limit, so
  // an auto-create with the default is rejected ("object exceeded the maximum
  // allowed size") — which is why every bucket so far was made by hand. A
  // caller uploading small files should pass a small limit so the create
  // succeeds.
  await ensureBucket(bucket, bucketOptions);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(key, body, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return getPublicUrl(key, bucket);
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromStorage(key: string, bucket = VIDEOS_BUCKET) {
  const supabase = getAdminClient();
  const { error } = await supabase.storage
    .from(bucket)
    .remove([key]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

// Backward-compatible aliases
export const uploadToR2 = uploadToStorage;
export const deleteFromR2 = deleteFromStorage;
