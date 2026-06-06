import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  const body = await request.json();
  const sessionId = body.sessionId;

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId" },
      { status: 400 }
    );
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const propertyId = session.metadata?.propertyId || "UNKNOWN";
  const propertyType = session.metadata?.propertyType || "Unknown";
  const lunarState = session.metadata?.state || "Unknown";
  const deedName = session.metadata?.deedName || "Deed Recipient";

  const certificateNumber = `OOR-2026-${propertyId}`;

  const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
  const paymentStatus = session.payment_status || "unknown";
  const email = session.customer_details?.email || null;

  const order = await prisma.order.upsert({
    where: {
      stripeSessionId: session.id,
    },
    update: {},
    create: {
      stripeSessionId: session.id,
      propertyId,
      propertyType,
      lunarState,
      deedName,
      certificateNumber,
      amountPaid,
      paymentStatus,
      email,
      premiumGoldSeal: true,
    },
  });

  return NextResponse.json({ order });
}