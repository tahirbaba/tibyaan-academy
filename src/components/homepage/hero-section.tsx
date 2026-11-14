import { useTranslations } from "next-intl";
import { formatStat, STAT_VALUES } from "@/lib/site-stats";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, Mail, MessageCircle } from "lucide-react";
import { YouTubeEmbed } from "@/components/shared/youtube-embed";
import { HeroOrnamentLazy } from "./hero-ornament-lazy";

/**
 * Optional. Set it to a YouTube URL (a normal video or a Short - the embed
 * detects which) to put a video in the hero. Left unset, the hero shows its
 * designed panel; it is never a broken image.
 */
const heroVideo = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;

const stats = [
  { key: "students", value: STAT_VALUES.students },
  { key: "countries", value: STAT_VALUES.countries },
  { key: "classes", value: STAT_VALUES.classes },
  { key: "huffaz", value: STAT_VALUES.huffaz },
] as const;

const highlights = [
  "Free Trial Available",
  "1-on-1 Live Classes",
  `${formatStat("students")} Students Worldwide`,
  "5 Languages Supported",
];

/**
 * A server component on purpose. The headline is the page's largest
 * contentful paint: it used to be a framer-motion element that started at
 * opacity 0, so it could not paint until the JavaScript had loaded and run
 * (mobile LCP ~5 s). It is now plain HTML with a CSS transform-only entrance,
 * so it paints with the first frame.
 */
export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="pattern-stars relative overflow-hidden bg-gradient-to-br from-[#0F2922] via-[#1B4332] to-[#143528] text-white">
      {/* soft gold glow behind the right column */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-[#C9A84C]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Left column */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#E3CE8A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" aria-hidden />
              Online Islamic Academy
            </p>

            <h1 className="hero-rise mt-6 font-display text-4xl font-semibold leading-[1.12] text-white md:text-5xl lg:text-[3.75rem]">
              {t("headline")}
            </h1>

            <p className="hero-rise mt-6 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">
              {t("subheadline")}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-14 w-full rounded-full bg-[#C9A84C] px-9 text-lg font-semibold text-[#0F2922] shadow-lg shadow-black/25 transition-transform hover:-translate-y-0.5 hover:bg-[#D4BD6E] sm:w-auto"
                >
                  {t("cta1")}
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full rounded-full border-white/40 bg-transparent px-9 text-lg font-semibold text-white hover:bg-white hover:text-[#1B4332] sm:w-auto"
                >
                  {t("cta2")}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.key} className="bg-[#143528]/90 px-4 py-5 text-center">
                  <dd className="font-display text-2xl font-semibold text-[#E3CE8A] md:text-3xl">
                    {stat.value}
                  </dd>
                  <dt className="mt-1 text-sm text-white/70">{t(stat.key)}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Hero video slot. Empty until NEXT_PUBLIC_HERO_VIDEO_URL is set;
                the designed panel below stands in its place until then. */}
            {heroVideo ? (
              <YouTubeEmbed url={heroVideo} title="Tibyaan Academy" className="shadow-2xl" />
            ) : (
              <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-[#C9A84C]/25 bg-[#0F2922] shadow-2xl md:h-80">
                <HeroOrnamentLazy />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2922] via-[#0F2922]/40 to-transparent" />
                <div className="relative flex h-full flex-col items-center justify-end px-8 pb-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C9A84C]/50 bg-[#C9A84C]/10">
                    <BookOpen className="h-7 w-7 text-[#C9A84C]" aria-hidden />
                  </div>
                  <p className="mt-4 font-display text-xl font-semibold text-white">Tibyaan Academy</p>
                  <p className="mt-1 max-w-xs text-sm text-white/70">
                    Live 1-on-1 Quran teachers, guided by AI.
                  </p>
                </div>
              </div>
            )}

            {/* Contact card */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#E3CE8A]">
                Contact Information
              </h2>
              <div className="mt-3 space-y-2 text-sm">
                <a
                  href="https://wa.me/923129114002"
                  className="flex items-center gap-2.5 text-white hover:text-[#E3CE8A]"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden />
                  <span dir="ltr">+92 312 9114002</span>
                </a>
                <a
                  href="mailto:academytibyaan@gmail.com"
                  className="flex items-center gap-2.5 text-white hover:text-[#E3CE8A]"
                >
                  <Mail className="h-4 w-4 text-[#C9A84C]" aria-hidden />
                  academytibyaan@gmail.com
                </a>
              </div>
              <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/75">
                    <Check className="h-4 w-4 shrink-0 text-[#C9A84C]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/courses" className="mt-5 block">
                <Button className="h-10 w-full rounded-full bg-white text-sm font-semibold text-[#1B4332] hover:bg-[#E3CE8A]">
                  {t("cta2")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
