// One-off content migration: split the legacy single Journal section.
//
// The legacy "Journal" is backed by the NewsPost model. Going forward we keep
// only the TWO most-recent PUBLISHED NewsPosts as Journal; every other NewsPost
// (older published ones AND any unpublished ones) is copied into the new
// NewsItem model (the public "News" section) and then deleted from NewsPost.
//
// Idempotent: a second run finds <= 2 posts left in NewsPost and moves nothing.
// Run: npx tsx scripts/migrate-journal-to-news.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const KEEP_AS_JOURNAL = 2;

async function main() {
  const allPosts = await prisma.newsPost.findMany({
    orderBy: { date: "desc" },
    include: { images: { orderBy: { order: "asc" } } },
  });

  // The 2 most-recent PUBLISHED posts stay as Journal.
  const keepIds = new Set(
    allPosts
      .filter((p) => p.published)
      .slice(0, KEEP_AS_JOURNAL)
      .map((p) => p.id)
  );

  const toMove = allPosts.filter((p) => !keepIds.has(p.id));
  const kept = allPosts.filter((p) => keepIds.has(p.id));

  console.log(`Total NewsPosts: ${allPosts.length}`);
  console.log(`\nKeeping as JOURNAL (${kept.length}):`);
  kept.forEach((p) =>
    console.log(`  · ${p.date.toISOString().slice(0, 10)}  ${p.title}`)
  );
  console.log(`\nMoving to NEWS (${toMove.length}):`);
  toMove.forEach((p) =>
    console.log(
      `  · ${p.date.toISOString().slice(0, 10)}  ${p.title}` +
        `${p.published ? "" : "  [unpublished]"}`
    )
  );

  if (toMove.length === 0) {
    console.log("\nNothing to move. Done.");
    return;
  }

  for (const post of toMove) {
    await prisma.$transaction(async (tx) => {
      await tx.newsItem.create({
        data: {
          title: post.title,
          slug: post.slug,
          date: post.date,
          category: post.category,
          body: post.body,
          image: post.image,
          published: post.published,
          images: {
            create: post.images.map((img) => ({
              url: img.url,
              alt: img.alt,
              order: img.order,
            })),
          },
        },
      });
      // Cascade deletes NewsPostImage rows.
      await tx.newsPost.delete({ where: { id: post.id } });
    });
  }

  const remaining = await prisma.newsPost.count();
  const newsCount = await prisma.newsItem.count();
  console.log(
    `\nDone. NewsPost (Journal) now: ${remaining}; NewsItem (News) now: ${newsCount}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
