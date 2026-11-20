import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Mail, MessageSquare } from "lucide-react";

import { SITE_URL as BASE_URL, localeMetadataAlternates, openGraphBase } from "@/lib/site-config";

const contactMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "رابطہ کریں — تبیان اکیڈمی",
    description: "تبیان اکیڈمی سے رابطہ کریں۔ ای میل یا واٹس ایپ کے ذریعے ہم سے بات کریں۔",
  },
  ar: {
    title: "اتصل بنا — أكاديمية تبيان",
    description: "تواصل مع أكاديمية تبيان عبر البريد الإلكتروني أو واتساب.",
  },
  en: {
    title: "Contact Us — Tibyaan Academy",
    description: "Get in touch with Tibyaan Academy. Reach us via email or WhatsApp.",
  },
  fr: {
    title: "Contactez-nous — Tibyaan Academy",
    description: "Contactez Tibyaan Academy par e-mail ou WhatsApp.",
  },
  id: {
    title: "Hubungi Kami — Tibyaan Academy",
    description: "Hubungi Tibyaan Academy melalui email atau WhatsApp.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = contactMeta[locale] || contactMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale, "/contact"),
    openGraph: {
      ...openGraphBase(locale),
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/contact`,
    },
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contactPage");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="bg-background rounded-xl border p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {t("emailTitle")}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("emailDesc")}
                </p>
                <a
                  href="mailto:academytibyaan@gmail.com"
                  className="mt-4 inline-block text-primary font-medium hover:underline"
                >
                  academytibyaan@gmail.com
                </a>
              </div>

              {/* WhatsApp */}
              <div className="bg-background rounded-xl border p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {t("whatsappTitle")}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("whatsappDesc")}
                </p>
                <a
                  href="https://wa.me/923129114002"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-green-600 font-medium hover:underline"
                >
                  +92-312-9114002
                </a>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {t("responseTime")}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
