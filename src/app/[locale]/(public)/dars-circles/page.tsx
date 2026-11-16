import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { darsCircles, users } from "@/lib/db/schema";
import { eq, gte } from "drizzle-orm";
import { getLocale, getTranslations } from "next-intl/server";
import { Calendar, Users, BookOpen } from "lucide-react";
import { localeMetadataAlternates, absoluteUrl, openGraphBase } from "@/lib/site-config";

const circlesMeta: Record<string, { title: string; description: string }> = {
  ur: { title: "درس سرکل — لائیو گروپ کلاسز", description: "تبیان اکیڈمی کے لائیو درس سرکل میں شامل ہوں — گروپ اسلامی کلاسز۔" },
  ar: { title: "حلقات الدرس — دروس جماعية مباشرة", description: "انضم إلى حلقات الدرس المباشرة في أكاديمية تبيان." },
  en: { title: "Dars Circles — Live Group Study Classes", description: "Join Tibyaan Academy's live Dars Circles — group Islamic study sessions." },
  fr: { title: "Cercles de Dars — Cours Collectifs en Direct", description: "Rejoignez les Cercles de Dars en direct de Tibyaan Academy." },
  id: { title: "Lingkaran Dars — Kelas Kelompok Langsung", description: "Ikuti Lingkaran Dars langsung Tibyaan Academy — kajian Islam berkelompok." },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = circlesMeta[locale] || circlesMeta.en;
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/dars-circles"),
    openGraph: {
      ...openGraphBase(locale), title: meta.title, description: meta.description, url: absoluteUrl(locale, "/dars-circles") },
  };
}

function getLocalizedTitle(
  circle: { titleUr: string | null; titleAr: string | null; titleEn: string | null; titleFr: string | null; titleId: string | null },
  locale: string
): string {
  const map: Record<string, string | null> = {
    ur: circle.titleUr,
    ar: circle.titleAr,
    en: circle.titleEn,
    fr: circle.titleFr,
    id: circle.titleId,
  };
  return map[locale] || circle.titleEn || circle.titleUr || "Dars Circle";
}

export default async function PublicDarsCirclesPage() {
  const locale = await getLocale();
  const t = await getTranslations("darsCircles");
  const db = getDb();

  const circles = await db
    .select({
      id: darsCircles.id,
      titleUr: darsCircles.titleUr,
      titleAr: darsCircles.titleAr,
      titleEn: darsCircles.titleEn,
      titleFr: darsCircles.titleFr,
      titleId: darsCircles.titleId,
      category: darsCircles.category,
      scheduledAt: darsCircles.scheduledAt,
      maxStudents: darsCircles.maxStudents,
      currentStudents: darsCircles.currentStudents,
      status: darsCircles.status,
      teacherName: users.fullName,
    })
    .from(darsCircles)
    .innerJoin(users, eq(darsCircles.teacherId, users.id))
    .where(gte(darsCircles.scheduledAt, new Date()));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground">{t("publicTitle")}</h1>
        <p className="text-muted-foreground mt-2">{t("publicSubtitle")}</p>
      </div>

      {circles.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {t("noCircles")}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles.map((circle) => (
            <div
              key={circle.id}
              className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                  {circle.category}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium capitalize">
                  {circle.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-1">
                {getLocalizedTitle(circle, locale)}
              </h3>

              <p className="text-sm text-muted-foreground mb-4">
                {circle.teacherName}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(circle.scheduledAt).toLocaleDateString(locale, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {circle.currentStudents}/{circle.maxStudents}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
