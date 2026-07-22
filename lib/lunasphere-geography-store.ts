import { createHash } from "node:crypto";

import { Prisma, type PrismaClient } from "@prisma/client";

import {
  lunarMapRegions,
  type LunarMapRegion,
} from "./lunar-map-regions";
import { prisma } from "./prisma";
import { hasCompatibleTopologyStructure } from "./lunasphere-studio-draft";
import {
  cloneTopology,
  createTopologyFromRegions,
  topologyToLunarMapRegions,
  validateTopology,
  type LunaSphereTopology,
  type LunaSphereTopologyStatus,
} from "./lunasphere-topology";

const baselineTopology = createTopologyFromRegions(lunarMapRegions, {
  status: "draft",
});

export type GeographyDraftRecord = {
  savedAt: string;
  topologyRevision: number;
  topology: LunaSphereTopology;
};

export type GeographyReleaseRecord = {
  releaseNumber: number;
  publishedAt: string;
  topologyRevision: number;
  topologyHash: string;
};

export type GeographyReleaseDetail = GeographyReleaseRecord & {
  topology: LunaSphereTopology;
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

function toJsonValue(topology: LunaSphereTopology): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(topology)) as Prisma.InputJsonValue;
}

function parseStoredTopology(value: Prisma.JsonValue): LunaSphereTopology {
  if (!hasCompatibleTopologyStructure(value, baselineTopology)) {
    throw new LunaSphereGeographyValidationError(
      "The stored LunaSphere topology is incompatible with this application version."
    );
  }

  return cloneTopology(value);
}

export function parseAndValidateTopology(
  value: unknown,
  status: LunaSphereTopologyStatus
): LunaSphereTopology {
  if (!hasCompatibleTopologyStructure(value, baselineTopology)) {
    throw new LunaSphereGeographyValidationError(
      "The submitted LunaSphere topology is incomplete or incompatible."
    );
  }

  const topology: LunaSphereTopology = {
    ...cloneTopology(value),
    status,
  };
  const validation = validateTopology(topology);

  if (!validation.valid) {
    const firstErrors = validation.errors
      .slice(0, 3)
      .map((issue) => issue.message)
      .join(" ");

    throw new LunaSphereGeographyValidationError(
      firstErrors || "The LunaSphere topology contains validation errors."
    );
  }

  return topology;
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

function createTopologyHash(topology: LunaSphereTopology): string {
  const hashableTopology: LunaSphereTopology = {
    ...cloneTopology(topology),
    status: "draft",
  };

  return createHash("sha256")
    .update(JSON.stringify(canonicalizeHashValue(hashableTopology)))
    .digest("hex");
}

function mapReleaseRecord(record: {
  releaseNumber: number;
  publishedAt: Date;
  topologyRevision: number;
  topologyHash: string;
}): GeographyReleaseRecord {
  return {
    releaseNumber: record.releaseNumber,
    publishedAt: record.publishedAt.toISOString(),
    topologyRevision: record.topologyRevision,
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
      ? {
          savedAt: draft.updatedAt.toISOString(),
          topologyRevision: draft.topologyRevision,
          topology: parseStoredTopology(draft.topology),
        }
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
    topology: parseAndValidateTopology(release.topology, "published"),
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

function createBuiltInPublicGeography(
  fallbackReason: PublicGeographyFallbackReason
): PublicGeographySnapshot {
  return {
    source: "built-in-fallback",
    regions: cloneMapRegions(lunarMapRegions),
    activeReleaseNumber: null,
    activatedAt: null,
    fallbackReason,
  };
}

/**
 * Resolves the geography that the customer-facing Moon Map should render.
 *
 * The most recently activated, valid numbered release wins. If no release is
 * active, the database cannot be reached, or stored geography fails current
 * validation, the original built-in 57-state map remains available.
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
      const topology = parseAndValidateTopology(
        activation.release.topology,
        "published"
      );
      const regions = topologyToLunarMapRegions(topology);

      return {
        source: "active-release",
        regions: cloneMapRegions(regions),
        activeReleaseNumber: activation.release.releaseNumber,
        activatedAt: activation.createdAt.toISOString(),
        fallbackReason: null,
      };
    } catch (error) {
      console.error(
        "[LunaSphere] Active public geography is invalid; using built-in boundaries.",
        error
      );

      return createBuiltInPublicGeography("invalid-active-release");
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
  const topology = parseAndValidateTopology(value, "draft");

  return client.$transaction(async (transaction) => {
    const currentDraft =
      await transaction.lunaSphereGeographyDraft.findUnique({
        where: {
          worldId_worldVersion: {
            worldId: topology.worldId,
            worldVersion: topology.worldVersion,
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
            worldId: topology.worldId,
            worldVersion: topology.worldVersion,
          },
        },
        update: {
          topologyRevision: topology.revision,
          topology: toJsonValue(topology),
        },
        create: {
          worldId: topology.worldId,
          worldVersion: topology.worldVersion,
          topologyRevision: topology.revision,
          topology: toJsonValue(topology),
        },
      });

    return {
      savedAt: record.updatedAt.toISOString(),
      topologyRevision: record.topologyRevision,
      topology,
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
  const publishedTopology = parseAndValidateTopology(value, "published");
  const draftTopology: LunaSphereTopology = {
    ...cloneTopology(publishedTopology),
    status: "draft",
  };
  const topologyHash = createTopologyHash(publishedTopology);

  return client.$transaction(async (transaction) => {
    const currentDraft =
      await transaction.lunaSphereGeographyDraft.findUnique({
        where: {
          worldId_worldVersion: {
            worldId: publishedTopology.worldId,
            worldVersion: publishedTopology.worldVersion,
          },
        },
      });

    if (!currentDraft) {
      throw new LunaSphereGeographyConflictError(
        "Save the current topology as the shared database draft before publishing it."
      );
    }

    const storedDraftTopology = parseStoredTopology(
      currentDraft.topology
    );

    if (
      createTopologyHash(storedDraftTopology) !==
      createTopologyHash(publishedTopology)
    ) {
      throw new LunaSphereGeographyConflictError(
        "The open topology does not match the shared database draft. Save the database draft before publishing."
      );
    }

    const latestRelease =
      await transaction.lunaSphereGeographyRelease.findFirst({
        where: {
          worldId: publishedTopology.worldId,
          worldVersion: publishedTopology.worldVersion,
        },
        orderBy: {
          releaseNumber: "desc",
        },
        select: {
          releaseNumber: true,
          topologyHash: true,
        },
      });

    if (latestRelease?.topologyHash === topologyHash) {
      throw new LunaSphereGeographyConflictError(
        "This topology already matches the latest published geography release."
      );
    }

    const releaseNumber =
      (latestRelease?.releaseNumber ?? 0) + 1;

    const release =
      await transaction.lunaSphereGeographyRelease.create({
        data: {
          worldId: publishedTopology.worldId,
          worldVersion: publishedTopology.worldVersion,
          releaseNumber,
          topologyRevision: publishedTopology.revision,
          topologyHash,
          topology: toJsonValue(publishedTopology),
        },
      });

    const draft =
      await transaction.lunaSphereGeographyDraft.upsert({
        where: {
          worldId_worldVersion: {
            worldId: draftTopology.worldId,
            worldVersion: draftTopology.worldVersion,
          },
        },
        update: {
          topologyRevision: draftTopology.revision,
          topology: toJsonValue(draftTopology),
        },
        create: {
          worldId: draftTopology.worldId,
          worldVersion: draftTopology.worldVersion,
          topologyRevision: draftTopology.revision,
          topology: toJsonValue(draftTopology),
        },
      });

    return {
      draft: {
        savedAt: draft.updatedAt.toISOString(),
        topologyRevision: draft.topologyRevision,
        topology: draftTopology,
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

    parseAndValidateTopology(release.topology, "published");

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
