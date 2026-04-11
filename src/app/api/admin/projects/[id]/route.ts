import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id: parseInt(id) },
    include: { images: { orderBy: { order: "asc" } } },
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

  // Delete existing images and recreate
  await prisma.projectImage.deleteMany({
    where: { projectId: parseInt(id) },
  });

  const project = await prisma.project.update({
    where: { id: parseInt(id) },
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

  return NextResponse.json(project);
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
