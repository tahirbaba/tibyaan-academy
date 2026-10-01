/**
 * Proves the Quran metadata against itself. Run:
 *   node --experimental-strip-types scripts/verify-quran-metadata.mjs
 *
 * This is deliberately a standalone, repeatable check, not a one-off: Quran
 * data on a page students read is verified arithmetically every time, not
 * trusted because of where it came from. The same invariants also run at
 * module import (assertQuranMetadata), so a regression fails the build too.
 */
import {
  SURAHS,
  JUZ,
  TOTAL_AYAT,
  TOTAL_SURAHS,
  TOTAL_JUZ,
  juzAyahRange,
  globalAyahIndex,
  assertQuranMetadata,
} from "../src/lib/quran/metadata.ts";

let ok = true;
const check = (label, cond, got) => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${label}${got !== undefined ? " — " + got : ""}`);
  if (!cond) ok = false;
};

check("per-surah counts sum to 6236", TOTAL_AYAT === 6236, TOTAL_AYAT);
check("exactly 114 surahs", TOTAL_SURAHS === 114, TOTAL_SURAHS);
check("exactly 30 juz", TOTAL_JUZ === 30, TOTAL_JUZ);
check("juz 1 starts at 1:1", globalAyahIndex(JUZ[0].surah, JUZ[0].ayah) === 1, `${JUZ[0].surah}:${JUZ[0].ayah}`);

let covered = 0;
let continuous = true;
let detail = "";
for (let j = 1; j <= 30; j++) {
  const { start, end } = juzAyahRange(j);
  if (start !== covered + 1) {
    continuous = false;
    detail = `juz ${j} starts ${start}, expected ${covered + 1}`;
    break;
  }
  covered = end;
}
check("juz boundaries continuous (no gap/overlap)", continuous, detail || "all 30 tile 1..6236");
check("last juz ends at the last ayah of an-Nas (6236)", covered === 6236, covered);

const last = SURAHS[SURAHS.length - 1];
check(
  "surah 114 is an-Nas with 6 ayaat",
  last.number === 114 && last.transliteration === "An-Nas" && last.ayahCount === 6,
  `${last.number} ${last.transliteration} (${last.ayahCount})`
);

try {
  assertQuranMetadata();
  console.log("\n  assertQuranMetadata() — passed");
} catch (e) {
  console.log("\n  assertQuranMetadata() THREW:", e.message);
  ok = false;
}

console.log(ok ? "\nALL CHECKS PASS" : "\nFAILED");
process.exit(ok ? 0 : 1);
