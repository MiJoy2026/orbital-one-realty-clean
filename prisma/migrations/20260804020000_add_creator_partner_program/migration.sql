-- CreateTable
CREATE TABLE "CreatorApplication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "primaryPlatform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "audienceSize" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "contentFocus" TEXT NOT NULL,
    "whyFit" TEXT NOT NULL,
    "campaignIdea" TEXT,
    "ageConfirmed" BOOLEAN NOT NULL,
    "disclosureConfirmed" BOOLEAN NOT NULL,
    "termsAccepted" BOOLEAN NOT NULL,
    "termsVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "reviewNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "CreatorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorPartner" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "referralWindowDays" INTEGER NOT NULL DEFAULT 30,
    "payoutThresholdCents" INTEGER NOT NULL DEFAULT 2500,
    "customCommissionRateBps" INTEGER,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suspendedAt" TIMESTAMP(3),
    "terminatedAt" TIMESTAMP(3),

    CONSTRAINT "CreatorPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorReferral" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "creatorPartnerId" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Link',
    "landingPath" TEXT,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "CreatorReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorCommission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorPartnerId" TEXT NOT NULL,
    "referralId" TEXT,
    "orderId" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "grossRevenueCents" INTEGER NOT NULL,
    "refundAmountCents" INTEGER NOT NULL DEFAULT 0,
    "netRevenueCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "commissionRateBps" INTEGER,
    "commissionAmountCents" INTEGER,
    "adjustmentCents" INTEGER NOT NULL DEFAULT 0,
    "validationEligibleAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "deniedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "denialReason" TEXT,
    "payoutId" TEXT,

    CONSTRAINT "CreatorCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorPayout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorPartnerId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "method" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "CreatorPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreatorApplication_status_created_idx" ON "CreatorApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CreatorApplication_email_created_idx" ON "CreatorApplication"("email", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPartner_applicationId_key" ON "CreatorPartner"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPartner_email_key" ON "CreatorPartner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPartner_trackingCode_key" ON "CreatorPartner"("trackingCode");

-- CreateIndex
CREATE INDEX "CreatorPartner_status_idx" ON "CreatorPartner"("status");

-- CreateIndex
CREATE INDEX "CreatorReferral_partner_created_idx" ON "CreatorReferral"("creatorPartnerId", "createdAt");

-- CreateIndex
CREATE INDEX "CreatorReferral_expires_idx" ON "CreatorReferral"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorCommission_orderId_key" ON "CreatorCommission"("orderId");

-- CreateIndex
CREATE INDEX "CreatorCommission_partner_month_status_idx" ON "CreatorCommission"("creatorPartnerId", "monthKey", "status");

-- CreateIndex
CREATE INDEX "CreatorCommission_stripe_session_idx" ON "CreatorCommission"("stripeSessionId");

-- CreateIndex
CREATE INDEX "CreatorCommission_referral_idx" ON "CreatorCommission"("referralId");

-- CreateIndex
CREATE INDEX "CreatorCommission_payout_idx" ON "CreatorCommission"("payoutId");

-- CreateIndex
CREATE INDEX "CreatorPayout_partner_status_idx" ON "CreatorPayout"("creatorPartnerId", "status");

-- CreateIndex
CREATE INDEX "CreatorPayout_period_idx" ON "CreatorPayout"("periodStart", "periodEnd");

-- AddForeignKey
ALTER TABLE "CreatorPartner" ADD CONSTRAINT "CreatorPartner_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CreatorApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorReferral" ADD CONSTRAINT "CreatorReferral_creatorPartnerId_fkey" FOREIGN KEY ("creatorPartnerId") REFERENCES "CreatorPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorCommission" ADD CONSTRAINT "CreatorCommission_creatorPartnerId_fkey" FOREIGN KEY ("creatorPartnerId") REFERENCES "CreatorPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorCommission" ADD CONSTRAINT "CreatorCommission_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "CreatorReferral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorCommission" ADD CONSTRAINT "CreatorCommission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorCommission" ADD CONSTRAINT "CreatorCommission_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "CreatorPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorPayout" ADD CONSTRAINT "CreatorPayout_creatorPartnerId_fkey" FOREIGN KEY ("creatorPartnerId") REFERENCES "CreatorPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
