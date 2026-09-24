/**
 * Find server code where a failed query is turned into an empty list.
 *
 * The pattern this looks for: a variable initialised to [], a try/catch around
 * the query, and a catch that neither rethrows nor calls notFound()/redirect()
 * — so the page renders normally, returning 200 with nothing in it.
 *
 * See docs/silent-failure-sites.md for why this matters and what each known
 * site would show. Run:
 *
 *   node scripts/find-silent-failures.cjs
 *
 * Exit code is 0 always: this is a review aid, not a build gate. It
 * over-reports a little — read each hit rather than trusting the count.
 */
const fs = require("fs");
const path = require("path");

const ROOT = "src/app";
const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(entry.name)) scan(p);
  }
}

/** The text of the catch block starting on `start`, by brace balance. */
function catchBody(lines, start) {
  let depth = 0;
  let seenOpen = false;
  const out = [];

  for (let i = start; i < lines.length && i < start + 200; i++) {
    // On the first line, start at "catch": the leading } closes the TRY block
    // and would cancel the catch's own opening brace, ending the walk instantly.
    const line = i === start ? lines[i].slice(lines[i].indexOf("catch")) : lines[i];
    out.push(line);
    for (const ch of line) {
      if (ch === "{") {
        depth++;
        seenOpen = true;
      } else if (ch === "}") {
        depth--;
      }
    }
    if (seenOpen && depth <= 0) break;
  }
  return out.join("\n");
}

function scan(file) {
  const src = fs.readFileSync(file, "utf8");

  // Client components fail visibly — a spinner that never resolves, an error
  // state. They are not passing an empty list off as the truth in the same way.
  if (src.includes('"use client"')) return;

  const lines = src.split("\n");

  lines.forEach((line, i) => {
    if (!/\}\s*catch\b/.test(line)) return;

    // Read to the end of the catch block, not a fixed number of lines: a
    // correctly fixed site alerts first and rethrows last, and a short window
    // stops before the throw and reports it as broken.
    const body = catchBody(lines, i);
    if (/\bthrow\b|notFound\(|redirect\(/.test(body)) return; // already loud

    const before = lines.slice(Math.max(0, i - 40), i).join("\n");
    if (!/=\s*\[\s*\]/.test(before)) return; // no empty-list fallback nearby

    const alerts = /sendFailureAlert/.test(body);
    hits.push({ file: file.replace(/\\/g, "/"), line: i + 1, alerts });
  });
}

walk(ROOT);

console.log(`${hits.length} site(s) where a failed query could render as an empty list:\n`);
for (const h of hits) {
  console.log(`  ${h.file}:${h.line}${h.alerts ? "   (alerts, but still swallows)" : ""}`);
}
console.log(`\nSee docs/silent-failure-sites.md — fix by alerting AND rethrowing.`);
