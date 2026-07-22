import { createHash } from "node:crypto";

import { Prisma, type PrismaClient } from "@prisma/client";

import { lunarMapRegions } from "./lunar-map-regions";
import { prisma } from "./prisma";
import { hasCompatibleTopologyStructure } from "./lunasphere-studio-draft";
import {
  cloneTopology,
  createTopologyFromRegions,
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

export type GeographyWorkspace = {
  draft: GeographyDraftRecord | null;
  latestRelease: GeographyReleaseRecord | null;
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

function createTopologyHash(topology: LunaSphereTopology): string {
  const hashableTopology: LunaSphereTopology = {
    ...cloneTopology(topology),
    status: "draft",
  };

  return createHash("sha256")
    .update(JSON.stringify(hashableTopology))
    .digest("hex");
}

export async function getGeographyWorkspace(
  client: PrismaClient = prisma
): Promise<GeographyWorkspace> {
  const [draft, latestRelease] = await Promise.all([
    client.lunaSphereGeographyDraft.findUnique({
      where: {
        worldId_worldVersion: {
          worldId: baselineTopology.worldId,
          worldVersion: baselineTopology.worldVersion,
        },
      },
    }),
    client.lunaSphereGeographyRelease.findFirst({
      where: {
        worldId: baselineTopology.worldId,
        worldVersion: baselineTopology.worldVersion,
      },
      orderBy: {
        releaseNumber: "desc",
      },
    }),
  ]);

  return {
    draft: draft
      ? {
          savedAt: draft.updatedAt.toISOString(),
          topologyRevision: draft.topologyRevision,
          topology: parseStoredTopology(draft.topology),
        }
      : null,
    latestRelease: latestRelease
      ? {
          releaseNumber: latestRelease.releaseNumber,
          publishedAt: latestRelease.publishedAt.toISOString(),
          topologyRevision: latestRelease.topologyRevision,
          topologyHash: latestRelease.topologyHash,
        }
      : null,
  };
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
      release: {
        releaseNumber: release.releaseNumber,
        publishedAt: release.publishedAt.toISOString(),
        topologyRevision: release.topologyRevision,
        topologyHash: release.topologyHash,
      },
    };
  });
}
