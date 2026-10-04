import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { dailyDars } from "@/lib/db/schema";
import { renderPoster } from "@/lib/og/poster";
import { extractArabicBlock } from "@/lib/og/arabic-excerpt";
import { putObject, bucketFiles, filePublicUrl } from "@/lib/r2/s3-client";

const CATEGORY_LABELS: Record<string, string> = {
  quran: "Quran",
  hadith: "Hadith",
  fiqh: "Fiqh",
  seerah: "Seerah",
  dua: "Dua",
};

export type PosterResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

/**
 * Render one dars poster and store it.
 *
 * Called when a dars is approved, so the image is made once rather than on
 * every page view and every time a social crawler calls. The approval flow
 * itself is not touched: this reads the dars and writes only poster_url.
 *
 * Never throws. A poster is a picture; failing to make one must not fail the
 * approval that produced it. The caller is told what happened and says so out
 * loud — the failure is reported, not swallowed.
 */
export async function generateAndStorePoster(slug: string): Promise<PosterResult> {
  try {
    const db = getDb();

    const [row] = await db
      .select({
        titleEn: dailyDars.titleEn,
        category: dailyDars.category,
        sourceReference: dailyDars.sourceReference,
        contentAr: dailyDars.contentAr,
      })
      .from(dailyDars)
      .where(eq(dailyDars.slug, slug))
      .limit(1);

    if (!row) return { ok: false, reason: "Dars not found" };

    const response = await renderPoster({
      title: row.titleEn || "Daily Dars",
      category: CATEGORY_LABELS[row.category] ?? row.category,
      categoryKey: row.category,
      citation: row.sourceReference,
      // renderPoster drops this while POSTER_ARABIC_ENABLED is unset. Passed
      // anyway so that turning the flag on needs no change here.
      arabic: extractArabicBlock(row.contentAr),
    });

    const bytes = Buffer.from(await response.arrayBuffer());

    // Same key every time for a given dars: re-approving replaces the poster
    // rather than leaving orphaned copies behind. Stored under a posters/ prefix
    // in the public tibyaan-files bucket — the social preview must be fetchable
    // with no credential by Twitter, WhatsApp and Facebook, which tibyaan-files
    // (public) allows. Existing posters keep their old URLs; nothing is migrated.
    const key = `posters/${slug}.png`;
    await putObject(bucketFiles(), key, bytes, "image/png");

    const url = filePublicUrl(key);

    await db.update(dailyDars).set({ posterUrl: url }).where(eq(dailyDars.slug, slug));

    return { ok: true, url };
  } catch (error) {
    console.error(`Poster generation failed for dars "${slug}":`, error);
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
