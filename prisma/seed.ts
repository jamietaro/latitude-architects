import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("latitude2025", 12);

  await prisma.adminUser.upsert({
    where: { email: "admin@latitudearchitects.com" },
    update: {},
    create: {
      email: "admin@latitudearchitects.com",
      passwordHash,
    },
  });

  console.warn(
    "\n⚠️  WARNING: Default admin user created with email admin@latitudearchitects.com\n" +
      "⚠️  CHANGE THIS PASSWORD IMMEDIATELY after first login!\n"
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
