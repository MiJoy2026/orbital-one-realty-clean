import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";
import Stripe from "stripe";

import {
  ADDITIONAL_DEED_NAME_PRICE_CENTS,
  calculateCanonicalPropertyPricing,
  chooseAcreageAllocationNumber,
  getCanonicalPropertyAcreage,
  getCanonicalPropertySize,
  isPurchasablePropertyType,
  MAX_ADDITIONAL_DEED_NAMES,
  PASSPORT_PRICE_CENTS,
  PRICING_VERSION,
} from "./purchase-constants";
import { ensureOwnedPropertySnapshotsForOrderIds } from "./owned-property-snapshot";
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
  const metadataExpectedTotalCents = Number.parseInt(
    session.metadata?.expectedTotalCents || "",
    10
  );

  const sessionPricingVersion = session.metadata?.pricingVersion?.trim();
  const usesCurrentPricingVersion = sessionPricingVersion === PRICING_VERSION;

  if (sessionPricingVersion && !usesCurrentPricingVersion) {
    throw new Error(
      `Stripe session ${session.id} uses an unsupported pricing version.`
    );
  }

  if (additionalDeedNameCount > MAX_ADDITIONAL_DEED_NAMES) {
    throw new Error("Stripe metadata contains too many additional deed names.");
  }

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
    try {
      await ensureOwnedPropertySnapshotsForOrderIds(
        alreadyFulfilledOrders.map((order) => order.id)
      );
    } catch (error) {
      console.error(
        "[Orbital One] Existing orders were found, but their property snapshots could not be verified.",
        error
      );
    }

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
      acreagePurchased: number | null;
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
      acreagePurchased: number | null;
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

          const orderedProperties = metadataPropertyIds.map((propertyId) =>
            propertyById.get(propertyId)
          );
          const orderedReservations = metadataReservationIds.map(
            (reservationId) => reservationById.get(reservationId)
          );

          if (
            orderedProperties.some((property) => !property) ||
            orderedReservations.some((reservation) => !reservation)
          ) {
            throw new Error("Unable to reconstruct the paid cart in order.");
          }

          for (let index = 0; index < metadataPropertyIds.length; index += 1) {
            const property = orderedProperties[index]!;
            const reservation = orderedReservations[index]!;

            if (!isPurchasablePropertyType(property.type)) {
              throw new Error(`Unsupported property type: ${property.type}`);
            }

            if (
              reservation.parcelKey !== property.id ||
              reservation.propertyType !== property.type
            ) {
              throw new Error(
                `Reservation ${reservation.id} does not match ${property.id}.`
              );
            }

            const canonicalAcreage = getCanonicalPropertyAcreage(property.type);
            const acreageMatches =
              canonicalAcreage === null
                ? reservation.acreage === null
                : reservation.acreage !== null &&
                  Math.abs(reservation.acreage - canonicalAcreage) < 0.000001;

            if (!acreageMatches) {
              throw new Error(
                `Reservation acreage does not match ${property.id}.`
              );
            }
          }

          const propertyPricing = calculateCanonicalPropertyPricing(
            orderedProperties.map((property) => ({
              propertyId: property!.id,
              propertyType: property!.type,
            }))
          );
          const propertyPricingById = new Map(
            propertyPricing.map((item) => [item.propertyId, item])
          );
          const propertySubtotalCents = propertyPricing.reduce(
            (total, item) => total + item.unitAmountCents,
            0
          );
          const expectedTotalCents =
            propertySubtotalCents +
            additionalDeedNameCount *
              metadataPropertyIds.length *
              ADDITIONAL_DEED_NAME_PRICE_CENTS +
            (passportPurchased
              ? metadataPropertyIds.length * PASSPORT_PRICE_CENTS
              : 0);

          const metadataTotalMatches = usesCurrentPricingVersion
            ? metadataExpectedTotalCents === expectedTotalCents
            : true;

          if (
            session.currency !== "usd" ||
            session.amount_total !== expectedTotalCents ||
            !metadataTotalMatches
          ) {
            throw new Error(
              `Stripe total integrity check failed for ${session.id}.`
            );
          }

          const memberUser = await transaction.user.findUnique({
            where: { email: memberEmail },
            select: {
              id: true,
              emailVerifiedAt: true,
            },
          });
          const verifiedMemberUserId = memberUser?.emailVerifiedAt
            ? memberUser.id
            : null;
          const firstCertificate = createCertificateNumber(
            session.id,
            metadataPropertyIds[0]
          );

          await transaction.member.upsert({
            where: { email: memberEmail },
            update: {
              name: deedName,
              activatedAt: new Date(),
              ...(verifiedMemberUserId ? { userId: verifiedMemberUserId } : {}),
            },
            create: {
              name: deedName,
              email: memberEmail,
              hoaNumber: createHoaNumber(firstCertificate),
              charterMember: true,
              activatedAt: new Date(),
              userId: verifiedMemberUserId,
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
            const pricing = propertyPricingById.get(propertyId);

            if (!property || !reservation || !pricing) {
              throw new Error(`Missing checkout item ${propertyId}.`);
            }

            if (
              reservation.parcelKey !== property.id ||
              reservation.propertyType !== property.type
            ) {
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
              data: {
                status: "Sold",
                price: pricing.price,
                size: pricing.size,
              },
            });

            const certificateNumber = createCertificateNumber(
              session.id,
              property.id
            );
            const itemAmountCents =
              pricing.unitAmountCents +
              additionalDeedNameCount * ADDITIONAL_DEED_NAME_PRICE_CENTS +
              (passportPurchased ? PASSPORT_PRICE_CENTS : 0);
            const itemAmount = itemAmountCents / 100;
            const acreagePurchased = getCanonicalPropertyAcreage(property.type);
            const order = await transaction.order.create({
              data: {
                stripeSessionId: session.id,
                propertyId: property.id,
                propertyType: property.type,
                acreagePurchased,
                lunarState: property.state,
                deedName,
                certificateNumber,
                amountPaid: itemAmount,
                paymentStatus: "Paid",
                email: purchaserEmail,
                userId: verifiedMemberUserId,
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

            if (acreagePurchased !== null) {
              await transaction.stateInventory.upsert({
                where: { stateName: property.state },
                update: {},
                create: {
                  stateName: property.state,
                  totalAcres: 50000,
                  soldAcres: 0,
                },
              });
              const latestAllocation =
                await transaction.acreageAllocation.findFirst({
                  where: { stateName: property.state },
                  orderBy: { endingAcre: "desc" },
                  select: { endingAcre: true },
                });
              const fractionalAllocations =
                Math.abs(acreagePurchased - 0.5) < 0.000001
                  ? await transaction.acreageAllocation.findMany({
                      where: {
                        stateName: property.state,
                        acresAssigned: { lt: 1 },
                      },
                      select: {
                        startingAcre: true,
                        endingAcre: true,
                        acresAssigned: true,
                      },
                      orderBy: { startingAcre: "asc" },
                    })
                  : [];
              const startingAcre = chooseAcreageAllocationNumber({
                latestEndingAcre: latestAllocation?.endingAcre,
                fractionalAllocations,
                acreagePurchased,
              });

              await transaction.stateInventory.update({
                where: { stateName: property.state },
                data: { soldAcres: { increment: acreagePurchased } },
              });

              await transaction.acreageAllocation.create({
                data: {
                  orderId: order.id,
                  certificateNumber,
                  stateName: property.state,
                  propertyId: property.id,
                  startingAcre,
                  endingAcre: startingAcre,
                  acresAssigned: acreagePurchased,
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

  const snapshotByPropertyId = new Map<string, string>();

  try {
    await ensureOwnedPropertySnapshotsForOrderIds(
      fulfillmentResult.allOrders.map((order) => order.id)
    );

    const snapshots = await prisma.ownedPropertySnapshot.findMany({
      where: {
        orderId: { in: fulfillmentResult.allOrders.map((order) => order.id) },
      },
      select: {
        id: true,
        propertyId: true,
      },
    });

    for (const snapshot of snapshots) {
      snapshotByPropertyId.set(snapshot.propertyId, snapshot.id);
    }
  } catch (error) {
    console.error(
      "[Orbital One] Orders completed, but one or more property images could not be prepared.",
      error
    );
  }

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
        accountEmail: memberEmail,
        amountPaid: fulfillmentResult.allOrders.reduce(
          (total, order) => total + order.amountPaid,
          0
        ),
        passportPurchased,
        giftMessage,
        items: fulfillmentResult.allOrders.map((order) => {
          const property = propertyById.get(order.propertyId);

          if (!property) {
            throw new Error(`Missing property ${order.propertyId} for email.`);
          }

          return {
            orderId: order.id,
            propertyId: order.propertyId,
            propertyType: order.propertyType,
            propertySize: isPurchasablePropertyType(order.propertyType)
              ? getCanonicalPropertySize(order.propertyType)
              : property.size,
            acreagePurchased: order.acreagePurchased,
            amountPaid: order.amountPaid,
            lunarState: order.lunarState,
            cityName: property.city,
            townName: property.town,
            certificateNumber: order.certificateNumber,
            propertySnapshotId:
              snapshotByPropertyId.get(order.propertyId) || null,
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
