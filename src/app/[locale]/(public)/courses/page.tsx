import type { Metadata } from "next";
import { getPricing } from "@/lib/pricing-server";
import { feeSentence } from "@/lib/pricing";
import CoursesPageClient from "@/components/courses/courses-page-client";

import { SITE_URL as BASE_URL, localeMetadataAlternates } from "@/lib/site-config";

const coursesMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "کورسز — قرآن، حفظ، عربی اور عالم کورس",
    description:
      "تبیان اکیڈمی کے تمام کورسز دیکھیں — ناظرہ قرآن، حفظ، عربی زبان اور دارس نظامی۔",
  },
  ar: {
    title: "الدورات — القرآن والحفظ والعربية ودورة العالم",
    description:
      "تصفح جميع دورات أكاديمية تبيان — الناظرة والحفظ والعربية والعالم.",
  },
  en: {
    title: "Courses — Quran, Hifz, Arabic & Aalim Course",
    description:
      "Browse all Tibyaan Academy courses — Nazra Quran, Hifz, Arabic Language & Dars-e-Nizami.",
  },
  fr: {
    title: "Cours — Coran, Hifz, Arabe et Cours Aalim",
    description:
      "Découvrez tous les cours de Tibyaan Academy — Nazra Coran, Hifz, Langue Arabe & Dars-e-Nizami.",
  },
  id: {
    title: "Kursus — Quran, Hifz, Bahasa Arab & Kursus Aalim",
    description:
      "Jelajahi semua kursus Tibyaan Academy — Nazra Quran, Hifz, Bahasa Arab & Dars-e-Nizami.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = coursesMeta[locale] || coursesMeta.en;
  const pricing = await getPricing();
  const meta = {
    title: base.title,
    description: `${base.description} ${feeSentence(locale, pricing)}`,
  };

  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/courses"),
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/courses`,
    },
  };
}

export default async function CoursesPage() {
  const pricing = await getPricing();
  return <CoursesPageClient pricing={pricing} />;
}
