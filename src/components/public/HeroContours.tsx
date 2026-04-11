"use client";

import { useEffect, useRef } from "react";

const LUT_SIZE = 1000;

interface PathData {
  d: string;
  el: SVGPathElement | null;
  totalLength: number;
  lut: Float32Array; // x,y pairs: lut[i*2]=x, lut[i*2+1]=y
  dots: { baseOffset: number; circleEl: SVGCircleElement | null }[];
}

export default function HeroContours() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathsRef = useRef<PathData[]>([]);
  const targetPhaseRef = useRef(0);
  const currentPhaseRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const rafPendingRef = useRef(false);
  const unmountedRef = useRef(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    unmountedRef.current = false;
    let initialised = false;
    let scrollCleanup: (() => void) | null = null;

    function init(svgContent: string) {
      if (initialised || !svg) return;
      if (svg.clientWidth === 0) return; // Not laid out yet
      initialised = true;
      const svgEl = svg; // non-null alias for closures

      // 1. Parse the SVG string to extract paths and dots
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");

      const contourEls = doc.querySelectorAll<SVGPathElement>(
        "path.st0, path.st1"
      );
      const dotEls = doc.querySelectorAll<SVGElement>(".st2");

      // Extract dot positions
      const dotPositions: { cx: number; cy: number }[] = [];
      dotEls.forEach((dot) => {
        let cx: number, cy: number;
        if (dot.tagName === "circle") {
          cx = parseFloat(dot.getAttribute("cx") || "0");
          cy = parseFloat(dot.getAttribute("cy") || "0");
        } else {
          const d = dot.getAttribute("d") || "";
          const match = d.match(/[Mm]([^,]+),([0-9.]+)/);
          cx = match ? parseFloat(match[1]) : 0;
          cy = match ? parseFloat(match[2]) : 0;
        }
        dotPositions.push({ cx, cy });
      });

      // 2. Create invisible measurement paths in our SVG
      const ns = "http://www.w3.org/2000/svg";
      const pathDataArr: PathData[] = [];

      contourEls.forEach((srcPath, i) => {
        const d = srcPath.getAttribute("d") || "";
        const measPath = document.createElementNS(ns, "path");
        measPath.setAttribute("d", d);
        measPath.setAttribute("fill", "none");
        measPath.setAttribute("stroke", "none");
        svgEl.appendChild(measPath);

        const totalLength = measPath.getTotalLength();
        console.log(`HeroContours path ${i}: totalLength = ${totalLength.toFixed(1)}`);

        // Pre-compute lookup table for this path
        const lut = new Float32Array(LUT_SIZE * 2);
        for (let j = 0; j < LUT_SIZE; j++) {
          const pt = measPath.getPointAtLength((j / LUT_SIZE) * totalLength);
          lut[j * 2] = pt.x;
          lut[j * 2 + 1] = pt.y;
        }

        pathDataArr.push({
          d,
          el: measPath,
          totalLength,
          lut,
          dots: [],
        });
      });

      // 3. Sample each path and assign dots to nearest path
      const SAMPLES = 200;
      const pathSamples: { x: number; y: number }[][] = pathDataArr.map((pd) => {
        const samples: { x: number; y: number }[] = [];
        for (let i = 0; i <= SAMPLES; i++) {
          const pt = pd.el!.getPointAtLength((i / SAMPLES) * pd.totalLength);
          samples.push({ x: pt.x, y: pt.y });
        }
        return samples;
      });

      const dotAssignments: number[] = new Array(dotPositions.length).fill(0);
      dotPositions.forEach((dot, di) => {
        let bestPath = 0;
        let bestDist = Infinity;
        pathSamples.forEach((samples, pi) => {
          for (const s of samples) {
            const dist = (dot.cx - s.x) ** 2 + (dot.cy - s.y) ** 2;
            if (dist < bestDist) {
              bestDist = dist;
              bestPath = pi;
            }
          }
        });
        dotAssignments[di] = bestPath;
      });

      // 4. Compute each dot's baseOffset on its assigned path (ternary search)
      dotPositions.forEach((dot, di) => {
        const pi = dotAssignments[di];
        const pd = pathDataArr[pi];
        const len = pd.totalLength;

        // Coarse search
        let bestT = 0;
        let bestDist = Infinity;
        const COARSE = 100;
        for (let i = 0; i <= COARSE; i++) {
          const t = i / COARSE;
          const pt = pd.el!.getPointAtLength(t * len);
          const dist = (dot.cx - pt.x) ** 2 + (dot.cy - pt.y) ** 2;
          if (dist < bestDist) {
            bestDist = dist;
            bestT = t;
          }
        }

        // Fine ternary search
        let lo = Math.max(0, bestT - 1 / COARSE);
        let hi = Math.min(1, bestT + 1 / COARSE);
        for (let iter = 0; iter < 10; iter++) {
          const mid1 = lo + (hi - lo) / 3;
          const mid2 = hi - (hi - lo) / 3;
          const pt1 = pd.el!.getPointAtLength(mid1 * len);
          const pt2 = pd.el!.getPointAtLength(mid2 * len);
          const d1 = (dot.cx - pt1.x) ** 2 + (dot.cy - pt1.y) ** 2;
          const d2 = (dot.cx - pt2.x) ** 2 + (dot.cy - pt2.y) ** 2;
          if (d1 < d2) hi = mid2;
          else lo = mid1;
        }
        const baseOffset = (lo + hi) / 2;

        pd.dots.push({ baseOffset, circleEl: null });
      });

      // 5. Create circle elements for each dot
      pathDataArr.forEach((pd) => {
        pd.dots.forEach((dot) => {
          const circle = document.createElementNS(ns, "circle");
          circle.setAttribute("r", "0.7");
          circle.setAttribute("fill", "white");
          svgEl.appendChild(circle);
          dot.circleEl = circle;
        });
      });

      pathsRef.current = pathDataArr;

      // 6. Position dots using pre-computed LUT with linear interpolation
      function updateDots(phase: number) {
        for (const pd of pathsRef.current) {
          if (!pd.totalLength) continue;
          const lut = pd.lut;
          for (const dot of pd.dots) {
            let t = (dot.baseOffset + phase * 0.25) % 1;
            if (t < 0) t += 1;
            const rawIdx = t * LUT_SIZE;
            const i0 = Math.floor(rawIdx);
            const i1 = Math.min(i0 + 1, LUT_SIZE - 1);
            const frac = rawIdx - i0;
            const x = lut[i0 * 2] * (1 - frac) + lut[i1 * 2] * frac;
            const y = lut[i0 * 2 + 1] * (1 - frac) + lut[i1 * 2 + 1] * frac;
            dot.circleEl!.setAttribute("cx", String(x));
            dot.circleEl!.setAttribute("cy", String(y));
          }
        }
      }

      updateDots(0);

      // 7. Apply CSS scale transform
      svgEl.style.transform = "scale(1.1)";
      svgEl.style.transformOrigin = "center center";

      // 8. Lerp frame — only runs when scheduled, stops when settled
      function tick() {
        if (unmountedRef.current) return;
        currentPhaseRef.current +=
          (targetPhaseRef.current - currentPhaseRef.current) * 0.04;

        if (Math.abs(currentPhaseRef.current - targetPhaseRef.current) < 0.001) {
          currentPhaseRef.current = targetPhaseRef.current;
          updateDots(currentPhaseRef.current);
          rafPendingRef.current = false;
          return; // Stop — no more frames until next scroll
        }

        updateDots(currentPhaseRef.current);
        requestAnimationFrame(tick);
      }

      // 9. Scroll handler — delta-based, target only moves when user scrolls
      function onScroll() {
        const scrollY = window.scrollY;
        if (scrollY === lastScrollYRef.current) return;
        const delta = scrollY - lastScrollYRef.current;
        lastScrollYRef.current = scrollY;

        const hero = svgEl.parentElement;
        if (!hero) return;
        const heroH = hero.offsetHeight || window.innerHeight;
        targetPhaseRef.current += (delta / heroH) * 0.25;

        if (!rafPendingRef.current) {
          rafPendingRef.current = true;
          requestAnimationFrame(tick);
        }
      }

      window.addEventListener("scroll", onScroll, { passive: true });

      scrollCleanup = () => {
        window.removeEventListener("scroll", onScroll);
      };
    }

    // Fetch SVG then initialise once the element has non-zero dimensions
    let svgText = "";

    fetch("/images/contours-dark.svg")
      .then((res) => res.text())
      .then((text) => {
        if (unmountedRef.current) return;
        svgText = text;
        // Try immediately if already laid out
        if (svg.clientWidth > 0) init(svgText);
      });

    const observer = new ResizeObserver(() => {
      if (!initialised && svgText && svg.clientWidth > 0) {
        init(svgText);
      }
    });
    observer.observe(svg);

    return () => {
      unmountedRef.current = true;
      observer.disconnect();
      scrollCleanup?.();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1200 849"
      preserveAspectRatio="xMidYMax slice"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
        opacity: 0.8,
      }}
    />
  );
}
