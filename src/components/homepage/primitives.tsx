"use client";

import { motion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps the homepage so every framer-motion animation inside it honours the
 * visitor's "reduce motion" setting: transforms are dropped, opacity fades
 * are kept short. One switch for the whole page instead of a check per
 * component.
 */
export function HomeMotion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Scroll-reveal: fades and rises once, when it enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const Tag = motion[as];
  return (
    <Tag
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}

/** Eyebrow + display heading + gold ornament, shared by every section. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  /** "dark" for headings that sit on the deep-green surface. */
  tone?: "light" | "dark";
}) {
  const centered = align === "center";
  return (
    <Reveal className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          {eyebrow}
        </p>
      )}
      <h2
        className={`mt-3 font-display text-3xl font-semibold leading-tight md:text-[2.75rem] ${
          tone === "dark" ? "text-white" : "text-primary dark:text-foreground"
        }`}
      >
        {title}
      </h2>
      <div className={`ornament mt-5 ${centered ? "justify-center" : ""}`} aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0l3.5 8.5L24 12l-8.5 3.5L12 24l-3.5-8.5L0 12l8.5-3.5z" />
        </svg>
      </div>
      {subtitle && (
        <p
          className={`mt-5 text-lg leading-relaxed ${
            tone === "dark" ? "text-white/75" : "text-muted-foreground"
          }`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
