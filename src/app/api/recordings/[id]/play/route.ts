import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, classRecordings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { bucketRecordings, presignedGetUrl } from "@/lib/r2/s3-client";
import {
  isRecordingPlayable,
  isStoredR2Key,
  RECORDING_PLAY_URL_TTL_SECONDS,
} from "@/lib/recordings";

/**
 * GET /api/recordings/[id]/play — a fresh, short-lived presigned URL to watch a
 * private class recording. Fetched at click time, not baked into the page, so
 * the link is always minutes-fresh and never public.
 *
 * Only the student it belongs to, the teacher of that class, or an admin may
 * play it. Inside the pre-deletion margin we return 410 and NO url — the screen
 * must not hand out a link to a file the lifecycle is about to delete.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const [rec] = await db
    .select()
    .from(classRecordings)
    .where(eq(classRecordings.id, id))
    .limit(1);
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const allowed =
    rec.studentId === user.id ||
    rec.teacherId === user.id ||
    dbUser?.role === "admin";
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Old rows stored a full (Supabase) URL; redirect straight to it.
  if (!isStoredR2Key(rec.recordingUrl)) {
    return redirectNoStore(rec.recordingUrl);
  }

  // Private R2 recording: refuse once inside the pre-deletion margin — no url.
  if (!isRecordingPlayable(new Date(rec.expiresAt))) {
    return NextResponse.json(
      { error: "This recording is no longer available." },
      { status: 410 }
    );
  }

  const url = await presignedGetUrl(
    bucketRecordings(),
    rec.recordingUrl,
    RECORDING_PLAY_URL_TTL_SECONDS
  );
  return redirectNoStore(url);
}

/** 302 to a presigned URL, never cached — the link is only valid for minutes. */
function redirectNoStore(url: string): NextResponse {
  const res = NextResponse.redirect(url, 302);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
