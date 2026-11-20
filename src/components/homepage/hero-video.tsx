"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero's video window: a 20-second silent loop of a live online lesson
 * (five Pexels clips joined with crossfades, 0.9 MB — public/videos).
 *
 * It sits OVER the designed static panel and fades in once it is playing, so:
 *  - the first paint is the static panel, never a blank box;
 *  - it is loaded only after the page is idle, so it cannot delay the
 *    headline (the page's largest paint);
 *  - it is NOT loaded on phones, on "data saver", or when the visitor asks
 *    for reduced motion. On a phone it would become the largest element on
 *    screen and push the page's load time past Google's 2.5 s line, and it
 *    would spend a family's mobile data on decoration. Those visitors see the
 *    static panel, which is complete on its own.
 *
 * Muted, inline and looping — browsers only autoplay a video with no sound.
 */
export function HeroVideo() {
  const [show, setShow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData === true;
    if (!wide || calm || saveData) return;

    const start = () => setShow(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 1500);
    return () => clearTimeout(id);
  }, []);

  if (!show) return null;

  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
        playing ? "opacity-100" : "opacity-0"
      }`}
      src="/videos/hero-online-class.mp4"
      poster="/videos/hero-online-class-poster.webp"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    />
  );
}
