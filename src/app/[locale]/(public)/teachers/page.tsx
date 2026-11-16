import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { users, teacherProfiles, teacherVideos } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import { Users, Star, BookOpen, Play } from "lucide-react";
import { localeMetadataAlternates, absoluteUrl, openGraphBase } from "@/lib/site-config";

const teachersMeta: Record<string, { title: string; description: string }> = {
  ur: { title: "ہمارے اساتذہ — مستند قرآن ٹیچرز", description: "تبیان اکیڈمی کے مستند اساتذہ سے ملیں — قرآن، حفظ، عربی اور اسلامی علوم۔" },
  ar: { title: "أساتذتنا — معلمو القرآن المعتمدون", description: "تعرف على معلمي أكاديمية تبيان المعتمدين — القرآن والحفظ والعربية." },
  en: { title: "Our Teachers — Certified Quran Tutors", description: "Meet Tibyaan Academy's certified teachers for Quran, Hifz, Arabic and Islamic sciences." },
  fr: { title: "Nos Enseignants — Professeurs de Coran Certifiés", description: "Rencontrez les enseignants certifiés de Tibyaan Academy — Coran, Hifz et arabe." },
  id: { title: "Guru Kami — Pengajar Quran Bersertifikat", description: "Kenali guru bersertifikat Tibyaan Academy — Quran, Hifz, Bahasa Arab." },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = teachersMeta[locale] || teachersMeta.en;
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/teachers"),
    openGraph: {
      ...openGraphBase(locale), title: meta.title, description: meta.description, url: absoluteUrl(locale, "/teachers") },
  };
}

const pageTitle: Record<string, string> = {
  en: "Our Teachers",
  ur: "ہمارے اساتذہ",
  ar: "أساتذتنا",
  fr: "Nos Enseignants",
  id: "Guru Kami",
};

const pageSubtitle: Record<string, string> = {
  en: "Meet our qualified Quran and Islamic studies teachers",
  ur: "ہمارے اہل اساتذہ سے ملیں - قرآن اور اسلامی علوم",
  ar: "تعرف على معلمينا المؤهلين في القرآن والدراسات الإسلامية",
  fr: "Rencontrez nos enseignants qualifiés en Coran et études islamiques",
  id: "Temui guru Al-Quran dan studi Islam kami yang berkualitas",
};

export default async function TeachersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const db = getDb();

  // Get teachers with profiles and at least one approved public video
  let teachers: Array<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
    bio: string | null;
    specializations: string[] | null;
    yearsExperience: number | null;
    averageRating: string | null;
    totalStudents: number;
    videoCount: number;
  }> = [];

  try {
    const rows = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        bio: teacherProfiles.bio,
        specializations: teacherProfiles.specializations,
        yearsExperience: teacherProfiles.yearsExperience,
        averageRating: teacherProfiles.averageRating,
        totalStudents: teacherProfiles.totalStudents,
        videoCount: sql<number>`count(${teacherVideos.id})::int`,
      })
      .from(users)
      .innerJoin(teacherProfiles, eq(users.id, teacherProfiles.userId))
      .leftJoin(
        teacherVideos,
        and(
          eq(teacherVideos.teacherId, users.id),
          eq(teacherVideos.status, "approved"),
          eq(teacherVideos.isPublic, true)
        )
      )
      .where(
        and(
          eq(users.role, "teacher"),
          eq(teacherProfiles.isAvailable, true)
        )
      )
      .groupBy(
        users.id,
        users.fullName,
        users.avatarUrl,
        teacherProfiles.bio,
        teacherProfiles.specializations,
        teacherProfiles.yearsExperience,
        teacherProfiles.averageRating,
        teacherProfiles.totalStudents
      )
      .orderBy(desc(teacherProfiles.totalStudents));

    teachers = rows;
  } catch (err) {
    console.error("Failed to load teachers:", err);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7 text-emerald-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {pageTitle[locale] ?? pageTitle.en}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          {pageSubtitle[locale] ?? pageSubtitle.en}
        </p>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No teachers available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Link key={teacher.id} href={`/teachers/${teacher.id}`}>
              <div className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Avatar */}
                <div className="h-48 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900 dark:to-emerald-950 flex items-center justify-center relative">
                  {teacher.avatarUrl ? (
                    <img
                      src={teacher.avatarUrl}
                      alt={teacher.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center">
                      <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {teacher.fullName.charAt(0)}
                      </span>
                    </div>
                  )}
                  {teacher.videoCount > 0 && (
                    <div className="absolute bottom-2 end-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {teacher.videoCount}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-lg group-hover:text-emerald-600 transition-colors">
                    {teacher.fullName}
                  </h3>

                  {teacher.bio && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {teacher.bio}
                    </p>
                  )}

                  {teacher.specializations && teacher.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {teacher.specializations.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    {teacher.averageRating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {parseFloat(teacher.averageRating).toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {teacher.totalStudents} students
                    </span>
                    {teacher.yearsExperience && (
                      <span>{teacher.yearsExperience} yrs exp</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
