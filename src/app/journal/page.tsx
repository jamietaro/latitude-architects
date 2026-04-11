import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import ScrollFadeIn from '@/components/public/ScrollFadeIn';
import { prisma } from '@/lib/prisma';

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
          className="journal-layout"
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '48px 40px 80px',
            display: 'flex',
            gap: 0,
          }}
        >
          {/* Left: Posts */}
          <div style={{ flex: 1 }}>
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
                    {post.image && (
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={1200}
                        height={800}
                        loading="lazy"
                        style={{
                          maxWidth: 580,
                          width: '100%',
                          height: 'auto',
                        }}
                      />
                    )}
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 300,
                        color: '#111111',
                        margin: post.image ? '14px 0 0' : '0',
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

          {/* Right: Newsletter */}
          <div
            className="journal-sidebar"
            style={{
              width: 320,
              borderLeft: '1px solid #e8e6e2',
              paddingLeft: 48,
              flexShrink: 0,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 300,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#aaaaaa',
                margin: '0 0 20px',
              }}
            >
              NEWSLETTER
            </p>
            <form>
              <input
                type="email"
                placeholder="Email address"
                style={{
                  width: '100%',
                  fontSize: 14,
                  fontWeight: 300,
                  padding: '8px 0',
                  border: 'none',
                  borderBottom: '1px solid #333333',
                  outline: 'none',
                  background: 'transparent',
                  color: '#111111',
                }}
              />
              <button
                type="submit"
                style={{
                  marginTop: 16,
                  fontSize: 11,
                  fontWeight: 300,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#111111',
                  padding: 0,
                  transition: 'opacity 0.25s ease',
                }}
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        <style>{`
          @media (max-width: 767px) {
            .journal-layout {
              flex-direction: column !important;
            }
            .journal-sidebar {
              width: 100% !important;
              border-left: none !important;
              border-top: 1px solid #e8e6e2 !important;
              padding-left: 0 !important;
              padding-top: 40px !important;
              margin-top: 40px !important;
            }
          }
        `}</style>
      </div>
      <Footer />
    </main>
  );
}
