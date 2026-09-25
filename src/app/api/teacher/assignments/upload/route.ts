import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPresignedUploadUrl } from "@/lib/r2/client";
import { randomUUID } from "crypto";

export const ASSIGNMENT_FILES_BUCKET = "assignment-files";

/** 20MB. An assignment attachment is a worksheet or a PDF, not a video. */
const MAX_BYTES = 20 * 1024 * 1024;

/**
 * What a teacher may attach. Deliberately a short allow-list rather than a
 * deny-list: the file is handed straight to a student's browser, so anything
 * the browser will execute (html, svg) stays out.
 */
const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/mp4",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/**
 * POST /api/teacher/assignments/upload
 * Body: { contentType }
 * Returns: { uploadUrl, path }
 *
 * The teacher uploads straight to storage with the returned URL, then sends
 * the path back with the assignment itself.
 */
export async function POST(request: NextRequest) {
  try {
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

    const { contentType } = (await request.json().catch(() => ({}))) as {
      contentType?: string;
    };

    if (!contentType || !ALLOWED.has(contentType)) {
      return NextResponse.json(
        { error: "Unsupported file type", allowed: [...ALLOWED] },
        { status: 400 }
      );
    }

    // The teacher's id is part of the path, so an attachment can always be
    // traced back to who uploaded it.
    const path = `${authUser.id}/${randomUUID()}`;

    const uploadUrl = await getPresignedUploadUrl(path, contentType, 3600, ASSIGNMENT_FILES_BUCKET, {
      // Private: these are between one teacher and one student. A public
      // bucket would serve every attachment to anyone holding the URL.
      publicBucket: false,
      fileSizeLimit: MAX_BYTES,
    });

    return NextResponse.json({ uploadUrl, path, maxBytes: MAX_BYTES });
  } catch (error) {
    console.error("Assignment attachment upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
