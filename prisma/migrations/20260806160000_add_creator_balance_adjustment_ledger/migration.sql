CREATE TABLE "CreatorBalanceAdjustment" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  "creatorPartnerId" TEXT NOT NULL,
  "creatorCommissionId" TEXT NOT NULL,
  "stripeEventId" TEXT NOT NULL,

  "amountCents" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,

  "payoutId" TEXT,
  "paidAt" TIMESTAMP(3),

  CONSTRAINT "CreatorBalanceAdjustment_pkey"
    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreatorBalanceAdjustment_commission_event_key"
ON "CreatorBalanceAdjustment"(
  "creatorCommissionId",
  "stripeEventId"
);

CREATE INDEX "CreatorBalanceAdjustment_partner_payout_paid_idx"
ON "CreatorBalanceAdjustment"(
  "creatorPartnerId",
  "payoutId",
  "paidAt"
);

CREATE INDEX "CreatorBalanceAdjustment_commission_idx"
ON "CreatorBalanceAdjustment"("creatorCommissionId");

CREATE INDEX "CreatorBalanceAdjustment_payout_idx"
ON "CreatorBalanceAdjustment"("payoutId");

ALTER TABLE "CreatorBalanceAdjustment"
ADD CONSTRAINT "CreatorBalanceAdjustment_creatorPartnerId_fkey"
FOREIGN KEY ("creatorPartnerId")
REFERENCES "CreatorPartner"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "CreatorBalanceAdjustment"
ADD CONSTRAINT "CreatorBalanceAdjustment_creatorCommissionId_fkey"
FOREIGN KEY ("creatorCommissionId")
REFERENCES "CreatorCommission"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "CreatorBalanceAdjustment"
ADD CONSTRAINT "CreatorBalanceAdjustment_payoutId_fkey"
FOREIGN KEY ("payoutId")
REFERENCES "CreatorPayout"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;