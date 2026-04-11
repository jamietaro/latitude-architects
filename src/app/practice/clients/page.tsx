import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import PracticeSubNav from '@/components/public/PracticeSubNav';

const clients = [
  'Aberdeen Asset Management Ltd',
  'Ambassador Theatre Group',
  'Cannon Capital Developments',
  'Capital and City plc',
  'Charles Church (SE) Ltd',
  'Como Holdings Ltd',
  'Create Reit Ltd',
  'Derby Hotels Collection',
  'Earthquake (UK) Ltd',
  'Euro Properties Intl Ltd',
  'GE Real Estate',
  'Gracemark Investments Ltd',
  'Grosvenor',
  'Hermes Investment Management',
  'Ipsus',
  'M&M Asset Management Ltd',
  'Maybrook Properties Ltd',
  'National Trust',
  'Oppenheim Immobilien',
  'Persimmon Homes (SE) Ltd',
  'PMB Holdings Ltd',
  'REIT Asset Management',
  'Soho Estates Ltd',
  'Sydney and London Properties Ltd',
  'Thames River Capital',
  'The Portman Estate',
  'Threadneedle Estates Ltd',
  'UK Real Estate',
  'United World Colleges',
  'Walton Wagner Ltd',
];

export default function ClientsPage() {
  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <PracticeSubNav />

        <div
          className="clients-grid"
          style={{
            maxWidth: 680,
            margin: '0 auto',
            padding: '0 40px 80px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0 32px',
          }}
        >
          {clients.map((client) => (
            <p
              key={client}
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: '#111111',
                lineHeight: 2,
                margin: 0,
              }}
            >
              {client}
            </p>
          ))}
        </div>

        <style>{`
          @media (max-width: 639px) {
            .clients-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
      <Footer />
    </main>
  );
}
