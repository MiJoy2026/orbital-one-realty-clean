-- Preserve reservation history so delayed Stripe webhooks remain auditable and
-- bind every open Checkout Session to the exact reservation that created it.
ALTER TABLE "PropertyReservation"
ADD COLUMN IF NOT EXISTS "stripeCheckoutSessionId" TEXT;

DROP INDEX IF EXISTS "PropertyReservation_parcelKey_key";

CREATE UNIQUE INDEX IF NOT EXISTS "PropertyReservation_stripeCheckoutSessionId_key"
ON "PropertyReservation"("stripeCheckoutSessionId");

CREATE INDEX IF NOT EXISTS "PropertyReservation_parcel_status_expires_idx"
ON "PropertyReservation"("parcelKey", "status", "expiresAt");
