import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // In production (Vercel serverless) route runtime queries through
  // the Supabase pgbouncer pooler (port 6543) with max: 1 — warm
  // instances reuse via globalThis and pgbouncer multiplexes on the
  // far side.
  //
  // In development prefer the DIRECT_URL (port 5432). Local HMR
  // churns through PrismaClient instances faster than we can dispose
  // them; a single pooled connection gets starved and requests hang
  // waiting for the pool. A direct connection avoids that entirely.
  const isProduction = process.env.NODE_ENV === "production";

  const connectionString = isProduction
    ? process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? ""
    : process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

  const adapter = isProduction
    ? new PrismaPg({ connectionString, max: 1 })
    : new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache on globalThis in all environments — in dev this prevents HMR
// from creating duplicate clients; in serverless production it lets
// warm function instances reuse the same client across invocations
// instead of creating a new connection pool on every import.
globalForPrisma.prisma = prisma;
