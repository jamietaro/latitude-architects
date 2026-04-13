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

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const publishedOnly = searchParams.get("published") === "true";

  const projects = await prisma.project.findMany({
    where: publishedOnly ? { published: true } : undefined,
    include: {
      images: { orderBy: { order: "asc" } },
      categoryOrders: true,
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  } = body;

  const project = await prisma.project.create({
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
    include: { images: { orderBy: { order: "asc" } } },
  });

  // Auto-append category orders for each sector + featured if applicable
  const targetSlugs = sectorsToSlugs(sectors || "");
  if (featured) targetSlugs.push(FEATURED_CATEGORY);
  await appendMissingCategoryOrders(project.id, targetSlugs);

  const full = await prisma.project.findUnique({
    where: { id: project.id },
    include: {
      images: { orderBy: { order: "asc" } },
      categoryOrders: true,
    },
  });

  return NextResponse.json(full, { status: 201 });
}
