import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import sharp from "sharp";

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

const projects = [
  {
    title: "Ightham Scout Pavilion",
    slug: "ightham-scout-pavilion",
    location: "Ightham, Kent",
    year: 2010,
    status: "Complete",
    sectors: "Culture and Education",
    description:
      "<p>New scout facilities (hall and changing facilities) integrated into sloping terrain within an established park.</p>",
    order: 10,
  },
  {
    title: "Meridian Quay",
    slug: "meridian-quay",
    location: "Swansea SA1",
    year: 2003,
    status: "Complete",
    sectors: "Mixed Use,Residential",
    description:
      "<p>Major mixed-use scheme acting as a catalyst for the rejuvenation of Swansea's Maritime Quarter, combining residential, commercial, and public spaces.</p>",
    order: 11,
  },
  {
    title: "32 Sloane Gardens",
    slug: "32-sloane-gardens",
    location: "London SW1W",
    year: 2013,
    status: "Complete",
    sectors: "Residential",
    description:
      "<p>High-end residential development in the prestigious Sloane Gardens area of Chelsea, London.</p>",
    order: 12,
  },
  {
    title: "Hill View Farm",
    slug: "hill-view-farm",
    location: "Kent TN15",
    year: 2009,
    status: "Complete",
    sectors: "Residential",
    description:
      "<p>New family house in the Kent countryside, designed to maximise spectacular views from the site.</p>",
    order: 13,
  },
  {
    title: "126 Pavilion Road",
    slug: "126-pavilion-road",
    location: "London SW1X",
    year: 2014,
    status: "Complete",
    sectors: "Residential",
    description:
      "<p>Significant refurbishment of an 1870s mews house with mansard addition and interior layout reconfiguration.</p>",
    order: 14,
  },
  {
    title: "8\u201314 Cadogan Lane",
    slug: "8-14-cadogan-lane",
    location: "London SW1X",
    year: 2012,
    status: "Complete",
    sectors: "Residential",
    description:
      "<p>High-end residential development in the prestigious Cadogan Lane area of Chelsea, London.</p>",
    order: 15,
  },
  {
    title: "58 Dean Street",
    slug: "58-dean-street",
    location: "London W1",
    year: 2001,
    status: "Complete",
    sectors: "Residential",
    description:
      "<p>Conversion of a 1930s building's flat roof into three contemporary penthouse apartments in Soho.</p>",
    order: 16,
  },
  {
    title: "67\u201370 Chalk Farm Road",
    slug: "67-70-chalk-farm-road",
    location: "London NW1",
    year: 2007,
    status: "Complete",
    sectors: "Residential",
    description:
      "<p>Creation of 2 residential units and a live/work unit on a dense urban site in Camden.</p>",
    order: 17,
  },
  {
    title: "1\u20132 Halkin Street",
    slug: "1-2-halkin-street",
    location: "London W1",
    year: 2005,
    status: "Complete",
    sectors: "Residential,Historic Buildings",
    description:
      "<p>Remodelling and extension of two Grade II listed Georgian town houses to create 5 contemporary lateral apartments.</p>",
    order: 18,
  },
  {
    title: "Laleston House",
    slug: "laleston-house",
    location: "Laleston, CF31",
    year: 2005,
    status: "Complete",
    sectors: "Residential,Interiors",
    description:
      "<p>Highly contemporary interpretation of a Georgian rectory situated in a Welsh village.</p>",
    order: 19,
  },
  {
    title: "Titness Park",
    slug: "titness-park",
    location: "Ascot SL5",
    year: 2000,
    status: "Complete",
    sectors: "Residential",
    description:
      "<p>Design and construction of a new private house set within the green belt near Ascot.</p>",
    order: 20,
  },
  {
    title: "8\u201312 Brook Street",
    slug: "8-12-brook-street",
    location: "London W1K",
    year: 2005,
    status: "Complete",
    sectors: "Offices,Interiors,Historic Buildings",
    description:
      "<p>Extensive re-modelling and extension of a 1960s office building in the Mayfair Conservation Area.</p>",
    order: 21,
  },
  {
    title: "98 Fetter Lane",
    slug: "98-fetter-lane",
    location: "London EC4A",
    year: 2007,
    status: "Complete",
    sectors: "Offices",
    description:
      "<p>Extensive reconstruction and extension of a 1950s building to create 78,000 sq ft of office accommodation.</p>",
    order: 22,
  },
  {
    title: "80 Pall Mall",
    slug: "80-pall-mall",
    location: "London SW1Y",
    year: 2005,
    status: "Complete",
    sectors: "Offices,Historic Buildings",
    description:
      "<p>Reconstruction and extension of a Grade II* listed office building in St James's.</p>",
    order: 23,
  },
  {
    title: "Atlantic College Student Accommodation",
    slug: "atlantic-college-student-accommodation",
    location: "Wales",
    year: 2004,
    status: "Complete",
    sectors: "Culture and Education",
    description:
      "<p>Four new student accommodation blocks on the campus of Atlantic College. RIBA International Competition winner.</p>",
    order: 24,
  },
  {
    title: "Duke of York\u2019s Theatre",
    slug: "duke-of-yorks-theatre",
    location: "London WC2N",
    year: 2002,
    status: "Complete",
    sectors: "Culture and Education,Historic Buildings,Interiors",
    description:
      "<p>New office accommodation (two floors) and refurbishment of public areas for the Ambassador Theatre Group.</p>",
    order: 25,
  },
  {
    title: "Blink Gallery",
    slug: "blink-gallery",
    location: "London W1",
    year: 2002,
    status: "Complete",
    sectors: "Culture and Education,Interiors",
    description:
      "<p>Design and construction of a new photographic gallery in the heart of London's Soho.</p>",
    order: 26,
  },
  {
    title: "Dun Laoghaire Library",
    slug: "dun-laoghaire-library",
    location: "Dun Laoghaire, Ireland",
    year: 2006,
    status: "Complete",
    sectors: "Culture and Education",
    description:
      "<p>One of six finalists selected for an international design competition for a Central Library and Cultural Centre in Dun Laoghaire, Ireland.</p>",
    order: 27,
  },
];

async function generatePlaceholder(filename: string): Promise<string> {
  const buffer = await sharp({
    create: {
      width: 600,
      height: 400,
      channels: 3,
      background: { r: 232, g: 230, b: 226 },
    },
  })
    .jpeg({ quality: 80 })
    .toBuffer();

  const filePath = `uploads/${filename}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(filePath, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed for ${filename}: ${error.message}`);
  }

  const { data } = supabase.storage.from("media").getPublicUrl(filePath);
  return data.publicUrl;
}

async function main() {
  for (const project of projects) {
    const existing = await prisma.project.findUnique({
      where: { slug: project.slug },
    });

    if (existing) {
      console.log(`  Skipping "${project.title}" (already exists)`);
      continue;
    }

    const filename = `${project.slug}-placeholder.jpg`;
    console.log(`  Uploading placeholder for "${project.title}"...`);
    const imageUrl = await generatePlaceholder(filename);

    await prisma.project.create({
      data: {
        title: project.title,
        slug: project.slug,
        location: project.location,
        year: project.year,
        status: project.status,
        client: null,
        sectors: project.sectors,
        shortDescription: null,
        description: project.description,
        featured: false,
        published: true,
        images: {
          create: [{ url: imageUrl, alt: project.title, order: 0 }],
        },
      },
    });

    console.log(`  Created "${project.title}"`);
  }

  console.log("\nDone seeding remaining projects.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
