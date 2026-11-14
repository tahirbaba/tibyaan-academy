import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { CohortCard } from "@/components/cohorts/cohort-card";
import { listPublishedCohorts } from "@/lib/cohorts/queries";
import { sendFailureAlert } from "@/lib/alerts";
import { localeMetadataAlternates, absoluteUrl } from "@/lib/site-config";
import { Globe2, Users, Video } from "lucide-react";

const meta: Record<string, { title: string; description: string }> = {
  en: {
    title: "Live Group Classes — Quranic Arabic & Islamic Studies",
    description:
      "Join a small live group class on Zoom with a qualified teacher. Fixed weekly schedule shown in your local time, monthly fee, one free trial class.",
  },
  ur: {
    title: "لائیو گروپ کلاسز — قرآنی عربی اور اسلامی علوم",
    description:
      "مستند استاد کے ساتھ زوم پر چھوٹی لائیو گروپ کلاس میں شامل ہوں۔ ہفتہ وار مقررہ اوقات آپ کے مقامی وقت میں، ماہانہ فیس، ایک مفت آزمائشی کلاس۔",
  },
  ar: {
    title: "حصص جماعية مباشرة — العربية القرآنية والعلوم الإسلامية",
    description:
      "انضم إلى حصة جماعية صغيرة مباشرة عبر زوم مع معلم مؤهل. جدول أسبوعي ثابت بتوقيتك المحلي، رسوم شهرية، وحصة تجريبية مجانية.",
  },
  fr: {
    title: "Cours collectifs en direct — Arabe coranique et sciences islamiques",
    description:
      "Rejoignez un petit cours collectif en direct sur Zoom avec un enseignant qualifié. Horaire hebdomadaire fixe affiché à votre heure locale, tarif mensuel, un cours d'essai gratuit.",
  },
  id: {
    title: "Kelas Grup Langsung — Bahasa Arab Al-Quran & Studi Islam",
    description:
      "Ikuti kelas grup kecil secara langsung di Zoom bersama guru yang berkualifikasi. Jadwal mingguan tetap dalam waktu lokal Anda, biaya bulanan, satu kelas percobaan gratis.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[locale] || meta.en;
  return {
    title: m.title,
    description: m.description,
    alternates: localeMetadataAlternates(locale, "/group-classes"),
    openGraph: {
      title: m.title,
      description: m.description,
      url: absoluteUrl(locale, "/group-classes"),
    },
  };
}

export default async function GroupClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("cohorts");

  // A failed query must not render as "no classes yet" — that is a different
  // and much worse statement. Alert and rethrow. (docs/silent-failure-sites.md)
  let cohorts: Awaited<ReturnType<typeof listPublishedCohorts>>;
  try {
    cohorts = await listPublishedCohorts();
  } catch (error) {
    await sendFailureAlert({
      source: "/group-classes",
      summary:
        "The group classes list failed to load — visitors see an error page, not an empty list.",
      error,
    });
    throw error;
  }

  const points = [
    { icon: Video, text: t("point1") },
    { icon: Users, text: t("point2") },
    { icon: Globe2, text: t("point3") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="pattern-stars relative overflow-hidden bg-primary text-primary-foreground">
          <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 md:py-24 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              {t("eyebrow")}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-primary-foreground/80">
              {t("subtitle")}
            </p>
            <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 text-start sm:grid-cols-3">
              {points.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {cohorts.length === 0 ? (
            <p className="mx-auto max-w-xl rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              {t("noneYet")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {cohorts.map((cohort) => (
                <CohortCard key={cohort.id} cohort={cohort} locale={locale} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
