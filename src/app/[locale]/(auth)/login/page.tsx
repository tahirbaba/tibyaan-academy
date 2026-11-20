"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { loginWithEmail, loginWithGoogle } from "./actions";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const params = useParams();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const confirmPending = searchParams.get("confirmed") === "pending";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  async function handleEmailLogin(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.append("locale", locale);
    const result = await loginWithEmail(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const result = await loginWithGoogle(locale, remember);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      {/* Islamic geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMEwzMCAzME0wIDMwTDYwIDMwTTAgMEw2MCA2ME02MCAwTDAgNjAiIHN0cm9rZT0iIzFCNDMzMiIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 border-primary/20 shadow-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto text-3xl font-bold text-primary">
            {tc("appName")}
          </div>
          <CardTitle className="text-2xl">{t("loginTitle")}</CardTitle>
          <CardDescription>{t("loginSubtitle")}</CardDescription>
          <Badge
            variant="secondary"
            className="mx-auto bg-accent/10 text-accent border-accent/30"
          >
            {t("freeTrialBadge")}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email confirmation pending */}
          {confirmPending && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-sm text-emerald-700 dark:text-emerald-300 text-center">
              Account created! Please check your email to confirm, then login.
            </div>
          )}

          {/* Google OAuth */}
          <form action={handleGoogleLogin}>
            <Button
              type="submit"
              variant="outline"
              className="w-full h-12 gap-2 border-primary/20 hover:bg-primary/5"
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("googleLogin")}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">{tc("or")}</span>
            <Separator className="flex-1" />
          </div>

          {/* Email + Password */}
          <form action={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-accent hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                required
                minLength={6}
                className="h-12"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-[#1B4332]"
              />
              {t("rememberMe")}
            </label>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={loading}
            >
              {loading ? tc("loading") : t("loginButton")}
            </Button>
          </form>

          {/* Free Trial CTA */}
          <Link href="/signup" className="block">
            <Button
              variant="outline"
              className="w-full h-12 border-accent text-accent hover:bg-accent hover:text-white font-semibold"
            >
              {t("startTrial")}
            </Button>
          </Link>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href="/signup"
              className="text-primary font-semibold hover:underline"
            >
              {tc("signup")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
