import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

import { SITE_URL as BASE_URL, localeMetadataAlternates, openGraphBase } from "@/lib/site-config";

const refundMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "واپسی کی پالیسی — تبیان اکیڈمی",
    description: "تبیان اکیڈمی کی واپسی پالیسی — 7 دن کی money-back guarantee۔",
  },
  ar: {
    title: "سياسة الاسترداد — أكاديمية تبيان",
    description: "سياسة استرداد أموال أكاديمية تبيان — ضمان 7 أيام.",
  },
  en: {
    title: "Refund Policy — Tibyaan Academy",
    description: "Tibyaan Academy refund policy — 7-day money-back guarantee.",
  },
  fr: {
    title: "Politique de remboursement — Tibyaan Academy",
    description: "Politique de remboursement de Tibyaan Academy — garantie 7 jours.",
  },
  id: {
    title: "Kebijakan Pengembalian Dana — Tibyaan Academy",
    description: "Kebijakan pengembalian dana Tibyaan Academy — garansi 7 hari.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = refundMeta[locale] || refundMeta.en;
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/refund-policy"),
    openGraph: {
      ...openGraphBase(locale),
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/refund-policy`,
    },
  };
}

export default async function RefundPolicyPage() {
  const t = await getTranslations("refundPolicy");

  const sections = [
    { title: "trialTitle", content: "trialContent" },
    { title: "refundTitle", content: "refundContent" },
    { title: "cancelTitle", content: "cancelContent" },
    { title: "requestTitle", content: "requestContent" },
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
                  <div className="mt-2 text-muted-foreground leading-relaxed whitespace-pre-line">
                    {t(s.content)}
                  </div>
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
