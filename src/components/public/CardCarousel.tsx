'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import FadeImage from '@/components/public/FadeImage';
import ScrollFadeIn from '@/components/public/ScrollFadeIn';

export interface CarouselEntry {
  id: number;
  slug: string;
  title: string;
  category: string;
  date: string; // ISO string
  image: string | null;
}

const GAP = 32; // matches the Featured Projects / Projects grid column gap

function columnsForWidth(): number {
  if (typeof window === 'undefined') return 3;
  if (window.matchMedia('(max-width: 767px)').matches) return 1;
  if (window.matchMedia('(max-width: 1023px)').matches) return 2;
  return 3;
}

export default function CardCarousel({
  entries,
  basePath,
  imageObjectPosition = 'center',
}: {
  entries: CarouselEntry[];
  basePath: string;
  imageObjectPosition?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(3);
  const [width, setWidth] = useState(0);
  const [start, setStart] = useState(0);

  // Track the container width (ResizeObserver) and the visible column count
  // (matchMedia, at the site's existing breakpoints). All state updates happen
  // inside the observer/listener callbacks, which also fire once on setup.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => {
      setCols(columnsForWidth());
      setWidth(el.clientWidth);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const queries = [
      window.matchMedia('(max-width: 767px)'),
      window.matchMedia('(max-width: 1023px)'),
    ];
    queries.forEach((q) => q.addEventListener('change', measure));

    return () => {
      ro.disconnect();
      queries.forEach((q) => q.removeEventListener('change', measure));
    };
  }, []);

  if (entries.length === 0) return null;

  // Derived from measured width/cols — no extra state needed. Clamp the window
  // start in render so it stays valid when the column count changes.
  const cardWidth = width > 0 ? (width - GAP * (cols - 1)) / cols : 0;
  const imageHeight = (cardWidth * 3) / 4;
  const maxStart = Math.max(0, entries.length - cols);
  const safeStart = Math.min(start, maxStart);

  const showArrows = entries.length > cols;
  const atStart = safeStart <= 0;
  const atEnd = safeStart >= maxStart;
  const visible = entries.slice(safeStart, safeStart + cols);

  return (
    <div ref={trackRef} style={{ position: 'relative' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: `0 ${GAP}px`,
        }}
      >
        {visible.map((entry) => {
          const date = new Date(entry.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          return (
            <ScrollFadeIn key={entry.id}>
              <Link
                href={`${basePath}/${entry.slug}`}
                className="no-underline block carousel-card"
                style={{ transition: 'opacity 0.25s ease' }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    overflow: 'hidden',
                    backgroundColor: '#f3f3f3',
                  }}
                >
                  {entry.image && (
                    <FadeImage
                      src={entry.image}
                      alt={entry.title}
                      width={1200}
                      height={800}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: imageObjectPosition,
                      }}
                    />
                  )}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 300,
                    color: '#111111',
                    margin: '12px 0 0',
                  }}
                >
                  {entry.title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 300,
                    color: '#999999',
                    margin: '2px 0 0',
                  }}
                >
                  {entry.category} &mdash; {date}
                </p>
              </Link>
            </ScrollFadeIn>
          );
        })}
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            onClick={() => setStart(Math.max(0, safeStart - 1))}
            disabled={atStart}
            aria-label="Previous"
            className="carousel-arrow"
            style={{
              position: 'absolute',
              left: 4,
              top: imageHeight ? imageHeight / 2 : '40%',
              transform: 'translateY(-50%)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#555"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setStart(Math.min(maxStart, safeStart + 1))}
            disabled={atEnd}
            aria-label="Next"
            className="carousel-arrow"
            style={{
              position: 'absolute',
              right: 4,
              top: imageHeight ? imageHeight / 2 : '40%',
              transform: 'translateY(-50%)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#555"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </>
      )}

      <style>{`
        .carousel-card:hover { opacity: 0.75; }
        .carousel-arrow {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: 0;
          padding: 0;
          cursor: pointer;
          transition: opacity 0.25s ease;
        }
        .carousel-arrow:hover { opacity: 0.6; }
        .carousel-arrow:disabled {
          opacity: 0.2;
          cursor: default;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
