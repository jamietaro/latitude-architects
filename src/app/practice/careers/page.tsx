import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import PracticeSubNav from '@/components/public/PracticeSubNav';

const vacancies = ['Architect', 'Part II Architectural Assistant'];

export default function CareersPage() {
  const secondaryText: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 300,
    color: '#999999',
    lineHeight: 1.75,
    margin: 0,
  };

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
          <h1
            style={{
              fontSize: 22,
              fontWeight: 300,
              color: '#111111',
              margin: '0 0 40px',
            }}
          >
            Careers
          </h1>

          <p style={secondaryText}>
            Collaboration is at the heart of what we do. At Latitude we are
            committed to an inclusive and holistic approach to recruitment,
            welcoming people from all backgrounds to join our team.
          </p>

          <div style={{ height: 24 }} />

          <p style={secondaryText}>
            If you are interested in working with us please send a CV, cover
            letter, and 10-page portfolio to{' '}
            <a href="mailto:design@latitudearchitects.com" className="careers-email">
              design@latitudearchitects.com
            </a>
            .
          </p>

          <div style={{ height: 64 }} />

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

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {vacancies.map((v) => (
              <li
                key={v}
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: '#111111',
                  lineHeight: 2,
                }}
              >
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />

      <style>{`
        .careers-email {
          color: inherit;
          text-decoration: none;
          transition: text-decoration 0.15s ease;
        }
        .careers-email:hover {
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}
