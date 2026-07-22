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
import type { PublicLunaSphereSettlement } from "./lunasphere-public-geography";
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

const baselineTopology = createTopologyFromRegions(lunarMapRegions, {
  status: "draft",
});
const baselineGeography =
  createInitialGeographyDocument(baselineTopology);

export type GeographyDraftRecord = {
  savedAt: string;
  topologyRevision: number;
  territoryRevision: number;
  geography: LunaSphereGeographyDocument;
};

export type GeographyReleaseRecord = {
  releaseNumber: number;
  publishedAt: string;
  topologyRevision: number;
  territoryRevision: number;
  topologyHash: string;
};

export type GeographyReleaseDetail = GeographyReleaseRecord & {
  geography: LunaSphereGeographyDocument;
};

export type GeographyActivationRecord = GeographyReleaseRecord & {
  activatedAt: string;
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
  activeReleaseNumber: number | null;
  activatedAt: string | null;
  fallbackReason: PublicGeographyFallbackReason | null;
};

export type GeographyWorkspace = {
  draft: GeographyDraftRecord | null;
  latestRelease: GeographyReleaseRecord | null;
  activeRelease: GeographyActivationRecord | null;
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

function createGeographyHash(
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
    topologyRevision: record.topologyRevision,
    territoryRevision: geography.territories.revision,
    topologyHash: record.topologyHash,
  };
}

export async function getGeographyWorkspace(
  client: PrismaClient = prisma
): Promise<GeographyWorkspace> {
  const [draft, releases, activeActivation] = await Promise.all([
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
  ]);

  const releaseRecords = releases.map(mapReleaseRecord);

  return {
    draft: draft
      ? (() => {
          const geography = parseStoredGeography(draft.topology);
          return {
            savedAt: draft.updatedAt.toISOString(),
            topologyRevision: geography.topology.revision,
            territoryRevision: geography.territories.revision,
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
    activeReleaseNumber: null,
    activatedAt: null,
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
    const activation =
      await client.lunaSphereGeographyActivation.findFirst({
        where: {
          worldId: baselineTopology.worldId,
          worldVersion: baselineTopology.worldVersion,
        },
        include: {
          release: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });

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
        activeReleaseNumber: activation.release.releaseNumber,
        activatedAt: activation.createdAt.toISOString(),
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
      topologyRevision: geography.topology.revision,
      territoryRevision: geography.territories.revision,
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
        topologyRevision: draftGeography.topology.revision,
        territoryRevision: draftGeography.territories.revision,
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

    parseAndValidateGeography(release.topology, "published");

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
