-- CreateTable
CREATE TABLE "LunaSphereGeographyActivation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "worldId" TEXT NOT NULL,
    "worldVersion" TEXT NOT NULL,
    "releaseNumber" INTEGER NOT NULL,
    "releaseId" TEXT NOT NULL,

    CONSTRAINT "LunaSphereGeographyActivation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LunaSphereGeoActivation_world_version_created_idx"
ON "LunaSphereGeographyActivation"("worldId", "worldVersion", "createdAt");

-- CreateIndex
CREATE INDEX "LunaSphereGeographyActivation_releaseId_idx"
ON "LunaSphereGeographyActivation"("releaseId");

-- AddForeignKey
ALTER TABLE "LunaSphereGeographyActivation"
ADD CONSTRAINT "LunaSphereGeographyActivation_releaseId_fkey"
FOREIGN KEY ("releaseId") REFERENCES "LunaSphereGeographyRelease"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
