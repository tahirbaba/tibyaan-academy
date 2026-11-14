import type { Metadata } from "next";
import { getPricing } from "@/lib/pricing-server";
import { CountryPageTemplate } from "@/components/country/country-page-template";
import { UAE_PAGE } from "@/lib/data/country-pages";
import { localeMetadataAlternates, absoluteUrl } from "@/lib/site-config";

const metaByLocale: Record<string, { title: string; description: string }> = {
  en: { title: "Online Islamic Education in UAE & Dubai | Tibyaan Academy", description: "Join Muslim families in Dubai, Abu Dhabi and across UAE learning Quran online. 5-day free trial." },
  ur: { title: "متحدہ عرب امارات میں آن لائن اسلامی تعلیم | تبیان اکیڈمی", description: "UAE میں مسلم خاندانوں کے ساتھ آن لائن قرآن سیکھیں۔ 5 دن مفت ٹرائل۔" },
  ar: { title: "التعليم الإسلامي الإلكتروني في الإمارات | أكاديمية تبيان", description: "انضم للعائلات المسلمة في الإمارات لتعلم القرآن عبر الإنترنت." },
  fr: { title: "Éducation islamique en ligne aux EAU | Tibyaan Academy", description: "Rejoignez les familles musulmanes aux EAU pour apprendre le Coran en ligne." },
  id: { title: "Pendidikan Islam Online di UAE | Tibyaan Academy", description: "Bergabunglah dengan keluarga Muslim di UAE belajar Quran online." },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = metaByLocale[locale] || metaByLocale.en;
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/uae"),
    openGraph: { title: meta.title, description: meta.description, url: absoluteUrl(locale, "/uae") },
  };
}

export default async function UAELandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const pricing = await getPricing();
  return <CountryPageTemplate locale={locale} data={UAE_PAGE} pricing={pricing} />;
}
