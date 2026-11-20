import type { Metadata } from "next";
import { getPricing } from "@/lib/pricing-server";
import { appendFeeSentence } from "@/lib/pricing";
import { CountryPageTemplate } from "@/components/country/country-page-template";
import { CANADA_PAGE } from "@/lib/data/country-pages";
import { localeMetadataAlternates, absoluteUrl, openGraphBase } from "@/lib/site-config";

const metaByLocale: Record<string, { title: string; description: string }> = {
  en: { title: "Online Quran Classes Canada | Tibyaan Academy", description: "Join Muslim families across Canada learning Quran, Hifz, and Arabic online. 5-day free trial." },
  ur: { title: "کینیڈا میں آن لائن قرآن کلاسز | تبیان اکیڈمی", description: "کینیڈا میں مسلم خاندانوں کے ساتھ آن لائن قرآن سیکھیں۔" },
  ar: { title: "دروس القرآن أونلاين في كندا | أكاديمية تبيان", description: "انضم للعائلات المسلمة في كندا لتعلم القرآن عبر الإنترنت." },
  fr: { title: "Cours de Coran en ligne au Canada | Tibyaan Academy", description: "Rejoignez les familles musulmanes au Canada pour apprendre le Coran en ligne." },
  id: { title: "Kelas Quran Online Kanada | Tibyaan Academy", description: "Bergabunglah dengan keluarga Muslim di Kanada belajar Quran online." },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = metaByLocale[locale] || metaByLocale.en;
  // Short country descriptions get the fee sentence too, when it fits.
  const description = appendFeeSentence(meta.description, locale, await getPricing());
  return {
    title: meta.title,
    description,
    alternates: localeMetadataAlternates(locale, "/canada"),
    openGraph: {
      ...openGraphBase(locale), title: meta.title, description, url: absoluteUrl(locale, "/canada") },
  };
}

export default async function CanadaLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const pricing = await getPricing();
  return <CountryPageTemplate locale={locale} data={CANADA_PAGE} pricing={pricing} />;
}
