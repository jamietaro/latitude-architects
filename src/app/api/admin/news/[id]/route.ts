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

  const post = await prisma.newsPost.findUnique({
    where: { id: parseInt(id) },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const postId = parseInt(id);
  const body = await request.json();
  const {
    title,
    slug,
    date,
    category,
    body: postBody,
    image,
    published,
    images,
  } = body;

  // Replace gallery wholesale — simpler than upsert for an ordered list.
  await prisma.newsPostImage.deleteMany({ where: { postId } });

  await prisma.newsPost.update({
    where: { id: postId },
    data: {
      title,
      slug,
      date: new Date(date),
      category: category || "",
      body: postBody || "",
      image: image || null,
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

  const full = await prisma.newsPost.findUnique({
    where: { id: postId },
    include: { images: { orderBy: { order: "asc" } } },
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

  await prisma.newsPost.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
