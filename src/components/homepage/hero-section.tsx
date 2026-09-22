"use client";

import { useTranslations } from "next-intl";
import { formatStat, STAT_VALUES } from "@/lib/site-stats";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { YouTubeEmbed } from "@/components/shared/youtube-embed";

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

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Islamic geometric pattern */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0MCA4ME0wIDQwTDgwIDQwTTAgMEw4MCA4ME04MCAwTDAgODBNMjAgMEwyMCA4ME02MCAwTDYwIDgwTTAgMjBMODAgMjBNMCA2MEw4MCA2MCIgc3Ryb2tlPSIjMUI0MzMyIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10 items-center">

          {/* Left Column */}
          <div>
            <div className="text-primary font-bold uppercase tracking-widest text-xs mb-3">
              Online Islamic Academy
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight"
            >
              {t("headline")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl"
            >
              {t("subheadline")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg shadow-accent/25 rounded-full"
                >
                  {t("cta1")}
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold rounded-full"
                >
                  {t("cta2")}
                </Button>
              </Link>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  className="text-center p-4 rounded-2xl bg-card border border-border/50 shadow-sm"
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t(stat.key)}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column — Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Hero video slot. Empty until NEXT_PUBLIC_HERO_VIDEO_URL is set;
                the designed panel below stands in its place until then. */}
            {heroVideo ? (
              <YouTubeEmbed
                url={heroVideo}
                title="Tibyaan Academy"
                className="shadow-xl"
              />
            ) : (
              <div className="relative w-full h-72 md:h-80 rounded-2xl overflow-hidden shadow-xl bg-[#1B4332]">
                {/* geometric pattern, same one the course heroes use */}
                <div className="absolute inset-0 opacity-[0.12] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0MCA4ME0wIDQwTDgwIDQwTTAgMEw4MCA4ME04MCAwTDAgODBNMjAgMEwyMCA4ME02MCAwTDYwIDgwTTAgMjBMODAgMjBNMCA2MEw4MCA2MCIgc3Ryb2tlPSIjQzlBODRDIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')]" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/25" />
                <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
                  <div className="w-14 h-14 rounded-2xl border border-[#C9A84C]/50 bg-[#C9A84C]/10 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-[#C9A84C]" />
                  </div>
                  <p className="mt-4 text-xl font-bold text-white">Tibyaan Academy</p>
                  <p className="mt-1 text-sm text-white/70 max-w-xs">
                    Live 1-on-1 Quran teachers, guided by AI.
                  </p>
                </div>
              </div>
            )}

            {/* Contact Info Card */}
            <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
              <h3 className="font-bold text-foreground text-sm mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#25D366] font-bold text-xs">WA</span>
                  <a href="https://wa.me/923129114002" className="text-primary hover:underline">+92 312 9114002</a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold text-xs">@</span>
                  <a href="mailto:academytibyaan@gmail.com" className="text-primary hover:underline text-xs">academytibyaan@gmail.com</a>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border space-y-1">
                {highlights.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-accent font-bold">✓</span>
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/courses" className="block mt-4">
                <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm h-9">
                  {t("cta2")}
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
