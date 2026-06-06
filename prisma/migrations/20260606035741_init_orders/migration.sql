-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeSessionId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "lunarState" TEXT NOT NULL,
    "deedName" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "email" TEXT,
    "premiumGoldSeal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_certificateNumber_key" ON "Order"("certificateNumber");
