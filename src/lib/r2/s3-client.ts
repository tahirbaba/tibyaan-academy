import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 over the S3-compatible API (Phase 13).
 *
 * TWO BUCKETS, NEVER ONE.
 *   - tibyaan-files      — PDFs, images, posters. NO lifecycle rule.
 *   - tibyaan-recordings — class recordings. A 3-day delete lifecycle rule
 *                          lives on the bucket in Cloudflare.
 * They are separate on purpose: a future change to the recordings deletion
 * rule must never be able to reach into the syllabus files. Do not merge them.
 *
 * Required env (all six): a blank value counts as missing. next.config.ts fails
 * the production build if any is missing — the same guard that protects
 * NEXT_PUBLIC_SITE_URL — so this never ships half-configured and silently
 * serving nothing.
 */
function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(
      `${name} is not set. R2 storage requires it; see .env.example and Appendix A1.`
    );
  }
  return v;
}

export function bucketFiles(): string {
  return requireEnv("R2_BUCKET_FILES");
}

export function bucketRecordings(): string {
  return requireEnv("R2_BUCKET_RECORDINGS");
}

let cached: S3Client | null = null;
function client(): S3Client {
  if (cached) return cached;
  cached = new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
  return cached;
}

/**
 * Public URL for an object in tibyaan-files. Built from NEXT_PUBLIC_R2_PUBLIC_URL
 * (the bucket's public base), so it works in client code too — the value is
 * baked in at build. Only tibyaan-files is public; recordings are served through
 * presigned URLs, never a public link.
 */
export function filePublicUrl(key: string): string {
  const base = requireEnv("NEXT_PUBLIC_R2_PUBLIC_URL").replace(/\/+$/, "");
  return `${base}/${key.replace(/^\/+/, "")}`;
}

/** Upload (or overwrite) an object. */
export async function putObject(
  bucket: string,
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  await client().send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
  );
}

/**
 * Byte size of an object, or null if it is not there. Used to verify a migrated
 * file by byte count — "present" is not "the same file".
 */
export async function objectSize(bucket: string, key: string): Promise<number | null> {
  try {
    const r = await client().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return r.ContentLength ?? null;
  } catch {
    return null;
  }
}

/** Fetch an object's bytes (used by the migration to copy from the old store). */
export async function getObjectBytes(bucket: string, key: string): Promise<Uint8Array | null> {
  try {
    const r = await client().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!r.Body) return null;
    return await r.Body.transformToByteArray();
  } catch {
    return null;
  }
}
