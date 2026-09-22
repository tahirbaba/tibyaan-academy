/**
 * Renders one sample poster per category to docs/poster-samples/.
 *
 * These exist to be looked at: the Arabic shaping on a generated image is the
 * one thing that cannot be verified by reading code, so it is checked by eye
 * before anything ships. Run:
 *
 *   npx tsx scripts/render-sample-posters.mts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderPoster } from "../src/lib/og/poster";
import { extractArabicBlock } from "../src/lib/og/arabic-excerpt";

const OUT = path.join(process.cwd(), "docs", "poster-samples");

/**
 * Real text, so the shaping check is meaningful. The Arabic is passed through
 * extractArabicBlock() exactly as a live dars would be — as a markdown
 * blockquote — so the samples exercise the real path, not a shortcut.
 */
const SAMPLES = [
  {
    key: "quran",
    label: "Quran",
    title: "The Opening: why every prayer begins with al-Fatiha",
    citation: "Surah al-Fatiha 1:1–7",
    content: "Some commentary above.\n\n> بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ\n\nAnd the translation below.",
  },
  {
    key: "dua",
    label: "Dua",
    title: "A dua for the morning",
    citation: "Sahih al-Bukhari 6306",
    content: "> ٱللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ",
  },
  {
    key: "hadith",
    label: "Hadith",
    title: "Actions are judged by intentions",
    citation: "Sahih al-Bukhari 1, Sahih Muslim 1907",
    content: "> إِنَّمَا ٱلْأَعْمَالُ بِٱلنِّيَّاتِ وَإِنَّمَا لِكُلِّ ٱمْرِئٍ مَا نَوَىٰ",
  },
  {
    key: "fiqh",
    label: "Fiqh",
    title: "The conditions of a valid prayer, explained simply",
    citation: "Qudoori, Kitab as-Salah",
    // No blockquote: this one must render with no Arabic at all.
    content: "A prose explanation with no delimited Arabic block in it.",
  },
  {
    key: "seerah",
    label: "Seerah",
    title: "The year of sorrow, and what came after it",
    citation: "Ibn Hisham, as-Sira an-Nabawiyya",
    content: "A narrative passage with no Arabic block.",
  },
];

async function main() {
  await mkdir(OUT, { recursive: true });

  for (const s of SAMPLES) {
    const arabic = extractArabicBlock(s.content);

    const response = await renderPoster({
      title: s.title,
      category: s.label,
      categoryKey: s.key,
      citation: s.citation,
      arabic,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const file = path.join(OUT, `${s.key}.png`);
    await writeFile(file, buffer);

    // Two separate facts. "extracted" is what the rule found in the text;
    // "rendered" is what actually reached the image, which the flag can veto.
    // Reporting only the first is how a disabled feature gets mistaken for a
    // working one.
    const rendered = process.env.POSTER_ARABIC_ENABLED === "true" && !!arabic;
    console.log(
      `${s.key.padEnd(7)} ${String(buffer.length).padStart(7)} bytes  ` +
        `arabic extracted: ${arabic ? `yes (${arabic.length} chars)` : "no"}  ` +
        `rendered: ${rendered ? "YES" : "no"}`
    );
  }

  console.log(`\nWritten to ${OUT}`);
  if (process.env.POSTER_ARABIC_ENABLED !== "true") {
    console.log(
      "POSTER_ARABIC_ENABLED is not set, so no poster carries Arabic.\n" +
        "That is the intended state until HarfBuzz shaping lands and is checked."
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
