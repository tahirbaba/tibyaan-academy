import type { Metadata } from "next";
import CourseDetailClient from "@/components/courses/course-detail-client";

import { SITE_URL as BASE_URL, localeMetadataAlternates } from "@/lib/site-config";
import { COURSE_SLUG_TO_KEY, aiOnlyMonthly } from "@/lib/pricing";
import { getPricing } from "@/lib/pricing-server";

const courseInfo: Record<
  string,
  {
    nameEn: string;
    nameUr: string;
    nameAr: string;
    nameFr: string;
    nameId: string;
    descEn: string;
    descUr: string;
  }
> = {
  "nazra-quran": {
    nameEn: "Nazra Quran — Learn to Read Quran",
    nameUr: "ناظرہ قرآن — قرآن پاک پڑھنا سیکھیں",
    nameAr: "الناظرة — تعلم قراءة القرآن",
    nameFr: "Nazra Coran — Apprendre à lire le Coran",
    nameId: "Nazra Quran — Belajar Membaca Quran",
    descEn:
      "Learn to read Quran with proper Tajweed from certified teachers + AI Ustaz. 3-6 months program. From ${price}/month.",
    descUr:
      "تجوید کے ساتھ قرآن پاک پڑھنا سیکھیں۔ مستند اساتذہ + AI استاذ۔ 3-6 ماہ۔ ${price} ماہانہ سے۔",
  },
  "hifz-quran": {
    nameEn: "Hifz Quran — Memorize the Holy Quran",
    nameUr: "حفظ قرآن — قرآن پاک حفظ کریں",
    nameAr: "حفظ القرآن — احفظ القرآن الكريم",
    nameFr: "Hifz Coran — Mémoriser le Saint Coran",
    nameId: "Hifz Quran — Hafal Al-Quran",
    descEn:
      "Complete Hifz program with daily Sabaq, Sabqi & Manzil tracking. AI-powered revision. From ${price}/month.",
    descUr:
      "مکمل حفظ پروگرام — روزانہ سبق، سبقی اور منزل ٹریکنگ۔ AI سے ریویژن۔ ${price} ماہانہ سے۔",
  },
  "arabic-language": {
    nameEn: "Arabic Language — Learn Arabic for Quran",
    nameUr: "عربی زبان — قرآن کے لیے عربی سیکھیں",
    nameAr: "اللغة العربية — تعلم العربية للقرآن",
    nameFr: "Langue Arabe — Apprendre l'arabe pour le Coran",
    nameId: "Bahasa Arab — Belajar Bahasa Arab untuk Quran",
    descEn:
      "Learn Arabic grammar, vocabulary & conversation with Quran focus. 6-12 months. From ${price}/month.",
    descUr:
      "عربی گرامر، الفاظ اور مکالمہ سیکھیں — قرآنی عربی پر فوکس۔ 6-12 ماہ۔ ${price} ماہانہ سے۔",
  },
  "aalim-course": {
    nameEn: "Aalim Course — Dars-e-Nizami Online",
    nameUr: "عالم کورس — آن لائن درس نظامی",
    nameAr: "دورة العالم — درس نظامي أونلاين",
    nameFr: "Cours Aalim — Dars-e-Nizami en ligne",
    nameId: "Kursus Aalim — Dars-e-Nizami Online",
    descEn:
      "Complete Dars-e-Nizami / Aalim program online — Fiqh, Hadith, Tafseer & more. 2-8 years. From ${price}/month.",
    descUr:
      "مکمل درس نظامی / عالم کورس — فقہ، حدیث، تفسیر اور مزید۔ 2-8 سال۔ ${price} ماہانہ سے۔",
  },
};

type LocaleKey = "en" | "ur" | "ar" | "fr" | "id";

function getCourseTitle(
  info: (typeof courseInfo)[string],
  locale: string
): string {
  const nameMap: Record<LocaleKey, string> = {
    en: info.nameEn,
    ur: info.nameUr,
    ar: info.nameAr,
    fr: info.nameFr,
    id: info.nameId,
  };
  return nameMap[locale as LocaleKey] || info.nameEn;
}

function getCourseDesc(
  info: (typeof courseInfo)[string],
  locale: string
): string {
  if (locale === "ur") return info.descUr;
  return info.descEn;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const info = courseInfo[slug];

  if (!info) {
    return { title: "Course Not Found" };
  }

  const title = getCourseTitle(info, locale);
  const pricing = await getPricing();
  const price = String(aiOnlyMonthly(pricing, COURSE_SLUG_TO_KEY[slug]));
  const description = getCourseDesc(info, locale).replace("{price}", price);

  return {
    title,
    description,
    alternates: localeMetadataAlternates(locale, `/courses/${slug}`),
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/courses/${slug}`,
      type: "website",
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const info = courseInfo[slug];
  const pricing = await getPricing();
  const price = info
    ? String(aiOnlyMonthly(pricing, COURSE_SLUG_TO_KEY[slug]))
    : "";

  const courseJsonLd = info
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: info.nameEn,
        description: info.descEn.replace("{price}", price),
        provider: {
          "@type": "Organization",
          name: "Tibyaan Academy",
          url: BASE_URL,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price,
          availability: "https://schema.org/InStock",
        },
        educationalLevel: "Beginner to Advanced",
        inLanguage: ["en", "ur", "ar", "fr", "id"],
      }
    : null;

  return (
    <>
      {courseJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
        />
      )}
      <CourseDetailClient pricing={pricing} />
    </>
  );
}
