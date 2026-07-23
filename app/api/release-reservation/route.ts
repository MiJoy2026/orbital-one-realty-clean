import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

import { removeCartReservation } from "../../../lib/cart-reservations";
import { prisma } from "../../../lib/prisma";

class ReservationReleaseError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

async function expireLinkedCheckoutSession(sessionId: string): Promise<void> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new ReservationReleaseError(
      "Secure checkout is temporarily unavailable. Please try again.",
      503
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  let checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

  if (checkoutSession.status === "complete") {
    throw new ReservationReleaseError(
      "Payment has already completed for this reservation.",
      409
    );
  }

  if (checkoutSession.status === "open") {
    try {
      checkoutSession = await stripe.checkout.sessions.expire(sessionId);
    } catch (error) {
      const latestSession = await stripe.checkout.sessions.retrieve(sessionId);

      if (latestSession.status === "complete") {
        throw new ReservationReleaseError(
          "Payment has already completed for this reservation.",
          409
        );
      }

      throw error;
    }
  }

  if (checkoutSession.status === "complete") {
    throw new ReservationReleaseError(
      "Payment has already completed for this reservation.",
      409
    );
  }

  /*
   * One Stripe session may contain several cart reservations. Once that
   * session is expired, detach it from every still-active reservation so the
   * remaining properties can be checked out again in a fresh cart session.
   */
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const reservationId = String(body.reservationId || "").trim();

    if (!reservationId) {
      return NextResponse.json(
        { error: "Reservation ID is required." },
        { status: 400 }
      );
    }

    const reservation = await prisma.propertyReservation.findUnique({
      where: {
        id: reservationId,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found." },
        { status: 404 }
      );
    }

    if (reservation.status !== "Reserved") {
      return NextResponse.json(
        { error: "This reservation is no longer active." },
        { status: 409 }
      );
    }

    if (reservation.stripeCheckoutSessionId) {
      await expireLinkedCheckoutSession(
        reservation.stripeCheckoutSessionId
      );
    }

    const result = await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw<Array<{ lockAcquired: number }>>`
        WITH reservation_lock AS (
          SELECT pg_advisory_xact_lock(
            hashtext(${reservation.parcelKey})
          )
        )
        SELECT 1 AS "lockAcquired"
        FROM reservation_lock
      `;

      const currentReservation =
        await transaction.propertyReservation.findUnique({
          where: {
            id: reservation.id,
          },
        });

      if (!currentReservation) {
        throw new ReservationReleaseError(
          "Reservation not found.",
          404
        );
      }

      if (currentReservation.status !== "Reserved") {
        throw new ReservationReleaseError(
          "This reservation is no longer active.",
          409
        );
      }

      await transaction.propertyReservation.update({
        where: {
          id: currentReservation.id,
        },
        data: {
          status: "Cancelled",
          stripeCheckoutSessionId: null,
        },
      });

      const anotherActiveReservation =
        await transaction.propertyReservation.findFirst({
          where: {
            parcelKey: currentReservation.parcelKey,
            id: {
              not: currentReservation.id,
            },
            status: "Reserved",
            expiresAt: {
              gt: new Date(),
            },
          },
          select: {
            id: true,
          },
        });

      if (!anotherActiveReservation) {
        await transaction.property.updateMany({
          where: {
            id: currentReservation.parcelKey,
            status: "Reserved",
          },
          data: {
            status: "Available",
          },
        });
      }

      return currentReservation;
    });

    const response = NextResponse.json({
      success: true,
      parcelKey: result.parcelKey,
    });
    removeCartReservation(request, response, reservationId);
    return response;
  } catch (error) {
    if (error instanceof ReservationReleaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("[Orbital One] Unable to release reservation.", error);

    return NextResponse.json(
      { error: "Unable to release this reservation right now." },
      { status: 503 }
    );
  }
}
