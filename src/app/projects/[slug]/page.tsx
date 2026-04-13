import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";
import FadeImage from "@/components/public/FadeImage";
import { prisma } from "@/lib/prisma";
import { stripHtml, truncate } from "@/lib/text";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug, published: true },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (!project) return { title: "Project not found" };

  const title = project.location
    ? `${project.title}, ${project.location}`
    : project.title;

  const description =
    project.shortDescription ||
    truncate(stripHtml(project.description || ""), 160) ||
    undefined;

  const firstImage = project.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      ...(firstImage
        ? { images: [{ url: firstImage, alt: project.title }] }
        : {}),
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug, published: true },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!project) notFound();

  const metaParts = [
    project.sectors.split(",").join(" \u00b7 "),
    String(project.year),
  ];
  if (project.client) metaParts.push(project.client);
  if (project.status) metaParts.push(project.status);
  const metaLine = metaParts.join(" \u00b7 ");

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <div
          className="project-layout"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "48px 40px 80px",
          }}
        >
          {/* Left column: text */}
          <div className="project-text">
            <h1
              style={{
                fontSize: 22,
                fontWeight: 300,
                color: "#111111",
                margin: 0,
              }}
            >
              {project.title}
            </h1>
            <p
              style={{
                fontSize: 13,
                fontWeight: 300,
                color: "#999999",
                margin: "6px 0 0",
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
                  color: "#333333",
                }}
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            )}
          </div>

          {/* Right column: stacked images */}
          {project.images.length > 0 && (
            <div
              className="project-images"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {project.images.map(
                (img: (typeof project.images)[number]) => (
                  <FadeImage
                    key={img.id}
                    src={img.url}
                    alt={img.alt ?? project.title}
                    width={1200}
                    height={800}
                    loading={img.order === 0 ? "eager" : "lazy"}
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />

      <style>{`
        .project-layout {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .project-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .project-images {
            order: -1;
          }
        }
      `}</style>
    </main>
  );
}
