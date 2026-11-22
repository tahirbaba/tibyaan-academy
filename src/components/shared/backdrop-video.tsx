"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

/**
 * Generated backdrop videos (scripts/backdrop-video — drawn by code, so there
 * is nothing to license):
 *   night-masjid    a masjid under a starry sky with a crescent — dark bands
 *   geometry-light  turning girih rosettes on ivory — light page headers
 *   geometry-dark   the same in deep green — page headers in dark mode
 *
 * Loaded only after the page is idle, and never on phones, on data saver or
 * with reduced motion: there they would cost data and push the page's load
 * time past Google's line for no gain in meaning. Those visitors keep the
 * CSS lattice and skyline, which are complete on their own. The video fades
 * in once it is actually playing, so there is never a blank flash.
 */
export type BackdropScene = "night-masjid" | "geometry";

function useDesktopIdle(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData === true;
    if (!wide || calm || saveData) return;
    const go = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(go, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(go, 1500);
    return () => clearTimeout(id);
  }, []);
  return ready;
}

/** Follows the site's light/dark theme (the `dark` class on <html>). */
function useDarkTheme(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    const read = () => setDark(html.classList.contains("dark"));
    const frame = requestAnimationFrame(read);
    const obs = new MutationObserver(read);
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => {
      cancelAnimationFrame(frame);
      obs.disconnect();
    };
  }, []);
  return dark;
}

export function BackdropVideo({
  scene,
  className = "",
}: {
  scene: BackdropScene;
  className?: string;
}) {
  const ready = useDesktopIdle();
  const dark = useDarkTheme();
  const [playing, setPlaying] = useState(false);
  if (!ready) return null;

  const name = scene === "geometry" ? (dark ? "geometry-dark" : "geometry-light") : scene;
  return (
    // The wrapper carries the strength (className, e.g. opacity-70); the
    // video itself only fades from 0 to full once it is playing.
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 ${className}`}>
    <video
      key={name}
      className={`h-full w-full object-cover transition-opacity duration-[1500ms] ${
        playing ? "opacity-100" : "opacity-0"
      }`}
      src={`/videos/bg-${name}.mp4`}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    />
    </div>
  );
}

/**
 * For every public page except the homepage: puts the right backdrop video
 * into the page's first band without each page having to include it. A dark
 * band (the star lattice or the deep-green gradient) gets the masjid at
 * night; a light band gets the turning geometry.
 *
 * Rendered through a portal into that existing <section>; the video is the
 * section's last child and sits behind its content (-z-10 inside the
 * section's own stacking context, set in globals.css).
 */
export function PageBackdrop() {
  const [target, setTarget] = useState<{ el: HTMLElement; scene: BackdropScene } | null>(null);
  // The layout stays mounted while the visitor moves between pages, so the
  // band is looked up again on every page change.
  const pathname = usePathname();

  useEffect(() => {
    // Looked up on the next frame: the new page's markup is in place by then,
    // and the state change happens outside the effect body.
    const frame = requestAnimationFrame(() => {
      const main = document.querySelector("main");
      const first =
        main && !main.classList.contains("home-main")
          ? (main.querySelector<HTMLElement>(":scope > section:first-child") ??
            main.querySelector<HTMLElement>(":scope > div:first-child > section:first-child"))
          : null;
      if (!first) {
        setTarget(null);
        return;
      }
      const darkBand =
        first.classList.contains("pattern-stars") ||
        /bg-primary(?![\w/-])|from-\[#0F2922\]|from-\[#1B4332\]/.test(first.className);
      setTarget({ el: first, scene: darkBand ? "night-masjid" : "geometry" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  if (!target) return null;
  return createPortal(
    <BackdropVideo
      scene={target.scene}
      className={target.scene === "night-masjid" ? "opacity-70" : "opacity-90"}
    />,
    target.el
  );
}
