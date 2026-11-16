import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { BookOpen } from "lucide-react";
import { STATIC_BLOG_POSTS } from "@/lib/data/blog-seed";

import { SITE_URL as BASE_URL, localeMetadataAlternates, openGraphBase } from "@/lib/site-config";
import { contentToPlainText, truncateText } from "@/lib/markdown";
import { publishedBlogPosts, publishedDars } from "@/lib/content/publication";

type LocaleKey = "en" | "ur" | "ar" | "fr" | "id";

const blogMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "بلاگ — اسلامی تعلیم اور قرآن سیکھنے کے مشورے",
    description:
      "قرآن، حفظ، عربی اور اسلامی تعلیم کے بارے میں مفید مضامین پڑھیں — تبیان اکیڈمی بلاگ۔",
  },
  ar: {
    title: "المدونة — مقالات التعليم الإسلامي وتعلم القرآن",
    description:
      "اقرأ مقالات مفيدة عن القرآن والحفظ والعربية والتعليم الإسلامي — مدونة أكاديمية تبيان.",
  },
  en: {
    title: "Blog — Islamic Education Insights & Quran Tips",
    description:
      "Read helpful articles about Quran, Hifz, Arabic & Islamic education — Tibyaan Academy Blog.",
  },
  fr: {
    title: "Blog — Éducation islamique et conseils pour le Coran",
    description:
      "Lisez des articles utiles sur le Coran, le Hifz, l'arabe et l'éducation islamique — Blog Tibyaan Academy.",
  },
  id: {
    title: "Blog — Wawasan Pendidikan Islam & Tips Quran",
    description:
      "Baca artikel bermanfaat tentang Quran, Hifz, Bahasa Arab & pendidikan Islam — Blog Tibyaan Academy.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = blogMeta[locale] || blogMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/blog"),
    openGraph: {
      ...openGraphBase(locale),
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/blog`,
    },
  };
}

interface BlogPost {
  slug: string;
  href?: string;
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
  keywords: string[] | null;
  publishedAt: Date | null;
  aiGenerated: boolean;
  heroImage?: string;
}

function getTitle(post: BlogPost, locale: string): string {
  const map: Record<LocaleKey, string | null> = {
    en: post.titleEn,
    ur: post.titleUr,
    ar: post.titleAr,
    fr: post.titleFr,
    id: post.titleId,
  };
  return map[locale as LocaleKey] || post.titleEn || "Untitled";
}

function getExcerpt(post: BlogPost, locale: string): string {
  const map: Record<LocaleKey, string | null> = {
    en: post.contentEn,
    ur: post.contentUr,
    ar: post.contentAr,
    fr: post.contentFr,
    id: post.contentId,
  };
  const content = map[locale as LocaleKey] || post.contentEn || "";
  // Handles both Markdown and HTML sources — list mixes blog posts and dars.
  return truncateText(contentToPlainText(content), 150);
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("blog");

  let posts: BlogPost[] = [];
  try {
    const { getDb } = await import("@/lib/db");
    const { blogPosts, dailyDars } = await import("@/lib/db/schema");
    const { eq, desc } = await import("drizzle-orm");

    const db = getDb();

    // Fetch blog posts
    const dbPosts = await db
      .select({
        slug: blogPosts.slug,
        titleEn: blogPosts.titleEn,
        titleUr: blogPosts.titleUr,
        titleAr: blogPosts.titleAr,
        titleFr: blogPosts.titleFr,
        titleId: blogPosts.titleId,
        contentEn: blogPosts.contentEn,
        contentUr: blogPosts.contentUr,
        contentAr: blogPosts.contentAr,
        contentFr: blogPosts.contentFr,
        contentId: blogPosts.contentId,
        keywords: blogPosts.keywords,
        publishedAt: blogPosts.publishedAt,
        aiGenerated: blogPosts.aiGenerated,
      })
      .from(blogPosts)
      .where(publishedBlogPosts())
      .orderBy(desc(blogPosts.publishedAt));

    // Fetch daily dars posts — same source as homepage DailyDarsSection
    const darsRows = await db
      .select({
        slug: dailyDars.slug,
        titleEn: dailyDars.titleEn,
        titleUr: dailyDars.titleUr,
        titleAr: dailyDars.titleAr,
        titleFr: dailyDars.titleFr,
        titleId: dailyDars.titleId,
        contentEn: dailyDars.contentEn,
        contentUr: dailyDars.contentUr,
        contentAr: dailyDars.contentAr,
        contentFr: dailyDars.contentFr,
        contentId: dailyDars.contentId,
        category: dailyDars.category,
        publishedAt: dailyDars.publishedAt,
      })
      .from(dailyDars)
      .where(publishedDars())
      .orderBy(desc(dailyDars.publishedAt))
      .limit(20);

    const darsPosts: BlogPost[] = darsRows.map((d) => ({
      slug: d.slug,
      href: `/dars/${d.slug}`,
      titleEn: d.titleEn,
      titleUr: d.titleUr,
      titleAr: d.titleAr,
      titleFr: d.titleFr,
      titleId: d.titleId,
      contentEn: d.contentEn,
      contentUr: d.contentUr,
      contentAr: d.contentAr,
      contentFr: d.contentFr,
      contentId: d.contentId,
      keywords: [d.category],
      publishedAt: d.publishedAt,
      aiGenerated: true,
    }));

    // Merge: blog posts first, then daily dars
    posts = [...dbPosts, ...darsPosts];
  } catch {
    // DB unavailable — use static seed posts
  }

  // Fall back to static seed posts when DB has nothing
  if (posts.length === 0) {
    posts = STATIC_BLOG_POSTS.map((sp) => ({
      slug: sp.slug,
      titleEn: sp.titles.en,
      titleUr: sp.titles.ur,
      titleAr: sp.titles.ar,
      titleFr: sp.titles.fr,
      titleId: sp.titles.id,
      contentEn: sp.contents.en,
      contentUr: sp.contents.ur,
      contentAr: sp.contents.ar,
      contentFr: sp.contents.fr,
      contentId: sp.contents.id,
      keywords: [sp.category],
      publishedAt: sp.publishedAt,
      aiGenerated: false,
      heroImage: sp.heroImage,
    }));
  }

  const heroImageMap = Object.fromEntries(STATIC_BLOG_POSTS.map((sp) => [sp.slug, sp.heroImage]));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-20">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0MCA4ME0wIDQwTDgwIDQwTTAgMEw4MCA4ME04MCAwTDAgODBNMjAgMEwyMCA4ME02MCAwTDYwIDgwTTAgMjBMODAgMjBNMCA2MEw4MCA2MCIgc3Ryb2tlPSIjMUI0MzMyIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-primary">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    slug={post.slug}
                    href={post.href}
                    title={getTitle(post, locale)}
                    excerpt={getExcerpt(post, locale)}
                    publishedAt={post.publishedAt}
                    keywords={post.keywords}
                    aiGenerated={post.aiGenerated}
                    heroImage={post.heroImage ?? heroImageMap[post.slug]}
                    readMoreLabel={t("readMore")}
                    minuteReadLabel={t("minuteRead")}
                    aiGeneratedLabel={t("aiGenerated")}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="mt-4 text-muted-foreground">{t("noResults")}</p>
              </div>
            )}
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
  );
}
