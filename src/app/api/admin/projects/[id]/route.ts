import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sectorsToSlugs, FEATURED_CATEGORY } from "@/lib/categories";

type CategoryOrderInput = { category: string; order: number };

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
    featured,
    published,
    images,
    categoryOrders,
  } = body;

  // Delete existing images and recreate
  await prisma.projectImage.deleteMany({
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
      featured: featured || false,
      published: published || false,
      images: {
        create: (images || []).map(
          (img: { url: string; alt?: string; order?: number }, idx: number) => ({
            url: img.url,
            alt: img.alt || "",
            order: img.order ?? idx,
          })
        ),
      },
    },
  });

  // Reconcile categoryOrders against valid categories for this project
  const validSlugs = new Set(sectorsToSlugs(sectors || ""));
  if (featured) validSlugs.add(FEATURED_CATEGORY);

  // Remove any category orders that no longer apply (sector removed, unfeatured)
  await prisma.projectCategoryOrder.deleteMany({
    where: {
      projectId,
      category: { notIn: Array.from(validSlugs) },
    },
  });

  // Upsert each incoming category order
  const incoming: CategoryOrderInput[] = (categoryOrders || []).filter(
    (co: CategoryOrderInput) => validSlugs.has(co.category)
  );
  for (const co of incoming) {
    await prisma.projectCategoryOrder.upsert({
      where: {
        projectId_category: { projectId, category: co.category },
      },
      update: { order: Number(co.order) || 0 },
      create: {
        projectId,
        category: co.category,
        order: Number(co.order) || 0,
      },
    });
  }

  const full = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      images: { orderBy: { order: "asc" } },
      categoryOrders: true,
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
