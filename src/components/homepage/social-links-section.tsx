"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionHeading } from "./primitives";
import { Youtube, Linkedin, Facebook, Instagram, ExternalLink } from "lucide-react";

const socialLinks = [
  {
    key: "youtube",
    href: "https://www.youtube.com/channel/UCBU7Fc9ZjYU42SHfSQM9_rg",
    icon: Youtube,
    color: "bg-red-600",
    label: "YouTube",
  },
  {
    key: "linkedin",
    href: "https://www.linkedin.com/in/tibyaan-academy-0263b73bb/",
    icon: Linkedin,
    color: "bg-blue-700",
    label: "LinkedIn",
  },
  {
    key: "x",
    href: "https://x.com/TibyaanAcademy",
    icon: ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "bg-black dark:bg-gray-800",
    label: "X (Twitter)",
  },
  {
    key: "facebook",
    href: "https://web.facebook.com/profile.php?id=61576509186955",
    icon: Facebook,
    color: "bg-blue-600",
    label: "Facebook",
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/tibyaanacademy/",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 to-pink-500",
    label: "Instagram",
  },
];

export function SocialLinksSection() {
  const t = useTranslations("socialLinks");

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        {/* Horizontal scroll row of portrait cards */}
        <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 scrollbar-hide lg:justify-center">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="premium-card group flex w-48 flex-none snap-start flex-col items-center gap-4 p-6 text-center"
              >
                {/* Icon circle */}
                <div className={`w-16 h-16 rounded-2xl ${social.color} flex items-center justify-center text-white shadow-lg`}>
                  <Icon className="w-8 h-8" />
                </div>
                {/* Label */}
                <div>
                  <div className="font-bold text-foreground text-base">{social.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t(`${social.key}Desc`)}</div>
                </div>
                {/* Follow button */}
                <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                  Follow <ExternalLink className="w-3 h-3" />
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Scroll hint */}
        <p className="mt-4 text-center text-xs text-muted-foreground lg:hidden">
          ← Scroll to see all social channels →
        </p>
      </div>
    </section>
  );
}
