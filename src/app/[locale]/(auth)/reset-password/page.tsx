"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/auth-card";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type State = "checking" | "ready" | "no-session" | "saving" | "done";

/**
 * Reached from the password-reset email, via /api/auth/callback, which has
 * already signed the person in with the one-time link. Without that session
 * (an old or already-used link) the page says so, instead of showing a form
 * that cannot work.
 */
export default function ResetPasswordPage() {
  const t = useTranslations("passwordReset");
  const locale = useLocale();
  const [state, setState] = useState<State>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reading who is signed in on mount; state is set only after the await.
    createClient()
      .auth.getUser()
      .then(({ data }) => setState(data.user ? "ready" : "no-session"))
      .catch(() => setState("no-session"));
  }, []);

  async function submit(formData: FormData) {
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    setError(null);
    if (password.length < 8) {
      setError(t("errTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("errMismatch"));
      return;
    }

    setState("saving");
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      setState("ready");
      setError(
        /same|different/i.test(updateError.message) ? t("errSamePassword") : t("errSaveFailed")
      );
      return;
    }
    setState("done");
    // The login page sends a signed-in person straight to their dashboard.
    setTimeout(() => window.location.assign(`/${locale}/login`), 1500);
  }

  if (state === "checking") {
    return (
      <AuthCard title={t("resetTitle")}>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden />
      </AuthCard>
    );
  }

  if (state === "no-session") {
    return (
      <AuthCard title={t("linkExpiredTitle")} subtitle={t("linkExpiredBody")}>
        <Link href="/forgot-password">
          <Button className="h-12 w-full rounded-full">{t("sendNewLink")}</Button>
        </Link>
      </AuthCard>
    );
  }

  if (state === "done") {
    return (
      <AuthCard title={t("doneTitle")} subtitle={t("doneBody")}>
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" aria-hidden />
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("resetTitle")} subtitle={t("resetSubtitle")}>
      <form action={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t("newPassword")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{t("confirmPassword")}</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12"
          />
        </div>
        {error && (
          <p role="alert" className="text-center text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={state === "saving"}
          className="h-12 w-full rounded-full font-semibold"
        >
          {state === "saving" ? "…" : t("savePassword")}
        </Button>
      </form>
    </AuthCard>
  );
}
