"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  CreditCard, Calendar, DollarSign, Users, Copy, Check,
  AlertTriangle, CheckCircle2, Clock, ArrowUpRight, Receipt, Loader2,
} from "lucide-react";
import {
  COURSE_KEYS,
  aiOnlyMonthly,
  formatPrice,
  parsePricingConfig,
  yearlyPrice,
  type PricingConfig,
} from "@/lib/pricing";

type Subscription = {
  id: string;
  plan: string;
  planType: string;
  course: string;
  courseName: string;
  amount: number;
  amountUsd: number;
  interval: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active:   { color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900", label: "active" },
  trialing: { color: "text-blue-600",    bg: "bg-blue-100 dark:bg-blue-900",       label: "trialing" },
  past_due: { color: "text-red-600",     bg: "bg-red-100 dark:bg-red-900",         label: "pastDue" },
  cancelled:{ color: "text-muted-foreground", bg: "bg-muted",                      label: "cancelled" },
};

export default function PaymentsPage() {
  const t = useTranslations("payments");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [codeCopied, setCodeCopied] = useState(false);
  const [familyInput, setFamilyInput] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // Prices come from the one pricing config (Admin → Pricing). A failed load is
  // shown as a failure — this table must never fall back to typed-in numbers.
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [pricingFailed, setPricingFailed] = useState(false);
  const tc = useTranslations("coursesSection");
  const tpr = useTranslations("pricingPage");

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => {
        if (!r.ok) throw new Error(`pricing ${r.status}`);
        return r.json();
      })
      .then((data) => setPricing(parsePricingConfig(data.pricing)))
      .catch(() => setPricingFailed(true));
  }, []);

  useEffect(() => {
    fetch("/api/payments/subscription")
      .then((r) => r.json())
      .then((data) => {
        setSubscriptions(data.subscriptions ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const primarySub = subscriptions[0] ?? null;
  const totalPaid = subscriptions.reduce((sum, s) => {
    const amount = typeof s.amountUsd === "number" ? s.amountUsd : parseFloat(String(s.amountUsd ?? "0"));
    return sum + amount;
  }, 0);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const cfg = primarySub ? (statusConfig[primarySub.status] ?? statusConfig.active) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("managePayments")}</p>
          </div>
        </div>
      </motion.div>

      {/* Trial Banner */}
      {primarySub?.status === "trialing" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-foreground">{t("trialActive")}</p>
              {primarySub.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  Ends {new Date(primarySub.currentPeriodEnd).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">{t("subscribe")}</Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t("currentPlan")}</h3>

            {primarySub && cfg ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xl font-bold text-foreground">
                      {primarySub.courseName || "Course"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {primarySub.planType === "human_ai" ? t("plan1Label") : t("plan2Label")}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${cfg.color} border-current/30`}>
                    <CheckCircle2 className="w-3 h-3 me-1" />
                    {t(cfg.label)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" /><span>{t("amount")}</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      ${parseFloat(String(primarySub.amountUsd ?? "0")).toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">{t("perMonth")}</span>
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" /><span>{t("nextBilling")}</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {primarySub.currentPeriodEnd
                        ? new Date(primarySub.currentPeriodEnd).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="gap-2">
                    <ArrowUpRight className="w-4 h-4" />{t("upgradePlan")}
                  </Button>
                  {!showCancelConfirm ? (
                    <Button variant="outline" className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => setShowCancelConfirm(true)}>
                      {t("cancelSubscription")}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground max-w-[200px]">{t("cancelConfirm")}</p>
                      <Button size="sm" variant="destructive" onClick={() => setShowCancelConfirm(false)}>Confirm</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowCancelConfirm(false)}>No</Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t("noPlan")}</p>
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">{t("choosePlan")}</Button>
              </div>
            )}
          </motion.div>

          {/* Plan Pricing Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{t("choosePlan")}</h3>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {(["month", "year"] as const).map((interval) => (
                  <button key={interval} onClick={() => setBillingInterval(interval)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      billingInterval === interval ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}>
                    {interval === "month" ? t("monthly") : t("yearly")}
                  </button>
                ))}
              </div>
            </div>
            {pricingFailed ? (
              <p role="alert" className="text-sm text-red-600 py-4">
                {t("pricesUnavailable")}
              </p>
            ) : !pricing ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-start p-3 text-xs font-medium text-muted-foreground uppercase">{tpr("course")}</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">{tpr("col3Days")}</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">{tpr("col5Days")}</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">{t("plan2Label")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COURSE_KEYS.map((course) => {
                      const show = (monthly: number) =>
                        formatPrice(
                          billingInterval === "year"
                            ? yearlyPrice(pricing, monthly)
                            : monthly
                        );
                      const lbl = billingInterval === "year" ? t("perYear") : t("perMonth");
                      const cell = (amount: number | null) => (
                        <td className="p-3 text-center">
                          {amount === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <>
                              <span className="text-lg font-bold text-foreground tabular-nums">{show(amount)}</span>
                              <span className="text-xs text-muted-foreground">{lbl}</span>
                            </>
                          )}
                        </td>
                      );
                      return (
                        <tr key={course} className="border-b last:border-0">
                          <td className="p-3 text-sm font-medium text-foreground">{tc(`${course}Title`)}</td>
                          {cell(course === "hifz" ? null : pricing.oneOnOne.threeDays)}
                          {cell(course === "hifz" ? pricing.oneOnOne.hifz : pricing.oneOnOne.fiveDays)}
                          {cell(aiOnlyMonthly(pricing, course))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* All Subscriptions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-foreground">{t("paymentHistory")}</h3>
            </div>
            {subscriptions.length > 0 ? (
              <div className="divide-y">
                {subscriptions.map((sub) => {
                  const c = statusConfig[sub.status] ?? statusConfig.active;
                  return (
                    <div key={sub.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                          <Receipt className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{sub.planType}</p>
                          <p className="text-xs text-muted-foreground">
                            {sub.currentPeriodStart
                              ? new Date(sub.currentPeriodStart).toLocaleDateString("en-GB")
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground">
                          ${parseFloat(String(sub.amountUsd ?? "0")).toFixed(2)}
                        </span>
                        <Badge variant="outline" className={`${c.color} border-current/30 text-xs`}>
                          {c.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t("noPayments")}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="text-sm font-medium text-foreground">
                  {primarySub ? (primarySub.planType === "human_ai" ? t("plan1Label") : t("plan2Label")) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-sm font-medium ${cfg?.color ?? "text-muted-foreground"}`}>
                  {primarySub?.status ?? "No subscription"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Subscriptions</span>
                <span className="text-sm font-medium text-foreground">{subscriptions.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-sm font-bold text-emerald-600">${totalPaid.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Family Discount */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
            className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-foreground">{t("familyDiscount")}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{t("familyInfo")}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-muted-foreground">{pricing ? t("family2nd", { percent: pricing.familyDiscount.secondChildPercent }) : "…"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-muted-foreground">{pricing ? t("family3rd", { percent: pricing.familyDiscount.thirdChildOnwardPercent }) : "…"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">{t("familyCode")}</p>
              <div className="flex gap-2">
                <input type="text" value={familyInput} onChange={(e) => setFamilyInput(e.target.value)}
                  placeholder={t("familyCodePlaceholder")}
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {t("applyCode")}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
