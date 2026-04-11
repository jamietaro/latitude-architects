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

  const member = await prisma.teamMember.findUnique({
    where: { id: parseInt(id) },
  });

  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(member);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { name, slug, title, bio, photo, order, published } = body;

  const member = await prisma.teamMember.update({
    where: { id: parseInt(id) },
    data: {
      name,
      slug,
      title: title || "",
      bio: bio || "",
      photo: photo || null,
      order: parseInt(order) || 0,
      published: published || false,
    },
  });

  return NextResponse.json(member);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.teamMember.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
