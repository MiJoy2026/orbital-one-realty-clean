ALTER TABLE "Order"
ADD COLUMN "legalPolicyVersion" TEXT,
ADD COLUMN "legalAcceptedAt" TIMESTAMP(3),
ADD COLUMN "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "noveltyAcknowledged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "immediateFulfillmentAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "electronicDeliveryAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "withdrawalAcknowledged" BOOLEAN NOT NULL DEFAULT false;
