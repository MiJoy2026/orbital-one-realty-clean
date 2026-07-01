import { fulfillStripeCheckoutSession } from "../../../lib/fulfillment-service";
import { prisma } from "../../../lib/prisma";
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
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
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error(error);
    return new NextResponse("Invalid Stripe webhook signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
  const session = event.data.object as Stripe.Checkout.Session;

  await fulfillStripeCheckoutSession(session);
}

  return NextResponse.json({ received: true });
}