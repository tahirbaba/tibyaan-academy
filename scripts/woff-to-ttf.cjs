/**
 * Convert a WOFF to a bare TTF/OTF (sfnt).
 *
 * HarfBuzz needs raw sfnt data; it cannot read WOFF, which is the same tables
 * zlib-compressed inside a different wrapper. satori reads the WOFF happily,
 * so both files stay in the repo: the WOFF for satori, the TTF for shaping.
 * Converting rather than downloading a second font guarantees the shaper and
 * the renderer are working from byte-identical glyph data — a different build
 * of "the same" font could have different glyph ids, and every shaped glyph is
 * referenced by id.
 *
 * Usage: node scripts/woff-to-ttf.cjs <in.woff> <out.ttf>
 */
const fs = require("fs");
const zlib = require("zlib");

function convert(inPath, outPath) {
  const woff = fs.readFileSync(inPath);

  if (woff.toString("latin1", 0, 4) !== "wOFF") {
    throw new Error(`${inPath} is not a WOFF file`);
  }

  const flavor = woff.readUInt32BE(4);
  const numTables = woff.readUInt16BE(12);

  // Read the WOFF table directory.
  const entries = [];
  for (let i = 0; i < numTables; i++) {
    const p = 44 + i * 20;
    entries.push({
      tag: woff.subarray(p, p + 4),
      offset: woff.readUInt32BE(p + 4),
      compLength: woff.readUInt32BE(p + 8),
      origLength: woff.readUInt32BE(p + 12),
      checksum: woff.readUInt32BE(p + 16),
    });
  }

  // Decompress each table. compLength === origLength means it was stored raw.
  for (const e of entries) {
    const raw = woff.subarray(e.offset, e.offset + e.compLength);
    e.data = e.compLength === e.origLength ? raw : zlib.inflateSync(raw);
    if (e.data.length !== e.origLength) {
      throw new Error(
        `table ${e.tag.toString("latin1")}: expected ${e.origLength} bytes, got ${e.data.length}`
      );
    }
  }

  // sfnt requires the table directory sorted by tag.
  entries.sort((a, b) => a.tag.compare(b.tag));

  // sfnt header: the binary-search fields are derived, not invented.
  const maxPow2 = Math.floor(Math.log2(numTables));
  const searchRange = 2 ** maxPow2 * 16;

  const header = Buffer.alloc(12);
  header.writeUInt32BE(flavor, 0);
  header.writeUInt16BE(numTables, 4);
  header.writeUInt16BE(searchRange, 6);
  header.writeUInt16BE(maxPow2, 8);
  header.writeUInt16BE(numTables * 16 - searchRange, 10);

  const dir = Buffer.alloc(numTables * 16);
  const body = [];
  let offset = 12 + numTables * 16;

  entries.forEach((e, i) => {
    const p = i * 16;
    e.tag.copy(dir, p);
    dir.writeUInt32BE(e.checksum, p + 4);
    dir.writeUInt32BE(offset, p + 8);
    dir.writeUInt32BE(e.origLength, p + 12);

    body.push(e.data);
    offset += e.data.length;

    // Tables are 4-byte aligned; the padding is not counted in the length.
    const pad = (4 - (e.data.length % 4)) % 4;
    if (pad) {
      body.push(Buffer.alloc(pad));
      offset += pad;
    }
  });

  const out = Buffer.concat([header, dir, ...body]);
  fs.writeFileSync(outPath, out);
  console.log(`${inPath} -> ${outPath}  (${numTables} tables, ${out.length} bytes)`);
}

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error("Usage: node scripts/woff-to-ttf.cjs <in.woff> <out.ttf>");
  process.exit(1);
}
convert(input, output);
