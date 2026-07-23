import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";
import Stripe from "stripe";
import { NextResponse } from "next/server";

import {
  MAX_CART_PROPERTIES,
  normalizeReservationIds,
} from "../../../lib/cart-reservations";
import {
  ADDITIONAL_DEED_NAME_PRICE,
  CHECKOUT_RESERVATION_MINUTES,
  getCanonicalPropertyPrice,
  isPurchasablePropertyType,
  type PurchasablePropertyType,
  MAX_ADDITIONAL_DEED_NAMES,
  PASSPORT_PRICE,
} from "../../../lib/purchase-constants";
import { prisma } from "../../../lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeAdditionalNames(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map(String)
        .map((name) => name.trim().slice(0, 60))
        .filter(Boolean)
    )
  ).slice(0, MAX_ADDITIONAL_DEED_NAMES);
}

function createCheckoutIdempotencyKey(value: object): string {
  const digest = createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex")
    .slice(0, 32);

  return `oor-cart-${digest}`;
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

async function detachExpiredCheckoutSession(
  stripe: Stripe,
  sessionId: string
): Promise<void> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.status === "complete") {
    return;
  }

  if (session.status === "open") {
    await stripe.checkout.sessions.expire(sessionId);
  }

  await prisma.propertyReservation.updateMany({
    where: {
      stripeCheckoutSessionId: sessionId,
      status: "Reserved",
    },
    data: {
      stripeCheckoutSessionId: null,
    },
  });
}

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Secure checkout is temporarily unavailable." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const reservationIds = normalizeReservationIds(
      Array.isArray(body.reservationIds)
        ? body.reservationIds
        : body.reservationId
    );
    const requestedPropertyIds = normalizeReservationIds(
      Array.isArray(body.propertyIds) ? body.propertyIds : body.propertyId
    ).map((propertyId) => propertyId.toUpperCase());
    const primaryDeedName = String(body.deedName || "").trim().slice(0, 120);
    const additionalDeedNames = normalizeAdditionalNames(
      body.additionalDeedNames
    );
    const passportSelected = Boolean(body.passportSelected);
    const isGift = Boolean(body.isGift);
    const recipientEmail = String(body.recipientEmail || "")
      .trim()
      .toLowerCase()
      .slice(0, 254);
    const giftMessage = String(body.giftMessage || "").trim().slice(0, 350);
    const noveltyAcknowledged = Boolean(body.noveltyAcknowledged);

    if (
      reservationIds.length === 0 ||
      reservationIds.length > MAX_CART_PROPERTIES
    ) {
      return NextResponse.json(
        { error: "A valid property cart is required." },
        { status: 400 }
      );
    }

    if (!primaryDeedName) {
      return NextResponse.json(
        { error: "Please enter the primary name for the deeds." },
        { status: 400 }
      );
    }

    if (!noveltyAcknowledged) {
      return NextResponse.json(
        {
          error:
            "Please confirm that these are novelty commemorative products.",
        },
        { status: 400 }
      );
    }

    if (isGift && !EMAIL_PATTERN.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid gift recipient email address." },
        { status: 400 }
      );
    }

    const reservations = await prisma.propertyReservation.findMany({
      where: {
        id: { in: reservationIds },
      },
    });
    const reservationById = new Map(
      reservations.map((reservation) => [reservation.id, reservation])
    );
    const orderedReservations = reservationIds.map((reservationId) =>
      reservationById.get(reservationId)
    );

    if (orderedReservations.some((reservation) => !reservation)) {
      return NextResponse.json(
        { error: "One or more cart reservations could not be verified." },
        { status: 404 }
      );
    }

    const verifiedReservations = orderedReservations.filter(
      (reservation): reservation is NonNullable<typeof reservation> =>
        Boolean(reservation)
    );
    const propertyIds = verifiedReservations.map(
      (reservation) => reservation.parcelKey
    );

    if (
      requestedPropertyIds.length > 0 &&
      (requestedPropertyIds.length !== propertyIds.length ||
        requestedPropertyIds.some(
          (propertyId, index) => propertyId !== propertyIds[index]
        ))
    ) {
      return NextResponse.json(
        { error: "The cart properties do not match their reservations." },
        { status: 409 }
      );
    }

    const properties = await prisma.property.findMany({
      where: {
        id: { in: propertyIds },
      },
    });
    const propertyById = new Map(
      properties.map((property) => [property.id, property])
    );
    const orderedProperties = propertyIds.map((propertyId) =>
      propertyById.get(propertyId)
    );

    if (orderedProperties.some((property) => !property)) {
      return NextResponse.json(
        { error: "One or more cart properties could not be found." },
        { status: 404 }
      );
    }

    const verifiedProperties = orderedProperties.filter(
      (property): property is NonNullable<typeof property> =>
        Boolean(property)
    );
    const now = new Date();

    for (let index = 0; index < verifiedReservations.length; index += 1) {
      const reservation = verifiedReservations[index];
      const property = verifiedProperties[index];

      if (reservation.parcelKey !== property.id) {
        return NextResponse.json(
          { error: `Reservation mismatch for ${property.id}.` },
          { status: 409 }
        );
      }

      if (
        reservation.status !== "Reserved" ||
        reservation.expiresAt <= now
      ) {
        return NextResponse.json(
          {
            error: `${property.id} is no longer reserved. Remove it from the cart and reserve it again.`,
          },
          { status: 409 }
        );
      }

      if (
        property.status === "Sold" ||
        !isPurchasablePropertyType(property.type)
      ) {
        return NextResponse.json(
          { error: `${property.id} is no longer available for checkout.` },
          { status: 409 }
        );
      }
    }

    const fullDeedName = [primaryDeedName, ...additionalDeedNames].join(", ");
    const idempotencyPayload = {
      reservationIds,
      fullDeedName,
      passportSelected,
      isGift,
      recipientEmail,
      giftMessage,
    };
    const checkoutFingerprint = createCheckoutIdempotencyKey(
      idempotencyPayload
    );

    const linkedSessionIds = Array.from(
      new Set(
        verifiedReservations
          .map((reservation) => reservation.stripeCheckoutSessionId)
          .filter((sessionId): sessionId is string => Boolean(sessionId))
      )
    );

    if (
      linkedSessionIds.length === 1 &&
      verifiedReservations.every(
        (reservation) =>
          reservation.stripeCheckoutSessionId === linkedSessionIds[0]
      )
    ) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        linkedSessionIds[0]
      );

      if (
        existingSession.status === "open" &&
        existingSession.url &&
        existingSession.metadata?.cartFingerprint === checkoutFingerprint
      ) {
        return NextResponse.json({ url: existingSession.url });
      }

      if (existingSession.status === "open") {
        await detachExpiredCheckoutSession(stripe, existingSession.id);
      }

      if (existingSession.status === "complete") {
        return NextResponse.json(
          {
            error:
              "Payment has already completed for this cart. Open the confirmation page or your account.",
          },
          { status: 409 }
        );
      }

      await prisma.propertyReservation.updateMany({
        where: {
          stripeCheckoutSessionId: linkedSessionIds[0],
          status: "Reserved",
        },
        data: {
          stripeCheckoutSessionId: null,
        },
      });
    } else if (linkedSessionIds.length > 0) {
      for (const sessionId of linkedSessionIds) {
        await detachExpiredCheckoutSession(stripe, sessionId);
      }
    }

    const checkoutExpiresAt = new Date(
      Date.now() + CHECKOUT_RESERVATION_MINUTES * 60 * 1000
    );
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      verifiedProperties.map((property) => {
        const canonicalPrice = getCanonicalPropertyPrice(
          property.type as PurchasablePropertyType
        );

        return {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(canonicalPrice * 100),
            product_data: {
              name: `${property.id} - ${property.type}`,
              description: [
                property.state,
                property.city,
                property.town,
                property.size,
              ]
                .filter(Boolean)
                .join(" • "),
            },
          },
        };
      });

    if (additionalDeedNames.length > 0) {
      lineItems.push({
        quantity: additionalDeedNames.length * verifiedProperties.length,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(ADDITIONAL_DEED_NAME_PRICE * 100),
          product_data: {
            name: "Additional Name on Property Deed",
          },
        },
      });
    }

    if (passportSelected) {
      lineItems.push({
        quantity: verifiedProperties.length,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(PASSPORT_PRICE * 100),
          product_data: {
            name: "Novelty Lunar Passport",
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "required",
        customer_creation: "always",
        expires_at: Math.floor(checkoutExpiresAt.getTime() / 1000),
        line_items: lineItems,
        success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/cart`,
        custom_text: {
          submit: {
            message:
              "Novelty commemorative products only; no legal lunar real-estate ownership is conveyed.",
          },
        },
        metadata: {
          propertyIds: JSON.stringify(propertyIds),
          reservationIds: JSON.stringify(reservationIds),
          itemCount: String(verifiedProperties.length),
          deedName: fullDeedName,
          additionalDeedNameCount: String(additionalDeedNames.length),
          isGift: String(isGift),
          passportSelected: String(passportSelected),
          recipientEmail: isGift ? recipientEmail : "",
          giftMessage: isGift ? giftMessage : "",
          noveltyAcknowledged: "true",
          cartFingerprint: checkoutFingerprint,
        },
      },
      {
        idempotencyKey: checkoutFingerprint,
      }
    );

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 503 }
      );
    }

    try {
      await prisma.$transaction(async (transaction) => {
        for (const propertyId of [...propertyIds].sort()) {
          await acquirePropertyLock(transaction, propertyId);
        }

        const currentReservations =
          await transaction.propertyReservation.findMany({
            where: {
              id: { in: reservationIds },
            },
          });
        const currentById = new Map(
          currentReservations.map((reservation) => [reservation.id, reservation])
        );

        for (const reservationId of reservationIds) {
          const reservation = currentById.get(reservationId);

          if (
            !reservation ||
            reservation.status !== "Reserved" ||
            reservation.expiresAt <= new Date() ||
            (reservation.stripeCheckoutSessionId &&
              reservation.stripeCheckoutSessionId !== session.id)
          ) {
            throw new Error(
              "A cart reservation changed while secure checkout was opening."
            );
          }
        }

        for (const property of verifiedProperties) {
          await transaction.property.update({
            where: { id: property.id },
            data: {
              price: getCanonicalPropertyPrice(
                property.type as PurchasablePropertyType
              ),
              status: "Reserved",
            },
          });
        }

        const binding = await transaction.propertyReservation.updateMany({
          where: {
            id: { in: reservationIds },
            status: "Reserved",
          },
          data: {
            expiresAt: checkoutExpiresAt,
            stripeCheckoutSessionId: session.id,
          },
        });

        if (binding.count !== reservationIds.length) {
          throw new Error("Not every cart reservation could be secured.");
        }
      });
    } catch (error) {
      try {
        if (session.status === "open") {
          await stripe.checkout.sessions.expire(session.id);
        }
      } catch (expirationError) {
        console.error(
          "[Orbital One] Unable to expire an unbound checkout session.",
          expirationError
        );
      }

      throw error;
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Orbital One] Unable to create Stripe checkout.", error);

    return NextResponse.json(
      { error: "Unable to start secure checkout right now." },
      { status: 503 }
    );
  }
}
