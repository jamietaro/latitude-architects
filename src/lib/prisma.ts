import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString =
    process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache on globalThis in all environments — in dev this prevents HMR
// from creating duplicate clients; in serverless production it lets
// warm function instances reuse the same client across invocations
// instead of creating a new connection pool on every import.
globalForPrisma.prisma = prisma;
