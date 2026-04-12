"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HeroContours from "@/components/public/HeroContours";

export interface HeroSlideData {
  id: number;
  imageUrl: string;
  opacity: number;
  project: {
    title: string;
    slug: string;
    sectors: string;
  } | null;
}

const CYCLE_MS = 7000;

export default function HeroSection({ slides }: { slides: HeroSlideData[] }) {
  const [index, setIndex] = useState(0);
  const captionRef = useRef<HTMLDivElement>(null);

  // Preload all slide images on mount + debug log
  useEffect(() => {
    console.log("[HeroSection] mounted with", slides.length, "slides");
    slides.forEach((s, i) => {
      console.log(
        `  slide ${i}: id=${s.id} opacity=${s.opacity} url=${s.imageUrl}`
      );
    });
    if (slides.length === 0) return;
    slides.forEach((s) => {
      const img = new window.Image();
      img.src = s.imageUrl;
    });
  }, [slides]);

  // Cycle through slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Parallax: drift caption upward on scroll
  useEffect(() => {
    const el = captionRef.current;
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

  const currentProject =
    slides.length > 0 ? slides[index]?.project ?? null : null;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {slides.length === 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#1a1a1a",
            zIndex: 1,
          }}
        />
      ) : (
        <>
          {/* Slide images — current at opacity 1, others at 0 for crossfade */}
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              style={{
                position: "absolute",
                inset: 0,
                opacity: i === index ? 1 : 0,
                transition: "opacity 1s ease",
                backgroundImage: `url(${slide.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                willChange: "opacity",
                zIndex: 1,
              }}
              aria-hidden={i !== index}
            />
          ))}
          {/* Dark overlay for text legibility — per-slide opacity */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#000000",
              opacity: slides[index]?.opacity ?? 0.2,
              transition: "opacity 1s ease",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        </>
      )}

      <HeroContours />

      <div
        ref={captionRef}
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
        <img
          src="/images/logo-white.png"
          alt="Latitude Architects"
          width={300}
          height={84}
          className="no-fade"
          style={{
            width: 300,
            height: "auto",
            pointerEvents: "auto",
          }}
        />
        <div style={{ height: 24 }} />
        {currentProject && (
          <Link
            href={`/projects/${currentProject.slug}`}
            className="text-center no-underline"
            style={{ pointerEvents: "auto" }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 300,
                color: "#ffffff",
                margin: 0,
                transition: "opacity 0.5s ease",
              }}
            >
              {currentProject.title}
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 300,
                color: "rgba(255,255,255,0.7)",
                margin: "4px 0 0",
                transition: "opacity 0.5s ease",
              }}
            >
              {currentProject.sectors.split(",").join(" \u00b7 ")}
            </p>
          </Link>
        )}
        <div style={{ height: 32 }} />
        <p
          style={{
            fontSize: 10,
            fontWeight: 300,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.6)",
            margin: 0,
          }}
        >
          SCROLL
        </p>
        <div
          style={{
            width: 1,
            height: 24,
            backgroundColor: "rgba(255,255,255,0.6)",
            marginTop: 8,
          }}
        />
      </div>
    </section>
  );
}
