"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { X } from "lucide-react";
import { useUser } from "@/hooks/use-user";

/**
 * Remembered per visitor, not per tab. sessionStorage meant a new tab was a
 * new visitor, so the popup could greet the same person several times a day.
 */
const SEEN_KEY = "trial_popup_seen_at";
const ONCE_PER_MS = 7 * 24 * 60 * 60 * 1000;

/** Signed-in areas. The trial offer is for visitors, not for students. */
const PRIVATE_PREFIXES = ["/student", "/teacher", "/admin", "/login", "/signup", "/onboarding"];

function seenWithinTheWeek(): boolean {
  try {
    const at = Number(localStorage.getItem(SEEN_KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at < ONCE_PER_MS;
  } catch {
    // Storage blocked (private mode, cookie settings). Stay quiet rather than
    // show the popup on every page view to someone who cannot dismiss it.
    return true;
  }
}

function rememberSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {
    /* nothing to do - the popup simply will not be suppressed */
  }
}

const content = {
  en: {
    heading: "Wait! Before you go...",
    subheading: "Get 5 days of free Quran classes — no credit card needed",
    button: "Start Free Trial",
  },
  ur: {
    heading: "رکیں! جانے سے پہلے...",
    subheading: "5 دن مفت قرآن کلاسز پائیں — کوئی کریڈٹ کارڈ ضروری نہیں",
    button: "مفت ٹرائل شروع کریں",
  },
  ar: {
    heading: "انتظر! قبل أن تغادر...",
    subheading: "احصل على 5 أيام مجانية من دروس القرآن — دون بطاقة ائتمان",
    button: "ابدأ التجربة المجانية",
  },
  fr: {
    heading: "Attendez! Avant de partir...",
    subheading: "Obtenez 5 jours de cours de Coran gratuits — aucune carte de crédit",
    button: "Commencer l'essai gratuit",
  },
  id: {
    heading: "Tunggu! Sebelum pergi...",
    subheading: "Dapatkan 5 hari kelas Quran gratis — tidak perlu kartu kredit",
    button: "Mulai Uji Coba Gratis",
  },
};

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const { user, loading } = useUser();

  // usePathname from @/i18n/navigation is already locale-stripped.
  const isPrivate = PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  useEffect(() => {
    if (isPrivate) return;
    if (loading || user) return; // logged-out visitors only
    if (typeof window === "undefined") return;
    if (seenWithinTheWeek()) return;

    // Mobile check
    if (window.innerWidth < 768) return;

    let timer: ReturnType<typeof setTimeout>;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        timer = setTimeout(() => {
          setVisible(true);
          rememberSeen();
        }, 2000);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [isPrivate, pathname, user, loading]);

  // Any dismissal counts, and is remembered for the same week.
  const dismiss = () => {
    rememberSeen();
    setVisible(false);
  };

  if (!visible || isPrivate || user) return null;

  const t = content[(locale as keyof typeof content)] || content.en;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl border shadow-2xl p-8 max-w-md w-full text-center">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-4xl mb-4">🕌</div>
        <h2 className="text-2xl font-bold text-foreground">{t.heading}</h2>
        <p className="mt-3 text-muted-foreground">{t.subheading}</p>

        <Link
          href="/signup"
          onClick={dismiss}
          className="mt-6 inline-flex items-center justify-center w-full bg-[#1B4332] hover:bg-[#1B4332]/90 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          {t.button}
        </Link>

        <button
          onClick={dismiss}
          className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
