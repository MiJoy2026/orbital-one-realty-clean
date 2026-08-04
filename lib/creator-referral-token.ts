import { createHash } from "node:crypto";

import { jwtVerify, SignJWT } from "jose";

import { normalizeCreatorTrackingCode } from "./creator-referral";

const CREATOR_REFERRAL_ISSUER = "orbital-one-realty";
const CREATOR_REFERRAL_AUDIENCE = "orbital-one-creator-referral";

export type CreatorReferralTokenPayload = {
  type: "creator-referral";
  referralId: string;
  creatorPartnerId: string;
  trackingCode: string;
};

function getCreatorReferralSecret(): Uint8Array {
  const configuredSecret =
    process.env.CUSTOMER_ACCESS_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();

  if (!configuredSecret || configuredSecret.length < 32) {
    throw new Error(
      "CUSTOMER_ACCESS_SECRET or SESSION_SECRET must contain at least 32 characters."
    );
  }

  return createHash("sha256")
    .update("orbital-one-creator-referral:")
    .update(configuredSecret)
    .digest();
}

export async function createCreatorReferralToken(
  payload: Omit<CreatorReferralTokenPayload, "type">,
  expirationTime: string | number | Date = "30d"
): Promise<string> {
  const referralId = payload.referralId.trim();
  const creatorPartnerId = payload.creatorPartnerId.trim();
  const trackingCode = normalizeCreatorTrackingCode(payload.trackingCode);

  if (!referralId || !creatorPartnerId || !trackingCode) {
    throw new Error("Valid creator referral token details are required.");
  }

  return new SignJWT({
    type: "creator-referral",
    referralId,
    creatorPartnerId,
    trackingCode,
  } satisfies CreatorReferralTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(CREATOR_REFERRAL_ISSUER)
    .setAudience(CREATOR_REFERRAL_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(getCreatorReferralSecret());
}

export async function verifyCreatorReferralToken(
  token: string
): Promise<CreatorReferralTokenPayload> {
  const verified = await jwtVerify(token, getCreatorReferralSecret(), {
    issuer: CREATOR_REFERRAL_ISSUER,
    audience: CREATOR_REFERRAL_AUDIENCE,
  });

  const payload = verified.payload;

  if (
    payload.type !== "creator-referral" ||
    typeof payload.referralId !== "string" ||
    typeof payload.creatorPartnerId !== "string" ||
    typeof payload.trackingCode !== "string"
  ) {
    throw new Error("Invalid creator referral token.");
  }

  const referralId = payload.referralId.trim();
  const creatorPartnerId = payload.creatorPartnerId.trim();
  const trackingCode = normalizeCreatorTrackingCode(payload.trackingCode);

  if (!referralId || !creatorPartnerId || !trackingCode) {
    throw new Error("Invalid creator referral token.");
  }

  return {
    type: "creator-referral",
    referralId,
    creatorPartnerId,
    trackingCode,
  };
}