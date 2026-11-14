"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { Youtube, Linkedin, Facebook, Instagram, MessageCircle } from "lucide-react";

const languages = [
  { value: "ur", label: "اردو" },
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "id", label: "Indonesia" },
];

const socials = [
  { name: "YouTube", href: "https://www.youtube.com/channel/UCBU7Fc9ZjYU42SHfSQM9_rg", icon: Youtube },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/tibyaan-academy-0263b73bb/", icon: Linkedin },
  { name: "X", href: "https://x.com/TibyaanAcademy", icon: ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: "Facebook", href: "https://web.facebook.com/profile.php?id=61576509186955", icon: Facebook },
  { name: "Instagram", href: "https://www.instagram.com/tibyaanacademy/", icon: Instagram },
  { name: "WhatsApp", href: "https://wa.me/923129114002", icon: MessageCircle },
];

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo + Tagline */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold">Tibyaan</div>
            <div className="text-sm opacity-80">Academy</div>
            <p className="mt-3 text-sm opacity-70">{t("tagline")}</p>

            {/* Social Links */}
            <div className="mt-4 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">{t("quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("courses")}
                </Link>
              </li>
              <li>
                <Link href="/group-classes" className="opacity-70 hover:opacity-100 transition-opacity">
                  {tc("groupClasses")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">{t("legal")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="opacity-70 hover:opacity-100 transition-opacity">
                  {t("refundPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/dars" className="opacity-70 hover:opacity-100 transition-opacity">
                  Daily Dars
                </Link>
              </li>
              <li>
                <Link href="/faq" className="opacity-70 hover:opacity-100 transition-opacity">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h4 className="font-semibold mb-3">Countries</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/uk" className="opacity-70 hover:opacity-100 transition-opacity">🇬🇧 UK</Link></li>
              <li><Link href="/usa" className="opacity-70 hover:opacity-100 transition-opacity">🇺🇸 USA</Link></li>
              <li><Link href="/uae" className="opacity-70 hover:opacity-100 transition-opacity">🇦🇪 UAE</Link></li>
              <li><Link href="/canada" className="opacity-70 hover:opacity-100 transition-opacity">🇨🇦 Canada</Link></li>
              <li><Link href="/australia" className="opacity-70 hover:opacity-100 transition-opacity">🇦🇺 Australia</Link></li>
              <li><Link href="/indonesia" className="opacity-70 hover:opacity-100 transition-opacity">🇮🇩 Indonesia</Link></li>
              <li><Link href="/germany" className="opacity-70 hover:opacity-100 transition-opacity">🇩🇪 Germany</Link></li>
              <li><Link href="/saudi" className="opacity-70 hover:opacity-100 transition-opacity">🇸🇦 Saudi Arabia</Link></li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h4 className="font-semibold mb-3">{t("languages")}</h4>
            <ul className="space-y-2 text-sm">
              {languages.map((lang) => (
                <li key={lang.value}>
                  <button
                    onClick={() => router.replace(pathname, { locale: lang.value })}
                    className={`opacity-70 hover:opacity-100 transition-opacity ${
                      locale === lang.value ? "font-semibold opacity-100" : ""
                    }`}
                  >
                    {lang.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm opacity-60">
          <p>
            &copy; {new Date().getFullYear()} {tc("appName")}. {t("rights")}
          </p>
          <p>{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
