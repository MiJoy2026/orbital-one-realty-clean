-- Allow one Stripe Checkout Session to contain multiple independently recorded properties.
DROP INDEX IF EXISTS "Order_stripeSessionId_key";
DROP INDEX IF EXISTS "PropertyReservation_stripeCheckoutSessionId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Order_stripe_session_property_key"
ON "Order"("stripeSessionId", "propertyId");

CREATE INDEX IF NOT EXISTS "Order_stripe_session_idx"
ON "Order"("stripeSessionId");

CREATE INDEX IF NOT EXISTS "PropertyReservation_checkout_session_idx"
ON "PropertyReservation"("stripeCheckoutSessionId");
