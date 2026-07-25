import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
} from "@/lib/admin-session";

export const runtime = "nodejs";

function valuesMatch(
  suppliedValue: string,
  configuredValue: string
): boolean {
  const supplied = Buffer.from(suppliedValue, "utf8");
  const configured = Buffer.from(configuredValue, "utf8");

  if (supplied.length !== configured.length) {
    return false;
  }

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

export async function POST(request: Request) {
  const formData = await request.formData();

  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const requestedDestination = String(formData.get("next") || "");

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

  const usernameMatches = valuesMatch(
    username,
    configuredUsername
  );

  const passwordMatches = valuesMatch(
    password,
    configuredPassword
  );

  if (!usernameMatches || !passwordMatches) {
    const failedUrl = new URL("/admin/login", request.url);
    failedUrl.searchParams.set("error", "1");

    if (requestedDestination) {
      failedUrl.searchParams.set(
        "next",
        safeDestination(requestedDestination)
      );
    }

    return NextResponse.redirect(failedUrl, 303);
  }

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