import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface BlockInput {
  id: number;
  imageUrl: string | null;
  tagline: string | null;
  body: string | null;
}

interface PageContentInput {
  headline?: string | null;
  intro?: string | null;
  pullQuote?: string | null;
  heroImageTop?: string | null;
  heroImageBottom?: string | null;
}

const BLOCK_IDS = [1, 2, 3, 4, 5];

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blocks = await prisma.aboutBlock.findMany({ orderBy: { id: "asc" } });

  // Ensure all block rows exist — create any missing ones lazily.
  const existingIds = new Set(blocks.map((b) => b.id));
  const missing = BLOCK_IDS.filter((id) => !existingIds.has(id));
  if (missing.length > 0) {
    await prisma.aboutBlock.createMany({
      data: missing.map((id) => ({
        id,
        imageUrl: null,
        tagline: null,
        body: null,
      })),
    });
  }

  const [allBlocks, pageContent] = await Promise.all([
    prisma.aboutBlock.findMany({ orderBy: { id: "asc" } }),
    prisma.aboutPageContent.findUnique({ where: { id: 1 } }),
  ]);

  return NextResponse.json({
    blocks: allBlocks,
    pageContent:
      pageContent ?? {
        id: 1,
        headline: null,
        intro: null,
        pullQuote: null,
        heroImageTop: null,
        heroImageBottom: null,
      },
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const blocks: BlockInput[] = Array.isArray(body.blocks) ? body.blocks : [];
  const pc: PageContentInput = body.pageContent ?? {};

  for (const b of blocks) {
    if (!BLOCK_IDS.includes(b.id)) continue;
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

  const pcData = {
    headline: pc.headline || null,
    intro: pc.intro || null,
    pullQuote: pc.pullQuote || null,
    heroImageTop: pc.heroImageTop || null,
    heroImageBottom: pc.heroImageBottom || null,
  };
  await prisma.aboutPageContent.upsert({
    where: { id: 1 },
    update: pcData,
    create: { id: 1, ...pcData },
  });

  const [allBlocks, pageContent] = await Promise.all([
    prisma.aboutBlock.findMany({ orderBy: { id: "asc" } }),
    prisma.aboutPageContent.findUnique({ where: { id: 1 } }),
  ]);

  return NextResponse.json({ blocks: allBlocks, pageContent });
}
