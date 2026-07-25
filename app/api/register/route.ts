import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import {
  customerClaimMatchesCurrentCredentials,
  verifyCustomerClaimToken,
} from "../../../lib/customer-access-token";
import { linkUserOwnershipByEmail } from "../../../lib/link-user-ownership";
import { prisma } from "../../../lib/prisma";
import { createSession } from "../../../lib/session";

function registrationUrl(
  request: Request,
  token: string,
  error: string
): URL {
  const url = new URL("/register", request.url);

  if (token) {
    url.searchParams.set("token", token);
  }

  url.searchParams.set("error", error);
  return url;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = String(formData.get("token") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(
      formData.get("confirmPassword") || ""
    );

    if (
      !token ||
      !name ||
      password.length < 8 ||
      password !== confirmPassword
    ) {
      return NextResponse.redirect(
        registrationUrl(request, token, "password"),
        303
      );
    }

    let claim;

    try {
      claim = await verifyCustomerClaimToken(token);
    } catch {
      return NextResponse.redirect(
        registrationUrl(request, "", "invalid"),
        303
      );
    }

    const paidOrder = await prisma.order.findFirst({
      where: {
        paymentStatus: {
          equals: "Paid",
          mode: "insensitive",
        },
        OR: [
          {
            recipientEmail: {
              equals: claim.email,
              mode: "insensitive",
            },
          },
          {
            email: {
              equals: claim.email,
              mode: "insensitive",
            },
            isGift: false,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!paidOrder) {
      return NextResponse.redirect(
        registrationUrl(request, "", "invalid"),
        303
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: claim.email,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (
      !customerClaimMatchesCurrentCredentials(
        existingUser?.passwordHash,
        claim.credentialVersion
      )
    ) {
      return NextResponse.redirect(
        registrationUrl(request, token, "used"),
        303
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verifiedAt = new Date();

    const user = existingUser
      ? await prisma.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            name,
            passwordHash,
            emailVerifiedAt: verifiedAt,
          },
        })
      : await prisma.user.create({
          data: {
            name,
            email: claim.email,
            passwordHash,
            emailVerifiedAt: verifiedAt,
          },
        });

    await linkUserOwnershipByEmail(user.id, claim.email);
    await createSession(user.id);

    return NextResponse.redirect(new URL("/account", request.url), 303);
  } catch (error) {
    console.error("[Orbital One] Secure account activation failed.", error);
    return new NextResponse("Account activation failed.", { status: 500 });
  }
}
