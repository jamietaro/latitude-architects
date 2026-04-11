'use client';

import { useState } from 'react';
import Link from 'next/link';
import FadeImage from '@/components/public/FadeImage';
import ScrollFadeIn from '@/components/public/ScrollFadeIn';

const SECTORS = [
  'ALL',
  'RESIDENTIAL',
  'OFFICES',
  'MIXED USE',
  'CULTURE AND EDUCATION',
  'INTERIORS',
  'HISTORIC BUILDINGS',
  'COMPETITIONS',
];

interface ProjectWithImages {
  id: number;
  title: string;
  slug: string;
  sectors: string;
  images: { id: number; url: string; alt: string | null; order: number }[];
}

export default function ProjectsGrid({
  projects,
}: {
  projects: ProjectWithImages[];
}) {
  const [activeSector, setActiveSector] = useState('ALL');

  const filtered =
    activeSector === 'ALL'
      ? projects
      : projects.filter((p) =>
          p.sectors.toUpperCase().includes(activeSector)
        );

  return (
    <>
      {/* Sub-nav */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
          paddingTop: 48,
          marginBottom: 48,
        }}
      >
        {SECTORS.map((sector) => (
          <button
            key={sector}
            onClick={() => setActiveSector(sector)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 300,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: activeSector === sector ? '#111111' : '#aaaaaa',
              padding: 0,
              transition: 'opacity 0.25s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {sector}
          </button>
        ))}
      </nav>

      {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '48px 32px',
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 40px 80px',
          }}
          className="projects-grid"
        >
          {filtered.map((project) => {
            const img = project.images?.[0];
            return (
              <ScrollFadeIn key={project.id}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="no-underline block"
                  style={{ transition: 'opacity 0.25s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {img ? (
                    <FadeImage
                      src={img.url}
                      alt={img.alt ?? project.title}
                      width={1200}
                      height={800}
                      loading="lazy"
                      style={{ width: '100%', height: 'auto' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '3/2',
                        backgroundColor: '#f3f3f3',
                      }}
                    />
                  )}
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 300,
                      color: '#111111',
                      margin: '12px 0 0',
                    }}
                  >
                    {project.title}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 300,
                      color: '#999999',
                      margin: '2px 0 0',
                    }}
                  >
                    {project.sectors.split(',').join(' \u00b7 ')}
                  </p>
                </Link>
              </ScrollFadeIn>
            );
          })}

          {filtered.length === 0 && (
            <p
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: '#999999',
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px 0',
              }}
            >
              No projects found.
            </p>
          )}
        </div>

      <style>{`
        @media (max-width: 767px) {
          .projects-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .projects-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}
