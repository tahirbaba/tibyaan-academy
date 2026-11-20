"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DollarSign, Loader2 } from "lucide-react";
import {
  applyDiscount,
  formatPrice,
  pricingConfigSchema,
  teacherShare,
  type PricingConfig,
} from "@/lib/pricing";

type Load =
  | { state: "loading" }
  | { state: "failed" }
  | { state: "ready"; isDefault: boolean };

/**
 * Admin → Pricing. The one place fees, the teacher share and the family
 * discounts are set. Saving changes what NEW checkouts are charged; it never
 * touches an existing Stripe subscription.
 */
export function PricingAdminClient() {
  const t = useTranslations("adminPricing");
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [form, setForm] = useState<PricingConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const fetchPricing = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pricing");
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setForm(pricingConfigSchema.parse(data.pricing));
      setLoad({ state: "ready", isDefault: data.isDefault === true });
    } catch {
      setLoad({ state: "failed" });
    }
  }, []);

  useEffect(() => {
    // Loading server data on mount; state is set only after the await.
    void fetchPricing();
  }, [fetchPricing]);

  if (load.state === "loading") {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (load.state === "failed" || !form) {
    return (
      <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700 dark:bg-red-950/30 dark:text-red-300">
        {t("loadFailed")}
      </p>
    );
  }

  const num = (v: string) => (v === "" ? NaN : Number(v));
  const field = (
    label: string,
    value: number,
    onChange: (n: number) => void,
    suffix: string
  ) => (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="mt-1 flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={Number.isNaN(value) ? "" : value}
          onChange={(e) => onChange(num(e.target.value))}
          className="w-32 rounded-lg border bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <span className="text-sm text-muted-foreground">{suffix}</span>
      </span>
    </label>
  );

  const valid = pricingConfigSchema.safeParse(form);

  async function save() {
    if (!valid.success) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valid.data),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      // Show what the server says is now stored, not what was typed.
      setForm(pricingConfigSchema.parse(data.pricing));
      setLoad({ state: "ready", isDefault: false });
      setMessage({ ok: true, text: t("saved") });
    } catch {
      setMessage({ ok: false, text: t("saveFailed") });
    } finally {
      setSaving(false);
    }
  }

  const tiers = [
    { label: t("tier3Days"), fee: form.oneOnOne.threeDays },
    { label: t("tier5Days"), fee: form.oneOnOne.fiveDays },
    { label: t("tierHifz"), fee: form.oneOnOne.hifz },
  ];
  const d2 = form.familyDiscount.secondChildPercent;
  const d3 = form.familyDiscount.thirdChildOnwardPercent;
  const cell = (fee: number, discount: number) => {
    if (!valid.success) return "—";
    const paid = applyDiscount(fee, discount);
    const teacher = teacherShare(form, paid);
    return `${formatPrice(paid)} → ${formatPrice(teacher)} / ${formatPrice(paid - teacher)}`;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <DollarSign className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        {t("newOnlyNote")}
      </p>
      {load.isDefault && (
        <p className="text-sm text-muted-foreground">{t("usingDefaults")}</p>
      )}

      <section className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold text-foreground">{t("oneOnOneTitle")}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {field(t("tier3Days"), form.oneOnOne.threeDays, (n) => setForm({ ...form, oneOnOne: { ...form.oneOnOne, threeDays: n } }), t("usdMonth"))}
          {field(t("tier5Days"), form.oneOnOne.fiveDays, (n) => setForm({ ...form, oneOnOne: { ...form.oneOnOne, fiveDays: n } }), t("usdMonth"))}
          {field(t("tierHifz"), form.oneOnOne.hifz, (n) => setForm({ ...form, oneOnOne: { ...form.oneOnOne, hifz: n } }), t("usdMonth"))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold text-foreground">{t("aiOnlyTitle")}</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {field("Nazra", form.aiOnly.nazra, (n) => setForm({ ...form, aiOnly: { ...form.aiOnly, nazra: n } }), t("usdMonth"))}
          {field("Hifz", form.aiOnly.hifz, (n) => setForm({ ...form, aiOnly: { ...form.aiOnly, hifz: n } }), t("usdMonth"))}
          {field("Arabic", form.aiOnly.arabic, (n) => setForm({ ...form, aiOnly: { ...form.aiOnly, arabic: n } }), t("usdMonth"))}
          {field("Aalim", form.aiOnly.aalim, (n) => setForm({ ...form, aiOnly: { ...form.aiOnly, aalim: n } }), t("usdMonth"))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold text-foreground">{t("splitTitle")}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {field(t("teacherShare"), form.teacherSharePercent, (n) => setForm({ ...form, teacherSharePercent: n }), "%")}
          {field(t("secondChild"), d2, (n) => setForm({ ...form, familyDiscount: { ...form.familyDiscount, secondChildPercent: n } }), "%")}
          {field(t("thirdChild"), d3, (n) => setForm({ ...form, familyDiscount: { ...form.familyDiscount, thirdChildOnwardPercent: n } }), "%")}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {valid.success ? t("academyShare", { percent: 100 - form.teacherSharePercent }) : ""}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{t("cohortNote")}</p>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold text-foreground">{t("previewTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("previewHelp")}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-muted-foreground">
                <th className="py-2 pe-4 text-start font-medium">{t("colPlan")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("colFirst")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("colSecond")}</th>
                <th className="py-2 pe-4 text-start font-medium">{t("colThird")}</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.label} className="border-b last:border-0 tabular-nums">
                  <td className="py-2 pe-4 font-medium text-foreground">{tier.label}</td>
                  <td className="py-2 pe-4">{cell(tier.fee, 0)}</td>
                  <td className="py-2 pe-4">{cell(tier.fee, d2)}</td>
                  <td className="py-2 pe-4">{cell(tier.fee, d3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={save} disabled={saving || !valid.success} size="lg">
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {t("save")}
        </Button>
        {!valid.success && (
          <p role="alert" className="text-sm font-medium text-red-600">{t("invalid")}</p>
        )}
        {message && (
          <p role={message.ok ? "status" : "alert"} className={`text-sm font-medium ${message.ok ? "text-emerald-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
