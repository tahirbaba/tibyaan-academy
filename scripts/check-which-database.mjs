/**
 * Which database is .env.local pointed at?
 *
 * Run this BEFORE starting the dev server. Running the app against production
 * is not a read-only mistake: approving a dars locally publishes it for real.
 *
 * Reads only. It opens no connection and changes nothing — it inspects the
 * connection string in .env.local and nothing else.
 *
 *   node scripts/check-which-database.mjs
 */
import { readFileSync, existsSync } from "node:fs";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const OFF = "\x1b[0m";

if (!existsSync(".env.local")) {
  console.log(`${YELLOW}No .env.local found.${OFF}`);
  console.log("Create it first — see Step 4 of docs/running-locally-safely.md.");
  process.exit(1);
}

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const url = env.DATABASE_URL;
if (!url) {
  console.log(`${RED}${BOLD}DATABASE_URL is not set in .env.local.${OFF}`);
  process.exit(1);
}

// Host only. The password is never printed, not even partially.
const host = /@([^/:?]+)/.exec(url)?.[1];
if (!host) {
  console.log(`${RED}Could not read a host out of DATABASE_URL.${OFF}`);
  console.log("Re-copy the connection string from Neon (Step 2).");
  process.exit(1);
}

// Neon endpoint ids are unique per branch: ep-<words>-<id>.<region>.aws.neon.tech
const endpoint = host.split(".")[0];

console.log("");
console.log(`  host:     ${host}`);
console.log(`  endpoint: ${endpoint}`);
console.log("");

/**
 * The production endpoint, recorded so this check does not depend on the
 * branch being named anything in particular. If production is ever moved,
 * update this line — and nothing else here needs to change.
 */
const PRODUCTION_ENDPOINT = "ep-winter-hill-a4fend5v";

if (endpoint === PRODUCTION_ENDPOINT) {
  console.log(`${RED}${BOLD}  STOP — this is PRODUCTION.${OFF}`);
  console.log("");
  console.log("  Do not start the dev server. Anything you click — approving a");
  console.log("  dars, deleting a user — happens for real, to real students.");
  console.log("");
  console.log("  Fix: go back to docs/running-locally-safely.md Step 2, and make");
  console.log("  sure the branch selector says 'local-dev' before copying the");
  console.log("  connection string.");
  console.log("");
  process.exit(1);
}

console.log(`${GREEN}${BOLD}  SAFE — this is not the production endpoint.${OFF}`);
console.log("");
console.log(`  Production is ${PRODUCTION_ENDPOINT}; you are on ${endpoint}.`);
console.log("  Writes here stay on your branch and never reach production.");
console.log("");

if (env.POSTER_ARABIC_ENABLED === "true") {
  console.log("  POSTER_ARABIC_ENABLED=true — posters will render Arabic locally.");
}
if (env.RESEND_API_KEY) {
  console.log(`${YELLOW}  RESEND_API_KEY is set — local runs can send real email.${OFF}`);
}
if (env.STRIPE_SECRET_KEY) {
  console.log(`${YELLOW}  STRIPE_SECRET_KEY is set — check it is a test key, not live.${OFF}`);
}
console.log("");
