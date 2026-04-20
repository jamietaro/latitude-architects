import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const LISTED_SLUGS = [
  "lighthouse",
  "kings-cross-bridge",
  "55-73-duke-street",
  "90-104-berwick-street",
  "bowback-house",
  "30-north-audley-street",
  "21-st-georges-road",
  "35-cosway-street",
];

// External site slug -> current DB slug for pages that were renamed.
const SLUG_ALIAS: Record<string, string> = {
  lighthouse: "the-lighthouse",
};

const EXISTING_SITE = "https://latitudearchitects.com/projects";

type Scraped = {
  slug: string;
  url: string;
  status: "ok" | "not-found" | "error";
  client: string | null;
  projectStatus: string | null;
  latitude: string | null;
  note?: string;
};

const ENTITY_MAP: Record<string, string> = {
  "&#8217;": "'",
  "&#8216;": "'",
  "&#8243;": '"',
  "&#8242;": "'",
  "&#8220;": '"',
  "&#8221;": '"',
  "&#x2019;": "'",
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
};

function decodeEntities(s: string): string {
  return s.replace(
    /&(?:#\d+|#x[0-9a-fA-F]+|amp|nbsp|lt|gt);/g,
    (m) => ENTITY_MAP[m] ?? m
  );
}

function normalizeQuotes(s: string): string {
  return s
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/[\u201C\u201D\u2033]/g, '"');
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extract(html: string, label: string): string | null {
  const re = new RegExp(
    `<strong>${label}\\s*:\\s*</strong>\\s*<br\\s*/?>\\s*([\\s\\S]*?)</p>`,
    "i"
  );
  const m = html.match(re);
  if (!m) return null;
  const text = stripTags(decodeEntities(m[1]));
  return text || null;
}

function extractLatitude(html: string): string | null {
  const normalised = normalizeQuotes(decodeEntities(html));
  const m = normalised.match(/(\d{1,2}°\d{1,2}'[\d.]+"N)/);
  return m ? m[1] : null;
}

async function scrape(slug: string): Promise<Scraped> {
  const url = `${EXISTING_SITE}/${slug}/`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compat; seeder)" },
    });
    if (res.status === 404) {
      return {
        slug,
        url,
        status: "not-found",
        client: null,
        projectStatus: null,
        latitude: null,
      };
    }
    if (!res.ok) {
      return {
        slug,
        url,
        status: "error",
        client: null,
        projectStatus: null,
        latitude: null,
        note: `HTTP ${res.status}`,
      };
    }
    const html = await res.text();
    return {
      slug,
      url,
      status: "ok",
      client: extract(html, "Client"),
      projectStatus: extract(html, "Status"),
      latitude: extractLatitude(html),
    };
  } catch (err) {
    return {
      slug,
      url,
      status: "error",
      client: null,
      projectStatus: null,
      latitude: null,
      note: err instanceof Error ? err.message : String(err),
    };
  }
}

async function upsertClientMember(
  projectId: number,
  name: string
): Promise<"created" | "updated"> {
  const existing = await prisma.projectTeamMember.findFirst({
    where: { projectId, role: "Client" },
  });
  if (existing) {
    await prisma.projectTeamMember.update({
      where: { id: existing.id },
      data: { name, visible: true, order: 0 },
    });
    return "updated";
  }
  await prisma.projectTeamMember.create({
    data: { projectId, role: "Client", name, visible: true, order: 0 },
  });
  return "created";
}

async function main() {
  const published = await prisma.project.findMany({
    where: { published: true },
    select: { id: true, slug: true, title: true, featured: true },
    orderBy: { id: "asc" },
  });

  const dbSlugs = new Set(published.map((p) => p.slug));
  const toScrape = new Set<string>(LISTED_SLUGS);
  // Also attempt any other published DB slug not in the listed set.
  for (const p of published) {
    if (!toScrape.has(p.slug)) toScrape.add(p.slug);
  }

  const results: Array<Scraped & { inDb: boolean; projectId?: number }> = [];
  console.log(`Scraping ${toScrape.size} slug(s)...`);
  for (const slug of toScrape) {
    const r = await scrape(slug);
    const dbSlug = SLUG_ALIAS[slug] ?? slug;
    const dbRow = published.find((p) => p.slug === dbSlug);
    results.push({ ...r, inDb: !!dbRow, projectId: dbRow?.id });
    const found =
      r.status === "ok"
        ? `client=${r.client ?? "-"}  status=${r.projectStatus ?? "-"}  lat=${
            r.latitude ?? "-"
          }`
        : `(${r.status}${r.note ? " " + r.note : ""})`;
    console.log(`  ${slug.padEnd(28)}  ${found}`);
  }

  console.log("\nSeeding DB...");
  const summary: Array<{
    slug: string;
    action: string;
    client: string | null;
    latitude: string | null;
  }> = [];

  for (const r of results) {
    if (!r.inDb || r.projectId == null) {
      summary.push({
        slug: r.slug,
        action: "skipped (not in DB as published)",
        client: r.client,
        latitude: r.latitude,
      });
      continue;
    }
    if (r.status !== "ok") {
      // Still apply featured-project TBC fallback if applicable.
      if (LISTED_SLUGS.includes(r.slug)) {
        const op = await upsertClientMember(r.projectId, "TBC");
        await prisma.project.update({
          where: { id: r.projectId },
          data: { teamVisible: true },
        });
        summary.push({
          slug: r.slug,
          action: `scrape failed → TBC client ${op}, teamVisible=true`,
          client: "TBC",
          latitude: null,
        });
      } else {
        summary.push({
          slug: r.slug,
          action: `scrape ${r.status}`,
          client: null,
          latitude: null,
        });
      }
      continue;
    }

    const effectiveClient = r.client ?? (LISTED_SLUGS.includes(r.slug) ? "TBC" : null);

    if (effectiveClient) {
      const op = await upsertClientMember(r.projectId, effectiveClient);
      await prisma.project.update({
        where: { id: r.projectId },
        data: { teamVisible: true },
      });

      if (r.latitude) {
        await prisma.project.update({
          where: { id: r.projectId },
          data: { latitude: r.latitude },
        });
      }

      summary.push({
        slug: r.slug,
        action: `client ${op}${r.client ? "" : " (TBC fallback)"}${
          r.latitude ? ", latitude set" : ""
        }, teamVisible=true`,
        client: effectiveClient,
        latitude: r.latitude,
      });
    } else if (r.latitude) {
      await prisma.project.update({
        where: { id: r.projectId },
        data: { latitude: r.latitude, teamVisible: true },
      });
      summary.push({
        slug: r.slug,
        action: "latitude set, teamVisible=true (no client scraped)",
        client: null,
        latitude: r.latitude,
      });
    } else {
      summary.push({
        slug: r.slug,
        action: "no changes",
        client: null,
        latitude: null,
      });
    }
  }

  console.log("\n=== Summary ===");
  for (const s of summary) {
    console.log(
      `${s.slug.padEnd(28)}  ${s.action}  [client=${s.client ?? "-"}, lat=${
        s.latitude ?? "-"
      }]`
    );
  }

  // Sanity check: print final state for listed slugs.
  console.log("\n=== Final DB state (listed slugs) ===");
  const finalRows = await prisma.project.findMany({
    where: { slug: { in: LISTED_SLUGS } },
    select: {
      slug: true,
      latitude: true,
      teamVisible: true,
      teamMembers: {
        where: { role: "Client" },
        select: { name: true, visible: true, order: true },
      },
    },
  });
  for (const r of finalRows) {
    const client = r.teamMembers[0];
    console.log(
      `${r.slug.padEnd(28)}  latitude=${r.latitude ?? "-"}  teamVisible=${
        r.teamVisible
      }  client=${client ? client.name : "(none)"}`
    );
  }

  console.log(`\nDB slugs available: ${dbSlugs.size}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
