import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const michael = await prisma.teamMember.findUnique({
    where: { slug: "michael-griffiths" },
  });
  const andrew = await prisma.teamMember.findUnique({
    where: { slug: "andrew-gilbert" },
  });

  if (!michael || !andrew) {
    throw new Error(
      `Missing team member(s): michael=${!!michael}, andrew=${!!andrew}`
    );
  }

  console.log(
    `Before: michael.order=${michael.order}, andrew.order=${andrew.order}`
  );

  const michaelOrder = michael.order;
  const andrewOrder = andrew.order;

  await prisma.teamMember.update({
    where: { id: michael.id },
    data: { order: andrewOrder },
  });
  await prisma.teamMember.update({
    where: { id: andrew.id },
    data: { order: michaelOrder },
  });

  const m2 = await prisma.teamMember.findUnique({
    where: { slug: "michael-griffiths" },
  });
  const a2 = await prisma.teamMember.findUnique({
    where: { slug: "andrew-gilbert" },
  });
  console.log(
    `After:  michael.order=${m2!.order}, andrew.order=${a2!.order}`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
