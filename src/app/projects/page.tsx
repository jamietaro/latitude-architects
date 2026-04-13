import type { Metadata } from 'next';
import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import ProjectsGrid from '@/components/public/ProjectsGrid';
import StructuredData from '@/components/StructuredData';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    "Browse Latitude Architects' portfolio of award-winning projects across residential, offices, mixed use, heritage, and culture sectors in London and beyond.",
  alternates: { canonical: '/projects' },
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    include: {
      images: { orderBy: { order: 'asc' }, take: 1 },
      categoryOrders: true,
    },
    orderBy: { id: 'asc' },
  });

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Latitude Architects Projects',
    itemListElement: projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://latitudearchitects.com/projects/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <main>
      <StructuredData data={itemList} />
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <ProjectsGrid projects={projects} />
      </div>
      <Footer />
    </main>
  );
}
