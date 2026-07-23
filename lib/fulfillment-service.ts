import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";
import Stripe from "stripe";

import {
  ADDITIONAL_DEED_NAME_PRICE,
  getCanonicalPropertyPrice,
  isPurchasablePropertyType,
  PASSPORT_PRICE,
} from "./purchase-constants";
import { prisma } from "./prisma";
import { sendOrderEmail } from "./send-order-email";

function createCertificateNumber(
  stripeSessionId: string,
  propertyId: string
): string {
  const digest = createHash("sha256")
    .update(`${stripeSessionId}:${propertyId}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();

  return `OOR-2026-${digest}`;
}

function createHoaNumber(certificateNumber: string): string {
  return `HOA-${certificateNumber.replace(/^OOR-/, "")}`;
}

function isTransactionRetryError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

function parseMetadataIds(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(parsed)) {
      return Array.from(
        new Set(parsed.map(String).map((item) => item.trim()).filter(Boolean))
      );
    }
  } catch {
    const single = value.trim();
    return single ? [single] : [];
  }

  return [];
}

async function acquirePropertyLock(
  transaction: Prisma.TransactionClient,
  propertyId: string
): Promise<void> {
  await transaction.$queryRaw<Array<{ lockAcquired: number }>>`
    WITH property_lock AS (
      SELECT pg_advisory_xact_lock(hashtext(${propertyId}))
    )
    SELECT 1 AS "lockAcquired"
    FROM property_lock
  `;
}

async function expireCompetingCheckoutSessions(
  sessionIds: string[]
): Promise<void> {
  const uniqueSessionIds = Array.from(new Set(sessionIds)).filter(Boolean);

  if (uniqueSessionIds.length === 0) {
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.error(
      "[Orbital One] Competing Checkout Sessions could not be expired because STRIPE_SECRET_KEY is missing."
    );
    return;
  }

  const stripe = new Stripe(stripeSecretKey);

  await Promise.all(
    uniqueSessionIds.map(async (sessionId) => {
      try {
        const checkoutSession =
          await stripe.checkout.sessions.retrieve(sessionId);

        if (checkoutSession.status === "open") {
          await stripe.checkout.sessions.expire(sessionId);
        }
      } catch (error) {
        console.error(
          `[Orbital One] Unable to expire competing Checkout Session ${sessionId}.`,
          error
        );
      }
    })
  );
}

export async function fulfillStripeCheckoutSession(
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== "paid") {
    throw new Error(
      `Stripe session ${session.id} is not paid (${session.payment_status}).`
    );
  }

  const metadataPropertyIds = parseMetadataIds(
    session.metadata?.propertyIds || session.metadata?.propertyId
  ).map((propertyId) => propertyId.toUpperCase());
  const metadataReservationIds = parseMetadataIds(
    session.metadata?.reservationIds || session.metadata?.reservationId
  );

  if (
    metadataPropertyIds.length === 0 ||
    metadataPropertyIds.length !== metadataReservationIds.length
  ) {
    throw new Error(
      "Missing or mismatched property and reservation IDs in Stripe metadata."
    );
  }

  const purchaserEmail = session.customer_details?.email?.trim().toLowerCase();
  const deedName = session.metadata?.deedName?.trim() || "Deed Recipient";
  const isGift = session.metadata?.isGift === "true";
  const passportPurchased = session.metadata?.passportSelected === "true";
  const recipientEmail = session.metadata?.recipientEmail?.trim().toLowerCase();
  const giftMessage = session.metadata?.giftMessage?.trim() || null;
  const memberEmail = isGift && recipientEmail ? recipientEmail : purchaserEmail;
  const additionalDeedNameCount = Math.max(
    0,
    Number.parseInt(session.metadata?.additionalDeedNameCount || "0", 10) || 0
  );

  if (!purchaserEmail || !memberEmail) {
    throw new Error("Missing purchaser or member email for fulfillment.");
  }

  const alreadyFulfilledOrders = await prisma.order.findMany({
    where: {
      stripeSessionId: session.id,
    },
  });

  if (
    alreadyFulfilledOrders.length === metadataPropertyIds.length &&
    metadataPropertyIds.every((propertyId) =>
      alreadyFulfilledOrders.some((order) => order.propertyId === propertyId)
    )
  ) {
    return {
      orders: alreadyFulfilledOrders,
      fulfilled: true,
      newlyCreated: false,
    };
  }

  type FulfillmentResult = {
    createdOrders: Array<{
      id: string;
      propertyId: string;
      propertyType: string;
      lunarState: string;
      deedName: string;
      certificateNumber: string;
      amountPaid: number;
      passportPurchased: boolean;
      recipientEmail: string | null;
      email: string | null;
    }>;
    allOrders: Array<{
      id: string;
      propertyId: string;
      propertyType: string;
      lunarState: string;
      deedName: string;
      certificateNumber: string;
      amountPaid: number;
      passportPurchased: boolean;
      recipientEmail: string | null;
      email: string | null;
    }>;
    properties: Array<{
      id: string;
      type: string;
      state: string;
      city: string | null;
      town: string | null;
      size: string;
    }>;
    competingCheckoutSessionIds: string[];
  };

  let fulfillmentResult: FulfillmentResult | undefined;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      fulfillmentResult = await prisma.$transaction(
        async (transaction) => {
          for (const propertyId of [...metadataPropertyIds].sort()) {
            await acquirePropertyLock(transaction, propertyId);
          }

          const [existingOrders, properties, reservations] = await Promise.all([
            transaction.order.findMany({
              where: { stripeSessionId: session.id },
            }),
            transaction.property.findMany({
              where: { id: { in: metadataPropertyIds } },
            }),
            transaction.propertyReservation.findMany({
              where: { id: { in: metadataReservationIds } },
            }),
          ]);
          const existingByProperty = new Map(
            existingOrders.map((order) => [order.propertyId, order])
          );
          const propertyById = new Map(
            properties.map((property) => [property.id, property])
          );
          const reservationById = new Map(
            reservations.map((reservation) => [reservation.id, reservation])
          );

          if (
            properties.length !== metadataPropertyIds.length ||
            reservations.length !== metadataReservationIds.length
          ) {
            throw new Error(
              "A property or reservation from this checkout could not be found."
            );
          }

          const [purchaserUser, memberUser] = await Promise.all([
            transaction.user.findUnique({
              where: { email: purchaserEmail },
              select: { id: true },
            }),
            transaction.user.findUnique({
              where: { email: memberEmail },
              select: { id: true },
            }),
          ]);
          const firstCertificate = createCertificateNumber(
            session.id,
            metadataPropertyIds[0]
          );

          await transaction.member.upsert({
            where: { email: memberEmail },
            update: {
              name: deedName,
              activatedAt: new Date(),
              ...(memberUser?.id ? { userId: memberUser.id } : {}),
            },
            create: {
              name: deedName,
              email: memberEmail,
              hoaNumber: createHoaNumber(firstCertificate),
              charterMember: true,
              activatedAt: new Date(),
              userId: memberUser?.id || null,
            },
          });

          const createdOrders: FulfillmentResult["createdOrders"] = [];
          const allOrders: FulfillmentResult["allOrders"] = [];
          const competingCheckoutSessionIds: string[] = [];

          for (let index = 0; index < metadataPropertyIds.length; index += 1) {
            const propertyId = metadataPropertyIds[index];
            const reservationId = metadataReservationIds[index];
            const property = propertyById.get(propertyId);
            const reservation = reservationById.get(reservationId);
            const existingOrder = existingByProperty.get(propertyId);

            if (!property || !reservation) {
              throw new Error(`Missing checkout item ${propertyId}.`);
            }

            if (reservation.parcelKey !== property.id) {
              throw new Error(
                `Reservation ${reservation.id} does not match ${property.id}.`
              );
            }

            if (
              reservation.stripeCheckoutSessionId &&
              reservation.stripeCheckoutSessionId !== session.id
            ) {
              throw new Error(
                `Stripe session ${session.id} is not bound to reservation ${reservation.id}.`
              );
            }

            if (existingOrder) {
              allOrders.push(existingOrder);
              continue;
            }

            if (reservation.status === "Cancelled") {
              throw new Error(
                `Reservation ${reservation.id} was cancelled before payment completed.`
              );
            }

            if (property.status === "Sold") {
              throw new Error(
                `Property ${property.id} was sold before this checkout completed.`
              );
            }

            if (!isPurchasablePropertyType(property.type)) {
              throw new Error(`Unsupported property type: ${property.type}`);
            }

            const competingReservations =
              await transaction.propertyReservation.findMany({
                where: {
                  parcelKey: property.id,
                  id: { not: reservation.id },
                  status: "Reserved",
                },
                select: {
                  id: true,
                  stripeCheckoutSessionId: true,
                },
              });

            if (competingReservations.length > 0) {
              await transaction.propertyReservation.updateMany({
                where: {
                  id: {
                    in: competingReservations.map((item) => item.id),
                  },
                  status: "Reserved",
                },
                data: { status: "Expired" },
              });
            }

            competingCheckoutSessionIds.push(
              ...competingReservations
                .map((item) => item.stripeCheckoutSessionId)
                .filter((sessionId): sessionId is string => Boolean(sessionId))
            );

            await transaction.property.update({
              where: { id: property.id },
              data: { status: "Sold" },
            });

            const certificateNumber = createCertificateNumber(
              session.id,
              property.id
            );
            const itemAmount =
              getCanonicalPropertyPrice(property.type) +
              additionalDeedNameCount * ADDITIONAL_DEED_NAME_PRICE +
              (passportPurchased ? PASSPORT_PRICE : 0);
            const order = await transaction.order.create({
              data: {
                stripeSessionId: session.id,
                propertyId: property.id,
                propertyType: property.type,
                acreagePurchased:
                  property.type === "Rural Acre" ? 1 : null,
                lunarState: property.state,
                deedName,
                certificateNumber,
                amountPaid: itemAmount,
                paymentStatus: "Paid",
                email: purchaserEmail,
                userId: purchaserUser?.id || memberUser?.id || null,
                passportPurchased,
                isGift,
                recipientEmail: isGift ? recipientEmail || null : null,
                giftMessage: isGift ? giftMessage : null,
                hoaClaimed: true,
              },
            });

            await transaction.propertyReservation.update({
              where: { id: reservation.id },
              data: {
                status: "Completed",
                stripeCheckoutSessionId: session.id,
              },
            });

            if (property.type === "Rural Acre") {
              const inventory = await transaction.stateInventory.upsert({
                where: { stateName: property.state },
                update: {},
                create: {
                  stateName: property.state,
                  totalAcres: 50000,
                  soldAcres: 0,
                },
              });
              const startingAcre = Math.floor(inventory.soldAcres) + 1;

              await transaction.stateInventory.update({
                where: { stateName: property.state },
                data: { soldAcres: { increment: 1 } },
              });

              await transaction.acreageAllocation.create({
                data: {
                  orderId: order.id,
                  certificateNumber,
                  stateName: property.state,
                  propertyId: property.id,
                  startingAcre,
                  endingAcre: startingAcre,
                  acresAssigned: 1,
                },
              });
            }

            createdOrders.push(order);
            allOrders.push(order);
          }

          return {
            createdOrders,
            allOrders,
            properties,
            competingCheckoutSessionIds,
          };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );

      break;
    } catch (error) {
      if (attempt < 2 && isTransactionRetryError(error)) {
        continue;
      }

      throw error;
    }
  }

  if (!fulfillmentResult) {
    throw new Error("Unable to complete order fulfillment.");
  }

  await expireCompetingCheckoutSessions(
    fulfillmentResult.competingCheckoutSessionIds.filter(
      (sessionId) => sessionId !== session.id
    )
  );

  if (fulfillmentResult.createdOrders.length > 0) {
    try {
      const propertyById = new Map(
        fulfillmentResult.properties.map((property) => [property.id, property])
      );

      await sendOrderEmail({
        to: Array.from(
          new Set(
            [purchaserEmail, memberEmail].filter(
              (email): email is string => Boolean(email)
            )
          )
        ),
        deedName,
        amountPaid: session.amount_total ? session.amount_total / 100 : 0,
        passportPurchased,
        giftMessage,
        items: fulfillmentResult.allOrders.map((order) => {
          const property = propertyById.get(order.propertyId);

          if (!property) {
            throw new Error(`Missing property ${order.propertyId} for email.`);
          }

          return {
            propertyId: order.propertyId,
            propertyType: order.propertyType,
            propertySize: property.size,
            lunarState: order.lunarState,
            cityName: property.city,
            townName: property.town,
            certificateNumber: order.certificateNumber,
          };
        }),
      });
    } catch (error) {
      console.error(
        "[Orbital One] Orders completed, but the confirmation email failed.",
        error
      );
    }
  }

  return {
    orders: fulfillmentResult.allOrders,
    fulfilled: true,
    newlyCreated: fulfillmentResult.createdOrders.length > 0,
  };
}
