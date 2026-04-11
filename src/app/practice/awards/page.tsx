import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import PracticeSubNav from '@/components/public/PracticeSubNav';

const awards = [
  {
    award: 'Facade Awards 2021',
    result: 'Winner',
    category: 'Best Curtain Walling System',
    project: "King\u2019s Cross Bridge",
  },
  {
    award: 'AJ Architecture Awards 2021',
    result: 'Shortlisted',
    category: 'Mixed-use',
    project: "King\u2019s Cross Bridge",
  },
  {
    award: 'NLA Conservation and Retrofit Award 2012',
    result: 'Shortlisted',
    category: null,
    project: '30 North Audley Street',
  },
];

export default function AwardsPage() {
  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <PracticeSubNav />

        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 40px 80px' }}>
          {awards.map((a, i) => (
            <div
              key={i}
              style={{
                borderBottom: '1px solid #e8e6e2',
                padding: '16px 0',
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 300,
                  color: '#111111',
                  lineHeight: 2,
                  margin: 0,
                }}
              >
                {a.award} &mdash; {a.result}
                {a.category ? `, ${a.category}` : ''} &mdash; {a.project}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
