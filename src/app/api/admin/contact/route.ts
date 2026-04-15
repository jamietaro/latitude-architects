import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const content = await prisma.contactPageContent.findUnique({ where: { id: 1 } });
  return NextResponse.json(
    content ?? {
      id: 1,
      heading: "",
      address: "",
      phone: "",
      email: "",
      body: "",
      imageUrl: null,
    }
  );
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    heading,
    address,
    phone,
    email,
    body: bodyHtml,
    imageUrl,
  } = body;

  const content = await prisma.contactPageContent.upsert({
    where: { id: 1 },
    update: {
      heading: heading || null,
      address: address || null,
      phone: phone || null,
      email: email || null,
      body: bodyHtml || null,
      imageUrl: imageUrl || null,
    },
    create: {
      id: 1,
      heading: heading || null,
      address: address || null,
      phone: phone || null,
      email: email || null,
      body: bodyHtml || null,
      imageUrl: imageUrl || null,
    },
  });

  return NextResponse.json(content);
}
