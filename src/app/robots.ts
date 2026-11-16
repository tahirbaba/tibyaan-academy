import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Every page lives under a locale prefix (/en/student/…), so a rule of
        // "/student/" matched nothing and the dashboards were never actually
        // disallowed. "/*/student/" is the pattern that matches them; the
        // public /teachers directory is deliberately not caught by it.
        disallow: [
          "/*/student/",
          "/*/teacher/",
          "/*/admin/",
          "/*/login",
          "/*/signup",
          "/*/onboarding",
          "/api/",
        ],
      },
    ],
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
