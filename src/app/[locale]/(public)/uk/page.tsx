import type { Metadata } from "next";
import { CountryPageTemplate } from "@/components/country/country-page-template";
import { UK_PAGE } from "@/lib/data/country-pages";
import { localeMetadataAlternates, absoluteUrl } from "@/lib/site-config";

const metaByLocale: Record<string, { title: string; description: string }> = {
  en: {
    title: "Best Online Quran Classes in UK | Tibyaan Academy",
    description: "Join Muslims in the UK learning Quran, Hifz, and Arabic online. Live 1-on-1 teachers + AI Ustaz. Start your 5-day free trial today.",
  },
  ur: {
    title: "برطانیہ میں بہترین آن لائن قرآن کلاسز | تبیان اکیڈمی",
    description: "برطانیہ میں مسلمانوں کے ساتھ شامل ہوں جو آن لائن قرآن، حفظ اور عربی سیکھ رہے ہیں۔ 5 دن مفت ٹرائل۔",
  },
  ar: {
    title: "أفضل دروس القرآن عبر الإنترنت في المملكة المتحدة | أكاديمية تبيان",
    description: "انضم إلى أكثر من 500 مسلم في المملكة المتحدة يتعلمون القرآن والحفظ والعربية عبر الإنترنت.",
  },
  fr: {
    title: "Meilleurs cours de Coran en ligne au Royaume-Uni | Tibyaan Academy",
    description: "Rejoignez les musulmans au Royaume-Uni apprenant le Coran en ligne. Essai gratuit de 5 jours.",
  },
  id: {
    title: "Kelas Quran Online Terbaik di Inggris | Tibyaan Academy",
    description: "Bergabunglah dengan Muslim di Inggris belajar Quran online. Uji coba gratis 5 hari.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = metaByLocale[locale] || metaByLocale.en;
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/uk"),
    openGraph: { title: meta.title, description: meta.description, url: absoluteUrl(locale, "/uk") },
  };
}

export default async function UKLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <CountryPageTemplate locale={locale} data={UK_PAGE} />;
}
