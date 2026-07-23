import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { linkUserOwnershipByEmail } from "../../../lib/link-user-ownership";
import { prisma } from "../../../lib/prisma";
import { createSession } from "../../../lib/session";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      return new NextResponse("Missing email or password.", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return new NextResponse("Invalid email or password.", { status: 401 });
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      return new NextResponse("Invalid email or password.", { status: 401 });
    }

    await linkUserOwnershipByEmail(user.id, user.email);
    await createSession(user.id);

    return NextResponse.redirect(new URL("/account", request.url), 303);
  } catch (error) {
    console.error("[Orbital One] Login failed.", error);
    return new NextResponse("Login failed.", { status: 500 });
  }
}
