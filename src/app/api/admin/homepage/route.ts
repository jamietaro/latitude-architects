import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface SlideInput {
  id?: number;
  imageUrl: string;
  opacity?: number;
  order?: number;
  projectId?: number | null;
}

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
    include: {
      heroSlides: {
        orderBy: { order: "asc" },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
              sectors: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(
    settings ?? {
      id: 1,
      heroTagline:
        "Celebrating 25 years of crafting exceptional buildings across London and beyond.",
      bannerImageUrl: null,
      bannerTagline: "Buildings for people.",
      bannerCta: "Get in touch",
      heroSlides: [],
    }
  );
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    heroTagline,
    bannerImageUrl,
    bannerTagline,
    bannerCta,
    heroSlides,
  } = body;

  // Upsert base settings (without slides)
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      heroTagline:
        heroTagline ??
        "Celebrating 25 years of crafting exceptional buildings across London and beyond.",
      bannerImageUrl: bannerImageUrl || null,
      bannerTagline: bannerTagline ?? "Buildings for people.",
      bannerCta: bannerCta ?? "Get in touch",
    },
    create: {
      id: 1,
      bannerImageUrl: bannerImageUrl || null,
      bannerTagline: bannerTagline ?? "Buildings for people.",
      bannerCta: bannerCta ?? "Get in touch",
      heroTagline:
        heroTagline ??
        "Celebrating 25 years of crafting exceptional buildings across London and beyond.",
    },
  });

  // Replace slides: delete all then recreate
  const slides: SlideInput[] = Array.isArray(heroSlides) ? heroSlides : [];
  await prisma.heroSlide.deleteMany({ where: { siteSettingsId: 1 } });
  if (slides.length > 0) {
    await prisma.heroSlide.createMany({
      data: slides
        .filter((s) => s.imageUrl)
        .map((s, idx) => ({
          siteSettingsId: 1,
          imageUrl: s.imageUrl,
          opacity: typeof s.opacity === "number" ? s.opacity : 0.85,
          order: typeof s.order === "number" ? s.order : idx,
          projectId: s.projectId ?? null,
        })),
    });
  }

  const full = await prisma.siteSettings.findUnique({
    where: { id: 1 },
    include: {
      heroSlides: {
        orderBy: { order: "asc" },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
              sectors: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(full);
}
