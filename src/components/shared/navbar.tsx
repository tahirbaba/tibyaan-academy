"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Menu, X, Moon, Sun, Globe, ChevronDown } from "lucide-react";

const languages = [
  { value: "ur", label: "اردو", flag: "🇵🇰" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "id", label: "Indonesia", flag: "🇮🇩" },
];

const courseLinks = [
  { key: "nazra", slug: "nazra-quran" },
  { key: "hifz", slug: "hifz-quran" },
  { key: "arabic", slug: "arabic-language" },
  { key: "aalim", slug: "aalim-course" },
] as const;

const navLinks = [
  { href: "/courses" as const, key: "courses" as const },
  { href: "/group-classes" as const, key: "groupClasses" as const },
  { href: "/about" as const, key: "about" as const },
  { href: "/blog" as const, key: "blog" as const },
  { href: "/pricing" as const, key: "pricing" as const },
  { href: "/contact" as const, key: "contact" as const },
];

export function Navbar() {
  const t = useTranslations("common");
  const tcs = useTranslations("coursesSection");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
    setLangOpen(false);
    setMobileOpen(false);
  }

  return (
    <>
    <div className="bg-[#0f172a] text-white py-2.5 px-4 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-1">
        <span>WhatsApp: <a href="https://wa.me/923129114002" className="hover:underline font-medium">+92 312 9114002</a></span>
        <span className="hidden sm:inline">academytibyaan@gmail.com</span>
      </div>
    </div>
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              Tibyaan
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              Academy
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.key === "courses" ? (
                // Resting the cursor on "Courses" (or tabbing to it) opens the
                // four courses; moving away closes it. The link itself still
                // goes to the Courses page, so a tap on a phone works as before.
                <div key={link.key} className="nav-drop-root relative py-5">
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t(link.key)}
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <div className="nav-drop absolute start-1/2 top-full z-50 w-64 -translate-x-1/2 rtl:translate-x-1/2">
                    <ul className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl">
                      {courseLinks.map((course) => (
                        <li key={course.slug}>
                          <Link
                            href={`/courses/${course.slug}`}
                            className="block rounded-xl px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          >
                            {tcs(`${course.key}Title`)}
                          </Link>
                        </li>
                      ))}
                      <li className="mt-1 border-t border-border pt-1">
                        <Link
                          href="/group-classes"
                          className="block rounded-xl px-4 py-2.5 text-sm font-medium text-[#8A6F1F] transition-colors hover:bg-accent/10 dark:text-accent"
                        >
                          {t("groupClasses")}
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.key}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {t(link.key)}
                </Link>
              )
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-primary rounded-md transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{languages.find((l) => l.value === locale)?.flag}</span>
              </button>
              {langOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangOpen(false)}
                  />
                  <div className="absolute end-0 mt-2 w-44 bg-popover border rounded-lg shadow-lg z-50 py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => switchLocale(lang.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/10 transition-colors ${
                          locale === lang.value
                            ? "text-primary font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md text-muted-foreground hover:text-primary transition-colors"
            >
              <Sun className="w-4 h-4 hidden dark:block" />
              <Moon className="w-4 h-4 block dark:hidden" />
            </button>

            {/* Auth Buttons */}
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t("login")}
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-accent hover:bg-accent/90 text-white font-semibold"
              >
                {t("startFreeTrial")}
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {t(link.key)}
              </Link>
            ))}

            <div className="border-t pt-3 space-y-2">
              {/* Language Options */}
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => switchLocale(lang.value)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      locale === lang.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>

              {/* Dark mode */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-2 py-2 text-sm text-muted-foreground"
              >
                <Sun className="w-4 h-4 hidden dark:block" />
                <Moon className="w-4 h-4 block dark:hidden" />
                <span className="dark:hidden">{t("darkMode")}</span>
                <span className="hidden dark:inline">{t("lightMode")}</span>
              </button>
            </div>

            <div className="border-t pt-3 flex gap-2">
              <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-accent hover:bg-accent/90 text-white">
                  {t("startFreeTrial")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  );
}
