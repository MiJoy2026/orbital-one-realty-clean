import "dotenv/config";
import { prisma } from "../lib/prisma";
import { lunarAtlasStates } from "../lib/lunarAtlas";

async function main() {
  console.log("Seeding Orbital One Lunar Atlas...");

  for (const state of lunarAtlasStates) {
    console.log(`Seeding ${state.name}...`);
    await prisma.lunarState.upsert({
      where: { name: state.name },
      update: {
        theme: state.theme,
        description: state.description,
      },
      create: {
        name: state.name,
        theme: state.theme,
        description: state.description,
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

  console.log("Lunar Atlas seeded successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});