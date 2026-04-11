import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const publishedOnly = searchParams.get("published") === "true";

  const members = await prisma.teamMember.findMany({
    where: publishedOnly ? { published: true } : undefined,
    orderBy: { order: "asc" },
  });

  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, slug, title, bio, photo, order, published } = body;

  const member = await prisma.teamMember.create({
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

  return NextResponse.json(member, { status: 201 });
}
