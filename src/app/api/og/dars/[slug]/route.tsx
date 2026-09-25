import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { dailyDars } from "@/lib/db/schema";
import { renderPoster } from "@/lib/og/poster";
import { extractArabicBlock } from "@/lib/og/arabic-excerpt";

// Node runtime: the poster reads font files from disk.
export const runtime = "nodejs";

const CATEGORY_LABELS: Record<string, string> = {
  quran: "Quran",
  hadith: "Hadith",
  fiqh: "Fiqh",
  seerah: "Seerah",
  dua: "Dua",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let title = "Daily Dars";
  let category: string | null = null;
  let categoryKey: string | null = null;
  let citation: string | null = null;
  let arabic: string | null = null;

  try {
    const db = getDb();
    const rows = await db
      .select({
        titleEn: dailyDars.titleEn,
        category: dailyDars.category,
        sourceReference: dailyDars.sourceReference,
        contentAr: dailyDars.contentAr,
      })
      .from(dailyDars)
      .where(eq(dailyDars.slug, slug))
      .limit(1);

    if (rows[0]) {
      title = rows[0].titleEn || title;
      categoryKey = rows[0].category;
      category = CATEGORY_LABELS[rows[0].category] ?? rows[0].category;
      citation = rows[0].sourceReference;
      // Null when the dars has no delimited Arabic block, or when the block
      // is longer than the poster can hold. Either way: no Arabic, never a
      // cut one.
      arabic = extractArabicBlock(rows[0].contentAr);
    }
  } catch {
    // Fall back to the generic poster rather than failing the share preview.
  }

  return renderPoster({ title, category, categoryKey, citation, arabic });
}
