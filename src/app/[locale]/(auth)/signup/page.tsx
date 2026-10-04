"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Camera } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { signupWithEmail } from "./actions";
import { loginWithGoogle } from "../login/actions";
import { YouTubeEmbed, parseYouTubeUrl } from "@/components/shared/youtube-embed";

// Guiding videos (Phase 14b), baked in at build. A role's card shows only if
// its link is set; an unset link shows nothing, never a broken frame.
const STUDENT_VIDEO = process.env.NEXT_PUBLIC_SIGNUP_GUIDING_VIDEO_LINK_STUDENT;
const TEACHER_VIDEO = process.env.NEXT_PUBLIC_SIGNUP_GUIDING_VIDEO_LINK_TEACHER;
const HAS_STUDENT_VIDEO = parseYouTubeUrl(STUDENT_VIDEO) !== null;
const HAS_TEACHER_VIDEO = parseYouTubeUrl(TEACHER_VIDEO) !== null;

const languages = [
  { value: "ur", label: "اردو" },
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "id", label: "Bahasa Indonesia" },
];

// Country phone codes with flags
const COUNTRY_CODES = [
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+212", flag: "🇲🇦", name: "Morocco" },
  { code: "+213", flag: "🇩🇿", name: "Algeria" },
  { code: "+216", flag: "🇹🇳", name: "Tunisia" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+98", flag: "🇮🇷", name: "Iran" },
  { code: "+964", flag: "🇮🇶", name: "Iraq" },
  { code: "+962", flag: "🇯🇴", name: "Jordan" },
  { code: "+961", flag: "🇱🇧", name: "Lebanon" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+249", flag: "🇸🇩", name: "Sudan" },
  { code: "+251", flag: "🇪🇹", name: "Ethiopia" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+86", flag: "🇨🇳", name: "China" },
];

export default function SignupPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const tShare = useTranslations("teacherShare");
  const tGuide = useTranslations("guidingVideos");
  const params = useParams();
  const locale = params.locale as string;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");
  const [countryCode, setCountryCode] = useState("+92");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function handleSignup(formData: FormData) {
    if (!termsAccepted) return;
    setLoading(true);
    setError(null);
    formData.append("locale", locale);
    // Combine country code + phone for student WhatsApp
    if (selectedRole === "student" && phoneNumber) {
      formData.set("parentWhatsapp", countryCode + phoneNumber);
    }
    const result = await signupWithEmail(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const result = await loginWithGoogle(locale);
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
          <CardTitle className="text-2xl">{t("signupTitle")}</CardTitle>
          <CardDescription>{t("signupSubtitle")}</CardDescription>
          <Badge
            variant="secondary"
            className="mx-auto bg-accent/10 text-accent border-accent/30"
          >
            {t("freeTrialBadge")}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
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

          {/* Email Signup Form */}
          <form action={handleSignup} className="space-y-4">
            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="relative w-20 h-20 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors overflow-hidden flex items-center justify-center group"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-7 h-7 text-primary/40 group-hover:text-primary/70 transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
              <p className="text-xs text-muted-foreground">{t("addPhoto")}</p>
              <input
                ref={avatarInputRef}
                name="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setAvatarPreview(url);
                  }
                }}
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("fullName")}</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder={t("fullNamePlaceholder")}
                required
                className="h-12"
              />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
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

            {/* Language Select */}
            <div className="space-y-2">
              <Label>{t("selectLanguage")}</Label>
              <Select name="language" defaultValue={locale}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Select */}
            <div className="space-y-2">
              <Label>{t("selectRole")}</Label>
              <Select
                name="role"
                defaultValue="student"
                onValueChange={(val) => setSelectedRole(val ?? "student")}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">{t("roleStudent")}</SelectItem>
                  <SelectItem value="teacher">{t("roleTeacher")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Guiding video for the chosen role (Phase 14b). Shows only if that
                role's link is set; otherwise nothing renders. */}
            {((selectedRole === "student" && HAS_STUDENT_VIDEO) ||
              (selectedRole === "teacher" && HAS_TEACHER_VIDEO)) && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  {selectedRole === "teacher"
                    ? tGuide("teacherTitle")
                    : tGuide("studentTitle")}
                </p>
                <YouTubeEmbed
                  url={selectedRole === "teacher" ? TEACHER_VIDEO : STUDENT_VIDEO}
                  title={
                    selectedRole === "teacher"
                      ? tGuide("teacherTitle")
                      : tGuide("studentTitle")
                  }
                />
              </div>
            )}

            {/* Teacher share (25%) — shown before a teacher commits. Wording is
                behind the teacherShare keys and awaits owner approval. */}
            {selectedRole === "teacher" && (
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-1">
                <p className="text-sm font-semibold text-accent">
                  {tShare("title")}
                </p>
                <p className="text-sm text-muted-foreground">{tShare("body")}</p>
              </div>
            )}

            {/* Parent WhatsApp with country code — students only */}
            {selectedRole === "student" && (
              <div className="space-y-2">
                <Label htmlFor="parentWhatsapp">{t("parentWhatsapp")}</Label>
                <div className="flex gap-2">
                  {/* Country code selector */}
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-12 rounded-lg border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 shrink-0 w-[140px]"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code + c.name} value={c.code}>
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  {/* Phone number input */}
                  <Input
                    id="parentWhatsapp"
                    type="tel"
                    placeholder="300-1234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12 flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Combined: {countryCode}{phoneNumber || "XXXXXXXXXX"}
                </p>
              </div>
            )}

            {/* Teacher WhatsApp — teachers enter their own number directly */}
            {selectedRole === "teacher" && (
              <div className="space-y-2">
                <Label htmlFor="teacherWhatsapp">Your WhatsApp Number</Label>
                <Input
                  id="teacherWhatsapp"
                  name="parentWhatsapp"
                  type="tel"
                  placeholder="+92-300-1234567"
                  className="h-12"
                />
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked === true)
                }
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer">
                {t("acceptTerms")}
              </Label>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold"
              disabled={loading || !termsAccepted}
            >
              {loading ? tc("loading") : t("signupButton")}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              {tc("login")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
