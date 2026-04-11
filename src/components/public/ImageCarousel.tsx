"use client";

import { useState } from "react";
import Image from "next/image";

interface CarouselImage {
  id?: number;
  url: string;
  alt: string | null;
}

export default function ImageCarousel({
  images,
  projectTitle,
}: {
  images: CarouselImage[];
  projectTitle: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const current = images[index];
  const showArrows = images.length > 1;

  return (
    <div className="relative">
      <Image
        src={current.url}
        alt={current.alt ?? projectTitle}
        width={1200}
        height={800}
        priority={index === 0}
        style={{ width: "100%", height: "auto", display: "block" }}
      />

      {showArrows && (
        <>
          <button
            onClick={() =>
              setIndex((i) => (i === 0 ? images.length - 1 : i - 1))
            }
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ background: "none", border: "none", padding: 8 }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() =>
              setIndex((i) => (i === images.length - 1 ? 0 : i + 1))
            }
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ background: "none", border: "none", padding: 8 }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
