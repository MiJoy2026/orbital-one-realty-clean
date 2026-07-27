import { createHmac } from "node:crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "./prisma";

const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_LOGIN_BLOCK_MS = 30 * 60 * 1000;
const ADMIN_LOGIN_FAILURE_LIMIT = 10;

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

function getAdminThrottleKey(request: Request): string | null {
  const clientIp = getClientIp(request);

  if (!clientIp) {
    return null;
  }

  return createHmac("sha256", getThrottleSecret())
    .update("orbital-one-admin-login:")
    .update(clientIp.toLowerCase())
    .digest("hex");
}

export async function adminLoginIsTemporarilyBlocked(
  request: Request
): Promise<boolean> {
  const key = getAdminThrottleKey(request);

  if (!key) {
    return false;
  }

  const record = await prisma.loginThrottle.findUnique({
    where: { key },
    select: {
      blockedUntil: true,
    },
  });

  return Boolean(
    record?.blockedUntil &&
      record.blockedUntil > new Date()
  );
}

export async function recordFailedAdminLogin(
  request: Request
): Promise<void> {
  const key = getAdminThrottleKey(request);

  if (!key) {
    return;
  }

  const now = new Date();
  const windowCutoff = new Date(
    now.getTime() - ADMIN_LOGIN_WINDOW_MS
  );
  const blockUntil = new Date(
    now.getTime() + ADMIN_LOGIN_BLOCK_MS
  );

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
        ${key},
        'admin-ip',
        1,
        ${now},
        NULL,
        ${now},
        ${now}
      )
      ON CONFLICT ("key") DO UPDATE SET
        "scope" = 'admin-ip',
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
          WHEN "LoginThrottle"."failures" + 1 >= ${ADMIN_LOGIN_FAILURE_LIMIT}
          THEN ${blockUntil}
          ELSE "LoginThrottle"."blockedUntil"
        END,
        "updatedAt" = ${now}
    `
  );
}

export async function clearSuccessfulAdminLoginFailures(
  request: Request
): Promise<void> {
  const key = getAdminThrottleKey(request);

  if (!key) {
    return;
  }

  await prisma.loginThrottle.deleteMany({
    where: { key },
  });
}
