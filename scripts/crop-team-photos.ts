import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const REFERENCE_SLUGS = [
  "michael-griffiths",
  "andrew-gilbert",
  "luke-walton",
  "anurag-verma",
];

const TARGET_SLUGS = [
  "jamie-griffiths",
  "norbu-verhagen",
  "helen-bertoli",
  "eva-lakin",
];

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const refs = await prisma.teamMember.findMany({
    where: { slug: { in: REFERENCE_SLUGS } },
  });
  const targets = await prisma.teamMember.findMany({
    where: { slug: { in: TARGET_SLUGS } },
  });

  if (refs.length !== REFERENCE_SLUGS.length) {
    throw new Error(
      `Missing reference members. Found ${refs.length}/${REFERENCE_SLUGS.length}`
    );
  }
  if (targets.length !== TARGET_SLUGS.length) {
    throw new Error(
      `Missing target members. Found ${targets.length}/${TARGET_SLUGS.length}`
    );
  }

  console.log("Measuring reference photos...");
  const ratios: number[] = [];
  for (const m of refs) {
    if (!m.photo) throw new Error(`No photo for reference ${m.slug}`);
    const buf = await download(m.photo);
    const meta = await sharp(buf).metadata();
    const w = meta.width!;
    const h = meta.height!;
    const r = w / h;
    console.log(`  ${m.slug}: ${w}x${h} ratio=${r.toFixed(4)}`);
    ratios.push(r);
  }
  const targetRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  console.log(`Target aspect ratio: ${targetRatio.toFixed(4)}`);

  console.log("\nCropping landscape photos...");
  let updated = 0;
  for (const m of targets) {
    if (!m.photo) {
      console.warn(`  ${m.slug}: no existing photo, skipping`);
      continue;
    }
    const buf = await download(m.photo);
    const meta = await sharp(buf).metadata();
    const srcW = meta.width!;
    const srcH = meta.height!;
    const srcRatio = srcW / srcH;

    let newW: number;
    let newH: number;
    if (srcRatio > targetRatio) {
      newH = srcH;
      newW = Math.round(srcH * targetRatio);
    } else {
      newW = srcW;
      newH = Math.round(srcW / targetRatio);
    }
    const left = Math.floor((srcW - newW) / 2);
    const top = Math.floor((srcH - newH) / 2);

    const cropped = await sharp(buf)
      .extract({ left, top, width: newW, height: newH })
      .jpeg({ quality: 90 })
      .toBuffer();

    const destPath = `team/${m.slug}.jpg`;
    const { error } = await supabase.storage
      .from("media")
      .upload(destPath, cropped, {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (error) throw new Error(`Upload failed for ${m.slug}: ${error.message}`);

    const { data } = supabase.storage.from("media").getPublicUrl(destPath);
    const cacheBustedUrl = `${data.publicUrl}?v=${Date.now()}`;

    await prisma.teamMember.update({
      where: { id: m.id },
      data: { photo: cacheBustedUrl },
    });

    console.log(
      `  ${m.slug}: ${srcW}x${srcH} (${srcRatio.toFixed(
        4
      )}) -> ${newW}x${newH} (${(newW / newH).toFixed(4)}) -> ${destPath}`
    );
    updated++;
  }
  console.log(`\nUpdated ${updated}/${targets.length} team photos.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
