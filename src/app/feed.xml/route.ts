import { getDb } from "@/lib/db";
import { blogPosts, dailyDars } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

import { SITE_URL } from "@/lib/site-config";
import { publishedBlogPosts, publishedDars } from "@/lib/content/publication";
import { sendFailureAlert } from "@/lib/alerts";

/**
 * Once an hour, like the sitemap. Without it the feed was generated at build
 * time and never saw content published through the review flow afterwards.
 */
export const revalidate = 3600;

type FeedItem = {
  title: string;
  link: string;
  description: string;
  date: Date;
};

export async function GET() {
  try {
    const db = getDb();

    // Dars is the content this site actually publishes; the blog has produced
    // nothing. The feed was blog-only by accident, not intent — both belong.
    const [posts, dars] = await Promise.all([
      db
        .select()
        .from(blogPosts)
        .where(publishedBlogPosts())
        .orderBy(desc(blogPosts.publishedAt))
        .limit(50),
      db
        .select()
        .from(dailyDars)
        .where(publishedDars())
        .orderBy(desc(dailyDars.publishedAt))
        .limit(50),
    ]);

    const items: FeedItem[] = [
      ...posts.map((p) => ({
        title: p.titleEn || p.titleUr || "Untitled",
        link: `${SITE_URL}/en/blog/${p.slug}`,
        description: p.metaDescriptionEn || p.metaDescriptionUr || "",
        date: p.publishedAt ?? p.createdAt,
      })),
      ...dars.map((d) => ({
        title: d.titleEn || d.titleUr || "Daily Dars",
        link: `${SITE_URL}/en/dars/${d.slug}`,
        description: d.sourceReference || "",
        date: d.publishedAt ?? d.createdAt,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 50);

    return new Response(renderRss(items), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    // A feed reader should not break on a transient DB blip, so a valid empty
    // feed is still served — but the failure is NOT swallowed: it alerts, the
    // same as any other job, rather than quietly serving an empty shelf.
    console.error("RSS feed generation error:", error);
    await sendFailureAlert({
      source: "/feed.xml",
      summary: "The RSS feed query failed — an empty feed was served instead.",
      error,
    });

    return new Response(renderRss([]), {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}

function renderRss(items: FeedItem[]): string {
  const body = items
    .map(
      (i) => `    <item>
      <title>${escapeXml(i.title)}</title>
      <link>${i.link}</link>
      <description>${escapeXml(i.description)}</description>
      <pubDate>${new Date(i.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${i.link}</guid>
      <category>islamic-education</category>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tibyaan Academy</title>
    <link>${SITE_URL}/en/dars</link>
    <description>Daily Dars and articles from Tibyaan Academy — Quran, Hadith, Fiqh, Seerah and Dua</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/icons/icon-192x192.png</url>
      <title>Tibyaan Academy</title>
      <link>${SITE_URL}</link>
    </image>
${body}
  </channel>
</rss>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
