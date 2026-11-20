"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Languages,
  GraduationCap,
  Check,
  X,
  Video,
  Bot,
  Brain,
  ClipboardCheck,
  Gamepad2,
  Award,
} from "lucide-react";

type CourseKey = "nazra" | "hifz" | "arabic" | "aalim";
type FilterKey = "all" | CourseKey;

import type { PricingConfig } from "@/lib/pricing";
import { CoursePrice } from "@/components/pricing/course-price";

const courses: {
  key: CourseKey;
  icon: typeof BookOpen;
  color: string;
  iconColor: string;
  slug: string;
  duration: string;
  thumbnail: string;
}[] = [
  {
    key: "nazra",
    icon: BookOpen,
    color: "from-emerald-500/10 to-emerald-500/5 border-emerald-200 dark:border-emerald-800",
    iconColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    slug: "nazra-quran",
    duration: "3-6 months",
    thumbnail: "/images/courses/nazra.webp",
  },
  {
    key: "hifz",
    icon: Sparkles,
    color: "from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-800",
    iconColor: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    slug: "hifz-quran",
    duration: "2-4 years",
    thumbnail: "/images/courses/hifz.webp",
  },
  {
    key: "arabic",
    icon: Languages,
    color: "from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-800",
    iconColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    slug: "arabic-language",
    duration: "6-12 months",
    thumbnail: "/images/courses/arabic.webp",
  },
  {
    key: "aalim",
    icon: GraduationCap,
    color: "from-purple-500/10 to-purple-500/5 border-purple-200 dark:border-purple-800",
    iconColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    slug: "aalim-course",
    duration: "2-8 years",
    thumbnail: "/images/courses/aalim.webp",
  },
];

const filters: { key: FilterKey; labelKey: string }[] = [
  { key: "all", labelKey: "filterAll" },
  { key: "nazra", labelKey: "filterNazra" },
  { key: "hifz", labelKey: "filterHifz" },
  { key: "arabic", labelKey: "filterArabic" },
  { key: "aalim", labelKey: "filterAalim" },
];

const comparisonFeatures: {
  key: string;
  label: string;
  icon: typeof Video;
  plan1: boolean;
  plan2: boolean;
}[] = [
  { key: "liveClasses", label: "Live 1-on-1 Classes", icon: Video, plan1: true, plan2: false },
  { key: "aiUstaz", label: "AI Ustaz 24/7", icon: Bot, plan1: true, plan2: true },
  { key: "hifzTracker", label: "Hifz Smart Tracker", icon: Brain, plan1: true, plan2: true },
  { key: "weeklyTests", label: "Weekly Tests", icon: ClipboardCheck, plan1: true, plan2: false },
  { key: "kidsActivities", label: "Kids Activities", icon: Gamepad2, plan1: true, plan2: true },
  { key: "certificates", label: "Certificates", icon: Award, plan1: true, plan2: false },
];

export default function CoursesPageClient({
  pricing,
}: {
  pricing: PricingConfig;
}) {
  const t = useTranslations("coursesPage");
  const tc = useTranslations("coursesSection");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredCourses =
    activeFilter === "all"
      ? courses
      : courses.filter((c) => c.key === activeFilter);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-20">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0MCA4ME0wIDQwTDgwIDQwTTAgMEw4MCA4ME04MCAwTDAgODBNMjAgMEwyMCA4ME02MCAwTDYwIDgwTTAgMjBMODAgMjBNMCA2MEw4MCA2MCIgc3Ryb2tlPSIjMUI0MzMyIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-primary"
            >
              {t("title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              {t("subtitle")}
            </motion.p>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === f.key
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t(f.labelKey)}
                </button>
              ))}
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredCourses.map((course, i) => {
                const Icon = course.icon;
                return (
                  <motion.div
                    key={course.key}
                    // Rise in with a transform only — starting at opacity 0 kept
                    // the course image (the page's largest paint) invisible
                    // until the JavaScript had loaded.
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className={`rounded-2xl border bg-gradient-to-b ${course.color} overflow-hidden hover:shadow-xl transition-all`}
                  >
                    {/* Course Thumbnail */}
                    <div className="relative h-40 w-full bg-primary/5">
                      <Image
                        src={course.thumbnail}
                        alt={`${course.key} course`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        // The first cards are in view on arrival and are the
                        // page's largest paint: load them first, not lazily.
                        loading={i < 2 ? "eager" : "lazy"}
                        fetchPriority={i < 2 ? "high" : "auto"}
                        className="object-cover"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.display = "none";
                        }}
                      />
                      <div className={`absolute top-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center ${course.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      <h3 className="text-xl font-bold text-foreground">
                        {tc(`${course.key}Title`)}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tc(`${course.key}Desc`)}
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {course.duration}
                      </Badge>

                    {/* Features */}
                    <ul className="mt-5 space-y-2">
                      {[1, 2, 3].map((n) => (
                        <li
                          key={n}
                          className="flex items-center gap-2 text-sm text-foreground/80"
                        >
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          {t(`${course.key}Feature${n}`)}
                        </li>
                      ))}
                    </ul>

                    {/* Pricing — the same block every course card uses */}
                    <CoursePrice
                      pricing={pricing}
                      course={course.key}
                      className="mt-6 rounded-xl border bg-card/60 p-4"
                    />

                    {/* Flexible scheduling line */}
                    <p className="mt-4 text-xs text-primary font-medium">
                      {t("flexibleSchedule")}
                    </p>

                    {/* Actions */}
                    <div className="mt-3 flex gap-3">
                      <Link href="/signup" className="flex-1">
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          {t("enroll")}
                        </Button>
                      </Link>
                      <Link href="/signup" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full border-accent text-accent hover:bg-accent hover:text-white"
                        >
                          {t("freeTrial")}
                        </Button>
                      </Link>
                    </div>{/* /actions */}
                    </div>{/* /p-6 md:p-8 */}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Plan Comparison Table */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-center text-primary mb-10"
            >
              {t("comparisonTitle")}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-2xl border shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-primary/5">
                      <th className="px-6 py-4 text-start text-sm font-semibold text-foreground">
                        {t("feature")}
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-primary">
                        {t("plan1Label")}
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-accent">
                        {t("plan2Label")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((f, i) => {
                      const FIcon = f.icon;
                      return (
                        <tr
                          key={f.key}
                          className={i % 2 === 0 ? "" : "bg-muted/20"}
                        >
                          <td className="px-6 py-4 text-sm text-foreground">
                            <span className="flex items-center gap-2">
                              <FIcon className="w-4 h-4 text-muted-foreground" />
                              {f.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {f.plan1 ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-400 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {f.plan2 ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-400 mx-auto" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
