import { NextResponse } from "next/server";

import { consumeAccountAccessLimit } from "../../../lib/account-access-throttle";
import { prisma } from "../../../lib/prisma";
import { sendCustomerAccessEmail } from "../../../lib/send-customer-access-email";

const EMAIL_PATTERN = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

export async function POST(request: Request) {
  const redirectUrl = new URL("/account-access", request.url);

  try {
    const formData = await request.formData();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase()
      .slice(0, 254);

    if (!EMAIL_PATTERN.test(email)) {
      redirectUrl.searchParams.set("sent", "1");
      return NextResponse.redirect(redirectUrl, 303);
    }

    const requestAllowed = await consumeAccountAccessLimit(
      request,
      email
    );

    if (!requestAllowed) {
      redirectUrl.searchParams.set("sent", "1");
      return NextResponse.redirect(redirectUrl, 303);
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
              equals: email,
              mode: "insensitive",
            },
          },
          {
            email: {
              equals: email,
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

    if (paidOrder) {
      await sendCustomerAccessEmail(email, "30m");
    }

    redirectUrl.searchParams.set("sent", "1");
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error(
      "[Orbital One] Customer account access email failed.",
      error
    );
    redirectUrl.searchParams.set("error", "service");
    return NextResponse.redirect(redirectUrl, 303);
  }
}
