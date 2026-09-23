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

/**
 * Every Arabic-script Unicode block, plus the presentation forms. Anything
 * outside this — a Latin letter, an ASCII digit, an ASCII bracket, an em dash —
 * has no glyph in the Arabic subset the poster shapes with.
 */
const ARABIC_RANGE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

function isArabicText(text: string): boolean {
  const stripped = text.replace(MARKS, "");

  /**
   * Every non-space character must be Arabic — not merely every letter.
   *
   * Checking only letters let "اللهم افتح (2:255)" through: the digits and
   * brackets are not letters, so nothing objected, and the poster then came
   * out blank because those characters are .notdef in the Arabic subset. A
   * verse number is the single most likely thing for an author to add, so
   * this is the case that has to be caught here rather than downstream.
   */
  const solid = [...stripped].filter((ch) => !/\s/.test(ch));
  if (solid.length === 0) return false;
  if (!solid.every((ch) => ARABIC_RANGE.test(ch))) return false;

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

  // A blockquote is the preferred form and wins whenever one is present.
  const fromQuote = firstArabicCandidate(blockquoteRuns(lines));
  if (fromQuote !== undefined) return fromQuote;

  // Fallback: a bold-only line. The dars written by the content agent do not
  // use blockquotes — they mark the ayah as a bold line under a heading — so
  // without this every real poster came out with no Arabic on it. A line the
  // author wrapped in ** is still explicitly delimited; it is not inference.
  return firstArabicCandidate(boldOnlyLines(lines)) ?? null;
}

/** Consecutive runs of blockquote lines, each run one candidate. */
function blockquoteRuns(lines: string[]): string[] {
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

  return blocks;
}

/**
 * Lines that are nothing but one bold span: `**…**` or `__…__`.
 *
 * A line with anything outside the markers is not a candidate — that is prose
 * with a bold phrase in it, not a marked-out ayah.
 */
function boldOnlyLines(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    const m = /^\s*(?:\*\*(.+)\*\*|__(.+)__)\s*$/.exec(line);
    if (m) out.push(m[1] ?? m[2]);
  }
  return out;
}

/**
 * The first candidate that is Arabic, or undefined if none was Arabic.
 *
 * Returns null — not undefined — for a candidate that is Arabic but too long,
 * so the caller stops there rather than falling through to a later one. The
 * distinction matters: "no Arabic here" and "Arabic that will not fit" are
 * different answers, and only the first should let the search continue.
 *
 * Candidates are never joined. The first qualifying one is the whole answer;
 * concatenating two would invent a passage that appears nowhere in the dars.
 */
function firstArabicCandidate(candidates: string[]): string | null | undefined {
  for (const raw of candidates) {
    // Strip markdown so **…** around an ayah does not disqualify it.
    const text = raw.replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();
    if (!text || !isArabicText(text)) continue;

    // Present but too long: no Arabic rather than a cut ayah.
    if (text.length > MAX_ARABIC_CHARS) return null;

    return text;
  }
  return undefined;
}
