import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return NextResponse.json(
    settings ?? { id: 1, heroImageUrl: null, heroImageOpacity: 1.0, contactImageUrl: null }
  );
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { heroImageUrl, heroImageOpacity, contactImageUrl } = body;

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      heroImageUrl: heroImageUrl || null,
      heroImageOpacity: heroImageOpacity ?? 1.0,
      contactImageUrl: contactImageUrl || null,
    },
    create: {
      id: 1,
      heroImageUrl: heroImageUrl || null,
      heroImageOpacity: heroImageOpacity ?? 1.0,
      contactImageUrl: contactImageUrl || null,
    },
  });

  return NextResponse.json(settings);
}
