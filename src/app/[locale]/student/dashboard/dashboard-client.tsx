"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  Brain,
  ClipboardCheck,
  Video,
  Flame,
  Clock,
  ChevronRight,
  Star,
  AlertCircle,
  Plus,
  IdCard,
  FileText,
} from "lucide-react";
import { getSyllabus, type SyllabusSection } from "@/lib/data/course-syllabus";

function getCourseBooks(courseType: string): { name: string; image: string; pdfUrl?: string }[] {
  const sections: SyllabusSection[] = getSyllabus(courseType);
  const result: { name: string; image: string; pdfUrl?: string }[] = [];
  for (const sec of sections) {
    if (sec.books) {
      sec.books.forEach((b) => result.push({ name: b.name, image: b.image, pdfUrl: b.pdfUrl }));
    } else if (sec.bookImage) {
      const label =
        courseType === "hifz"
          ? `Para ${sec.id}`
          : courseType === "nazra"
          ? `Lesson ${sec.id}`
          : `Section ${sec.id}`;
      result.push({ name: label, image: sec.bookImage, pdfUrl: sec.pdfUrl });
    }
  }
  return result;
}

interface DashboardProps {
  userId: string;
  userName: string;
  enrolledCourses: {
    id: string;
    name: string;
    courseType: string;
    status: string;
    planType: string;
    trialEndDate: string | null;
    color: string;
    bgColor: string;
  }[];
  stats: {
    completedLessons: number;
    totalLessons: number;
    completedHifzEntries: number;
  };
  nextClass: {
    classId: string;
    courseName: string;
    scheduledAt: string;
    meetingLink: string | null;
  } | null;
  locale: string;
}

export function DashboardClient({
  userId,
  userName,
  enrolledCourses,
  stats,
  nextClass,
  locale,
}: DashboardProps) {
  const t = useTranslations("dashboard");
  const [now] = useState(() => Date.now());

  const trialCourses = enrolledCourses.filter((c) => c.status === "trial");
  const trialDaysLeft = trialCourses[0]?.trialEndDate
    ? Math.max(0, Math.ceil((new Date(trialCourses[0].trialEndDate).getTime() - now) / (1000 * 60 * 60 * 24)))
    : null;

  const studentId = `TBA-${userId.substring(0, 8).toUpperCase()}`;

  return (
    <div className="space-y-6">
      {/* Student Info Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl border bg-card px-5 py-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <IdCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Student ID</p>
            <p className="font-mono font-semibold text-sm text-foreground tracking-wide">{studentId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
            Student
          </span>
          <span className="text-sm font-medium text-foreground hidden sm:block">{userName}</span>
        </div>
      </motion.div>

      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pattern-stars overflow-hidden rounded-2xl border border-[#C9A84C]/25 bg-gradient-to-br from-[#0F2922] via-[#1B4332] to-[#143528] p-6 text-white shadow-lg md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {t("welcome")}, {userName}!
            </h1>
            <p className="mt-2 text-primary-foreground/80">
              {enrolledCourses.length > 0
                ? t("todaySabaqDesc")
                : t("welcomeNoCourses") ?? "Start by enrolling in a course to begin your learning journey."
              }
            </p>
          </div>
          {trialDaysLeft !== null && (
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <Clock className="w-6 h-6 text-amber-300" />
              <div>
                <p className="text-lg font-bold">{trialDaysLeft} {t("daysLeft") ?? "days left"}</p>
                <p className="text-xs text-primary-foreground/70">
                  Free Trial
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* No courses enrolled — show CTA */}
      {enrolledCourses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center"
        >
          <BookOpen className="w-12 h-12 text-primary mx-auto" />
          <h3 className="mt-4 text-lg font-bold text-foreground">
            {t("noCourses") ?? "No courses enrolled yet"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("noCoursesDesc") ?? "Explore our courses and start your free 5-day trial today!"}
          </p>
          <Link href="/courses">
            <Button className="mt-4 bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              {t("exploreCourses") ?? "Explore Courses"}
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      {enrolledCourses.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: t("enrolledCourses") ?? "Enrolled Courses",
              value: String(enrolledCourses.length),
              icon: BookOpen,
              color: "text-emerald-600",
              bg: "bg-emerald-50 dark:bg-emerald-950",
            },
            {
              label: t("upcomingClass"),
              value: nextClass
                ? new Date(nextClass.scheduledAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
                : t("noClass") ?? "None",
              icon: Video,
              color: "text-blue-600",
              bg: "bg-blue-50 dark:bg-blue-950",
            },
            {
              label: t("completedLessons"),
              value: `${stats.completedLessons}/${stats.totalLessons || "—"}`,
              icon: Star,
              color: "text-amber-600",
              bg: "bg-amber-50 dark:bg-amber-950",
            },
            {
              label: t("hifzCompleted") ?? "Hifz Entries",
              value: String(stats.completedHifzEntries),
              icon: Flame,
              color: "text-red-600",
              bg: "bg-red-50 dark:bg-red-950",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-xl border bg-card p-4"
              >
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {stat.value}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ===== COURSE MATERIALS ===== */}
      {enrolledCourses.length > 0 && enrolledCourses.map((course) => {
        const books = getCourseBooks(course.courseType);
        if (!books.length) return null;
        return (
          <motion.div
            key={`materials-${course.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {course.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Course Books &amp; PDF Materials — {books.length} items
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {books.map((book, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  {book.pdfUrl ? (
                    <a
                      href={book.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block w-full"
                      title={book.name}
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted relative shadow-sm group-hover:shadow-md transition-shadow">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={book.image}
                          alt={book.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <div className="absolute bottom-0 inset-x-0 flex justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-primary/90 rounded px-1.5 py-0.5 flex items-center gap-0.5">
                            <FileText className="w-2.5 h-2.5 text-white" />
                            <span className="text-white text-[9px] font-medium">PDF</span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] text-center text-muted-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {book.name}
                      </p>
                    </a>
                  ) : (
                    <div className="w-full" title={book.name}>
                      <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={book.image}
                          alt={book.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-center text-muted-foreground leading-tight line-clamp-2">
                        {book.name}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrolled Courses Overview */}
          {enrolledCourses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl border bg-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground">
                {t("progressOverview")}
              </h3>
              <div className="mt-4 space-y-4">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${course.color}`} />
                      <div>
                        <p className="font-medium text-foreground text-sm">{course.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">
                            {course.planType === "human_ai" ? "Human + AI" : "Pure AI"}
                          </Badge>
                          <Badge
                            variant={course.status === "trial" ? "secondary" : "default"}
                            className="text-xs"
                          >
                            {course.status === "trial" ? "Trial" : course.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Link href={`/student/courses/${course.id}`}>
                      <Button size="sm" variant="ghost">
                        {t("continueLesson")} <ChevronRight className="w-4 h-4 ms-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upcoming Class */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-xl border bg-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground">
              {t("upcomingClass")}
            </h3>
            {nextClass ? (
              <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Video className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{nextClass.courseName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(nextClass.scheduledAt).toLocaleDateString(locale, {
                          weekday: "short", month: "short", day: "numeric",
                        })}{" "}
                        {new Date(nextClass.scheduledAt).toLocaleTimeString(locale, {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                {nextClass.meetingLink && (
                  <a href={nextClass.meetingLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      {t("joinClass")}
                    </Button>
                  </a>
                )}
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("noUpcomingClass") ?? "No upcoming classes scheduled"}
                </p>
              </div>
            )}
          </motion.div>

          {/* Weekly Test Reminder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-5"
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-foreground">
                  {t("weeklyTestReminder")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("weeklyTestDesc")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="rounded-xl border bg-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground">
              {t("quickActions")}
            </h3>
            <div className="mt-4 space-y-2">
              <Link href="/student/ai-ustaz" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">
                    {t("askAI")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
              <Link href="/student/hifz-tracker" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">
                    {t("trackHifz")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
              <Link href="/student/courses" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-500/5 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">
                    {t("myCourses") ?? "My Courses"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Trial Info */}
          {trialDaysLeft !== null && trialDaysLeft <= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-5"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">
                    Trial {trialDaysLeft === 0 ? "ends today!" : `ends in ${trialDaysLeft} day${trialDaysLeft > 1 ? "s" : ""}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Subscribe to continue your learning journey.
                  </p>
                  <Link href="/student/payments">
                    <Button size="sm" className="mt-2 bg-accent hover:bg-accent/90 text-white">
                      Subscribe Now
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
