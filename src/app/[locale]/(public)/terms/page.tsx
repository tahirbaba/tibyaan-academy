import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

import { SITE_URL as BASE_URL, localeMetadataAlternates, openGraphBase } from "@/lib/site-config";

const termsMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "شرائط و ضوابط — تبیان اکیڈمی",
    description: "تبیان اکیڈمی کی خدمات استعمال کرنے کی شرائط و ضوابط پڑھیں۔",
  },
  ar: {
    title: "الشروط والأحكام — أكاديمية تبيان",
    description: "اقرأ شروط وأحكام استخدام خدمات أكاديمية تبيان.",
  },
  en: {
    title: "Terms & Conditions — Tibyaan Academy",
    description: "Read the terms and conditions for using Tibyaan Academy services.",
  },
  fr: {
    title: "Conditions générales — Tibyaan Academy",
    description: "Lisez les conditions générales d'utilisation de Tibyaan Academy.",
  },
  id: {
    title: "Syarat & Ketentuan — Tibyaan Academy",
    description: "Baca syarat dan ketentuan penggunaan layanan Tibyaan Academy.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = termsMeta[locale] || termsMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/terms"),
    openGraph: {
      ...openGraphBase(locale),
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/terms`,
    },
  };
}

export default async function TermsPage() {
  const t = await getTranslations("termsPage");

  const sections = [
    { title: "section1Title", content: "section1Content" },
    { title: "section2Title", content: "section2Content" },
    { title: "section3Title", content: "section3Content" },
    { title: "section4Title", content: "section4Content" },
    { title: "section5Title", content: "section5Content" },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary text-center">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              {t("lastUpdated")}
            </p>

            <div className="mt-10 space-y-8">
              {sections.map((s) => (
                <div key={s.title}>
                  <h2 className="text-xl font-semibold text-foreground">
                    {t(s.title)}
                  </h2>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {t(s.content)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
