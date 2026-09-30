import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateAndStorePoster } from "@/lib/og/store-poster";

// The poster reads font files from disk; that needs the Node runtime.
export const runtime = "nodejs";

/**
 * POST /api/admin/dars/[slug]/regenerate-poster
 *
 * Runs the poster generate-and-store for one dars and returns the FULL result,
 * error reason included. Two jobs:
 *
 *  1. Diagnosis. The store-on-approval failure was caught and the reason
 *     dropped. This hands the reason straight back, so the cause is named
 *     rather than guessed.
 *  2. Backfill, one at a time. Once a single dars is proven to store, the same
 *     endpoint fills in the rest — never a batch through a path still failing.
 *
 * Admin only. It accepts an admin session or the admin secret, so it can be
 * driven from a script during a backfill without a browser session.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const authorised = await isAdmin(request);
  if (!authorised) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await generateAndStorePoster(slug);

  // The reason is returned on failure, not logged and hidden. A 502 so a
  // caller (and the alerting path, if wired) sees a non-2xx rather than a
  // success that produced nothing.
  if (!result.ok) {
    return NextResponse.json({ ok: false, slug, reason: result.reason }, { status: 502 });
  }

  return NextResponse.json({ ok: true, slug, posterUrl: result.url });
}

async function isAdmin(request: Request): Promise<boolean> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const adminSecret = process.env.ADMIN_SECRET;
  if (token && adminSecret && token === adminSecret) return true;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    return dbUser?.role === "admin";
  } catch {
    return false;
  }
}
