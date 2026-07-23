import Stripe from "stripe";
import { NextResponse } from "next/server";

import { fulfillStripeCheckoutSession } from "../../../lib/fulfillment-service";

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const sessionId = String(body.sessionId || "").trim();

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const fulfillment = await fulfillStripeCheckoutSession(session);

  return NextResponse.json(fulfillment);
}
