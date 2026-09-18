import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Task 7: Blog fix — redirect /blog to /dars so content is always visible
      {
        source: "/:locale/blog",
        destination: "/:locale/dars",
        permanent: true,
      },
    ];
  },
};

/**
 * Fail the production build when NEXT_PUBLIC_SITE_URL is missing or malformed.
 *
 * It builds every canonical, hreflang, og:url, sitemap and share link. Without
 * it a build used to fall back silently to http://localhost:3000 and ship that
 * in every page — a silent wrong domain is worse than a failed build.
 * On Vercel it must also be an https origin that is not localhost.
 */
function assertSiteUrl(): void {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fix =
    "Set NEXT_PUBLIC_SITE_URL to the public origin (e.g. https://tibyaanacademy.com) " +
    "for this environment — in Vercel: Settings → Environment Variables, for both " +
    "Production and Preview.";

  if (!raw) throw new Error(`NEXT_PUBLIC_SITE_URL is not set. ${fix}`);

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${raw}". ${fix}`);
  }

  if (url.pathname.replace(/\/+$/, "") !== "" || url.search || url.hash) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must be an origin only, with no path, query or hash: "${raw}". ${fix}`
    );
  }

  if (process.env.VERCEL) {
    const local = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]"].includes(url.hostname);
    if (url.protocol !== "https:" || local) {
      throw new Error(
        `NEXT_PUBLIC_SITE_URL on Vercel must be an https public origin, got "${raw}". ${fix}`
      );
    }
  }
}


/**
 * Fail the build when a translation key used in the app is missing from any
 * locale file. A missing key rendered as a raw key on live pages for months;
 * the build passed because a missing message only shows at render time.
 * Static keys only - dynamic call sites are listed in
 * docs/phase-20-i18n-blind-spots.md.
 */
function assertTranslations(): void {
  const { execFileSync } = require("node:child_process");
  try {
    execFileSync(process.execPath, ["scripts/check-i18n.mjs"], { stdio: "inherit" });
  } catch {
    throw new Error(
      "Translation check failed - see the missing keys above. " +
        "Every key used in the app must exist in all five locale files."
    );
  }
}
export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    assertSiteUrl();
    assertTranslations();
  }
  // In development the dev server calls this too, so a missing key is caught
  // on the machine that introduced it rather than in production.
  if (phase === PHASE_DEVELOPMENT_SERVER) assertTranslations();
  return withNextIntl(withPWA(nextConfig));
}
