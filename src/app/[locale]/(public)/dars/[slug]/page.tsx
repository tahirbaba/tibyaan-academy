import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { dailyDars } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";

import { SITE_URL as BASE_URL, localeMetadataAlternates } from "@/lib/site-config";
import { renderPostContent, contentToPlainText, truncateText } from "@/lib/markdown";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const categoryLabels: Record<string, Record<string, string>> = {
  quran: { en: "Quran", ur: "قرآن", ar: "القرآن", fr: "Coran", id: "Al-Quran" },
  hadith: { en: "Hadith", ur: "حدیث", ar: "الحديث", fr: "Hadith", id: "Hadits" },
  fiqh: { en: "Fiqh", ur: "فقہ", ar: "الفقه", fr: "Fiqh", id: "Fikih" },
  seerah: { en: "Seerah", ur: "سیرت", ar: "السيرة", fr: "Sira", id: "Sirah" },
  dua: { en: "Dua", ur: "دعا", ar: "الدعاء", fr: "Doua", id: "Doa" },
};

const categoryColors: Record<string, string> = {
  quran: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  hadith: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  fiqh: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  seerah: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  dua: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
};

function getLocalizedField(
  post: Record<string, unknown>,
  field: string,
  locale: string
): string {
  const key = `${field}${locale.charAt(0).toUpperCase() + locale.slice(1)}`;
  return (post[key] as string) || (post[`${field}En`] as string) || "";
}

const stripHtml = contentToPlainText;
const truncate = truncateText;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  let title = "Daily Dars | Tibyaan Academy";
  let description =
    "Read Islamic educational content from Tibyaan Academy — Quran, Hadith, Fiqh, Seerah & Dua.";
  let publishedAt: Date | undefined;
  let storedPoster: string | undefined;

  try {
    const db = getDb();
    const result = await db
      .select()
      .from(dailyDars)
      .where(eq(dailyDars.slug, slug))
      .limit(1);

    const post = result[0];
    if (post && post.status === "published") {
      const rawTitle = getLocalizedField(
        post as unknown as Record<string, unknown>,
        "title",
        locale
      );
      const rawContent = getLocalizedField(
        post as unknown as Record<string, unknown>,
        "content",
        locale
      );
      if (rawTitle) title = rawTitle;
      if (rawContent) description = truncate(stripHtml(rawContent), 160);
      publishedAt = post.publishedAt ?? undefined;
      storedPoster = post.posterUrl ?? undefined;
    }
  } catch {
    // DB unavailable at build time
  }

  // The poster stored when the dars was approved. Anything approved before
  // posters were stored has none, and falls back to the on-demand route, which
  // renders the same image. Either way it is a plain URL that can be opened
  // and saved by hand.
  const posterUrl = storedPoster ?? `${BASE_URL}/api/og/dars/${slug}`;

  return {
    title: title.includes("Tibyaan") ? title : `${title} | Tibyaan Academy`,
    description,
    alternates: localeMetadataAlternates(locale, `/dars/${slug}`),
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/dars/${slug}`,
      type: "article",
      publishedTime: publishedAt?.toISOString(),
      siteName: "Tibyaan Academy",
      images: [{ url: posterUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [posterUrl],
    },
  };
}

export default async function DarsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const db = getDb();

  const result = await db
    .select()
    .from(dailyDars)
    .where(eq(dailyDars.slug, slug))
    .limit(1);

  const post = result[0];
  if (!post || post.status !== "published") notFound();

  const title =
    getLocalizedField(post as unknown as Record<string, unknown>, "title", locale) || "Untitled";
  const content =
    getLocalizedField(post as unknown as Record<string, unknown>, "content", locale) || "";

  const htmlContent = renderPostContent(content);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: truncate(stripHtml(content), 160),
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.publishedAt?.toISOString(),
    author: {
      "@type": "Organization",
      name: "Tibyaan Academy",
    },
    publisher: {
      "@type": "Organization",
      name: "Tibyaan Academy",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icons/icon-512x512.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/${locale}/dars/${slug}`,
    },
    inLanguage: locale,
    keywords: categoryLabels[post.category]?.en ?? post.category,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        <Link href="/dars" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === "ur" ? "تمام درس" : locale === "ar" ? "جميع الدروس" : "All Dars"}</span>
        </Link>

        <article>
          {/* The poster, at the top of the page. Stored one when there is one,
              otherwise the on-demand route renders the same image. */}
          <div className="relative w-full aspect-[1200/630] rounded-xl overflow-hidden border bg-muted mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.posterUrl ?? `/api/og/dars/${post.slug}`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[post.category] ?? "bg-muted"}`}>
              {categoryLabels[post.category]?.[locale] ?? post.category}
            </span>
            {post.publishedAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{title}</h1>

          {post.sourceReference && (
            <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-muted/50 border">
              <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-sm text-muted-foreground">{post.sourceReference}</span>
            </div>
          )}

          <div
            className="prose dark:prose-invert prose-emerald max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          <div className="mt-10 p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium mb-3">
              {locale === "ur"
                ? "قرآن اور اسلامی علوم آن لائن سیکھیں"
                : locale === "ar"
                ? "تعلم القرآن والعلوم الإسلامية عبر الإنترنت"
                : locale === "fr"
                ? "Apprenez le Coran et les sciences islamiques en ligne"
                : locale === "id"
                ? "Pelajari Al-Quran dan ilmu Islam secara online"
                : "Start learning Quran & Islamic Sciences online"}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/courses/nazra-quran"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                {locale === "ur"
                  ? "ناظرہ قرآن شروع کریں"
                  : locale === "ar"
                  ? "ابدأ تعلم القراءة"
                  : "Start learning Quran with us"}
              </Link>
              {(post.category === "hadith" || post.category === "fiqh" || post.category === "seerah") ? (
                <Link
                  href="/courses/aalim-course"
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                >
                  {locale === "ur" ? "عالم کورس دیکھیں" : locale === "ar" ? "استكشف دورة العالم" : "Explore Aalim course"}
                </Link>
              ) : post.category === "quran" ? (
                <Link
                  href="/courses/hifz-quran"
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                >
                  {locale === "ur" ? "حفظ پروگرام" : locale === "ar" ? "برنامج الحفظ" : "Enroll in our Hifz program"}
                </Link>
              ) : null}
            </div>
          </div>
        </article>
      </main>
      <Footer />
      </div>
    </>
  );
}
