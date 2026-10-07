import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, classRecordings, teacherStudentMatches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { bucketRecordings, presignedPutUrl } from "@/lib/r2/s3-client";
import {
  RECORDING_STORAGE_HOURS,
  RECORDING_UPLOAD_URL_TTL_SECONDS,
} from "@/lib/recordings";
import { randomUUID } from "crypto";

/**
 * POST /api/recordings/upload
 * Teacher uploads a class recording.
 * Body: { matchId, contentType?, duration? }
 * Returns: { uploadUrl, recordingId, key }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser[0] || !["teacher", "admin"].includes(dbUser[0].role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { matchId, contentType = "video/mp4", duration } = await request.json();

  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }

  // Verify match exists and teacher is part of it
  const match = await db
    .select()
    .from(teacherStudentMatches)
    .where(eq(teacherStudentMatches.id, matchId))
    .limit(1);

  if (!match[0] || (match[0].teacherId !== authUser.id && dbUser[0].role !== "admin")) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const recordingId = randomUUID();
  // Key only — recordings are PRIVATE on R2. There is no public URL; playback is
  // a short-lived presigned GET fetched at view time. recording_url holds the key.
  const key = `${matchId}/${recordingId}.mp4`;

  const uploadUrl = await presignedPutUrl(
    bucketRecordings(),
    key,
    contentType,
    RECORDING_UPLOAD_URL_TTL_SECONDS
  );

  const now = new Date();
  // 3 days, matching the Cloudflare lifecycle on tibyaan-recordings (was 7, which
  // the screen then wrongly promised). The object is deleted ~72h after upload.
  const expiresAt = new Date(now.getTime() + RECORDING_STORAGE_HOURS * 60 * 60 * 1000);

  const [recording] = await db
    .insert(classRecordings)
    .values({
      id: recordingId,
      matchId,
      teacherId: match[0].teacherId,
      studentId: match[0].studentId,
      recordingUrl: key,
      duration: duration ?? null,
      sessionDate: now,
      expiresAt,
    })
    .returning();

  return NextResponse.json({
    uploadUrl,
    recordingId: recording.id,
    key,
    expiresAt: expiresAt.toISOString(),
  });
}
