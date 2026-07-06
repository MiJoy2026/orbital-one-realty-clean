import "dotenv/config";
import { prisma } from "../lib/prisma";

function coordinateFromText(text: string) {
  let hash = 0;

  for (let index = 0; index < text.length; index++) {
    hash = (hash * 31 + text.charCodeAt(index)) % 100000;
  }

  const x = 120 + (hash % 760);
  const y = 120 + ((hash * 7) % 760);

  return { x, y };
}

async function main() {
  console.log("Assigning property locations...");

  const properties = await prisma.property.findMany({
    orderBy: { id: "asc" },
  });

  for (const property of properties) {
    const cities = await prisma.lunarCity.findMany({
      where: { stateName: property.state },
      orderBy: { name: "asc" },
    });

    const towns = await prisma.lunarTown.findMany({
      where: { stateName: property.state },
      orderBy: { name: "asc" },
    });

    const seed = property.id
      .split("")
      .reduce((sum, character) => sum + character.charCodeAt(0), 0);

    const selectedCity =
      property.type === "City Block" && cities.length > 0
        ? cities[seed % cities.length]?.name
        : null;

    const selectedTown =
      property.type === "Town Block" && towns.length > 0
        ? towns[seed % towns.length]?.name
        : property.type === "Rural Acre" && towns.length > 0
          ? towns[seed % towns.length]?.name
          : null;

    const coordinates = coordinateFromText(
      `${property.id}-${property.state}-${selectedCity || ""}-${selectedTown || ""}`
    );

    await prisma.property.update({
      where: { id: property.id },
      data: {
        city: selectedCity,
        town: selectedTown,
        mapX: coordinates.x,
        mapY: coordinates.y,
      },
    });

    console.log(
      `${property.id}: ${property.state} / ${selectedCity || "No City"} / ${
        selectedTown || "No Town"
      }`
    );
  }

  console.log("Property locations assigned successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});