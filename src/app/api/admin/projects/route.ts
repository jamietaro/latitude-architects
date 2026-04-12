import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sectorsToSlugs, FEATURED_CATEGORY } from "@/lib/categories";

type CategoryOrderInput = { category: string; order: number };

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
    categoryOrders,
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

  // Create category orders based on sectors + featured flag
  const validSlugs = new Set(sectorsToSlugs(sectors || ""));
  if (featured) validSlugs.add(FEATURED_CATEGORY);

  const incoming: CategoryOrderInput[] = (categoryOrders || []).filter(
    (co: CategoryOrderInput) => validSlugs.has(co.category)
  );

  if (incoming.length > 0) {
    await prisma.projectCategoryOrder.createMany({
      data: incoming.map((co) => ({
        projectId: project.id,
        category: co.category,
        order: Number(co.order) || 0,
      })),
    });
  }

  const full = await prisma.project.findUnique({
    where: { id: project.id },
    include: {
      images: { orderBy: { order: "asc" } },
      categoryOrders: true,
    },
  });

  return NextResponse.json(full, { status: 201 });
}
