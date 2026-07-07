import Stripe from "stripe";
import { prisma } from "./prisma";

function createCertificateNumber(propertyId: string) {
  const timestamp = Date.now();
  return `OOR-${propertyId}-${timestamp}`;
}

function createHoaNumber() {
  const timestamp = Date.now();
  return `HOA-${timestamp}`;
}

export async function fulfillStripeCheckoutSession(
  session: Stripe.Checkout.Session
) {
  const propertyId = session.metadata?.propertyId;

  if (!propertyId) {
    throw new Error("Missing propertyId in Stripe session metadata.");
  }

  const property = await prisma.property.findUnique({
  where: {
    id: propertyId,
  },
});

if (!property) {
  throw new Error(`Property not found: ${propertyId}`);
}

  const purchaserEmail = session.customer_details?.email || null;
  const deedName = session.metadata?.deedName || "Deed Recipient";
  const acres = Number(session.metadata?.acres || "1");
  const isGift = session.metadata?.isGift === "true";
  const passportPurchased = session.metadata?.passportSelected === "true";
  const recipientEmail = session.metadata?.recipientEmail || null;
  const giftMessage = session.metadata?.giftMessage || null;
  const reservationId = session.metadata?.reservationId || null;

  const memberEmail = isGift && recipientEmail ? recipientEmail : purchaserEmail;

  if (!memberEmail) {
    throw new Error("Missing member email for fulfillment.");
  }

  const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

  const certificateNumber = createCertificateNumber(propertyId);

  const member = await prisma.member.upsert({
    where: {
      email: memberEmail,
    },
    update: {
      name: deedName,
    },
    create: {
      name: deedName,
      email: memberEmail,
      hoaNumber: createHoaNumber(),
      charterMember: true,
    },
  });

  await prisma.property.upsert({
    where: { id: propertyId },
    update: {
      status: "Sold",
    },
    create: {
      id: propertyId,
      state: property.state,
      type: property.type,
      size: property.size,
      price: property.price,
      status: "Sold",
    },
  });

  await prisma.order.upsert({
    where: {
      stripeSessionId: session.id,
    },
    update: {
      paymentStatus: "Paid",
    },
    create: {
      stripeSessionId: session.id,
      propertyId,
      propertyType: property.type,
      acreagePurchased: property.type === "Rural Acre" ? acres : null,
      lunarState: property.state,
      deedName,
      certificateNumber,
      amountPaid,
      paymentStatus: "Paid",
      email: purchaserEmail,
      passportPurchased,
      isGift,
      recipientEmail,
      giftMessage,
      hoaClaimed: false,
    },
  });

      if (reservationId) {
  await prisma.propertyReservation.update({
    where: {
      id: reservationId,
    },
    data: {
      status: "Completed",
    },
  });
}

  return {
    propertyId,
    memberId: member.id,
    fulfilled: true,
  };
}