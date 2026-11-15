import type { Metadata } from "next";
import { getPricing } from "@/lib/pricing-server";
import { feeSentence } from "@/lib/pricing";
import PricingPageClient from "@/components/pricing/pricing-page-client";

import { SITE_URL as BASE_URL, localeMetadataAlternates } from "@/lib/site-config";

const pricingMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "قیمتیں — سستے آن لائن قرآن کورسز",
    description:
      "تبیان اکیڈمی کی قیمتیں دیکھیں۔ لائیو ٹیچر + AI پلان۔ فیملی ڈسکاؤنٹ۔ 5 دن فری ٹرائل۔",
  },
  ar: {
    title: "الأسعار — دورات قرآنية بأسعار معقولة",
    description:
      "تصفح أسعار أكاديمية تبيان. معلم مباشر + خطة ذكاء اصطناعي. خصم عائلي. تجربة مجانية 5 أيام.",
  },
  en: {
    title: "Pricing — Affordable Online Quran Courses",
    description:
      "View Tibyaan Academy pricing. Live Teacher + AI plans. Family discount. 5-day free trial.",
  },
  fr: {
    title: "Tarifs — Cours de Coran en Ligne Abordables",
    description:
      "Découvrez les tarifs de Tibyaan Academy. Enseignant en direct + plans IA. Réduction familiale. Essai gratuit 5 jours.",
  },
  id: {
    title: "Harga — Kursus Quran Online Terjangkau",
    description:
      "Lihat harga Tibyaan Academy. Guru langsung + paket AI. Diskon keluarga. Uji coba gratis 5 hari.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = pricingMeta[locale] || pricingMeta.en;
  const pricing = await getPricing();
  const meta = {
    title: base.title,
    description: `${base.description} ${feeSentence(locale, pricing)}`,
  };

  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/pricing"),
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/pricing`,
    },
  };
}

export default async function PricingPage() {
  const pricing = await getPricing();
  return <PricingPageClient pricing={pricing} />;
}
