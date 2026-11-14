"use client";

import { useEffect, useRef } from "react";

/**
 * Decorative only. Three nested eight-point stars turning slowly on a tilted
 * plane, which reads as depth without any 3D library — it is one inline SVG
 * and a few CSS transforms. The plane leans a few degrees toward the pointer.
 *
 * Loaded lazily after the page has rendered (see hero-ornament-lazy.tsx), is
 * absolutely positioned so it cannot shift layout, is hidden from assistive
 * technology, and is still (no rotation, no tilt) under prefers-reduced-motion.
 */
function star(radius: number, inner: number): string {
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? radius : inner;
    const angle = (Math.PI / 8) * i - Math.PI / 2;
    points.push(`${(200 + r * Math.cos(angle)).toFixed(1)},${(200 + r * Math.sin(angle)).toFixed(1)}`);
  }
  return points.join(" ");
}

export default function HeroOrnament() {
  const plane = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        if (plane.current) {
          plane.current.style.transform = `rotateX(${52 - y * 10}deg) rotateZ(${x * 8}deg)`;
        }
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="hero-ornament pointer-events-none absolute inset-0" aria-hidden>
      <div ref={plane} className="hero-ornament-plane absolute inset-0">
        <svg viewBox="0 0 400 400" className="h-full w-full" fill="none">
          <g className="hero-ornament-ring" stroke="#C9A84C" strokeOpacity="0.5" strokeWidth="1">
            <polygon points={star(190, 150)} />
            <circle cx="200" cy="200" r="190" strokeDasharray="2 10" />
          </g>
          <g className="hero-ornament-ring reverse" stroke="#D4BD6E" strokeOpacity="0.65" strokeWidth="1.2">
            <polygon points={star(140, 104)} />
            <polygon points={star(140, 104)} transform="rotate(22.5 200 200)" />
          </g>
          <g className="hero-ornament-ring" stroke="#C9A84C" strokeOpacity="0.9" strokeWidth="1.4">
            <polygon points={star(84, 58)} fill="#C9A84C" fillOpacity="0.06" />
            <circle cx="200" cy="200" r="34" />
          </g>
        </svg>
      </div>
    </div>
  );
}
