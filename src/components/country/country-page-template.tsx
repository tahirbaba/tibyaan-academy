"use client";

import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { CheckCircle } from "lucide-react";
import { PRICING } from "@/lib/pricing";

type Locale = "ur" | "ar" | "en" | "fr" | "id";

interface CountryContent {
  badge: string;
  hero_heading: string;
  hero_desc: string;
  cta_trial: string;
  cta_courses: string;
  why_heading: string;
  features: string[];
  courses_heading: string;
  courses_desc: string;
  testimonials_heading: string;
  stats: { value: string; label: string }[];
  cta_final_heading: string;
  cta_final_desc: string;
  cta_final_btn: string;
  timezone_msg: string;
  courses: {
    title: string;
    desc: string;
    price_label: string;
    slug: string;
  }[];
}

type CountryTranslations = Record<Locale, CountryContent>;

export interface CountryPageData {
  flag: string;
  countryName: Record<Locale, string>;
  translations: CountryTranslations;
  testimonials?: {
    name: string;
    country: string;
    review: string;
    course: string;
    flag: string;
  }[];
}

interface Props {
  locale: string;
  data: CountryPageData;
}

export function CountryPageTemplate({ locale, data }: Props) {
  const lang = (["ur", "ar", "en", "fr", "id"].includes(locale) ? locale : "en") as Locale;
  const t = data.translations[lang];
  const isRTL = lang === "ur" || lang === "ar";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1" dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero */}
        <section className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              {data.flag} {t.badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t.hero_heading}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{t.hero_desc}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                {t.cta_trial}
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                {t.cta_courses}
              </Link>
            </div>
          </div>
        </section>

        {/* Timezone info */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 py-3 px-4 text-center text-sm text-emerald-700 dark:text-emerald-300">
          🕐 {t.timezone_msg}
        </div>

        {/* Why Choose */}
        <section className="py-16 px-4 bg-white dark:bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">{t.why_heading}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {t.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-4">{t.courses_heading}</h2>
            <p className="text-center text-muted-foreground mb-10">{t.courses_desc}</p>
            <div className="grid md:grid-cols-2 gap-6">
              {t.courses.map((course) => (
                <Link
                  key={course.slug}
                  href={`/courses/${course.slug}`}
                  className="block p-6 rounded-xl border bg-white dark:bg-card hover:border-emerald-400 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{course.desc}</p>
                  <span className="text-emerald-600 font-medium text-sm">{course.price_label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4 bg-white dark:bg-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">{t.testimonials_heading}</h2>
            <div className="grid grid-cols-3 gap-4">
              {t.stats.map(({ value, label }) => (
                <div key={label} className="text-center p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            {data.testimonials && data.testimonials.length > 0 && (
              <div className="mt-12 grid md:grid-cols-2 gap-6">
                {data.testimonials.slice(0, 4).map((r, i) => (
                  <div key={i} className="p-6 rounded-xl border bg-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.flag} {r.country} · {r.course}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array(5).fill(0).map((_, j) => (
                        <span key={j} className="text-amber-400 text-xs">★</span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">&quot;{r.review}&quot;</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-4 bg-emerald-600 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t.cta_final_heading}</h2>
            <p className="text-emerald-100 mb-8">{t.cta_final_desc}</p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors"
            >
              {t.cta_final_btn}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
