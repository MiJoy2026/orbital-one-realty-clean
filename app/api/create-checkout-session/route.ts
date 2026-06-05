import Stripe from "stripe";
import { NextResponse } from "next/server";
import { sampleProperties } from "../../../lib/moon-data";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  const body = await request.json();
  const propertyId = body.propertyId;

  const property = sampleProperties.find((item) => item.id === propertyId);

  if (!property) {
    return NextResponse.json(
      { error: "Property not found" },
      { status: 404 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(property.price * 100),
          product_data: {
            name: `${property.id} - ${property.type}`,
            description: `${property.state} • ${property.size}`,
          },
        },
      },
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 199,
          product_data: {
            name: "Additional Name on Novelty Deed",
          },
        },
      },
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 499,
          product_data: {
            name: "Novelty Lunar Passport",
          },
        },
      },
    ],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cart?propertyId=${property.id}`,
    metadata: {
      propertyId: property.id,
      propertyType: property.type,
      state: property.state,
    },
  });

  return NextResponse.json({ url: session.url });
}