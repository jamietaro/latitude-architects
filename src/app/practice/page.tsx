import type { Metadata } from 'next';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import PracticeSubNav from '@/components/public/PracticeSubNav';
import FadeImage from '@/components/public/FadeImage';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Practice',
  description:
    "Latitude Architects is an independent London practice with 25 years of experience delivering exceptional buildings in the most constrained planning environments in the capital.",
  alternates: { canonical: '/practice' },
};

export default async function PracticePage() {
  const blocks = await prisma.aboutBlock.findMany({
    orderBy: { id: 'asc' },
  });

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <PracticeSubNav />

        <div
          style={{
            maxWidth: 680,
            margin: '0 auto',
            padding: '0 40px 120px',
          }}
        >
          {blocks.map((block) => {
            const hasImage = !!block.imageUrl;
            const hasTagline = !!block.tagline;
            const hasBody = !!block.body;
            if (!hasImage && !hasTagline && !hasBody) return null;

            return (
              <section
                key={block.id}
                style={{
                  marginBottom: 96,
                }}
              >
                {hasImage && (
                  <FadeImage
                    src={block.imageUrl!}
                    alt={block.tagline ?? ''}
                    width={1600}
                    height={1000}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                )}

                {(hasTagline || hasBody) && (
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
                          fontSize: 13,
                          fontWeight: 300,
                          lineHeight: 1.75,
                          color: '#999999',
                        }}
                        dangerouslySetInnerHTML={{ __html: block.body! }}
                      />
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}
