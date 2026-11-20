"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/auth-card";
import { MailCheck } from "lucide-react";
import { requestPasswordReset } from "../login/actions";

export default function ForgotPasswordPage() {
  const t = useTranslations("passwordReset");
  const locale = useLocale();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.append("locale", locale);
    try {
      const result = await requestPasswordReset(formData);
      if ("ok" in result) {
        setSent(true);
      } else {
        setError(result.error === "rate_limited" ? t("errRateLimited") : t("errSendFailed"));
      }
    } catch {
      setError(t("errSendFailed"));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthCard title={t("sentTitle")} subtitle={t("sentBody")}>
        <MailCheck className="mx-auto h-12 w-12 text-accent" aria-hidden />
        <Link href="/login" className="mt-8 block">
          <Button className="h-12 w-full rounded-full">{t("backToLogin")}</Button>
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("forgotTitle")} subtitle={t("forgotSubtitle")}>
      <form action={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" className="h-12" />
        </div>
        {error && (
          <p role="alert" className="text-center text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="h-12 w-full rounded-full font-semibold">
          {loading ? "…" : t("sendLink")}
        </Button>
        <p className="text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
