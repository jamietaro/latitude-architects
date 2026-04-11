"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function HeroCaption({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onScroll() {
      requestAnimationFrame(() => {
        if (!el) return;
        const y = window.scrollY;
        el.style.transform = `translate(-50%, calc(-50% - ${y * 0.3}px))`;
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}
