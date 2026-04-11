import Nav from '@/components/public/Nav';
import Footer from '@/components/public/Footer';
import ProjectsGrid from '@/components/public/ProjectsGrid';
import { prisma } from '@/lib/prisma';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
  });

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <ProjectsGrid projects={projects} />
      </div>
      <Footer />
    </main>
  );
}
