import type { Metadata } from 'next';
import FadeImage from '@/components/public/FadeImage';
import Link from 'next/link';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import ScrollFadeIn from '@/components/public/ScrollFadeIn';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'News and updates from Latitude Architects.',
  alternates: { canonical: '/journal' },
};

export default async function JournalPage() {
  const posts = await prisma.newsPost.findMany({
    where: { published: true },
    orderBy: { date: 'desc' },
  });

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <div
          style={{
            maxWidth: 680,
            margin: '0 auto',
            padding: '48px 40px 80px',
          }}
        >
          {/* Section label */}
          <p
            style={{
              fontSize: 11,
              fontWeight: 300,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#aaaaaa',
              margin: '0 0 16px',
            }}
          >
            JOURNAL
          </p>

          {/* Filter links */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: '#111111',
                cursor: 'pointer',
              }}
            >
              All
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: '#999999',
              }}
            >
              News
            </span>
          </div>

          {/* Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {posts.map((post: typeof posts[number]) => (
              <ScrollFadeIn key={post.id}>
                <Link
                  href={`/journal/${post.slug}`}
                  className="no-underline block"
                  style={{ transition: 'opacity 0.25s ease' }}
                >
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '3/2',
                      overflow: 'hidden',
                      backgroundColor: '#f3f3f3',
                    }}
                  >
                    {post.image && (
                      <FadeImage
                        src={post.image}
                        alt={post.title}
                        width={1200}
                        height={800}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 300,
                      color: '#111111',
                      margin: '14px 0 0',
                    }}
                  >
                    {post.title}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 300,
                      color: '#999999',
                      margin: '4px 0 0',
                    }}
                  >
                    {post.category} &mdash;{' '}
                    {post.date.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </Link>
              </ScrollFadeIn>
            ))}

            {posts.length === 0 && (
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 300,
                  color: '#999999',
                  padding: '40px 0',
                }}
              >
                No journal entries yet.
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
