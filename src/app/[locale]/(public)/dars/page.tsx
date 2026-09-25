import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { listDars, type DarsRow } from "@/lib/db/dars-queries";
import { sendFailureAlert } from "@/lib/alerts";
import { Link } from "@/i18n/navigation";
import { BookOpen, Calendar } from "lucide-react";
import { localeMetadataAlternates, absoluteUrl } from "@/lib/site-config";
import { publishedDars } from "@/lib/content/publication";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const darsMeta: Record<string, { title: string; description: string }> = {
  ur: { title: "روزانہ درس — قرآن، حدیث، فقہ و سیرت", description: "تبیان اکیڈمی کا روزانہ درس — قرآن، حدیث، فقہ، سیرت اور دعا۔" },
  ar: { title: "الدرس اليومي — القرآن والحديث والفقه والسيرة", description: "الدرس اليومي من أكاديمية تبيان — القرآن والحديث والفقه والسيرة والدعاء." },
  en: { title: "Daily Dars — Quran, Hadith, Fiqh & Seerah", description: "Daily Islamic lessons from Tibyaan Academy — Quran, Hadith, Fiqh, Seerah and Dua." },
  fr: { title: "Dars Quotidien — Coran, Hadith, Fiqh et Sîra", description: "Leçons islamiques quotidiennes de Tibyaan Academy — Coran, Hadith, Fiqh, Sîra et Dua." },
  id: { title: "Dars Harian — Quran, Hadits, Fiqih & Sirah", description: "Pelajaran Islam harian dari Tibyaan Academy — Quran, Hadits, Fiqih, Sirah dan Doa." },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = darsMeta[locale] || darsMeta.en;
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/dars"),
    openGraph: { title: meta.title, description: meta.description, url: absoluteUrl(locale, "/dars") },
  };
}

const categoryColors: Record<string, string> = {
  quran: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  hadith: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  fiqh: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  seerah: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  dua: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
};

const categoryLabels: Record<string, Record<string, string>> = {
  quran: { en: "Quran", ur: "قرآن", ar: "القرآن", fr: "Coran", id: "Al-Quran" },
  hadith: { en: "Hadith", ur: "حدیث", ar: "الحديث", fr: "Hadith", id: "Hadits" },
  fiqh: { en: "Fiqh", ur: "فقہ", ar: "الفقه", fr: "Fiqh", id: "Fikih" },
  seerah: { en: "Seerah", ur: "سیرت", ar: "السيرة", fr: "Sira", id: "Sirah" },
  dua: { en: "Dua", ur: "دعا", ar: "الدعاء", fr: "Doua", id: "Doa" },
};

export default async function DarsListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  /**
   * Deliberately NOT wrapped in a try/catch.
   *
   * It used to be, and the catch set posts to [] — so when the query started
   * failing (poster_url missing from the database) this page returned HTTP 200
   * with "No dars posts yet. Check back soon!" while 55 published dars sat in
   * the table. A 500 gets noticed; a clean empty page does not, and Google
   * reads the cheerful one as the truth.
   *
   * A failure here must reach the error boundary and alert, not be dressed up
   * as an empty shelf. Genuinely having no dars is a different thing, and the
   * page still says so when the query succeeds and returns nothing.
   *
   * listDars() already survives a missing recoverable column on its own, so
   * this throws only for real faults.
   */
  let posts;
  try {
    posts = await listDars(publishedDars(), 50, "dars list page");
  } catch (error) {
    // Alert, then rethrow. The catch exists to make the failure louder, never
    // to absorb it: the page still errors and the error boundary still shows.
    await sendFailureAlert({
      source: "/dars list page",
      summary: "The dars list query failed — the page is erroring for every visitor.",
      error,
      context: { locale },
    });
    throw error;
  }

  const titleKey = `title${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof DarsRow;

  const pageTitle: Record<string, string> = {
    en: "Daily Dars",
    ur: "یومیہ درس",
    ar: "الدرس اليومي",
    fr: "Dars Quotidien",
    id: "Dars Harian",
  };

  const pageSubtitle: Record<string, string> = {
    en: "Daily Islamic knowledge - Quran, Hadith, Fiqh, Seerah & Dua",
    ur: "روزانہ اسلامی علم - قرآن، حدیث، فقہ، سیرت اور دعا",
    ar: "المعرفة الإسلامية اليومية - القرآن والحديث والفقه والسيرة والدعاء",
    fr: "Savoir islamique quotidien - Coran, Hadith, Fiqh, Sira et Doua",
    id: "Pengetahuan Islam harian - Al-Quran, Hadits, Fikih, Sirah & Doa",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-7 h-7 text-emerald-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {pageTitle[locale] ?? pageTitle.en}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          {pageSubtitle[locale] ?? pageSubtitle.en}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No dars posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const title = (post[titleKey] as string) || post.titleEn || "Untitled";
            return (
              <Link key={post.id} href={`/dars/${post.slug}`} className="block h-full">
                <div className="h-full rounded-xl border bg-card overflow-hidden hover:bg-muted/30 hover:border-emerald-600/40 transition-colors group">
                  {/* The stored poster when the dars has one, otherwise the
                      on-demand route — so cards still work for anything
                      approved before posters were stored. */}
                  <div className="relative w-full aspect-[1200/630] bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.posterUrl ?? `/api/og/dars/${post.slug}`}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[post.category] ?? "bg-muted text-muted-foreground"}`}>
                          {categoryLabels[post.category]?.[locale] ?? post.category}
                        </span>
                        {post.publishedAt && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                        {title}
                      </h2>
                      {post.sourceReference && (
                        <p className="text-xs text-muted-foreground mt-1">{post.sourceReference}</p>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
}
