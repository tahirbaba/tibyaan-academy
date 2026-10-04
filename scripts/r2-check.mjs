// Phase 13 — prove the R2 connection and that the buckets are REAL before any
// file is migrated. The build guard only checks the six variables EXIST; it
// cannot see a one-letter typo in a bucket name. This writes a tiny file to
// each bucket, reads it back, prints exactly what R2 returned, then removes it.
//
// Run:  node --env-file=.env.local scripts/r2-check.mjs
//
// It changes nothing permanent: each test object is deleted at the end. If any
// step fails it says which, loudly, and exits non-zero — no false green.

import {
  S3Client,
  ListBucketsCommand,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

function req(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`FAIL: ${name} is empty. Paste it into .env.local.`);
    process.exit(1);
  }
  return v;
}

const ACCOUNT = req("R2_ACCOUNT_ID");
const FILES = req("R2_BUCKET_FILES");
const RECORDINGS = req("R2_BUCKET_RECORDINGS");

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: req("R2_ACCESS_KEY_ID"),
    secretAccessKey: req("R2_SECRET_ACCESS_KEY"),
  },
});

let failed = false;

async function listBuckets() {
  const out = await s3.send(new ListBucketsCommand({}));
  const names = (out.Buckets ?? []).map((b) => b.Name);
  console.log("Buckets R2 reports for this token:");
  names.forEach((n) => console.log("   - " + n));
  for (const want of [FILES, RECORDINGS]) {
    if (names.includes(want)) console.log(`   OK: "${want}" exists`);
    else {
      console.error(`   FAIL: "${want}" is NOT in the list above — check the name for a typo.`);
      failed = true;
    }
  }
}

async function roundTrip(bucket) {
  const key = `_r2-check/connection-test-${Date.now()}.txt`;
  const body = `tibyaan r2 check ${new Date().toISOString()}`;
  try {
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: "text/plain" }));
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    const got = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const readBack = await got.Body.transformToString();
    const ok = readBack === body;
    console.log(`\nBucket "${bucket}":`);
    console.log(`   wrote ${Buffer.byteLength(body)} bytes to ${key}`);
    console.log(`   R2 returned size: ${head.ContentLength}, etag: ${head.ETag}`);
    console.log(`   read-back matches what we wrote: ${ok ? "YES" : "NO"}`);
    if (!ok) failed = true;
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log(`   test object deleted`);
  } catch (e) {
    console.error(`\nBucket "${bucket}": FAIL — ${e.name}: ${e.message}`);
    failed = true;
  }
}

await listBuckets();
await roundTrip(FILES);
await roundTrip(RECORDINGS);

console.log("\n" + (failed ? "R2 CHECK FAILED — do not migrate yet." : "R2 CHECK PASSED — connection and both buckets are real."));
process.exit(failed ? 1 : 0);
