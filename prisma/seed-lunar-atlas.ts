import "dotenv/config";

import { prisma } from "../lib/prisma";
import { lunarStates } from "../lib/moon-data";
import { lunarStateDetails } from "../lib/lunar-state-details";

async function main() {
  console.log("Syncing the live Orbital One lunar atlas...");

  for (const state of lunarStates) {
    const details = lunarStateDetails[state.name];

    console.log(`Syncing ${state.name}...`);

    await prisma.lunarState.upsert({
      where: {
        name: state.name,
      },
      update: {
        theme: details?.nickname ?? null,
        description:
          details?.description ??
          `${state.name} is part of the official Orbital One Realty lunar atlas.`,
      },
      create: {
        name: state.name,
        theme: details?.nickname ?? null,
        description:
          details?.description ??
          `${state.name} is part of the official Orbital One Realty lunar atlas.`,
      },
    });

    for (const city of state.cities) {
      await prisma.lunarCity.upsert({
        where: {
          name_stateName: {
            name: city,
            stateName: state.name,
          },
        },
        update: {},
        create: {
          name: city,
          stateName: state.name,
        },
      });
    }

    for (const town of state.towns) {
      await prisma.lunarTown.upsert({
        where: {
          name_stateName: {
            name: town,
            stateName: state.name,
          },
        },
        update: {},
        create: {
          name: town,
          stateName: state.name,
        },
      });
    }
  }

  const stateCount = await prisma.lunarState.count();
  const cityCount = await prisma.lunarCity.count();
  const townCount = await prisma.lunarTown.count();

  console.log("");
  console.log("Live atlas synchronization completed.");
  console.log(`Database states: ${stateCount}`);
  console.log(`Database cities: ${cityCount}`);
  console.log(`Database towns: ${townCount}`);
}

main()
  .catch((error) => {
    console.error("Atlas synchronization failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });