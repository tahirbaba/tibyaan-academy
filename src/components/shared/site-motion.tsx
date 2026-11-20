"use client";

import { useEffect } from "react";

/**
 * The motion layer for every page except the homepage (which has its own):
 *
 *  - marks <body> so the CSS in globals.css can animate page titles, section
 *    headings and cards (scroll-driven, no JavaScript per element);
 *  - one pointer listener for the whole page that leans the card under the
 *    cursor toward it in 3D.
 *
 * It never touches the page's markup or text: it only writes CSS custom
 * properties on the card the cursor is over, so it cannot break a page that
 * React re-renders. Nothing runs on touch screens or when the visitor has
 * asked for reduced motion.
 */
const CARD = [
  ".premium-card",
  ".rounded-2xl.border",
  ".rounded-xl.border",
  ".rounded-3xl.border",
].join(",");

export function SiteMotion({
  variant,
  maxTilt = 6,
}: {
  variant: "public" | "dashboard";
  /** Largest tilt in degrees. */
  maxTilt?: number;
}) {
  useEffect(() => {
    document.body.dataset.motion = variant;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    let current: HTMLElement | null = null;
    let frame = 0;

    function flatten(el: HTMLElement | null) {
      if (!el) return;
      el.style.setProperty("--auto-tilt-x", "0deg");
      el.style.setProperty("--auto-tilt-y", "0deg");
    }

    function onMove(event: PointerEvent) {
      if (reduce.matches || !fine.matches || event.pointerType !== "mouse") return;
      const target = event.target as Element | null;
      const card = target?.closest<HTMLElement>(CARD) ?? null;
      // Only modest cards lean: a whole table or a form would be unpleasant
      // to read while tilting, and a card already moved by another animation
      // (an inline transform) is left alone.
      const eligible =
        card &&
        card.closest("main") &&
        !card.matches(".tilt-card, .tilt-card *, .marquee-row *") &&
        !card.style.transform &&
        !card.querySelector("table, form, input, textarea, select") &&
        card.offsetWidth <= 560 &&
        card.offsetHeight <= 520
          ? card
          : null;

      if (eligible !== current) {
        flatten(current);
        current?.classList.remove("auto-tilt-on");
        current = eligible;
        current?.classList.add("auto-tilt-on");
      }
      if (!current) return;

      const el = current;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width;
        const y = (event.clientY - box.top) / box.height;
        el.style.setProperty("--auto-tilt-x", `${((0.5 - y) * maxTilt * 2).toFixed(2)}deg`);
        el.style.setProperty("--auto-tilt-y", `${((x - 0.5) * maxTilt * 2).toFixed(2)}deg`);
        el.style.setProperty("--auto-glare-x", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--auto-glare-y", `${(y * 100).toFixed(1)}%`);
      });
    }

    function onLeaveWindow() {
      flatten(current);
      current?.classList.remove("auto-tilt-on");
      current = null;
    }

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeaveWindow);
      cancelAnimationFrame(frame);
      onLeaveWindow();
      delete document.body.dataset.motion;
    };
  }, [variant, maxTilt]);

  return null;
}
