import type { Metadata } from 'next';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import PracticeSubNav from '@/components/public/PracticeSubNav';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Join Latitude Architects. We are committed to an inclusive approach to recruitment. Current vacancies include Architect and Part II Architectural Assistant.',
  alternates: { canonical: '/practice/careers' },
};

export default async function CareersPage() {
  const content = await prisma.careersPageContent.findUnique({ where: { id: 1 } });

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
          {content?.heading && (
            <h1
              style={{
                fontSize: 22,
                fontWeight: 300,
                color: '#111111',
                margin: '0 0 40px',
              }}
            >
              {content.heading}
            </h1>
          )}

          {content?.intro && (
            <div
              className="careers-intro"
              style={{
                fontSize: 15,
                fontWeight: 300,
                color: '#999999',
                lineHeight: 1.75,
                marginBottom: 64,
              }}
              dangerouslySetInnerHTML={{ __html: content.intro }}
            />
          )}

          {content?.vacancies && (
            <>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#111111',
                  margin: '0 0 24px',
                }}
              >
                Current vacancies
              </p>
              <div
                className="careers-vacancies"
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: '#111111',
                  lineHeight: 2,
                }}
                dangerouslySetInnerHTML={{ __html: content.vacancies }}
              />
            </>
          )}
        </div>
      </div>
      <Footer />

      <style>{`
        .careers-intro > p {
          margin: 0 0 24px;
        }
        .careers-intro > p:last-child {
          margin-bottom: 0;
        }
        .careers-intro a {
          color: inherit;
          text-decoration: none;
          transition: text-decoration 0.15s ease;
        }
        .careers-intro a:hover {
          text-decoration: underline;
        }
        .careers-vacancies > p {
          margin: 0;
        }
      `}</style>
    </main>
  );
}
