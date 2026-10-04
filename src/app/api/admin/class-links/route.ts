import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertClassLink } from "@/lib/db/class-links-queries";
import { karachiToday } from "@/lib/pkt";

/**
 * Admin issues (or replaces) one teacher's meeting link for today.
 *
 * The day is decided by the SERVER (today in PKT), never by the client — so a
 * link can only ever be issued for today, and yesterday's links can be seen but
 * not rewritten. Any provider's URL is accepted; we only check it is a real
 * http(s) link so a typo lands as a validation error, not a dead Join button.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { teacherId?: string; meetingUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const teacherId = (body.teacherId || "").trim();
  const meetingUrl = (body.meetingUrl || "").trim();
  if (!teacherId) {
    return NextResponse.json({ error: "A teacher is required." }, { status: 400 });
  }
  if (!isValidHttpUrl(meetingUrl)) {
    return NextResponse.json(
      { error: "Enter a valid link starting with http:// or https://" },
      { status: 400 }
    );
  }

  const validOn = karachiToday();
  try {
    await upsertClassLink({ teacherId, meetingUrl, validOn, createdBy: user.id });
  } catch (e) {
    console.error("[class-links] upsert failed:", e);
    return NextResponse.json({ error: "Could not save the link." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, validOn });
}

function isValidHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
