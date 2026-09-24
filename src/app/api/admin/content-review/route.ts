import { NextRequest, NextResponse } from "next/server";
import { getDarsBySlug } from "@/lib/db/dars-queries";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogPosts, dailyDars } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_QUEUE_STATUSES } from "@/lib/content/publication";
import { renderPostContent } from "@/lib/markdown";
import { generateAndStorePoster, type PosterResult } from "@/lib/og/store-poster";

type PostType = "dars" | "blog";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (user.user_metadata?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

/** GET — the pending queue, newest first, plus a count for the badge. */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const db = getDb();
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const type = url.searchParams.get("type") as PostType | null;

  // Single item — the full record, for the review detail view.
  if (slug && type) {
    const rows =
      type === "dars"
        // Not a bare select(): that asks for every column in the schema, so a
        // column the migrations have not created yet breaks the whole review
        // queue and nothing can be approved. See lib/db/dars-queries.ts.
        ? [await getDarsBySlug(slug, "admin content review")].filter(Boolean)
        : await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);

    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Rendered server-side with the same pipeline the public page uses, so the
    // reviewer sees exactly what will go live — not a preview approximation.
    const item = rows[0] as { contentEn: string | null };
    return NextResponse.json({
      type,
      item: rows[0],
      renderedHtml: renderPostContent(item.contentEn),
    });
  }

  const [darsRows, blogRows] = await Promise.all([
    db
      .select({
        slug: dailyDars.slug,
        title: dailyDars.titleEn,
        category: dailyDars.category,
        status: dailyDars.status,
        sourceReference: dailyDars.sourceReference,
        reviewNote: dailyDars.reviewNote,
        createdAt: dailyDars.createdAt,
      })
      .from(dailyDars)
      .where(inArray(dailyDars.status, REVIEW_QUEUE_STATUSES))
      .orderBy(desc(dailyDars.createdAt)),
    db
      .select({
        slug: blogPosts.slug,
        title: blogPosts.titleEn,
        status: blogPosts.status,
        reviewNote: blogPosts.reviewNote,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .where(inArray(blogPosts.status, REVIEW_QUEUE_STATUSES))
      .orderBy(desc(blogPosts.createdAt)),
  ]);

  const items = [
    ...darsRows.map((r) => ({ ...r, type: "dars" as const })),
    ...blogRows.map((r) => ({ ...r, type: "blog" as const, category: null, sourceReference: null })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return NextResponse.json({ count: items.length, items });
}

/** POST — approve / reject / request revision. */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = (await request.json()) as {
    type?: PostType;
    slug?: string;
    action?: "approve" | "reject" | "request_revision";
    note?: string;
  };

  const { type, slug, action, note } = body;
  if (!type || !slug || !action) {
    return NextResponse.json({ error: "type, slug and action are required" }, { status: 400 });
  }
  if ((action === "reject" || action === "request_revision") && !note?.trim()) {
    return NextResponse.json(
      { error: action === "reject" ? "A rejection reason is required" : "A revision note is required" },
      { status: 400 }
    );
  }

  const now = new Date();
  const patch =
    action === "approve"
      ? {
          status: "published" as const,
          isPublished: true,
          publishedAt: now,
          reviewNote: null,
          reviewedBy: auth.user!.id,
          reviewedAt: now,
        }
      : {
          status: (action === "reject" ? "rejected" : "needs_revision") as
            | "rejected"
            | "needs_revision",
          isPublished: false,
          publishedAt: null,
          reviewNote: note!.trim(),
          reviewedBy: auth.user!.id,
          reviewedAt: now,
        };

  const db = getDb();
  const updated =
    type === "dars"
      ? await db
          .update(dailyDars)
          .set(patch)
          .where(and(eq(dailyDars.slug, slug), inArray(dailyDars.status, REVIEW_QUEUE_STATUSES)))
          .returning({ slug: dailyDars.slug, status: dailyDars.status })
      : await db
          .update(blogPosts)
          .set(patch)
          .where(and(eq(blogPosts.slug, slug), inArray(blogPosts.status, REVIEW_QUEUE_STATUSES)))
          .returning({ slug: blogPosts.slug, status: blogPosts.status });

  if (!updated[0]) {
    return NextResponse.json(
      { error: "Item not found, or it is no longer awaiting review" },
      { status: 404 }
    );
  }

  // The poster is made once, here, rather than on every page view and every
  // time a social crawler calls. Only on approval of a dars, and only after
  // the approval itself has committed.
  let poster: PosterResult | null = null;
  if (type === "dars" && action === "approve") {
    poster = await generateAndStorePoster(slug);
  }

  // Reported, never silent: a failed poster leaves the dars published with no
  // stored image, which the page handles by falling back to the on-demand
  // route — but the admin is told it happened rather than left to find out.
  return NextResponse.json({
    success: true,
    ...updated[0],
    ...(poster ? { poster } : {}),
    ...(poster && !poster.ok
      ? { warning: `Published, but the poster could not be generated: ${poster.reason}` }
      : {}),
  });
}
