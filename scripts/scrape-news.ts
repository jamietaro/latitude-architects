/**
 * Scrape all news/journal entries from the existing Latitude Architects
 * WordPress site, download images, upload to Supabase Storage, and
 * upsert into the NewsPost table.
 *
 * Run with: npx tsx scripts/scrape-news.ts
 */
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });
dotenvConfig({ path: ".env" });
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import slugify from "slugify";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Build Prisma client locally so env vars are guaranteed loaded first.
const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const INDEX_URL = "https://latitudearchitects.com/news/";
const IMAGES_DIR = path.resolve(process.cwd(), "images/news");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── HTML helpers ──────────────────────────────────────────────────────────

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—");
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

// ─── Step 1: discover all post URLs ────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; LatitudeMigrator/1.0)" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return await res.text();
}

async function discoverPostUrls(): Promise<string[]> {
  const urls = new Set<string>();
  let page = 1;

  while (true) {
    const pageUrl = page === 1 ? INDEX_URL : `${INDEX_URL}page/${page}/`;
    let html: string;
    try {
      html = await fetchHtml(pageUrl);
    } catch {
      break; // no more pages
    }

    const before = urls.size;
    const re = /href="(https:\/\/latitudearchitects\.com\/news\/[a-z0-9-]+\/)"/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const u = m[1];
      if (u.endsWith("/news/feed/")) continue;
      urls.add(u);
    }

    if (urls.size === before) break;
    page += 1;
    if (page > 20) break; // safety
  }

  return [...urls];
}

// ─── Step 2: scrape a single post ──────────────────────────────────────────

interface ScrapedPost {
  url: string;
  title: string;
  date: Date;
  body: string;
  imageUrl: string | null;
}

function extractDate(html: string): Date {
  // Prefer JSON-LD datePublished
  const jsonLd = html.match(/"datePublished":"([^"]+)"/);
  if (jsonLd) return new Date(jsonLd[1]);
  // Fallback: og meta
  const og = html.match(
    /property="article:published_time"[^>]*content="([^"]+)"/
  );
  if (og) return new Date(og[1]);
  return new Date();
}

function extractTitle(html: string): string {
  // <title>Post Title &#8211; Latitude Architects</title>
  const t = html.match(/<title>([^<]+)<\/title>/);
  if (t) {
    return decodeEntities(t[1])
      .replace(/\s*[|–—-]\s*Lati(tu|ti)de Architects.*$/i, "")
      .trim();
  }
  // Fallback: og:title
  const og = html.match(/property="og:title"[^>]*content="([^"]+)"/);
  if (og) return decodeEntities(og[1]).trim();
  return "Untitled";
}

function extractImageUrl(html: string): string | null {
  const og = html.match(/property="og:image"[^>]*content="([^"]+)"/);
  if (og) return decodeEntities(og[1]);
  return null;
}

/**
 * Pull the entry-content section, strip WordPress page-builder chrome,
 * keep only paragraphs / headings / lists with their text.
 */
function extractBody(html: string, titleText: string): string {
  // Grab everything between <section class="entry-content"> and closing </section>
  const sec = html.match(
    /<section class="entry-content"[^>]*>([\s\S]*?)<\/section>\s*<footer/i
  );
  if (!sec) return "";
  const raw = sec[1];

  // Collect wpb_text_column blocks — these hold the actual editorial text
  const blocks: string[] = [];
  const blockRe =
    /<div[^>]*class="[^"]*wpb_text_column[^"]*"[^>]*>[\s\S]*?<div class="wpb_wrapper">([\s\S]*?)<\/div>\s*<\/div>/gi;
  let bm: RegExpExecArray | null;
  while ((bm = blockRe.exec(raw))) blocks.push(bm[1]);

  const clean: string[] = [];
  const titleNorm = titleText.toLowerCase().trim();
  const dateOnlyRe = /^[A-Z][a-z]+ \d{1,2},? \d{4}$/;

  for (const block of blocks) {
    // Extract <p>, <h1..h6>, <ul>, <ol> with their inner text
    const elRe = /<(p|h[1-6]|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let em: RegExpExecArray | null;
    while ((em = elRe.exec(block))) {
      const tag = em[1].toLowerCase();
      const inner = em[2];

      if (tag === "ul" || tag === "ol") {
        // Rebuild list with clean <li>s
        const items: string[] = [];
        const liRe = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
        let lm: RegExpExecArray | null;
        while ((lm = liRe.exec(inner))) {
          const text = stripTags(lm[1]);
          if (text) items.push(`<li>${text}</li>`);
        }
        if (items.length) clean.push(`<${tag}>${items.join("")}</${tag}>`);
        continue;
      }

      const text = stripTags(inner);
      if (!text) continue;
      // Skip lines that are just the date or just the title (WP duplicates them)
      if (dateOnlyRe.test(text)) continue;
      if (text.toLowerCase() === titleNorm) continue;
      clean.push(`<${tag}>${text}</${tag}>`);
    }
  }

  return clean.join("\n");
}

async function scrapePost(url: string): Promise<ScrapedPost> {
  const html = await fetchHtml(url);
  const title = extractTitle(html);
  return {
    url,
    title,
    date: extractDate(html),
    body: extractBody(html, title),
    imageUrl: extractImageUrl(html),
  };
}

// ─── Step 3 & 4: download image, upload to Supabase ───────────────────────

async function downloadAndUpload(
  imageUrl: string,
  slug: string
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.warn(`  image fetch failed (${res.status}): ${imageUrl}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = (imageUrl.split(".").pop() || "jpg").split("?")[0].toLowerCase();
    const safeExt = /^(jpe?g|png|webp|gif)$/.test(ext) ? ext : "jpg";
    const filename = `${slug}.${safeExt}`;

    // Save locally
    await writeFile(path.join(IMAGES_DIR, filename), buf);

    // Upload to Supabase
    const storagePath = `news/${filename}`;
    const contentType =
      safeExt === "png"
        ? "image/png"
        : safeExt === "webp"
          ? "image/webp"
          : safeExt === "gif"
            ? "image/gif"
            : "image/jpeg";

    const { error } = await supabase.storage
      .from("media")
      .upload(storagePath, buf, { contentType, upsert: true });
    if (error) {
      console.warn(`  supabase upload failed: ${error.message}`);
      return null;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(storagePath);
    return data.publicUrl;
  } catch (e) {
    console.warn(`  image error: ${(e as Error).message}`);
    return null;
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

function makeSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

async function main() {
  if (!existsSync(IMAGES_DIR)) await mkdir(IMAGES_DIR, { recursive: true });

  // Clean up placeholder rows
  const deleted = await prisma.newsPost.deleteMany({
    where: { OR: [{ title: "Placeholder" }, { slug: "placeholder" }] },
  });
  console.log(`Deleted ${deleted.count} placeholder rows.`);

  console.log("Discovering post URLs…");
  const urls = await discoverPostUrls();
  console.log(`Found ${urls.length} post URLs.\n`);

  let imagesDownloaded = 0;
  let recordsWritten = 0;

  for (const url of urls) {
    try {
      const post = await scrapePost(url);
      const slug = makeSlug(post.title);
      console.log(`• ${slug}  (${post.date.toISOString().slice(0, 10)})`);

      let publicImageUrl: string | null = null;
      if (post.imageUrl) {
        publicImageUrl = await downloadAndUpload(post.imageUrl, slug);
        if (publicImageUrl) imagesDownloaded += 1;
      }

      await prisma.newsPost.upsert({
        where: { slug },
        create: {
          title: post.title,
          slug,
          date: post.date,
          category: "Journal",
          body: post.body,
          image: publicImageUrl,
          published: true,
        },
        update: {
          title: post.title,
          date: post.date,
          category: "Journal",
          body: post.body,
          image: publicImageUrl,
          published: true,
        },
      });
      recordsWritten += 1;
    } catch (e) {
      console.warn(`  FAILED ${url}: ${(e as Error).message}`);
    }
  }

  console.log("\n─────────────────────────────");
  console.log(`Posts found:          ${urls.length}`);
  console.log(`Images downloaded:    ${imagesDownloaded}`);
  console.log(`Database rows upsert: ${recordsWritten}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
