ALTER TABLE "Order"
ADD COLUMN "stripePaymentIntentId" TEXT,
ADD COLUMN "stripeChargeId" TEXT;

CREATE INDEX "Order_stripe_payment_intent_idx"
ON "Order"("stripePaymentIntentId");

CREATE INDEX "Order_stripe_charge_idx"
ON "Order"("stripeChargeId");


ALTER TABLE "CreatorCommission"
ADD COLUMN "disputeAmountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "financialStatus" TEXT NOT NULL DEFAULT 'Clear',
ADD COLUMN "financialNote" TEXT,
ADD COLUMN "financialUpdatedAt" TIMESTAMP(3);


CREATE TABLE "StripeFinancialEvent" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  "stripeEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "stripeObjectId" TEXT NOT NULL,

  "stripePaymentIntentId" TEXT,
  "stripeChargeId" TEXT,
  "stripeSessionId" TEXT,

  "amountCents" INTEGER,
  "currency" TEXT,
  "eventCreatedAt" TIMESTAMP(3) NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StripeFinancialEvent_pkey"
    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StripeFinancialEvent_stripeEventId_key"
ON "StripeFinancialEvent"("stripeEventId");

CREATE INDEX "StripeFinancialEvent_type_created_idx"
ON "StripeFinancialEvent"("eventType", "createdAt");

CREATE INDEX "StripeFinancialEvent_payment_intent_idx"
ON "StripeFinancialEvent"("stripePaymentIntentId");

CREATE INDEX "StripeFinancialEvent_charge_idx"
ON "StripeFinancialEvent"("stripeChargeId");

CREATE INDEX "StripeFinancialEvent_session_idx"
ON "StripeFinancialEvent"("stripeSessionId");