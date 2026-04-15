import type { Metadata } from 'next';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import PracticeSubNav from '@/components/public/PracticeSubNav';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Clients',
  description:
    'Latitude Architects works with leading institutional and private clients including Grosvenor, The Portman Estate, Hermes Investment Management, and the National Trust.',
  alternates: { canonical: '/practice/clients' },
};

export default async function ClientsPage() {
  const content = await prisma.clientsPageContent.findUnique({ where: { id: 1 } });

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <PracticeSubNav />

        <div
          style={{
            maxWidth: 680,
            margin: '0 auto',
            padding: '0 40px 80px',
          }}
        >
          {content?.heading && (
            <h1
              style={{
                fontSize: 22,
                fontWeight: 300,
                color: '#111111',
                margin: '0 0 24px',
              }}
            >
              {content.heading}
            </h1>
          )}

          {content?.intro && (
            <div
              className="clients-intro"
              style={{
                fontSize: 22,
                fontWeight: 300,
                color: '#111111',
                marginBottom: 40,
              }}
              dangerouslySetInnerHTML={{ __html: content.intro }}
            />
          )}

          {content?.body && (
            <div
              className="clients-body"
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: '#111111',
                lineHeight: 2,
              }}
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          )}
        </div>

        <style>{`
          .clients-intro > p {
            margin: 0 0 16px;
          }
          .clients-intro > p:last-child {
            margin-bottom: 0;
          }
          .clients-body ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0 32px;
          }
          .clients-body li {
            margin: 0;
          }
          @media (max-width: 639px) {
            .clients-body ul {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
      <Footer />
    </main>
  );
}
