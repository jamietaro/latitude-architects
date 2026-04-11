import FadeImage from '@/components/public/FadeImage';
import { notFound } from 'next/navigation';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import { prisma } from '@/lib/prisma';

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const member = await prisma.teamMember.findUnique({
    where: { slug, published: true },
  });

  if (!member) notFound();

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', marginTop: 80, padding: '0 40px 80px' }}>
          {member.photo ? (
            <FadeImage
              src={member.photo}
              alt={member.name}
              width={640}
              height={800}
              loading="lazy"
              style={{
                maxWidth: 320,
                width: '100%',
                height: 'auto',
                marginBottom: 32,
              }}
            />
          ) : (
            <div
              style={{
                maxWidth: 320,
                width: '100%',
                aspectRatio: '4/5',
                backgroundColor: '#f3f3f3',
                marginBottom: 32,
              }}
            />
          )}

          <h1
            style={{
              fontSize: 22,
              fontWeight: 300,
              color: '#111111',
              margin: 0,
            }}
          >
            {member.name}
          </h1>
          <p
            style={{
              fontSize: 13,
              fontWeight: 300,
              color: '#999999',
              margin: '6px 0 0',
              marginBottom: 36,
            }}
          >
            {member.title}
          </p>

          {member.bio && (
            <div
              style={{
                fontSize: 15,
                fontWeight: 300,
                lineHeight: 1.75,
                color: '#333333',
              }}
              dangerouslySetInnerHTML={{ __html: member.bio }}
            />
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
