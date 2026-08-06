CREATE TABLE "CreatorPartnerStatusEvent" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "creatorPartnerId" TEXT NOT NULL,
  "previousStatus" TEXT NOT NULL,
  "newStatus" TEXT NOT NULL,
  "reason" TEXT NOT NULL,

  CONSTRAINT "CreatorPartnerStatusEvent_pkey"
    PRIMARY KEY ("id")
);

CREATE INDEX
  "CreatorPartnerStatusEvent_partner_created_idx"
ON "CreatorPartnerStatusEvent"(
  "creatorPartnerId",
  "createdAt"
);

ALTER TABLE "CreatorPartnerStatusEvent"
ADD CONSTRAINT
  "CreatorPartnerStatusEvent_creatorPartnerId_fkey"
FOREIGN KEY ("creatorPartnerId")
REFERENCES "CreatorPartner"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;