import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface BlockInput {
  id: number;
  imageUrl: string | null;
  tagline: string | null;
  body: string | null;
}

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blocks = await prisma.aboutBlock.findMany({
    orderBy: { id: "asc" },
  });

  // Ensure all 4 rows exist — create any missing ones lazily
  const existingIds = new Set(blocks.map((b) => b.id));
  const missing = [1, 2, 3, 4].filter((id) => !existingIds.has(id));
  if (missing.length > 0) {
    await prisma.aboutBlock.createMany({
      data: missing.map((id) => ({ id, imageUrl: null, tagline: null, body: null })),
    });
    const refreshed = await prisma.aboutBlock.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(refreshed);
  }

  return NextResponse.json(blocks);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const blocks: BlockInput[] = Array.isArray(body.blocks) ? body.blocks : [];

  for (const b of blocks) {
    if (![1, 2, 3, 4].includes(b.id)) continue;
    await prisma.aboutBlock.upsert({
      where: { id: b.id },
      update: {
        imageUrl: b.imageUrl || null,
        tagline: b.tagline || null,
        body: b.body || null,
      },
      create: {
        id: b.id,
        imageUrl: b.imageUrl || null,
        tagline: b.tagline || null,
        body: b.body || null,
      },
    });
  }

  const all = await prisma.aboutBlock.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(all);
}
