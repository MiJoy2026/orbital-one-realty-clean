import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { linkUserOwnershipByEmail } from "../../../lib/link-user-ownership";
import {
  clearSuccessfulLoginFailures,
  loginIsTemporarilyBlocked,
  recordFailedLogin,
} from "../../../lib/login-throttle";
import { prisma } from "../../../lib/prisma";
import { createSession } from "../../../lib/session";

const INVALID_PASSWORD_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEe.5rJwDqkDGHrM3mMecx7mN8hlc4xV5cK";

function loginErrorUrl(request: Request, error: string): URL {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);
  return url;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase()
      .slice(0, 254);
    const password = String(formData.get("password") || "").slice(0, 200);

    if (!email || !password) {
      return NextResponse.redirect(loginErrorUrl(request, "invalid"), 303);
    }

    if (await loginIsTemporarilyBlocked(request, email)) {
      return NextResponse.redirect(loginErrorUrl(request, "rate"), 303);
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const passwordIsValid = await bcrypt.compare(
      password,
      user?.passwordHash || INVALID_PASSWORD_HASH
    );

    if (!user || !passwordIsValid) {
      await recordFailedLogin(request, email);

      return NextResponse.redirect(loginErrorUrl(request, "invalid"), 303);
    }

    if (!user.emailVerifiedAt) {
      await clearSuccessfulLoginFailures(email);

      return NextResponse.redirect(loginErrorUrl(request, "access"), 303);
    }

    await clearSuccessfulLoginFailures(email);
    await linkUserOwnershipByEmail(user.id, user.email);
    await createSession(user.id);

    return NextResponse.redirect(new URL("/account", request.url), 303);
  } catch (error) {
    console.error("[Orbital One] Login failed.", error);
    return new NextResponse("Login failed.", { status: 500 });
  }
}
