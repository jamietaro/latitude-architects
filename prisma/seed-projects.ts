import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const projects = [
  {
    title: "The Lighthouse",
    slug: "the-lighthouse",
    location: "London WC1X",
    year: 2007,
    status: "Complete",
    sectors: "Offices,Historic Buildings",
    description:
      "<p>The change of use and reconstruction behind the existing facade of a Grade II landmark building in London's Kings Cross providing office and retail use, with a new floor of offices under a stepping vaulted zinc roof. The building is built directly on two underground train tunnels, creating significant design and construction challenges.</p>",
    order: 1,
  },
  {
    title: "King's Cross Bridge",
    slug: "kings-cross-bridge",
    location: "London WC1X",
    year: 2012,
    status: "Complete",
    sectors: "Offices,Mixed Use",
    description:
      "<p>This new office and retail building completes the urban block shared with The Lighthouse in front of King's Cross station. Sharing the design challenges of being over two Underground tunnels the scheme is a lightweight structure that respects the height and rhythm of the listed Lighthouse building.</p>",
    order: 2,
  },
  {
    title: "55\u201373 Duke Street",
    slug: "55-73-duke-street",
    location: "London W1K",
    year: 2008,
    status: "Complete",
    client: "Grosvenor",
    sectors: "Residential,Historic Buildings",
    description:
      "<p>A mixed use development of 16 lateral apartments and 4 duplex retail units in the heart of Mayfair. The existing Grade II listed buildings were converted from commercial to residential use with sensitive yet contemporary interventions within the existing fabric. The scheme also involves enhancements to the public realm, and was granted planning and listed buildings consent in May 2009.</p>",
    order: 3,
  },
  {
    title: "90\u2013104 Berwick Street",
    slug: "90-104-berwick-street",
    location: "London W1",
    year: 2011,
    status: "Complete",
    sectors: "Residential,Mixed Use",
    description:
      "<p>A mixed use development including 12 private residential units ranging from studios to 3 bedroom apartments, and 4 affordable 3 bedroom apartments. The apartments sit within a brick frame with metal and glass panel elements whose irregularity, together with the recessed balconies, provide a variety of depth to the elevation.</p>",
    order: 4,
  },
  {
    title: "Bowback House",
    slug: "bowback-house",
    location: "Milton Keynes MK9",
    year: 2018,
    status: "Complete",
    sectors: "Residential",
    description:
      "<p>A 306 unit Build to Rent scheme in the centre of Milton Keynes.</p>",
    order: 5,
  },
  {
    title: "30 North Audley Street",
    slug: "30-north-audley-street",
    location: "London W1K",
    year: 2009,
    status: "Complete",
    sectors: "Residential,Interiors",
    description:
      "<p>The conversion and extension of the upper levels of an existing office building to form 9 apartments over 5 floors including 3 triplex apartments. The ground floor and basement levels are remodelled to become a single restaurant. The brief was to set a new benchmark of quality in North Mayfair residential property. Shortlisted for the New London Architecture 2012 Conservation and Retrofit award.</p>",
    order: 6,
  },
  {
    title: "21 St Georges Road",
    slug: "21-st-georges-road",
    location: "Elephant and Castle",
    year: 2021,
    status: "Planning Consent",
    sectors: "Mixed Use",
    description:
      "<p>A mixed-use development consisting of an 89 room hotel, 505m2 of office space and 110m2 restaurant within the Elephant and Castle town centre. Planning consent granted April 2023.</p>",
    order: 7,
  },
  {
    title: "35 Cosway Street",
    slug: "35-cosway-street",
    location: "London NW1",
    year: 2015,
    status: "Complete",
    sectors: "Culture and Education,Historic Buildings",
    description:
      "<p>Latitude has been granted planning and listed building consent for the conversion of the deconsecrated Christ Church in Marylebone, London into a multi purpose sports centre. The Grade II* listed building will house the headquarters of the charity and will accommodate volleyball and judo but be primarily used for table tennis coaching and tournaments.</p>",
    order: 8,
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
        client: project.client ?? null,
        sectors: project.sectors,
        shortDescription: null,
        description: project.description,
        featured: true,
        published: true,
        order: project.order,
        images: {
          create: [{ url: imageUrl, alt: project.title, order: 0 }],
        },
      },
    });

    console.log(`  Created "${project.title}"`);
  }

  console.log("\nDone seeding projects.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
