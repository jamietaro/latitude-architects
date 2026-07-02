"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Scroll-linked "darken into focus" reveal. As the element rises through the
// viewport its opacity ramps from 0.15 to 1; on the white background this reads
// as light-grey text / washed images darkening into focus. Monotonic (latches
// once revealed, so it never re-fades when scrolling back). Native scroll.
export default function ScrollReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0.15);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let maxP = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const rect = el.getBoundingClientRect();
      // Begin revealing when the element top reaches 90% down the viewport,
      // fully revealed by the time it reaches 45% down.
      const start = vh * 0.9;
      const end = vh * 0.45;
      let p = (start - rect.top) / (start - end);
      p = Math.max(0, Math.min(1, p));
      if (p > maxP) {
        maxP = p;
        setOpacity(0.15 + maxP * 0.85);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Defer the initial measurement into a frame so we never setState
    // synchronously inside the effect body.
    raf = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity, transition: "opacity 0.5s ease-out" }}
    >
      {children}
    </div>
  );
}
