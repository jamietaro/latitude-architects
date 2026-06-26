import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import ScrollFadeIn from '@/components/public/ScrollFadeIn';
import HeroSection, { type HeroSlideData } from '@/components/public/HeroSection';
import FadeImage from '@/components/public/FadeImage';
import SectionTitle from '@/components/public/SectionTitle';
import SectionCTA from '@/components/public/SectionCTA';
import CardCarousel, { type CarouselEntry } from '@/components/public/CardCarousel';
import StructuredData from '@/components/StructuredData';
import { prisma } from '@/lib/prisma';
import { FEATURED_CATEGORY } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    // absolute: bypass the "%s | Latitude Architects" template so the
    // homepage keeps its full branded title.
    absolute: 'Latitude Architects | Award-Winning London Architectural Practice',
  },
  description:
    'Latitude Architects is a RIBA Chartered practice founded in 2000, specialising in heritage buildings, high-end residential, and complex commercial projects across central London.',
  alternates: { canonical: '/' },
};

const homepageStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Latitude Architects',
  alternateName: 'Latitude Architects and Designers Ltd',
  url: 'https://latitudearchitects.com',
  logo: 'https://latitudearchitects.com/images/logo-dark.png',
  description:
    'RIBA Chartered architectural practice founded in 2000, specialising in heritage buildings, high-end residential, and complex commercial projects across central London.',
  foundingDate: '2000',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '15 Weller Street',
    addressLocality: 'London',
    postalCode: 'SE1 1QU',
    addressCountry: 'GB',
  },
  telephone: '+442072340235',
  email: 'design@latitudearchitects.com',
  areaServed: 'London',
  hasCredential: 'RIBA Chartered Practice',
};

export default async function HomePage() {
  // NOTE: NewsItem backs the "News" section; NewsPost backs the "Journal"
  // section (legacy model name). They are fully independent.
  const carouselSelect = {
    id: true,
    slug: true,
    title: true,
    category: true,
    date: true,
    image: true,
  } as const;

  const [allFeatured, newsEntries, journalEntries, siteSettings] =
    await Promise.all([
    prisma.project.findMany({
      where: { published: true, featured: true },
      include: {
        images: { orderBy: { order: 'asc' } },
        categoryOrders: true,
      },
    }),
    prisma.newsItem.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      take: 12,
      select: carouselSelect,
    }),
    prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      take: 12,
      select: carouselSelect,
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

  const toCarouselEntries = (
    rows: {
      id: number;
      slug: string;
      title: string;
      category: string;
      date: Date;
      image: string | null;
    }[]
  ): CarouselEntry[] =>
    rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category,
      date: r.date.toISOString(),
      image: r.image,
    }));

  const newsCarousel = toCarouselEntries(newsEntries);
  const journalCarousel = toCarouselEntries(journalEntries);

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
      <StructuredData data={homepageStructuredData} />
      <Nav transparent={true} />

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

      {/* Divider */}
      <div style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 40px' }}>
        <div style={{ borderTop: '1px solid #e8e6e2' }} />
      </div>

      {/* Projects Header */}
      <SectionTitle>FEATURED PROJECTS</SectionTitle>

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
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '4/3',
                        overflow: 'hidden',
                        backgroundColor: '#f3f3f3',
                      }}
                    >
                      {img && (
                        <FadeImage
                          src={img.url}
                          alt={img.alt ?? project.title}
                          width={1200}
                          height={800}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
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
          <SectionCTA href="/projects" label="More projects" />
        </section>
      )}

      {/*
        NEWS and JOURNAL carousel sections.
        To swap their order, move the entire {/* === JOURNAL === *​/} block
        above the {/* === NEWS === *​/} block (they are independent siblings).
      */}

      {/* === NEWS === */}
      {newsCarousel.length > 0 && (
        <>
          <SectionTitle>NEWS</SectionTitle>
          <section
            style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px 80px' }}
          >
            <CardCarousel entries={newsCarousel} basePath="/news" />
            <SectionCTA href="/news" label="More news" />
          </section>
        </>
      )}

      {/* === JOURNAL === */}
      {journalCarousel.length > 0 && (
        <>
          <SectionTitle>JOURNAL</SectionTitle>
          <section
            style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px 80px' }}
          >
            <CardCarousel
              entries={journalCarousel}
              basePath="/journal"
              imageObjectPosition="center 20%"
            />
            <SectionCTA href="/journal" label="More journal entries" />
          </section>
        </>
      )}

      {/* Banner */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
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
        {/* LEGIBILITY OVERLAY — bottom gradient
            To switch to radial vignette:
            background: radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 70%)
        */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)',
          }}
        />
        <p
          style={{
            position: 'relative',
            zIndex: 2,
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
          href="/contact"
          className="banner-cta"
          style={{
            position: 'relative',
            zIndex: 2,
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
