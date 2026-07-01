"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const TYPE_MS = 90;
const DELETE_MS = 55;
const HOLD_MS = 4000;

// Secondary "hero" at the foot of the homepage: a full-width video (or grey
// placeholder until one is uploaded), with a parallaxed typewriter CTA that
// cycles the CMS word list and links to /practice. The word sits in a
// fixed-width slot (sized to the longest word) so the prefix never shifts and
// the whole line stays centred.
export default function LearnMoreSection({
  words,
  videoUrl,
}: {
  words: string[];
  videoUrl: string | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Typewriter ---
  const [display, setDisplay] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Reserve the width of the longest word so the line doesn't reflow as it types.
  const longestWord = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  useEffect(() => {
    if (words.length === 0) return;
    const word = words[wordIndex % words.length];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting) {
      if (display.length < word.length) {
        timer = setTimeout(
          () => setDisplay(word.slice(0, display.length + 1)),
          TYPE_MS
        );
      } else {
        timer = setTimeout(() => setDeleting(true), HOLD_MS);
      }
    } else {
      if (display.length > 0) {
        timer = setTimeout(
          () => setDisplay(word.slice(0, display.length - 1)),
          DELETE_MS
        );
      } else {
        // Fully deleted — advance to the next word on the next tick.
        timer = setTimeout(() => {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % words.length);
        }, TYPE_MS);
      }
    }
    return () => clearTimeout(timer);
  }, [display, deleting, wordIndex, words]);

  // --- Parallax (inverted vs. the hero: text drifts DOWN as you scroll down) ---
  useEffect(() => {
    const sec = sectionRef.current;
    const el = textRef.current;
    if (!sec || !el) return;

    function onScroll() {
      requestAnimationFrame(() => {
        if (!sec || !el) return;
        const rect = sec.getBoundingClientRect();
        const vh = window.innerHeight;
        const secCenter = rect.top + rect.height / 2;
        let offset = (vh / 2 - secCenter) * 0.15;
        offset = Math.max(-120, Math.min(120, offset));
        el.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Autoplay video only while in view (loads on mount via preload) ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [videoUrl]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#d9d9d9",
      }}
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="auto"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      ) : (
        // Placeholder until a video is uploaded — the real video's own
        // dimensions drive the section height once present.
        <div style={{ width: "100%", aspectRatio: "16 / 9" }} />
      )}

      {/* Legibility overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "rgba(0,0,0,0.28)",
        }}
      />

      {/* Parallax text / CTA */}
      <div
        ref={textRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 5,
          width: "100%",
          padding: "0 40px",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <Link
          href="/practice"
          className="learn-more-cta"
          style={{
            pointerEvents: "auto",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          <span
            className="learn-more-text"
            style={{
              display: "block",
              fontWeight: 400,
              fontSize: "clamp(22px, 4vw, 42px)",
              lineHeight: 1.2,
              color: "#ffffff",
              letterSpacing: "0.01em",
              textShadow: "0 1px 12px rgba(0,0,0,0.35)",
            }}
          >
            Learn more about our{" "}
            <span className="learn-more-slot">
              <span className="learn-more-sizer" aria-hidden="true">
                {longestWord}.
              </span>
              <span className="learn-more-typed">
                {display}
                <span className="learn-more-dot">.</span>
              </span>
            </span>
          </span>
          <span
            className="learn-more-click"
            style={{
              display: "block",
              marginTop: 16,
              fontSize: 15,
              fontWeight: 300,
              color: "#ffffff",
              textShadow: "0 1px 12px rgba(0,0,0,0.35)",
            }}
          >
            Click here
          </span>
        </Link>
      </div>

      <style>{`
        .learn-more-cta { transition: opacity 0.25s ease; }
        .learn-more-cta:hover { opacity: 0.85; }
        .learn-more-slot {
          position: relative;
          display: inline-block;
          text-align: left;
          white-space: nowrap;
        }
        .learn-more-sizer { visibility: hidden; }
        .learn-more-typed { position: absolute; left: 0; top: 0; }
        .learn-more-dot {
          animation: learn-more-blink 1s step-end infinite;
        }
        @keyframes learn-more-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
