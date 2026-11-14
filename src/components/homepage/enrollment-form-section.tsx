"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { SectionHeading } from "./primitives";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { trackEnrollmentSubmit } from "@/lib/analytics";

const countries = [
  "Pakistan", "UK", "USA", "UAE", "Canada",
  "Australia", "Saudi Arabia", "Germany", "France", "Indonesia", "Other",
];

const courses = ["Nazra Quran", "Hifz Quran", "Arabic Language", "Aalim Course"];

export function EnrollmentFormSection() {
  const t = useTranslations("enrollmentForm");
  const locale = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    country: "",
    course: "",
    plan: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/enrollment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      if (!res.ok) throw new Error(`enrollment request ${res.status}`);
      trackEnrollmentSubmit(form.country, form.course);
      setSubmitted(true);
    } catch {
      // This used to show the success screen even when the request failed, so
      // a family who filled in the form believed they had enquired and the
      // academy never received it. A failed enquiry now says so, and the form
      // keeps what was typed so it can be sent again.
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-20 bg-background">
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary">{t("successTitle")}</h2>
            <p className="mt-2 text-muted-foreground">{t("successDesc")}</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onSubmit={handleSubmit}
          className="premium-card mt-10 space-y-4 p-6 hover:!translate-y-0 md:p-8"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("name")} <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={t("namePlaceholder")}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email <span className="text-accent">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="you@example.com"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("whatsapp")} <span className="text-accent">*</span>
            </label>
            <input
              type="tel"
              required
              value={form.whatsapp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9+\-\s]/g, "");
                setForm({ ...form, whatsapp: val });
              }}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="+92 312 0000000"
            />
          </div>

          {/* Country + Course row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("country")} <span className="text-accent">*</span>
              </label>
              <select
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">{t("selectCountry")}</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("course")} <span className="text-accent">*</span>
              </label>
              <select
                required
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">{t("selectCourse")}</option>
                {courses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("plan")} <span className="text-accent">*</span>
            </label>
            <select
              required
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">{t("selectPlan")}</option>
              <option value="plan1">{t("plan1")}</option>
              <option value="plan2">{t("plan2")}</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("message")}
            </label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder={t("messagePlaceholder")}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold rounded-full"
          >
            {loading ? "..." : t("submit")}
          </Button>
          {failed && (
            <p role="alert" className="text-center text-sm font-medium text-red-600">
              {t("submitFailed")}
            </p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
