import { Prisma, type PrismaClient } from "@prisma/client";

import {
  getSelectableCityBlockByKey,
  parseCityBlockKey,
} from "./city-block-grid";
import { getPublicGeographySnapshot } from "./lunasphere-geography-store";
import {
  getSelectableRuralParcelByKey,
  parseRuralParcelKey,
  type ParcelCell,
} from "./parcel-grid";
import { prisma } from "./prisma";
import {
  getSelectableTownBlockByKey,
  parseTownBlockKey,
} from "./town-block-grid";

export const OWNED_PROPERTY_IMAGE_RENDERER_VERSION = 1;
export const OWNED_PROPERTY_TERRAIN_SOURCE = "/atlas/moon-atlas-v2.jpg";

type SnapshotOrder = {
  id: string;
  propertyId: string;
  propertyType: string;
  certificateNumber: string;
};

type SnapshotProperty = {
  id: string;
  state: string;
  city: string | null;
  town: string | null;
  type: string;
  mapX: number | null;
  mapY: number | null;
};

type SnapshotResolution = {
  cell: ParcelCell;
  contextBoundary: [number, number][];
  cityName: string | null;
  townName: string | null;
};

export type SnapshotBackfillFailure = {
  orderId: string;
  propertyId: string;
  reason: string;
};


export type SnapshotEligibility = {
  orderId: string;
  propertyId: string;
  eligible: boolean;
  reason: string | null;
};

export type SnapshotBackfillResult = {
  requestedOrderCount: number;
  existingSnapshotCount: number;
  createdSnapshotCount: number;
  failedSnapshotCount: number;
  failures: SnapshotBackfillFailure[];
  snapshotIds: string[];
};

function buildRuralExclusions(
  geography: Awaited<ReturnType<typeof getPublicGeographySnapshot>>,
  stateName: string
) {
  const normalizedState = stateName.toLowerCase();

  return [
    ...geography.settlements
      .filter(
        (settlement) =>
          settlement.stateName.toLowerCase() === normalizedState
      )
      .map((settlement) => ({
        id: settlement.id,
        boundary: settlement.boundary,
      })),
    ...geography.protectedAreas
      .filter(
        (area) => area.stateName.toLowerCase() === normalizedState
      )
      .map((area) => ({
        id: area.id,
        boundary: area.boundary,
      })),
  ];
}

function buildProtectedExclusions(
  geography: Awaited<ReturnType<typeof getPublicGeographySnapshot>>,
  stateName: string
) {
  const normalizedState = stateName.toLowerCase();

  return geography.protectedAreas
    .filter((area) => area.stateName.toLowerCase() === normalizedState)
    .map((area) => ({ id: area.id, boundary: area.boundary }));
}

function resolveSnapshotGeometry(
  order: SnapshotOrder,
  property: SnapshotProperty,
  geography: Awaited<ReturnType<typeof getPublicGeographySnapshot>>
): SnapshotResolution | null {
  const stateRegion = geography.regions.find(
    (region) => region.name.toLowerCase() === property.state.toLowerCase()
  );

  if (!stateRegion) {
    return null;
  }

  if (parseRuralParcelKey(property.id)) {
    const cell = getSelectableRuralParcelByKey(
      stateRegion.name,
      property.id,
      {
        stateBoundary: stateRegion.positions,
        excludedTerritories: buildRuralExclusions(
          geography,
          stateRegion.name
        ),
      }
    );

    return cell
      ? {
          cell,
          contextBoundary: stateRegion.positions,
          cityName: null,
          townName: null,
        }
      : null;
  }

  const parsedCity = parseCityBlockKey(property.id);

  if (parsedCity) {
    const city = geography.settlements.find(
      (settlement) =>
        settlement.kind === "city" &&
        settlement.stateName.toLowerCase() ===
          stateRegion.name.toLowerCase() &&
        settlement.territoryNumber === parsedCity.cityNumber
    );
    const cell = city
      ? getSelectableCityBlockByKey(
          city,
          property.id,
          buildProtectedExclusions(geography, stateRegion.name)
        )
      : null;

    return city && cell
      ? {
          cell,
          contextBoundary: city.boundary,
          cityName: city.name,
          townName: null,
        }
      : null;
  }

  const parsedTown = parseTownBlockKey(property.id);

  if (parsedTown) {
    const town = geography.settlements.find(
      (settlement) =>
        settlement.kind === "town" &&
        settlement.stateName.toLowerCase() ===
          stateRegion.name.toLowerCase() &&
        settlement.territoryNumber === parsedTown.townNumber
    );
    const cell = town
      ? getSelectableTownBlockByKey(
          town,
          property.id,
          buildProtectedExclusions(geography, stateRegion.name)
        )
      : null;

    return town && cell
      ? {
          cell,
          contextBoundary: town.boundary,
          cityName: null,
          townName: town.name,
        }
      : null;
  }

  void order;
  return null;
}

export async function inspectOwnedPropertySnapshotEligibilityForOrderIds(
  orderIds: string[],
  client: PrismaClient = prisma
): Promise<SnapshotEligibility[]> {
  const uniqueOrderIds = Array.from(
    new Set(orderIds.map((orderId) => orderId.trim()).filter(Boolean))
  );

  if (uniqueOrderIds.length === 0) {
    return [];
  }

  const orders = await client.order.findMany({
    where: { id: { in: uniqueOrderIds } },
    select: {
      id: true,
      propertyId: true,
      propertyType: true,
      certificateNumber: true,
    },
  });
  const properties = await client.property.findMany({
    where: { id: { in: orders.map((order) => order.propertyId) } },
    select: {
      id: true,
      state: true,
      city: true,
      town: true,
      type: true,
      mapX: true,
      mapY: true,
    },
  });
  const propertyById = new Map(
    properties.map((property) => [property.id, property])
  );
  const geography = await getPublicGeographySnapshot(client);

  return orders.map((order) => {
    const property = propertyById.get(order.propertyId);

    if (!property) {
      return {
        orderId: order.id,
        propertyId: order.propertyId,
        eligible: false,
        reason: "The permanent property record could not be found.",
      };
    }

    const resolved = resolveSnapshotGeometry(order, property, geography);

    return resolved
      ? {
          orderId: order.id,
          propertyId: order.propertyId,
          eligible: true,
          reason: null,
        }
      : {
          orderId: order.id,
          propertyId: order.propertyId,
          eligible: false,
          reason:
            "Historical Grid V2 sale from a prior geography release; no current selectable geometry is available.",
        };
  });
}

function createGridCoordinates(cell: ParcelCell): Prisma.InputJsonObject {
  return {
    column: cell.column,
    row: cell.row,
    ...(cell.planningColumn !== undefined
      ? { planningColumn: cell.planningColumn }
      : {}),
    ...(cell.planningRow !== undefined
      ? { planningRow: cell.planningRow }
      : {}),
    ...(cell.subdivisionColumn !== undefined
      ? { subdivisionColumn: cell.subdivisionColumn }
      : {}),
    ...(cell.subdivisionRow !== undefined
      ? { subdivisionRow: cell.subdivisionRow }
      : {}),
    ...(cell.gridVersion !== undefined
      ? { gridVersion: cell.gridVersion }
      : {}),
  };
}

export async function ensureOwnedPropertySnapshotsForOrderIds(
  orderIds: string[],
  client: PrismaClient = prisma
): Promise<SnapshotBackfillResult> {
  const uniqueOrderIds = Array.from(
    new Set(orderIds.map((orderId) => orderId.trim()).filter(Boolean))
  );

  if (uniqueOrderIds.length === 0) {
    return {
      requestedOrderCount: 0,
      existingSnapshotCount: 0,
      createdSnapshotCount: 0,
      failedSnapshotCount: 0,
      failures: [],
      snapshotIds: [],
    };
  }

  const orders = await client.order.findMany({
    where: {
      id: { in: uniqueOrderIds },
      paymentStatus: { equals: "Paid", mode: "insensitive" },
    },
    select: {
      id: true,
      propertyId: true,
      propertyType: true,
      certificateNumber: true,
    },
  });
  const existingSnapshots = await client.ownedPropertySnapshot.findMany({
    where: { orderId: { in: orders.map((order) => order.id) } },
    select: { id: true, orderId: true },
  });
  const existingByOrder = new Map(
    existingSnapshots.map((snapshot) => [snapshot.orderId, snapshot])
  );
  const missingOrders = orders.filter(
    (order) => !existingByOrder.has(order.id)
  );

  if (missingOrders.length === 0) {
    return {
      requestedOrderCount: uniqueOrderIds.length,
      existingSnapshotCount: existingSnapshots.length,
      createdSnapshotCount: 0,
      failedSnapshotCount: 0,
      failures: [],
      snapshotIds: existingSnapshots.map((snapshot) => snapshot.id),
    };
  }

  const properties = await client.property.findMany({
    where: {
      id: { in: missingOrders.map((order) => order.propertyId) },
    },
    select: {
      id: true,
      state: true,
      city: true,
      town: true,
      type: true,
      mapX: true,
      mapY: true,
    },
  });
  const propertyById = new Map(
    properties.map((property) => [property.id, property])
  );
  const geography = await getPublicGeographySnapshot(client);
  const failures: SnapshotBackfillFailure[] = [];
  const snapshotIds = existingSnapshots.map((snapshot) => snapshot.id);
  let createdSnapshotCount = 0;

  for (const order of missingOrders) {
    const property = propertyById.get(order.propertyId);

    if (!property) {
      failures.push({
        orderId: order.id,
        propertyId: order.propertyId,
        reason: "The permanent property record could not be found.",
      });
      continue;
    }

    const resolved = resolveSnapshotGeometry(order, property, geography);

    if (!resolved) {
      failures.push({
        orderId: order.id,
        propertyId: order.propertyId,
        reason:
          "The property is not a selectable Grid V2 property in the active geography.",
      });
      continue;
    }

    const { cell } = resolved;
    const cityName = resolved.cityName ?? property.city;
    const townName = resolved.townName ?? property.town;
    const locationLabel = [cityName, townName, property.state]
      .filter(Boolean)
      .join(" • ");

    try {
      const snapshot = await client.ownedPropertySnapshot.create({
        data: {
          orderId: order.id,
          propertyId: property.id,
          certificateNumber: order.certificateNumber,
          propertyType: order.propertyType,
          stateName: property.state,
          cityName,
          townName,
          locationLabel,
          geographySource: geography.source,
          geographyReleaseNumber: geography.activeReleaseNumber,
          geographyLabel: geography.frozenGeographyLabel,
          geographyFrozenAt: geography.frozenAt
            ? new Date(geography.frozenAt)
            : null,
          inventoryGridVersion: geography.inventoryGridVersion,
          inventorySubdivisionFactor:
            geography.inventorySubdivisionFactor,
          imageRendererVersion: OWNED_PROPERTY_IMAGE_RENDERER_VERSION,
          terrainImageSource: OWNED_PROPERTY_TERRAIN_SOURCE,
          centerX: cell.centerX,
          centerY: cell.centerY,
          minimumX: cell.mapX,
          minimumY: cell.mapY,
          maximumX: cell.mapX + cell.width,
          maximumY: cell.mapY + cell.height,
          propertyWidth: cell.width,
          propertyHeight: cell.height,
          polygon: cell.positions,
          contextBoundary: resolved.contextBoundary,
          gridCoordinates: createGridCoordinates(cell),
        },
        select: { id: true },
      });

      snapshotIds.push(snapshot.id);
      createdSnapshotCount += 1;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await client.ownedPropertySnapshot.findUnique({
          where: { orderId: order.id },
          select: { id: true },
        });

        if (existing) {
          snapshotIds.push(existing.id);
          continue;
        }
      }

      failures.push({
        orderId: order.id,
        propertyId: order.propertyId,
        reason:
          error instanceof Error
            ? error.message
            : "The property snapshot could not be saved.",
      });
    }
  }

  return {
    requestedOrderCount: uniqueOrderIds.length,
    existingSnapshotCount: existingSnapshots.length,
    createdSnapshotCount,
    failedSnapshotCount: failures.length,
    failures,
    snapshotIds,
  };
}

export async function backfillMissingOwnedPropertySnapshots(
  limit = 100,
  client: PrismaClient = prisma
): Promise<SnapshotBackfillResult> {
  const orders = await client.order.findMany({
    where: {
      paymentStatus: { equals: "Paid", mode: "insensitive" },
      propertySnapshot: { is: null },
    },
    orderBy: { createdAt: "asc" },
    take: Math.max(1, Math.min(limit, 250)),
    select: { id: true },
  });
  const eligibility = await inspectOwnedPropertySnapshotEligibilityForOrderIds(
    orders.map((order) => order.id),
    client
  );
  const eligibleOrderIds = eligibility
    .filter((item) => item.eligible)
    .map((item) => item.orderId);

  return ensureOwnedPropertySnapshotsForOrderIds(eligibleOrderIds, client);
}
