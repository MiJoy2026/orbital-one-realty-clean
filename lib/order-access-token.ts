import { createHash } from "node:crypto";

import { jwtVerify, SignJWT } from "jose";

const ORDER_ACCESS_ISSUER = "orbital-one-realty";
const ORDER_ACCESS_AUDIENCE = "orbital-one-order-access";

export type OrderAccessScope = {
  orderId: string;
  certificateNumber: string;
  snapshotId?: string | null;
};

type OrderAccessPayload = {
  type: "order-access";
  orderId: string;
  certificateNumber: string;
  snapshotId?: string;
};

function getOrderAccessSecret(): Uint8Array {
  const configuredSecret =
    process.env.CUSTOMER_ACCESS_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();

  if (!configuredSecret || configuredSecret.length < 32) {
    throw new Error(
      "CUSTOMER_ACCESS_SECRET or SESSION_SECRET must contain at least 32 characters."
    );
  }

  return createHash("sha256")
    .update("orbital-one-order-access:")
    .update(configuredSecret)
    .digest();
}

function normalizeScope(scope: OrderAccessScope): OrderAccessScope {
  return {
    orderId: scope.orderId.trim(),
    certificateNumber: scope.certificateNumber.trim(),
    snapshotId: scope.snapshotId?.trim() || null,
  };
}

export async function createOrderAccessToken(
  scope: OrderAccessScope,
  expirationTime: string | number | Date = "30d"
): Promise<string> {
  const normalized = normalizeScope(scope);

  if (!normalized.orderId || !normalized.certificateNumber) {
    throw new Error("A valid order access scope is required.");
  }

  return new SignJWT({
    type: "order-access",
    orderId: normalized.orderId,
    certificateNumber: normalized.certificateNumber,
    ...(normalized.snapshotId
      ? { snapshotId: normalized.snapshotId }
      : {}),
  } satisfies OrderAccessPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ORDER_ACCESS_ISSUER)
    .setAudience(ORDER_ACCESS_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(getOrderAccessSecret());
}

export async function verifyOrderAccessToken(
  token: string,
  expectedScope: OrderAccessScope
): Promise<void> {
  const verified = await jwtVerify(token, getOrderAccessSecret(), {
    issuer: ORDER_ACCESS_ISSUER,
    audience: ORDER_ACCESS_AUDIENCE,
  });
  const payload = verified.payload;
  const expected = normalizeScope(expectedScope);

  if (
    payload.type !== "order-access" ||
    typeof payload.orderId !== "string" ||
    typeof payload.certificateNumber !== "string" ||
    payload.orderId !== expected.orderId ||
    payload.certificateNumber !== expected.certificateNumber
  ) {
    throw new Error("Invalid order access token.");
  }

  if (
    expected.snapshotId &&
    (typeof payload.snapshotId !== "string" ||
      payload.snapshotId !== expected.snapshotId)
  ) {
    throw new Error("Invalid property image access token.");
  }
}
