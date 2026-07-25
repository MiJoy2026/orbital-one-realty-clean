import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { linkUserOwnershipByEmail } from "../../../lib/link-user-ownership";
import { prisma } from "../../../lib/prisma";
import { createSession } from "../../../lib/session";

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
      .toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      return NextResponse.redirect(
        loginErrorUrl(request, "invalid"),
        303
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.redirect(
        loginErrorUrl(request, "invalid"),
        303
      );
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      return NextResponse.redirect(
        loginErrorUrl(request, "invalid"),
        303
      );
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.redirect(
        loginErrorUrl(request, "access"),
        303
      );
    }

    await linkUserOwnershipByEmail(user.id, user.email);
    await createSession(user.id);

    return NextResponse.redirect(new URL("/account", request.url), 303);
  } catch (error) {
    console.error("[Orbital One] Login failed.", error);
    return new NextResponse("Login failed.", { status: 500 });
  }
}
