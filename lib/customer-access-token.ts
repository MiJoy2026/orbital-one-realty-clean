import { createHash } from "node:crypto";

import { jwtVerify, SignJWT } from "jose";

import { prisma } from "./prisma";

const CLAIM_TOKEN_ISSUER = "orbital-one-realty";
const CLAIM_TOKEN_AUDIENCE = "orbital-one-customer-account";
const NEW_ACCOUNT_VERSION = "new-account";

type CustomerClaimPayload = {
  type: "customer-claim";
  email: string;
  credentialVersion: string;
};

function getCustomerAccessSecret(): Uint8Array {
  const configuredSecret =
    process.env.CUSTOMER_ACCESS_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();

  if (!configuredSecret || configuredSecret.length < 32) {
    throw new Error(
      "CUSTOMER_ACCESS_SECRET or SESSION_SECRET must contain at least 32 characters."
    );
  }

  return new TextEncoder().encode(configuredSecret);
}

function normalizeEmail(emailAddress: string): string {
  return emailAddress.trim().toLowerCase();
}

function getCredentialVersion(passwordHash: string | null | undefined): string {
  if (!passwordHash) {
    return NEW_ACCOUNT_VERSION;
  }

  return createHash("sha256")
    .update(passwordHash)
    .digest("base64url")
    .slice(0, 32);
}

export async function createCustomerClaimTokenForEmail(
  emailAddress: string,
  expirationTime: string | number | Date = "7d"
): Promise<string> {
  const email = normalizeEmail(emailAddress);
  const user = await prisma.user.findUnique({
    where: { email },
    select: { passwordHash: true },
  });

  return new SignJWT({
    type: "customer-claim",
    email,
    credentialVersion: getCredentialVersion(user?.passwordHash),
  } satisfies CustomerClaimPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(CLAIM_TOKEN_ISSUER)
    .setAudience(CLAIM_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(getCustomerAccessSecret());
}

export async function verifyCustomerClaimToken(
  token: string
): Promise<CustomerClaimPayload> {
  const verified = await jwtVerify(token, getCustomerAccessSecret(), {
    issuer: CLAIM_TOKEN_ISSUER,
    audience: CLAIM_TOKEN_AUDIENCE,
  });

  const { type, email, credentialVersion } = verified.payload;

  if (
    type !== "customer-claim" ||
    typeof email !== "string" ||
    !email ||
    typeof credentialVersion !== "string" ||
    !credentialVersion
  ) {
    throw new Error("Invalid customer account access token.");
  }

  return {
    type,
    email: normalizeEmail(email),
    credentialVersion,
  };
}

export function customerClaimMatchesCurrentCredentials(
  passwordHash: string | null | undefined,
  credentialVersion: string
): boolean {
  return getCredentialVersion(passwordHash) === credentialVersion;
}
