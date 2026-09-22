/**
 * Fails the build when a translation key used in the app is missing from any
 * locale file.
 *
 * A missing key used to reach production and render as a raw key on the page
 * (`teacher.noClassesToday`). Nothing caught it: the build passed and typecheck
 * was clean, because a missing message is only visible at render time.
 *
 * Scope, deliberately: STATIC keys only — `t("literal")` where `t` is bound to a
 * namespace by useTranslations/getTranslations. Keys built from a template
 * literal cannot be resolved without running the code; those call sites are
 * reported separately so the blind spot is visible rather than assumed away.
 * See docs/phase-20-i18n-blind-spots.md.
 *
 * Usage:
 *   node scripts/check-i18n.mjs            # fails on any missing key
 *   node scripts/check-i18n.mjs --json     # machine-readable
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOCALES = ["en", "ur", "ar", "fr", "id"];
const SRC = path.join(ROOT, "src");
const MESSAGES = path.join(ROOT, "messages");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function loadMessages() {
  const out = {};
  for (const locale of LOCALES) {
    const file = path.join(MESSAGES, `${locale}.json`);
    if (!fs.existsSync(file)) throw new Error(`missing locale file: messages/${locale}.json`);
    out[locale] = JSON.parse(fs.readFileSync(file, "utf8"));
  }
  return out;
}

/** Is `full` ("ns.key") a string in this locale's messages? */
function hasKey(messages, full) {
  let node = messages;
  for (const part of full.split(".")) {
    if (node && typeof node === "object" && part in node) node = node[part];
    else return false;
  }
  return typeof node === "string";
}

export function auditTranslations() {
  const messages = loadMessages();
  const files = walk(SRC);
  const used = new Map();     // "ns.key" -> Set(file)
  const dynamic = new Map();  // "file  ns=..." -> count

  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");

    // variables bound to a namespace
    const namespaceOf = new Map();
    for (const m of src.matchAll(
      /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*["'`]([^"'`]*)["'`]\s*\)/g
    )) namespaceOf.set(m[1], m[2]);
    for (const m of src.matchAll(
      /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*\)/g
    )) namespaceOf.set(m[1], "");

    for (const [varName, ns] of namespaceOf) {
      for (const m of src.matchAll(
        new RegExp(`\\b${varName}\\s*\\(\\s*(["'\`])([^"'\`$]*?)\\1`, "g")
      )) {
        const full = ns ? `${ns}.${m[2]}` : m[2];
        if (!used.has(full)) used.set(full, new Set());
        used.get(full).add(rel);
      }
      for (const _ of src.matchAll(new RegExp(`\\b${varName}\\s*\\(\\s*\`[^\`]*\\$\\{`, "g"))) {
        const label = `${rel}  ns="${ns}"`;
        dynamic.set(label, (dynamic.get(label) ?? 0) + 1);
      }
    }
  }

  const missing = [];
  for (const [full, where] of used) {
    const absent = LOCALES.filter((l) => !hasKey(messages[l], full));
    if (absent.length) missing.push({ key: full, missingIn: absent, usedIn: [...where] });
  }
  missing.sort((a, b) => a.key.localeCompare(b.key));

  return {
    filesScanned: files.length,
    keysUsed: used.size,
    missing,
    dynamicSites: [...dynamic.keys()].sort(),
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const isMain = import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, "/")
  || process.argv[1]?.endsWith("check-i18n.mjs");

if (isMain) {
  const result = auditTranslations();
  const asJson = process.argv.includes("--json");

  if (asJson) {
    // JSON mode emits nothing but JSON, so it can be piped.
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.missing.length ? 1 : 0);
  }

  {
    console.log(
      `i18n check: ${result.keysUsed} static keys across ${result.filesScanned} files, ` +
      `${LOCALES.length} locales`
    );
    console.log(
      `            ${result.dynamicSites.length} call sites build keys dynamically and are NOT checked ` +
      `(see docs/phase-20-i18n-blind-spots.md)`
    );
  }

  if (result.missing.length) {
    console.error(`\ni18n check FAILED — ${result.missing.length} key(s) missing:\n`);
    for (const m of result.missing) {
      console.error(`  ${m.key}`);
      console.error(`      missing in : ${m.missingIn.join(", ")}`);
      console.error(`      used in    : ${m.usedIn.join(", ")}`);
    }
    console.error(
      `\nAdd each key to every locale file in messages/. A missing key must never ` +
      `reach a live page.\n`
    );
    process.exit(1);
  }

  console.log("i18n check passed — every static key exists in all five locales.");
}
