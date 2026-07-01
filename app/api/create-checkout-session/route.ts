import { prisma } from "../../../lib/prisma";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { sampleProperties } from "../../../lib/moon-data";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  const body = await request.json();
  const propertyId = body.propertyId;
  const deedName = body.deedName || "Deed Recipient";
  const acres = Number(body.acres || 1);
  const passportSelected = Boolean(body.passportSelected);
  const isGift = Boolean(body.isGift);
  
  const property = sampleProperties.find((item) => item.id === propertyId);

  if (!property) {
    return NextResponse.json(
      { error: "Property not found" },
      { status: 404 }
    );
  }
   const propertyPrice =
  property.type === "Rural Acre"
    ? acres === 0.5
      ? 16.95
      : 24.95 + Math.max(acres - 1, 0) * 7.95
    : property.price;

   const propertySize =
  property.type === "Rural Acre"
    ? `${acres} Acre${acres === 1 ? "" : "s"}`
    : property.size;
   const dbProperty = await prisma.property.findUnique({
  where: {
    id: property.id,
  },
});

if (dbProperty?.status === "Sold") {
  return NextResponse.json(
    { error: "This property has already been sold." },
    { status: 409 }
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
      unit_amount: Math.round(propertyPrice * 100),
      product_data: {
        name: `${property.id} - ${property.type}`,
        description: `${property.state} • ${propertySize}`,
      },
    },
  },

  ...(passportSelected
    ? [
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
      ]
    : []),
],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cart?propertyId=${property.id}`,
    metadata: {
  propertyId: property.id,
  propertyType: property.type,
  state: property.state,
  deedName,
  acres: String(acres),
  isGift: String(isGift),
  passportSelected: String(passportSelected),
},
  });

  return NextResponse.json({ url: session.url });
}