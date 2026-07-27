CREATE TABLE "LoginThrottle" (
  "key" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "failures" INTEGER NOT NULL DEFAULT 0,
  "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "blockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LoginThrottle_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "LoginThrottle_blockedUntil_idx"
ON "LoginThrottle"("blockedUntil");
