import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { linkUserOwnershipByEmail } from "../../../lib/link-user-ownership";
import { prisma } from "../../../lib/prisma";
import { createSession } from "../../../lib/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") || "");

    if (!name || !email || !password) {
      return new NextResponse("Missing required fields.", { status: 400 });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return new NextResponse("Please enter a valid email address.", {
        status: 400,
      });
    }

    if (password.length < 8) {
      return new NextResponse(
        "Password must contain at least 8 characters.",
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return new NextResponse(
        "An account already exists with this email.",
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    await linkUserOwnershipByEmail(user.id, email);
    await createSession(user.id);

    return NextResponse.redirect(new URL("/account", request.url), 303);
  } catch (error) {
    console.error("[Orbital One] Registration failed.", error);
    return new NextResponse("Registration failed.", { status: 500 });
  }
}
