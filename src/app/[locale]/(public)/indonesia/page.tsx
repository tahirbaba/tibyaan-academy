import type { Metadata } from "next";
import { getPricing } from "@/lib/pricing-server";
import { CountryPageTemplate } from "@/components/country/country-page-template";
import { INDONESIA_PAGE } from "@/lib/data/country-pages";
import { localeMetadataAlternates, absoluteUrl } from "@/lib/site-config";

const metaByLocale: Record<string, { title: string; description: string }> = {
  en: { title: "Kelas Quran Online Indonesia | Tibyaan Academy", description: "Belajar Quran, Hifz, Bahasa Arab online bersama Tibyaan Academy. Uji coba gratis 5 hari." },
  id: { title: "Kelas Quran Online Indonesia | Tibyaan Academy", description: "Belajar Quran, Hifz, Bahasa Arab online. Uji coba gratis 5 hari." },
  ur: { title: "انڈونیشیا میں آن لائن قرآن کلاسز | تبیان اکیڈمی", description: "انڈونیشیا میں مسلم خاندانوں کے ساتھ آن لائن قرآن سیکھیں۔" },
  ar: { title: "دروس القرآن أونلاين في إندونيسيا | أكاديمية تبيان", description: "تعلم القرآن في إندونيسيا." },
  fr: { title: "Cours de Coran en ligne en Indonésie | Tibyaan Academy", description: "Apprenez le Coran en ligne en Indonésie." },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = metaByLocale[locale] || metaByLocale.en;
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/indonesia"),
    openGraph: { title: meta.title, description: meta.description, url: absoluteUrl(locale, "/indonesia") },
  };
}

export default async function IndonesiaLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const pricing = await getPricing();
  return <CountryPageTemplate locale={locale} data={INDONESIA_PAGE} pricing={pricing} />;
}
