"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { DollarSign, Users, Inbox } from "lucide-react";

interface Earning {
  studentName: string;
  courseName: string;
  planType: string;
  monthlyAmount: number;
}

export function RevenueClient({ earnings }: { earnings: Earning[] }) {
  const t = useTranslations("teacher");
  const tShare = useTranslations("teacherShare");
  const totalMonthly = earnings.reduce((sum, s) => sum + s.monthlyAmount, 0);
  const planLabel = (p: string) => p === "human_ai" ? "Human + AI" : "AI Only";

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("revenueTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("monthlyEarnings")}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="rounded-xl border bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950 dark:to-emerald-900/50 p-5">
          <div className="flex items-center gap-2 text-emerald-600 mb-2"><DollarSign className="w-5 h-5" /><span className="text-sm font-medium">{t("monthlyEarnings")}</span></div>
          <p className="text-3xl font-bold text-foreground">${totalMonthly.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="rounded-xl border bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 p-5">
          <div className="flex items-center gap-2 text-blue-600 mb-2"><Users className="w-5 h-5" /><span className="text-sm font-medium">{t("activeStudents")}</span></div>
          <p className="text-3xl font-bold text-foreground">{earnings.length}</p>
          {earnings.length > 0 && <p className="text-xs text-muted-foreground mt-1">{t("perStudent")}: ${Math.round(totalMonthly / earnings.length)}/mo</p>}
        </motion.div>
      </div>

      {/* Teacher share (25%) — the standing policy, shown where a teacher
          checks earnings. Wording behind teacherShare keys, awaiting approval. */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-1">
        <p className="text-sm font-semibold text-accent">{tShare("title")}</p>
        <p className="text-sm text-muted-foreground">{tShare("body")}</p>
      </div>

      {earnings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{t("noRevenueYet")}</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="rounded-xl border bg-card overflow-hidden">
          <div className="p-4 border-b"><h3 className="text-lg font-semibold text-foreground">{t("perStudent")}</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-start p-3 text-xs font-medium text-muted-foreground uppercase">{t("studentName")}</th>
                  <th className="text-start p-3 text-xs font-medium text-muted-foreground uppercase">{t("course")}</th>
                  <th className="text-start p-3 text-xs font-medium text-muted-foreground uppercase">{t("plan")}</th>
                  <th className="text-end p-3 text-xs font-medium text-muted-foreground uppercase">{t("monthlyAmount")}</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">{e.studentName.split(" ").map(n => n[0]).join("")}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{e.studentName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{e.courseName}</td>
                    <td className="p-3"><Badge variant="outline" className="text-xs">{planLabel(e.planType)}</Badge></td>
                    <td className="p-3 text-end"><span className="text-sm font-bold text-emerald-600">${e.monthlyAmount}</span><span className="text-xs text-muted-foreground">/mo</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50">
                  <td colSpan={3} className="p-3 text-sm font-semibold text-foreground">{t("totalEarnings")}</td>
                  <td className="p-3 text-end text-sm font-bold text-emerald-600">${totalMonthly}/mo</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
