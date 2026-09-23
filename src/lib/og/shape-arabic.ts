import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Shape Arabic properly, with HarfBuzz, and hand back SVG outlines.
 *
 * Why this exists: satori has no complex-script shaping. It maps codepoints to
 * glyphs and lays them left to right, so Arabic came out unjoined and with the
 * words in reverse order — see docs/poster-samples/ and the note in poster.tsx.
 * No font choice fixes that; the shaping has to be done before satori sees it.
 *
 * So HarfBuzz — the same engine browsers use — does the joining, the ligatures
 * and the right-to-left reordering, and the result is converted to vector
 * outlines. satori is then handed a picture of the text rather than text,
 * which removes font substitution and shaping from its hands entirely.
 *
 * EVERY failure path returns null, meaning "render no Arabic". None of them
 * returns a partial or approximate result: one wrong glyph on a shareable
 * ayah is worse than no ayah at all.
 */

const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");

/**
 * Raw sfnt, not the WOFF satori uses: HarfBuzz cannot read WOFF. Generated
 * from that same WOFF by scripts/woff-to-ttf.cjs, so the shaper and the
 * renderer work from byte-identical glyph data — a different build of "the
 * same" font could carry different glyph ids, and every shaped glyph here is
 * referenced by id.
 */
const ARABIC_TTF = path.join(FONT_DIR, "cairo-arabic-700-normal.ttf");

type HarfBuzz = typeof import("harfbuzzjs");

type Loaded = {
  hb: HarfBuzz;
  font: InstanceType<HarfBuzz["Font"]>;
  upem: number;
  ascender: number;
  descender: number;
};

let loaded: Loaded | null = null;
let loadFailed = false;

/**
 * Loaded once per lambda: wasm init ~11ms, face and font ~2ms. A failure is
 * remembered so a broken install costs one attempt, not one per poster.
 */
async function load(): Promise<Loaded | null> {
  if (loaded) return loaded;
  if (loadFailed) return null;

  try {
    const hb = (await import("harfbuzzjs")) as HarfBuzz;
    const bytes = await readFile(ARABIC_TTF);

    const blob = new hb.Blob(bytes);
    const face = new hb.Face(blob, 0);
    const font = new hb.Font(face);

    const upem = face.upem;
    const extents = font.hExtents();

    loaded = {
      hb,
      font,
      upem,
      ascender: extents?.ascender ?? upem * 0.8,
      descender: extents?.descender ?? -upem * 0.2,
    };
    return loaded;
  } catch (error) {
    loadFailed = true;
    console.error("HarfBuzz unavailable; posters will carry no Arabic:", error);
    return null;
  }
}

export interface ShapedArabic {
  /** A complete SVG document, ready to be used as an <img> source. */
  svg: string;
  /** Intrinsic size in px at the requested font size, for laying it out. */
  width: number;
  height: number;
}

/**
 * Returns the shaped text as SVG, or null.
 *
 * null is returned when: HarfBuzz or the font will not load; shaping produces
 * no glyphs; any glyph comes back .notdef (glyph id 0), which means the font
 * lacks a character in the text; or any glyph outline cannot be read. In every
 * one of those cases the caller renders no Arabic.
 */
export async function shapeArabicToSvg(
  text: string,
  fontSizePx: number,
  maxWidthPx: number,
  color = "#FFFFFF"
): Promise<ShapedArabic | null> {
  const lib = await load();
  if (!lib) return null;

  const { hb, font, upem, ascender, descender } = lib;
  let buffer: InstanceType<HarfBuzz["Buffer"]> | null = null;

  try {
    buffer = new hb.Buffer();
    buffer.addText(text);
    // Sets direction, script and language from the text itself. For Arabic
    // this is what makes the run right-to-left and reorders it into visual
    // order — the step satori never performed.
    buffer.guessSegmentProperties();
    hb.shape(font, buffer);

    const infos = buffer.getGlyphInfos();
    const positions = buffer.getGlyphPositions();

    if (!infos.length || infos.length !== positions.length) return null;

    // Hard refusal. glyph id 0 is .notdef — the font has no glyph for that
    // character, and rendering it would put an empty box in an ayah.
    if (infos.some((g) => g.codepoint === 0)) {
      console.warn("Arabic shaping produced .notdef; rendering no Arabic for this poster.");
      return null;
    }

    const parts: string[] = [];
    let penX = 0;

    for (let i = 0; i < infos.length; i++) {
      const gid = infos[i].codepoint;
      const pos = positions[i];

      // Outlines in font units, y-up. A mark glyph legitimately has none.
      const d = font.glyphToPath(gid);
      if (d === undefined || d === null) return null;

      if (d.length > 0) {
        const x = penX + (pos.xOffset ?? 0);
        const y = pos.yOffset ?? 0;
        parts.push(`<path d="${d}" transform="translate(${x} ${y})"/>`);
      }

      penX += pos.xAdvance ?? 0;
    }

    if (!parts.length) return null;

    const unitsHigh = ascender - descender;

    /**
     * Fit the line to the poster.
     *
     * penX is the true advance width of the shaped run in font units, so the
     * width is measured, not estimated from a character count. If the line is
     * wider than the space it has, the whole run is scaled down to fit — never
     * cropped, and never wrapped mid-word.
     *
     * Below MIN_FONT_PX it would be too small to read on a phone-sized share
     * preview, so the answer is no Arabic rather than an unreadable ayah. This
     * is the same rule as extractArabicBlock's length limit, applied to the
     * real measured width instead of a guess.
     */
    const MIN_FONT_PX = 30;
    const fitted = Math.min(fontSizePx, (maxWidthPx * upem) / penX);

    if (fitted < MIN_FONT_PX) {
      console.warn(
        `Arabic block does not fit the poster (needs ${fitted.toFixed(1)}px, ` +
          `minimum ${MIN_FONT_PX}px); rendering no Arabic.`
      );
      return null;
    }

    const scale = fitted / upem;

    // SVG is y-down and the font is y-up, so the whole run is flipped once
    // here rather than per glyph, and shifted so the ascender sits at y=0.
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(penX * scale)}" ` +
      `height="${Math.ceil(unitsHigh * scale)}" viewBox="0 0 ${Math.ceil(penX)} ${Math.ceil(unitsHigh)}">` +
      `<g fill="${color}" transform="translate(0 ${ascender}) scale(1 -1)">${parts.join("")}</g>` +
      `</svg>`;

    return {
      svg,
      width: Math.ceil(penX * scale),
      height: Math.ceil(unitsHigh * scale),
    };
  } catch (error) {
    console.error("Arabic shaping failed; rendering no Arabic for this poster:", error);
    return null;
  } finally {
    // getGlyphInfos copies out of wasm memory, so the buffer is finished with.
    // This build of harfbuzzjs exposes no explicit free on Buffer; the memory
    // is reclaimed with the wasm instance at the end of the lambda.
    buffer = null;
  }
}

/** Data URI, so satori can take it as a plain <img src>. */
export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}
