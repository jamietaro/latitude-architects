import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const content = await prisma.careersPageContent.findUnique({ where: { id: 1 } });
  return NextResponse.json(
    content ?? { id: 1, heading: "", intro: "", vacancies: "" }
  );
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { heading, intro, vacancies } = body;

  const content = await prisma.careersPageContent.upsert({
    where: { id: 1 },
    update: {
      heading: heading || null,
      intro: intro || null,
      vacancies: vacancies || null,
    },
    create: {
      id: 1,
      heading: heading || null,
      intro: intro || null,
      vacancies: vacancies || null,
    },
  });

  return NextResponse.json(content);
}
