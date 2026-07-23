import { countSelectableCityBlocks } from "./city-block-grid";
import {
  validateGeographyDocument,
  type LunaSphereGeographyDocument,
} from "./lunasphere-geography-document";
import {
  resolveProtectedAreasForState,
  type ResolvedLunaSphereProtectedArea,
} from "./lunasphere-protected-areas";
import type {
  PublicLunaSphereProtectedArea,
  PublicLunaSphereSettlement,
} from "./lunasphere-public-geography";
import {
  countSelectableRuralParcels,
  type ParcelExclusionTerritory,
} from "./parcel-grid";
import {
  resolveStateTerritories,
  type ResolvedLunaSphereSettlement,
} from "./lunasphere-territories";
import { getStateEdges } from "./lunasphere-topology";
import {
  LUNASPHERE_INVENTORY_GRID_VERSION,
  LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR,
} from "./inventory-grid";
import { countSelectableTownBlocks } from "./town-block-grid";

export type GeographyReadinessStatus =
  | "ready"
  | "review"
  | "blocked";

export type GeographyDiagnosticIssue = {
  severity: "error" | "warning" | "information";
  code: string;
  message: string;
};

export type StateGeographyDiagnostic = {
  stateId: string;
  stateNumber: number;
  stateName: string;
  status: GeographyReadinessStatus;
  stateArea: number;
  ruralCoverage: number;
  sharedBorderCount: number;
  perimeterBorderCount: number;
  straightSharedBorderCount: number;
  borderControlPointCount: number;
  cityCount: number;
  townCount: number;
  protectedAreaCount: number;
  ruralParcelCount: number;
  cityBlockCount: number;
  minimumCityBlockCount: number;
  townBlockCount: number;
  minimumTownBlockCount: number;
  issues: GeographyDiagnosticIssue[];
};

export type GeographyReadinessReport = {
  format: "lunasphere-geography-readiness-report";
  schemaVersion: 2;
  generatedAt: string;
  inventoryGridVersion: number;
  inventorySubdivisionFactor: number;
  worldId: string;
  worldVersion: string;
  topologyRevision: number;
  territoryRevision: number;
  protectedAreaRevision: number;
  status: GeographyReadinessStatus;
  readyStateCount: number;
  reviewStateCount: number;
  blockedStateCount: number;
  totalRuralParcels: number;
  totalCityBlocks: number;
  totalTownBlocks: number;
  totalSaleableProperties: number;
  totalProtectedAreas: number;
  globalIssues: GeographyDiagnosticIssue[];
  states: StateGeographyDiagnostic[];
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

function minimum(values: readonly number[]): number {
  return values.length > 0 ? Math.min(...values) : 0;
}

function createStateDiagnostic(
  geography: LunaSphereGeographyDocument,
  stateName: string,
  validation: ReturnType<typeof validateGeographyDocument>
): StateGeographyDiagnostic {
  const topologyState = geography.topology.states.find(
    (state) => state.name === stateName
  );
  const stateEdges = getStateEdges(geography.topology, stateName);
  const sharedEdges = stateEdges.filter(
    (edge) => edge.kind === "shared-state-border"
  );
  const perimeterEdges = stateEdges.filter(
    (edge) => edge.kind === "moon-perimeter"
  );
  const straightSharedBorderCount = sharedEdges.filter(
    (edge) => edge.nodeIds.length === 2
  ).length;
  const borderControlPointCount = stateEdges.reduce(
    (total, edge) => total + Math.max(0, edge.nodeIds.length - 2),
    0
  );
  const resolved = resolveStateTerritories(
    geography.topology,
    geography.territories,
    stateName
  );
  const protectedAreas = resolveProtectedAreasForState(
    geography.topology,
    geography.protectedAreas,
    stateName
  );
  const issues: GeographyDiagnosticIssue[] = [];

  if (!topologyState || !resolved) {
    return {
      stateId: topologyState?.id ?? "missing",
      stateNumber: topologyState?.stateNumber ?? 0,
      stateName,
      status: "blocked",
      stateArea: 0,
      ruralCoverage: 0,
      sharedBorderCount: sharedEdges.length,
      perimeterBorderCount: perimeterEdges.length,
      straightSharedBorderCount,
      borderControlPointCount,
      cityCount: 0,
      townCount: 0,
      protectedAreaCount: protectedAreas.length,
      ruralParcelCount: 0,
      cityBlockCount: 0,
      minimumCityBlockCount: 0,
      townBlockCount: 0,
      minimumTownBlockCount: 0,
      issues: [
        {
          severity: "error",
          code: "STATE_GEOMETRY_UNAVAILABLE",
          message: "The state boundary could not be resolved.",
        },
      ],
    };
  }

  const publicCities = resolved.cities.map(toPublicSettlement);
  const publicTowns = resolved.towns.map(toPublicSettlement);
  const publicProtectedAreas = protectedAreas.map(toPublicProtectedArea);
  const protectedExclusions = publicProtectedAreas.map(
    toExclusionTerritory
  );
  const ruralExclusions = [
    ...publicCities.map(toExclusionTerritory),
    ...publicTowns.map(toExclusionTerritory),
    ...protectedExclusions,
  ];
  const ruralParcelCount = countSelectableRuralParcels(stateName, {
    stateBoundary: resolved.stateBoundary,
    excludedTerritories: ruralExclusions,
  });
  const cityBlockCounts = publicCities.map((city) =>
    countSelectableCityBlocks(city, protectedExclusions)
  );
  const townBlockCounts = publicTowns.map((town) =>
    countSelectableTownBlocks(town, protectedExclusions)
  );
  const cityBlockCount = cityBlockCounts.reduce(
    (total, count) => total + count,
    0
  );
  const townBlockCount = townBlockCounts.reduce(
    (total, count) => total + count,
    0
  );
  const minimumCityBlockCount = minimum(cityBlockCounts);
  const minimumTownBlockCount = minimum(townBlockCounts);

  if (resolved.cities.length !== 3) {
    issues.push({
      severity: "error",
      code: "CITY_COUNT_INVALID",
      message: `Expected 3 cities but found ${resolved.cities.length}.`,
    });
  }

  if (resolved.towns.length !== 20) {
    issues.push({
      severity: "error",
      code: "TOWN_COUNT_INVALID",
      message: `Expected 20 towns but found ${resolved.towns.length}.`,
    });
  }

  if (ruralParcelCount === 0) {
    issues.push({
      severity: "error",
      code: "NO_RURAL_INVENTORY",
      message: "No selectable Rural Acres remain in this state.",
    });
  } else if (ruralParcelCount < 1000) {
    issues.push({
      severity: "warning",
      code: "LOW_RURAL_INVENTORY",
      message: `Only ${ruralParcelCount} Rural Acres are currently saleable.`,
    });
  }

  if (minimumCityBlockCount === 0) {
    issues.push({
      severity: "error",
      code: "CITY_WITHOUT_BLOCKS",
      message: "At least one city has no saleable City Blocks.",
    });
  } else if (minimumCityBlockCount < 100) {
    issues.push({
      severity: "warning",
      code: "LOW_CITY_BLOCK_INVENTORY",
      message: `The smallest city has only ${minimumCityBlockCount} saleable blocks.`,
    });
  }

  if (minimumTownBlockCount === 0) {
    issues.push({
      severity: "error",
      code: "TOWN_WITHOUT_BLOCKS",
      message: "At least one town has no saleable Town Blocks.",
    });
  } else if (minimumTownBlockCount < 40) {
    issues.push({
      severity: "warning",
      code: "LOW_TOWN_BLOCK_INVENTORY",
      message: `The smallest town has only ${minimumTownBlockCount} saleable blocks.`,
    });
  }

  if (straightSharedBorderCount > 0) {
    issues.push({
      severity: "warning",
      code: "STRAIGHT_SHARED_BORDERS_REMAIN",
      message: `${straightSharedBorderCount} shared border${
        straightSharedBorderCount === 1 ? " is" : "s are"
      } still a single straight segment.`,
    });
  }

  if (borderControlPointCount > 80) {
    issues.push({
      severity: "warning",
      code: "EXCESSIVE_BORDER_COMPLEXITY",
      message: `${borderControlPointCount} interior border points may reduce editing and rendering performance.`,
    });
  }

  const stateTerritoryIssues = [
    ...validation.territories.errors,
    ...validation.territories.warnings,
  ].filter((issue) => issue.stateName === stateName);
  const stateProtectedIssues = [
    ...validation.protectedAreas.errors,
    ...validation.protectedAreas.warnings,
  ].filter((issue) => issue.stateName === stateName);

  for (const issue of [...stateTerritoryIssues, ...stateProtectedIssues]) {
    issues.push({
      severity: issue.severity === "error" ? "error" : "warning",
      code: issue.code,
      message: issue.message,
    });
  }

  const status: GeographyReadinessStatus = issues.some(
    (issue) => issue.severity === "error"
  )
    ? "blocked"
    : issues.some((issue) => issue.severity === "warning")
      ? "review"
      : "ready";

  return {
    stateId: resolved.stateId,
    stateNumber: resolved.stateNumber,
    stateName: resolved.stateName,
    status,
    stateArea: resolved.stateArea,
    ruralCoverage: resolved.ruralCoverage,
    sharedBorderCount: sharedEdges.length,
    perimeterBorderCount: perimeterEdges.length,
    straightSharedBorderCount,
    borderControlPointCount,
    cityCount: resolved.cities.length,
    townCount: resolved.towns.length,
    protectedAreaCount: protectedAreas.length,
    ruralParcelCount,
    cityBlockCount,
    minimumCityBlockCount,
    townBlockCount,
    minimumTownBlockCount,
    issues,
  };
}

function createReadinessReport(
  geography: LunaSphereGeographyDocument,
  states: StateGeographyDiagnostic[],
  globalIssues: GeographyDiagnosticIssue[]
): GeographyReadinessReport {
  const readyStateCount = states.filter(
    (state) => state.status === "ready"
  ).length;
  const reviewStateCount = states.filter(
    (state) => state.status === "review"
  ).length;
  const blockedStateCount = states.filter(
    (state) => state.status === "blocked"
  ).length;
  const status: GeographyReadinessStatus =
    globalIssues.length > 0 || blockedStateCount > 0
      ? "blocked"
      : reviewStateCount > 0
        ? "review"
        : "ready";

  return {
    format: "lunasphere-geography-readiness-report",
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    inventoryGridVersion: LUNASPHERE_INVENTORY_GRID_VERSION,
    inventorySubdivisionFactor: LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR,
    worldId: geography.topology.worldId,
    worldVersion: geography.topology.worldVersion,
    topologyRevision: geography.topology.revision,
    territoryRevision: geography.territories.revision,
    protectedAreaRevision: geography.protectedAreas.revision,
    status,
    readyStateCount,
    reviewStateCount,
    blockedStateCount,
    totalRuralParcels: states.reduce(
      (total, state) => total + state.ruralParcelCount,
      0
    ),
    totalCityBlocks: states.reduce(
      (total, state) => total + state.cityBlockCount,
      0
    ),
    totalTownBlocks: states.reduce(
      (total, state) => total + state.townBlockCount,
      0
    ),
    totalSaleableProperties: states.reduce(
      (total, state) =>
        total +
        state.ruralParcelCount +
        state.cityBlockCount +
        state.townBlockCount,
      0
    ),
    totalProtectedAreas: states.reduce(
      (total, state) => total + state.protectedAreaCount,
      0
    ),
    globalIssues,
    states,
  };
}

function createGlobalIssues(
  validation: ReturnType<typeof validateGeographyDocument>
): GeographyDiagnosticIssue[] {
  return [
    ...validation.topology.errors,
    ...validation.territories.errors,
    ...validation.protectedAreas.errors,
  ].map((issue) => ({
    severity: "error" as const,
    code: issue.code,
    message: issue.message,
  }));
}

export function runGeographyReadinessAudit(
  geography: LunaSphereGeographyDocument
): GeographyReadinessReport {
  const validation = validateGeographyDocument(geography);
  const globalIssues = createGlobalIssues(validation);
  const states = geography.topology.states
    .map((state) =>
      createStateDiagnostic(geography, state.name, validation)
    )
    .sort((first, second) => first.stateNumber - second.stateNumber);

  return createReadinessReport(geography, states, globalIssues);
}

export type GeographyReadinessAuditProgress = {
  completedStateCount: number;
  totalStateCount: number;
  stateName: string;
};

/**
 * Runs the same launch audit while yielding to the browser between states so
 * the Studio remains responsive and can display progress.
 */
export async function runGeographyReadinessAuditAsync(
  geography: LunaSphereGeographyDocument,
  onProgress?: (progress: GeographyReadinessAuditProgress) => void
): Promise<GeographyReadinessReport> {
  const validation = validateGeographyDocument(geography);
  const globalIssues = createGlobalIssues(validation);
  const orderedStates = [...geography.topology.states].sort(
    (first, second) => first.stateNumber - second.stateNumber
  );
  const states: StateGeographyDiagnostic[] = [];

  for (let index = 0; index < orderedStates.length; index += 1) {
    const state = orderedStates[index];
    states.push(
      createStateDiagnostic(geography, state.name, validation)
    );
    onProgress?.({
      completedStateCount: index + 1,
      totalStateCount: orderedStates.length,
      stateName: state.name,
    });

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  return createReadinessReport(geography, states, globalIssues);
}

export function geographyReadinessReportMatchesDocument(
  report: GeographyReadinessReport,
  geography: LunaSphereGeographyDocument
): boolean {
  return (
    report.worldId === geography.topology.worldId &&
    report.worldVersion === geography.topology.worldVersion &&
    report.topologyRevision === geography.topology.revision &&
    report.territoryRevision === geography.territories.revision &&
    report.protectedAreaRevision === geography.protectedAreas.revision
  );
}
