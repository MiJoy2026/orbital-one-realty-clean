CREATE TABLE "OwnedPropertySnapshot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,
    "cityName" TEXT,
    "townName" TEXT,
    "locationLabel" TEXT NOT NULL,
    "geographySource" TEXT NOT NULL,
    "geographyReleaseNumber" INTEGER,
    "geographyLabel" TEXT,
    "geographyFrozenAt" TIMESTAMP(3),
    "inventoryGridVersion" INTEGER NOT NULL,
    "inventorySubdivisionFactor" INTEGER NOT NULL,
    "imageRendererVersion" INTEGER NOT NULL DEFAULT 1,
    "terrainImageSource" TEXT NOT NULL DEFAULT '/atlas/moon-atlas-v2.jpg',
    "centerX" DOUBLE PRECISION NOT NULL,
    "centerY" DOUBLE PRECISION NOT NULL,
    "minimumX" DOUBLE PRECISION NOT NULL,
    "minimumY" DOUBLE PRECISION NOT NULL,
    "maximumX" DOUBLE PRECISION NOT NULL,
    "maximumY" DOUBLE PRECISION NOT NULL,
    "propertyWidth" DOUBLE PRECISION NOT NULL,
    "propertyHeight" DOUBLE PRECISION NOT NULL,
    "polygon" JSONB NOT NULL,
    "contextBoundary" JSONB NOT NULL,
    "gridCoordinates" JSONB NOT NULL,

    CONSTRAINT "OwnedPropertySnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OwnedPropertySnapshot_orderId_key"
ON "OwnedPropertySnapshot"("orderId");

CREATE UNIQUE INDEX "OwnedPropertySnapshot_propertyId_key"
ON "OwnedPropertySnapshot"("propertyId");

CREATE UNIQUE INDEX "OwnedPropertySnapshot_certificateNumber_key"
ON "OwnedPropertySnapshot"("certificateNumber");

CREATE INDEX "OwnedPropertySnapshot_state_type_idx"
ON "OwnedPropertySnapshot"("stateName", "propertyType");

CREATE INDEX "OwnedPropertySnapshot_release_idx"
ON "OwnedPropertySnapshot"("geographyReleaseNumber");

CREATE INDEX "OwnedPropertySnapshot_created_idx"
ON "OwnedPropertySnapshot"("createdAt");

ALTER TABLE "OwnedPropertySnapshot"
ADD CONSTRAINT "OwnedPropertySnapshot_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
