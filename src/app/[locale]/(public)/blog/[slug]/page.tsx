import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BlogContent } from "@/components/blog/blog-content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { STATIC_BLOG_POSTS } from "@/lib/data/blog-seed";

import { SITE_URL as BASE_URL, localeMetadataAlternates, openGraphBase } from "@/lib/site-config";
import { publishedBlogPosts } from "@/lib/content/publication";

type LocaleKey = "en" | "ur" | "ar" | "fr" | "id";

interface BlogPostData {
  slug: string;
  titleEn: string | null;
  titleUr: string | null;
  titleAr: string | null;
  titleFr: string | null;
  titleId: string | null;
  contentEn: string | null;
  contentUr: string | null;
  contentAr: string | null;
  contentFr: string | null;
  contentId: string | null;
  metaDescriptionEn: string | null;
  metaDescriptionUr: string | null;
  keywords: string[] | null;
  publishedAt: Date | null;
  aiGenerated: boolean;
}

function getTitle(post: BlogPostData, locale: string): string {
  const map: Record<LocaleKey, string | null> = {
    en: post.titleEn,
    ur: post.titleUr,
    ar: post.titleAr,
    fr: post.titleFr,
    id: post.titleId,
  };
  return map[locale as LocaleKey] || post.titleEn || "Untitled";
}

function getContent(post: BlogPostData, locale: string): string {
  const map: Record<LocaleKey, string | null> = {
    en: post.contentEn,
    ur: post.contentUr,
    ar: post.contentAr,
    fr: post.contentFr,
    id: post.contentId,
  };
  return map[locale as LocaleKey] || post.contentEn || "";
}

function getMetaDesc(post: BlogPostData, locale: string): string {
  if (locale === "ur" && post.metaDescriptionUr) return post.metaDescriptionUr;
  return post.metaDescriptionEn || "";
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function getPost(slug: string): Promise<BlogPostData | null> {
  try {
    const { getDb } = await import("@/lib/db");
    const { blogPosts } = await import("@/lib/db/schema");
    const { eq, and } = await import("drizzle-orm");

    const db = getDb();
    const results = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), publishedBlogPosts()))
      .limit(1);

    if (results[0]) return results[0];
  } catch {
    // fall through to static posts
  }

  // Fall back to static seed articles
  const staticPost = STATIC_BLOG_POSTS.find((sp) => sp.slug === slug);
  if (staticPost) {
    return {
      slug: staticPost.slug,
      titleEn: staticPost.titles.en,
      titleUr: staticPost.titles.ur,
      titleAr: staticPost.titles.ar,
      titleFr: staticPost.titles.fr,
      titleId: staticPost.titles.id,
      contentEn: staticPost.contents.en,
      contentUr: staticPost.contents.ur,
      contentAr: staticPost.contents.ar,
      contentFr: staticPost.contents.fr,
      contentId: staticPost.contents.id,
      metaDescriptionEn: staticPost.titles.en,
      metaDescriptionUr: staticPost.titles.ur,
      keywords: [staticPost.category],
      publishedAt: staticPost.publishedAt,
      aiGenerated: false,
    };
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  const title = getTitle(post, locale);
  const description = getMetaDesc(post, locale);

  // Rendered on demand by /api/og/blog/[slug] — also the plain URL to grab for
  // manual posting.
  const posterUrl = `${BASE_URL}/api/og/blog/${slug}`;

  return {
    title,
    description,
    alternates: localeMetadataAlternates(locale, `/blog/${slug}`),
    openGraph: {
      ...openGraphBase(locale),
      title,
      description,
      url: `${BASE_URL}/${locale}/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
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

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("blog");

  const post = await getPost(slug);
  if (!post) {
    notFound();
  }

  const title = getTitle(post, locale);
  const content = getContent(post, locale);
  const readTime = estimateReadTime(content);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: getMetaDesc(post, locale),
    datePublished: post.publishedAt?.toISOString(),
    author: {
      "@type": "Organization",
      name: "Tibyaan Academy",
    },
    publisher: {
      "@type": "Organization",
      name: "Tibyaan Academy",
      url: BASE_URL,
    },
    mainEntityOfPage: `${BASE_URL}/${locale}/blog/${slug}`,
    keywords: post.keywords?.join(", "),
    inLanguage: locale,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="bg-muted/30 border-b">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                <Link
                  href="/"
                  className="hover:text-primary transition-colors"
                >
                  Home
                </Link>
                <ChevronRight className="w-3 h-3" />
                <Link
                  href="/blog"
                  className="hover:text-primary transition-colors"
                >
                  {t("title")}
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground truncate max-w-[200px]">
                  {title}
                </span>
              </nav>
            </div>
          </div>

          {/* Article Header */}
          <section className="py-10 md:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Keywords */}
              {post.keywords && post.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.keywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight">
                {title}
              </h1>

              {/* Meta info */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {post.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {t("publishedOn")}{" "}
                    {new Date(post.publishedAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {readTime} {t("minuteRead")}
                </span>
                {post.aiGenerated && (
                  <span className="flex items-center gap-1.5 text-accent">
                    <Sparkles className="w-4 h-4" />
                    {t("aiGenerated")}
                  </span>
                )}
              </div>

              <hr className="mt-8 border-border" />
            </div>
          </section>

          {/* Article Content */}
          <section className="pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <BlogContent content={content} />
            </div>
          </section>

          {/* Back to blog */}
          <section className="pb-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link href="/blog">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t("allArticles")}
                </Button>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-primary text-primary-foreground">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold">
                {t("startTrial")}
              </h2>
              <p className="mt-3 text-primary-foreground/80">
                {t("startTrialDesc")}
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="mt-8 h-12 px-8 bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg"
                >
                  {t("startTrialButton")}
                </Button>
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
