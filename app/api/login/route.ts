import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const email = String(formData.get("email") || "").toLowerCase();
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

    return NextResponse.redirect(
      new URL(`/account?email=${encodeURIComponent(user.email)}`, request.url)
    );
  } catch (error) {
    console.error(error);

    return new NextResponse("Login failed.", { status: 500 });
  }
}