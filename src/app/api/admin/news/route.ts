import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const publishedOnly = searchParams.get("published") === "true";

  const posts = await prisma.newsPost.findMany({
    where: publishedOnly ? { published: true } : undefined,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, slug, date, category, body: postBody, image, published } = body;

  const post = await prisma.newsPost.create({
    data: {
      title,
      slug,
      date: new Date(date),
      category: category || "",
      body: postBody || "",
      image: image || null,
      published: published || false,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
