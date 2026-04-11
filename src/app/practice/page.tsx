import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import PracticeSubNav from '@/components/public/PracticeSubNav';

export default function PracticePage() {
  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <PracticeSubNav />

        {/* Hero image */}
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 40px' }}>
          {/* TODO: Add practice hero image */}
          <div
            style={{
              width: '100%',
              height: 400,
              backgroundColor: '#f3f3f3',
            }}
          />
        </div>

        {/* Text */}
        <div
          style={{
            maxWidth: 540,
            margin: '48px auto 0',
            padding: '0 40px 80px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 300,
              lineHeight: 1.75,
              color: '#333333',
              margin: 0,
            }}
          >
            Latitude Architects and Designers Ltd is a RIBA Chartered practice
            founded in 2000 by Andrew Gilbert and Michael Griffiths. Further
            content to be added.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
