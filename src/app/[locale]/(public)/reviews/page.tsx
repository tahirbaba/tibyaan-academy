import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Star } from "lucide-react";

import { SITE_URL as BASE_URL, localeMetadataAlternates, openGraphBase } from "@/lib/site-config";

const reviewsMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "جائزے — تبیان اکیڈمی",
    description: "تبیان اکیڈمی کے طلبا کے تجربات اور جائزے پڑھیں۔",
  },
  ar: {
    title: "التقييمات — أكاديمية تبيان",
    description: "اقرأ تجارب وتقييمات طلاب أكاديمية تبيان.",
  },
  en: {
    title: "Reviews — Tibyaan Academy",
    description: "Read reviews and experiences from Tibyaan Academy students.",
  },
  fr: {
    title: "Avis — Tibyaan Academy",
    description: "Lisez les avis et expériences des étudiants de Tibyaan Academy.",
  },
  id: {
    title: "Ulasan — Tibyaan Academy",
    description: "Baca ulasan dan pengalaman siswa Tibyaan Academy.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = reviewsMeta[locale] || reviewsMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/reviews"),
    openGraph: {
      ...openGraphBase(locale),
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/reviews`,
    },
  };
}

interface Review {
  id: string;
  fullName: string | null;
  courseType: string | null;
  rating: number;
  reviewText: string | null;
  isFeatured: boolean;
  createdAt: Date | null;
}

export default async function ReviewsPage() {
  const t = await getTranslations("reviewsSection");

  let reviews: Review[] = [];
  try {
    const { getDb } = await import("@/lib/db");
    const { reviews: reviewsTable, users, courses } = await import("@/lib/db/schema");
    const { eq, desc } = await import("drizzle-orm");

    const db = getDb();
    reviews = await db
      .select({
        id: reviewsTable.id,
        fullName: users.fullName,
        courseType: courses.courseType,
        rating: reviewsTable.rating,
        reviewText: reviewsTable.reviewText,
        isFeatured: reviewsTable.isFeatured,
        createdAt: reviewsTable.createdAt,
      })
      .from(reviewsTable)
      .innerJoin(users, eq(reviewsTable.studentId, users.id))
      .innerJoin(courses, eq(reviewsTable.courseId, courses.id))
      .where(eq(reviewsTable.isApproved, true))
      .orderBy(desc(reviewsTable.createdAt));
  } catch {
    // DB unavailable — show empty state
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Star className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-primary">
              {t("title")}
            </h1>
            {reviews.length > 0 && (
              <p className="mt-4 text-lg text-muted-foreground">
                {t("totalReviews")}: {reviews.length}
              </p>
            )}
          </div>
        </section>

        {/* Reviews Grid */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className={`bg-card border rounded-xl p-6 ${
                      review.isFeatured ? "ring-2 ring-primary/20" : ""
                    }`}
                  >
                    {review.isFeatured && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {t("featuredReview")}
                      </span>
                    )}
                    <div className="flex gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {review.reviewText && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        &ldquo;{review.reviewText}&rdquo;
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {review.fullName || "Student"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("verifiedStudent")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Star className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="mt-4 text-muted-foreground">{t("noReviews")}</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
