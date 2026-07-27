import { createHmac } from "node:crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "./prisma";

const ACCOUNT_ACCESS_WINDOW_MS = 30 * 60 * 1000;
const ACCOUNT_EMAIL_LIMIT = 3;
const ACCOUNT_IP_LIMIT = 20;

type AccountAccessIdentity = {
  key: string;
  scope: "account-email" | "account-ip";
  requestLimit: number;
};

function getThrottleSecret(): string {
  const secret =
    process.env.LOGIN_THROTTLE_SECRET?.trim() ||
    process.env.CUSTOMER_ACCESS_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new Error(
      "LOGIN_THROTTLE_SECRET, CUSTOMER_ACCESS_SECRET, or SESSION_SECRET must contain at least 32 characters."
    );
  }

  return secret;
}

function createPrivateKey(
  scope: "account-email" | "account-ip",
  value: string
): string {
  return createHmac("sha256", getThrottleSecret())
    .update("orbital-one-account-access:")
    .update(scope)
    .update(":")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    forwardedIp ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    null
  );
}

function getIdentities(
  request: Request,
  email: string
): AccountAccessIdentity[] {
  const identities: AccountAccessIdentity[] = [
    {
      key: createPrivateKey("account-email", email),
      scope: "account-email",
      requestLimit: ACCOUNT_EMAIL_LIMIT,
    },
  ];

  const clientIp = getClientIp(request);

  if (clientIp) {
    identities.push({
      key: createPrivateKey("account-ip", clientIp),
      scope: "account-ip",
      requestLimit: ACCOUNT_IP_LIMIT,
    });
  }

  return identities;
}

async function consumeIdentityLimit(
  identity: AccountAccessIdentity
): Promise<boolean> {
  const now = new Date();
  const windowCutoff = new Date(
    now.getTime() - ACCOUNT_ACCESS_WINDOW_MS
  );

  const records = await prisma.$queryRaw<Array<{ failures: number }>>(
    Prisma.sql`
      INSERT INTO "LoginThrottle" (
        "key",
        "scope",
        "failures",
        "windowStartedAt",
        "blockedUntil",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${identity.key},
        ${identity.scope},
        1,
        ${now},
        NULL,
        ${now},
        ${now}
      )
      ON CONFLICT ("key") DO UPDATE SET
        "scope" = EXCLUDED."scope",
        "failures" = CASE
          WHEN "LoginThrottle"."windowStartedAt" <= ${windowCutoff}
          THEN 1
          ELSE "LoginThrottle"."failures" + 1
        END,
        "windowStartedAt" = CASE
          WHEN "LoginThrottle"."windowStartedAt" <= ${windowCutoff}
          THEN ${now}
          ELSE "LoginThrottle"."windowStartedAt"
        END,
        "blockedUntil" = NULL,
        "updatedAt" = ${now}
      RETURNING "failures"
    `
  );

  return (records[0]?.failures || 1) <= identity.requestLimit;
}

export async function consumeAccountAccessLimit(
  request: Request,
  email: string
): Promise<boolean> {
  const results = await Promise.all(
    getIdentities(request, email).map(consumeIdentityLimit)
  );

  return results.every(Boolean);
}
