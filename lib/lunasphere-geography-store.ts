import { createHash } from "node:crypto";

import { Prisma, type PrismaClient } from "@prisma/client";

import {
  createInitialGeographyDocument,
  cloneGeographyDocument,
  normalizeGeographyDocument,
  setGeographyStatus,
  validateGeographyDocument,
  type LunaSphereGeographyDocument,
} from "./lunasphere-geography-document";
import {
  resolveStateTerritories,
  type ResolvedLunaSphereSettlement,
} from "./lunasphere-territories";
import {
  resolveAllProtectedAreas,
  type ResolvedLunaSphereProtectedArea,
} from "./lunasphere-protected-areas";
import type {
  PublicLunaSphereProtectedArea,
  PublicLunaSphereSettlement,
} from "./lunasphere-public-geography";
import {
  lunarMapRegions,
  type LunarMapRegion,
} from "./lunar-map-regions";
import { prisma } from "./prisma";
import {
  createTopologyFromRegions,
  topologyToLunarMapRegions,
  type LunaSphereTopologyStatus,
} from "./lunasphere-topology";
import {
  runGeographyReadinessAudit,
  type GeographyReadinessReport,
} from "./lunasphere-geography-diagnostics";
import {
  LUNASPHERE_INVENTORY_GRID_VERSION,
  LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR,
} from "./inventory-grid";
import { validateSoldPropertiesAgainstGeography } from "./lunasphere-sold-property-guard";

const baselineTopology = createTopologyFromRegions(lunarMapRegions, {
  status: "draft",
});
const baselineGeography =
  createInitialGeographyDocument(baselineTopology);

export type GeographyDraftRecord = {
  savedAt: string;
  inventoryGridVersion: number;
  inventorySubdivisionFactor: number;
  topologyRevision: number;
  territoryRevision: number;
  protectedAreaRevision: number;
  geography: LunaSphereGeographyDocument;
};

export type GeographyReleaseRecord = {
  releaseNumber: number;
  publishedAt: string;
  inventoryGridVersion: number;
  inventorySubdivisionFactor: number;
  topologyRevision: number;
  territoryRevision: number;
  protectedAreaRevision: number;
  topologyHash: string;
};

export type GeographyReleaseDetail = GeographyReleaseRecord & {
  geography: LunaSphereGeographyDocument;
};

export type GeographyActivationRecord = GeographyReleaseRecord & {
  activatedAt: string;
};

export type GeographyFreezeRecord = {
  id: string;
  label: string;
  frozenAt: string;
  unfrozenAt: string | null;
  releaseNumber: number;
  topologyHash: string;
  inventoryGridVersion: number;
  inventorySubdivisionFactor: number;
  topologyRevision: number;
  territoryRevision: number;
  protectedAreaRevision: number;
  readinessStatus: "ready" | "review";
  readyStateCount: number;
  reviewStateCount: number;
  blockedStateCount: number;
  totalRuralParcels: number;
  totalCityBlocks: number;
  totalTownBlocks: number;
  totalSaleableProperties: number;
  totalProtectedAreas: number;
  auditReport: GeographyReadinessReport;
  freezeNote: string | null;
  unfreezeNote: string | null;
};

export type PublicGeographySource =
  | "active-release"
  | "built-in-fallback";

export type PublicGeographyFallbackReason =
  | "no-active-release"
  | "database-unavailable"
  | "invalid-active-release";

export type PublicGeographySnapshot = {
  source: PublicGeographySource;
  regions: LunarMapRegion[];
  settlements: PublicLunaSphereSettlement[];
  protectedAreas: PublicLunaSphereProtectedArea[];
  inventoryGridVersion: number;
  inventorySubdivisionFactor: number;
  activeReleaseNumber: number | null;
  activatedAt: string | null;
  frozenGeographyLabel: string | null;
  frozenAt: string | null;
  fallbackReason: PublicGeographyFallbackReason | null;
};

export type GeographyWorkspace = {
  draft: GeographyDraftRecord | null;
  latestRelease: GeographyReleaseRecord | null;
  activeRelease: GeographyActivationRecord | null;
  activeFreeze: GeographyFreezeRecord | null;
  releases: GeographyReleaseRecord[];
};

export class LunaSphereGeographyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LunaSphereGeographyValidationError";
  }
}

export class LunaSphereGeographyConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LunaSphereGeographyConflictError";
  }
}

export class LunaSphereGeographyNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LunaSphereGeographyNotFoundError";
  }
}

async function assertSoldPropertiesPreserved(
  geography: LunaSphereGeographyDocument,
  client: PrismaClient | Prisma.TransactionClient
): Promise<void> {
  const report = await validateSoldPropertiesAgainstGeography(
    geography,
    client
  );

  if (report.valid) {
    return;
  }

  const firstIssues = report.issues
    .slice(0, 3)
    .map((issue) => issue.message)
    .join(" ");

  throw new LunaSphereGeographyConflictError(
    `This geography would move or remove ${report.issueCount} sold Grid V2 propert${
      report.issueCount === 1 ? "y" : "ies"
    }. ${firstIssues} Use a dedicated sold-property migration workflow instead.`
  );
}

async function getActiveFreeze(
  client: PrismaClient | Prisma.TransactionClient
) {
  return client.lunaSphereGeographyFreeze.findFirst({
    where: {
      worldId: baselineTopology.worldId,
      worldVersion: baselineTopology.worldVersion,
      unfrozenAt: null,
    },
    orderBy: [{ frozenAt: "desc" }, { id: "desc" }],
  });
}

async function assertGeographyIsEditable(
  geography: LunaSphereGeographyDocument,
  client: PrismaClient | Prisma.TransactionClient
): Promise<void> {
  const activeFreeze = await getActiveFreeze(client);

  if (
    activeFreeze &&
    createGeographyHash(geography) !== activeFreeze.topologyHash
  ) {
    throw new LunaSphereGeographyConflictError(
      `${activeFreeze.label} is frozen at release ${activeFreeze.releaseNumber}. Unfreeze it explicitly before changing the shared geography.`
    );
  }
}

function toJsonValue(
  geography: LunaSphereGeographyDocument
): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(geography)
  ) as Prisma.InputJsonValue;
}

function parseStoredGeography(
  value: Prisma.JsonValue
): LunaSphereGeographyDocument {
  const geography = normalizeGeographyDocument(
    value,
    baselineGeography
  );

  if (!geography) {
    throw new LunaSphereGeographyValidationError(
      "The stored LunaSphere geography is incompatible with this application version."
    );
  }

  return geography;
}

export function parseAndValidateGeography(
  value: unknown,
  status: LunaSphereTopologyStatus
): LunaSphereGeographyDocument {
  const normalized = normalizeGeographyDocument(
    value,
    baselineGeography
  );

  if (!normalized) {
    throw new LunaSphereGeographyValidationError(
      "The submitted LunaSphere geography is incomplete or incompatible."
    );
  }

  const geography = setGeographyStatus(normalized, status);
  const validation = validateGeographyDocument(geography);

  if (!validation.valid) {
    const firstErrors = [
      ...validation.topology.errors,
      ...validation.territories.errors,
      ...validation.protectedAreas.errors,
    ]
      .slice(0, 3)
      .map((issue) => issue.message)
      .join(" ");

    throw new LunaSphereGeographyValidationError(
      firstErrors ||
        "The LunaSphere geography contains validation errors."
    );
  }

  return geography;
}

function canonicalizeHashValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalizeHashValue(item));
  }

  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;

    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = canonicalizeHashValue(record[key]);
        return result;
      }, {});
  }

  return value;
}

export function createGeographyHash(
  geography: LunaSphereGeographyDocument
): string {
  const hashableGeography = setGeographyStatus(
    cloneGeographyDocument(geography),
    "draft"
  );

  return createHash("sha256")
    .update(JSON.stringify(canonicalizeHashValue(hashableGeography)))
    .digest("hex");
}

type ReleaseDatabaseRecord = {
  releaseNumber: number;
  publishedAt: Date;
  topologyRevision: number;
  topologyHash: string;
  topology: Prisma.JsonValue;
};

function mapReleaseRecord(
  record: ReleaseDatabaseRecord
): GeographyReleaseRecord {
  const geography = parseStoredGeography(record.topology);

  return {
    releaseNumber: record.releaseNumber,
    publishedAt: record.publishedAt.toISOString(),
    inventoryGridVersion: geography.inventory.version,
    inventorySubdivisionFactor: geography.inventory.subdivisionFactor,
    topologyRevision: record.topologyRevision,
    territoryRevision: geography.territories.revision,
    protectedAreaRevision: geography.protectedAreas.revision,
    topologyHash: record.topologyHash,
  };
}

type FreezeDatabaseRecord = {
  id: string;
  label: string;
  frozenAt: Date;
  unfrozenAt: Date | null;
  releaseNumber: number;
  topologyHash: string;
  inventoryGridVersion: number;
  inventorySubdivisionFactor: number;
  topologyRevision: number;
  territoryRevision: number;
  protectedAreaRevision: number;
  readinessStatus: string;
  readyStateCount: number;
  reviewStateCount: number;
  blockedStateCount: number;
  totalRuralParcels: number;
  totalCityBlocks: number;
  totalTownBlocks: number;
  totalSaleableProperties: number;
  totalProtectedAreas: number;
  auditReport: Prisma.JsonValue;
  freezeNote: string | null;
  unfreezeNote: string | null;
};

function mapFreezeRecord(
  record: FreezeDatabaseRecord
): GeographyFreezeRecord {
  const readinessStatus =
    record.readinessStatus === "ready" ? "ready" : "review";

  return {
    id: record.id,
    label: record.label,
    frozenAt: record.frozenAt.toISOString(),
    unfrozenAt: record.unfrozenAt?.toISOString() ?? null,
    releaseNumber: record.releaseNumber,
    topologyHash: record.topologyHash,
    inventoryGridVersion: record.inventoryGridVersion,
    inventorySubdivisionFactor: record.inventorySubdivisionFactor,
    topologyRevision: record.topologyRevision,
    territoryRevision: record.territoryRevision,
    protectedAreaRevision: record.protectedAreaRevision,
    readinessStatus,
    readyStateCount: record.readyStateCount,
    reviewStateCount: record.reviewStateCount,
    blockedStateCount: record.blockedStateCount,
    totalRuralParcels: record.totalRuralParcels,
    totalCityBlocks: record.totalCityBlocks,
    totalTownBlocks: record.totalTownBlocks,
    totalSaleableProperties: record.totalSaleableProperties,
    totalProtectedAreas: record.totalProtectedAreas,
    auditReport: JSON.parse(
      JSON.stringify(record.auditReport)
    ) as GeographyReadinessReport,
    freezeNote: record.freezeNote,
    unfreezeNote: record.unfreezeNote,
  };
}

export async function getGeographyWorkspace(
  client: PrismaClient = prisma
): Promise<GeographyWorkspace> {
  const [draft, releases, activeActivation, activeFreeze] = await Promise.all([
    client.lunaSphereGeographyDraft.findUnique({
      where: {
        worldId_worldVersion: {
          worldId: baselineTopology.worldId,
          worldVersion: baselineTopology.worldVersion,
        },
      },
    }),
    client.lunaSphereGeographyRelease.findMany({
      where: {
        worldId: baselineTopology.worldId,
        worldVersion: baselineTopology.worldVersion,
      },
      orderBy: {
        releaseNumber: "desc",
      },
    }),
    client.lunaSphereGeographyActivation.findFirst({
      where: {
        worldId: baselineTopology.worldId,
        worldVersion: baselineTopology.worldVersion,
      },
      include: {
        release: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    client.lunaSphereGeographyFreeze.findFirst({
      where: {
        worldId: baselineTopology.worldId,
        worldVersion: baselineTopology.worldVersion,
        unfrozenAt: null,
      },
      orderBy: [{ frozenAt: "desc" }, { id: "desc" }],
    }),
  ]);

  const releaseRecords = releases.map(mapReleaseRecord);

  return {
    draft: draft
      ? (() => {
          const geography = parseStoredGeography(draft.topology);
          return {
            savedAt: draft.updatedAt.toISOString(),
            inventoryGridVersion: geography.inventory.version,
            inventorySubdivisionFactor: geography.inventory.subdivisionFactor,
            topologyRevision: geography.topology.revision,
            territoryRevision: geography.territories.revision,
            protectedAreaRevision: geography.protectedAreas.revision,
            geography,
          };
        })()
      : null,
    latestRelease: releaseRecords[0] ?? null,
    activeRelease: activeActivation
      ? {
          ...mapReleaseRecord(activeActivation.release),
          activatedAt: activeActivation.createdAt.toISOString(),
        }
      : null,
    activeFreeze: activeFreeze ? mapFreezeRecord(activeFreeze) : null,
    releases: releaseRecords,
  };
}

export async function getGeographyRelease(
  releaseNumber: number,
  client: PrismaClient = prisma
): Promise<GeographyReleaseDetail> {
  if (!Number.isInteger(releaseNumber) || releaseNumber < 1) {
    throw new LunaSphereGeographyNotFoundError(
      "The requested LunaSphere geography release does not exist."
    );
  }

  const release = await client.lunaSphereGeographyRelease.findUnique({
    where: {
      worldId_worldVersion_releaseNumber: {
        worldId: baselineTopology.worldId,
        worldVersion: baselineTopology.worldVersion,
        releaseNumber,
      },
    },
  });

  if (!release) {
    throw new LunaSphereGeographyNotFoundError(
      `LunaSphere geography release ${releaseNumber} was not found.`
    );
  }

  return {
    ...mapReleaseRecord(release),
    geography: parseAndValidateGeography(
      release.topology,
      "published"
    ),
  };
}

type PublicMapRegionSource = {
  name: string;
  labelPosition: readonly [number, number];
  positions: readonly (readonly [number, number])[];
};

function cloneMapRegions(
  regions: readonly PublicMapRegionSource[]
): LunarMapRegion[] {
  return regions.map((region) => ({
    name: region.name,
    labelPosition: [
      region.labelPosition[0],
      region.labelPosition[1],
    ],
    positions: region.positions.map(
      ([y, x]) => [y, x] as [number, number]
    ),
  }));
}

function clonePublicSettlement(
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

function clonePublicProtectedArea(
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
    boundary: area.boundary.map(([y, x]) => [y, x] as [number, number]),
    minZoom: area.minZoom,
  };
}

function resolvePublicProtectedAreas(
  geography: LunaSphereGeographyDocument
): PublicLunaSphereProtectedArea[] {
  return resolveAllProtectedAreas(
    geography.topology,
    geography.protectedAreas
  ).map(clonePublicProtectedArea);
}

function resolvePublicSettlements(
  geography: LunaSphereGeographyDocument
): PublicLunaSphereSettlement[] {
  return geography.topology.states.flatMap((state) => {
    const territories = resolveStateTerritories(
      geography.topology,
      geography.territories,
      state.name
    );

    if (!territories) {
      return [];
    }

    return [...territories.cities, ...territories.towns].map(
      clonePublicSettlement
    );
  });
}

function createBuiltInPublicGeography(
  fallbackReason: PublicGeographyFallbackReason
): PublicGeographySnapshot {
  return {
    source: "built-in-fallback",
    regions: cloneMapRegions(lunarMapRegions),
    settlements: resolvePublicSettlements(baselineGeography),
    protectedAreas: resolvePublicProtectedAreas(baselineGeography),
    inventoryGridVersion: baselineGeography.inventory.version,
    inventorySubdivisionFactor:
      baselineGeography.inventory.subdivisionFactor,
    activeReleaseNumber: null,
    activatedAt: null,
    frozenGeographyLabel: null,
    frozenAt: null,
    fallbackReason,
  };
}

/**
 * Resolves the complete geography that the customer-facing Moon Map renders.
 * State, city, and town geometry always come from the same validated release.
 */
export async function getPublicGeographySnapshot(
  client: PrismaClient = prisma
): Promise<PublicGeographySnapshot> {
  try {
    const [activation, activeFreeze] = await Promise.all([
      client.lunaSphereGeographyActivation.findFirst({
        where: {
          worldId: baselineTopology.worldId,
          worldVersion: baselineTopology.worldVersion,
        },
        include: {
          release: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
      client.lunaSphereGeographyFreeze.findFirst({
        where: {
          worldId: baselineTopology.worldId,
          worldVersion: baselineTopology.worldVersion,
          unfrozenAt: null,
        },
        orderBy: [{ frozenAt: "desc" }, { id: "desc" }],
      }),
    ]);

    if (!activation) {
      return createBuiltInPublicGeography("no-active-release");
    }

    try {
      const geography = parseAndValidateGeography(
        activation.release.topology,
        "published"
      );
      const regions = topologyToLunarMapRegions(
        geography.topology
      );

      return {
        source: "active-release",
        regions: cloneMapRegions(regions),
        settlements: resolvePublicSettlements(geography),
        protectedAreas: resolvePublicProtectedAreas(geography),
        inventoryGridVersion: geography.inventory.version,
        inventorySubdivisionFactor: geography.inventory.subdivisionFactor,
        activeReleaseNumber: activation.release.releaseNumber,
        activatedAt: activation.createdAt.toISOString(),
        frozenGeographyLabel:
          activeFreeze?.releaseNumber === activation.release.releaseNumber
            ? activeFreeze.label
            : null,
        frozenAt:
          activeFreeze?.releaseNumber === activation.release.releaseNumber
            ? activeFreeze.frozenAt.toISOString()
            : null,
        fallbackReason: null,
      };
    } catch (error) {
      console.error(
        "[LunaSphere] Active public geography is invalid; using built-in boundaries.",
        error
      );

      return createBuiltInPublicGeography(
        "invalid-active-release"
      );
    }
  } catch (error) {
    console.error(
      "[LunaSphere] Public geography lookup failed; using built-in boundaries.",
      error
    );

    return createBuiltInPublicGeography("database-unavailable");
  }
}

export async function saveGeographyDraft(
  value: unknown,
  expectedSavedAt: string | null,
  client: PrismaClient = prisma
): Promise<GeographyDraftRecord> {
  const geography = parseAndValidateGeography(value, "draft");

  return client.$transaction(async (transaction) => {
    await assertGeographyIsEditable(geography, transaction);
    await assertSoldPropertiesPreserved(geography, transaction);

    const currentDraft =
      await transaction.lunaSphereGeographyDraft.findUnique({
        where: {
          worldId_worldVersion: {
            worldId: geography.topology.worldId,
            worldVersion: geography.topology.worldVersion,
          },
        },
        select: {
          updatedAt: true,
        },
      });
    const currentSavedAt =
      currentDraft?.updatedAt.toISOString() ?? null;

    if (currentSavedAt !== expectedSavedAt) {
      throw new LunaSphereGeographyConflictError(
        "The shared database draft changed after this Studio session loaded it. Refresh the database status, review the newer draft, and then save again."
      );
    }

    const record =
      await transaction.lunaSphereGeographyDraft.upsert({
        where: {
          worldId_worldVersion: {
            worldId: geography.topology.worldId,
            worldVersion: geography.topology.worldVersion,
          },
        },
        update: {
          topologyRevision: geography.topology.revision,
          topology: toJsonValue(geography),
        },
        create: {
          worldId: geography.topology.worldId,
          worldVersion: geography.topology.worldVersion,
          topologyRevision: geography.topology.revision,
          topology: toJsonValue(geography),
        },
      });

    return {
      savedAt: record.updatedAt.toISOString(),
      inventoryGridVersion: geography.inventory.version,
      inventorySubdivisionFactor: geography.inventory.subdivisionFactor,
      topologyRevision: geography.topology.revision,
      territoryRevision: geography.territories.revision,
      protectedAreaRevision: geography.protectedAreas.revision,
      geography,
    };
  });
}

export async function publishGeographyRelease(
  value: unknown,
  client: PrismaClient = prisma
): Promise<{
  draft: GeographyDraftRecord;
  release: GeographyReleaseRecord;
}> {
  const publishedGeography = parseAndValidateGeography(
    value,
    "published"
  );
  const draftGeography = setGeographyStatus(
    publishedGeography,
    "draft"
  );
  const geographyHash = createGeographyHash(publishedGeography);

  return client.$transaction(async (transaction) => {
    await assertGeographyIsEditable(publishedGeography, transaction);
    await assertSoldPropertiesPreserved(
      publishedGeography,
      transaction
    );

    const currentDraft =
      await transaction.lunaSphereGeographyDraft.findUnique({
        where: {
          worldId_worldVersion: {
            worldId: publishedGeography.topology.worldId,
            worldVersion:
              publishedGeography.topology.worldVersion,
          },
        },
      });

    if (!currentDraft) {
      throw new LunaSphereGeographyConflictError(
        "Save the current geography as the shared database draft before publishing it."
      );
    }

    const storedDraftGeography = parseStoredGeography(
      currentDraft.topology
    );

    if (
      createGeographyHash(storedDraftGeography) !==
      createGeographyHash(publishedGeography)
    ) {
      throw new LunaSphereGeographyConflictError(
        "The open geography does not match the shared database draft. Save the database draft before publishing."
      );
    }

    const latestRelease =
      await transaction.lunaSphereGeographyRelease.findFirst({
        where: {
          worldId: publishedGeography.topology.worldId,
          worldVersion:
            publishedGeography.topology.worldVersion,
        },
        orderBy: {
          releaseNumber: "desc",
        },
        select: {
          releaseNumber: true,
          topologyHash: true,
        },
      });

    if (latestRelease?.topologyHash === geographyHash) {
      throw new LunaSphereGeographyConflictError(
        "This geography already matches the latest published LunaSphere release."
      );
    }

    const releaseNumber =
      (latestRelease?.releaseNumber ?? 0) + 1;

    const release =
      await transaction.lunaSphereGeographyRelease.create({
        data: {
          worldId: publishedGeography.topology.worldId,
          worldVersion:
            publishedGeography.topology.worldVersion,
          releaseNumber,
          topologyRevision:
            publishedGeography.topology.revision,
          topologyHash: geographyHash,
          topology: toJsonValue(publishedGeography),
        },
      });

    const draft =
      await transaction.lunaSphereGeographyDraft.upsert({
        where: {
          worldId_worldVersion: {
            worldId: draftGeography.topology.worldId,
            worldVersion: draftGeography.topology.worldVersion,
          },
        },
        update: {
          topologyRevision: draftGeography.topology.revision,
          topology: toJsonValue(draftGeography),
        },
        create: {
          worldId: draftGeography.topology.worldId,
          worldVersion: draftGeography.topology.worldVersion,
          topologyRevision: draftGeography.topology.revision,
          topology: toJsonValue(draftGeography),
        },
      });

    return {
      draft: {
        savedAt: draft.updatedAt.toISOString(),
        inventoryGridVersion: draftGeography.inventory.version,
        inventorySubdivisionFactor:
          draftGeography.inventory.subdivisionFactor,
        topologyRevision: draftGeography.topology.revision,
        territoryRevision: draftGeography.territories.revision,
        protectedAreaRevision: draftGeography.protectedAreas.revision,
        geography: draftGeography,
      },
      release: mapReleaseRecord(release),
    };
  });
}

export async function activateGeographyRelease(
  releaseNumber: number,
  client: PrismaClient = prisma
): Promise<GeographyActivationRecord> {
  if (!Number.isInteger(releaseNumber) || releaseNumber < 1) {
    throw new LunaSphereGeographyNotFoundError(
      "The requested LunaSphere geography release does not exist."
    );
  }

  return client.$transaction(async (transaction) => {
    const release =
      await transaction.lunaSphereGeographyRelease.findUnique({
        where: {
          worldId_worldVersion_releaseNumber: {
            worldId: baselineTopology.worldId,
            worldVersion: baselineTopology.worldVersion,
            releaseNumber,
          },
        },
      });

    if (!release) {
      throw new LunaSphereGeographyNotFoundError(
        `LunaSphere geography release ${releaseNumber} was not found.`
      );
    }

    const releaseGeography = parseAndValidateGeography(
      release.topology,
      "published"
    );
    const activeFreeze = await getActiveFreeze(transaction);

    if (
      activeFreeze &&
      activeFreeze.releaseNumber !== release.releaseNumber
    ) {
      throw new LunaSphereGeographyConflictError(
        `${activeFreeze.label} is frozen at release ${activeFreeze.releaseNumber}. Unfreeze it before activating a different release.`
      );
    }

    await assertSoldPropertiesPreserved(
      releaseGeography,
      transaction
    );

    const currentActivation =
      await transaction.lunaSphereGeographyActivation.findFirst({
        where: {
          worldId: baselineTopology.worldId,
          worldVersion: baselineTopology.worldVersion,
        },
        include: {
          release: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });

    if (currentActivation?.release.releaseNumber === releaseNumber) {
      throw new LunaSphereGeographyConflictError(
        `Release ${releaseNumber} is already the active LunaSphere geography release.`
      );
    }

    const activation =
      await transaction.lunaSphereGeographyActivation.create({
        data: {
          worldId: release.worldId,
          worldVersion: release.worldVersion,
          releaseNumber: release.releaseNumber,
          releaseId: release.id,
        },
      });

    return {
      ...mapReleaseRecord(release),
      activatedAt: activation.createdAt.toISOString(),
    };
  });
}

async function acquireGeographyFreezeLock(
  transaction: Prisma.TransactionClient
): Promise<void> {
  await transaction.$queryRaw<Array<{ lockAcquired: number }>>`
    WITH geography_freeze_lock AS (
      SELECT pg_advisory_xact_lock(
        hashtext(${`${baselineTopology.worldId}:${baselineTopology.worldVersion}:freeze`})
      )
    )
    SELECT 1 AS "lockAcquired"
    FROM geography_freeze_lock
  `;
}

export type FreezeGeographyInput = {
  releaseNumber: number;
  confirmation: string;
  acceptWarnings: boolean;
  note?: string | null;
};

export async function freezeActiveGeographyRelease(
  input: FreezeGeographyInput,
  client: PrismaClient = prisma
): Promise<GeographyFreezeRecord> {
  if (input.confirmation !== "FREEZE GEOGRAPHY 1.0") {
    throw new LunaSphereGeographyConflictError(
      'Type "FREEZE GEOGRAPHY 1.0" exactly to confirm the launch freeze.'
    );
  }

  if (!Number.isInteger(input.releaseNumber) || input.releaseNumber < 1) {
    throw new LunaSphereGeographyNotFoundError(
      "A valid active release is required before Geography 1.0 can be frozen."
    );
  }

  const activation =
    await client.lunaSphereGeographyActivation.findFirst({
      where: {
        worldId: baselineTopology.worldId,
        worldVersion: baselineTopology.worldVersion,
      },
      include: { release: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

  if (!activation) {
    throw new LunaSphereGeographyConflictError(
      "Activate the approved numbered geography release before freezing Geography 1.0."
    );
  }

  if (activation.release.releaseNumber !== input.releaseNumber) {
    throw new LunaSphereGeographyConflictError(
      `Release ${input.releaseNumber} is not the active public geography release.`
    );
  }

  const geography = parseAndValidateGeography(
    activation.release.topology,
    "published"
  );

  if (
    geography.inventory.version !==
      LUNASPHERE_INVENTORY_GRID_VERSION ||
    geography.inventory.subdivisionFactor !==
      LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR
  ) {
    throw new LunaSphereGeographyConflictError(
      `Geography 1.0 must use Inventory Grid V${LUNASPHERE_INVENTORY_GRID_VERSION} with ${LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR}×${LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR} saleable subdivisions.`
    );
  }

  const auditReport = runGeographyReadinessAudit(geography);

  if (auditReport.status === "blocked") {
    const blockerCount =
      auditReport.blockedStateCount + auditReport.globalIssues.length;

    throw new LunaSphereGeographyValidationError(
      `The active release has ${blockerCount} launch blocker${
        blockerCount === 1 ? "" : "s"
      } and cannot be frozen. Run the Geography 1.0 audit and resolve every blocking issue first.`
    );
  }

  if (auditReport.status === "review" && !input.acceptWarnings) {
    throw new LunaSphereGeographyConflictError(
      `The active release has ${auditReport.reviewStateCount} state${
        auditReport.reviewStateCount === 1 ? "" : "s"
      } requiring review. Confirm that the remaining warnings are accepted before freezing.`
    );
  }

  const freezeNote = input.note?.trim().slice(0, 500) || null;

  return client.$transaction(async (transaction) => {
    await acquireGeographyFreezeLock(transaction);

    const [currentActivation, existingFreeze] = await Promise.all([
      transaction.lunaSphereGeographyActivation.findFirst({
        where: {
          worldId: baselineTopology.worldId,
          worldVersion: baselineTopology.worldVersion,
        },
        include: { release: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
      getActiveFreeze(transaction),
    ]);

    if (existingFreeze) {
      throw new LunaSphereGeographyConflictError(
        `${existingFreeze.label} is already frozen at release ${existingFreeze.releaseNumber}.`
      );
    }

    if (
      !currentActivation ||
      currentActivation.release.id !== activation.release.id ||
      currentActivation.release.topologyHash !==
        activation.release.topologyHash
    ) {
      throw new LunaSphereGeographyConflictError(
        "The active geography changed while the freeze audit was running. Refresh Studio and run the freeze again."
      );
    }

    await assertSoldPropertiesPreserved(geography, transaction);

    const record = await transaction.lunaSphereGeographyFreeze.create({
      data: {
        worldId: activation.release.worldId,
        worldVersion: activation.release.worldVersion,
        label: "Geography 1.0",
        releaseNumber: activation.release.releaseNumber,
        releaseId: activation.release.id,
        topologyHash: activation.release.topologyHash,
        inventoryGridVersion: geography.inventory.version,
        inventorySubdivisionFactor:
          geography.inventory.subdivisionFactor,
        topologyRevision: geography.topology.revision,
        territoryRevision: geography.territories.revision,
        protectedAreaRevision: geography.protectedAreas.revision,
        readinessStatus: auditReport.status,
        readyStateCount: auditReport.readyStateCount,
        reviewStateCount: auditReport.reviewStateCount,
        blockedStateCount: auditReport.blockedStateCount,
        totalRuralParcels: auditReport.totalRuralParcels,
        totalCityBlocks: auditReport.totalCityBlocks,
        totalTownBlocks: auditReport.totalTownBlocks,
        totalSaleableProperties:
          auditReport.totalSaleableProperties,
        totalProtectedAreas: auditReport.totalProtectedAreas,
        auditReport: JSON.parse(
          JSON.stringify(auditReport)
        ) as Prisma.InputJsonValue,
        freezeNote,
      },
    });

    return mapFreezeRecord(record);
  });
}

export type UnfreezeGeographyInput = {
  confirmation: string;
  note?: string | null;
};

export async function unfreezeActiveGeography(
  input: UnfreezeGeographyInput,
  client: PrismaClient = prisma
): Promise<GeographyFreezeRecord> {
  if (input.confirmation !== "UNFREEZE GEOGRAPHY 1.0") {
    throw new LunaSphereGeographyConflictError(
      'Type "UNFREEZE GEOGRAPHY 1.0" exactly to unlock Studio editing.'
    );
  }

  const unfreezeNote = input.note?.trim().slice(0, 500) || null;

  return client.$transaction(async (transaction) => {
    await acquireGeographyFreezeLock(transaction);
    const activeFreeze = await getActiveFreeze(transaction);

    if (!activeFreeze) {
      throw new LunaSphereGeographyConflictError(
        "Geography 1.0 is not currently frozen."
      );
    }

    const record = await transaction.lunaSphereGeographyFreeze.update({
      where: { id: activeFreeze.id },
      data: {
        unfrozenAt: new Date(),
        unfreezeNote,
      },
    });

    return mapFreezeRecord(record);
  });
}
