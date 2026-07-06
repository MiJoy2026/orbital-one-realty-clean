import { prisma } from "./prisma";

export async function getAllPropertiesWithCoordinates() {
  return prisma.property.findMany({
    orderBy: { id: "asc" },
  });
}

export async function getPropertyById(propertyId: string) {
  return prisma.property.findFirst({
    where: {
      id: {
        equals: propertyId,
        mode: "insensitive",
      },
    },
  });
}

export async function getNearbyProperties(propertyId: string, limit = 5) {
  const selectedProperty = await getPropertyById(propertyId);

  if (!selectedProperty) {
    return [];
  }

  return prisma.property.findMany({
    where: {
      id: {
        not: selectedProperty.id,
      },
      state: selectedProperty.state,
    },
    orderBy: {
      id: "asc",
    },
    take: limit,
  });
}

export async function getPropertiesByState(stateName: string) {
  return prisma.property.findMany({
    where: {
      state: {
        equals: stateName,
        mode: "insensitive",
      },
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getPropertyCountsByState() {
  const properties = await prisma.property.findMany();

  return properties.reduce<
    Record<
      string,
      {
        total: number;
        available: number;
        sold: number;
      }
    >
  >((result, property) => {
    if (!result[property.state]) {
      result[property.state] = {
        total: 0,
        available: 0,
        sold: 0,
      };
    }

    result[property.state].total++;

    if (property.status === "Available") {
      result[property.state].available++;
    } else {
      result[property.state].sold++;
    }

    return result;
  }, {});
}