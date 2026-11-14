"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Its own chunk, never server-rendered, never in the initial JS.
const HeroOrnament = dynamic(() => import("./hero-ornament"), { ssr: false });

/**
 * Mounts the decorative hero star only once the browser is idle after first
 * render, so it can never compete with the headline for the first paint.
 */
export function HeroOrnamentLazy() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const show = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(show, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(show, 1200);
    return () => clearTimeout(id);
  }, []);

  return ready ? <HeroOrnament /> : null;
}
