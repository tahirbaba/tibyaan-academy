/**
 * Pull the Arabic block out of a dars, for the poster.
 *
 * The rule, and why it is this strict:
 *
 * A dars body is a whole markdown document. Guessing which span of it is the
 * ayah or the dua would eventually put a truncated ayah on a shareable image,
 * which is precisely the failure this phase exists to prevent. So nothing is
 * inferred. Only a block the author explicitly delimited is used — a markdown
 * blockquote whose content is Arabic — and if there is no such block, the
 * poster carries no Arabic at all.
 *
 * Partial Arabic is never returned. A block that is present but too long for
 * the poster yields null rather than an excerpt: a cut ayah is worse than no
 * ayah. Nothing here alters the dars text; it only reads it.
 */

/** Arabic letters proper, plus the presentation forms. Excludes punctuation. */
const ARABIC_LETTER = /[ء-يٮ-ۓۺ-ۿﭐ-﷿ﹰ-﻿]/;

/**
 * What the poster can hold at the Arabic size without the layout breaking.
 * Measured against the rendered samples, not guessed.
 */
export const MAX_ARABIC_CHARS = 220;

/** Diacritics and tatweel: kept in the output, ignored when judging content. */
const MARKS = /[ً-ٰٟۖ-ۭـ]/g;

function isArabicText(text: string): boolean {
  const stripped = text.replace(MARKS, "");
  const letters = [...stripped].filter((ch) => /\p{L}/u.test(ch));
  if (letters.length === 0) return false;

  /**
   * The whole block must be Arabic. A mixed line is a translation or a
   * commentary, not the ayah itself.
   *
   * There is a second, harder reason this rule cannot be relaxed. The poster
   * shapes Arabic with an ~39KB Cairo *Arabic subset*, which carries no Latin
   * glyphs. One Latin character in the block makes every Latin character
   * .notdef, and shapeArabicToSvg() then refuses the whole block — so the
   * poster silently comes out with no Arabic on it and no other symptom.
   *
   * If a dars needs a verse number or a reference, it belongs on the source
   * line, not inside the quoted block. See docs/dars-poster-arabic.md.
   */
  return letters.every((ch) => ARABIC_LETTER.test(ch));
}

/**
 * Returns the Arabic block, or null. Null is a normal outcome and means
 * "render no Arabic", never "render something shorter".
 */
export function extractArabicBlock(content: string | null | undefined): string | null {
  if (!content) return null;

  const lines = content.replace(/\r\n/g, "\n").split("\n");

  // Collect consecutive runs of blockquote lines; each run is one candidate.
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const quoted = /^\s{0,3}>\s?(.*)$/.exec(line);
    if (quoted) {
      current.push(quoted[1]);
      continue;
    }
    if (current.length) {
      blocks.push(current.join(" "));
      current = [];
    }
  }
  if (current.length) blocks.push(current.join(" "));

  for (const raw of blocks) {
    // Strip markdown emphasis so **…** around an ayah does not disqualify it.
    const text = raw.replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();
    if (!text || !isArabicText(text)) continue;

    // Present but too long: no Arabic rather than a cut ayah.
    if (text.length > MAX_ARABIC_CHARS) return null;

    return text;
  }

  return null;
}
