"use client";

import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { CheckCircle } from "lucide-react";
import { COURSE_SLUG_TO_KEY, type PricingConfig } from "@/lib/pricing";
import { CoursePrice } from "@/components/pricing/course-price";

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
  pricing: PricingConfig;
}

export function CountryPageTemplate({ locale, data, pricing }: Props) {
  const lang = (["ur", "ar", "en", "fr", "id"].includes(locale) ? locale : "en") as Locale;
  const t = data.translations[lang];
  const isRTL = lang === "ur" || lang === "ar";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1" dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero */}
        <section className="pattern-stars relative overflow-hidden bg-gradient-to-br from-[#0F2922] via-[#1B4332] to-[#143528] px-4 py-20 text-white md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-4 py-1.5 text-sm font-medium text-[#E3CE8A]">
              {data.flag} {t.badge}
            </div>
            <h1 className="hero-rise mb-6 font-display text-4xl font-semibold leading-tight text-white md:text-5xl">{t.hero_heading}</h1>
            <p className="mx-auto mb-9 max-w-2xl text-lg leading-relaxed text-white/75">{t.hero_desc}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[#C9A84C] px-9 py-3.5 font-semibold text-[#0F2922] shadow-lg shadow-black/25 transition-transform hover:-translate-y-0.5 hover:bg-[#D4BD6E]"
              >
                {t.cta_trial}
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-9 py-3.5 font-semibold text-white transition-colors hover:bg-white hover:text-[#1B4332]"
              >
                {t.cta_courses}
              </Link>
            </div>
          </div>
        </section>

        {/* Timezone info */}
        <div className="border-b border-border bg-accent/10 px-4 py-3 text-center text-sm font-medium text-[#6B5516] dark:text-accent">
          🕐 {t.timezone_msg}
        </div>

        {/* Why Choose */}
        <section className="pattern-stars pattern-stars-light bg-background px-4 py-20 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-3 text-center font-display text-3xl font-semibold text-primary dark:text-foreground md:text-4xl">{t.why_heading}</h2>
            <div className="ornament mb-10 justify-center" aria-hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l3.5 8.5L24 12l-8.5 3.5L12 24l-3.5-8.5L0 12l8.5-3.5z" /></svg></div>
            <div className="grid md:grid-cols-2 gap-4">
              {t.features.map((feature, i) => (
                <div key={i} className="premium-card flex items-start gap-3 p-5">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses */}
        <section className="bg-muted/40 px-4 py-20 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-4 text-center font-display text-3xl font-semibold text-primary dark:text-foreground md:text-4xl">{t.courses_heading}</h2>
            <p className="text-center text-muted-foreground mb-10">{t.courses_desc}</p>
            <div className="grid md:grid-cols-2 gap-6">
              {t.courses.map((course) => (
                <Link
                  key={course.slug}
                  href={`/courses/${course.slug}`}
                  className="premium-card block p-6"
                >
                  <h3 className="mb-2 font-display text-xl font-semibold text-foreground">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{course.desc}</p>
                  <CoursePrice
                    pricing={pricing}
                    course={COURSE_SLUG_TO_KEY[course.slug]}
                    className="border-t pt-3"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-background px-4 py-20 md:py-24">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-8 text-center font-display text-3xl font-semibold text-primary dark:text-foreground md:text-4xl">{t.testimonials_heading}</h2>
            <div className="grid grid-cols-3 gap-4">
              {t.stats.map(({ value, label }) => (
                <div key={label} className="premium-card p-6 text-center">
                  <div className="mb-1 font-display text-3xl font-semibold text-primary">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            {data.testimonials && data.testimonials.length > 0 && (
              <div className="mt-12 grid md:grid-cols-2 gap-6">
                {data.testimonials.slice(0, 4).map((r, i) => (
                  <div key={i} className="premium-card p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
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
        <section className="pattern-stars bg-gradient-to-br from-[#0F2922] via-[#1B4332] to-[#143528] px-4 py-20 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-4 font-display text-3xl font-semibold md:text-4xl">{t.cta_final_heading}</h2>
            <p className="mb-8 text-white/75">{t.cta_final_desc}</p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-[#C9A84C] px-9 py-3.5 font-semibold text-[#0F2922] shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-[#D4BD6E]"
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
