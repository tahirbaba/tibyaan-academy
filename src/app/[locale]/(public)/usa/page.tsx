import type { Metadata } from "next";
import { getPricing } from "@/lib/pricing-server";
import { appendFeeSentence } from "@/lib/pricing";
import { CountryPageTemplate } from "@/components/country/country-page-template";
import { USA_PAGE } from "@/lib/data/country-pages";
import { localeMetadataAlternates, absoluteUrl, openGraphBase } from "@/lib/site-config";

const metaByLocale: Record<string, { title: string; description: string }> = {
  en: {
    title: "Learn Quran Online in USA | Tibyaan Academy",
    description: "Join Muslim families across the USA learning Quran, Hifz, and Arabic online. Live teachers + AI Ustaz. Start your 5-day free trial today.",
  },
  ur: {
    title: "امریکہ میں آن لائن قرآن سیکھیں | تبیان اکیڈمی",
    description: "امریکہ میں مسلم خاندانوں کے ساتھ شامل ہوں جو آن لائن قرآن سیکھ رہے ہیں۔ 5 دن مفت ٹرائل۔",
  },
  ar: {
    title: "تعلم القرآن أونلاين في الولايات المتحدة | أكاديمية تبيان",
    description: "انضم إلى العائلات المسلمة في الولايات المتحدة لتعلم القرآن عبر الإنترنت.",
  },
  fr: {
    title: "Apprendre le Coran en ligne aux États-Unis | Tibyaan Academy",
    description: "Rejoignez des familles musulmanes aux États-Unis pour apprendre le Coran en ligne.",
  },
  id: {
    title: "Belajar Quran Online di Amerika Serikat | Tibyaan Academy",
    description: "Bergabunglah dengan keluarga Muslim di AS belajar Quran online. Uji coba gratis 5 hari.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = metaByLocale[locale] || metaByLocale.en;
  // Short country descriptions get the fee sentence too, when it fits.
  const description = appendFeeSentence(meta.description, locale, await getPricing());
  return {
    title: meta.title,
    description,
    alternates: localeMetadataAlternates(locale, "/usa"),
    openGraph: {
      ...openGraphBase(locale), title: meta.title, description, url: absoluteUrl(locale, "/usa") },
  };
}

export default async function USALandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const pricing = await getPricing();
  return <CountryPageTemplate locale={locale} data={USA_PAGE} pricing={pricing} />;
}
