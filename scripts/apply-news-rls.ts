// One-off: enable RLS + service_role policy on the new NewsItem tables.
// Mirrors scripts/enable-rls.sql (the canonical record). Idempotent.
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const tables = ["NewsItem", "NewsItemImage"];

async function main() {
  for (const t of tables) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "${t}" ENABLE ROW LEVEL SECURITY;`
    );
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE tablename = '${t}' AND policyname = 'service_role_full_access'
        ) THEN
          CREATE POLICY "service_role_full_access" ON "${t}"
            FOR ALL TO service_role USING (true) WITH CHECK (true);
        END IF;
      END$$;
    `);
    console.log(`RLS ensured on ${t}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
