import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/** The shared frame for the small account pages (forgot / reset password). */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="pattern-stars relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0F2922] via-[#1B4332] to-[#143528] p-4">
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#C9A84C]/25 bg-card p-8 shadow-2xl">
        <Link href="/" className="block text-center font-display text-3xl font-semibold text-primary">
          Tibyaan
        </Link>
        <h1 className="mt-6 text-center text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
