-- CreateTable
CREATE TABLE "LunaSphereGeographyDraft" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "worldId" TEXT NOT NULL,
    "worldVersion" TEXT NOT NULL,
    "topologyRevision" INTEGER NOT NULL,
    "topology" JSONB NOT NULL,

    CONSTRAINT "LunaSphereGeographyDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LunaSphereGeographyRelease" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "worldId" TEXT NOT NULL,
    "worldVersion" TEXT NOT NULL,
    "releaseNumber" INTEGER NOT NULL,
    "topologyRevision" INTEGER NOT NULL,
    "topologyHash" TEXT NOT NULL,
    "topology" JSONB NOT NULL,

    CONSTRAINT "LunaSphereGeographyRelease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LunaSphereGeographyDraft_worldId_worldVersion_key"
ON "LunaSphereGeographyDraft"("worldId", "worldVersion");

-- CreateIndex
CREATE INDEX "LunaSphereGeographyDraft_updatedAt_idx"
ON "LunaSphereGeographyDraft"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LunaSphereGeoRelease_world_version_number_key"
ON "LunaSphereGeographyRelease"("worldId", "worldVersion", "releaseNumber");

-- CreateIndex
CREATE INDEX "LunaSphereGeoRelease_world_version_published_idx"
ON "LunaSphereGeographyRelease"("worldId", "worldVersion", "publishedAt");
