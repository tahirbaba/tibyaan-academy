import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display serif for headings (Latin-script locales). Self-hosted by next/font
// with a size-adjusted fallback, so it neither blocks rendering nor shifts
// layout when it swaps in.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { SITE_URL as BASE_URL } from "@/lib/site-config";
import { lowestPrice, highestPrice } from "@/lib/pricing";
import { getPricingOrNull } from "@/lib/pricing-server";

const rtlLocales = ["ur", "ar"];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Tibyaan Academy",
  url: BASE_URL,
  logo: `${BASE_URL}/icons/icon-512x512.svg`,
  description:
    "Modern Digital Madrasah for Quran & Islamic Sciences — live teachers + AI Ustaz",
  foundingDate: "2024",
  areaServed: ["GB", "US", "AE", "CA", "AU", "ID", "SA", "DE", "PK", "FR"],
  availableLanguage: ["English", "Urdu", "Arabic", "French", "Indonesian"],
  sameAs: [
    "https://www.youtube.com/channel/UCBU7Fc9ZjYU42SHfSQM9_rg",
    "https://www.linkedin.com/in/tibyaan-academy-0263b73bb/",
    "https://x.com/TibyaanAcademy",
    "https://web.facebook.com/profile.php?id=61576509186955",
    "https://www.instagram.com/tibyaanacademy/",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Urdu", "Arabic", "French", "Indonesian"],
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Tibyaan Academy — Online Quran & Islamic Education",
    template: "%s | Tibyaan Academy",
  },
  description:
    "Learn Quran, Hifz, Arabic & Islamic Sciences online with live teachers + AI Ustaz. 5-day free trial. Available in UK, USA, UAE, Canada, Australia.",
  authors: [{ name: "Tibyaan Academy" }],
  creator: "Tibyaan Academy",
  publisher: "Tibyaan Academy",
  openGraph: {
    type: "website",
    siteName: "Tibyaan Academy",
    title: "Tibyaan Academy — Modern Digital Madrasah",
    description:
      "Learn Quran, Hifz, Arabic & Islamic Sciences online. Live teachers + AI Ustaz. 5-day free trial.",
    url: BASE_URL,
    locale: "en_US",
    alternateLocale: ["ur_PK", "ar_SA", "fr_FR", "id_ID"],
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tibyaan Academy — Online Quran Education",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tibyaan Academy — Online Quran & Islamic Education",
    description:
      "Learn Quran, Hifz, Arabic & Islamic Sciences online with live teachers + AI Ustaz.",
    images: ["/og-image.png"],
    creator: "@TibyaanAcademy",
  },
  verification: {
    google: "tamP0xBeTO981V7OWrKzNvCzRPvvsT7xQ9szNZKHpjU",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";
  // Measurement ID comes from the environment — never hard-coded.
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // Price range in the structured data comes from the pricing config. If it
  // cannot be read the offer is omitted — never filled with a guessed number.
  const pricing = await getPricingOrNull();
  const organizationWithOffers = pricing
    ? {
        ...organizationJsonLd,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: pricing.currency,
          lowPrice: String(lowestPrice(pricing)),
          highPrice: String(highestPrice(pricing)),
          offerCount: "7",
        },
      }
    : organizationJsonLd;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1B4332" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tibyaan Academy" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="alternate" type="application/rss+xml" title="Tibyaan Academy Blog" href="/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationWithOffers),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
