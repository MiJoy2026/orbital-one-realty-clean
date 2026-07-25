import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const TEST_PROPERTY_ID = "AP-R-TEST-001";

for (const envFile of [".env.local", ".env"]) {
  if (existsSync(envFile)) {
    loadEnvFile(envFile);
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing from both .env.local and .env. Confirm the database variable is present before running this launch cleanup."
  );
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

try {
  const reservations = await prisma.propertyReservation.deleteMany({
    where: { parcelKey: TEST_PROPERTY_ID },
  });

  const properties = await prisma.property.deleteMany({
    where: { id: TEST_PROPERTY_ID },
  });

  console.log(
    `Launch cleanup complete. Removed ${properties.count} property record(s) and ${reservations.count} reservation record(s) for ${TEST_PROPERTY_ID}.`
  );
} finally {
  await prisma.$disconnect();
}
