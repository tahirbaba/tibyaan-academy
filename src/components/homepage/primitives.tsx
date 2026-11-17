"use client";

import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { useRef, type PointerEvent, type ReactNode } from "react";

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

/**
 * A line of text whose words rise into place one after another as it scrolls
 * into view. The full sentence is given to screen readers once (aria-label);
 * the moving word-pieces are hidden from them. Splitting is on spaces only,
 * so Arabic and Urdu words stay whole and joined.
 */
export function AnimatedWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span aria-label={text} className="inline">
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "105%", rotate: 4 }}
            whileInView={{ y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.65, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

/**
 * A card that leans toward the cursor in 3D and carries a soft moving
 * highlight. Pointer-driven only: nothing happens on touch screens or when the
 * visitor has asked for reduced motion, and the card returns flat when the
 * cursor leaves. Styles are written straight to the element, so moving the
 * mouse never re-renders React.
 */
export function TiltCard({
  children,
  className = "",
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  /** Largest tilt, in degrees. */
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  function onMove(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse" || !ref.current) return;
    const el = ref.current;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    el.style.setProperty("--tilt-x", `${((0.5 - y) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${((x - 0.5) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--glare-x", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--glare-y", `${(y * 100).toFixed(1)}%`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div className="tilt-scene h-full">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={`tilt-card h-full ${className}`}
      >
        {children}
      </div>
    </div>
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
        <AnimatedWords text={title} />
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
