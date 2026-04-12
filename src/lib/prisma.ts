import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Runtime queries go through the Supabase pgbouncer pooler (port 6543)
  // which multiplexes across a small number of real Postgres connections.
  // Fall back to DIRECT_URL only if DATABASE_URL isn't set (local dev
  // without a pooler URL).
  const connectionString =
    process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "";

  // Limit pg Pool to 1 connection per serverless instance. With warm
  // function reuse via globalThis and pgbouncer on the far side, 1 is
  // plenty — more just burns Supabase's session pool budget.
  const adapter = new PrismaPg({ connectionString, max: 1 });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache on globalThis in all environments — in dev this prevents HMR
// from creating duplicate clients; in serverless production it lets
// warm function instances reuse the same client across invocations
// instead of creating a new connection pool on every import.
globalForPrisma.prisma = prisma;
