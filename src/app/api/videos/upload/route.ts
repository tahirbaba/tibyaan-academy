import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, teacherVideos } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { parseYouTubeUrl } from "@/lib/youtube";

/**
 * POST /api/videos/upload — submit a teacher showcase video as a YouTube LINK.
 *
 * Videos are YouTube links only; nothing is uploaded to our storage. The row
 * starts "pending" and reaches the home page only after an admin approves it
 * (the existing approval queue). A teacher may have at most 10 videos (any
 * status), enforced here server-side, not only in the form. Admins are exempt
 * from the cap and may add on anyone's behalf.
 *
 * Duration is NOT enforced: it cannot be read reliably without the YouTube Data
 * API, and we do not claim a limit we are not enforcing. The 10-minute guidance
 * is checked by the admin's eye at approval, where the admin watches the video.
 */
const MAX_VIDEOS_PER_TEACHER = 10;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
  if (!dbUser || !["teacher", "admin"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    videoUrl?: string;
    title?: string;
    description?: string;
    surahName?: string;
    surahNumber?: number;
    ayahFrom?: number;
    ayahTo?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const parsed = parseYouTubeUrl(body.videoUrl ?? "");
  if (!parsed) {
    return NextResponse.json(
      { error: "Enter a valid YouTube link (youtube.com/watch, youtu.be, or a Short)." },
      { status: 400 }
    );
  }

  // Max 10 per teacher, any status — in the database count, not just the form.
  if (dbUser.role === "teacher") {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(teacherVideos)
      .where(eq(teacherVideos.teacherId, authUser.id));
    if ((count ?? 0) >= MAX_VIDEOS_PER_TEACHER) {
      return NextResponse.json(
        {
          error: `You can have at most ${MAX_VIDEOS_PER_TEACHER} videos. Remove one before adding another.`,
        },
        { status: 429 }
      );
    }
  }

  const normalizedUrl = `https://www.youtube.com/watch?v=${parsed.id}`;
  const thumbnailUrl = `https://i.ytimg.com/vi/${parsed.id}/hqdefault.jpg`;

  const [video] = await db
    .insert(teacherVideos)
    .values({
      teacherId: authUser.id,
      title,
      description: body.description?.trim() || null,
      surahName: body.surahName?.trim() || null,
      surahNumber: body.surahNumber ?? null,
      ayahFrom: body.ayahFrom ?? null,
      ayahTo: body.ayahTo ?? null,
      videoUrl: normalizedUrl,
      thumbnailUrl,
      status: "pending",
      isPublic: false,
    })
    .returning();

  return NextResponse.json({ ok: true, videoId: video.id });
}
