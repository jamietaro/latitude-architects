import type { Metadata } from 'next';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import PracticeSubNav from '@/components/public/PracticeSubNav';
import ScrollReveal from '@/components/public/ScrollReveal';
import FadeImage from '@/components/public/FadeImage';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Practice',
  description:
    'Latitude Architects is an award-winning London practice creating considered, characterful buildings across heritage, residential, commercial and mixed-use.',
  alternates: { canonical: '/practice' },
};

const HERO_HEIGHT = '50vh';

export default async function PracticePage() {
  const [blocks, pageContent] = await Promise.all([
    prisma.aboutBlock.findMany({ orderBy: { id: 'asc' } }),
    prisma.aboutPageContent.findUnique({ where: { id: 1 } }),
  ]);

  const heroTop = pageContent?.heroImageTop ?? null;
  const heroBottom = pageContent?.heroImageBottom ?? null;

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        {/* Top hero with the practice sub-nav overlaid in white */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: HERO_HEIGHT,
            overflow: 'hidden',
            backgroundColor: '#d9d9d9',
          }}
        >
          {heroTop && (
            <FadeImage
              src={heroTop}
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          )}
          {/* Legibility gradient for the white sub-nav */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 45%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              paddingTop: 24,
              zIndex: 2,
            }}
          >
            <PracticeSubNav variant="light" />
          </div>
        </div>

        {/* Headline, lede, pull quote */}
        {(pageContent?.headline ||
          pageContent?.intro ||
          pageContent?.pullQuote) && (
          <div
            style={{
              maxWidth: 900,
              margin: '0 auto',
              padding: '96px 40px 0',
            }}
          >
            {pageContent?.headline && (
              <ScrollReveal>
                <h1
                  style={{
                    fontSize: 'clamp(28px, 4vw, 40px)',
                    fontWeight: 300,
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                    color: '#111111',
                    margin: 0,
                  }}
                >
                  {pageContent.headline}
                </h1>
              </ScrollReveal>
            )}

            {pageContent?.intro && (
              <ScrollReveal>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 300,
                    lineHeight: 1.6,
                    color: '#333333',
                    margin: '32px 0 0',
                  }}
                >
                  {pageContent.intro}
                </p>
              </ScrollReveal>
            )}

            {pageContent?.pullQuote && (
              <ScrollReveal>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 300,
                    color: '#111111',
                    margin: '48px 0 0',
                    paddingLeft: 20,
                    borderLeft: '2px solid #e8e6e2',
                  }}
                >
                  {pageContent.pullQuote}
                </p>
              </ScrollReveal>
            )}
          </div>
        )}

        {/* Body blocks */}
        <div
          style={{
            maxWidth: 680,
            margin: '0 auto',
            padding: '96px 40px 120px',
          }}
        >
          {blocks.map((block) => {
            const hasImage = !!block.imageUrl;
            const hasTagline = !!block.tagline;
            const hasBody = !!block.body;
            if (!hasImage && !hasTagline && !hasBody) return null;

            return (
              <section key={block.id} style={{ marginBottom: 96 }}>
                {hasImage && (
                  <ScrollReveal>
                    <FadeImage
                      src={block.imageUrl!}
                      alt={block.tagline ?? ''}
                      width={1600}
                      height={1000}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </ScrollReveal>
                )}

                {(hasTagline || hasBody) && (
                  <ScrollReveal>
                    <div style={{ marginTop: hasImage ? 32 : 0 }}>
                      {hasTagline && (
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
                          {block.tagline}
                        </p>
                      )}
                      {hasBody && (
                        <div
                          className="prose-content"
                          style={{
                            marginTop: hasTagline ? 16 : 0,
                            fontSize: 15,
                            fontWeight: 300,
                            lineHeight: 1.75,
                            color: '#111111',
                          }}
                          dangerouslySetInnerHTML={{ __html: block.body! }}
                        />
                      )}
                    </div>
                  </ScrollReveal>
                )}
              </section>
            );
          })}
        </div>

        {/* Bottom hero */}
        <ScrollReveal>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: HERO_HEIGHT,
              overflow: 'hidden',
              backgroundColor: '#d9d9d9',
            }}
          >
            {heroBottom && (
              <FadeImage
                src={heroBottom}
                alt=""
                fill
                sizes="100vw"
                style={{ objectFit: 'cover' }}
              />
            )}
          </div>
        </ScrollReveal>
      </div>
      <Footer />
    </main>
  );
}
