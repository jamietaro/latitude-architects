import Link from 'next/link';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import ScrollFadeIn from '@/components/public/ScrollFadeIn';
import HeroSection, { type HeroSlideData } from '@/components/public/HeroSection';
import FadeImage from '@/components/public/FadeImage';
import { prisma } from '@/lib/prisma';
import { FEATURED_CATEGORY } from '@/lib/categories';

export default async function HomePage() {
  const [allFeatured, recentNews, siteSettings] = await Promise.all([
    prisma.project.findMany({
      where: { published: true, featured: true },
      include: {
        images: { orderBy: { order: 'asc' } },
        categoryOrders: true,
      },
    }),
    prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      take: 2,
    }),
    prisma.siteSettings.findUnique({
      where: { id: 1 },
      include: {
        heroSlides: {
          orderBy: { order: 'asc' },
          include: {
            project: {
              select: {
                id: true,
                title: true,
                slug: true,
                sectors: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // Sort featured projects by ProjectCategoryOrder (category='featured')
  const featuredProjects = [...allFeatured]
    .sort((a, b) => {
      const ao =
        a.categoryOrders.find((co) => co.category === FEATURED_CATEGORY)
          ?.order ?? Number.POSITIVE_INFINITY;
      const bo =
        b.categoryOrders.find((co) => co.category === FEATURED_CATEGORY)
          ?.order ?? Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      return a.id - b.id;
    })
    .slice(0, 9);

  const heroTagline =
    siteSettings?.heroTagline ??
    'Celebrating 25 years of crafting exceptional buildings across London and beyond.';
  const bannerImageUrl = siteSettings?.bannerImageUrl ?? null;
  const bannerTagline = siteSettings?.bannerTagline ?? 'Buildings for people.';
  const bannerCta = siteSettings?.bannerCta ?? 'Get in touch';

  const heroSlides: HeroSlideData[] = (siteSettings?.heroSlides ?? []).map(
    (s) => ({
      id: s.id,
      imageUrl: s.imageUrl,
      opacity: s.opacity,
      project: s.project
        ? {
            title: s.project.title,
            slug: s.project.slug,
            sectors: s.project.sectors,
          }
        : null,
    })
  );

  return (
    <main>
      <Nav transparent={true} darkBackground={heroSlides.length > 0} />

      <HeroSection slides={heroSlides} />

      {/* Hero Tagline */}
      <p
        style={{
          fontSize: 22,
          fontWeight: 300,
          color: '#111111',
          textAlign: 'center',
          maxWidth: 680,
          margin: '0 auto',
          padding: '48px 40px 32px',
        }}
      >
        {heroTagline}
      </p>

      {/* Projects Header */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 40px 48px',
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
          FEATURED PROJECTS
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
            {featuredProjects.map((project) => {
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
          {recentNews.map((post, i) => (
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
