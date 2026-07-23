import Stripe from "stripe";
import { NextResponse } from "next/server";

import { fulfillStripeCheckoutSession } from "../../../lib/fulfillment-service";

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    console.error(
      "[Orbital One] Stripe webhook environment variables are not configured."
    );

    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("[Orbital One] Invalid Stripe webhook signature.", error);

    return new NextResponse("Invalid Stripe webhook signature", {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillStripeCheckoutSession(session);
    } catch (error) {
      console.error("[Orbital One] Stripe fulfillment failed.", error);

      return NextResponse.json(
        { error: "Fulfillment failed; Stripe should retry this webhook." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
