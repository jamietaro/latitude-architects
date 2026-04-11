import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const publishedOnly = searchParams.get("published") === "true";

  const projects = await prisma.project.findMany({
    where: publishedOnly ? { published: true } : undefined,
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
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
    order,
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
      order: parseInt(order) || 0,
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

  return NextResponse.json(project, { status: 201 });
}
