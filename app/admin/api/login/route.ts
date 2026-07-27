import {
  createHash,
  timingSafeEqual,
} from "node:crypto";

import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
} from "@/lib/admin-session";
import {
  adminLoginIsTemporarilyBlocked,
  clearSuccessfulAdminLoginFailures,
  recordFailedAdminLogin,
} from "@/lib/admin-login-throttle";

export const runtime = "nodejs";

function valuesMatch(
  suppliedValue: string,
  configuredValue: string
): boolean {
  const supplied = createHash("sha256")
    .update(suppliedValue, "utf8")
    .digest();
  const configured = createHash("sha256")
    .update(configuredValue, "utf8")
    .digest();

  return timingSafeEqual(supplied, configured);
}

function safeDestination(value: string): string {
  if (
    (value === "/admin" || value.startsWith("/admin/")) &&
    !value.startsWith("/admin/login") &&
    !value.startsWith("//")
  ) {
    return value;
  }

  return "/admin/dashboard";
}

function failedLoginUrl(
  request: Request,
  requestedDestination: string,
  error: "1" | "rate"
): URL {
  const failedUrl = new URL("/admin/login", request.url);
  failedUrl.searchParams.set("error", error);

  if (requestedDestination) {
    failedUrl.searchParams.set(
      "next",
      safeDestination(requestedDestination)
    );
  }

  return failedUrl;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const username = String(formData.get("username") || "")
    .trim()
    .slice(0, 120);
  const password = String(formData.get("password") || "")
    .slice(0, 256);
  const requestedDestination = String(
    formData.get("next") || ""
  );

  const configuredUsername =
    process.env.ADMIN_BASIC_USER?.trim() || "admin";
  const configuredPassword =
    process.env.ADMIN_BASIC_PASSWORD?.trim() || "";

  if (!configuredPassword) {
    return new NextResponse(
      "Administrator authentication is not configured.",
      {
        status: 503,
      }
    );
  }

  if (await adminLoginIsTemporarilyBlocked(request)) {
    return NextResponse.redirect(
      failedLoginUrl(
        request,
        requestedDestination,
        "rate"
      ),
      303
    );
  }

  const usernameMatches = valuesMatch(
    username,
    configuredUsername
  );
  const passwordMatches = valuesMatch(
    password,
    configuredPassword
  );

  if (!usernameMatches || !passwordMatches) {
    await recordFailedAdminLogin(request);

    return NextResponse.redirect(
      failedLoginUrl(request, requestedDestination, "1"),
      303
    );
  }

  await clearSuccessfulAdminLoginFailures(request);

  const token = await createAdminSessionToken(username);
  const destination = safeDestination(requestedDestination);

  const response = NextResponse.redirect(
    new URL(destination, request.url),
    303
  );

  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return response;
}
