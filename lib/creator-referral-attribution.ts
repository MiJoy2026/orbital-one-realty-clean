import type { NextRequest } from "next/server";

import { CREATOR_REFERRAL_COOKIE } from "./creator-referral";
import { verifyCreatorReferralToken } from "./creator-referral-token";
import { prisma } from "./prisma";

export type CreatorReferralAttribution = {
  referralId: string;
  creatorPartnerId: string;
  trackingCode: string;
};

export async function resolveCreatorReferralAttribution(
  request: NextRequest
): Promise<CreatorReferralAttribution | null> {
  const token = request.cookies.get(CREATOR_REFERRAL_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyCreatorReferralToken(token);

    const referral = await prisma.creatorReferral.findUnique({
      where: {
        id: payload.referralId,
      },
      include: {
        creatorPartner: true,
      },
    });

    if (
      !referral ||
      referral.expiresAt <= new Date() ||
      referral.creatorPartnerId !== payload.creatorPartnerId ||
      referral.trackingCode !== payload.trackingCode ||
      referral.creatorPartner.id !== payload.creatorPartnerId ||
      referral.creatorPartner.trackingCode !== payload.trackingCode ||
      referral.creatorPartner.status !== "Active"
    ) {
      return null;
    }

    return {
      referralId: referral.id,
      creatorPartnerId: referral.creatorPartnerId,
      trackingCode: referral.trackingCode,
    };
  } catch (error) {
    console.warn(
      "[Orbital One] Invalid or expired Creator Partner referral cookie.",
      error
    );

    return null;
  }
}