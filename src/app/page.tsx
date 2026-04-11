import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import ScrollFadeIn from '@/components/public/ScrollFadeIn';
import HeroContours from '@/components/public/HeroContours';
import HeroCaption from '@/components/public/HeroCaption';
import FadeImage from '@/components/public/FadeImage';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const [featuredProjects, recentNews, siteSettings] = await Promise.all([
    prisma.project.findMany({
      where: { published: true, featured: true },
      orderBy: { order: 'asc' },
      include: { images: { orderBy: { order: 'asc' } } },
      take: 9,
    }),
    prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      take: 2,
    }),
    prisma.siteSettings.findUnique({
      where: { id: 1 },
    }),
  ]);
  const heroImage = siteSettings?.heroImageUrl ?? null;
  const heroOpacity = siteSettings?.heroImageOpacity ?? 1.0;
  const bannerImageUrl = siteSettings?.bannerImageUrl ?? null;
  const bannerTagline = siteSettings?.bannerTagline ?? "Buildings for people.";
  const bannerCta = siteSettings?.bannerCta ?? "Get in touch";

  const heroProject = featuredProjects[0] ?? null;

  return (
    <main>
      <Nav transparent={true} darkBackground={!!heroImage} />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            width={1920}
            height={1080}
            priority
            className="absolute inset-0 h-full w-full object-cover no-fade"
            style={{ opacity: heroOpacity }}
          />
        ) : (
          <div className="absolute inset-0 bg-white" />
        )}
        {heroImage && <div className="absolute inset-0 bg-black/20" />}

        <HeroContours />

        <HeroCaption>
          <Image
            src="/images/logo-white.png"
            alt="Latitude Architects"
            width={300}
            height={84}
            className="no-fade"
            style={{ width: 300, height: 'auto', pointerEvents: 'auto' }}
            priority
          />
          <div style={{ height: 24 }} />
          {heroProject && (
            <Link href={`/projects/${heroProject.slug}`} className="text-center no-underline" style={{ pointerEvents: 'auto' }}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 300,
                  color: heroImage ? '#ffffff' : '#111111',
                  margin: 0,
                }}
              >
                {heroProject.title}
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 300,
                  color: heroImage ? 'rgba(255,255,255,0.7)' : '#999999',
                  margin: '4px 0 0',
                }}
              >
                {heroProject.sectors.split(',').join(' \u00b7 ')}
              </p>
            </Link>
          )}
          <div style={{ height: 32 }} />
          <p
            style={{
              fontSize: 10,
              fontWeight: 300,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: heroImage ? 'rgba(255,255,255,0.6)' : '#999999',
              margin: 0,
            }}
          >
            SCROLL
          </p>
          <div
            style={{
              width: 1,
              height: 24,
              backgroundColor: heroImage ? 'rgba(255,255,255,0.6)' : '#cccccc',
              marginTop: 8,
            }}
          />
        </HeroCaption>
      </section>

      {/* Projects Header */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '64px 40px 48px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#111111',
            margin: 0,
          }}
        >
          PROJECTS
        </p>
      </div>

      {/* Featured Projects Grid */}
      {featuredProjects.length > 0 && (
        <section
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 40px 80px',
          }}
        >
          <div
            className="featured-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '48px 32px',
            }}
          >
            {featuredProjects.map((project: typeof featuredProjects[number]) => {
              const img = project.images?.[0];
              return (
                <ScrollFadeIn key={project.id}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="block no-underline featured-link"
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
          </div>
        </section>
      )}

      {/* News Strip */}
      {recentNews.length > 0 && (
        <section
          style={{
            maxWidth: 640,
            margin: '0 auto',
            padding: '40px 40px 80px',
          }}
        >
          {recentNews.map((post: typeof recentNews[number], i: number) => (
            <div
              key={post.id}
              style={{
                borderTop: i === 0 ? '1px solid #e8e6e2' : 'none',
                borderBottom: '1px solid #e8e6e2',
                padding: '20px 0',
              }}
            >
              <Link
                href={`/journal/${post.slug}`}
                className="no-underline block"
                style={{ transition: 'opacity 0.25s ease' }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 300,
                    color: '#999999',
                    margin: 0,
                  }}
                >
                  {post.category} &mdash;{' '}
                  {post.date.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 300,
                    color: '#111111',
                    margin: '4px 0 0',
                  }}
                >
                  {post.title}
                </p>
              </Link>
            </div>
          ))}
        </section>
      )}

      {/* Banner */}
      <section
        style={{
          width: '100%',
          height: '33vh',
          backgroundImage: bannerImageUrl ? `url(${bannerImageUrl})` : 'none',
          backgroundColor: bannerImageUrl ? undefined : '#1a1a1a',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <p
          style={{
            fontSize: 32,
            fontWeight: 300,
            color: '#ffffff',
            letterSpacing: '0.02em',
            margin: 0,
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          {bannerTagline}
        </p>
        <Link
          href="/practice/contact"
          className="banner-cta"
          style={{
            fontSize: 13,
            fontWeight: 300,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textDecoration: 'none',
            paddingBottom: 2,
            borderBottom: '1px solid transparent',
            transition: 'border-bottom-color 0.25s ease',
          }}
        >
          {bannerCta}
        </Link>
      </section>

      <Footer />

      <style>{`
        .banner-cta:hover {
          border-bottom-color: #ffffff !important;
        }
        .featured-link {
          transition: opacity 0.25s ease;
        }
        .featured-link:hover {
          opacity: 0.75;
        }
        @media (max-width: 767px) {
          .featured-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </main>
  );
}
