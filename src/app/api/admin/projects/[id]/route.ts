import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sectorsToSlugs, FEATURED_CATEGORY } from "@/lib/categories";

// For each category the project belongs to but doesn't yet have an
// ordering entry for, append it at the bottom of that category:
// order = (current max order in that category) + 1.
async function appendMissingCategoryOrders(
  projectId: number,
  categorySlugs: string[]
) {
  if (categorySlugs.length === 0) return;

  const existing = await prisma.projectCategoryOrder.findMany({
    where: { projectId, category: { in: categorySlugs } },
    select: { category: true },
  });
  const existingSet = new Set(existing.map((e) => e.category));
  const missing = categorySlugs.filter((c) => !existingSet.has(c));

  for (const category of missing) {
    const max = await prisma.projectCategoryOrder.aggregate({
      where: { category },
      _max: { order: true },
    });
    const nextOrder = (max._max.order ?? -1) + 1;
    await prisma.projectCategoryOrder.create({
      data: { projectId, category, order: nextOrder },
    });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id: parseInt(id) },
    include: {
      images: { orderBy: { order: "asc" } },
      categoryOrders: true,
      teamMembers: { orderBy: { order: "asc" } },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const projectId = parseInt(id);
  const body = await request.json();
  const {
    title,
    slug,
    location,
    client,
    year,
    status,
    sectors,
    shortDescription,
    description,
    latitude,
    featured,
    published,
    teamVisible,
    images,
    teamMembers,
  } = body;

  // Delete existing images and recreate
  await prisma.projectImage.deleteMany({
    where: { projectId },
  });

  // Replace team members wholesale
  await prisma.projectTeamMember.deleteMany({
    where: { projectId },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: {
      title,
      slug,
      location: location || "",
      client: client || null,
      year: parseInt(year) || new Date().getFullYear(),
      status: status || "Completed",
      sectors: sectors || "",
      shortDescription: shortDescription || null,
      description: description || "",
      latitude: latitude?.trim() ? latitude.trim() : null,
      featured: featured || false,
      published: published || false,
      teamVisible: teamVisible ?? true,
      images: {
        create: (images || []).map(
          (img: { url: string; alt?: string; order?: number }, idx: number) => ({
            url: img.url,
            alt: img.alt || "",
            order: img.order ?? idx,
          })
        ),
      },
      teamMembers: {
        create: (teamMembers || [])
          .filter(
            (m: { role?: string; name?: string }) =>
              (m.role || "").trim() !== "" || (m.name || "").trim() !== ""
          )
          .map(
            (
              m: {
                role?: string;
                name?: string;
                order?: number;
                visible?: boolean;
              },
              idx: number
            ) => ({
              role: (m.role || "").trim(),
              name: (m.name || "").trim(),
              order: m.order ?? idx,
              visible: m.visible ?? true,
            })
          ),
      },
    },
  });

  // Reconcile ProjectCategoryOrder rows:
  //  - drop any category that no longer applies (sector removed / unfeatured)
  //  - append any newly-applicable category at the bottom of its list
  // Existing entries for still-valid categories keep their existing order.
  const targetSlugs = sectorsToSlugs(sectors || "");
  if (featured) targetSlugs.push(FEATURED_CATEGORY);

  await prisma.projectCategoryOrder.deleteMany({
    where: {
      projectId,
      category: { notIn: targetSlugs },
    },
  });

  await appendMissingCategoryOrders(projectId, targetSlugs);

  const full = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      images: { orderBy: { order: "asc" } },
      categoryOrders: true,
      teamMembers: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(full);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.project.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
