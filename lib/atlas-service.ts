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

export function getLunarCityMatches(cityName: string) {
  const normalizedCityName = cityName.trim().toLowerCase();

  return Object.entries(lunarStateDetails).flatMap(
    ([stateName, stateDetails]) =>
      stateDetails.cities
        .filter((city) => city.name.toLowerCase() === normalizedCityName)
        .map((city) => ({
          ...city,
          state: { name: stateName },
        }))
  );
}

export async function getLunarCityByName(
  cityName: string,
  stateName?: string
) {
  const matches = getLunarCityMatches(cityName);

  if (!stateName) {
    return matches[0] ?? null;
  }

  const normalizedStateName = stateName.trim().toLowerCase();

  return (
    matches.find(
      (city) => city.state.name.toLowerCase() === normalizedStateName
    ) ?? null
  );
}

export function getLunarTownMatches(townName: string) {
  const normalizedTownName = townName.trim().toLowerCase();

  return Object.entries(lunarStateDetails).flatMap(
    ([stateName, stateDetails]) =>
      stateDetails.towns
        .filter((town) => town.name.toLowerCase() === normalizedTownName)
        .map((town) => ({
          ...town,
          state: { name: stateName },
        }))
  );
}

export async function getLunarTownByName(
  townName: string,
  stateName?: string
) {
  const matches = getLunarTownMatches(townName);

  if (!stateName) {
    return matches[0] ?? null;
  }

  const normalizedStateName = stateName.trim().toLowerCase();

  return (
    matches.find(
      (town) => town.state.name.toLowerCase() === normalizedStateName
    ) ?? null
  );
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

export async function getPropertiesByCity(
  cityName: string,
  stateName?: string
) {
  const city = await getLunarCityByName(cityName, stateName);

  if (!city) {
    return [];
  }

  return prisma.property.findMany({
    where: {
      city: city.name,
      state: city.state.name,
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getPropertiesByTown(
  townName: string,
  stateName?: string
) {
  const town = await getLunarTownByName(townName, stateName);

  if (!town) {
    return [];
  }

  return prisma.property.findMany({
    where: {
      town: town.name,
      state: town.state.name,
    },
    orderBy: {
      id: "asc",
    },
  });
}
