import type { Metadata } from "next";
import { getPricing } from "@/lib/pricing-server";
import { CountryPageTemplate } from "@/components/country/country-page-template";
import { AUSTRALIA_PAGE } from "@/lib/data/country-pages";
import { localeMetadataAlternates, absoluteUrl } from "@/lib/site-config";

const metaByLocale: Record<string, { title: string; description: string }> = {
  en: { title: "Quran Classes Online Australia | Tibyaan Academy", description: "Join Muslim families across Australia learning Quran online. 5-day free trial." },
  ur: { title: "آسٹریلیا میں آن لائن قرآن کلاسز | تبیان اکیڈمی", description: "آسٹریلیا میں مسلم خاندانوں کے ساتھ آن لائن قرآن سیکھیں۔" },
  ar: { title: "دروس القرآن أونلاين في أستراليا | أكاديمية تبيان", description: "انضم للعائلات المسلمة في أستراليا." },
  fr: { title: "Cours de Coran en ligne en Australie | Tibyaan Academy", description: "Rejoignez les familles musulmanes en Australie." },
  id: { title: "Kelas Quran Online Australia | Tibyaan Academy", description: "Bergabunglah dengan keluarga Muslim di Australia belajar Quran online." },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = metaByLocale[locale] || metaByLocale.en;
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/australia"),
    openGraph: { title: meta.title, description: meta.description, url: absoluteUrl(locale, "/australia") },
  };
}

export default async function AustraliaLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const pricing = await getPricing();
  return <CountryPageTemplate locale={locale} data={AUSTRALIA_PAGE} pricing={pricing} />;
}
