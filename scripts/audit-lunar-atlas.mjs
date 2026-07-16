import "dotenv/config";

import { prisma } from "../lib/prisma.ts";
import { lunarStates } from "../lib/moon-data.ts";

async function main() {
  const expectedStateNames = new Set(
    lunarStates.map((state) => state.name)
  );

  const databaseStates = await prisma.lunarState.findMany({
    select: {
      name: true,
      _count: {
        select: {
          cities: true,
          towns: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const unexpectedStates = databaseStates.filter(
    (state) => !expectedStateNames.has(state.name)
  );

  const missingStates = lunarStates.filter(
    (state) =>
      !databaseStates.some(
        (databaseState) => databaseState.name === state.name
      )
  );

  console.log("");
  console.log("Orbital One Lunar Atlas Audit");
  console.log("--------------------------------");
  console.log(`Expected live states: ${lunarStates.length}`);
  console.log(`Database states: ${databaseStates.length}`);
  console.log(`Missing live states: ${missingStates.length}`);
  console.log(`Unexpected legacy states: ${unexpectedStates.length}`);

  if (missingStates.length > 0) {
    console.log("");
    console.log("Missing states:");
    for (const state of missingStates) {
      console.log(`- ${state.name}`);
    }
  }

  if (unexpectedStates.length > 0) {
    console.log("");
    console.log("Unexpected or legacy states:");
    for (const state of unexpectedStates) {
      console.log(
        `- ${state.name} (${state._count.cities} cities, ${state._count.towns} towns)`
      );
    }
  }

  if (unexpectedStates.length === 0 && missingStates.length === 0) {
    console.log("");
    console.log("The database state list matches the live atlas.");
  }
}

main()
  .catch((error) => {
    console.error("");
    console.error("Atlas audit failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });