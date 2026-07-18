import { prisma } from "./prisma";
import { lunarStateDetails } from "./lunar-state-details";

export async function getAllLunarStates() {
  return prisma.lunarState.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getLunarStateByName(stateName: string) {
  return prisma.lunarState.findFirst({
    where: {
      name: {
        equals: stateName,
        mode: "insensitive",
      },
    },
    include: {
      cities: { orderBy: { name: "asc" } },
      towns: { orderBy: { name: "asc" } },
    },
  });
}

export async function getLunarCityByName(cityName: string) {
  const normalizedCityName = cityName.trim().toLowerCase();

  for (const [stateName, stateDetails] of Object.entries(
    lunarStateDetails
  )) {
    const officialCity = stateDetails.cities.find(
     (city) => city.name.toLowerCase() === normalizedCityName
    );

    if (officialCity) {
      return {
        ...officialCity,
          state: {
          name: stateName,
        },
      };
    }
  }

  return null;
}

export async function getLunarTownByName(townName: string) {
  const normalizedTownName = townName.trim().toLowerCase();

  for (const [stateName, stateDetails] of Object.entries(
    lunarStateDetails
  )) {
    const officialTown = stateDetails.towns.find(
      (town) => town.name.toLowerCase() === normalizedTownName
    );

    if (officialTown) {
      return {
        ...officialTown,
        state: {
          name: stateName,
        },
      };
    }
  }

  return null;
}

export async function getPropertyByIdFromDb(propertyId: string) {
  return prisma.property.findUnique({
    where: { id: propertyId },
  });
}

export async function getPropertiesByState(stateName: string) {
  return prisma.property.findMany({
    where: { state: stateName },
    orderBy: { id: "asc" },
  });
}

export async function getPropertiesByCity(cityName: string) {
  const city = await getLunarCityByName(cityName);

  if (!city) {
    return [];
  }

  return prisma.property.findMany({
    where: {
      city: city.name,
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getPropertiesByTown(townName: string) {
  const town = await getLunarTownByName(townName);

  if (!town) {
    return [];
  }

  return prisma.property.findMany({
    where: {
      town: town.name,
    },
    orderBy: {
      id: "asc",
    },
  });
}