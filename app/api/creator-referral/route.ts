import { NextRequest, NextResponse } from "next/server";

import {
  CREATOR_REFERRAL_COOKIE,
  creatorReferralMaxAgeSeconds,
  normalizeCreatorTrackingCode,
} from "@/lib/creator-referral";
import {
  createCreatorReferralToken,
  verifyCreatorReferralToken,
} from "@/lib/creator-referral-token";
import { prisma } from "@/lib/prisma";

function normalizeLandingPath(value: unknown): string {
  const pathname = String(value || "/")
    .trim()
    .slice(0, 500);

  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    return "/";
  }

  return pathname;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    );
  }

  const trackingCode = normalizeCreatorTrackingCode(
    String(body.trackingCode || "")
  );
  const landingPath = normalizeLandingPath(body.landingPath);
  const consentGranted = body.consentGranted === true;

  if (!consentGranted) {
    return NextResponse.json(
      { error: "Optional tracking consent is required." },
      { status: 400 }
    );
  }

  if (!trackingCode) {
    return NextResponse.json(
      { error: "A valid Creator Partner tracking code is required." },
      { status: 400 }
    );
  }

  const creatorPartner = await prisma.creatorPartner.findUnique({
    where: {
      trackingCode,
    },
  });

  if (!creatorPartner || creatorPartner.status !== "Active") {
    return NextResponse.json(
      { error: "This Creator Partner link is not active." },
      { status: 404 }
    );
  }

  const now = new Date();
  const existingToken = request.cookies.get(
    CREATOR_REFERRAL_COOKIE
  )?.value;

  if (existingToken) {
    try {
      const existingPayload =
        await verifyCreatorReferralToken(existingToken);

      if (existingPayload.creatorPartnerId === creatorPartner.id) {
        const existingReferral =
          await prisma.creatorReferral.findUnique({
            where: {
              id: existingPayload.referralId,
            },
          });

        if (
          existingReferral &&
          existingReferral.expiresAt > now &&
          existingReferral.trackingCode === trackingCode
        ) {
          return NextResponse.json(
            {
              success: true,
              existing: true,
            },
            {
              headers: {
                "Cache-Control": "no-store",
              },
            }
          );
        }
      }
    } catch {
      // Invalid or expired referral cookies are replaced below.
    }
  }

  const referralWindowDays = Math.min(
    Math.max(creatorPartner.referralWindowDays, 1),
    365
  );
  const maxAgeSeconds =
    creatorReferralMaxAgeSeconds(referralWindowDays);
  const expiresAt = new Date(
    now.getTime() + maxAgeSeconds * 1000
  );

  const referral = await prisma.creatorReferral.create({
    data: {
      creatorPartnerId: creatorPartner.id,
      trackingCode: creatorPartner.trackingCode,
      source: "Link",
      landingPath,
      expiresAt,
    },
  });

  const token = await createCreatorReferralToken(
    {
      referralId: referral.id,
      creatorPartnerId: creatorPartner.id,
      trackingCode: creatorPartner.trackingCode,
    },
    expiresAt
  );

  const response = NextResponse.json(
    {
      success: true,
      existing: false,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );

  response.cookies.set(CREATOR_REFERRAL_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
    expires: expiresAt,
  });

  return response;
}