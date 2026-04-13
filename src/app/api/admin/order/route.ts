import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORY_TABS, FEATURED_CATEGORY } from "@/lib/categories";

function findTab(slug: string) {
  return CATEGORY_TABS.find((t) => t.slug === slug);
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const category = request.nextUrl.searchParams.get("category") ?? "";
  const tab = findTab(category);
  if (!tab) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // Build the where clause for this category
  const where =
    tab.slug === FEATURED_CATEGORY
      ? { published: true, featured: true }
      : { published: true, sectors: { contains: tab.sector! } };

  const projects = await prisma.project.findMany({
    where,
    select: {
      id: true,
      title: true,
      location: true,
      categoryOrders: {
        where: { category: tab.slug },
        select: { order: true },
      },
    },
  });

  // Sort by this category's order (if set), fallback to id asc for stable
  // ordering among projects with no entry yet.
  const sorted = [...projects].sort((a, b) => {
    const ao = a.categoryOrders[0]?.order ?? Number.POSITIVE_INFINITY;
    const bo = b.categoryOrders[0]?.order ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return a.id - b.id;
  });

  return NextResponse.json(
    sorted.map((p) => ({
      id: p.id,
      title: p.title,
      location: p.location,
    }))
  );
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const category: string = body.category ?? "";
  const projectIds: number[] = Array.isArray(body.projectIds) ? body.projectIds : [];

  const tab = findTab(category);
  if (!tab) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // Upsert each projectId with its array index as the new order value.
  // This runs sequentially to avoid hammering the pool but it's fast: at
  // most ~30 projects per tab.
  for (let i = 0; i < projectIds.length; i++) {
    const projectId = projectIds[i];
    if (typeof projectId !== "number") continue;
    await prisma.projectCategoryOrder.upsert({
      where: { projectId_category: { projectId, category: tab.slug } },
      update: { order: i },
      create: { projectId, category: tab.slug, order: i },
    });
  }

  return NextResponse.json({ success: true });
}
