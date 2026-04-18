import type { Metadata } from 'next';
import FadeImage from '@/components/public/FadeImage';
import { notFound } from 'next/navigation';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import { prisma } from '@/lib/prisma';
import { stripHtml, truncate } from '@/lib/text';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.newsPost.findUnique({
    where: { slug, published: true },
  });

  if (!post) return { title: 'Post not found' };

  const description = truncate(stripHtml(post.body || ''), 160) || undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/journal/${slug}` },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      ...(post.image ? { images: [{ url: post.image, alt: post.title }] } : {}),
    },
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.newsPost.findUnique({
    where: { slug, published: true },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!post) notFound();

  const formattedDate = post.date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', marginTop: 80, padding: '0 40px 80px' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 300,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#aaaaaa',
              margin: '0 0 8px',
            }}
          >
            {post.category}
          </p>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 300,
              color: '#111111',
              margin: '0 0 6px',
            }}
          >
            {post.title}
          </h1>
          <p
            style={{
              fontSize: 13,
              fontWeight: 300,
              color: '#999999',
              margin: '0 0 40px',
            }}
          >
            {formattedDate}
          </p>

          {post.image && (
            <FadeImage
              src={post.image}
              alt={post.title}
              width={1360}
              height={900}
              loading="lazy"
              style={{
                width: '100%',
                height: 'auto',
                marginBottom: 40,
              }}
            />
          )}

          {post.body && (
            <div
              style={{
                fontSize: 15,
                fontWeight: 300,
                lineHeight: 1.75,
                color: '#333333',
              }}
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          )}

          {post.images.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                marginTop: 40,
              }}
            >
              {post.images.map((img: typeof post.images[number]) => (
                <FadeImage
                  key={img.id}
                  src={img.url}
                  alt={img.alt ?? post.title}
                  width={1360}
                  height={900}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
