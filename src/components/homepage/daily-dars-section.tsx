"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./primitives";

interface DarsItem {
  id: string;
  slug: string;
  titleEn: string | null;
  titleUr: string | null;
  titleAr: string | null;
  titleFr: string | null;
  titleId: string | null;
  excerptEn: string | null;
  excerptUr: string | null;
  category: string;
  publishedAt: string;
  createdAt: string;
}

// Islamic poster gradient per category
const categoryPosters: Record<string, { bg: string; badge: string; label: string }> = {
  quran:  { bg: "from-[#1B4332] via-[#1a3d2e] to-[#0F2922]",  badge: "text-emerald-300 border-emerald-500/40", label: "القرآن" },
  hadith: { bg: "from-[#0c2461] via-[#0a1f55] to-[#060d2e]",  badge: "text-blue-300 border-blue-500/40",       label: "الحديث" },
  fiqh:   { bg: "from-[#2d1b69] via-[#231455] to-[#120a30]",  badge: "text-purple-300 border-purple-500/40",   label: "الفقه" },
  seerah: { bg: "from-[#78350f] via-[#5c280b] to-[#2c1005]",  badge: "text-amber-300 border-amber-500/40",     label: "السيرة" },
  dua:    { bg: "from-[#7f1d1d] via-[#631616] to-[#3d0808]",  badge: "text-rose-300 border-rose-500/40",       label: "الدعاء" },
};

const ISLAMIC_PATTERN = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L40 80M0 40L80 40M0 0L80 80M80 0L0 80M20 0L20 80M60 0L60 80M0 20L80 20M0 60L80 60' stroke='%23ffffff' stroke-width='0.4' fill='none'/%3E%3C/svg%3E")`;

export function DailyDarsSection() {
  const t = useTranslations("dailyDarsSection");
  const locale = useLocale();
  const [darsItems, setDarsItems] = useState<DarsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dars/recent")
      .then((res) => res.json())
      .then((data) => setDarsItems(data.dars ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && darsItems.length === 0) return null;

  function getDarsTitle(item: DarsItem): string {
    if (locale === "ur") return item.titleUr || item.titleEn || "Dars";
    if (locale === "ar") return item.titleAr || item.titleEn || "Dars";
    if (locale === "fr") return item.titleFr || item.titleEn || "Dars";
    if (locale === "id") return item.titleId || item.titleEn || "Dars";
    return item.titleEn || item.titleUr || "Dars";
  }

  function getDarsExcerpt(item: DarsItem): string {
    if (locale === "ur") return item.excerptUr || item.excerptEn || "";
    return item.excerptEn || item.excerptUr || "";
  }

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="h-12" aria-hidden />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-muted animate-pulse h-[280px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {darsItems.map((item, i) => {
              const poster = categoryPosters[item.category] ?? categoryPosters.quran;
              const excerpt = getDarsExcerpt(item);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                >
                  <Link href={`/dars/${item.id}`} className="block group">
                    <div
                      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${poster.bg} p-6 h-[280px] flex flex-col justify-between text-white shadow-xl`}
                    >
                      {/* Islamic geometric pattern overlay */}
                      <div
                        className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{ backgroundImage: ISLAMIC_PATTERN }}
                      />

                      {/* Gold top accent line */}
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

                      {/* Top row: category + date */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border bg-white/5 ${poster.badge}`}>
                          {poster.label} · {item.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-white/40">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.publishedAt).toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      {/* Title */}
                      <div className="relative z-10 flex-1 mt-4">
                        <h3 className="text-lg font-bold leading-snug line-clamp-3 group-hover:text-[#C9A84C] transition-colors duration-200">
                          {getDarsTitle(item)}
                        </h3>
                        {excerpt && (
                          <p className="mt-2 text-sm text-white/55 line-clamp-2 leading-relaxed">
                            {excerpt}
                          </p>
                        )}
                      </div>

                      {/* Bottom: branding + read more */}
                      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-[11px] text-white/30 font-semibold tracking-wide uppercase">
                          Tibyaan Academy
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#C9A84C] group-hover:gap-2 transition-all">
                          {t("readMore")}
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && darsItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            <Link href="/dars">
              <Button variant="outline" className="gap-2 rounded-full border-primary/30 hover:bg-primary hover:text-primary-foreground">
                {t("viewAll")}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
