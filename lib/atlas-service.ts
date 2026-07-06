import { prisma } from "./prisma";

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
  return prisma.lunarCity.findFirst({
    where: {
      name: {
        equals: cityName,
        mode: "insensitive",
      },
    },
    include: {
      state: true,
    },
  });
}

export async function getLunarTownByName(townName: string) {
  return prisma.lunarTown.findFirst({
    where: {
      name: {
        equals: townName,
        mode: "insensitive",
      },
    },
    include: {
      state: true,
    },
  });
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
  return prisma.property.findMany({
    where: { city: cityName },
    orderBy: { id: "asc" },
  });
}

export async function getPropertiesByTown(townName: string) {
  return prisma.property.findMany({
    where: { town: townName },
    orderBy: { id: "asc" },
  });
}