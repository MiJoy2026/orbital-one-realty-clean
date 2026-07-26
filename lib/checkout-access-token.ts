import { createHash } from "node:crypto";

import { jwtVerify, SignJWT } from "jose";

export const CHECKOUT_ACCESS_COOKIE = "orbital_one_checkout_access";

const CHECKOUT_ACCESS_ISSUER = "orbital-one-realty";
const CHECKOUT_ACCESS_AUDIENCE = "orbital-one-checkout-access";

type CheckoutAccessPayload = {
  type: "checkout-access";
  sessionId: string;
};

function getCheckoutAccessSecret(): Uint8Array {
  const configuredSecret =
    process.env.CUSTOMER_ACCESS_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();

  if (!configuredSecret || configuredSecret.length < 32) {
    throw new Error(
      "CUSTOMER_ACCESS_SECRET or SESSION_SECRET must contain at least 32 characters."
    );
  }

  return createHash("sha256")
    .update("orbital-one-checkout-access:")
    .update(configuredSecret)
    .digest();
}

function normalizeSessionId(value: string): string {
  return value.trim();
}

export async function createCheckoutAccessToken(
  sessionId: string,
  expirationTime: string | number | Date = "2h"
): Promise<string> {
  const normalizedSessionId = normalizeSessionId(sessionId);

  if (!normalizedSessionId) {
    throw new Error("A valid Stripe Checkout session ID is required.");
  }

  return new SignJWT({
    type: "checkout-access",
    sessionId: normalizedSessionId,
  } satisfies CheckoutAccessPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(CHECKOUT_ACCESS_ISSUER)
    .setAudience(CHECKOUT_ACCESS_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(getCheckoutAccessSecret());
}

export async function verifyCheckoutAccessToken(
  token: string,
  expectedSessionId: string
): Promise<void> {
  const verified = await jwtVerify(token, getCheckoutAccessSecret(), {
    issuer: CHECKOUT_ACCESS_ISSUER,
    audience: CHECKOUT_ACCESS_AUDIENCE,
  });
  const payload = verified.payload;
  const normalizedSessionId = normalizeSessionId(expectedSessionId);

  if (
    payload.type !== "checkout-access" ||
    typeof payload.sessionId !== "string" ||
    payload.sessionId !== normalizedSessionId
  ) {
    throw new Error("Invalid checkout access token.");
  }
}
