import FadeImage from '@/components/public/FadeImage';
import Link from 'next/link';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import { prisma } from '@/lib/prisma';

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  });

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        {/* Sub-nav */}
        <nav
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 48,
            marginBottom: 48,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 300,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#111111',
            }}
          >
            TEAM
          </span>
        </nav>

        {/* Intro */}
        <div
          style={{
            maxWidth: 560,
            margin: '0 auto',
            padding: '0 40px',
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 300,
              lineHeight: 1.7,
              color: '#333333',
              margin: 0,
            }}
          >
            {/* TODO: Practice to supply team introduction text */}
            Our team brings together architects, designers and project managers with a
            shared commitment to design quality and careful, considered practice. Working
            collaboratively across all project stages, we bring rigour and creativity to
            every commission.
          </p>
        </div>

        {/* Grid */}
        <div
          className="team-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '40px 24px',
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 40px 80px',
          }}
        >
          {members.map((member: typeof members[number]) => (
            <Link
              key={member.id}
              href={`/people/team/${member.slug}`}
              className="no-underline block team-member-link"
            >
              {member.photo ? (
                <FadeImage
                  src={member.photo}
                  alt={member.name}
                  width={600}
                  height={600}
                  loading="lazy"
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    backgroundColor: '#f3f3f3',
                  }}
                />
              )}
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 300,
                  color: '#111111',
                  margin: '8px 0 0',
                }}
              >
                {member.name}
              </p>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 300,
                  color: '#999999',
                  margin: '2px 0 0',
                }}
              >
                {member.title}
              </p>
            </Link>
          ))}

          {members.length === 0 && (
            <p
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: '#999999',
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px 0',
              }}
            >
              Team members coming soon.
            </p>
          )}
        </div>

        <style>{`
          .team-member-link {
            transition: opacity 0.25s ease;
          }
          .team-member-link:hover {
            opacity: 0.8;
          }
          @media (max-width: 767px) {
            .team-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
        `}</style>
      </div>
      <Footer />
    </main>
  );
}
