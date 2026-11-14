import type { Metadata } from "next";
import { getPricing } from "@/lib/pricing-server";
import { CountryPageTemplate } from "@/components/country/country-page-template";
import { SAUDI_PAGE } from "@/lib/data/country-pages";
import { localeMetadataAlternates, absoluteUrl } from "@/lib/site-config";

const metaByLocale: Record<string, { title: string; description: string }> = {
  en: { title: "تعلم القرآن أونلاين — المملكة العربية السعودية | Tibyaan Academy", description: "Join Muslim families across Saudi Arabia learning Quran online." },
  ar: { title: "تعلم القرآن أونلاين — المملكة العربية السعودية | أكاديمية تبيان", description: "انضم للعائلات المسلمة في المملكة العربية السعودية لتعلم القرآن عبر الإنترنت." },
  ur: { title: "سعودی عرب میں آن لائن قرآن | تبیان اکیڈمی", description: "سعودی عرب میں مسلم خاندانوں کے ساتھ قرآن سیکھیں۔" },
  fr: { title: "Cours de Coran en ligne en Arabie Saoudite | Tibyaan Academy", description: "Apprenez le Coran en Arabie Saoudite." },
  id: { title: "Kelas Quran Online Arab Saudi | Tibyaan Academy", description: "Belajar Quran online di Arab Saudi." },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = metaByLocale[locale] || metaByLocale.en;
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/saudi"),
    openGraph: { title: meta.title, description: meta.description, url: absoluteUrl(locale, "/saudi") },
  };
}

export default async function SaudiLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const pricing = await getPricing();
  return <CountryPageTemplate locale={locale} data={SAUDI_PAGE} pricing={pricing} />;
}
