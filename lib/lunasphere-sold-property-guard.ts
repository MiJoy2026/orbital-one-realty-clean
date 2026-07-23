import { type Prisma, type PrismaClient } from "@prisma/client";

import {
  getSelectableCityBlockByKey,
  parseCityBlockKey,
} from "./city-block-grid";
import {
  getSelectableRuralParcelByKey,
  parseRuralParcelKey,
  type ParcelExclusionTerritory,
} from "./parcel-grid";
import {
  resolveProtectedAreasForState,
  type ResolvedLunaSphereProtectedArea,
} from "./lunasphere-protected-areas";
import type {
  PublicLunaSphereProtectedArea,
  PublicLunaSphereSettlement,
} from "./lunasphere-public-geography";
import {
  resolveStateTerritories,
  type ResolvedLunaSphereSettlement,
} from "./lunasphere-territories";
import type { LunaSphereGeographyDocument } from "./lunasphere-geography-document";
import {
  getSelectableTownBlockByKey,
  parseTownBlockKey,
} from "./town-block-grid";

const SOLD_PROPERTY_POSITION_TOLERANCE = 0.000001;
const MAX_REPORTED_ISSUES = 25;

type GuardClient = PrismaClient | Prisma.TransactionClient;

export type SoldPropertyGuardIssue = {
  propertyId: string;
  code:
    | "SOLD_PROPERTY_NOT_IN_GEOGRAPHY"
    | "SOLD_PROPERTY_POSITION_MISSING"
    | "SOLD_PROPERTY_MOVED";
  message: string;
};

export type SoldPropertyGuardReport = {
  checkedPropertyCount: number;
  protectedPropertyCount: number;
  valid: boolean;
  issueCount: number;
  issues: SoldPropertyGuardIssue[];
};

function toPublicSettlement(
  settlement: ResolvedLunaSphereSettlement
): PublicLunaSphereSettlement {
  return {
    id: settlement.id,
    stateId: settlement.stateId,
    stateName: settlement.stateName,
    stateNumber: settlement.stateNumber,
    kind: settlement.kind,
    territoryNumber: settlement.territoryNumber,
    name: settlement.name,
    slug: settlement.slug,
    center: [settlement.center[0], settlement.center[1]],
    boundary: settlement.boundary.map(
      ([y, x]) => [y, x] as [number, number]
    ),
  };
}

function toPublicProtectedArea(
  area: ResolvedLunaSphereProtectedArea
): PublicLunaSphereProtectedArea {
  return {
    id: area.id,
    stateId: area.stateId,
    stateName: area.stateName,
    stateNumber: area.stateNumber,
    name: area.name,
    slug: area.slug,
    category: area.category,
    description: area.description,
    attractionId: area.attractionId,
    center: [area.center[0], area.center[1]],
    boundary: area.boundary.map(
      ([y, x]) => [y, x] as [number, number]
    ),
    minZoom: area.minZoom,
  };
}

function toExclusionTerritory(input: {
  id: string;
  boundary: readonly [number, number][];
}): ParcelExclusionTerritory {
  return {
    id: input.id,
    boundary: input.boundary,
  };
}

type StateGuardGeometry = {
  stateBoundary: readonly [number, number][];
  cities: PublicLunaSphereSettlement[];
  towns: PublicLunaSphereSettlement[];
  protectedExclusions: ParcelExclusionTerritory[];
  ruralExclusions: ParcelExclusionTerritory[];
};

function buildStateGeometry(
  geography: LunaSphereGeographyDocument
): Map<string, StateGuardGeometry> {
  const geometryByState = new Map<string, StateGuardGeometry>();

  for (const topologyState of geography.topology.states) {
    const resolved = resolveStateTerritories(
      geography.topology,
      geography.territories,
      topologyState.name
    );

    if (!resolved) {
      continue;
    }

    const cities = resolved.cities.map(toPublicSettlement);
    const towns = resolved.towns.map(toPublicSettlement);
    const protectedAreas = resolveProtectedAreasForState(
      geography.topology,
      geography.protectedAreas,
      topologyState.name
    ).map(toPublicProtectedArea);
    const protectedExclusions = protectedAreas.map(
      toExclusionTerritory
    );

    geometryByState.set(topologyState.name, {
      stateBoundary: resolved.stateBoundary,
      cities,
      towns,
      protectedExclusions,
      ruralExclusions: [
        ...cities.map(toExclusionTerritory),
        ...towns.map(toExclusionTerritory),
        ...protectedExclusions,
      ],
    });
  }

  return geometryByState;
}

function centersMatch(
  storedX: number,
  storedY: number,
  candidateX: number,
  candidateY: number
): boolean {
  return (
    Math.abs(storedX - candidateX) <=
      SOLD_PROPERTY_POSITION_TOLERANCE &&
    Math.abs(storedY - candidateY) <=
      SOLD_PROPERTY_POSITION_TOLERANCE
  );
}

/**
 * Ensures every sold Grid V2 property remains selectable at exactly the same
 * map center in a candidate geography. Legacy property IDs are intentionally
 * ignored because they are not part of the permanent Grid V2 launch inventory.
 */
export async function validateSoldPropertiesAgainstGeography(
  geography: LunaSphereGeographyDocument,
  client: GuardClient
): Promise<SoldPropertyGuardReport> {
  const soldProperties = await client.property.findMany({
    where: { status: "Sold" },
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
  const geometryByState = buildStateGeometry(geography);
  const issues: SoldPropertyGuardIssue[] = [];
  let protectedPropertyCount = 0;
  let issueCount = 0;

  for (const property of soldProperties) {
    const isRural = parseRuralParcelKey(property.id) !== null;
    const isCity = parseCityBlockKey(property.id) !== null;
    const isTown = parseTownBlockKey(property.id) !== null;

    if (!isRural && !isCity && !isTown) {
      continue;
    }

    protectedPropertyCount += 1;
    const stateGeometry = geometryByState.get(property.state);
    let candidate:
      | { centerX: number; centerY: number }
      | null = null;

    if (stateGeometry && isRural) {
      candidate = getSelectableRuralParcelByKey(
        property.state,
        property.id,
        {
          stateBoundary: stateGeometry.stateBoundary,
          excludedTerritories: stateGeometry.ruralExclusions,
        }
      );
    } else if (stateGeometry && isCity) {
      const city = stateGeometry.cities.find(
        (item) => item.name === property.city
      );

      candidate = city
        ? getSelectableCityBlockByKey(
            city,
            property.id,
            stateGeometry.protectedExclusions
          )
        : null;
    } else if (stateGeometry && isTown) {
      const town = stateGeometry.towns.find(
        (item) => item.name === property.town
      );

      candidate = town
        ? getSelectableTownBlockByKey(
            town,
            property.id,
            stateGeometry.protectedExclusions
          )
        : null;
    }

    if (!candidate) {
      issueCount += 1;
      if (issues.length < MAX_REPORTED_ISSUES) {
        issues.push({
          propertyId: property.id,
          code: "SOLD_PROPERTY_NOT_IN_GEOGRAPHY",
          message: `${property.id} would no longer be a selectable ${property.type}.`,
        });
      }
      continue;
    }

    if (property.mapX === null || property.mapY === null) {
      issueCount += 1;
      if (issues.length < MAX_REPORTED_ISSUES) {
        issues.push({
          propertyId: property.id,
          code: "SOLD_PROPERTY_POSITION_MISSING",
          message: `${property.id} has no permanent stored map center to compare.`,
        });
      }
      continue;
    }

    if (
      !centersMatch(
        property.mapX,
        property.mapY,
        candidate.centerX,
        candidate.centerY
      )
    ) {
      issueCount += 1;
      if (issues.length < MAX_REPORTED_ISSUES) {
        issues.push({
          propertyId: property.id,
          code: "SOLD_PROPERTY_MOVED",
          message: `${property.id} would move from (${property.mapX.toFixed(6)}, ${property.mapY.toFixed(6)}) to (${candidate.centerX.toFixed(6)}, ${candidate.centerY.toFixed(6)}).`,
        });
      }
    }
  }

  return {
    checkedPropertyCount: soldProperties.length,
    protectedPropertyCount,
    valid: issueCount === 0,
    issueCount,
    issues,
  };
}
