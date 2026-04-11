import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import ScrollFadeIn from '@/components/public/ScrollFadeIn';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const featuredProjects = await prisma.project.findMany({
    where: { published: true, featured: true },
    orderBy: { order: 'asc' },
    include: { images: { orderBy: { order: 'asc' } } },
  });

  const recentNews = await prisma.newsPost.findMany({
    where: { published: true },
    orderBy: { date: 'desc' },
    take: 2,
  });

  const heroProject = featuredProjects[0] ?? null;
  const remainingProjects = featuredProjects.slice(1);
  const heroImage = heroProject?.images?.[0]?.url ?? null;

  return (
    <main>
      <Nav transparent={true} />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={heroProject?.title ?? ''}
            width={1920}
            height={1080}
            priority
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}
        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center">
          {heroProject && (
            <Link href={`/projects/${heroProject.slug}`} className="text-center no-underline">
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 300,
                  color: '#ffffff',
                  margin: 0,
                }}
              >
                {heroProject.title}
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.7)',
                  margin: '4px 0 0',
                }}
              >
                {heroProject.sectors}
              </p>
            </Link>
          )}
          <p
            style={{
              fontSize: 10,
              fontWeight: 300,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.6)',
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            SCROLL
          </p>
          <div
            style={{
              width: 1,
              height: 24,
              backgroundColor: 'rgba(255,255,255,0.6)',
            }}
          />
        </div>
      </section>

      {/* Featured Projects */}
      {remainingProjects.length > 0 && (
        <section
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '80px 40px',
          }}
        >
          <div className="flex flex-col items-center" style={{ gap: 48 }}>
            {remainingProjects.map((project: typeof featuredProjects[number]) => {
              const img = project.images?.[0];
              return (
                <ScrollFadeIn key={project.id}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="block text-center no-underline featured-link"
                  >
                    <div style={{ maxWidth: 600, margin: '0 auto' }}>
                      {img ? (
                        <Image
                          src={img.url}
                          alt={img.alt ?? project.title}
                          width={1200}
                          height={800}
                          loading="lazy"
                          style={{ width: '100%', height: 'auto' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            aspectRatio: '3/2',
                            backgroundColor: '#f3f3f3',
                          }}
                        />
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 300,
                        color: '#111111',
                        margin: '12px 0 0',
                      }}
                    >
                      {project.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 300,
                        color: '#999999',
                        margin: '2px 0 0',
                      }}
                    >
                      {project.sectors}
                    </p>
                  </Link>
                </ScrollFadeIn>
              );
            })}
          </div>
        </section>
      )}

      {/* News Strip */}
      {recentNews.length > 0 && (
        <section
          style={{
            maxWidth: 640,
            margin: '0 auto',
            padding: '40px 40px 80px',
          }}
        >
          {recentNews.map((post: typeof recentNews[number], i: number) => (
            <div
              key={post.id}
              style={{
                borderTop: i === 0 ? '1px solid #e8e6e2' : 'none',
                borderBottom: '1px solid #e8e6e2',
                padding: '20px 0',
              }}
            >
              <Link
                href={`/journal/${post.slug}`}
                className="no-underline block"
                style={{ transition: 'opacity 0.25s ease' }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 300,
                    color: '#999999',
                    margin: 0,
                  }}
                >
                  {post.category} &mdash;{' '}
                  {post.date.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 300,
                    color: '#111111',
                    margin: '4px 0 0',
                  }}
                >
                  {post.title}
                </p>
              </Link>
            </div>
          ))}
        </section>
      )}

      <Footer />

      <style>{`
        .featured-link {
          transition: opacity 0.25s ease;
        }
        .featured-link:hover {
          opacity: 0.75;
        }
      `}</style>
    </main>
  );
}
