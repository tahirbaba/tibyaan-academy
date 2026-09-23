/**
 * Renders the three Arabic proof posters to docs/poster-samples/proofs/.
 *
 * These are the lines to read before POSTER_ARABIC_ENABLED is turned on
 * anywhere. Each exercises something that was wrong before, or something that
 * commonly breaks in Arabic shaping:
 *
 *   1. a short dua containing lam-alef, which must form a single ligature
 *   2. an ayah with full diacritics, which must sit on the right letters
 *   3. Arabic alongside an English citation, which must not disturb either
 *
 * Run with the flag ON, since the point is to look at the Arabic:
 *   POSTER_ARABIC_ENABLED=true npx tsx scripts/render-arabic-proofs.mts
 *
 * The flag stays unset everywhere else until these have been read.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderPoster } from "../src/lib/og/poster";
import { extractArabicBlock } from "../src/lib/og/arabic-excerpt";

const OUT = path.join(process.cwd(), "docs", "poster-samples", "proofs");

const PROOFS = [
  {
    file: "1-short-dua-lam-alef",
    title: "A dua for the morning",
    category: "Dua",
    categoryKey: "dua",
    citation: "Sahih al-Bukhari 6306",
    // لا appears three times: each must be one lam-alef ligature, not two glyphs.
    content: "> اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك",
  },
  {
    file: "2-ayah-full-diacritics",
    title: "The Opening",
    category: "Quran",
    categoryKey: "quran",
    citation: "Surah al-Fatiha 1:1",
    content: "> بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
  },
  {
    file: "3-arabic-with-english-citation",
    title: "Actions are judged by intentions",
    category: "Hadith",
    categoryKey: "hadith",
    // Arabic block above, Latin citation below, in one poster.
    citation: "Sahih al-Bukhari 1, Sahih Muslim 1907",
    content: "> إنما الأعمال بالنيات وإنما لكل امرئ ما نوى",
  },
];

async function main() {
  await mkdir(OUT, { recursive: true });

  const on = process.env.POSTER_ARABIC_ENABLED === "true";
  if (!on) {
    console.log("POSTER_ARABIC_ENABLED is not set — these proofs will carry NO Arabic.");
    console.log("Re-run with POSTER_ARABIC_ENABLED=true to render the Arabic.\n");
  }

  for (const p of PROOFS) {
    const arabic = extractArabicBlock(p.content);
    if (!arabic) throw new Error(`${p.file}: the proof text yielded no Arabic block`);

    const response = await renderPoster({
      title: p.title,
      category: p.category,
      categoryKey: p.categoryKey,
      citation: p.citation,
      arabic,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(path.join(OUT, `${p.file}.png`), buffer);
    console.log(`${p.file.padEnd(34)} ${String(buffer.length).padStart(7)} bytes  (${arabic.length} chars of Arabic)`);
  }

  console.log(`\nWritten to ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
