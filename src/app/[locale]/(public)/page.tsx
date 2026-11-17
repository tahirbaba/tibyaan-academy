import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { HeroSection } from "@/components/homepage/hero-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import { HumanAiSection } from "@/components/homepage/human-ai-section";
import { CoursesSection } from "@/components/homepage/courses-section";
import { HowItWorksSection } from "@/components/homepage/how-it-works-section";
import { TestimonialsSection } from "@/components/homepage/testimonials-section";
import { TrustSignalsSection } from "@/components/homepage/trust-signals-section";
import { PricingTeaserSection } from "@/components/homepage/pricing-teaser-section";
import { SocialLinksSection } from "@/components/homepage/social-links-section";
import { CtaSection } from "@/components/homepage/cta-section";
import { TeacherCtaSection } from "@/components/homepage/teacher-cta-section";
import { TeacherVideosSection } from "@/components/homepage/teacher-videos-section";
import { DailyDarsSection } from "@/components/homepage/daily-dars-section";
import { DashboardPreviewSection } from "@/components/homepage/dashboard-preview-section";
import { EnrollmentFormSection } from "@/components/homepage/enrollment-form-section";
import { Footer } from "@/components/shared/footer";
import { TeachersSection } from "@/components/homepage/teachers-section";
import { GroupClassesSection } from "@/components/homepage/group-classes-section";
import { HomeMotion } from "@/components/homepage/primitives";
import { getPricing } from "@/lib/pricing-server";

import { localeMetadataAlternates, absoluteUrl, openGraphBase } from "@/lib/site-config";

const homeMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "تبیان اکیڈمی — آن لائن قرآن و اسلامی تعلیم",
    description:
      "قرآن، حفظ، عربی اور اسلامی علوم آن لائن سیکھیں۔ لائیو اساتذہ + AI استاذ۔ 5 دن فری ٹرائل۔",
  },
  ar: {
    title: "أكاديمية تبيان — المدرسة الرقمية الحديثة",
    description:
      "تعلم القرآن والحفظ والعربية عبر الإنترنت مع معلمين مباشرين + أستاذ ذكاء اصطناعي. تجربة مجانية 5 أيام.",
  },
  en: {
    title: "Tibyaan Academy — Modern Digital Madrasah",
    description:
      "Learn Quran, Hifz, Arabic & Islamic Sciences online with live teachers + AI Ustaz. 5-day free trial.",
  },
  fr: {
    title: "Tibyaan Academy — Madrasah Numérique Moderne",
    description:
      "Apprenez le Coran, le Hifz et l'arabe en ligne avec des enseignants en direct + AI Ustaz. Essai gratuit 5 jours.",
  },
  id: {
    title: "Tibyaan Academy — Madrasah Digital Modern",
    description:
      "Belajar Quran, Hifz, Bahasa Arab & Ilmu Islam online. Guru langsung + AI Ustaz. Uji coba gratis 5 hari.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = homeMeta[locale] || homeMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: localeMetadataAlternates(locale),
    openGraph: {
      ...openGraphBase(locale),
      title: meta.title,
      description: meta.description,
      url: absoluteUrl(locale),
    },
  };
}

export default async function HomePage() {
  // One read of the pricing config for the whole page; every price shown
  // below comes from it. If it cannot be read the page fails loudly
  // (getPricing alerts) instead of showing prices nobody set.
  const pricing = await getPricing();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* home-main: the homepage animates its own headings (framer-motion),
          so the site-wide CSS heading motion skips it. */}
      <main className="flex-1 home-main">
        <HomeMotion>
          <HeroSection />
          <FeaturesSection />
          <HumanAiSection />
          <CoursesSection pricing={pricing} />
          <GroupClassesSection />
          <TeachersSection />
          <TeacherVideosSection />
          <HowItWorksSection />
          <DailyDarsSection />
          <TestimonialsSection />
          <TrustSignalsSection />
          <DashboardPreviewSection />
          <PricingTeaserSection pricing={pricing} />
          <EnrollmentFormSection />
          <TeacherCtaSection pricing={pricing} />
          <SocialLinksSection />
          <CtaSection />
        </HomeMotion>
      </main>
      <Footer />
    </div>
  );
}
