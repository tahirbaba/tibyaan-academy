"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  DollarSign,
  ClipboardCheck,
  Video,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Inbox,
} from "lucide-react";

interface TodayClass {
  classId: string;
  studentName: string;
  courseName: string;
  time: string;
  status: string;
  meetingLink: string | null;
}

export function TeacherDashboardClient({
  todayClasses,
  activeStudents,
  pendingTests,
  monthlyRevenue,
}: {
  todayClasses: TodayClass[];
  activeStudents: number;
  pendingTests: number;
  monthlyRevenue: number;
}) {
  const t = useTranslations("teacher");

  return (
    <div className="space-y-6">
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
              {t("welcome")} 👋
            </h1>
            <p className="mt-2 text-white/80">
              {todayClasses.length > 0
                ? `${todayClasses.length} ${t("classesToday")}`
                : t("noClassesToday")}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
            <Users className="w-8 h-8 text-emerald-200" />
            <div>
              <p className="text-2xl font-bold">{activeStudents}</p>
              <p className="text-xs text-white/70">{t("activeStudents")}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t("todaysClasses"),
            value: String(todayClasses.length),
            icon: Calendar,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950",
          },
          {
            label: t("activeStudents"),
            value: String(activeStudents),
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950",
          },
          {
            label: t("monthRevenue"),
            value: `$${monthlyRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-950",
          },
          {
            label: t("pendingTests"),
            value: String(pendingTests),
            icon: ClipboardCheck,
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
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Classes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t("todaysClasses")}
              </h3>
              <Link href="/teacher/schedule">
                <Button variant="ghost" size="sm">
                  {t("viewAll")} <ChevronRight className="w-4 h-4 ms-1" />
                </Button>
              </Link>
            </div>

            {todayClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t("noClassesToday")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((cls, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      cls.status === "completed"
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                        : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          cls.status === "completed"
                            ? "bg-emerald-100 dark:bg-emerald-900"
                            : "bg-blue-100 dark:bg-blue-900"
                        }`}
                      >
                        <Video
                          className={`w-5 h-5 ${
                            cls.status === "completed"
                              ? "text-emerald-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {cls.studentName} — {cls.courseName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{cls.time}</span>
                        </div>
                      </div>
                    </div>
                    {cls.status === "completed" ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-300 text-emerald-700 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="w-3 h-3 me-1" />
                        {t("completed")}
                      </Badge>
                    ) : cls.meetingLink ? (
                      <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {t("joinClass")}
                        </Button>
                      </a>
                    ) : (
                      <Badge variant="outline">{t("scheduled")}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="rounded-xl border bg-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t("pendingActions")}
            </h3>
            <div className="space-y-3">
              {pendingTests > 0 && (
                <Link href="/teacher/tests" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer group">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                      <ClipboardCheck className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">
                        {pendingTests} {t("testsToGrade")}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              )}
              {pendingTests === 0 && activeStudents === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  {t("noPendingActions")}
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="rounded-xl border bg-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t("quickActions")}
            </h3>
            <div className="space-y-2">
              <Link href="/teacher/schedule" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">
                    {t("addClass")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
              <Link href="/teacher/certificates" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">
                    {t("issueCertificate")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
              <Link href="/teacher/revenue" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">
                    {t("revenueTitle")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
