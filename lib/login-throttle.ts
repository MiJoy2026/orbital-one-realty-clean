import { createHmac } from "node:crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "./prisma";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_BLOCK_MS = 15 * 60 * 1000;
const EMAIL_FAILURE_LIMIT = 8;
const IP_FAILURE_LIMIT = 30;

type LoginIdentity = {
  key: string;
  scope: "email" | "ip";
  failureLimit: number;
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

function createPrivateKey(scope: "email" | "ip", value: string): string {
  return createHmac("sha256", getThrottleSecret())
    .update("orbital-one-login-throttle:")
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

function getIdentities(request: Request, email: string): LoginIdentity[] {
  const identities: LoginIdentity[] = [
    {
      key: createPrivateKey("email", email),
      scope: "email",
      failureLimit: EMAIL_FAILURE_LIMIT,
    },
  ];

  const clientIp = getClientIp(request);

  if (clientIp) {
    identities.push({
      key: createPrivateKey("ip", clientIp),
      scope: "ip",
      failureLimit: IP_FAILURE_LIMIT,
    });
  }

  return identities;
}

export async function loginIsTemporarilyBlocked(
  request: Request,
  email: string
): Promise<boolean> {
  const identities = getIdentities(request, email);
  const records = await prisma.loginThrottle.findMany({
    where: {
      key: {
        in: identities.map((identity) => identity.key),
      },
    },
    select: {
      blockedUntil: true,
    },
  });
  const now = new Date();

  return records.some(
    (record) => record.blockedUntil && record.blockedUntil > now
  );
}

export async function recordFailedLogin(
  request: Request,
  email: string
): Promise<void> {
  const now = new Date();
  const windowCutoff = new Date(now.getTime() - LOGIN_WINDOW_MS);
  const blockUntil = new Date(now.getTime() + LOGIN_BLOCK_MS);

  for (const identity of getIdentities(request, email)) {
    await prisma.$queryRaw(
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
              OR (
                "LoginThrottle"."blockedUntil" IS NOT NULL
                AND "LoginThrottle"."blockedUntil" <= ${now}
              )
            THEN 1
            ELSE "LoginThrottle"."failures" + 1
          END,
          "windowStartedAt" = CASE
            WHEN "LoginThrottle"."windowStartedAt" <= ${windowCutoff}
              OR (
                "LoginThrottle"."blockedUntil" IS NOT NULL
                AND "LoginThrottle"."blockedUntil" <= ${now}
              )
            THEN ${now}
            ELSE "LoginThrottle"."windowStartedAt"
          END,
          "blockedUntil" = CASE
            WHEN "LoginThrottle"."windowStartedAt" <= ${windowCutoff}
              OR (
                "LoginThrottle"."blockedUntil" IS NOT NULL
                AND "LoginThrottle"."blockedUntil" <= ${now}
              )
            THEN NULL
            WHEN "LoginThrottle"."failures" + 1 >= ${identity.failureLimit}
            THEN ${blockUntil}
            ELSE "LoginThrottle"."blockedUntil"
          END,
          "updatedAt" = ${now}
      `
    );
  }
}

export async function clearSuccessfulLoginFailures(
  email: string
): Promise<void> {
  await prisma.loginThrottle.deleteMany({
    where: {
      key: createPrivateKey("email", email),
    },
  });
}
