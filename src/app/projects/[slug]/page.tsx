import Image from 'next/image';
import { notFound } from 'next/navigation';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import { prisma } from '@/lib/prisma';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug, published: true },
    include: { images: { orderBy: { order: 'asc' } } },
  });

  if (!project) notFound();

  const heroImage = project.images?.[0];
  const galleryImages = project.images?.slice(1) ?? [];

  const metaParts = [project.sectors, String(project.year)];
  if (project.client) metaParts.push(project.client);
  if (project.status) metaParts.push(project.status);
  const metaLine = metaParts.join(' \u00b7 ');

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        {/* Hero */}
        <div className="relative w-full" style={{ height: 480, overflow: 'hidden' }}>
          {heroImage ? (
            <Image
              src={heroImage.url}
              alt={heroImage.alt ?? project.title}
              width={1920}
              height={1080}
              priority
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-100" />
          )}
        </div>

        {/* Content */}
        <div style={{ maxWidth: 680, margin: '0 auto', marginTop: 48, padding: '0 40px' }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 300,
              color: '#111111',
              margin: 0,
            }}
          >
            {project.title}
          </h1>
          <p
            style={{
              fontSize: 13,
              fontWeight: 300,
              color: '#999999',
              margin: '6px 0 0',
            }}
          >
            {metaLine}
          </p>

          {project.description && (
            <div
              style={{
                marginTop: 32,
                fontSize: 15,
                fontWeight: 300,
                lineHeight: 1.75,
                color: '#333333',
              }}
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          )}
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div
            style={{
              maxWidth: 600,
              margin: '48px auto 0',
              padding: '0 40px 80px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {galleryImages.map((img: typeof galleryImages[number]) => (
              <Image
                key={img.id}
                src={img.url}
                alt={img.alt ?? project.title}
                width={1200}
                height={800}
                loading="lazy"
                style={{ width: '100%', height: 'auto' }}
              />
            ))}
          </div>
        )}

        {galleryImages.length === 0 && <div style={{ height: 80 }} />}
      </div>
      <Footer />
    </main>
  );
}
