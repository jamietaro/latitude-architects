import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
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

interface Member {
  slug: string;
  name: string;
  title: string;
  order: number;
  bio: string;
  photoUrl: string;
}

// Bios extracted verbatim from latitudearchitects.com staff pages
const members: Member[] = [
  {
    slug: "andrew-gilbert",
    name: "Andrew Gilbert",
    title: "Director",
    order: 1,
    bio:
      "<p>Andrew established Latitude in 2000 with Michael Griffiths.</p>" +
      "<p>Andrew has significant expertise in developing large buildings in some of London\u2019s most sensitive locations. He oversees most of Latitude projects during their detailed design and site stages, and he is skilled at developing the fledgling scheme into built reality while retaining the integrity of the initial concepts.</p>",
    photoUrl:
      "https://latitudearchitects.com/wp-content/uploads/Staff-photos_AG_Website_250425-1.jpg",
  },
  {
    slug: "michael-griffiths",
    name: "Michael Griffiths",
    title: "Director",
    order: 2,
    bio:
      "<p>Michael co-founded Latitude in 2000 with Andrew Gilbert.</p>" +
      "<p>At Latitude, Michael\u2019s primary responsibility is in the initial project stages where he has significant experience of achieving high value planning consents on complex and sensitive sites. Michael also sits on the Design Review panel for the Design Commission for Wales and is an architectural student mentor at Cardiff University.</p>",
    photoUrl:
      "https://latitudearchitects.com/wp-content/uploads/Staff-photos_MG_Website_250425-1.jpg",
  },
  {
    slug: "luke-walton",
    name: "Luke Walton",
    title: "Director",
    order: 3,
    bio:
      "<p>Since joining Latitude in 2006, Luke has been involved in many of the practice\u2019s prime residential and commercial schemes including 55-70 Duke Street for Grosvenor and 98 Fetter Lane for GE Real Estate. He was the project architect for the New London Architecture awarded mixed-use scheme at 30 North Audley Street and was made an Associate Director in 2012.</p>" +
      "<p>Luke is currently leading the Latitude team on the 110 room hotel, retail and residential scheme in Berwick street, Soho.</p>" +
      "<p>Luke was made a Director in 2017.</p>",
    photoUrl:
      "https://latitudearchitects.com/wp-content/uploads/Staff-photos_LW_Website_250425-1.jpg",
  },
  {
    slug: "anurag-verma",
    name: "Anurag Verma",
    title: "Associate Director",
    order: 4,
    bio:
      "<p>Anurag joined Latitude in 2011 having previously worked at a number of high profile London architectural practices. He was responsible for the high profile Grade II listed Lighthouse Building at King\u2019s Cross and is currently overseeing the delivery of a new office building over King\u2019s Cross Bridge. Anurag has a wealth of experience of reconciling development demands with existing infrastructure, particularly on listed buildings.</p>" +
      "<p>Anurag has previously taught at the University of East London and London Metropolitan University. In his free time, he is currently Chair of RUSS a South London CLT focused on self-building.</p>" +
      "<p>Anurag was made an Associate Director in 2017.</p>",
    photoUrl:
      "https://latitudearchitects.com/wp-content/uploads/Staff-photos_AV_Website_250425-1.jpg",
  },
];

async function downloadAndUpload(sourceUrl: string, slug: string): Promise<string> {
  const res = await fetch(sourceUrl);
  if (!res.ok) {
    throw new Error(`Failed to download ${sourceUrl}: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const ext = contentType.includes("png") ? "png" : "jpg";
  const filePath = `team/${slug}.${ext}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(filePath, buffer, { contentType, upsert: true });
  if (error) {
    throw new Error(`Upload failed for ${filePath}: ${error.message}`);
  }

  const { data } = supabase.storage.from("media").getPublicUrl(filePath);
  return data.publicUrl;
}

async function main() {
  for (const m of members) {
    console.log(`\nProcessing ${m.name}...`);

    let photoUrl: string | null = null;
    try {
      console.log(`  Downloading ${m.photoUrl}`);
      photoUrl = await downloadAndUpload(m.photoUrl, m.slug);
      console.log(`  Uploaded to ${photoUrl}`);
    } catch (e) {
      console.error(`  Photo upload failed: ${(e as Error).message}`);
    }

    const existing = await prisma.teamMember.findUnique({
      where: { slug: m.slug },
    });

    if (existing) {
      await prisma.teamMember.update({
        where: { slug: m.slug },
        data: {
          name: m.name,
          title: m.title,
          bio: m.bio,
          photo: photoUrl ?? existing.photo,
          order: m.order,
          published: true,
        },
      });
      console.log(`  Updated existing record (id=${existing.id})`);
    } else {
      const created = await prisma.teamMember.create({
        data: {
          slug: m.slug,
          name: m.name,
          title: m.title,
          bio: m.bio,
          photo: photoUrl,
          order: m.order,
          published: true,
        },
      });
      console.log(`  Created new record (id=${created.id})`);
    }
  }

  console.log("\nDone seeding team members.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
