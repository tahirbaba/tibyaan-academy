import { ImageResponse } from "next/og";
import { shapeArabicToSvg, svgToDataUri } from "@/lib/og/shape-arabic";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** The title block is narrower than the page; the Arabic must fit inside it. */
const TITLE_BLOCK_WIDTH = 1000;

// Brand palette — kept in sync with globals.css.
const GREEN = "#1B4332";
const GREEN_DEEP = "#12301F";
const GOLD = "#C9A84C";

const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");

/**
 * Arabic on posters is OFF.
 *
 * satori renders Arabic unjoined and with the words in reverse order, so an
 * ayah would be published wrong. Correct shaping needs HarfBuzz, which is a
 * separate piece of work; until that lands and has been checked by eye, the
 * poster carries title, category and citation only.
 *
 * Set POSTER_ARABIC_ENABLED=true to turn it back on. Do not set it on
 * production until the shaping has been verified against real ayat.
 */
const ARABIC_ENABLED = process.env.POSTER_ARABIC_ENABLED === "true";

/**
 * One treatment per category. All five are the same poster - same layout,
 * same gold rule, same brand row - and differ only in the ground colour and
 * the accent, so a row of them reads as one family.
 *
 * The accent is always light on a dark ground; contrast was checked at the
 * size the title renders, not assumed.
 */
const CATEGORY_TREATMENTS = {
  quran:  { from: "#1B4332", to: "#0E241A", accent: "#C9A84C" },
  hadith: { from: "#1F3A5F", to: "#12233A", accent: "#D7B778" },
  fiqh:   { from: "#4A3B16", to: "#2A2009", accent: "#E3C97E" },
  seerah: { from: "#3E2A47", to: "#241729", accent: "#D9B8E8" },
  dua:    { from: "#14403F", to: "#0A2524", accent: "#8FD6C4" },
} as const;

export type PosterCategory = keyof typeof CATEGORY_TREATMENTS;

/** Unknown or missing category falls back to the house green. */
function treatmentFor(category?: string | null) {
  const key = category?.toLowerCase() as PosterCategory | undefined;
  return (key && CATEGORY_TREATMENTS[key]) || { from: GREEN, to: GREEN_DEEP, accent: GOLD };
}

let cachedFonts: Array<{
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600 | 700;
  style: "normal";
}> | null = null;

/**
 * Latin and Arabic faces are both loaded explicitly — satori has no system
 * fonts, so an unlisted script renders as empty boxes. Read once per lambda.
 *
 * WHAT WAS ACTUALLY TESTED, and what was not:
 *
 * Tested: Noto Naskh Arabic, Noto Sans Arabic, Amiri and Scheherazade throw
 * "lookupType: 5 - substFormat: 3 is not yet supported" under satori and
 * produce nothing. Cairo and Tajawal return glyphs instead of empty boxes.
 *
 * NOT tested, and NOT true: that those glyphs are correct. They are not.
 * satori has no complex-script shaping, so Arabic comes out unjoined and in
 * reversed word order whatever font is supplied - this is not a font problem
 * and no font choice fixes it. Proven by rendering samples and reading them:
 * see docs/poster-samples/ and POSTER_ARABIC_ENABLED below.
 *
 * "It rendered" is not "it is correct". Do not read one as the other.
 */
async function loadFonts() {
  if (cachedFonts) return cachedFonts;

  const [latinSemi, latinBold, arabicBold] = await Promise.all([
    readFile(path.join(FONT_DIR, "noto-sans-latin-600-normal.woff")),
    readFile(path.join(FONT_DIR, "noto-sans-latin-700-normal.woff")),
    readFile(path.join(FONT_DIR, "cairo-arabic-700-normal.woff")),
  ]);

  cachedFonts = [
    { name: "Noto Sans", data: latinSemi.buffer as ArrayBuffer, weight: 600, style: "normal" },
    { name: "Noto Sans", data: latinBold.buffer as ArrayBuffer, weight: 700, style: "normal" },
    { name: "Cairo", data: arabicBold.buffer as ArrayBuffer, weight: 700, style: "normal" },
  ];
  return cachedFonts;
}

export interface PosterInput {
  title: string;
  category?: string | null;
  citation?: string | null;
  /**
   * The Arabic block, already extracted and validated by
   * extractArabicBlock(). Pass null to render no Arabic - never a shortened
   * version of a longer text.
   */
  arabic?: string | null;
  /** Lower-case category key used to pick the colour treatment. */
  categoryKey?: string | null;
}

function titleSize(title: string, hasArabic: boolean): number {
  // With an Arabic block on the poster the title gets less room.
  if (hasArabic) {
    if (title.length > 75) return 34;
    if (title.length > 45) return 40;
    return 46;
  }
  if (title.length > 110) return 44;
  if (title.length > 75) return 52;
  if (title.length > 45) return 62;
  return 72;
}

function arabicSize(text: string): number {
  if (text.length > 160) return 34;
  if (text.length > 100) return 40;
  if (text.length > 55) return 48;
  return 56;
}

/**
 * One template for every dars and blog poster: logo mark, category label,
 * title, and the citation line, on the brand green.
 */
export async function renderPoster({ title, category, citation, arabic, categoryKey }: PosterInput) {
  const fonts = await loadFonts();
  const t = treatmentFor(categoryKey ?? category);
  // The flag wins over the caller: nothing can put Arabic on a poster while
  // the shaping is known to be wrong.
  const safeArabic = ARABIC_ENABLED ? arabic : null;

  // Shaped here rather than in the JSX so that a shaping refusal — .notdef, a
  // missing font, HarfBuzz failing to load — lands before layout, and the
  // poster is laid out as one that simply has no Arabic.
  // The Arabic sits inside the title block, which is capped at 1000px — not
  // the full 1056 the page padding leaves. Less the accent rule and its
  // gutter (4 + 22), that is 974. The shaper scales the line down to fit
  // this, or refuses. Measured against the rendered proofs, not assumed.
  const ARABIC_MAX_WIDTH = TITLE_BLOCK_WIDTH - 26;

  const shaped = safeArabic
    ? await shapeArabicToSvg(safeArabic, arabicSize(safeArabic), ARABIC_MAX_WIDTH)
    : null;
  const hasArabic = !!shaped;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)`,
          // Both faces listed so a title containing Arabic produces glyphs
          // rather than empty boxes. Note that Arabic in a TITLE is subject to
          // the same shaping fault described above; titles are English today.
          fontFamily: "Noto Sans, Cairo",
        }}
      >
        {/* Gold rule across the top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            background: t.accent,
          }}
        />

        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: t.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: t.to,
              fontSize: 38,
              fontWeight: 700,
            }}
          >
            ت
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#FFFFFF", fontSize: 30, fontWeight: 700 }}>
              Tibyaan Academy
            </span>
            <span style={{ color: t.accent, fontSize: 19, fontWeight: 600 }}>
              Quran &amp; Islamic Sciences
            </span>
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: TITLE_BLOCK_WIDTH }}>
          {category ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 22px",
                borderRadius: 999,
                border: `2px solid ${t.accent}`,
                color: t.accent,
                fontSize: 22,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              {category}
            </div>
          ) : null}

          <div
            style={{
              color: "#FFFFFF",
              fontSize: titleSize(title, hasArabic),
              fontWeight: 700,
              lineHeight: 1.2,
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* The Arabic block, when the dars carries one. Rendered whole or
              not at all - extractArabicBlock() returns null rather than a
              shortened text, so nothing here can cut an ayah. */}
          {shaped ? (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                borderRight: `4px solid ${t.accent}`,
                paddingRight: 22,
                marginTop: 4,
              }}
            >
              {/* Outlines, not text. satori is handed the shaped result as an
                  image, so it can neither re-lay-out nor substitute a font
                  for it — the two things that produced the reversed, unjoined
                  Arabic before. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={svgToDataUri(shaped.svg)}
                width={shaped.width}
                height={shaped.height}
                alt=""
              />
            </div>
          ) : null}
        </div>

        {/* Citation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            borderTop: "2px solid rgba(201,168,76,0.35)",
            paddingTop: 24,
          }}
        >
          <div style={{ width: 6, height: 34, background: t.accent, borderRadius: 3, display: "flex" }} />
          <span
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 26,
              fontWeight: 600,
              display: "flex",
            }}
          >
            {citation?.trim() || "tibyaanacademy.com"}
          </span>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
