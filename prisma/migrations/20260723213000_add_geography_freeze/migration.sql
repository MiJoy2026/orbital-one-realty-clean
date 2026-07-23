CREATE TABLE "LunaSphereGeographyFreeze" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "frozenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unfrozenAt" TIMESTAMP(3),
    "worldId" TEXT NOT NULL,
    "worldVersion" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Geography 1.0',
    "releaseNumber" INTEGER NOT NULL,
    "releaseId" TEXT NOT NULL,
    "topologyHash" TEXT NOT NULL,
    "inventoryGridVersion" INTEGER NOT NULL,
    "inventorySubdivisionFactor" INTEGER NOT NULL,
    "topologyRevision" INTEGER NOT NULL,
    "territoryRevision" INTEGER NOT NULL,
    "protectedAreaRevision" INTEGER NOT NULL,
    "readinessStatus" TEXT NOT NULL,
    "readyStateCount" INTEGER NOT NULL,
    "reviewStateCount" INTEGER NOT NULL,
    "blockedStateCount" INTEGER NOT NULL,
    "totalRuralParcels" INTEGER NOT NULL,
    "totalCityBlocks" INTEGER NOT NULL,
    "totalTownBlocks" INTEGER NOT NULL,
    "totalSaleableProperties" INTEGER NOT NULL,
    "totalProtectedAreas" INTEGER NOT NULL,
    "auditReport" JSONB NOT NULL,
    "freezeNote" TEXT,
    "unfreezeNote" TEXT,

    CONSTRAINT "LunaSphereGeographyFreeze_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LunaSphereGeoFreeze_world_version_frozen_idx"
ON "LunaSphereGeographyFreeze"("worldId", "worldVersion", "frozenAt");

CREATE INDEX "LunaSphereGeoFreeze_world_version_unfrozen_idx"
ON "LunaSphereGeographyFreeze"("worldId", "worldVersion", "unfrozenAt");

CREATE INDEX "LunaSphereGeographyFreeze_releaseId_idx"
ON "LunaSphereGeographyFreeze"("releaseId");

ALTER TABLE "LunaSphereGeographyFreeze"
ADD CONSTRAINT "LunaSphereGeographyFreeze_releaseId_fkey"
FOREIGN KEY ("releaseId") REFERENCES "LunaSphereGeographyRelease"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
